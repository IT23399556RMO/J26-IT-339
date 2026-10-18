import type { Request, Response } from "express";
import pool from "../services/db.js";
import type {
  ApiResponse,
  UserPreference,
  UpsertPreferenceInput,
  EvaluateSuitabilityInput,
  InferencePayload,
  SuitabilityPredictionResult,
} from "../types/index.js";

/** Helper to sanitize and clamp range slider metrics between 0 and 100 */
function parseClampedInt(val: unknown, fallback: number = 50): number {
  const parsed = typeof val === "number" ? val : parseInt(String(val), 10);
  if (isNaN(parsed)) return fallback;
  return Math.max(0, Math.min(100, parsed));
}

/**
 * Upsert user biometeorological preferences.
 * Overwrites existing record if user_id already exists.
 *
 * Route: POST /api/preferences
 * Access: Private (Requires Bearer JWT)
 */
export async function upsertPreferences(
  req: Request<object, ApiResponse<UserPreference>, UpsertPreferenceInput>,
  res: Response<ApiResponse<UserPreference>>,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User identification missing from token.",
      });
      return;
    }

    const body = req.body ?? {};

    // Extract metrics supporting both snake_case and camelCase formats
    const thermalTolerance = parseClampedInt(
      body.thermal_tolerance ?? body.thermalTolerance,
      50,
    );
    const rainTolerance = parseClampedInt(
      body.rain_tolerance ?? body.rainTolerance,
      50,
    );
    const uvSensitivity = parseClampedInt(
      body.uv_sensitivity ?? body.uvSensitivity,
      50,
    );
    const windPreference = parseClampedInt(
      body.wind_preference ?? body.windPreference,
      50,
    );

    // Exertion capacity validation ('Low' | 'Moderate' | 'High')
    const rawExertion =
      body.exertion_capacity ?? body.exertionCapacity ?? "Moderate";
    const validExertionLevels = ["Low", "Moderate", "High"];
    const exertionCapacity = validExertionLevels.includes(String(rawExertion))
      ? String(rawExertion)
      : "Moderate";

    // Upsert query: insert on conflict update existing preferences
    const query = `
      INSERT INTO user_preferences (
        user_id,
        thermal_tolerance,
        rain_tolerance,
        uv_sensitivity,
        wind_preference,
        exertion_capacity,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        thermal_tolerance = EXCLUDED.thermal_tolerance,
        rain_tolerance = EXCLUDED.rain_tolerance,
        uv_sensitivity = EXCLUDED.uv_sensitivity,
        wind_preference = EXCLUDED.wind_preference,
        exertion_capacity = EXCLUDED.exertion_capacity,
        updated_at = NOW()
      RETURNING
        user_id,
        thermal_tolerance,
        rain_tolerance,
        uv_sensitivity,
        wind_preference,
        exertion_capacity,
        created_at,
        updated_at;
    `;

    const values = [
      userId,
      thermalTolerance,
      rainTolerance,
      uvSensitivity,
      windPreference,
      exertionCapacity,
    ];

    const result = await pool.query<UserPreference>(query, values);
    const savedPreferences = result.rows[0];

    if (!savedPreferences) {
      res.status(500).json({
        success: false,
        message: "Failed to persist preferences.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Environmental preferences saved successfully.",
      data: savedPreferences,
    });
  } catch (error) {
    console.error("Error in upsertPreferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while saving preferences.",
    });
  }
}

/**
 * Retrieve the authenticated user's current preference vector.
 *
 * Route: GET /api/preferences
 * Access: Private (Requires Bearer JWT)
 */
export async function getPreferences(
  req: Request,
  res: Response<ApiResponse<UserPreference | null>>,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User identification missing from token.",
      });
      return;
    }

    const query = `
      SELECT
        user_id,
        thermal_tolerance,
        rain_tolerance,
        uv_sensitivity,
        wind_preference,
        exertion_capacity,
        created_at,
        updated_at
      FROM user_preferences
      WHERE user_id = $1;
    `;

    const result = await pool.query<UserPreference>(query, [userId]);
    const userPreferences = result.rows[0];

    if (!userPreferences) {
      // User hasn't calibrated yet; return null data with 200 status
      res.status(200).json({
        success: true,
        message: "No custom preferences saved yet.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User preferences retrieved successfully.",
      data: userPreferences,
    });
  } catch (error) {
    console.error("Error in getPreferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving preferences.",
    });
  }
}

/**
 * Orchestrates environmental suitability inference:
 * 1. Queries calibrated user preferences from PostgreSQL.
 * 2. Fetches real-time atmospheric & air quality telemetry from Open-Meteo.
 * 3. Builds the strict 13-feature inference payload.
 * 4. Calls the Python FastAPI inference engine at http://127.0.0.1:8000/api/predict/suitability.
 * 5. Returns the 0-100 score and categorical class to the Next.js client.
 *
 * Route: POST /api/preferences/evaluate
 * Access: Private (Requires Bearer JWT)
 */
export async function evaluateSuitability(
  req: Request<object, ApiResponse<SuitabilityPredictionResult>, EvaluateSuitabilityInput>,
  res: Response<ApiResponse<SuitabilityPredictionResult>>,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User identification missing from token.",
      });
      return;
    }

    // 1. Extract latitude & longitude with fallback to Colombo, Sri Lanka
    const lat =
      req.body?.latitude !== undefined && req.body.latitude !== null
        ? Number(req.body.latitude)
        : 6.9271;
    const lon =
      req.body?.longitude !== undefined && req.body.longitude !== null
        ? Number(req.body.longitude)
        : 79.8612;

    const targetDateTime =
      req.body?.targetDateTime ||
      (req.body?.date && req.body?.time
        ? `${req.body.date}T${req.body.time}`
        : null);

    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({
        success: false,
        message: "Invalid coordinates: latitude and longitude must be valid numbers.",
      });
      return;
    }

    // 2. Query user preferences from PostgreSQL
    const prefQuery = `
      SELECT
        thermal_tolerance,
        rain_tolerance,
        uv_sensitivity,
        wind_preference
      FROM user_preferences
      WHERE user_id = $1;
    `;
    const prefResult = await pool.query<UserPreference>(prefQuery, [userId]);
    const userPrefs = prefResult.rows[0];

    // Default to neutral 50 if user has not completed calibration yet
    const thermalTolerance = userPrefs?.thermal_tolerance ?? 50;
    const rainTolerance = userPrefs?.rain_tolerance ?? 50;
    const uvSensitivity = userPrefs?.uv_sensitivity ?? 50;
    const windPreference = userPrefs?.wind_preference ?? 50;

    // 3. Parallel calls to Open-Meteo Weather and Air Quality APIs (requesting 14-day hourly coverage)
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&forecast_days=14&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m,shortwave_radiation&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m,shortwave_radiation`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&forecast_days=7&current=pm10,pm2_5&hourly=pm10,pm2_5`;

    let forecastData: any;
    let airQualityData: any;

    try {
      const [forecastRes, airQualityRes] = await Promise.all([
        fetch(forecastUrl, { signal: AbortSignal.timeout(8000) }),
        fetch(airQualityUrl, { signal: AbortSignal.timeout(8000) }),
      ]);

      if (!forecastRes.ok) {
        throw new Error(
          `Open-Meteo Forecast API responded with status ${forecastRes.status}`,
        );
      }
      if (!airQualityRes.ok) {
        throw new Error(
          `Open-Meteo Air Quality API responded with status ${airQualityRes.status}`,
        );
      }

      forecastData = await forecastRes.json();
      airQualityData = await airQualityRes.json();
    } catch (apiErr: unknown) {
      const errMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);
      console.error("Open-Meteo Telemetry Fetch Failure:", errMsg);
      res.status(502).json({
        success: false,
        message: "Failed to retrieve real-time atmospheric data from Open-Meteo.",
        error: errMsg,
      });
      return;
    }

    // Determine matching hourly index if targetDateTime is specified
    let targetHourIndex = -1;
    if (targetDateTime && Array.isArray(forecastData?.hourly?.time)) {
      const timePrefix = targetDateTime.includes("T")
        ? targetDateTime.slice(0, 13)
        : targetDateTime.replace(" ", "T").slice(0, 13);

      targetHourIndex = forecastData.hourly.time.findIndex(
        (t: string) => typeof t === "string" && t.startsWith(timePrefix),
      );
    }

    const useHourly = targetHourIndex >= 0;

    // 4. Construct exact 13-feature JSON payload matching the Python data contract
    const inferencePayload: InferencePayload = {
      temperature_2m: Number(
        useHourly
          ? forecastData.hourly.temperature_2m[targetHourIndex]
          : forecastData?.current?.temperature_2m ??
              forecastData?.hourly?.temperature_2m?.[0] ??
              25.0,
      ),
      relative_humidity_2m: Number(
        useHourly
          ? forecastData.hourly.relative_humidity_2m[targetHourIndex]
          : forecastData?.current?.relative_humidity_2m ??
              forecastData?.hourly?.relative_humidity_2m?.[0] ??
              70.0,
      ),
      apparent_temperature: Number(
        useHourly
          ? forecastData.hourly.apparent_temperature[targetHourIndex]
          : forecastData?.current?.apparent_temperature ??
              forecastData?.hourly?.apparent_temperature?.[0] ??
              26.0,
      ),
      precipitation: Number(
        useHourly
          ? forecastData.hourly.precipitation[targetHourIndex]
          : forecastData?.current?.precipitation ??
              forecastData?.hourly?.precipitation?.[0] ??
              0.0,
      ),
      cloud_cover: Number(
        useHourly
          ? forecastData.hourly.cloud_cover[targetHourIndex]
          : forecastData?.current?.cloud_cover ??
              forecastData?.hourly?.cloud_cover?.[0] ??
              20.0,
      ),
      wind_speed_10m: Number(
        useHourly
          ? forecastData.hourly.wind_speed_10m[targetHourIndex]
          : forecastData?.current?.wind_speed_10m ??
              forecastData?.hourly?.wind_speed_10m?.[0] ??
              10.0,
      ),
      shortwave_radiation: Number(
        useHourly
          ? forecastData.hourly.shortwave_radiation[targetHourIndex]
          : forecastData?.current?.shortwave_radiation ??
              forecastData?.hourly?.shortwave_radiation?.[0] ??
              200.0,
      ),
      pm10: Number(
        useHourly && Array.isArray(airQualityData?.hourly?.pm10)
          ? airQualityData.hourly.pm10[targetHourIndex] ??
              airQualityData?.current?.pm10 ??
              20.0
          : airQualityData?.current?.pm10 ??
              airQualityData?.hourly?.pm10?.[0] ??
              20.0,
      ),
      pm2_5: Number(
        useHourly && Array.isArray(airQualityData?.hourly?.pm2_5)
          ? airQualityData.hourly.pm2_5[targetHourIndex] ??
              airQualityData?.current?.pm2_5 ??
              15.0
          : airQualityData?.current?.pm2_5 ??
              airQualityData?.hourly?.pm2_5?.[0] ??
              15.0,
      ),
      thermal_tolerance: Math.round(Number(thermalTolerance)),
      rain_tolerance: Math.round(Number(rainTolerance)),
      uv_sensitivity: Math.round(Number(uvSensitivity)),
      wind_preference: Math.round(Number(windPreference)),
    };

    // 5. POST payload to Python FastAPI service at http://127.0.0.1:8080/api/predict/suitability
    const mlBase = process.env.ML_SERVICE_URL ?? "http://127.0.0.1:8080";
    const mlEndpoint = mlBase.endsWith("/api/predict/suitability")
      ? mlBase
      : `${mlBase.replace(/\/$/, "")}/api/predict/suitability`;

    let mlRes: globalThis.Response;
    try {
      mlRes = await fetch(mlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inferencePayload),
        signal: AbortSignal.timeout(5000),
      });
    } catch (connectionErr: unknown) {
      const errMsg =
        connectionErr instanceof Error
          ? connectionErr.message
          : String(connectionErr);
      console.error("Python Inference Engine connection failed:", errMsg);
      res.status(503).json({
        success: false,
        message: "Inference Engine Unavailable",
        error: errMsg,
      });
      return;
    }

    if (!mlRes.ok) {
      const errText = await mlRes.text().catch(() => "");
      console.error(`Python ML engine error ${mlRes.status}:`, errText);
      res.status(503).json({
        success: false,
        message: "Inference Engine Unavailable",
        error: errText || `Python service returned status ${mlRes.status}`,
      });
      return;
    }

    const predictionData = (await mlRes.json()) as SuitabilityPredictionResult;

    // Return the Python service's response to the Next.js client with HTTP 200
    res.status(200).json({
      success: true,
      message: "Environmental suitability evaluated successfully.",
      status: predictionData.status,
      suitability_score: predictionData.suitability_score,
      suitability_class: predictionData.suitability_class,
      data: {
        ...predictionData,
        features_used: inferencePayload,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Error in evaluateSuitability:", errorMsg);
    res.status(500).json({
      success: false,
      message: "Internal server error during environmental suitability evaluation.",
      error: errorMsg,
    });
  }
}
