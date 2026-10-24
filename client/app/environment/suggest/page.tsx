"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import HeaderView from "../../components/header/header";
import SidebarView from "../../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAlternativeDestinations,
  type AlternativeDestination,
} from "../../services/suitabilityService";

function AlternativesContent() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const targetDateTime = searchParams.get("datetime") || searchParams.get("targetDateTime") || "";
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const currentLat = latParam ? Number(latParam) : 7.957;
  const currentLon = lonParam ? Number(lonParam) : 80.7603;

  const [alternatives, setAlternatives] = useState<AlternativeDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchAlternativeDestinations(currentLat, currentLon, token)
      .then((data) => {
        if (!ignore) {
          setAlternatives(data.slice(0, 5));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load alternatives:", err);
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLat, currentLon, token]);

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return {
        bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
        bar: "bg-emerald-400",
        label: "Excellent",
      };
    }
    if (score >= 60) {
      return {
        bg: "bg-teal-500/15 border-teal-500/30 text-teal-300",
        bar: "bg-teal-400",
        label: "Good",
      };
    }
    if (score >= 40) {
      return {
        bg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
        bar: "bg-amber-400",
        label: "Moderate",
      };
    }
    return {
      bg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      bar: "bg-rose-400",
      label: "Poor",
    };
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-[30rem] w-[30rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <HeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header: Back to Dashboard */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Alternative Travel Destinations
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Microclimate-aware recommendations when your primary destination encounters unfavorable weather.
                </p>
                {targetDateTime && (
                  <p className="mt-1 text-xs text-teal-400 font-mono">
                    Target Window: {targetDateTime.replace("T", " at ")}
                  </p>
                )}
              </div>

              {/* 1. Dedicated Header: Back to Dashboard */}
              <Link
                href="/environment"
                className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition-all hover:bg-white/10 hover:text-white hover:border-teal-400/40"
              >
                ← Back to Dashboard
              </Link>
            </div>

            {/* List of 5 Locations */}
            {loading ? (
              <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-400">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-400 border-t-transparent shadow-lg shadow-teal-500/20" />
                <span className="text-sm font-medium">
                  Evaluating atmospheric conditions across alternative microclimates...
                </span>
              </div>
            ) : alternatives.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-400">
                <div className="text-4xl mb-3">📍</div>
                <h3 className="text-base font-bold text-white">
                  No Alternatives Found
                </h3>
                <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
                  Unable to find nearby alternative locations for the requested coordinates.
                </p>
                <Link
                  href="/environment"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              /* 3. Render 5 locations as large, detailed vertical cards in flex/grid column */
              <div className="flex flex-col gap-4">
                {alternatives.map((alt, index) => {
                  const badge = getScoreBadge(alt.score);

                  return (
                    <article
                      key={alt.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-teal-500/40 hover:bg-slate-900/90"
                    >
                      {/* Subtle ranking indicator */}
                      <span className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[11px] font-black text-slate-500 font-mono">
                        #{index + 1}
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* 4. Destination Name, Icon, Activity Category, Distance */}
                        <div className="flex items-start gap-4">
                          <span
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-3xl shadow-inner"
                            role="img"
                            aria-label={alt.name}
                          >
                            {alt.icon || "📍"}
                          </span>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-teal-300 transition-colors">
                                {alt.name}
                              </h3>

                              {/* Activity Category */}
                              <span className="rounded-lg bg-teal-500/20 border border-teal-500/30 px-2.5 py-0.5 text-xs font-semibold text-teal-300">
                                {alt.activityCategory}
                              </span>

                              {alt.climateZone && (
                                <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">
                                  {alt.climateZone}
                                </span>
                              )}
                            </div>

                            {/* Distance in KM */}
                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                              <span className="flex items-center gap-1 font-semibold text-teal-400 font-mono">
                                <span>🚗</span> {alt.distanceKm} km from current target
                              </span>
                            </div>

                            {alt.description && (
                              <p className="mt-2 text-xs text-slate-300 max-w-xl leading-relaxed">
                                {alt.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 4. Exact ML Suitability Score & Class */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 shrink-0 gap-2">
                          <div
                            className={`flex flex-col items-end rounded-2xl border px-4 py-2 ${badge.bg}`}
                          >
                            <span className="text-2xl font-black tracking-tight">
                              {alt.score}%
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              {alt.suitabilityClass || badge.label}
                            </span>
                          </div>

                          {/* Quick Navigate Button */}
                          <Link
                            href={`/environment`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-teal-500 hover:text-slate-950 hover:border-teal-400 transition-all cursor-pointer"
                          >
                            <span>Explore on Dashboard</span>
                            <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </div>

                      {/* Suitability Progress Bar */}
                      <div className="mt-4 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${badge.bar}`}
                          style={{ width: `${Math.min(100, Math.max(5, alt.score))}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}

export default function AlternativesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
        </div>
      }
    >
      <AlternativesContent />
    </Suspense>
  );
}
