export type TravelerType = "solo" | "couple" | "family";

export type TravelPace = "relaxed" | "balanced" | "packed";

export interface Attraction {
  id: string;
  name: string;
  sinhalaName?: string;
  region: string;
  category: "Heritage" | "Wildlife" | "Beaches" | "Nature" | "Cultural" | "Culinary" | "Adventure";
  lat: number;
  lng: number;
  openingTime: string; // "07:00"
  closingTime: string; // "17:30"
  foreignFeeUSD: number;
  typicalDwellMinutes: number;
  soloScore: number; // 1-5 scale
  coupleScore: number;
  familyScore: number;
  vaderSentiment: number; // 0.0 - 1.0 (from 33,394 TripAdvisor reviews)
  description: string;
  imageUrl?: string;
  amenities: {
    parking: boolean;
    washrooms: boolean;
    atm: boolean;
    cafeteria: boolean;
    wifi: boolean;
    wheelchair: boolean;
  };
}

export interface ItineraryStop {
  id: string;
  attraction: Attraction;
  arrivalTime: string; // "08:30 AM"
  departureTime: string; // "11:00 AM"
  dwellMinutes: number;
  costUSD: number;
  transitMinutesFromPrev: number;
  transitDistanceKmFromPrev: number;
  predictedEnjoyment: number; // 1.0 - 5.0
  xaiExplanation: {
    archetypeMatch: string;
    constraintRationale: string;
    weatherContext?: string;
    keyHighlights: string[];
  };
}

export interface TouristProfile {
  travelerType: TravelerType;
  originCountry: string;
  categories: string[];
  startTime: string; // "08:00"
  endTime: string; // "18:00"
  maxBudgetUSD: number;
  pace: TravelPace;
  mandatoryWaypoints: string[];
  startingLocation: string;
}

export interface DayPlanMetrics {
  satisfactionScore: number; // e.g. 4.85 / 5.0 (97%)
  totalCostUSD: number;
  totalDistanceKm: number;
  totalTransitMinutes: number;
  constraintViolations: number; // target: 0
  activeAttractionsCount: number;
}

export interface DelayConflict {
  detected: boolean;
  delayMinutes: number;
  reason: string;
  conflictingStopName: string;
  impactDescription: string;
}

export interface DQNResolution {
  alternativesEvaluated: number;
  solveTimeSeconds: number;
  preservedEnjoymentPercent: number;
  actionMaskedCount: number;
  justification: string;
  changesSummary: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  scheduleImpact?: {
    timeAddedMinutes: number;
    costImpactUSD: number;
    feasible: boolean;
    suggestedStopName?: string;
  };
}
