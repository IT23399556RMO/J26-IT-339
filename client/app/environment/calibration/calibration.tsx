"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import HeaderView from "../../components/header/header";
import SidebarView from "../../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import { useAuth } from "../../context/AuthContext";

type ExertionLevel = "Low" | "Moderate" | "High";

export default function CalibrationView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Biometeorological Preference States (Default: 50)
  const [thermalComfort, setThermalComfort] = useState<number>(50);
  const [rainTolerance, setRainTolerance] = useState<number>(50);
  const [sunUvPreference, setSunUvPreference] = useState<number>(50);
  const [windSensitivity, setWindSensitivity] = useState<number>(50);

  // Physical Exertion State (Default: 'Moderate')
  const [physicalExertion, setPhysicalExertion] =
    useState<ExertionLevel>("Moderate");

  // Visual submission feedback state
  const [lastLoggedVector, setLastLoggedVector] = useState<object | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Dynamic interpretation descriptors
  const getThermalDescription = (val: number) => {
    if (val < 35) return "Cold-preferring (Favors highland chill & cool climates)";
    if (val > 65) return "Heat-tolerant (Enjoys tropical warmth & sunshine)";
    return "Balanced / Neutral (Comfortable in mild 20°C–26°C ranges)";
  };

  const getRainDescription = (val: number) => {
    if (val < 35) return "Avoids rain (Strict blue-sky & dry weather preference)";
    if (val > 65) return "Rain-tolerant (Comfortable touring in mist or rainfall)";
    return "Moderate tolerance (Accepts occasional light showers)";
  };

  const getSunDescription = (val: number) => {
    if (val < 35) return "Highly sensitive (Prefers covered spots & shade)";
    if (val > 65) return "Low sensitivity (Enjoys high solar exposure)";
    return "Moderate sensitivity (Normal daylight & outdoor activities)";
  };

  const getWindDescription = (val: number) => {
    if (val < 35) return "Avoids wind (Prefers sheltered valleys & calm air)";
    if (val > 65) return "Wind-preferring (Enjoys brisk breezes & coastal winds)";
    return "Balanced tolerance (Comfortable in gentle breezes)";
  };

  const handleResetDefaults = () => {
    setThermalComfort(50);
    setRainTolerance(50);
    setSunUvPreference(50);
    setWindSensitivity(50);
    setPhysicalExertion("Moderate");
    setLastLoggedVector(null);
    setShowToast(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Construct structured preference vector JSON
    const structuredPreferenceVector = {
      timestamp: new Date().toISOString(),
      user: {
        id: user?.id ?? "anonymous-traveler",
        name: user?.name ?? "Guest",
        email: user?.email ?? "guest@travelmate.local",
      },
      decisionSupportStep: "Step 1: Calibration",
      preferenceVector: {
        thermalComfort: {
          value: Number(thermalComfort),
          normalized: Number((thermalComfort / 100).toFixed(2)),
          scale: "0=Cold-preferring, 100=Heat-tolerant",
          descriptor: getThermalDescription(thermalComfort),
        },
        rainTolerance: {
          value: Number(rainTolerance),
          normalized: Number((rainTolerance / 100).toFixed(2)),
          scale: "0=Avoids rain, 100=Rain-tolerant",
          descriptor: getRainDescription(rainTolerance),
        },
        sunUvPreference: {
          value: Number(sunUvPreference),
          normalized: Number((sunUvPreference / 100).toFixed(2)),
          scale: "0=Highly sensitive, 100=Low sensitivity",
          descriptor: getSunDescription(sunUvPreference),
        },
        windSensitivity: {
          value: Number(windSensitivity),
          normalized: Number((windSensitivity / 100).toFixed(2)),
          scale: "0=Avoids wind, 100=Wind-preferring",
          descriptor: getWindDescription(windSensitivity),
        },
        physicalExertionLevel: physicalExertion,
      },
      rawNormalizedArray: [
        Number((thermalComfort / 100).toFixed(2)),
        Number((rainTolerance / 100).toFixed(2)),
        Number((sunUvPreference / 100).toFixed(2)),
        Number((windSensitivity / 100).toFixed(2)),
        physicalExertion === "Low"
          ? 0.33
          : physicalExertion === "Moderate"
          ? 0.66
          : 1.0,
      ],
    };

    // Requirement: console.log the final structured preference vector JSON
    console.log(
      "🚀 [Tourism DSS] Structured Preference Vector (Step 1: Calibration):",
      structuredPreferenceVector,
    );
    console.log(JSON.stringify(structuredPreferenceVector, null, 2));

    setLastLoggedVector(structuredPreferenceVector);
    setShowToast(true);
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-[28rem] w-[28rem] rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <HeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb / Step Indicator */}
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <Link href="/home" className="hover:text-teal-300 transition-colors">
                Home
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">Environment Module</span>
              <span className="text-slate-600">/</span>
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 border border-teal-500/30 text-teal-300">
                Step 1: Calibration
              </span>
            </nav>

            {/* Header Section */}
            <header className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Personalize Your Climate Comfort
                  </h1>
                  <p className="mt-2 text-base text-slate-300">
                    Adjust your biometeorological sensitivities and activity level.
                    Our AI Decision Support System customizes destination suitability
                    indexes and optimal travel itineraries specifically for you.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title="Reset all values to 50 & Moderate"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset Defaults
                </button>
              </div>
            </header>

            {/* Notification Banner on Submission */}
            {showToast && (
              <aside
                role="status"
                aria-live="polite"
                className="mb-8 overflow-hidden rounded-2xl border border-teal-500/30 bg-teal-950/40 p-5 backdrop-blur-xl shadow-lg shadow-teal-500/10 animate-fade-in"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 text-lg">
                      ✓
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-teal-200">
                        Preferences Calibrated Successfully!
                      </h2>
                      <p className="mt-1 text-xs text-slate-300">
                        The structured preference vector JSON has been generated and
                        output to the browser developer console (
                        <code className="rounded bg-black/40 px-1 py-0.5 text-teal-300 font-mono">
                          console.log
                        </code>
                        ).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowToast(false)}
                    className="text-slate-400 hover:text-white transition-colors text-lg leading-none cursor-pointer"
                    aria-label="Close notification"
                  >
                    ×
                  </button>
                </div>

                {lastLoggedVector && (
                  <details className="mt-3 rounded-xl border border-white/10 bg-slate-950/80 p-3 text-xs">
                    <summary className="cursor-pointer font-medium text-teal-400 hover:text-teal-300">
                      View logged preference JSON vector
                    </summary>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-black/50 p-3 font-mono text-[11px] text-teal-200/90 leading-relaxed">
                      {JSON.stringify(lastLoggedVector, null, 2)}
                    </pre>
                  </details>
                )}
              </aside>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sliders Container */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Thermal Comfort */}
                <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 hover:bg-white/[0.07] sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20 text-xl text-orange-400 shadow-inner">
                        🌡️
                      </span>
                      <div>
                        <label
                          htmlFor="thermalComfort"
                          className="text-base font-semibold text-white"
                        >
                          Thermal Comfort
                        </label>
                        <p className="text-xs text-slate-400">
                          Temperature sensitivity & heat tolerance
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-300 font-mono">
                        {thermalComfort} / 100
                      </span>
                    </div>
                  </div>

                  {/* Slider Track with Custom Gradient */}
                  <div className="mt-6">
                    <input
                      id="thermalComfort"
                      name="thermalComfort"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={thermalComfort}
                      onChange={(e) => setThermalComfort(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #38bdf8 0%, #2dd4bf 50%, #f97316 ${thermalComfort}%, #1e293b ${thermalComfort}%, #1e293b 100%)`,
                      }}
                      className="h-3 w-full cursor-pointer appearance-none rounded-lg accent-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                    />

                    {/* Scale Labels */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span className="text-sky-300">0: Cold-preferring</span>
                      <span className="text-slate-500">50 (Neutral)</span>
                      <span className="text-orange-400">100: Heat-tolerant</span>
                    </div>
                  </div>

                  {/* Dynamic Status Pill */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-center text-xs text-slate-300">
                    <span className="font-semibold text-orange-300">Status: </span>
                    {getThermalDescription(thermalComfort)}
                  </div>
                </div>

                {/* 2. Rain Tolerance */}
                <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 hover:bg-white/[0.07] sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-xl text-cyan-300 shadow-inner">
                        🌧️
                      </span>
                      <div>
                        <label
                          htmlFor="rainTolerance"
                          className="text-base font-semibold text-white"
                        >
                          Rain Tolerance
                        </label>
                        <p className="text-xs text-slate-400">
                          Precipitation tolerance & wet weather
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300 font-mono">
                        {rainTolerance} / 100
                      </span>
                    </div>
                  </div>

                  {/* Slider Track with Custom Gradient */}
                  <div className="mt-6">
                    <input
                      id="rainTolerance"
                      name="rainTolerance"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={rainTolerance}
                      onChange={(e) => setRainTolerance(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #64748b 0%, #06b6d4 ${rainTolerance}%, #1e293b ${rainTolerance}%, #1e293b 100%)`,
                      }}
                      className="h-3 w-full cursor-pointer appearance-none rounded-lg accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />

                    {/* Scale Labels */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span className="text-slate-300">0: Avoids rain</span>
                      <span className="text-slate-500">50 (Neutral)</span>
                      <span className="text-cyan-300">100: Rain-tolerant</span>
                    </div>
                  </div>

                  {/* Dynamic Status Pill */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-center text-xs text-slate-300">
                    <span className="font-semibold text-cyan-300">Status: </span>
                    {getRainDescription(rainTolerance)}
                  </div>
                </div>

                {/* 3. Sun / UV Preference */}
                <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 hover:bg-white/[0.07] sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-xl text-amber-300 shadow-inner">
                        ☀️
                      </span>
                      <div>
                        <label
                          htmlFor="sunUvPreference"
                          className="text-base font-semibold text-white"
                        >
                          Sun / UV Preference
                        </label>
                        <p className="text-xs text-slate-400">
                          UV index sensitivity & direct sun
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300 font-mono">
                        {sunUvPreference} / 100
                      </span>
                    </div>
                  </div>

                  {/* Slider Track with Custom Gradient */}
                  <div className="mt-6">
                    <input
                      id="sunUvPreference"
                      name="sunUvPreference"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={sunUvPreference}
                      onChange={(e) => setSunUvPreference(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #fbbf24 ${sunUvPreference}%, #1e293b ${sunUvPreference}%, #1e293b 100%)`,
                      }}
                      className="h-3 w-full cursor-pointer appearance-none rounded-lg accent-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    />

                    {/* Scale Labels */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span className="text-purple-300">0: Highly sensitive</span>
                      <span className="text-slate-500">50 (Neutral)</span>
                      <span className="text-amber-300">100: Low sensitivity</span>
                    </div>
                  </div>

                  {/* Dynamic Status Pill */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-center text-xs text-slate-300">
                    <span className="font-semibold text-amber-300">Status: </span>
                    {getSunDescription(sunUvPreference)}
                  </div>
                </div>

                {/* 4. Wind Sensitivity */}
                <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 hover:bg-white/[0.07] sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/20 text-xl text-teal-300 shadow-inner">
                        🍃
                      </span>
                      <div>
                        <label
                          htmlFor="windSensitivity"
                          className="text-base font-semibold text-white"
                        >
                          Wind Sensitivity
                        </label>
                        <p className="text-xs text-slate-400">
                          Wind chill & gust preference
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-300 font-mono">
                        {windSensitivity} / 100
                      </span>
                    </div>
                  </div>

                  {/* Slider Track with Custom Gradient */}
                  <div className="mt-6">
                    <input
                      id="windSensitivity"
                      name="windSensitivity"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={windSensitivity}
                      onChange={(e) => setWindSensitivity(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #64748b 0%, #10b981 ${windSensitivity}%, #1e293b ${windSensitivity}%, #1e293b 100%)`,
                      }}
                      className="h-3 w-full cursor-pointer appearance-none rounded-lg accent-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                    />

                    {/* Scale Labels */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span className="text-slate-300">0: Avoids wind</span>
                      <span className="text-slate-500">50 (Neutral)</span>
                      <span className="text-teal-300">100: Wind-preferring</span>
                    </div>
                  </div>

                  {/* Dynamic Status Pill */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-center text-xs text-slate-300">
                    <span className="font-semibold text-teal-300">Status: </span>
                    {getWindDescription(windSensitivity)}
                  </div>
                </div>
              </div>

              {/* Physical Exertion Level Section */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl text-emerald-300 shadow-inner">
                      🏃
                    </span>
                    <div>
                      <label
                        htmlFor="physicalExertion"
                        className="text-lg font-semibold text-white"
                      >
                        Physical Exertion Level
                      </label>
                      <p className="text-xs text-slate-400">
                        Calibrates how metabolic heat and stamina impact weather tolerance
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative min-w-[200px]">
                    <select
                      id="physicalExertion"
                      name="physicalExertion"
                      value={physicalExertion}
                      onChange={(e) =>
                        setPhysicalExertion(e.target.value as ExertionLevel)
                      }
                      className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900/90 px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 cursor-pointer"
                    >
                      <option value="Low" className="bg-slate-900 text-white">
                        Low (Leisurely)
                      </option>
                      <option value="Moderate" className="bg-slate-900 text-white">
                        Moderate (Balanced)
                      </option>
                      <option value="High" className="bg-slate-900 text-white">
                        High (Intense)
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Exertion Guide Cards */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div
                    onClick={() => setPhysicalExertion("Low")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      physicalExertion === "Low"
                        ? "border-teal-400 bg-teal-500/10 shadow-md shadow-teal-500/10"
                        : "border-white/5 bg-slate-900/40 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Low</span>
                      {physicalExertion === "Low" && (
                        <span className="text-xs text-teal-300 font-bold">Active</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Relaxed walks, scenic drives, museum visits, minimal elevation gain.
                    </p>
                  </div>

                  <div
                    onClick={() => setPhysicalExertion("Moderate")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      physicalExertion === "Moderate"
                        ? "border-teal-400 bg-teal-500/10 shadow-md shadow-teal-500/10"
                        : "border-white/5 bg-slate-900/40 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        Moderate (Default)
                      </span>
                      {physicalExertion === "Moderate" && (
                        <span className="text-xs text-teal-300 font-bold">Active</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Walking tours, gentle trails, city exploration with moderate stairs.
                    </p>
                  </div>

                  <div
                    onClick={() => setPhysicalExertion("High")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      physicalExertion === "High"
                        ? "border-teal-400 bg-teal-500/10 shadow-md shadow-teal-500/10"
                        : "border-white/5 bg-slate-900/40 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">High</span>
                      {physicalExertion === "High" && (
                        <span className="text-xs text-teal-300 font-bold">Active</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Mountain trekking, cycling, extensive backcountry hiking & sports.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse items-center justify-between gap-4 pt-4 sm:flex-row">
                <Link
                  href="/home"
                  className="w-full sm:w-auto text-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  ← Back to Dashboard
                </Link>

                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-sky-500 to-teal-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] hover:shadow-teal-500/40 focus-visible:outline-2 focus-visible:outline-teal-400 active:scale-100 cursor-pointer"
                >
                  <span>Save Profile & Continue</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}

