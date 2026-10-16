import type { Request, Response } from "express";
import pool from "../services/db.js";
import type {
  ApiResponse,
  UserPreference,
  UpsertPreferenceInput,
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

