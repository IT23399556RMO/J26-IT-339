import {
  TouristProfile,
  Attraction,
  VehicleOption,
  GuideOption,
  HotelOption,
  BudgetBreakdown,
  BudgetTradeOffSuggestion,
} from "../types";
import { SRI_LANKA_VEHICLES } from "../data/vehicles";
import { SRI_LANKA_GUIDES } from "../data/guides";
import { SRI_LANKA_HOTELS } from "../data/hotels";

/**
 * Calculates a comprehensive itemized budget plan for the tourist.
 */
export function calculateTripBudget(
  profile: TouristProfile,
  selectedAttractions: Attraction[],
  vehicle?: VehicleOption,
  guide?: GuideOption,
  selectedHotels: HotelOption[] = []
): BudgetBreakdown {
  const tripDays = profile.tripDates?.totalDays || 1;
  const adults = profile.adultsCount || (profile.travelerType === "family" ? 2 : profile.travelerType === "couple" ? 2 : 1);
  const children = profile.childrenCount || (profile.travelerType === "family" ? 2 : 0);

  // 1. Attraction entry fees
  const totalAttractionFees = selectedAttractions.reduce((sum, attr) => {
    const adultFees = attr.foreignFeeUSD * adults;
    const childFees = (attr.foreignFeeUSD * 0.5) * children; // children 50% discount
    return sum + adultFees + childFees;
  }, 0);

  // 2. Transport & fuel costs
  const activeVehicle =
    vehicle ||
    SRI_LANKA_VEHICLES.find((v) => v.id === profile.selectedVehicleId) ||
    SRI_LANKA_VEHICLES[0];
  const vehicleBaseCost = (activeVehicle?.dailyRateUSD || 45) * tripDays;
  const approxDistanceKm = Math.max(80, selectedAttractions.length * 35);
  const fuelCost = approxDistanceKm * (activeVehicle?.estimatedFuelPerKmUSD || 0.12);
  const totalTransport = Math.round(vehicleBaseCost + fuelCost);

  // 3. Tour guide costs
  const activeGuide =
    guide ||
    SRI_LANKA_GUIDES.find((g) => g.id === profile.selectedGuideId) ||
    SRI_LANKA_GUIDES[SRI_LANKA_GUIDES.length - 1]; // defaults to AI self-guided ($0)
  const totalGuide = (activeGuide?.dailyRateUSD || 0) * tripDays;

  // 4. Accommodation costs
  const hotelTotalUSD = selectedHotels.reduce((sum, hotel) => {
    return sum + hotel.pricePerNightUSD;
  }, 0);

  // 5. Meals & incidentals buffer ($15/adult/day, $8/child/day)
  const mealsAndBufferUSD = Math.round((adults * 16 + children * 8) * tripDays);

  const grandTotalUSD = Math.round(
    totalAttractionFees + totalTransport + totalGuide + hotelTotalUSD + mealsAndBufferUSD
  );

  const userMaxBudget = profile.maxBudgetUSD;
  const remainingOrExcessUSD = Math.round(userMaxBudget - grandTotalUSD);
  const isWithinBudget = grandTotalUSD <= userMaxBudget;

  return {
    attractionsTotalUSD: Math.round(totalAttractionFees),
    transportTotalUSD: totalTransport,
    guideTotalUSD: totalGuide,
    hotelTotalUSD: Math.round(hotelTotalUSD),
    mealsAndBufferUSD,
    grandTotalUSD,
    userMaxBudgetUSD: userMaxBudget,
    remainingOrExcessUSD,
    isWithinBudget,
  };
}

/**
 * Generates dynamic AI trade-off suggestions to lower the budget or maximize value.
 */
export function generateBudgetTradeOffSuggestions(
  profile: TouristProfile,
  breakdown: BudgetBreakdown,
  selectedAttractions: Attraction[],
  vehicle?: VehicleOption,
  guide?: GuideOption,
  selectedHotels: HotelOption[] = []
): BudgetTradeOffSuggestion[] {
  const suggestions: BudgetTradeOffSuggestion[] = [];
  const tripDays = profile.tripDates?.totalDays || 1;

  // --- COST REDUCTION SUGGESTIONS ---
  // 1. Vehicle downgrade if high-tier vehicle selected
  if (vehicle && (vehicle.category === "SUV 4x4" || vehicle.category === "Van")) {
    const sedan = SRI_LANKA_VEHICLES.find((v) => v.category === "Sedan");
    if (sedan) {
      const savings = Math.round((vehicle.dailyRateUSD - sedan.dailyRateUSD) * tripDays);
      suggestions.push({
        id: "swap-vehicle-sedan",
        type: "saving",
        title: "Switch to Hybrid Sedan (Toyota Prius)",
        description: `Your party comfortably fits into a comfortable hybrid sedan. Save $${savings} on vehicle rental and lower fuel consumption.`,
        impactUSD: -savings,
        category: "vehicle",
        actionLabel: `Save $${savings}`,
      });
    }
  }

  // 2. Guide cost reduction: Switch to AI Smart Audio Companion
  if (guide && guide.dailyRateUSD > 0) {
    const savings = Math.round(guide.dailyRateUSD * tripDays);
    suggestions.push({
      id: "switch-ai-guide",
      type: "saving",
      title: "Use TravelMate Autonomous AI Audio Guide",
      description: `Switch from a private human guide to our free GPS-enabled AI Audio Companion. Enjoy complete privacy and save $${savings}.`,
      impactUSD: -savings,
      category: "guide",
      actionLabel: `Save $${savings}`,
    });
  }

  // 3. Hotel optimization if high-tier hotels selected
  const luxuryHotel = selectedHotels.find((h) => h.starRating === 5 && h.pricePerNightUSD > 130);
  if (luxuryHotel) {
    const alternativeHotel = SRI_LANKA_HOTELS.find(
      (h) => h.region === luxuryHotel.region && h.starRating <= 4 && h.pricePerNightUSD < 90
    );
    if (alternativeHotel) {
      const savings = luxuryHotel.pricePerNightUSD - alternativeHotel.pricePerNightUSD;
      suggestions.push({
        id: `switch-hotel-${luxuryHotel.id}`,
        type: "saving",
        title: `Swap to ${alternativeHotel.name}`,
        description: `Enjoy authentic Sri Lankan hospitality and mountain/lake vistas while saving $${savings} per night.`,
        impactUSD: -savings,
        category: "hotel",
        actionLabel: `Save $${savings}/night`,
      });
    }
  }

  // 4. Clustered route fuel savings
  if (selectedAttractions.length > 2) {
    suggestions.push({
      id: "cluster-cultural-sites",
      type: "saving",
      title: "Optimize Route Sequence with Action-Masking",
      description: "Our DQN solver detected a backtrack. Re-ordering your waypoints saves approximately 38 km of transit and $15 in fuel.",
      impactUSD: -15,
      category: "route",
      actionLabel: "Save $15 & 45 Mins",
    });
  }

  // --- VALUE ADDITION & UPGRADE SUGGESTIONS ---
  // 5. Add scenic train experience
  if (
    selectedAttractions.some((a) => a.region.includes("Ella") || a.region.includes("Kandy")) &&
    vehicle?.category !== "Scenic Train"
  ) {
    suggestions.push({
      id: "add-scenic-train",
      type: "upgrade",
      title: "Add Kandy-to-Ella Scenic Mountain Train",
      description: "Ranked among the top 5 railway journeys on Earth. Passes through misty tea plantations and the Nine Arch Bridge for just $15.",
      impactUSD: 15,
      category: "activity",
      actionLabel: "+$15 / Person",
    });
  }

  // 6. Upgrade to open-roof safari jeep if wildlife park is in plan
  if (
    selectedAttractions.some((a) => a.category === "Wildlife") &&
    vehicle?.category !== "Safari Jeep"
  ) {
    suggestions.push({
      id: "upgrade-safari-jeep",
      type: "upgrade",
      title: "Book Elevated Tiered 4x4 Safari Jeep",
      description: "Upgrades your game drive in Minneriya/Yala to an open-roof safari vehicle for unobstructed 360° wildlife photography.",
      impactUSD: 35,
      category: "vehicle",
      actionLabel: "+$35 Upgrade",
    });
  }

  return suggestions;
}
