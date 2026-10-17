/**
 * Service for Environmental Suitability Score evaluation.
 * Fuses user preferences with atmospheric telemetry via the backend orchestration API.
 */

export interface SuitabilityResponse {
  status: string;
  suitability_score: number;
  suitability_class: "Excellent" | "Good" | "Moderate" | "Poor" | string;
  data?: {
    status?: string;
    suitability_score?: number;
    suitability_class?: string;
    features_used?: Record<string, number>;
  };
  message?: string;
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
 * @returns Strictly typed SuitabilityResponse
 */
export async function fetchSuitabilityScore(
  latitude: number,
  longitude: number,
  token: string,
  targetDateTime?: string,
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

  // Handle both flat response and data-envelope format
  const score =
    payload?.suitability_score ??
    payload?.data?.suitability_score ??
    0;

  const suitabilityClass =
    payload?.suitability_class ??
    payload?.data?.suitability_class ??
    "Moderate";

  return {
    status: payload?.status ?? payload?.data?.status ?? "success",
    suitability_score: Number(score),
    suitability_class: String(suitabilityClass),
    data: payload?.data,
    message: payload?.message,
  };
}

