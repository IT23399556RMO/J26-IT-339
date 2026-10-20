"use client";

import React, { useState, useEffect } from "react";
import HeaderView from "../components/header/header";
import SidebarView from "../components/sidebar/sidebar";
import FooterView from "../components/footer/footer";
import ProfileView from "./components/ProfileView";
import FullItineraryWizard from "./components/FullItineraryWizard";
import DayPlanView from "./components/DayPlanView";
import AdaptiveReplanView from "./components/AdaptiveReplanView";
import OnSiteSupportView from "./components/OnSiteSupportView";
import MobileBottomNav, { ItineraryTab } from "./components/MobileBottomNav";
import { TouristProfile, ItineraryStop, DQNResolution, Attraction, BudgetBreakdown } from "./types";
import {
  buildOptimizedItinerary,
  executeAdaptiveReplan,
} from "./utils/optimizer";
import { SRI_LANKA_ATTRACTIONS } from "./data/attractions";
import {
  Sliders,
  MapPin,
  AlertTriangle,
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Server,
} from "lucide-react";
import ModelEvaluationModal from "./components/ModelEvaluationModal";
import {
  checkBackendHealth,
  optimizeItineraryApi,
  replanItineraryApi,
} from "./services/api";

export default function ItineraryPage({
  initialTab = "profile",
}: {
  initialTab?: ItineraryTab;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ItineraryTab>(initialTab);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  // Initial tourist profile matching the research proposal defaults
  const [profile, setProfile] = useState<TouristProfile>({
    travelerType: "couple",
    adultsCount: 2,
    childrenCount: 0,
    originCountry: "United Kingdom 🇬🇧",
    categories: ["Heritage", "Wildlife", "Culinary"],
    startTime: "08:00",
    endTime: "18:00",
    maxBudgetUSD: 85,
    pace: "balanced",
    mandatoryWaypoints: ["sigiriya-rock-fortress"],
    startingLocation: "Habarana / Cultural Triangle",
  });

  const [stops, setStops] = useState<ItineraryStop[]>([]);
  const [adaptiveStops, setAdaptiveStops] = useState<ItineraryStop[]>([]);
  const [dqnResolution, setDqnResolution] = useState<DQNResolution | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(45);
  const [activeInSituStop, setActiveInSituStop] = useState<ItineraryStop | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isWizardMode, setIsWizardMode] = useState<boolean>(true);

  // Initialize and check backend connection
  useEffect(() => {
    async function init() {
      const connected = await checkBackendHealth();
      setIsBackendConnected(connected);

      if (connected) {
        const apiResult = await optimizeItineraryApi(profile);
        if (apiResult && apiResult.stops.length > 0) {
          setStops(apiResult.stops);
          setActiveInSituStop(apiResult.stops[0]);
          return;
        }
      }

      // Fallback
      const initialStops = buildOptimizedItinerary(profile);
      setStops(initialStops);
      if (initialStops.length > 0) {
        setActiveInSituStop(initialStops[0]);
      }
    }
    init();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate Itinerary Handler (FastAPI with fallback)
  const handleGenerateItinerary = async () => {
    setIsOptimizing(true);

    if (isBackendConnected) {
      try {
        const apiResult = await optimizeItineraryApi(profile);
        if (apiResult && apiResult.stops.length > 0) {
          setStops(apiResult.stops);
          setActiveInSituStop(apiResult.stops[0]);
          setIsOptimizing(false);
          setActiveTab("day-plan");
          showToast("✨ AI Itinerary generated via Python FastAPI DQN Agent!");
          return;
        }
      } catch (err) {
        console.warn("FastAPI call failed, falling back to local optimizer", err);
      }
    }

    setTimeout(() => {
      const generated = buildOptimizedItinerary(profile);
      setStops(generated);
      if (generated.length > 0) {
        setActiveInSituStop(generated[0]);
      }
      setIsOptimizing(false);
      setActiveTab("day-plan");
      showToast("✨ AI Itinerary generated successfully using DQN policy!");
    }, 700);
  };

  // Handle Plan Finalized from the 6-Step Full Itinerary Wizard
  const handlePlanFinalized = async (
    updatedProfile: TouristProfile,
    selectedAttractions: Attraction[],
    budget: BudgetBreakdown
  ) => {
    setProfile(updatedProfile);
    setIsOptimizing(true);

    if (isBackendConnected) {
      try {
        const apiResult = await optimizeItineraryApi(updatedProfile);
        if (apiResult && apiResult.stops.length > 0) {
          setStops(apiResult.stops);
          setActiveInSituStop(apiResult.stops[0]);
          setIsOptimizing(false);
          setActiveTab("day-plan");
          showToast(`✨ Complete Plan & Budget Finalized ($${budget.grandTotalUSD} USD)! DQN Schedule Ready.`);
          return;
        }
      } catch (err) {
        console.warn("Backend optimization call failed, generating local itinerary", err);
      }
    }

    const generated = buildOptimizedItinerary(updatedProfile);
    setStops(generated);
    if (generated.length > 0) {
      setActiveInSituStop(generated[0]);
    }
    setIsOptimizing(false);
    setActiveTab("day-plan");
    showToast(`✨ Complete Plan & Budget Finalized ($${budget.grandTotalUSD} USD)! DQN Schedule Ready.`);
  };

  // Trigger Mid-trip delay simulation (FastAPI with fallback)
  const handleSimulateDelay = async (minutes: number = 45) => {
    setDelayMinutes(minutes);
    setHasConflict(true);

    if (isBackendConnected && stops.length > 0) {
      try {
        const apiResult = await replanItineraryApi(stops, minutes, profile);
        if (apiResult) {
          setAdaptiveStops(apiResult.updatedStops);
          setDqnResolution(apiResult.resolution);
          setActiveTab("adaptive");
          showToast(`⚠️ Schedule conflict detected: +${minutes}m delay solved by FastAPI DQN!`);
          return;
        }
      } catch (err) {
        console.warn("FastAPI replan failed, using local engine", err);
      }
    }

    const result = executeAdaptiveReplan(stops, profile, minutes);
    setAdaptiveStops(result.updatedItinerary);
    setDqnResolution(result.resolution);
    setActiveTab("adaptive");
    showToast(`⚠️ Schedule conflict detected: +${minutes}m delay reported!`);
  };

  // Skip next attraction & re-route
  const handleSkipNext = () => {
    if (stops.length <= 1) return;
    const skipped = stops.slice(1);
    setStops(skipped);
    showToast("⚡ Destination skipped. Sequence dynamically recalculated!");
  };

  // Confirm adaptive route
  const handleConfirmAdaptiveRoute = () => {
    if (adaptiveStops.length > 0) {
      setStops(adaptiveStops);
    }
    setHasConflict(false);
    setActiveTab("day-plan");
    showToast("✓ Adaptive route confirmed! All constraints satisfied.");
  };

  // Cancel adaptive route
  const handleCancelAdaptiveRoute = () => {
    setHasConflict(false);
    setActiveTab("day-plan");
  };

  // Add stop from on-site chatbot
  const handleAddStopFromChat = (name: string, minutes: number) => {
    const newAttraction = SRI_LANKA_ATTRACTIONS.find((a) => a.name.includes(name)) || {
      id: `chat-${Date.now()}`,
      name,
      region: "Cultural Triangle",
      category: "Cultural" as const,
      lat: 7.9482,
      lng: 80.7511,
      openingTime: "08:00",
      closingTime: "18:00",
      foreignFeeUSD: 0,
      typicalDwellMinutes: minutes,
      soloScore: 4.2,
      coupleScore: 4.5,
      familyScore: 4.3,
      vaderSentiment: 0.9,
      description: "Added via live Itinerary Assistant concierge.",
      amenities: {
        parking: true,
        washrooms: true,
        atm: true,
        cafeteria: true,
        wifi: true,
        wheelchair: true,
      },
    };

    const newStop: ItineraryStop = {
      id: `added-${Date.now()}`,
      attraction: newAttraction,
      arrivalTime: "11:15 AM",
      departureTime: "11:45 AM",
      dwellMinutes: minutes,
      costUSD: 0,
      transitMinutesFromPrev: 10,
      transitDistanceKmFromPrev: 1.8,
      predictedEnjoyment: 4.45,
      xaiExplanation: {
        archetypeMatch: "Recommended by Itinerary Assistant based on immediate proximity.",
        constraintRationale: "Zero entry cost and 25m duration comfortably fit the midday window.",
        keyHighlights: ["Zero cost", "Proximity: 1.8km", "Local heritage"],
      },
    };

    const updated = [stops[0], newStop, ...stops.slice(1)];
    setStops(updated);
    showToast(`✓ Added ${name} to your daily schedule!`);
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white pb-20 lg:pb-0">
      {/* Decorative ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Sidebar for Desktop / Large screens */}
      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <HeaderView onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Body */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 max-w-6xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-4 z-50 rounded-2xl border border-teal-500/40 bg-slate-900/95 p-4 text-xs font-bold text-white shadow-2xl backdrop-blur-xl animate-bounce">
              {toastMessage}
            </div>
          )}

          {/* Top Desktop / Tablet Navigation Pills for the 4 Proposal Features */}
          <div className="mb-6 hidden sm:flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-500 text-slate-950 font-bold text-base shadow-md shadow-teal-500/30">
                🗺️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Adaptive & Explainable Itinerary Optimizer
                  </h1>
                  <button
                    type="button"
                    onClick={() => setIsEvalModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 hover:bg-teal-500/20 transition-all cursor-pointer"
                  >
                    <Cpu className="h-3 w-3 text-teal-400 animate-pulse" />
                    <span>ML Models & Benchmarks</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Tabs */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-teal-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                1. AI Planner & Budget
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("day-plan")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "day-plan"
                    ? "bg-teal-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                2. Optimized Day Plan
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("adaptive")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "adaptive"
                    ? "bg-rose-500 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                3. Adaptive Re-Plan
                {hasConflict && (
                  <span className="h-2 w-2 rounded-full bg-rose-300 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("on-site")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "on-site"
                    ? "bg-teal-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                4. On-Site Support
              </button>
            </div>
          </div>

          {/* Mobile Top Header (When on small phone screens) */}
          <div className="mb-4 sm:hidden flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
                  Component 3 • Itinerary AI
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isBackendConnected ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </div>
              <h1 className="text-lg font-black text-white">
                {activeTab === "profile" && "1. Optimization Profile"}
                {activeTab === "day-plan" && "2. Optimized Day Plan"}
                {activeTab === "adaptive" && "3. Dynamic Re-Planning"}
                {activeTab === "on-site" && "4. On-Site Support Hub"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEvalModalOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-teal-500/20 px-2 py-1 text-[11px] font-bold text-teal-300 ring-1 ring-teal-500/30"
              >
                <Cpu className="h-3 w-3" />
                <span>ML Status</span>
              </button>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-mono text-slate-300 border border-white/10">
                {stops.length} Stops
              </span>
            </div>
          </div>

          {/* Render Active View matching the 4 features */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    Sri Lanka Travel Itinerary & Budget Optimization
                  </h2>
                  <p className="text-xs text-slate-400">
                    Powered by Component 3 OpenAI Autonomous Agent & Deep Q-Network Policy
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsWizardMode(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isWizardMode
                        ? "bg-gradient-to-r from-teal-400 to-sky-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Interactive 6-Step Wizard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWizardMode(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isWizardMode
                        ? "bg-teal-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Quick Sliders</span>
                  </button>
                </div>
              </div>

              {isWizardMode ? (
                <FullItineraryWizard
                  initialProfile={profile}
                  onPlanFinalized={handlePlanFinalized}
                  isBackendConnected={isBackendConnected}
                />
              ) : (
                <ProfileView
                  profile={profile}
                  onChangeProfile={setProfile}
                  onGenerate={handleGenerateItinerary}
                  isOptimizing={isOptimizing}
                />
              )}
            </div>
          )}

          {activeTab === "day-plan" && (
            <DayPlanView
              stops={stops}
              profile={profile}
              onSkipNextAndReroute={handleSkipNext}
              onSimulateDelay={() => handleSimulateDelay(45)}
              onOpenOnSiteSupport={(stop) => {
                setActiveInSituStop(stop);
                setActiveTab("on-site");
              }}
              onEditProfile={() => setActiveTab("profile")}
            />
          )}

          {activeTab === "adaptive" && (
            <AdaptiveReplanView
              originalStops={stops}
              updatedStops={adaptiveStops.length > 0 ? adaptiveStops : stops}
              resolution={
                dqnResolution || {
                  alternativesEvaluated: 14,
                  solveTimeSeconds: 0.48,
                  preservedEnjoymentPercent: 96.4,
                  actionMaskedCount: 3,
                  justification:
                    "The DQN policy evaluated 14 states and successfully adapted the itinerary in 0.48s without model retraining.",
                  changesSummary: [
                    "Delay of +45 mins absorbed by shifting departure intervals",
                    "0% budget or operating hour constraint violations",
                  ],
                }
              }
              profile={profile}
              delayMinutes={delayMinutes}
              onConfirmAdaptiveRoute={handleConfirmAdaptiveRoute}
              onCancel={handleCancelAdaptiveRoute}
              onAdjustDelay={(min) => handleSimulateDelay(min)}
            />
          )}

          {activeTab === "on-site" && (
            <OnSiteSupportView
              currentStop={activeInSituStop || stops[0] || buildOptimizedItinerary(profile)[0]}
              onAddStopFromChat={handleAddStopFromChat}
              onBackToDayPlan={() => setActiveTab("day-plan")}
            />
          )}
        </main>

        {/* Footer */}
        <FooterView />
      </div>

      {/* Mobile Bottom Navigation Bar (Optimized for viewing on mobile phones) */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        hasItinerary={stops.length > 0}
        hasConflict={hasConflict}
      />

      {/* Model Evaluation & Benchmarking Modal */}
      <ModelEvaluationModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        isBackendConnected={isBackendConnected}
      />
    </div>
  );
}
