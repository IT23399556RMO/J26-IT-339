"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HeaderView from "../components/header/header";
import SidebarView from "../components/sidebar/sidebar";
import FooterView from "../components/footer/footer";
import { useAuth } from "../context/AuthContext";
import { DestinationInputs } from "./destination/destination";
import { SAMPLE_DESTINATIONS } from "./destination/sample_destinations";

import {
  fetchSuitabilityScore,
  type SuitabilityResponse,
  type EnvironmentalFeatures,
  type MetricItemDetail,
  type DiurnalWindowSlot,
  type AlternativeDestination,
  InferenceEngineError,
} from "../services/suitabilityService";
import { AlternativeCarousel } from "./suggest/alternativeCarousel";
import { HistoryDrawer } from "./history/history";
import {
  fetchHistory,
  toggleSaveHistory,
  deleteHistoryItem,
  clearUnsavedHistory,
  type HistoryItem,
} from "../services/historyService";

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

/**
 * Computes dynamic 2x3 environmental parameter cards from Open-Meteo telemetry
 */
function computeEnvironmentalMetrics(features?: EnvironmentalFeatures): MetricItem[] {
  if (!features) {
    return [
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
  }

  const temp = features.temperature_2m;
  const apparentTemp = features.apparent_temperature;
  const humidity = features.relative_humidity_2m;
  const precip = features.precipitation;
  const cloudCover = features.cloud_cover;
  const windSpeed = features.wind_speed_10m;
  const radiation = features.shortwave_radiation;
  const pm25 = features.pm2_5;
  const pm10 = features.pm10;

  // 1. Heat
  let heatStatus = "Pleasant";
  let heatColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (temp >= 33) {
    heatStatus = "Extreme Heat";
    heatColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  } else if (temp >= 29) {
    heatStatus = "Warm";
    heatColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else if (temp < 18) {
    heatStatus = "Cool";
    heatColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
  }

  // 2. Rain
  let rainStatus = "Dry / Clear";
  let rainColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
  if (precip >= 5.0) {
    rainStatus = "Heavy Rain";
    rainColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  } else if (precip > 0.5) {
    rainStatus = "Rain Showers";
    rainColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else if (precip > 0.0) {
    rainStatus = "Light Drizzle";
    rainColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
  }

  // 3. Visibility (derived from cloud cover and pm2.5)
  const visibilityKm = Math.max(
    2,
    Math.min(16, Math.round(16 - cloudCover * 0.06 - pm25 * 0.08))
  );
  let visStatus = "Excellent";
  let visColor = "text-teal-400 bg-teal-500/10 border-teal-500/20";
  if (visibilityKm < 5) {
    visStatus = "Hazy / Low";
    visColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else if (visibilityKm < 10) {
    visStatus = "Moderate";
    visColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  }

  // 4. UV Index (solar radiation approximation)
  const uvIndex = Math.max(0, Math.min(12, Math.round(radiation / 85)));
  let uvStatus = "Low Risk";
  let uvColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (uvIndex >= 9) {
    uvStatus = "Extreme Alert";
    uvColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  } else if (uvIndex >= 6) {
    uvStatus = "High Alert";
    uvColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else if (uvIndex >= 3) {
    uvStatus = "Moderate";
    uvColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  }

  // 5. Wind Speed
  let windStatus = "Gentle Breeze";
  let windColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
  if (windSpeed >= 30) {
    windStatus = "Strong Gusts";
    windColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  } else if (windSpeed >= 18) {
    windStatus = "Moderate Breeze";
    windColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
  } else if (windSpeed < 6) {
    windStatus = "Calm";
    windColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  }

  // 6. Air Quality (US AQI approximation from PM2.5)
  const aqi = Math.round(
    pm25 <= 12
      ? (pm25 / 12) * 50
      : pm25 <= 35.4
      ? 50 + ((pm25 - 12) / 23.4) * 50
      : 100 + ((pm25 - 35.4) / 20) * 50
  );
  let aqiStatus = "Good";
  let aqiColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (aqi > 150) {
    aqiStatus = "Unhealthy";
    aqiColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  } else if (aqi > 100) {
    aqiStatus = "Sensitive Alert";
    aqiColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else if (aqi > 50) {
    aqiStatus = "Moderate";
    aqiColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  }

  return [
    {
      id: "heat",
      title: "Heat / Temp",
      value: `${temp.toFixed(1)}°C`,
      icon: "🌡️",
      status: heatStatus,
      statusColor: heatColor,
      detail: `Feels like ${apparentTemp.toFixed(1)}°C • Humidity ${Math.round(humidity)}%`,
    },
    {
      id: "rain",
      title: "Precipitation",
      value: `${precip.toFixed(1)} mm`,
      icon: "🌧️",
      status: rainStatus,
      statusColor: rainColor,
      detail:
        precip > 0
          ? `${precip.toFixed(1)} mm precipitation expected`
          : "0% probability in this window",
    },
    {
      id: "visibility",
      title: "Visibility",
      value: `${visibilityKm} km`,
      icon: "👁️",
      status: visStatus,
      statusColor: visColor,
      detail: `Cloud cover: ${Math.round(cloudCover)}% • Open vista`,
    },
    {
      id: "uv",
      title: "UV Index",
      value: `${uvIndex}`,
      icon: "☀️",
      status: uvStatus,
      statusColor: uvColor,
      detail:
        uvIndex >= 6
          ? "Intense solar radiation • Protection advised"
          : "Low to moderate solar exposure",
    },
    {
      id: "wind",
      title: "Wind Speed",
      value: `${windSpeed.toFixed(1)} km/h`,
      icon: "🍃",
      status: windStatus,
      statusColor: windColor,
      detail:
        windSpeed >= 20
          ? "Elevated wind shear • Take care on ridges"
          : "Steady gentle airflow across terrain",
    },
    {
      id: "aqi",
      title: "Air Quality (AQI)",
      value: `${aqi}`,
      icon: "🫁",
      status: aqiStatus,
      statusColor: aqiColor,
      detail: `PM2.5: ${pm25.toFixed(1)} µg/m³ • PM10: ${pm10.toFixed(1)} µg/m³`,
    },
  ];
}

/** Formats today's date and default 10:00 AM as default target ISO representation */
function getDefaultDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T10:00`;
}

export default function EnvironmentView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("08:00 - 10:00 AM");
  const { user, token } = useAuth();

  // Spatio-Temporal Configuration State (Sigiriya default: 7.9570, 80.7603)
  const [latitude, setLatitude] = useState<number>(7.957);
  const [longitude, setLongitude] = useState<number>(80.7603);
  const [targetDateTime, setTargetDateTime] = useState<string>(getDefaultDateTime);

  // Dynamic ML Suitability State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline503, setIsOffline503] = useState<boolean>(false);
  const [suitabilityData, setSuitabilityData] =
    useState<SuitabilityResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Search History & Watchlist State
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState<boolean>(false);
  const [savedHistory, setSavedHistory] = useState<HistoryItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [unsavedHistoryCount, setUnsavedHistoryCount] = useState<number>(0);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Load history records from backend
  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      setHistoryLoading(true);
      const data = await fetchHistory(token);
      setSavedHistory(data.saved);
      setRecentHistory(data.recent);
      setUnsavedHistoryCount(data.unsavedCount);
    } catch (err) {
      console.error("Failed to load search history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  // Initial load of history on mount / token change
  useEffect(() => {
    let ignore = false;
    if (!token) return;

    fetchHistory(token)
      .then((data) => {
        if (!ignore) {
          setSavedHistory(data.saved);
          setRecentHistory(data.recent);
          setUnsavedHistoryCount(data.unsavedCount);
        }
      })
      .catch((err) => {
        console.error("Failed to load search history:", err);
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  // History action handlers
  const handleToggleSaveHistory = async (id: string) => {
    if (!token) return;
    try {
      await toggleSaveHistory(id, token);
      await loadHistory();
    } catch (err) {
      console.error("Failed to toggle history save:", err);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!token) return;
    try {
      await deleteHistoryItem(id, token);
      await loadHistory();
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleClearUnsavedHistory = async () => {
    if (!token) return;
    try {
      await clearUnsavedHistory(token);
      await loadHistory();
    } catch (err) {
      console.error("Failed to clear unsaved history:", err);
    }
  };

  const handleSelectFromHistory = (item: HistoryItem) => {
    const matched = SAMPLE_DESTINATIONS.find(
      (d) => d.name.toLowerCase() === item.destination_name.toLowerCase(),
    );
    if (matched) {
      setLatitude(matched.latitude);
      setLongitude(matched.longitude);
    }
    if (item.target_date) {
      setTargetDateTime(
        item.target_date.includes("T")
          ? item.target_date
          : `${item.target_date}T10:00`,
      );
    }
    setHistoryDrawerOpen(false);
  };

  // Trigger evaluation whenever latitude, longitude, targetDateTime, or token changes
  useEffect(() => {
    let ignore = false;

    if (!token) {
      // Allow context restoration without indefinite spinning
      const timer = setTimeout(() => {
        if (!ignore) setLoading(false);
      }, 600);
      return () => {
        ignore = true;
        clearTimeout(timer);
      };
    }

    const matchedDest = SAMPLE_DESTINATIONS.find(
      (d) =>
        Math.abs(d.latitude - latitude) < 0.005 &&
        Math.abs(d.longitude - longitude) < 0.005,
    );
    const destName = matchedDest?.name;
    const destCat = matchedDest?.activityCategory;

    fetchSuitabilityScore(latitude, longitude, token, targetDateTime, destName, destCat)
      .then((data) => {
        if (!ignore) {
          setSuitabilityData(data);
          setError(null);
          setIsOffline503(false);
          setLoading(false);
          // Re-fetch search history to reflect new evaluation
          loadHistory();
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const is503 =
            (err instanceof InferenceEngineError && err.status === 503) ||
            (err instanceof Error &&
              err.message.toLowerCase().includes("inference engine unavailable"));

          setIsOffline503(is503);
          setError(
            is503
              ? "Inference Engine Unavailable (HTTP 503): Python FastAPI ML service is offline. Live atmospheric sensors are active."
              : err instanceof Error
              ? err.message
              : "Failed to evaluate suitability score.",
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [latitude, longitude, targetDateTime, token, refreshKey, loadHistory]);

  // Handler passed to destination inputs component
  const handleAnalyze = (lat: number, lon: number, datetime: string) => {
    setLoading(true);
    setLatitude(lat);
    setLongitude(lon);
    setTargetDateTime(datetime);
  };

  // Find destination name for active coordinates
  const currentDestinationName =
    SAMPLE_DESTINATIONS.find(
      (d) =>
        Math.abs(d.latitude - latitude) < 0.005 &&
        Math.abs(d.longitude - longitude) < 0.005,
    )?.name ?? "Custom Coordinates";

  // Dynamic circular progress values
  const dynamicScore = suitabilityData
    ? Math.round(suitabilityData.current_score ?? suitabilityData.suitability_score)
    : isOffline503
    ? 0
    : 84; // Mock fallback baseline

  const dynamicClass = (
    suitabilityData?.current_class ??
    suitabilityData?.suitability_class ??
    (isOffline503 ? "OFFLINE" : "EXCELLENT")
  ).toUpperCase();

  // Alternative fallback destinations for low-suitability situations (< 40)
  const fallback_options: AlternativeDestination[] =
    suitabilityData?.fallback_options && suitabilityData.fallback_options.length > 0
      ? suitabilityData.fallback_options
      : SAMPLE_DESTINATIONS
          .filter(
            (d) => d.name.toLowerCase() !== currentDestinationName.toLowerCase(),
          )
          .slice(0, 5)
          .map((d) => {
            const dLat = ((d.latitude - latitude) * Math.PI) / 180;
            const dLon = ((d.longitude - longitude) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos((latitude * Math.PI) / 180) *
                Math.cos((d.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
            const dist = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

            return {
              id: d.id,
              name: d.name,
              latitude: d.latitude,
              longitude: d.longitude,
              activityCategory: d.activityCategory,
              icon: d.icon,
              distanceKm: Math.max(8, dist),
              score: 84,
              suitabilityClass: "Excellent",
              climateZone: d.climateZone,
              description: d.description,
            };
          });

  // Circular gauge math (radius = 78, circumference ≈ 502.65)
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dynamicScore / 100) * circumference;

  const bestWindow = suitabilityData?.best_window ?? "08:00 - 10:00";

  // Use dynamic diurnal windows from backend if provided, otherwise fallback
  const activeDiurnalWindows: (TimeSlot | DiurnalWindowSlot)[] =
    suitabilityData?.diurnal_windows && suitabilityData.diurnal_windows.length > 0
      ? suitabilityData.diurnal_windows
      : diurnalWindows;

  const currentSlot =
    activeDiurnalWindows.find((w) => w.time === selectedSlot) ?? activeDiurnalWindows[1]!;

  // Dynamic atmospheric telemetry features and risk alerts from Open-Meteo
  const features = suitabilityData?.data?.features_used;

  // 2x3 CSS Grid Metrics: Bind directly to suitabilityData.metrics object
  const activeMetrics: (MetricItem | MetricItemDetail)[] = suitabilityData?.metrics
    ? [
        suitabilityData.metrics.heat,
        suitabilityData.metrics.rain,
        suitabilityData.metrics.visibility,
        suitabilityData.metrics.uv,
        suitabilityData.metrics.wind,
        suitabilityData.metrics.aqi,
      ]
    : computeEnvironmentalMetrics(features);

  // Dynamic alerts array from backend
  const activeAlerts: string[] = suitabilityData?.alerts ?? [];

  // Visual badge style mapping based on suitability class
  const getBadgeStyle = (sClass: string) => {
    switch (sClass) {
      case "EXCELLENT":
        return {
          container:
            "border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-emerald-500/10",
          dot: "bg-emerald-400",
        };
      case "GOOD":
        return {
          container:
            "border-sky-400/40 bg-sky-500/15 text-sky-300 shadow-sky-500/10",
          dot: "bg-sky-400",
        };
      case "MODERATE":
        return {
          container:
            "border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-amber-500/10",
          dot: "bg-amber-400",
        };
      case "POOR":
        return {
          container:
            "border-rose-400/40 bg-rose-500/15 text-rose-300 shadow-rose-500/10",
          dot: "bg-rose-400",
        };
      case "OFFLINE":
      default:
        return {
          container:
            "border-amber-500/40 bg-amber-500/20 text-amber-300 shadow-amber-500/10",
          dot: "bg-amber-400",
        };
    }
  };

  const badgeStyle = getBadgeStyle(dynamicClass);

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
                <nav
                  aria-label="Breadcrumb"
                  className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400"
                >
                  <Link
                    href="/home"
                    className="hover:text-teal-300 transition-colors"
                  >
                    Home
                  </Link>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">Environment</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-teal-300">Dashboard</span>
                </nav>
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Environmental Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Target Destination:{" "}
                  <span className="font-semibold text-teal-300">
                    {currentDestinationName}
                  </span>{" "}
                  <span className="text-xs text-slate-400 font-mono">
                    (Lat: {latitude}, Lon: {longitude})
                  </span>{" "}
                  • Target Time:{" "}
                  <span className="font-semibold text-teal-300">
                    {targetDateTime.replace("T", " at ")}
                  </span>
                  .
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setHistoryDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm hover:border-teal-400/30"
                  title="Open Search History & Watchlist"
                >
                  <span className="text-teal-400">🕒</span>
                  <span>Watchlist & History</span>
                  <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    {unsavedHistoryCount} / 10
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setRefreshKey((k) => k + 1);
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Re-run environmental inference"
                >
                  <svg
                    className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-400" : ""}`}
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
                  <span>Re-evaluate</span>
                </button>

                <Link
                  href={`/alternatives?datetime=${encodeURIComponent(targetDateTime)}&lat=${latitude}&lon=${longitude}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer shadow-sm"
                  title="Explore alternative travel destinations"
                >
                  <span>🧭 Alternatives</span>
                </Link>

                <Link
                  href="/environment/calibration"
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10"
                >
                  <span>⚙️ Calibrate Comfort</span>
                </Link>
              </div>
            </div>

            {/* Spatio-Temporal Configuration Panel */}
            <section aria-label="Spatio-Temporal Configuration">
              <DestinationInputs
                onAnalyze={handleAnalyze}
                loading={loading}
              />
            </section>

            {/* Offline / Error Advisory Banner */}
            {error && (
              <div
                role="alert"
                className="overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-amber-500/5 animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-lg">
                    ⚠️
                  </span>
                  <div>
                    <strong className="font-semibold block text-amber-100">
                      {isOffline503
                        ? "AI Inference Engine Unavailable (HTTP 503)"
                        : "Suitability Evaluation Notice"}
                    </strong>
                    <span className="text-amber-200/90">{error}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setRefreshKey((k) => k + 1);
                  }}
                  className="self-start sm:self-center shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3.5 py-1.5 font-bold text-amber-200 hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  Retry Evaluation
                </button>
              </div>
            )}

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

                {/* SVG Circular Gauge with Smooth Loading Skeleton */}
                <div className="relative my-4 flex items-center justify-center">
                  <svg
                    className={`h-52 w-52 sm:h-60 sm:w-60 transform -rotate-90 transition-all duration-700 ${
                      loading ? "animate-pulse opacity-70" : "opacity-100"
                    }`}
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
                    {!loading && !isOffline503 && (
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
                    )}

                    {/* Loading Indicator Spinner Arc */}
                    {loading && (
                      <circle
                        cx="95"
                        cy="95"
                        r={radius}
                        stroke="#2dd4bf"
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.75}
                        strokeLinecap="round"
                        fill="transparent"
                        className="animate-spin origin-center"
                      />
                    )}

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
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-400 border-t-transparent shadow-lg shadow-teal-500/20" />
                      <span className="mt-3 text-xs font-semibold text-teal-300 tracking-wide animate-pulse">
                        Evaluating Model...
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {currentDestinationName}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span
                        suppressHydrationWarning
                        className="text-5xl sm:text-6xl font-black tracking-tight text-white font-sans drop-shadow-sm"
                      >
                        {isOffline503 ? "—" : `${dynamicScore}%`}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-teal-300">
                        {isOffline503 ? "Model Offline" : "Overall Score"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Badge Underneath Circle */}
                {loading ? (
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-1.5 text-xs font-semibold text-slate-400 animate-pulse uppercase">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                    Calculating...
                  </div>
                ) : (
                  <div
                    className={`mt-1 inline-flex items-center gap-2 rounded-full border px-5 py-1.5 text-xs font-extrabold tracking-widest shadow-md uppercase transition-all ${badgeStyle.container}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${badgeStyle.dot} ${
                        isOffline503 ? "" : "animate-pulse"
                      }`}
                    />
                    {dynamicClass}
                  </div>
                )}

                <p className="mt-4 max-w-xs text-xs text-slate-300">
                  {isOffline503
                    ? "Inference engine is currently offline. Real-time atmospheric metrics remain accessible below."
                    : dynamicScore >= 80
                    ? "Biometeorological conditions align exceptionally well with your calibrated comfort preferences. Optimal for outdoor excursions."
                    : dynamicScore >= 60
                    ? "Favorable touring conditions with mild heat or wind factors. Suitable for standard sightseeing."
                    : "Sub-optimal biometeorological conditions detected. Consider adjusting schedule or visiting sheltered attractions."}
                </p>

                {/* Conditionally render AlternativeCarousel below the main Suitability Gauge ONLY if current_score < 40 */}
                {dynamicScore < 40 && !loading && (
                  <AlternativeCarousel
                    alternatives={fallback_options}
                    targetDateTime={targetDateTime}
                    currentLat={latitude}
                    currentLon={longitude}
                    onSelectAlternative={(alt) => {
                      setLoading(true);
                      setLatitude(alt.latitude);
                      setLongitude(alt.longitude);
                    }}
                  />
                )}

                {/* If score >= 40, provide a button to explore alternative locations directly from the gauge card */}
                {dynamicScore >= 40 && !loading && (
                  <div className="mt-4 w-full pt-3 border-t border-white/10">
                    <Link
                      href={`/alternatives?datetime=${encodeURIComponent(targetDateTime)}&lat=${latitude}&lon=${longitude}`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 py-2.5 px-3 text-xs font-semibold text-teal-300 hover:text-white transition-all cursor-pointer shadow-sm group"
                    >
                      <span>🧭 View Alternative Destinations</span>
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </div>
                )}
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
                    {activeMetrics.map((metric) => (
                      <article
                        key={metric.id}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:border-teal-400/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-teal-500/5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-2xl"
                            role="img"
                            aria-label={metric.title}
                          >
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
                    {bestWindow} Window
                  </span>
                </div>
              </div>

              {/* Time Window Interactive Cards */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {activeDiurnalWindows.map((slot) => {
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
                      ({currentSlot.condition} • Forecast {currentSlot.temp} •
                      UV Index: {currentSlot.uv})
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

            {/* Risk Alert Warning Banner (Yellow/Amber Safety Advisory) */}
            <aside
              role="alert"
              aria-label="Environmental Risk Alert"
              className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-orange-500/20 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/10 transition-all duration-300"
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
                        Environmental Safety & Risk Alerts
                      </h2>
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                        {activeAlerts.length > 0
                          ? `${activeAlerts.length} Active Alert${activeAlerts.length > 1 ? "s" : ""}`
                          : "Monitored"}
                      </span>
                    </div>

                    {activeAlerts.length > 0 ? (
                      <div className="mt-2 space-y-1.5">
                        {activeAlerts.map((alertText, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm font-medium text-amber-100/95 leading-relaxed"
                          >
                            <span className="text-amber-400 font-bold mt-0.5">•</span>
                            <span>{alertText}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-amber-100/90 leading-relaxed">
                        No critical atmospheric thresholds exceeded. Biometeorological conditions are favorable for outdoor tourism.
                      </p>
                    )}

                    <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                      {activeAlerts.some((a) => a.toLowerCase().includes("uv")) && (
                        <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                          🧴 SPF 50+ Sunscreen
                        </span>
                      )}
                      {activeAlerts.some((a) => a.toLowerCase().includes("heat")) && (
                        <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                          💧 Hydration Mandatory
                        </span>
                      )}
                      {activeAlerts.some(
                        (a) =>
                          a.toLowerCase().includes("mask") ||
                          a.toLowerCase().includes("air quality"),
                      ) && (
                        <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                          😷 Mask for Outdoor Exertion
                        </span>
                      )}
                      {activeAlerts.some(
                        (a) =>
                          a.toLowerCase().includes("rain") ||
                          a.toLowerCase().includes("precip"),
                      ) && (
                        <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                          ☔ Rain Protection Gear
                        </span>
                      )}
                      <span className="rounded-lg bg-black/30 border border-amber-500/20 px-2.5 py-1 text-amber-200">
                        ⭐ Optimal Window: {bestWindow}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/environment/calibration"
                  className="self-start sm:self-center shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/30"
                >
                  Adjust Preferences →
                </Link>
              </div>
            </aside>
          </div>
        </main>

        <FooterView />
      </div>

      {/* Persistent FIFO Search History & Watchlist Drawer */}
      <HistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        savedItems={savedHistory}
        recentItems={recentHistory}
        unsavedCount={unsavedHistoryCount}
        maxLimit={10}
        loading={historyLoading}
        onToggleSave={handleToggleSaveHistory}
        onDelete={handleDeleteHistory}
        onClearUnsaved={handleClearUnsavedHistory}
        onSelectDestination={handleSelectFromHistory}
      />
    </div>
  );
}
