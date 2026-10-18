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

// Request body for evaluating environmental suitability.
export interface EvaluateSuitabilityInput {
  latitude?: number | string;
  longitude?: number | string;
  targetDateTime?: string;
  date?: string;
  time?: string;
}

// The strict 13-feature JSON payload required by the Python FastAPI inference engine.
export interface InferencePayload {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  cloud_cover: number;
  wind_speed_10m: number;
  shortwave_radiation: number;
  pm10: number;
  pm2_5: number;
  thermal_tolerance: number;
  rain_tolerance: number;
  uv_sensitivity: number;
  wind_preference: number;
}

/**
 * Response structure returned by the Python FastAPI inference service.
 */
export interface SuitabilityPredictionResult {
  status: string;
  suitability_score: number;
  suitability_class: "Excellent" | "Good" | "Moderate" | "Poor" | string;
  features_used?: InferencePayload;
}

export interface MetricItemDetail {
  id: string;
  title: string;
  value: string;
  status: string;
  statusColor: string;
  detail: string;
  icon: string;
}

export interface DashboardMetricsPayload {
  heat: MetricItemDetail;
  rain: MetricItemDetail;
  visibility: MetricItemDetail;
  uv: MetricItemDetail;
  wind: MetricItemDetail;
  aqi: MetricItemDetail;
}

export interface DiurnalSlotPayload {
  time: string;
  label: string;
  score: number;
  temp: string;
  uv: number;
  condition: string;
  isBest?: boolean;
}

export interface EvaluatedSuitabilityResponse {
  current_score: number;
  current_class: string;
  best_window: string;
  metrics: DashboardMetricsPayload;
  alerts: string[];
  diurnal_windows: DiurnalSlotPayload[];
  suitability_score: number;
  suitability_class: string;
  features_used?: InferencePayload;
  hourly_scores?: number[];
}
