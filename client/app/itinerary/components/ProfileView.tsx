"use client";

import React, { useState } from "react";
import { TouristProfile, TravelerType, TravelPace } from "../types";
import { SRI_LANKA_ATTRACTIONS } from "../data/attractions";
import {
  Users,
  User,
  Heart,
  Clock,
  DollarSign,
  Sparkles,
  Compass,
  Sliders,
  Check,
  Plus,
  X,
  ShieldCheck,
  MapPin,
  Cpu,
} from "lucide-react";

interface ProfileViewProps {
  profile: TouristProfile;
  onChangeProfile: (updated: TouristProfile) => void;
  onGenerate: () => void;
  isOptimizing: boolean;
}

const CATEGORY_OPTIONS = [
  { id: "Heritage", label: "Heritage & History", icon: "🏛️" },
  { id: "Wildlife", label: "Wildlife & Safaris", icon: "🐘" },
  { id: "Beaches", label: "Beaches & Coastal", icon: "🏖️" },
  { id: "Nature", label: "Scenic Nature & Tea", icon: "🍃" },
  { id: "Cultural", label: "Cultural Traditions", icon: "🛕" },
  { id: "Culinary", label: "Authentic Food", icon: "🍛" },
  { id: "Adventure", label: "Adventure & Hiking", icon: "🥾" },
];

const COUNTRY_OPTIONS = [
  "United Kingdom 🇬🇧",
  "Germany 🇩🇪",
  "France 🇫🇷",
  "Australia 🇦🇺",
  "United States 🇺🇸",
  "India 🇮🇳",
  "Canada 🇨🇦",
  "Netherlands 🇳🇱",
];

export default function ProfileView({
  profile,
  onChangeProfile,
  onGenerate,
  isOptimizing,
}: ProfileViewProps) {
  const [selectedWaypointInput, setSelectedWaypointInput] = useState("");

  const updateField = <K extends keyof TouristProfile>(key: K, value: TouristProfile[K]) => {
    onChangeProfile({
      ...profile,
      [key]: value,
    });
  };

  const toggleCategory = (catId: string) => {
    const exists = profile.categories.includes(catId);
    const updated = exists
      ? profile.categories.filter((c) => c !== catId)
      : [...profile.categories, catId];
    updateField("categories", updated);
  };

  const addWaypoint = (attractionId: string) => {
    if (!attractionId || profile.mandatoryWaypoints.includes(attractionId)) return;
    updateField("mandatoryWaypoints", [...profile.mandatoryWaypoints, attractionId]);
    setSelectedWaypointInput("");
  };

  const removeWaypoint = (attractionId: string) => {
    updateField(
      "mandatoryWaypoints",
      profile.mandatoryWaypoints.filter((id) => id !== attractionId)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500/20 via-sky-500/10 to-transparent p-5 sm:p-6 border border-teal-500/30 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/15 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/30">
              <Cpu className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
              Supervised Random Forest & DQN Optimizer
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
              Itinerary Optimization Profile
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Configured with 33,394 TripAdvisor reviews, VADER sentiment polarity, and
              OpenRouteService transit matrix for 77 Sri Lankan attractions.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs">
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-slate-200 font-mono">
              Target MAE ≤ 0.70
            </span>
            <span className="rounded-lg bg-emerald-500/20 text-emerald-300 px-2.5 py-1 font-mono ring-1 ring-emerald-500/30">
              0% Violation Rate
            </span>
          </div>
        </div>
      </div>

      {/* 1. Traveller Classification */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Traveller Classification
          </label>
          <span className="text-xs text-slate-400">Select your travel party</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {/* Solo */}
          <button
            type="button"
            onClick={() => updateField("travelerType", "solo")}
            className={`flex flex-col items-center justify-center rounded-2xl p-4 transition-all duration-200 border cursor-pointer ${
              profile.travelerType === "solo"
                ? "border-teal-400 bg-teal-500/20 text-white shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/40"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
              <User className="h-5 w-5 text-teal-300" />
            </div>
            <span className="mt-2.5 text-sm font-semibold">Solo</span>
            <span className="text-[11px] text-slate-400">Independent Explorer</span>
          </button>

          {/* Couple */}
          <button
            type="button"
            onClick={() => updateField("travelerType", "couple")}
            className={`flex flex-col items-center justify-center rounded-2xl p-4 transition-all duration-200 border cursor-pointer ${
              profile.travelerType === "couple"
                ? "border-teal-400 bg-teal-500/20 text-white shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/40"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
              <Users className="h-5 w-5 text-teal-300" />
            </div>
            <span className="mt-2.5 text-sm font-semibold">Couple</span>
            <span className="text-[11px] text-slate-400">Romantic & Culture</span>
          </button>

          {/* Family */}
          <button
            type="button"
            onClick={() => updateField("travelerType", "family")}
            className={`flex flex-col items-center justify-center rounded-2xl p-4 transition-all duration-200 border cursor-pointer ${
              profile.travelerType === "family"
                ? "border-teal-400 bg-teal-500/20 text-white shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/40"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
              <Heart className="h-5 w-5 text-teal-300" />
            </div>
            <span className="mt-2.5 text-sm font-semibold">Family</span>
            <span className="text-[11px] text-slate-400">Comfort & Low Fatigue</span>
          </button>
        </div>

        {/* Origin Country Selector */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-300">
            Home Origin (Weights Sentiment & Review Polarity)
          </label>
          <select
            value={profile.originCountry}
            onChange={(e) => updateField("originCountry", e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-teal-400 focus:outline-none"
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Preference Categories */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Travel Preferences & Themes
          </label>
          <span className="text-xs text-slate-400">
            {profile.categories.length} selected
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2.5">
          {CATEGORY_OPTIONS.map((cat) => {
            const active = profile.categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                  active
                    ? "border-teal-400 bg-teal-400/20 text-teal-200 shadow-md shadow-teal-500/10"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {active && <Check className="h-3.5 w-3.5 text-teal-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Optimization Constraints */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Optimization Constraints
          </label>
          <p className="text-xs text-slate-400">
            Enforced by OpenAI Gym action-masking so the RL agent avoids violations.
          </p>
        </div>

        {/* Time Window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Clock className="h-4 w-4 text-teal-400" />
              Daily Time Window
            </span>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block mb-1">Start Time</span>
                <input
                  type="time"
                  value={profile.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
                />
              </div>
              <span className="text-slate-500 mt-4">to</span>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block mb-1">Curfew End</span>
                <input
                  type="time"
                  value={profile.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Budget Limit Slider */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Max Entrance Fee Budget
              </span>
              <span className="text-sm font-bold text-emerald-400">
                ${profile.maxBudgetUSD} USD
              </span>
            </div>
            <div className="mt-3">
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={profile.maxBudgetUSD}
                onChange={(e) => updateField("maxBudgetUSD", Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$20 (Budget)</span>
                <span>$85 (Optimal)</span>
                <span>$200 (Luxury)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Pace */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Trip Pace Intensity
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { id: "relaxed", label: "Relaxed", sub: "1–2 Places", icon: "🌿" },
                { id: "balanced", label: "Balanced", sub: "3–4 Places", icon: "⚖️" },
                { id: "packed", label: "Packed", sub: "5+ Places", icon: "⚡" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField("pace", item.id as TravelPace)}
                className={`rounded-2xl p-3 text-center transition-all border cursor-pointer ${
                  profile.pace === item.id
                    ? "border-teal-400 bg-teal-500/20 text-white ring-1 ring-teal-400"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="text-base">{item.icon}</div>
                <div className="text-xs font-bold mt-1">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Mandatory Waypoints */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Mandatory Waypoints
          </label>
          <span className="text-xs text-slate-400">
            Pinned stops the agent must prioritize
          </span>
        </div>

        {/* Waypoint Select / Add */}
        <div className="mt-3 flex gap-2">
          <select
            value={selectedWaypointInput}
            onChange={(e) => setSelectedWaypointInput(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-teal-400 focus:outline-none"
          >
            <option value="">Select a must-visit attraction...</option>
            {SRI_LANKA_ATTRACTIONS.map((att) => (
              <option key={att.id} value={att.id} className="bg-slate-900 text-white">
                {att.name} (${att.foreignFeeUSD} • {att.region})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addWaypoint(selectedWaypointInput)}
            disabled={!selectedWaypointInput}
            className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/30 transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Pin
          </button>
        </div>

        {/* Pinned Chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.mandatoryWaypoints.map((wpId) => {
            const att = SRI_LANKA_ATTRACTIONS.find((a) => a.id === wpId);
            if (!att) return null;
            return (
              <span
                key={wpId}
                className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200 ring-1 ring-teal-400/30"
              >
                <MapPin className="h-3 w-3 text-teal-400" />
                {att.name}
                <button
                  type="button"
                  onClick={() => removeWaypoint(wpId)}
                  className="rounded-full p-0.5 hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isOptimizing}
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-400 via-sky-400 to-teal-400 p-4 text-base font-extrabold text-slate-950 shadow-xl shadow-teal-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
        >
          {isOptimizing ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              <span>Optimizing with DQN Policy & Sentiment Regressor...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Generate AI Itinerary (Sub-Second RL Solve)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
