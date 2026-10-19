"use client";

import React, { useState, useMemo } from "react";
import {
  TouristProfile,
  Attraction,
  VehicleOption,
  GuideOption,
  HotelOption,
  BudgetBreakdown,
  BudgetTradeOffSuggestion,
  TravelerType,
  TravelPace,
} from "../types";
import { SRI_LANKA_ATTRACTIONS } from "../data/attractions";
import { SRI_LANKA_VEHICLES } from "../data/vehicles";
import { SRI_LANKA_GUIDES } from "../data/guides";
import { SRI_LANKA_HOTELS } from "../data/hotels";
import {
  calculateTripBudget,
  generateBudgetTradeOffSuggestions,
} from "../utils/budgetEngine";
import { analyzeBudgetWithAiAgent } from "../services/api";
import {
  Users,
  User,
  Heart,
  Calendar,
  Clock,
  Car,
  Compass,
  Building,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sliders,
  MapPin,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Bot,
  Luggage,
  ShieldCheck,
  Star,
  Search,
  Filter,
  Eye,
  RefreshCw,
  X,
  ChevronsUpDown,
} from "lucide-react";

interface FullItineraryWizardProps {
  initialProfile: TouristProfile;
  onPlanFinalized: (
    updatedProfile: TouristProfile,
    selectedAttractions: Attraction[],
    budget: BudgetBreakdown
  ) => void;
  isBackendConnected: boolean;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

const CATEGORIES = [
  "All",
  "Heritage",
  "Wildlife",
  "Beaches",
  "Nature",
  "Cultural",
  "Culinary",
  "Adventure",
];

export default function FullItineraryWizard({
  initialProfile,
  onPlanFinalized,
  isBackendConnected,
}: FullItineraryWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // --- Step 1 State: Party & Dates ---
  const [travelerType, setTravelerType] = useState<TravelerType>(
    initialProfile.travelerType || "couple"
  );
  const [adultsCount, setAdultsCount] = useState<number>(
    initialProfile.adultsCount || (initialProfile.travelerType === "family" ? 2 : initialProfile.travelerType === "couple" ? 2 : 1)
  );
  const [childrenCount, setChildrenCount] = useState<number>(
    initialProfile.childrenCount || (initialProfile.travelerType === "family" ? 2 : 0)
  );
  const [startDate, setStartDate] = useState<string>("2026-11-01");
  const [endDate, setEndDate] = useState<string>("2026-11-02");
  const [startTime, setStartTime] = useState<string>(initialProfile.startTime || "08:00");
  const [endTime, setEndTime] = useState<string>(initialProfile.endTime || "18:00");
  const [pace, setPace] = useState<TravelPace>(initialProfile.pace || "balanced");
  const [maxBudgetUSD, setMaxBudgetUSD] = useState<number>(initialProfile.maxBudgetUSD || 280);
  const [originCountry, setOriginCountry] = useState<string>(
    initialProfile.originCountry || "United Kingdom 🇬🇧"
  );

  // --- Step 2 State: Places / Attractions ---
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>(
    initialProfile.mandatoryWaypoints?.length
      ? initialProfile.mandatoryWaypoints
      : ["sigiriya-rock-fortress", "dambulla-cave-temple", "minneriya-national-park"]
  );
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [inspectingPlaceForHotels, setInspectingPlaceForHotels] = useState<Attraction | null>(null);

  // --- Step 3 State: Vehicle ---
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialProfile.selectedVehicleId ||
      (travelerType === "family" ? "van-luxury" : "sedan-standard")
  );

  // --- Step 4 State: Guide ---
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    initialProfile.selectedGuideId || "chauffeur-guide-ravindu"
  );

  // --- Step 5 State: Hotels ---
  const [selectedHotelsMap, setSelectedHotelsMap] = useState<Record<string, string>>(
    initialProfile.selectedHotels || {
      "sigiriya-rock-fortress": "hotel-sigiriya-village",
      "temple-tooth-kandy": "hotel-queens-kandy",
    }
  );

  // --- Step 6 State: AI Trade-Off Suggestions ---
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<string[]>([]);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [aiAgentResult, setAiAgentResult] = useState<{
    source?: string;
    summary_narrative?: string;
    cost_reduction_suggestions?: any[];
    upgrade_suggestions?: any[];
    tourist_warnings?: string[];
    feasibility_score?: number;
    budget_breakdown?: any;
  } | null>(null);

  // Calculate trip duration
  const tripDays = useMemo(() => {
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
    } catch {
      return 1;
    }
  }, [startDate, endDate]);

  // Selected attraction objects
  const selectedAttractions = useMemo(() => {
    return SRI_LANKA_ATTRACTIONS.filter((a) => selectedPlaceIds.includes(a.id));
  }, [selectedPlaceIds]);

  // Active vehicle and guide
  const activeVehicle = useMemo(() => {
    return SRI_LANKA_VEHICLES.find((v) => v.id === selectedVehicleId) || SRI_LANKA_VEHICLES[0];
  }, [selectedVehicleId]);

  const activeGuide = useMemo(() => {
    return SRI_LANKA_GUIDES.find((g) => g.id === selectedGuideId) || SRI_LANKA_GUIDES[0];
  }, [selectedGuideId]);

  // Active hotels array
  const activeHotels = useMemo(() => {
    const list: HotelOption[] = [];
    Object.values(selectedHotelsMap).forEach((hotelId) => {
      const h = SRI_LANKA_HOTELS.find((item) => item.id === hotelId);
      if (h && !list.some((item) => item.id === h.id)) {
        list.push(h);
      }
    });
    return list;
  }, [selectedHotelsMap]);

  // Constructed profile for budget calculation
  const currentProfile: TouristProfile = useMemo(() => {
    return {
      travelerType,
      adultsCount,
      childrenCount,
      originCountry,
      categories: [selectedCategoryFilter !== "All" ? selectedCategoryFilter : "Heritage"],
      startTime,
      endTime,
      maxBudgetUSD,
      pace,
      mandatoryWaypoints: selectedPlaceIds,
      startingLocation: "Colombo / Airport Arrival",
      tripDates: {
        startDate,
        endDate,
        totalDays: tripDays,
      },
      selectedVehicleId,
      selectedGuideId,
      selectedHotels: selectedHotelsMap,
      appliedTradeOffIds: appliedSuggestionIds,
    };
  }, [
    travelerType,
    adultsCount,
    childrenCount,
    originCountry,
    selectedCategoryFilter,
    startTime,
    endTime,
    maxBudgetUSD,
    pace,
    selectedPlaceIds,
    startDate,
    endDate,
    tripDays,
    selectedVehicleId,
    selectedGuideId,
    selectedHotelsMap,
    appliedSuggestionIds,
  ]);

  // Calculate live budget
  const budgetBreakdown: BudgetBreakdown = useMemo(() => {
    return calculateTripBudget(
      currentProfile,
      selectedAttractions,
      activeVehicle,
      activeGuide,
      activeHotels
    );
  }, [currentProfile, selectedAttractions, activeVehicle, activeGuide, activeHotels]);

  // Generate AI Suggestions
  const tradeOffSuggestions: BudgetTradeOffSuggestion[] = useMemo(() => {
    return generateBudgetTradeOffSuggestions(
      currentProfile,
      budgetBreakdown,
      selectedAttractions,
      activeVehicle,
      activeGuide,
      activeHotels
    );
  }, [currentProfile, budgetBreakdown, selectedAttractions, activeVehicle, activeGuide, activeHotels]);

  // Filtered attractions for Step 2
  const filteredAttractions = useMemo(() => {
    return SRI_LANKA_ATTRACTIONS.filter((attr) => {
      const matchesCategory =
        selectedCategoryFilter === "All" || attr.category === selectedCategoryFilter;
      const matchesSearch =
        placeSearchQuery.trim() === "" ||
        attr.name.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
        attr.region.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
        (attr.sinhalaName && attr.sinhalaName.includes(placeSearchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryFilter, placeSearchQuery]);

  // Toggle place selection
  const handleTogglePlace = (id: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Auto pick AI hotels
  const handleAutoPickHotels = () => {
    const newMap: Record<string, string> = {};
    selectedAttractions.forEach((attr) => {
      const matched = SRI_LANKA_HOTELS.find(
        (h) => h.nearAttractionId === attr.id || h.region.includes(attr.region.split(" ")[0])
      );
      if (matched) {
        newMap[attr.id] = matched.id;
      }
    });
    setSelectedHotelsMap(newMap);
  };

  // Apply or revert AI Trade-Off
  const handleApplyTradeOff = (suggestion: BudgetTradeOffSuggestion) => {
    if (appliedSuggestionIds.includes(suggestion.id)) {
      setAppliedSuggestionIds((prev) => prev.filter((id) => id !== suggestion.id));
      return;
    }

    setAppliedSuggestionIds((prev) => [...prev, suggestion.id]);

    if (suggestion.id === "swap-vehicle-sedan") {
      setSelectedVehicleId("sedan-standard");
    } else if (suggestion.id === "switch-ai-guide") {
      setSelectedGuideId("self-guided-ai");
    } else if (suggestion.id === "upgrade-safari-jeep") {
      setSelectedVehicleId("safari-jeep");
    } else if (suggestion.id.startsWith("switch-hotel-")) {
      const parts = suggestion.id.split("-");
      const oldHotelId = parts.slice(2).join("-");
      const oldHotel = SRI_LANKA_HOTELS.find((h) => h.id === oldHotelId);
      if (oldHotel && oldHotel.nearAttractionId) {
        const affordableHotel = SRI_LANKA_HOTELS.find(
          (h) =>
            h.region === oldHotel.region &&
            h.starRating <= 4 &&
            h.pricePerNightUSD < oldHotel.pricePerNightUSD
        );
        if (affordableHotel) {
          setSelectedHotelsMap((prev) => ({
            ...prev,
            [oldHotel.nearAttractionId!]: affordableHotel.id,
          }));
        }
      }
    }
  };

  // Run AI Comprehensive Analysis via backend FastAPI OpenAI Agent
  const handleTriggerAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const payload = {
        traveler_type: travelerType,
        adults_count: adultsCount,
        children_count: childrenCount,
        trip_days: tripDays,
        max_budget_usd: maxBudgetUSD,
        selected_places: selectedAttractions.map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          foreignFeeUSD: a.foreignFeeUSD,
          region: a.region,
        })),
        vehicle: {
          id: activeVehicle?.id,
          name: activeVehicle?.name,
          category: activeVehicle?.category,
          dailyRateUSD: activeVehicle?.dailyRateUSD,
          estimatedFuelPerKmUSD: activeVehicle?.estimatedFuelPerKmUSD,
        },
        guide: {
          id: activeGuide?.id,
          name: activeGuide?.name,
          type: activeGuide?.licenseType || activeGuide?.title,
          dailyRateUSD: activeGuide?.dailyRateUSD,
        },
        hotels: activeHotels.map((h) => ({
          id: h.id,
          name: h.name,
          pricePerNightUSD: h.pricePerNightUSD,
          starRating: h.starRating,
          region: h.region,
        })),
      };

      const result = await analyzeBudgetWithAiAgent(payload);
      if (result && result.summary_narrative) {
        setAiAgentResult(result);
      }
    } catch (err) {
      console.warn("FastAPI OpenAI Budget Agent call failed:", err);
    } finally {
      setIsAiAnalyzing(false);
      setAiAnalysisComplete(true);
    }
  };

  // Automatically trigger AI analysis when entering step 6 if not yet run
  React.useEffect(() => {
    if (currentStep === 6 && !aiAgentResult && !isAiAnalyzing) {
      handleTriggerAiAnalysis();
    }
  }, [currentStep, aiAgentResult, isAiAnalyzing]);

  // Finalize plan
  const handleFinalize = () => {
    onPlanFinalized(currentProfile, selectedAttractions, budgetBreakdown);
  };

  return (
    <div className="space-y-6">
      {/* ================= STEPPER HEADER ================= */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
          {[
            { step: 1, label: "Party & Dates", icon: Users },
            { step: 2, label: "Destinations", icon: MapPin },
            { step: 3, label: "Vehicle", icon: Car },
            { step: 4, label: "Guide", icon: Compass },
            { step: 5, label: "Stays & Hotels", icon: Building },
            { step: 6, label: "AI Budget Plan", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = currentStep === item.step;
            const isDone = currentStep > item.step;
            return (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step as WizardStep)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? "bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 font-bold shadow-lg shadow-teal-500/20 scale-102"
                    : isDone
                    ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    isCurrent
                      ? "bg-slate-950 text-teal-400 font-bold"
                      : isDone
                      ? "bg-teal-400 text-slate-950 font-bold"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3" /> : item.step}
                </span>
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STEP 1: PARTY & DATES ================= */}
      {currentStep === 1 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
              <Users className="h-3.5 w-3.5" /> Step 1 of 6
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
              Select Your Travel Party & Schedule
            </h2>
            <p className="text-sm text-slate-400">
              Personalize whether you are traveling as a Family, Couple, or Solo explorer to tailor comfort, safety, and pacing.
            </p>
          </div>

          {/* Party Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                type: "solo" as TravelerType,
                title: "Solo Explorer",
                desc: "Maximum flexibility, culture immersion & scenic trails",
                icon: User,
                badge: "Budget Friendly",
              },
              {
                type: "couple" as TravelerType,
                title: "Couple / Romantic",
                desc: "Scenic viewpoints, boutique villas, peaceful luxury",
                icon: Heart,
                badge: "Most Popular",
              },
              {
                type: "family" as TravelerType,
                title: "Family with Kids",
                desc: "Spacious vans, child-safe wildlife safaris & comfortable pacing",
                icon: Users,
                badge: "Comfort & Safety",
              },
            ].map((card) => {
              const Icon = card.icon;
              const isSelected = travelerType === card.type;
              return (
                <div
                  key={card.type}
                  onClick={() => {
                    setTravelerType(card.type);
                    if (card.type === "solo") {
                      setAdultsCount(1);
                      setChildrenCount(0);
                      setSelectedVehicleId("sedan-standard");
                    } else if (card.type === "couple") {
                      setAdultsCount(2);
                      setChildrenCount(0);
                      setSelectedVehicleId("sedan-standard");
                    } else {
                      setAdultsCount(2);
                      setChildrenCount(2);
                      setSelectedVehicleId("van-luxury");
                    }
                  }}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-teal-400 bg-gradient-to-b from-teal-500/20 to-sky-500/10 shadow-lg shadow-teal-500/10"
                      : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-xl ${
                        isSelected ? "bg-teal-400 text-slate-950" : "bg-white/10 text-teal-300"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-slate-950 font-bold">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-bold text-lg text-white">{card.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                  <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-300">
                    {card.badge}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Passenger Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-white">Adult Travelers</span>
                <p className="text-xs text-slate-400">Ages 12+ years</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-teal-300 w-6 text-center">{adultsCount}</span>
                <button
                  type="button"
                  onClick={() => setAdultsCount(adultsCount + 1)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-white">Child Travelers</span>
                <p className="text-xs text-slate-400">Ages 2-11 years (50% attraction fee)</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-teal-300 w-6 text-center">{childrenCount}</span>
                <button
                  type="button"
                  onClick={() => setChildrenCount(childrenCount + 1)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Dates & Daily Pacing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-400" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-sm text-white focus:border-teal-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-400" /> End Date ({tripDays} Days Total)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-sm text-white focus:border-teal-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-teal-400" /> Total Budget Target (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="10"
                  value={maxBudgetUSD}
                  onChange={(e) => setMaxBudgetUSD(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-8 pr-3.5 py-2.5 text-sm text-white focus:border-teal-400 outline-none font-bold"
                />
              </div>
            </div>
          </div>

          {/* Daily Schedule Windows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-400" /> Daily Tour Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-sm text-white focus:border-teal-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-400" /> Evening Hotel Return Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-sm text-white focus:border-teal-400 outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:scale-102 transition-transform cursor-pointer"
            >
              Continue to Select Destinations <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: DESTINATIONS WITH IMAGES ================= */}
      {currentStep === 2 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
                <MapPin className="h-3.5 w-3.5" /> Step 2 of 6
              </span>
              <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
                Select Places You Wish to Visit ({selectedPlaceIds.length} Chosen)
              </h2>
              <p className="text-sm text-slate-400">
                Browse iconic cultural landmarks, safaris, and beaches with photos. Click any place to explore nearby hotels!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-lg bg-teal-400/20 text-teal-300 border border-teal-400/30 font-semibold">
                {selectedPlaceIds.length} Places Selected
              </span>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Sigiriya, Ella, Galle, Yala, Temple..."
                value={placeSearchQuery}
                onChange={(e) => setPlaceSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-white focus:border-teal-400 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? "bg-teal-400 text-slate-950 font-bold"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Attractions Grid with Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAttractions.map((attr) => {
              const isSelected = selectedPlaceIds.includes(attr.id);
              return (
                <div
                  key={attr.id}
                  className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? "border-teal-400 bg-slate-900/90 shadow-xl shadow-teal-500/10"
                      : "border-white/10 bg-slate-900/50 hover:border-white/25 hover:bg-slate-900/80"
                  }`}
                >
                  {/* Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <img
                      src={attr.imageUrl || "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80"}
                      alt={attr.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 text-teal-300 border border-teal-400/30 backdrop-blur-md">
                      {attr.category}
                    </span>

                    {/* Selection Checkmark */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlace(attr.id)}
                      className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                        isSelected
                          ? "bg-teal-400 text-slate-950 font-bold"
                          : "bg-slate-950/80 text-white/60 hover:text-white border border-white/20"
                      }`}
                    >
                      {isSelected ? <Check className="h-5 w-5" /> : <div className="h-4 w-4 rounded-full border-2 border-white/40" />}
                    </button>

                    {/* Pricing badge */}
                    <span className="absolute bottom-3 left-3 text-xs font-bold text-white px-2 py-0.5 rounded-md bg-slate-900/80 border border-white/10">
                      {attr.foreignFeeUSD === 0 ? "Free Entry" : `$${attr.foreignFeeUSD} Foreigner Fee`}
                    </span>

                    {/* Dwell time badge */}
                    <span className="absolute bottom-3 right-3 text-xs text-slate-300 px-2 py-0.5 rounded-md bg-slate-900/80 border border-white/10 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-teal-400" /> {attr.typicalDwellMinutes}m
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors">
                        {attr.name}
                      </h3>
                      {attr.sinhalaName && (
                        <p className="text-xs text-teal-400/80 font-sinhala">{attr.sinhalaName}</p>
                      )}
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {attr.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingPlaceForHotels(attr)}
                        className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Building className="h-3.5 w-3.5" /> Nearby Hotels
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePlace(attr.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                            : "bg-teal-400/20 text-teal-300 border border-teal-400/40 hover:bg-teal-400/30"
                        }`}
                      >
                        {isSelected ? "Remove" : "+ Add to Trip"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nearby Hotels Modal / Drawer when inspecting a place */}
          {inspectingPlaceForHotels && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                      Hotels & Stays Near
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {inspectingPlaceForHotels.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingPlaceForHotels(null)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {SRI_LANKA_HOTELS.filter(
                    (h) =>
                      h.nearAttractionId === inspectingPlaceForHotels.id ||
                      h.region.includes(inspectingPlaceForHotels.region.split(" ")[0])
                  ).map((hotel) => {
                    const isHotelChosen =
                      selectedHotelsMap[inspectingPlaceForHotels.id] === hotel.id;
                    return (
                      <div
                        key={hotel.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-4 items-center justify-between ${
                          isHotelChosen
                            ? "border-teal-400 bg-teal-500/15"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-white">{hotel.name}</h4>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-bold flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-amber-300" /> {hotel.starRating}★
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{hotel.roomType}</p>
                            <p className="text-xs text-teal-400 font-medium mt-1">
                              📍 {hotel.distanceKm} km from {inspectingPlaceForHotels.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                          <span className="text-base font-extrabold text-teal-300">
                            ${hotel.pricePerNightUSD}{" "}
                            <span className="text-xs font-normal text-slate-400">/ night</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHotelsMap((prev) => ({
                                ...prev,
                                [inspectingPlaceForHotels.id]: hotel.id,
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isHotelChosen
                                ? "bg-teal-400 text-slate-950"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            {isHotelChosen ? "✓ Selected Stay" : "Select This Stay"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setInspectingPlaceForHotels(null)}
                    className="px-5 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Party
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={selectedPlaceIds.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:scale-102 transition-transform cursor-pointer disabled:opacity-50"
            >
              Continue to Choose Vehicle ({selectedPlaceIds.length} places) <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: VEHICLE & TRANSPORTATION ================= */}
      {currentStep === 3 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
              <Car className="h-3.5 w-3.5" /> Step 3 of 6
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
              Select Your Tour Transportation
            </h2>
            <p className="text-sm text-slate-400">
              Pick the vehicle that matches your party size ({adultsCount + childrenCount} passengers) and terrain. Real photos, passenger capacity & daily rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SRI_LANKA_VEHICLES.map((v) => {
              const isSelected = selectedVehicleId === v.id;
              const hasCapacity = v.capacity >= adultsCount + childrenCount;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-teal-400 bg-gradient-to-b from-teal-500/20 to-sky-500/10 shadow-xl shadow-teal-500/15"
                      : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900"
                  }`}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    {v.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-400 text-slate-950 shadow-md">
                        {v.badge}
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute top-3 right-3 h-7 w-7 rounded-full bg-teal-400 text-slate-950 font-bold flex items-center justify-center shadow-lg">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 text-base font-extrabold text-white px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10">
                      ${v.dailyRateUSD} <span className="text-xs font-normal text-slate-400">/ day</span>
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{v.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                        <span className="flex items-center gap-1 text-teal-300 font-semibold">
                          <Users className="h-3.5 w-3.5" /> Max {v.capacity} Passengers
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Luggage className="h-3.5 w-3.5" /> {v.luggageCapacity} Bags
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">{v.bestFor}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {v.features.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/5 text-slate-300"
                          >
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!hasCapacity && (
                      <div className="mt-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Vehicle fits {v.capacity} pax (you have {adultsCount + childrenCount} in your party).
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Destinations
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:scale-102 transition-transform cursor-pointer"
            >
              Continue to Choose Guide <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: TOUR GUIDER SELECTION ================= */}
      {currentStep === 4 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
              <Compass className="h-3.5 w-3.5" /> Step 4 of 6
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
              Select Your Tour Guide or Self-Guided AI
            </h2>
            <p className="text-sm text-slate-400">
              Select a certified SLTDA National Guide, Chauffeur Driver-Guide, Site Historian, or our 100% Free Autonomous AI Audio Companion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SRI_LANKA_GUIDES.map((g) => {
              const isSelected = selectedGuideId === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGuideId(g.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-teal-400 bg-gradient-to-b from-teal-500/20 to-sky-500/10 shadow-xl shadow-teal-500/15"
                      : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={g.avatarUrl}
                      alt={g.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                          {g.licenseType}
                        </span>
                        <span className="font-extrabold text-base text-teal-300">
                          {g.dailyRateUSD === 0 ? "FREE" : `$${g.dailyRateUSD} / day`}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-white mt-1">{g.name}</h3>
                      <p className="text-xs text-slate-300 font-medium">{g.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-300">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3.5 w-3.5 fill-amber-300" /> {g.rating}
                        </span>
                        <span className="text-slate-400">({g.reviewsCount} tourist reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">{g.description}</p>

                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                    {g.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                      >
                        🗣️ {lang}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Vehicles
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:scale-102 transition-transform cursor-pointer"
            >
              Continue to Hotel Stays <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: HOTEL & ACCOMMODATION ================= */}
      {currentStep === 5 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
                <Building className="h-3.5 w-3.5" /> Step 5 of 6
              </span>
              <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
                Recommended Stays Near Your Itinerary Stops
              </h2>
              <p className="text-sm text-slate-400">
                Pick your accommodations or let the AI algorithm match the highest-rated stay for each destination.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoPickHotels}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 hover:scale-102 transition-transform cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> ✨ AI Auto-Pick Best Stays
            </button>
          </div>

          {/* Hotels mapped to chosen places */}
          <div className="space-y-6">
            {selectedAttractions.slice(0, 4).map((attr) => {
              const nearby = SRI_LANKA_HOTELS.filter((h) => {
                if (h.nearAttractionId === attr.id) return true;
                const attrLower = (attr.name + " " + attr.region).toLowerCase();
                const hotelLower = (h.name + " " + h.region + " " + (h.nearAttractionId || "")).toLowerCase();

                if (
                  attrLower.includes("dambulla") ||
                  attrLower.includes("sigiriya") ||
                  attrLower.includes("pidurangala") ||
                  attrLower.includes("matale") ||
                  attrLower.includes("cultural triangle")
                ) {
                  return (
                    hotelLower.includes("dambulla") ||
                    hotelLower.includes("sigiriya") ||
                    hotelLower.includes("kandalama") ||
                    hotelLower.includes("pidurangala") ||
                    hotelLower.includes("cultural triangle") ||
                    hotelLower.includes("matale")
                  );
                }
                if (attrLower.includes("kandy")) {
                  return hotelLower.includes("kandy");
                }
                if (attrLower.includes("nuwara eliya") || attrLower.includes("horton")) {
                  return hotelLower.includes("nuwara eliya") || hotelLower.includes("highlands");
                }
                if (attrLower.includes("ella") || attrLower.includes("nine arch")) {
                  return hotelLower.includes("ella") || hotelLower.includes("uva");
                }
                if (attrLower.includes("yala") || attrLower.includes("minneriya")) {
                  return (
                    hotelLower.includes("yala") ||
                    hotelLower.includes("safari") ||
                    hotelLower.includes("minneriya")
                  );
                }
                if (
                  attrLower.includes("galle") ||
                  attrLower.includes("mirissa") ||
                  attrLower.includes("beach")
                ) {
                  return (
                    hotelLower.includes("galle") ||
                    hotelLower.includes("mirissa") ||
                    hotelLower.includes("southern")
                  );
                }
                return h.region.includes(attr.region.split(" ")[0]);
              });

              if (nearby.length === 0) return null;

              return (
                <div
                  key={attr.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3.5 shadow-xl"
                >
                  {/* Attraction Stays Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                          Stays near: {attr.name}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-400/10 text-teal-300 border border-teal-400/20 font-semibold">
                            {nearby.length} Stays Available
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">{attr.region}</p>
                      </div>
                    </div>

                    {nearby.length > 2 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-teal-300/90 bg-teal-400/10 px-2.5 py-1 rounded-full border border-teal-400/20 w-fit">
                        <ChevronsUpDown className="h-3 w-3 text-teal-400 animate-pulse" />
                        <span>Scroll inside box for all {nearby.length} stays & details</span>
                      </div>
                    )}
                  </div>

                  {/* Scrollable Container with defined height and custom scrollbar */}
                  <div className="max-h-[440px] overflow-y-auto pr-1.5 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {nearby.map((hotel) => {
                        const isSelected = selectedHotelsMap[attr.id] === hotel.id;
                        return (
                          <div
                            key={hotel.id}
                            onClick={() => {
                              setSelectedHotelsMap((prev) => ({
                                ...prev,
                                [attr.id]: hotel.id,
                              }));
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                              isSelected
                                ? "border-teal-400 bg-teal-500/15 shadow-lg shadow-teal-500/10 ring-1 ring-teal-400/50"
                                : "border-white/10 bg-slate-950/70 hover:border-teal-400/40 hover:bg-slate-950/90"
                            }`}
                          >
                            <div>
                              <div className="flex gap-3">
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/10">
                                  <img
                                    src={hotel.imageUrl}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                                    }}
                                  />
                                  {hotel.starRating && (
                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center gap-0.5 border border-white/10">
                                      <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                                      {hotel.starRating}★
                                    </span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1">
                                    <h4 className="font-bold text-sm text-white leading-snug group-hover:text-teal-300 transition-colors line-clamp-1">
                                      {hotel.name}
                                    </h4>
                                    {isSelected && (
                                      <span className="h-5 w-5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                                        <Check className="h-3 w-3" />
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-300 mt-0.5 font-medium line-clamp-1">
                                    {hotel.roomType}
                                  </p>

                                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                                    <span className="text-emerald-400 font-semibold">
                                      ★ {hotel.guestRating || 9.0}/10
                                    </span>
                                    <span>•</span>
                                    <span className="text-slate-400">{hotel.distanceKm} km away</span>
                                  </div>

                                  {hotel.badge && (
                                    <div className="mt-1">
                                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-teal-300 border border-teal-400/20">
                                        {hotel.badge}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Amenities Tags */}
                              {hotel.amenities && hotel.amenities.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  {hotel.amenities.slice(0, 3).map((amenity, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-300 border border-white/5"
                                    >
                                      ✓ {amenity}
                                    </span>
                                  ))}
                                  {hotel.amenities.length > 3 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-400 border border-white/5">
                                      +{hotel.amenities.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Description Snippet */}
                              {hotel.description && (
                                <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                  {hotel.description}
                                </p>
                              )}
                            </div>

                            {/* Card Footer with Price and Selection */}
                            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                              <span
                                className={`text-[11px] font-medium ${
                                  isSelected ? "text-teal-300 font-bold" : "text-slate-400"
                                }`}
                              >
                                {isSelected ? "✓ Selected Accommodation" : "Click to select"}
                              </span>
                              <div className="text-right">
                                <span className="text-base font-extrabold text-teal-300">
                                  ${hotel.pricePerNightUSD}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-1">/ night</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Guides
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStep(6);
                handleTriggerAiAnalysis();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:scale-102 transition-transform cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> AI Assist: Analyze & Generate Budget Plan <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 6: AI BUDGET & DYNAMIC TRADE-OFF OPTIMIZER ================= */}
      {currentStep === 6 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
                <Bot className="h-3.5 w-3.5 text-teal-400" /> AI Optimization & Custom Budget Advisor
              </span>
              <span className="text-xs font-mono text-slate-400">
                Model: DQN + Action-Masking (J26-IT339)
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
              AI Comprehensive Budget Analysis & Dynamic Customization
            </h2>
            <p className="text-sm text-slate-400">
              Review your complete travel expenses across activities, transport, guide, and stays. Apply AI trade-offs to lower costs or enhance your experience!
            </p>
          </div>

          {/* Loading or Analyzed State */}
          {isAiAnalyzing ? (
            <div className="p-12 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full border-4 border-teal-400/20 border-t-teal-400 animate-spin" />
              <h3 className="font-bold text-lg text-white">Running Deep Q-Network Optimization...</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Analyzing road transit constraints, entrance fees, fuel indices, and hotel proximity to generate optimal budget trade-offs.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grand Budget Overview Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-white/10 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Total Trip Cost Breakdown ({tripDays} Days Tour)
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-4xl font-extrabold text-white">
                        ${budgetBreakdown.grandTotalUSD}
                      </span>
                      <span className="text-sm text-slate-400">
                        Target Budget: ${budgetBreakdown.userMaxBudgetUSD}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {budgetBreakdown.isWithinBudget ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                        <CheckCircle2 className="h-4 w-4" /> Within Budget (+${budgetBreakdown.remainingOrExcessUSD} Saved)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-400/15 text-rose-300 border border-rose-400/30">
                        <AlertCircle className="h-4 w-4" /> Over Budget by ${Math.abs(budgetBreakdown.remainingOrExcessUSD)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetBreakdown.isWithinBudget
                        ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                        : "bg-gradient-to-r from-amber-400 to-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (budgetBreakdown.grandTotalUSD / budgetBreakdown.userMaxBudgetUSD) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* 5-Column Itemized Cost Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-teal-400" /> Places & Entry
                  </span>
                  <p className="mt-1 text-lg font-bold text-white">
                    ${budgetBreakdown.attractionsTotalUSD}
                  </p>
                  <p className="text-[10px] text-slate-500">{selectedAttractions.length} destinations</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Car className="h-3 w-3 text-teal-400" /> Transport & Fuel
                  </span>
                  <p className="mt-1 text-lg font-bold text-white">
                    ${budgetBreakdown.transportTotalUSD}
                  </p>
                  <p className="text-[10px] text-slate-500">{activeVehicle?.name?.split(" ")[0] || "Vehicle"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Compass className="h-3 w-3 text-teal-400" /> Guide Fee
                  </span>
                  <p className="mt-1 text-lg font-bold text-white">
                    ${budgetBreakdown.guideTotalUSD}
                  </p>
                  <p className="text-[10px] text-slate-500">{activeGuide?.dailyRateUSD === 0 ? "AI Companion (Free)" : "Private Guide"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Building className="h-3 w-3 text-teal-400" /> Hotel Stays
                  </span>
                  <p className="mt-1 text-lg font-bold text-white">
                    ${budgetBreakdown.hotelTotalUSD}
                  </p>
                  <p className="text-[10px] text-slate-500">{activeHotels.length} accommodations</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-teal-400" /> Meals & Buffer
                  </span>
                  <p className="mt-1 text-lg font-bold text-white">
                    ${budgetBreakdown.mealsAndBufferUSD}
                  </p>
                  <p className="text-[10px] text-slate-500">Incidentals included</p>
                </div>
              </div>

              {/* ================= OPENAI AGENT COMPREHENSIVE INTELLIGENCE CARD ================= */}
              <div className="p-5 rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-900/90 via-teal-950/20 to-slate-900/90 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">
                          OpenAI Autonomous Budget & Travel Planning Agent
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-400/20 text-teal-300 border border-teal-400/40">
                          <Sparkles className="h-2.5 w-2.5" /> {aiAgentResult?.source || "FastAPI OpenAI Agent"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Component 3 • Multi-dimensional reasoning on foreign tourist constraints
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-slate-400">Feasibility Score:</span>
                      <span className="text-sm font-extrabold text-teal-300 font-mono">
                        {aiAgentResult?.feasibility_score ?? (budgetBreakdown.isWithinBudget ? 94 : 76)} / 100
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerAiAnalysis}
                      disabled={isAiAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`h-3 w-3 ${isAiAnalyzing ? "animate-spin" : ""}`} />
                      <span>Re-Analyze</span>
                    </button>
                  </div>
                </div>

                {/* AI Narrative Commentary */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
                  <p>
                    {aiAgentResult?.summary_narrative || (
                      `The TravelMate AI Agent has calculated your ${tripDays}-day itinerary for a ${travelerType} party of ${adultsCount} adult(s)` +
                      (childrenCount > 0 ? ` and ${childrenCount} child(ren). ` : ". ") +
                      `Total estimated trip expenditure is $${budgetBreakdown.grandTotalUSD} USD against your target ceiling of $${budgetBreakdown.userMaxBudgetUSD} USD. ` +
                      (budgetBreakdown.isWithinBudget
                        ? "Your plan is fully feasible and well within your budget limit!"
                        : `Your current selections exceed your budget target by $${Math.abs(budgetBreakdown.remainingOrExcessUSD)} USD. Review our one-click cost-reduction adjustments below to align your plan.`)
                    )}
                  </p>
                </div>

                {/* Sri Lankan Tourist Travel Warnings from AI Agent */}
                {aiAgentResult?.tourist_warnings && aiAgentResult.tourist_warnings.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Real-World Travel & Pacing Advisories (AI Grounded):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {aiAgentResult.tourist_warnings.map((warning, wIdx) => (
                        <div
                          key={wIdx}
                          className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-tight flex items-start gap-2"
                        >
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= AI TRADE-OFF SUGGESTIONS ================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-teal-400" /> AI Dynamic Trade-Off Suggestions
                    </h3>
                    <p className="text-xs text-slate-400">
                      Click &apos;Apply&apos; to instantly adjust your vehicle, stays, or guides and recalculate budget!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tradeOffSuggestions.map((sug) => {
                    const isApplied = appliedSuggestionIds.includes(sug.id);
                    return (
                      <div
                        key={sug.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isApplied
                            ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                            : sug.type === "saving"
                            ? "border-teal-400/30 bg-teal-500/5 hover:border-teal-400/60"
                            : "border-sky-400/30 bg-sky-500/5 hover:border-sky-400/60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                sug.type === "saving"
                                  ? "bg-emerald-400/20 text-emerald-300"
                                  : "bg-sky-400/20 text-sky-300"
                              }`}
                            >
                              {sug.type === "saving" ? "Cost Reduction" : "Experience Upgrade"}
                            </span>
                            <span
                              className={`font-extrabold text-sm ${
                                sug.type === "saving" ? "text-emerald-300" : "text-sky-300"
                              }`}
                            >
                              {sug.actionLabel}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white mt-2">{sug.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sug.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {isApplied ? "✓ Applied to Plan" : "One-Click AI Adjustment"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyTradeOff(sug)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isApplied
                                ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            {isApplied ? "Remove Adjustment" : "Apply Recommendation"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons to Finalize */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-base">Satisfied with this customized plan?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Launch your interactive day-by-day itinerary with real-time GPS map and in-situ AI support.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinalize}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 font-extrabold text-slate-950 text-sm shadow-xl shadow-teal-500/20 hover:scale-102 transition-transform cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" /> Finalize & View Live Day Timeline
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Stays
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
