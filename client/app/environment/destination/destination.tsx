"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderView from "../../components/header/header";
import SidebarView from "../../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";

export interface DestinationOption {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  icon: string;
  climateZone: string;
  description: string;
}

export const SAMPLE_DESTINATIONS: DestinationOption[] = [
  {
    id: "sigiriya",
    name: "Sigiriya Ancient Rock Fortress",
    latitude: 7.957,
    longitude: 80.7603,
    region: "Matale / Central Province",
    icon: "🏰",
    climateZone: "Dry Zone / Cultural Triangle",
    description:
      "Ancient 5th-century palace citadel rising 200m above the jungle plains. Features historic frescoes, water gardens, and panoramic views.",
  },
  {
    id: "yala",
    name: "Yala National Park Safari",
    latitude: 6.367,
    longitude: 81.517,
    region: "Hambantota / Southern Province",
    icon: "🐆",
    climateZone: "Arid Coastal / Semi-arid Thorn Forest",
    description:
      "Premier wildlife sanctuary renowned for the world's highest leopard density, herds of wild Asian elephants, and diverse coastal lagoons.",
  },
  {
    id: "temple_of_tooth",
    name: "Temple of the Tooth Relic",
    latitude: 7.2936,
    longitude: 80.6413,
    region: "Kandy / Central Province",
    icon: "🛕",
    climateZone: "Wet Highland / Mountain Valley",
    description:
      "Sacred Buddhist shrine in the Royal Palace complex of Kandy, nestled in misty tropical hills and holding the relic of the tooth of the Buddha.",
  },
];

export interface DestinationInputsProps {
  /**
   * Callback invoked when the user submits or updates spatio-temporal parameters.
   * @param lat - Latitude number
   * @param lon - Longitude number
   * @param datetime - ISO string (YYYY-MM-DDTHH:MM)
   */
  onAnalyze?: (lat: number, lon: number, datetime: string) => void;

  /** Initial selected destination ID */
  initialDestinationId?: string;

  /** Loading state during active AI evaluation */
  loading?: boolean;
}

/** Formats today's date as YYYY-MM-DD for standard HTML5 date inputs */
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Reusable Horizontal Spatio-Temporal Configuration Bar.
 * Can be embedded directly inside the Environmental Dashboard.
 */
export function DestinationInputs({
  onAnalyze,
  initialDestinationId = "sigiriya",
  loading = false,
}: DestinationInputsProps) {
  const router = useRouter();
  const [selectedDestId, setSelectedDestId] =
    useState<string>(initialDestinationId);
  const [date, setDate] = useState<string>(getTodayString);
  const [time, setTime] = useState<string>("10:00");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dest =
      SAMPLE_DESTINATIONS.find((d) => d.id === selectedDestId) ||
      SAMPLE_DESTINATIONS[0];

    const targetDateTime = `${date}T${time}`;

    if (onAnalyze) {
      onAnalyze(dest.latitude, dest.longitude, targetDateTime);
    } else {
      // Standalone fallback: route to environment dashboard with parameters
      router.push("/environment");
    }
  };

  const currentDestination =
    SAMPLE_DESTINATIONS.find((d) => d.id === selectedDestId) ||
    SAMPLE_DESTINATIONS[0];

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-slate-900/80 p-3 sm:p-4 backdrop-blur-xl shadow-2xl shadow-teal-500/5">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center"
      >
        {/* Input 1: Destination Location Select */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-teal-400/40 lg:col-span-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>📍</span>
            <label htmlFor="destination-select">Destination Location</label>
          </div>

          <div className="relative mt-1">
            <select
              id="destination-select"
              name="destination"
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="w-full appearance-none bg-transparent pr-8 text-sm font-bold text-white outline-none cursor-pointer"
            >
              {SAMPLE_DESTINATIONS.map((dest) => (
                <option
                  key={dest.id}
                  value={dest.id}
                  data-lat={dest.latitude}
                  data-lon={dest.longitude}
                  className="bg-slate-900 text-white py-1"
                >
                  {dest.icon} {dest.name} ({dest.region})
                </option>
              ))}
            </select>

            {/* Custom select arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-slate-400">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Lat: {currentDestination.latitude}</span>
            <span>Lon: {currentDestination.longitude}</span>
          </div>
        </div>

        {/* Input 2: Target Date */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-teal-400/40 lg:col-span-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>📅</span>
            <label htmlFor="destination-date">Target Date</label>
          </div>
          <input
            id="destination-date"
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer [color-scheme:dark]"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Select arrival date
          </p>
        </div>

        {/* Input 3: Target Time */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-teal-400/40 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>⏰</span>
            <label htmlFor="destination-time">Target Time</label>
          </div>
          <input
            id="destination-time"
            name="time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer [color-scheme:dark]"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Hourly forecast
          </p>
        </div>

        {/* Button: Analyze Suitability */}
        <div className="sm:col-span-2 lg:col-span-2 flex items-center">
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-sky-500 to-teal-500 font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] hover:shadow-teal-500/40 focus-visible:outline-2 focus-visible:outline-teal-400 active:scale-100 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <svg
                  className="h-4 w-4 animate-spin text-slate-950"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide">
                <span>Analyze</span>
                <span>Suitability</span>
                <span aria-hidden="true">→</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Standalone Presenter Component for the Destination Configuration Route:
 * /environment/destination
 */
export default function DestinationView() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState<string>("sigiriya");

  const handleAnalyze = (lat: number, lon: number, datetime: string) => {
    // Navigate to the main dashboard with selected spatio-temporal coordinates
    router.push(
      `/environment?lat=${lat}&lon=${lon}&time=${encodeURIComponent(datetime)}`,
    );
  };

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
          <div className="mx-auto max-w-5xl space-y-8">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400"
            >
              <Link
                href="/home"
                className="hover:text-teal-300 transition-colors"
              >
                Home
              </Link>
              <span className="text-slate-600">/</span>
              <Link
                href="/environment"
                className="hover:text-teal-300 transition-colors"
              >
                Environment
              </Link>
              <span className="text-slate-600">/</span>
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 border border-teal-500/30 text-teal-300">
                Destination Configuration
              </span>
            </nav>

            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Spatio-Temporal Configuration
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                Choose your destination location and target arrival window. Our
                system pulls exact hourly biometeorological data from Open-Meteo
                to evaluate climate suitability.
              </p>
            </div>

            {/* Horizontal Booking-Style Configuration Bar */}
            <section aria-label="Spatio-Temporal Inputs">
              <DestinationInputs
                initialDestinationId={selectedDestId}
                onAnalyze={handleAnalyze}
              />
            </section>

            {/* Sample Destination Highlights */}
            <section aria-label="Available Destinations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Available Sample Destinations
                </h2>
                <span className="text-xs text-slate-400">
                  3 Pre-Calibrated Locations
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {SAMPLE_DESTINATIONS.map((dest) => {
                  const isSelected = selectedDestId === dest.id;
                  return (
                    <div
                      key={dest.id}
                      onClick={() => setSelectedDestId(dest.id)}
                      className={`relative flex flex-col justify-between rounded-3xl border p-5 backdrop-blur-xl transition-all cursor-pointer ${
                        isSelected
                          ? "border-teal-400 bg-teal-500/15 shadow-xl shadow-teal-500/10 ring-1 ring-teal-400/40"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">{dest.icon}</span>
                          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                            {dest.climateZone.split("/")[0].trim()}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-bold text-white">
                          {dest.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {dest.region}
                        </p>
                        <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                          {dest.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Lat: {dest.latitude}</span>
                        <span>Lon: {dest.longitude}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Direct Link to Environmental Dashboard */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🌿</span>
                <span>
                  Ready to view the live dashboard and suitability scores?
                </span>
              </div>
              <Link
                href="/environment"
                className="font-bold text-teal-300 hover:text-teal-200 underline"
              >
                Go to Dashboard →
              </Link>
            </div>
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}
