"use client";

import Link from "next/link";
import type { AlternativeDestination } from "../../services/suitabilityService";

export interface AlternativeCarouselProps {
  alternatives: AlternativeDestination[];
  targetDateTime?: string;
  currentLat?: number;
  currentLon?: number;
  onSelectAlternative?: (destination: AlternativeDestination) => void;
}

/** Formats score badge colors based on suitability score */
function getScoreBadgeClass(score: number): { container: string; label: string } {
  if (score >= 80) {
    return {
      container: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
      label: "Excellent",
    };
  }
  if (score >= 60) {
    return {
      container: "border-teal-500/30 bg-teal-500/15 text-teal-300",
      label: "Good",
    };
  }
  if (score >= 40) {
    return {
      container: "border-amber-500/30 bg-amber-500/15 text-amber-300",
      label: "Moderate",
    };
  }
  return {
    container: "border-rose-500/30 bg-rose-500/15 text-rose-300",
    label: "Poor",
  };
}

export function AlternativeCarousel({
  alternatives = [],
  targetDateTime,
  currentLat,
  currentLon,
  onSelectAlternative,
}: AlternativeCarouselProps) {
  const displayItems = alternatives.slice(0, 5);

  if (displayItems.length === 0) {
    return null;
  }

  // Build query string for /alternatives navigation
  const queryParams = new URLSearchParams();
  if (targetDateTime) queryParams.set("datetime", targetDateTime);
  if (currentLat !== undefined) queryParams.set("lat", String(currentLat));
  if (currentLon !== undefined) queryParams.set("lon", String(currentLon));
  const alternativesUrl = `/alternatives?${queryParams.toString()}`;

  return (
    <div className="w-full mt-4 pt-4 border-t border-white/10">
      {/* Header Label */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
          <span>💡</span> Recommended Alternatives
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          Higher Suitability
        </span>
      </div>

      {/* 1 & 2. Horizontally scrollable container hiding scrollbars */}
      <div className="flex w-full items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayItems.map((alt) => {
          const badge = getScoreBadgeClass(alt.score);

          return (
            <div
              key={alt.id}
              onClick={() => onSelectAlternative?.(alt)}
              className="flex min-w-[9.5rem] max-w-[10rem] flex-1 shrink-0 flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-left backdrop-blur-md transition-all duration-200 hover:border-teal-400/50 hover:bg-slate-850 hover:scale-[1.02] cursor-pointer shadow-md"
              title={`${alt.name} - ${alt.score}% (${alt.suitabilityClass}) • Click to select`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xl" role="img" aria-label={alt.name}>
                  {alt.icon || "📍"}
                </span>

                {/* Score badge */}
                <span
                  className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${badge.container}`}
                >
                  {alt.score}%
                </span>
              </div>

              <div className="mt-2">
                <h4 className="truncate text-xs font-bold text-white group-hover:text-teal-300">
                  {alt.name}
                </h4>
                <p className="truncate text-[10px] text-slate-400">
                  {alt.activityCategory}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 & 4. Full-width button navigating to /alternatives */}
      <div className="mt-3 w-full">
        <Link
          href={alternativesUrl}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-xs font-bold text-teal-300 shadow-sm transition-all duration-200 hover:bg-teal-500/20 hover:border-teal-400/50 hover:shadow-teal-500/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>View Detailed Alternatives</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export default AlternativeCarousel;

