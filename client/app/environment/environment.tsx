"use client";

import { useState } from "react";
import Link from "next/link";
import HeaderView from "../components/header/header";
import SidebarView from "../components/sidebar/sidebar";
import FooterView from "../components/footer/footer";
import { useAuth } from "../context/AuthContext";

type TimeSlot = {
  time: string;
  label: string;
  score: number;
  isBest?: boolean;
  temp: string;
  uv: number;
  condition: string;
};

const diurnalWindows: TimeSlot[] = [
  {
    time: "06:00 - 08:00 AM",
    label: "Early Morning",
    score: 78,
    temp: "24°C",
    uv: 2,
    condition: "Cool & Crisp",
  },
  {
    time: "08:00 - 10:00 AM",
    label: "Optimal Morning",
    score: 92,
    isBest: true,
    temp: "26°C",
    uv: 4,
    condition: "Ideal Comfort",
  },
  {
    time: "10:00 - 12:00 PM",
    label: "Late Morning",
    score: 81,
    temp: "29°C",
    uv: 7,
    condition: "Rising UV",
  },
  {
    time: "12:00 - 02:00 PM",
    label: "Midday Peak",
    score: 62,
    temp: "31°C",
    uv: 9,
    condition: "Peak Solar Heat",
  },
  {
    time: "02:00 - 04:00 PM",
    label: "Afternoon",
    score: 74,
    temp: "30°C",
    uv: 6,
    condition: "Warm Breeze",
  },
  {
    time: "04:00 - 06:00 PM",
    label: "Late Afternoon",
    score: 88,
    temp: "27°C",
    uv: 3,
    condition: "Golden Hour",
  },
];

type MetricItem = {
  id: string;
  title: string;
  value: string;
  unit?: string;
  icon: string;
  status: string;
  statusColor: string;
  detail: string;
};

const environmentalMetrics: MetricItem[] = [
  {
    id: "heat",
    title: "Heat / Temp",
    value: "28°C",
    icon: "🌡️",
    status: "Pleasant",
    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    detail: "Feels like 29°C • Humidity 62%",
  },
  {
    id: "rain",
    title: "Precipitation",
    value: "0.0 mm",
    icon: "🌧️",
    status: "Dry / Clear",
    statusColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    detail: "0% probability throughout the day",
  },
  {
    id: "visibility",
    title: "Visibility",
    value: "12 km",
    icon: "👁️",
    status: "Excellent",
    statusColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    detail: "Unrestricted panoramic vista",
  },
  {
    id: "uv",
    title: "UV Index",
    value: "6",
    icon: "☀️",
    status: "High Alert",
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    detail: "Peak UV window: 11:30 AM - 02:00 PM",
  },
  {
    id: "wind",
    title: "Wind Speed",
    value: "14 km/h",
    icon: "🍃",
    status: "Gentle Breeze",
    statusColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    detail: "North-Easterly • Gusts up to 18 km/h",
  },
  {
    id: "aqi",
    title: "Air Quality (AQI)",
    value: "38",
    icon: "🫁",
    status: "Good",
    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    detail: "PM2.5: 8 µg/m³ • Clean fresh air",
  },
];

export default function EnvironmentView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("08:00 - 10:00 AM");
  const { user } = useAuth();

  // Circular gauge math for 84% score
  const score = 84;
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const currentSlot =
    diurnalWindows.find((w) => w.time === selectedSlot) ?? diurnalWindows[1];

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white">
      {/* Decorative background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <HeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Environmental Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Real-time biometeorological analytics, climate comfort index,
                  and optimal travel windows for{" "}
                  <span className="font-semibold text-teal-300">
                    Colombo, Sri Lanka
                  </span>
                  .
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  href="/environment/calibration"
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10"
                >
                  <span>⚙️ Calibrate Comfort</span>
                </Link>
              </div>
            </div>

            {/* Primary Hero Section: Circular Suitability Score + Overview */}
            <section
              aria-label="Climate Suitability Overview"
              className="grid gap-6 lg:grid-cols-12"
            >
              {/* 1. Primary Circular Progress Score Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 lg:col-span-5 flex flex-col items-center justify-center text-center shadow-2xl">
                {/* Background glow accent */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl"
                />

                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Climate Suitability Index
                </span>

                {/* SVG Circular Gauge */}
                <div className="relative my-4 flex items-center justify-center">
                  <svg
                    className="h-52 w-52 sm:h-60 sm:w-60 transform -rotate-90"
                    viewBox="0 0 190 190"
                  >
                    {/* Background Track */}
                    <circle
                      cx="95"
                      cy="95"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="14"
                      className="text-slate-800/80"
                      fill="transparent"
                    />
                    {/* Foreground Gradient Track */}
                    <circle
                      cx="95"
                      cy="95"
                      r={radius}
                      stroke="url(#suitabilityGradient)"
                      strokeWidth="14"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient
                        id="suitabilityGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="60%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Centered Score & Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-sans drop-shadow-sm">
                      {score}%
                    </span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-teal-300">
                      Overall Score
                    </span>
                  </div>
                </div>

                {/* Status Badge Underneath */}
                <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-5 py-1.5 text-xs font-extrabold tracking-widest text-emerald-300 shadow-md shadow-emerald-500/10 uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  EXCELLENT
                </div>

                <p className="mt-4 max-w-xs text-xs text-slate-300">
                  Biometeorological conditions align exceptionally well with your
                  calibrated comfort preferences. Optimal for walking tours &
                  sightseeing.
                </p>
              </div>

              {/* 2. Metric Grid: 2x3 CSS Grid */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      Live Environmental Parameters
                    </h2>
                    <span className="text-xs text-slate-400">
                      Live Feed • Sensor Synced
                    </span>
                  </div>

                  {/* 2x3 Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                    {environmentalMetrics.map((metric) => (
                      <article
                        key={metric.id}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:border-teal-400/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-teal-500/5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl" role="img" aria-label={metric.title}>
                            {metric.icon}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${metric.statusColor}`}
                          >
                            {metric.status}
                          </span>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs font-medium text-slate-400">
                            {metric.title}
                          </p>
                          <p className="mt-0.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            {metric.value}
                          </p>
                          <p className="mt-1.5 text-[11px] text-slate-400 truncate">
                            {metric.detail}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Sub-card quick personalized insight */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-transparent p-4 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🎯</span>
                    <span>
                      Personalized for traveler{" "}
                      <strong suppressHydrationWarning className="text-white">
                        {user?.name || "Explorer"}
                      </strong>{" "}
                      (Moderate exertion profile).
                    </span>
                  </div>
                  <Link
                    href="/environment/calibration"
                    className="text-teal-300 font-semibold hover:text-teal-200 underline ml-2 whitespace-nowrap"
                  >
                    Adjust
                  </Link>
                </div>
              </div>
            </section>

            {/* Diurnal Optimization (Best Window) Section */}
            <section
              aria-label="Diurnal Optimization Best Windows"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Diurnal Optimization — Best Travel Windows
                    </h2>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300">
                    Hourly weather and thermal stress modeling to identify your
                    prime exploration windows throughout the day.
                  </p>
                </div>

                {/* Highlighted Top Recommendation Pill */}
                <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-sky-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-teal-500/25 self-start sm:self-auto">
                  <span>⭐ TOP RECOMMENDATION:</span>
                  <span className="rounded-lg bg-black/20 px-2 py-0.5 text-slate-950 font-black">
                    08-10 AM (92% Match)
                  </span>
                </div>
              </div>

              {/* Time Window Interactive Cards */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {diurnalWindows.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                        slot.isBest
                          ? "border-teal-400/80 bg-teal-500/15 shadow-md shadow-teal-500/20 ring-1 ring-teal-400/40"
                          : isSelected
                          ? "border-sky-400 bg-sky-500/10 shadow-sm"
                          : "border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      {/* Best Window Badge Pill */}
                      {slot.isBest && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-400 px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-sm">
                            ★ Best Window
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="block text-xs font-semibold text-white">
                          {slot.time.replace(":00", "").replace(":00", "")}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {slot.label}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-white">
                            {slot.score}%
                          </span>
                          <span className="text-xs text-slate-300 font-mono">
                            {slot.temp}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-teal-300 truncate">
                          {slot.condition}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Window Detail Callout */}
              <div className="mt-5 rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌤️</span>
                  <div>
                    <span className="font-semibold text-white">
                      Selected Slot: {currentSlot.time}
                    </span>
                    <span className="text-slate-400 ml-2">
                      ({currentSlot.condition} • Forecast {currentSlot.temp} • UV Index: {currentSlot.uv})
                    </span>
                  </div>
                </div>
                <div className="text-teal-300 font-medium">
                  {currentSlot.isBest
                    ? "Maximum biometeorological comfort for outdoor touring."
                    : currentSlot.score > 80
                    ? "Favorable touring conditions with mild exertion recommended."
                    : "Caution: Increased solar heat; consider indoor attractions."}
                </div>
              </div>
            </section>

            {/* Risk Alert Warning Banner (Yellow/Amber) */}
            <aside
              role="alert"
              aria-label="Environmental Risk Alert"
              className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-orange-500/20 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/10"
            >
              {/* Background ambient glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl"
              />

              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20 text-2xl text-amber-300 shadow-inner">
                    ⚠️
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-amber-200">
                        Environmental Risk Alert
                      </h2>
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                        UV Caution
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-medium text-amber-100/90 leading-relaxed">
                      Extreme UV detected: Apply SPF 50+ sunscreen every 2 hours
                      and wear a hat.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                        🧴 SPF 50+ Broad Spectrum
                      </span>
                      <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                        👒 Wide-brimmed Hat
                      </span>
                      <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                        🕶️ UV400 Sunglasses
                      </span>
                      <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                        ☂️ Seek Shade: 11:30 AM - 02:00 PM
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/environment/calibration"
                  className="self-start sm:self-center shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/30"
                >
                  Adjust UV Sensitivity →
                </Link>
              </div>
            </aside>
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}

