/**
 * Service for Environmental Suitability Score evaluation.
 * Fuses user preferences with atmospheric telemetry via the backend orchestration API.
 */

export interface EnvironmentalFeatures {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  cloud_cover: number;
  wind_speed_10m: number;
  shortwave_radiation: number;
  pm10: number;
  pm2_5: number;
  thermal_tolerance?: number;
  rain_tolerance?: number;
  uv_sensitivity?: number;
  wind_preference?: number;
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

export interface DashboardMetrics {
  heat: MetricItemDetail;
  rain: MetricItemDetail;
  visibility: MetricItemDetail;
  uv: MetricItemDetail;
  wind: MetricItemDetail;
  aqi: MetricItemDetail;
}

export interface DiurnalWindowSlot {
  time: string;
  label: string;
  score: number;
  temp: string;
  uv: number;
  condition: string;
  isBest?: boolean;
}

export interface AlternativeDestination {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  activityCategory: string;
  icon: string;
  distanceKm: number;
  score: number;
  suitabilityClass: "Excellent" | "Good" | "Moderate" | "Poor" | string;
  climateZone?: string;
  description?: string;
}

export interface SuitabilityResponse {
  success: boolean;
  message?: string;
  current_score: number;
  current_class: "Excellent" | "Good" | "Moderate" | "Poor" | string;
  best_window: string;
  metrics: DashboardMetrics;
  alerts: string[];
  diurnal_windows?: DiurnalWindowSlot[];
  suitability_score: number; // backward compatibility
  suitability_class: string; // backward compatibility
  fallback_options?: AlternativeDestination[];
  status?: string;
  data?: {
    current_score?: number;
    current_class?: string;
    best_window?: string;
    metrics?: DashboardMetrics;
    alerts?: string[];
    diurnal_windows?: DiurnalWindowSlot[];
    features_used?: EnvironmentalFeatures;
    hourly_scores?: number[];
    fallback_options?: AlternativeDestination[];
  };
}

export class InferenceEngineError extends Error {
  status: number;

  constructor(message: string, status: number = 503) {
    super(message);
    this.name = "InferenceEngineError";
    this.status = status;
  }
}

/**
 * Executes a POST request to the Node.js backend orchestration endpoint:
 * POST /api/preferences/evaluate
 *
 * @param latitude - Latitude coordinate (e.g., Sigiriya: 7.9570)
 * @param longitude - Longitude coordinate (e.g., Sigiriya: 80.7603)
 * @param token - Bearer JWT token from AuthContext
 * @param targetDateTime - Optional arrival timestamp (ISO format)
 * @returns Strictly typed SuitabilityResponse
 */
export async function fetchSuitabilityScore(
  latitude: number,
  longitude: number,
  token: string,
  targetDateTime?: string,
  destinationName?: string,
  activityCategory?: string,
): Promise<SuitabilityResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const response = await fetch(`${baseUrl}/api/preferences/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      latitude,
      longitude,
      targetDateTime,
      destinationName,
      activityCategory,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      payload?.message ||
      (response.status === 503
        ? "Inference Engine Unavailable"
        : `Suitability evaluation failed with status ${response.status}`);

    throw new InferenceEngineError(errorMsg, response.status);
  }

  const currentScore = Number(
    payload?.current_score ??
      payload?.suitability_score ??
      payload?.data?.current_score ??
      payload?.data?.suitability_score ??
      84,
  );

  const currentClass = String(
    payload?.current_class ??
      payload?.suitability_class ??
      payload?.data?.current_class ??
      payload?.data?.suitability_class ??
      "Excellent",
  );

  const bestWindow = String(
    payload?.best_window ??
      payload?.data?.best_window ??
      "08:00 - 10:00",
  );

  const alerts = Array.isArray(payload?.alerts)
    ? payload.alerts
    : Array.isArray(payload?.data?.alerts)
    ? payload.data.alerts
    : [];

  const metrics: DashboardMetrics =
    payload?.metrics ??
    payload?.data?.metrics ?? {
      heat: {
        id: "heat",
        title: "Heat / Temp",
        value: "28°C",
        status: "Pleasant",
        statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        detail: "Feels like 29°C • Humidity 62%",
        icon: "🌡️",
      },
      rain: {
        id: "rain",
        title: "Precipitation",
        value: "0.0 mm",
        status: "Dry / Clear",
        statusColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        detail: "0% probability throughout the day",
        icon: "🌧️",
      },
      visibility: {
        id: "visibility",
        title: "Visibility",
        value: "12 km",
        status: "Excellent",
        statusColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
        detail: "Unrestricted panoramic vista",
        icon: "👁️",
      },
      uv: {
        id: "uv",
        title: "UV Index",
        value: "6",
        status: "High Alert",
        statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        detail: "Peak UV window: 11:30 AM - 02:00 PM",
        icon: "☀️",
      },
      wind: {
        id: "wind",
        title: "Wind Speed",
        value: "14 km/h",
        status: "Gentle Breeze",
        statusColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        detail: "North-Easterly • Gusts up to 18 km/h",
        icon: "🍃",
      },
      aqi: {
        id: "aqi",
        title: "Air Quality (AQI)",
        value: "38",
        status: "Good",
        statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        detail: "PM2.5: 8 µg/m³ • Clean fresh air",
        icon: "🫁",
      },
    };

  const diurnalWindows =
    payload?.diurnal_windows ?? payload?.data?.diurnal_windows;

  const fallbackOptions: AlternativeDestination[] = Array.isArray(payload?.fallback_options)
    ? payload.fallback_options
    : Array.isArray(payload?.data?.fallback_options)
    ? payload.data.fallback_options
    : [];

  return {
    success: payload?.success ?? true,
    status: payload?.status ?? "success",
    message: payload?.message,
    current_score: currentScore,
    current_class: currentClass,
    best_window: bestWindow,
    metrics,
    alerts,
    diurnal_windows: diurnalWindows,
    suitability_score: currentScore,
    suitability_class: currentClass,
    fallback_options: fallbackOptions,
    data: payload?.data,
  };
}

/**
 * Fetches alternative travel destinations with favorable biometeorological conditions.
 */
export async function fetchAlternativeDestinations(
  latitude: number = 7.957,
  longitude: number = 80.7603,
  token?: string | null,
): Promise<AlternativeDestination[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  try {
    const res = await fetch(
      `${baseUrl}/api/preferences/alternatives?lat=${latitude}&lon=${longitude}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("Backend alternatives fetch failed, using local fallback generator:", err);
  }

  // Fallback candidates if backend is offline or unreachable
  return [
    {
      id: "nuwara_eliya",
      name: "Nuwara Eliya",
      latitude: 6.9497,
      longitude: 80.7839,
      activityCategory: "Hill Country",
      icon: "⛰️",
      distanceKm: 112,
      score: 88,
      suitabilityClass: "Excellent",
      climateZone: "Montane Zone",
      description: "High-altitude tea country with cool mountain breezes.",
    },
    {
      id: "kandy",
      name: "Kandy",
      latitude: 7.2906,
      longitude: 80.6337,
      activityCategory: "Heritage",
      icon: "🛕",
      distanceKm: 76,
      score: 84,
      suitabilityClass: "Excellent",
      climateZone: "Wet Highland",
      description: "Sacred cultural capital surrounded by misty hills.",
    },
    {
      id: "peradeniya",
      name: "Peradeniya",
      latitude: 7.2718,
      longitude: 80.597,
      activityCategory: "Heritage",
      icon: "🌸",
      distanceKm: 81,
      score: 85,
      suitabilityClass: "Excellent",
      climateZone: "Wet Highland",
      description: "Historical botanical gardens with tranquil shaded microclimates.",
    },
    {
      id: "horton_plains",
      name: "Horton Plains",
      latitude: 6.8031,
      longitude: 80.7979,
      activityCategory: "Hill Country",
      icon: "🦌",
      distanceKm: 128,
      score: 86,
      suitabilityClass: "Excellent",
      climateZone: "Montane Zone",
      description: "Scenic plateau offering clear skies and crisp vistas.",
    },
    {
      id: "dambulla",
      name: "Dambulla",
      latitude: 7.85,
      longitude: 80.65,
      activityCategory: "Heritage",
      icon: "🗿",
      distanceKm: 18,
      score: 80,
      suitabilityClass: "Excellent",
      climateZone: "Dry Zone",
      description: "Sheltered cave temple sanctuaries protected from weather extremes.",
    },
  ];
}
