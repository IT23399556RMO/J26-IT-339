import type { Request, Response } from "express";
import pool from "../services/db.js";
import type {
  ApiResponse,
  UserPreference,
  UpsertPreferenceInput,
  EvaluateSuitabilityInput,
  InferencePayload,
  SuitabilityPredictionResult,
  DashboardMetricsPayload,
  DiurnalSlotPayload,
  EvaluatedSuitabilityResponse,
  AlternativeDestinationPayload,
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
/**
 * Orchestration controller for Component 1:
 * 1. Fetches a 12-hour block (06:00 to 18:00) from Open-Meteo for the requested date.
 * 2. Queries PostgreSQL user preferences.
 * 3. Sends the 12-hour block as a batch JSON array to Python FastAPI /api/predict/suitability.
 * 4. Calculates the "Best Window" (consecutive 2-hour block with highest average score).
 * 5. Applies rule-based safety threshold checking on the target hour's raw data (UV > 8, PM2.5 > 35, Temp > 35).
 * 6. Returns consolidated response: current_score, current_class, metrics (heat, rain, visibility, uv, wind, aqi), best_window, alerts.
 *
 * Route: POST /api/preferences/evaluate
 * Access: Private (Requires Bearer JWT)
 */
export async function evaluateSuitability(
  req: Request<object, ApiResponse<EvaluatedSuitabilityResponse>, EvaluateSuitabilityInput>,
  res: Response<ApiResponse<EvaluatedSuitabilityResponse>>,
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

    // Determine target date and requested target hour
    let targetDateStr: string;
    let requestedHour = 10; // Default to 10:00 AM

    if (targetDateTime && typeof targetDateTime === "string") {
      const parts = targetDateTime.includes("T")
        ? targetDateTime.split("T")
        : targetDateTime.split(" ");
      targetDateStr = parts[0] ?? new Date().toISOString().slice(0, 10);
      if (parts[1]) {
        const parsedH = parseInt(parts[1].slice(0, 2), 10);
        if (!isNaN(parsedH)) requestedHour = parsedH;
      }
    } else if (req.body?.date && typeof req.body.date === "string") {
      targetDateStr = req.body.date;
      if (req.body.time && typeof req.body.time === "string") {
        const parsedH = parseInt(req.body.time.slice(0, 2), 10);
        if (!isNaN(parsedH)) requestedHour = parsedH;
      }
    } else {
      targetDateStr = new Date().toISOString().slice(0, 10);
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

    // 3. Parallel calls to Open-Meteo Forecast and Air Quality APIs (14-day hourly coverage)
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&forecast_days=14&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m,shortwave_radiation`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&forecast_days=7&hourly=pm10,pm2_5`;

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

    // 4. Construct the 12-hour diurnal block (06:00 to 18:00, hours 6 through 17)
    const daylightHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    const batchPayload: InferencePayload[] = [];
    const hourlyWeatherData: Array<{
      hour: number;
      timeStr: string;
      temp: number;
      apparentTemp: number;
      humidity: number;
      precip: number;
      cloudCover: number;
      windSpeed: number;
      radiation: number;
      pm10: number;
      pm25: number;
    }> = [];

    for (const h of daylightHours) {
      const timePrefix = `${targetDateStr}T${String(h).padStart(2, "0")}`;
      let fIndex = Array.isArray(forecastData?.hourly?.time)
        ? forecastData.hourly.time.findIndex(
            (t: string) => typeof t === "string" && t.startsWith(timePrefix),
          )
        : -1;

      if (fIndex < 0 && Array.isArray(forecastData?.hourly?.time)) {
        fIndex = Math.min(forecastData.hourly.time.length - 1, Math.max(0, h));
      }

      let aIndex = Array.isArray(airQualityData?.hourly?.time)
        ? airQualityData.hourly.time.findIndex(
            (t: string) => typeof t === "string" && t.startsWith(timePrefix),
          )
        : -1;

      if (aIndex < 0 && Array.isArray(airQualityData?.hourly?.time)) {
        aIndex = Math.min(airQualityData.hourly.time.length - 1, Math.max(0, h));
      }

      const temp = Number(forecastData?.hourly?.temperature_2m?.[fIndex] ?? 28.0);
      const humidity = Number(forecastData?.hourly?.relative_humidity_2m?.[fIndex] ?? 65.0);
      const apparentTemp = Number(forecastData?.hourly?.apparent_temperature?.[fIndex] ?? 30.0);
      const precip = Number(forecastData?.hourly?.precipitation?.[fIndex] ?? 0.0);
      const cloudCover = Number(forecastData?.hourly?.cloud_cover?.[fIndex] ?? 20.0);
      const windSpeed = Number(forecastData?.hourly?.wind_speed_10m?.[fIndex] ?? 12.0);
      const radiation = Number(
        forecastData?.hourly?.shortwave_radiation?.[fIndex] ?? (h >= 10 && h <= 14 ? 650.0 : 300.0),
      );
      const pm10Val = Number(airQualityData?.hourly?.pm10?.[aIndex] ?? 25.0);
      const pm25Val = Number(airQualityData?.hourly?.pm2_5?.[aIndex] ?? 14.0);

      hourlyWeatherData.push({
        hour: h,
        timeStr: `${String(h).padStart(2, "0")}:00`,
        temp,
        apparentTemp,
        humidity,
        precip,
        cloudCover,
        windSpeed,
        radiation,
        pm10: pm10Val,
        pm25: pm25Val,
      });

      batchPayload.push({
        temperature_2m: temp,
        relative_humidity_2m: humidity,
        apparent_temperature: apparentTemp,
        precipitation: precip,
        cloud_cover: cloudCover,
        wind_speed_10m: windSpeed,
        shortwave_radiation: radiation,
        pm10: pm10Val,
        pm2_5: pm25Val,
        thermal_tolerance: Math.round(Number(thermalTolerance)),
        rain_tolerance: Math.round(Number(rainTolerance)),
        uv_sensitivity: Math.round(Number(uvSensitivity)),
        wind_preference: Math.round(Number(windPreference)),
      });
    }

    // 5. Send 12-hour block as batch JSON array to Python FastAPI microservice
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
        body: JSON.stringify(batchPayload),
        signal: AbortSignal.timeout(6000),
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

    const predictionData = await mlRes.json();
    let scores: number[] = [];
    let classes: string[] = [];

    if (Array.isArray(predictionData)) {
      scores = predictionData.map((p: any) => Number(p.suitability_score));
      classes = predictionData.map((p: any) => String(p.suitability_class));
    } else if (predictionData && typeof predictionData === "object") {
      scores = [Number(predictionData.suitability_score)];
      classes = [String(predictionData.suitability_class)];
    }

    // Pad to 12 if fewer scores returned
    while (scores.length < 12) {
      scores.push(scores[scores.length - 1] ?? 80);
      classes.push(classes[classes.length - 1] ?? "Excellent");
    }

    // 6. Calculate Best Window (consecutive 2-hour block with highest average score)
    let maxAvgScore = -1;
    let bestStartHour = 8; // Default to 08:00 AM

    for (let i = 0; i <= scores.length - 2; i++) {
      const s1 = scores[i] ?? 80;
      const s2 = scores[i + 1] ?? 80;
      const avg = (s1 + s2) / 2;
      if (avg > maxAvgScore) {
        maxAvgScore = avg;
        bestStartHour = 6 + i;
      }
    }
    const bestEndHour = bestStartHour + 2;
    const bestWindow = `${String(bestStartHour).padStart(2, "0")}:00 - ${String(bestEndHour).padStart(2, "0")}:00`;

    // 7. Extract the target hour data for current score, metrics, and safety alerts
    const targetHourIdx =
      requestedHour >= 6 && requestedHour <= 17 ? requestedHour - 6 : 4; // Default to 10:00 AM (idx 4)
    const targetRaw = hourlyWeatherData[targetHourIdx] ?? hourlyWeatherData[0]!;
    const currentScore = Math.round(scores[targetHourIdx] ?? 80);
    const currentClass = classes[targetHourIdx] ?? "Excellent";

    // Asynchronously insert record into search_history and enforce FIFO cleanup
    (async () => {
      try {
        let destName = req.body?.destination_name || req.body?.destinationName;
        let actCategory = req.body?.activity_category || req.body?.activityCategory;

        if (!destName) {
          const knownDestinations = [
            { name: "Sigiriya", lat: 7.957, lon: 80.7603, cat: "Heritage" },
            { name: "Kandy", lat: 7.2906, lon: 80.6337, cat: "Heritage" },
            { name: "Nuwara Eliya", lat: 6.9497, lon: 80.7839, cat: "Hill Country" },
            { name: "Matale", lat: 7.4723, lon: 80.6234, cat: "Heritage" },
            { name: "Dambulla", lat: 7.85, lon: 80.65, cat: "Heritage" },
            { name: "Horton Plains", lat: 6.8031, lon: 80.7979, cat: "Hill Country" },
            { name: "Knuckles", lat: 7.4007, lon: 80.8106, cat: "Adventure" },
            { name: "Adams Peak", lat: 6.8093, lon: 80.4992, cat: "Adventure" },
            { name: "Pidurangala", lat: 7.9656, lon: 80.7618, cat: "Adventure" },
            { name: "Peradeniya", lat: 7.2718, lon: 80.597, cat: "Heritage" },
            { name: "Yala National Park", lat: 6.367, lon: 81.517, cat: "Wildlife" },
            { name: "Temple of the Tooth", lat: 7.2936, lon: 80.6413, cat: "Heritage" },
            { name: "Colombo", lat: 6.9271, lon: 79.8612, cat: "Urban Exploration" },
          ];
          const match = knownDestinations.find(
            (d) => Math.abs(d.lat - lat) < 0.05 && Math.abs(d.lon - lon) < 0.05,
          );
          if (match) {
            destName = match.name;
            if (!actCategory) actCategory = match.cat;
          } else {
            destName = `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
          }
        }

        if (!actCategory) {
          actCategory = "General Sightseeing";
        }

        const MAX_HISTORY_LIMIT = 10;
        await pool.query(
          `INSERT INTO search_history (
             user_id,
             destination_name,
             activity_category,
             target_date,
             suitability_score,
             is_saved
           )
           VALUES ($1, $2, $3, $4, $5, false);`,
          [userId, destName, actCategory, targetDateStr, currentScore],
        );

        // FIFO cleanup query: keep at most MAX_HISTORY_LIMIT unsaved records per user
        await pool.query(
          `DELETE FROM search_history
           WHERE user_id = $1
             AND is_saved = false
             AND id NOT IN (
               SELECT id FROM search_history
               WHERE user_id = $1 AND is_saved = false
               ORDER BY created_at DESC
               LIMIT $2
             );`,
          [userId, MAX_HISTORY_LIMIT],
        );
      } catch (histErr) {
        console.error("Failed to record search history / FIFO cleanup:", histErr);
      }
    })();

    // Convert solar radiation to UV Index approximation
    const uvIndex = Math.max(
      0,
      Math.min(13, Math.round(targetRaw.radiation / 85)),
    );

    // 8. Rule-based safety threshold checker on the target hour's raw data
    const alerts: string[] = [];
    if (uvIndex > 8) {
      alerts.push("Extreme UV detected: Apply SPF 50+ sunscreen.");
    }
    if (targetRaw.pm25 > 35) {
      alerts.push("Poor Air Quality: Consider a mask for outdoor exertion.");
    }
    if (targetRaw.temp > 35) {
      alerts.push("Extreme Heat: Hydration mandatory.");
    }
    if (targetRaw.precip >= 2.0) {
      alerts.push("Precipitation detected: Rock stairs and open trails may be slippery.");
    }

    // 9. Build 2x3 metrics object (Heat, Rain, Visibility, UV, Wind, AQI)
    let heatStatus = "Pleasant";
    let heatColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (targetRaw.temp >= 35) {
      heatStatus = "Extreme Heat";
      heatColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (targetRaw.temp >= 30) {
      heatStatus = "Warm";
      heatColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (targetRaw.temp < 18) {
      heatStatus = "Cool";
      heatColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
    }

    let rainStatus = "Dry / Clear";
    let rainColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    if (targetRaw.precip >= 5.0) {
      rainStatus = "Heavy Rain";
      rainColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (targetRaw.precip > 0.5) {
      rainStatus = "Rain Showers";
      rainColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (targetRaw.precip > 0.0) {
      rainStatus = "Light Drizzle";
      rainColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
    }

    const visibilityKm = Math.max(
      2,
      Math.min(16, Math.round(16 - targetRaw.cloudCover * 0.06 - targetRaw.pm25 * 0.08)),
    );
    let visStatus = "Excellent";
    let visColor = "text-teal-400 bg-teal-500/10 border-teal-500/20";
    if (visibilityKm < 5) {
      visStatus = "Hazy / Low";
      visColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (visibilityKm < 10) {
      visStatus = "Moderate";
      visColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }

    let uvStatus = "Low Risk";
    let uvColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (uvIndex >= 9) {
      uvStatus = "Extreme Alert";
      uvColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (uvIndex >= 6) {
      uvStatus = "High Alert";
      uvColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (uvIndex >= 3) {
      uvStatus = "Moderate";
      uvColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    }

    let windStatus = "Gentle Breeze";
    let windColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
    if (targetRaw.windSpeed >= 30) {
      windStatus = "Strong Gusts";
      windColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (targetRaw.windSpeed >= 18) {
      windStatus = "Moderate Breeze";
      windColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
    } else if (targetRaw.windSpeed < 6) {
      windStatus = "Calm";
      windColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }

    const aqi = Math.round(
      targetRaw.pm25 <= 12
        ? (targetRaw.pm25 / 12) * 50
        : targetRaw.pm25 <= 35.4
        ? 50 + ((targetRaw.pm25 - 12) / 23.4) * 50
        : 100 + ((targetRaw.pm25 - 35.4) / 20) * 50,
    );
    let aqiStatus = "Good";
    let aqiColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (aqi > 150) {
      aqiStatus = "Unhealthy";
      aqiColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (aqi > 100) {
      aqiStatus = "Sensitive Alert";
      aqiColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (aqi > 50) {
      aqiStatus = "Moderate";
      aqiColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    }

    const metrics: DashboardMetricsPayload = {
      heat: {
        id: "heat",
        title: "Heat / Temp",
        value: `${targetRaw.temp.toFixed(1)}°C`,
        status: heatStatus,
        statusColor: heatColor,
        detail: `Feels like ${targetRaw.apparentTemp.toFixed(1)}°C • Humidity ${Math.round(targetRaw.humidity)}%`,
        icon: "🌡️",
      },
      rain: {
        id: "rain",
        title: "Precipitation",
        value: `${targetRaw.precip.toFixed(1)} mm`,
        status: rainStatus,
        statusColor: rainColor,
        detail:
          targetRaw.precip > 0
            ? `${targetRaw.precip.toFixed(1)} mm precipitation expected`
            : "0% probability in this window",
        icon: "🌧️",
      },
      visibility: {
        id: "visibility",
        title: "Visibility",
        value: `${visibilityKm} km`,
        status: visStatus,
        statusColor: visColor,
        detail: `Cloud cover: ${Math.round(targetRaw.cloudCover)}% • Open vista`,
        icon: "👁️",
      },
      uv: {
        id: "uv",
        title: "UV Index",
        value: `${uvIndex}`,
        status: uvStatus,
        statusColor: uvColor,
        detail:
          uvIndex >= 6
            ? "Intense solar radiation • SPF recommended"
            : "Low to moderate solar exposure",
        icon: "☀️",
      },
      wind: {
        id: "wind",
        title: "Wind Speed",
        value: `${targetRaw.windSpeed.toFixed(1)} km/h`,
        status: windStatus,
        statusColor: windColor,
        detail:
          targetRaw.windSpeed >= 20
            ? "Elevated wind shear • Take care on ridges"
            : "Steady gentle airflow across terrain",
        icon: "🍃",
      },
      aqi: {
        id: "aqi",
        title: "Air Quality (AQI)",
        value: `${aqi}`,
        status: aqiStatus,
        statusColor: aqiColor,
        detail: `PM2.5: ${targetRaw.pm25.toFixed(1)} µg/m³ • PM10: ${targetRaw.pm10.toFixed(1)} µg/m³`,
        icon: "🫁",
      },
    };

    // 10. Construct 6 standard 2-hour diurnal display cards (06-08, 08-10, 10-12, 12-14, 14-16, 16-18)
    const diurnalSlotsConfig = [
      { start: 6, end: 8, label: "Early Morning", time: "06:00 - 08:00 AM" },
      { start: 8, end: 10, label: "Optimal Morning", time: "08:00 - 10:00 AM" },
      { start: 10, end: 12, label: "Late Morning", time: "10:00 - 12:00 PM" },
      { start: 12, end: 14, label: "Midday Peak", time: "12:00 - 02:00 PM" },
      { start: 14, end: 16, label: "Afternoon", time: "02:00 - 04:00 PM" },
      { start: 16, end: 18, label: "Late Afternoon", time: "04:00 - 06:00 PM" },
    ];

    const diurnalWindows: DiurnalSlotPayload[] = diurnalSlotsConfig.map((slot) => {
      const idx1 = slot.start - 6;
      const idx2 = slot.end - 6 - 1;
      const s1 = scores[idx1] ?? 80;
      const s2 = scores[idx2] ?? 80;
      const slotScore = Math.round((s1 + s2) / 2);
      const w1 = hourlyWeatherData[idx1] ?? hourlyWeatherData[0]!;
      const w2 = hourlyWeatherData[idx2] ?? hourlyWeatherData[0]!;
      const avgTemp = Math.round((w1.temp + w2.temp) / 2);
      const avgUv = Math.max(0, Math.min(12, Math.round((w1.radiation + w2.radiation) / 170)));

      let cond = "Ideal Comfort";
      if (w1.precip > 0.5 || w2.precip > 0.5) cond = "Rain Showers";
      else if (avgUv >= 8) cond = "Peak Solar Heat";
      else if (avgTemp < 22) cond = "Cool & Crisp";
      else if (avgTemp > 31) cond = "Warm Breeze";

      const isBest =
        slot.start === bestStartHour ||
        (bestStartHour >= slot.start && bestStartHour < slot.end);

      return {
        time: slot.time,
        label: slot.label,
        score: slotScore,
        temp: `${avgTemp}°C`,
        uv: avgUv,
        condition: cond,
        isBest,
      };
    });

    // 11. Compute fallback alternative destinations
    const fallbackOptions = computeFallbackAlternatives(lat, lon);

    // 12. Return consolidated JSON response matching system specification
    res.status(200).json({
      success: true,
      message: "Environmental suitability evaluated successfully.",
      current_score: currentScore,
      current_class: currentClass,
      best_window: bestWindow,
      metrics,
      alerts,
      diurnal_windows: diurnalWindows,
      suitability_score: currentScore, // for backward compatibility
      suitability_class: currentClass, // for backward compatibility
      fallback_options: fallbackOptions,
      data: {
        current_score: currentScore,
        current_class: currentClass,
        best_window: bestWindow,
        metrics,
        alerts,
        diurnal_windows: diurnalWindows,
        suitability_score: currentScore,
        suitability_class: currentClass,
        features_used: batchPayload[targetHourIdx] ?? batchPayload[0]!,
        hourly_scores: scores,
        fallback_options: fallbackOptions,
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

/** Sample candidates across climatic zones in Sri Lanka */
const SAMPLE_CANDIDATES = [
  {
    id: "kandy",
    name: "Kandy",
    latitude: 7.2906,
    longitude: 80.6337,
    region: "Central Province",
    icon: "🛕",
    climateZone: "Wet Highland",
    description: "Sacred Buddhist shrine in the Royal Palace complex, nestled in misty tropical hills.",
    activityCategory: "Heritage",
    baseScore: 84,
  },
  {
    id: "nuwara_eliya",
    name: "Nuwara Eliya",
    latitude: 6.9497,
    longitude: 80.7839,
    region: "Central Province",
    icon: "⛰️",
    climateZone: "Montane Zone",
    description: "High-altitude tea country known for its cool, temperate climate and colonial architecture.",
    activityCategory: "Hill Country",
    baseScore: 88,
  },
  {
    id: "matale",
    name: "Matale",
    latitude: 7.4723,
    longitude: 80.6234,
    region: "Central Province",
    icon: "🌿",
    climateZone: "Wet Zone",
    description: "Agricultural hub famous for spice gardens and historical temples.",
    activityCategory: "Heritage",
    baseScore: 76,
  },
  {
    id: "sigiriya",
    name: "Sigiriya",
    latitude: 7.9569,
    longitude: 80.7597,
    region: "Central Province",
    icon: "🏰",
    climateZone: "Dry Zone",
    description: "Ancient 5th-century palace citadel rising 200m above the jungle plains.",
    activityCategory: "Heritage",
    baseScore: 82,
  },
  {
    id: "dambulla",
    name: "Dambulla",
    latitude: 7.85,
    longitude: 80.65,
    region: "Central Province",
    icon: "🗿",
    climateZone: "Dry Zone",
    description: "Extensive cave temple complex containing ancient Buddhist murals and statues.",
    activityCategory: "Heritage",
    baseScore: 80,
  },
  {
    id: "horton_plains",
    name: "Horton Plains",
    latitude: 6.8031,
    longitude: 80.7979,
    region: "Central Province",
    icon: "🦌",
    climateZone: "Montane Zone",
    description: "Protected national park featuring cloud forests and the World's End precipice.",
    activityCategory: "Hill Country",
    baseScore: 86,
  },
  {
    id: "knuckles",
    name: "Knuckles",
    latitude: 7.4007,
    longitude: 80.8106,
    region: "Central Province",
    icon: "🥾",
    climateZone: "Wet Highland",
    description: "Rugged mountain range offering challenging trekking and diverse biodiversity.",
    activityCategory: "Adventure",
    baseScore: 78,
  },
  {
    id: "adams_peak",
    name: "Adams Peak",
    latitude: 6.8093,
    longitude: 80.4992,
    region: "Sabaragamuwa Province",
    icon: "🌄",
    climateZone: "Montane Zone",
    description: "Sacred mountain renowned for its challenging nocturnal pilgrimage climb.",
    activityCategory: "Adventure",
    baseScore: 74,
  },
  {
    id: "pidurangala",
    name: "Pidurangala",
    latitude: 7.9656,
    longitude: 80.7618,
    region: "Central Province",
    icon: "🧗",
    climateZone: "Dry Zone",
    description: "Steep rock formation offering panoramic views of the adjacent Sigiriya rock.",
    activityCategory: "Adventure",
    baseScore: 81,
  },
  {
    id: "peradeniya",
    name: "Peradeniya",
    latitude: 7.2718,
    longitude: 80.597,
    region: "Central Province",
    icon: "🌸",
    climateZone: "Wet Highland",
    description: "Historical botanical gardens featuring massive palm avenues and orchid houses.",
    activityCategory: "Heritage",
    baseScore: 85,
  },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Computes up to 5 alternative travel destinations sorted by suitability score and proximity.
 */
export function computeFallbackAlternatives(lat: number, lon: number): AlternativeDestinationPayload[] {
  return SAMPLE_CANDIDATES
    .map((dest) => {
      const distanceKm = calculateDistanceKm(lat, lon, dest.latitude, dest.longitude);
      const score = dest.baseScore;
      let suitabilityClass = "Good";
      if (score >= 80) suitabilityClass = "Excellent";
      else if (score >= 60) suitabilityClass = "Good";
      else if (score >= 40) suitabilityClass = "Moderate";
      else suitabilityClass = "Poor";

      return {
        id: dest.id,
        name: dest.name,
        latitude: dest.latitude,
        longitude: dest.longitude,
        activityCategory: dest.activityCategory,
        icon: dest.icon,
        distanceKm,
        score,
        suitabilityClass,
        climateZone: dest.climateZone,
        description: dest.description,
      };
    })
    .filter((d) => d.distanceKm > 4) // Exclude current target destination
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm)
    .slice(0, 5);
}

/**
 * Endpoint to retrieve up to 5 alternative travel destinations.
 *
 * Route: GET /api/preferences/alternatives
 * Access: Private (Requires Bearer JWT)
 */
export async function getAlternatives(
  req: Request,
  res: Response<ApiResponse<AlternativeDestinationPayload[]>>,
): Promise<void> {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : 7.957;
    const lon = req.query.lon ? Number(req.query.lon) : 80.7603;

    const alternatives = computeFallbackAlternatives(lat, lon);

    res.status(200).json({
      success: true,
      message: "Alternative destinations retrieved successfully.",
      data: alternatives,
    });
  } catch (error) {
    console.error("Error in getAlternatives:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve alternative destinations.",
    });
  }
}
