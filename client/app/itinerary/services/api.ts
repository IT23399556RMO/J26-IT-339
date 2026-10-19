import { TouristProfile, ItineraryStop, DQNResolution, DayPlanMetrics } from "../types";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000/api/v1";

export interface ModelStatusResponse {
  success: boolean;
  modelStatus: string;
  metrics: {
    model_name: string;
    project_id: string;
    test_mae: number;
    target_mae: number;
    is_target_met: boolean;
    cv_mae: number;
    test_rmse: number;
    test_r2: number;
    baseline_mae: number;
    training_samples: number;
    test_samples: number;
    hyperparameters?: Record<string, any>;
  };
  reinforcementLearning: {
    algorithm: string;
    environment: string;
    constraintViolationRate: string;
    replanLatency: string;
    evaluationStatus: string;
  };
}

export interface BenchmarkItem {
  method: string;
  satisfactionScore: string;
  constraintViolationRate: string;
  dynamicReplanLatency: string;
  status: string;
}

// Check FastAPI connectivity
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/health", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Fetch ML Model Status
export async function fetchModelStatus(): Promise<ModelStatusResponse | null> {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/models/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Could not reach FastAPI models endpoint, using cached state.", err);
    return null;
  }
}

// Fetch Benchmark Table
export async function fetchBenchmarks(): Promise<BenchmarkItem[]> {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/models/benchmarks`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.benchmarks || [];
  } catch {
    return [];
  }
}

// Trigger Retraining
export async function triggerModelRetrain(): Promise<any> {
  const res = await fetch(`${FASTAPI_BASE_URL}/models/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to train model");
  return await res.json();
}

// Optimize Itinerary via FastAPI
export async function optimizeItineraryApi(
  profile: TouristProfile
): Promise<{ stops: ItineraryStop[]; metrics: DayPlanMetrics } | null> {
  try {
    const payload = {
      traveler_type: profile.travelerType,
      origin_country: profile.originCountry,
      categories: profile.categories,
      start_time: profile.startTime,
      end_time: profile.endTime,
      max_budget_usd: profile.maxBudgetUSD,
      pace: profile.pace,
      mandatory_waypoints: profile.mandatoryWaypoints,
      starting_location: profile.startingLocation,
    };

    const res = await fetch(`${FASTAPI_BASE_URL}/itinerary/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn("FastAPI optimize error, falling back to local optimizer.", err);
    return null;
  }
}

// Adaptive Replan via FastAPI
export async function replanItineraryApi(
  currentStops: ItineraryStop[],
  delayMinutes: number,
  profile: TouristProfile
): Promise<{ updatedStops: ItineraryStop[]; resolution: DQNResolution } | null> {
  try {
    const payload = {
      current_stops: currentStops,
      delay_minutes: delayMinutes,
      traveler_type: profile.travelerType,
      origin_country: profile.originCountry,
      max_budget_usd: profile.maxBudgetUSD,
    };

    const res = await fetch(`${FASTAPI_BASE_URL}/itinerary/replan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn("FastAPI replan error, falling back to local engine.", err);
    return null;
  }
}

// Chat Assistant via FastAPI
export async function askAssistantApi(
  message: string,
  currentStopName: string,
  dwellRemaining: number
): Promise<{ reply: string; scheduleImpact?: any } | null> {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/itinerary/assistant-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        current_stop_name: currentStopName,
        dwell_minutes_remaining: dwellRemaining,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch (err) {
    return null;
  }
}

// Comprehensive AI Budget Agent Analysis via FastAPI / OpenAI
export async function analyzeBudgetWithAiAgent(payload: {
  traveler_type: string;
  adults_count: number;
  children_count: number;
  trip_days: number;
  max_budget_usd: number;
  selected_places: any[];
  vehicle: any;
  guide: any;
  hotels: any[];
}): Promise<any | null> {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/itinerary/ai-budget-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("FastAPI AI Budget Agent unreachable, utilizing built-in local engine.", err);
    return null;
  }
}

