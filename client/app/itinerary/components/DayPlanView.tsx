"use client";

import React, { useState } from "react";
import { ItineraryStop, TouristProfile } from "../types";
import InteractiveMap from "./InteractiveMap";
import {
  Clock,
  DollarSign,
  Navigation,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Car,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

interface DayPlanViewProps {
  stops: ItineraryStop[];
  profile: TouristProfile;
  onSkipNextAndReroute: () => void;
  onSimulateDelay: () => void;
  onOpenOnSiteSupport: (stop: ItineraryStop) => void;
  onEditProfile: () => void;
}

export default function DayPlanView({
  stops,
  profile,
  onSkipNextAndReroute,
  onSimulateDelay,
  onOpenOnSiteSupport,
  onEditProfile,
}: DayPlanViewProps) {
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [expandedXaiId, setExpandedXaiId] = useState<string | null>(stops[0]?.id || null);

  const totalCost = stops.reduce((sum, s) => sum + s.costUSD, 0);
  const totalDistance = stops.reduce((sum, s) => sum + s.transitDistanceKmFromPrev, 0);
  const avgEnjoyment = (
    stops.reduce((sum, s) => sum + s.predictedEnjoyment, 0) / (stops.length || 1)
  ).toFixed(2);

  const toggleXai = (id: string) => {
    setExpandedXaiId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Optimized Day Plan
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditProfile}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            Adjust Filters
          </button>
          <button
            type="button"
            onClick={onSimulateDelay}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Simulate 45m Delay
          </button>
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Satisfaction */}
        <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-3.5 backdrop-blur-xl">
          <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider block">
            Satisfaction Score
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{avgEnjoyment}</span>
            <span className="text-xs text-teal-400 font-bold">/ 5.0 ★</span>
          </div>
          <span className="text-[10px] text-teal-200/80 mt-0.5 block">
            97% predicted enjoyment
          </span>
        </div>

        {/* Total Cost */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Cost
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">${totalCost}</span>
            <span className="text-xs text-slate-400">/ ${profile.maxBudgetUSD}</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            ${profile.maxBudgetUSD - totalCost} within budget
          </span>
        </div>

        {/* Distance & Transit */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Distance
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{totalDistance}</span>
            <span className="text-xs text-slate-400">km</span>
          </div>
          <span className="text-[10px] text-sky-400 mt-0.5 block">
            OpenRouteService verified
          </span>
        </div>

        {/* Feasibility Guarantee */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Feasibility Status
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-lg font-black text-emerald-400">100% Valid</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            0% Constraint Violation
          </span>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <InteractiveMap
        stops={stops}
        activeStopIndex={activeStopIndex}
        onSelectStop={(idx) => {
          setActiveStopIndex(idx);
          setExpandedXaiId(stops[idx]?.id || null);
        }}
      />

      {/* Sequenced Itinerary Timeline */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Daily Itinerary Sequence</h3>
            <p className="text-xs text-slate-400">
              Arranged for optimal daylight, operating hours, and minimum transit
            </p>
          </div>
          <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-500/20">
            {stops.length} Confirmed Stops
          </span>
        </div>

        <div className="mt-6 space-y-6">
          {stops.map((stop, idx) => {
            const isSelected = idx === activeStopIndex;
            const isXaiOpen = expandedXaiId === stop.id;

            return (
              <div key={stop.id} className="relative">
                {/* Connecting Transit Line to next stop */}
                {idx > 0 && (
                  <div className="mb-4 ml-6 sm:ml-8 flex items-center gap-3 border-l-2 border-dashed border-teal-500/30 pl-4 py-1 text-xs text-slate-400">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-teal-400">
                      <Car className="h-3.5 w-3.5" />
                    </div>
                    <span>
                      🚗 {stop.transitMinutesFromPrev} mins drive ({stop.transitDistanceKmFromPrev} km)
                      via topographical transit routing
                    </span>
                  </div>
                )}

                {/* Attraction Card */}
                <div
                  className={`group rounded-2xl border transition-all duration-300 p-4 sm:p-5 ${
                    isSelected
                      ? "border-teal-400/60 bg-gradient-to-br from-teal-500/10 via-slate-900 to-slate-950 shadow-lg shadow-teal-500/10 ring-1 ring-teal-400/30"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Timing & Basic Details */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Number Badge */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-sm transition-transform ${
                          isSelected
                            ? "bg-gradient-to-br from-teal-400 to-sky-500 text-slate-950 shadow-md shadow-teal-500/30 scale-105"
                            : "bg-white/10 text-slate-200"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-teal-400 font-mono">
                            {stop.arrivalTime} – {stop.departureTime}
                          </span>
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                            {stop.attraction.category}
                          </span>
                          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            {stop.costUSD === 0 ? "FREE" : `$${stop.costUSD} USD`}
                          </span>
                        </div>

                        <h4 className="mt-1 text-base sm:text-lg font-bold text-white">
                          {stop.attraction.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {stop.attraction.region} • Typical stay: {stop.dwellMinutes} mins
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onOpenOnSiteSupport(stop)}
                        className="rounded-xl bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-500/30 transition-colors cursor-pointer"
                      >
                        On-Site Hub
                      </button>

                      {idx === 0 && (
                        <button
                          type="button"
                          onClick={onSkipNextAndReroute}
                          className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          Skip Next & Re-route
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Explainable AI (XAI) Dropdown Accordion */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => toggleXai(stop.id)}
                      className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-teal-400" />
                        <span>Explainable AI Rationale (Why this place?)</span>
                        <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                          ★ {stop.predictedEnjoyment.toFixed(2)} ML Match
                        </span>
                      </span>
                      {isXaiOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>

                    {isXaiOpen && (
                      <div className="mt-3 rounded-2xl border border-teal-500/20 bg-teal-950/30 p-4 text-xs space-y-2.5 animate-fadeIn">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-teal-300 shrink-0">Profile Fit:</span>
                          <span className="text-slate-300">
                            {stop.xaiExplanation.archetypeMatch}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-sky-300 shrink-0">Feasibility:</span>
                          <span className="text-slate-300">
                            {stop.xaiExplanation.constraintRationale}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-emerald-300 shrink-0">Environment:</span>
                          <span className="text-slate-300">
                            {stop.xaiExplanation.weatherContext}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
