/**
 * Represents the database row in the `user_preferences` table.
 */
export interface UserPreference {
  user_id: string;
  thermal_tolerance: number;
  rain_tolerance: number;
  uv_sensitivity: number;
  wind_preference: number;
  exertion_capacity: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Payload expected when upserting environmental preferences.
 * Supports both snake_case (matching DB schema) and camelCase (frontend convention).
 */
export interface UpsertPreferenceInput {
  thermal_tolerance?: number | string;
  rain_tolerance?: number | string;
  uv_sensitivity?: number | string;
  wind_preference?: number | string;
  exertion_capacity?: string;

  // camelCase fallbacks
  thermalTolerance?: number | string;
  rainTolerance?: number | string;
  uvSensitivity?: number | string;
  windPreference?: number | string;
  exertionCapacity?: string;
}

