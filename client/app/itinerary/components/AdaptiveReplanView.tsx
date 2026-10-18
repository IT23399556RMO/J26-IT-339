"use client";

import React, { useState } from "react";
import { DQNResolution, ItineraryStop, TouristProfile } from "../types";
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  Cpu,
  Layers,
  ChevronRight,
} from "lucide-react";

interface AdaptiveReplanViewProps {
  originalStops: ItineraryStop[];
  updatedStops: ItineraryStop[];
  resolution: DQNResolution;
  profile: TouristProfile;
  delayMinutes: number;
  onConfirmAdaptiveRoute: () => void;
  onCancel: () => void;
  onAdjustDelay: (minutes: number) => void;
}

export default function AdaptiveReplanView({
  originalStops,
  updatedStops,
  resolution,
  profile,
  delayMinutes,
  onConfirmAdaptiveRoute,
  onCancel,
  onAdjustDelay,
}: AdaptiveReplanViewProps) {
  const [selectedDelay, setSelectedDelay] = useState(delayMinutes);

  const handleSelectDelay = (min: number) => {
    setSelectedDelay(min);
    onAdjustDelay(min);
  };

  return (
    <div className="space-y-6">
      {/* 1. Schedule Conflict Alert Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/20 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              Schedule Conflict Detected
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
              Mid-Trip Delay of +{delayMinutes} Minutes Reported
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Unavoidable transit congestion or delayed departure will cause destination 4
              to breach its daily closing curfew if uncorrected.
            </p>
          </div>
        </div>

        {/* Delay Quick Selector */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Simulate Delay:</span>
          {[20, 35, 45, 60].map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => handleSelectDelay(min)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedDelay === min
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              +{min} mins
            </button>
          ))}
        </div>
      </div>

      {/* 2. RL Agent (DQN) Resolution Box */}
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              RL Agent Resolution (Deep Q-Network Policy)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-emerald-300 font-mono ring-1 ring-emerald-400/20">
              Latency: {resolution.solveTimeSeconds}s (Sub-Second)
            </span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-slate-200 font-mono">
              0% Retraining Required
            </span>
          </div>
        </div>

        {/* Resolution Statement */}
        <p className="text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
          {resolution.justification}
        </p>

        {/* Agent Metrics Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Alternatives Tested
            </span>
            <span className="text-xl font-bold text-teal-400">
              {resolution.alternativesEvaluated} States
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Enjoyment Preserved
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {resolution.preservedEnjoymentPercent}%
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Action-Masked (Blocked)
            </span>
            <span className="text-xl font-bold text-rose-400">
              {resolution.actionMaskedCount} Conflicts
            </span>
          </div>
        </div>

        {/* Action Masking Rules Explanation */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs space-y-2">
          <span className="font-bold text-teal-300 flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            Active DQN Constraint Masking Summary:
          </span>
          <ul className="space-y-1 text-slate-300">
            {resolution.changesSummary.map((change, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Updated Optimal Sequence (Timeline) */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <h3 className="text-base font-bold text-white mb-1">
          Updated Optimal Sequence
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          New arrival, dwell times, and departure schedules re-calculated dynamically
        </p>

        <div className="space-y-4">
          {updatedStops.map((stop, idx) => (
            <div
              key={stop.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {stop.attraction.name}
                  </h4>
                  <p className="text-xs text-teal-400 font-mono">
                    {stop.arrivalTime} – {stop.departureTime} ({stop.dwellMinutes}m dwell)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  Feasible
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Closes {stop.attraction.closingTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onConfirmAdaptiveRoute}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 p-4 text-base font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Confirm Adaptive Route 🔄</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          Keep Original
        </button>
      </div>
    </div>
  );
}
