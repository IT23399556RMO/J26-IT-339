"use client";

import React, { useState } from "react";
import { ItineraryStop } from "../types";
import { MapPin, Navigation, Info, Clock, DollarSign } from "lucide-react";

interface InteractiveMapProps {
  stops: ItineraryStop[];
  activeStopIndex: number;
  onSelectStop: (index: number) => void;
}

export default function InteractiveMap({
  stops,
  activeStopIndex,
  onSelectStop,
}: InteractiveMapProps) {
  const [showSatellite, setShowSatellite] = useState(false);

  // Sri Lanka boundary bounds approx:
  // Lat: 5.9 to 9.8 (span ~3.9)
  // Lng: 79.5 to 81.9 (span ~2.4)
  // Map SVG coordinates: ViewBox 0 0 500 650
  const latToY = (lat: number) => {
    const minLat = 5.8;
    const maxLat = 9.8;
    return 600 - ((lat - minLat) / (maxLat - minLat)) * 540;
  };

  const lngToX = (lng: number) => {
    const minLng = 79.5;
    const maxLng = 82.0;
    return ((lng - minLng) / (maxLng - minLng)) * 420 + 40;
  };

  // Convert stops to points
  const points = stops.map((stop) => ({
    x: lngToX(stop.attraction.lng),
    y: latToY(stop.attraction.lat),
    stop,
  }));

  // Create path line through points
  const pathString = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const activeStop = stops[activeStopIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
      {/* Top Map Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Geospatial Route Map
            </h4>
            <p className="text-[11px] text-teal-400 font-mono">
              OpenStreetMap & ORS Transit Network • 77 Nodes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSatellite(!showSatellite)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              showSatellite
                ? "bg-teal-500 text-slate-950 shadow-sm"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            {showSatellite ? "🛰️ Terrain" : "🗺️ Vector"}
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <svg
          viewBox="0 0 500 650"
          className="h-full w-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sri Lanka simplified outline silhouette */}
          <path
            d="M 230 60 
               C 270 90, 310 160, 320 220 
               C 335 290, 360 380, 330 460 
               C 310 510, 270 560, 240 575 
               C 200 585, 170 560, 155 520 
               C 130 450, 140 370, 150 310 
               C 160 230, 180 150, 205 85 
               Z"
            fill={showSatellite ? "#0f231e" : "#0d1829"}
            stroke="#14b8a6"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="transition-colors duration-500 opacity-60"
          />

          {/* Major Provincial/Terrain accents */}
          <ellipse cx="245" cy="360" rx="45" ry="35" fill="#14b8a6" opacity="0.08" />
          <text x="245" y="365" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600" letterSpacing="2">
            CENTRAL HIGHLANDS
          </text>
          <text x="235" y="180" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600" letterSpacing="1.5">
            CULTURAL TRIANGLE
          </text>
          <text x="210" y="555" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600" letterSpacing="1">
            SOUTHERN COAST
          </text>

          {/* Route path line */}
          {points.length > 1 && (
            <>
              {/* Outer pulsing glow path */}
              <path
                d={pathString}
                fill="none"
                stroke="#14b8a6"
                strokeWidth="5"
                opacity="0.3"
                filter="url(#glow)"
              />
              {/* Active dashed route line */}
              <path
                d={pathString}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </>
          )}

          {/* Location pins */}
          {points.map((pt, idx) => {
            const isSelected = idx === activeStopIndex;
            return (
              <g
                key={pt.stop.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
                onClick={() => onSelectStop(idx)}
              >
                {/* Ping animation on active */}
                {isSelected && (
                  <circle
                    r="18"
                    fill="#14b8a6"
                    opacity="0.4"
                    className="animate-ping"
                  />
                )}
                {/* Outer shadow */}
                <circle
                  r={isSelected ? "14" : "11"}
                  fill={isSelected ? "#0d9488" : "#1e293b"}
                  stroke={isSelected ? "#2dd4bf" : "#64748b"}
                  strokeWidth="2.5"
                />
                {/* Inner badge number */}
                <text
                  textAnchor="middle"
                  dy="4.5"
                  fill="#ffffff"
                  fontSize={isSelected ? "12" : "10"}
                  fontWeight="bold"
                >
                  {idx + 1}
                </text>
                {/* Label */}
                <text
                  x="16"
                  y="4"
                  fill={isSelected ? "#2dd4bf" : "#cbd5e1"}
                  fontSize="10"
                  fontWeight={isSelected ? "bold" : "normal"}
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {pt.stop.attraction.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Compass Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>GPS Active</span>
        </div>
      </div>

      {/* Selected Stop Details Drawer */}
      {activeStop && (
        <div className="border-t border-white/10 bg-slate-950/90 p-4 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[11px] font-bold text-slate-950">
                  {activeStopIndex + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  {activeStop.attraction.category} • Stop {activeStopIndex + 1} of {stops.length}
                </span>
              </div>
              <h5 className="mt-1 text-sm sm:text-base font-bold text-white">
                {activeStop.attraction.name}
              </h5>
              <p className="text-xs text-slate-400 line-clamp-1">
                {activeStop.attraction.region}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-400/10 px-2.5 py-0.5 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/30">
                ★ {activeStop.predictedEnjoyment.toFixed(2)} ML Score
              </span>
              <p className="mt-1 text-[11px] text-slate-400">
                {activeStop.dwellMinutes}m Dwell Time
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-center text-xs">
            <div className="rounded-xl bg-white/5 p-2">
              <span className="text-[10px] text-slate-400">Schedule</span>
              <p className="font-semibold text-slate-200">
                {activeStop.arrivalTime} - {activeStop.departureTime}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-2">
              <span className="text-[10px] text-slate-400">Fee (USD)</span>
              <p className="font-semibold text-emerald-400">
                {activeStop.costUSD === 0 ? "FREE" : `$${activeStop.costUSD}`}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-2">
              <span className="text-[10px] text-slate-400">Transit In</span>
              <p className="font-semibold text-sky-400">
                {activeStop.transitMinutesFromPrev}m ({activeStop.transitDistanceKmFromPrev}km)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
