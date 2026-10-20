"use client";

import React, { useState, useEffect, useRef } from "react";
import { ItineraryStop } from "../types";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Layers,
  Key,
  Compass,
  Check,
  ChevronRight,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface InteractiveMapProps {
  stops: ItineraryStop[];
  activeStopIndex: number;
  onSelectStop: (index: number) => void;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMap?: () => void;
  }
}

// Dark/Cyber theme custom styles for Google Maps JS API
const GOOGLE_MAP_DARK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export default function InteractiveMap({
  stops,
  activeStopIndex,
  onSelectStop,
}: InteractiveMapProps) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain">("roadmap");
  const [isOverview, setIsOverview] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [inputKey, setInputKey] = useState<string>("");
  const [isSdkLoaded, setIsSdkLoaded] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Load API key from env or localStorage
  useEffect(() => {
    const savedKey =
      localStorage.getItem("travelmate_google_maps_key") ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "";
    setApiKey(savedKey);
    setInputKey(savedKey);
  }, []);

  // Dynamically load Google Maps JavaScript API if API Key is present
  useEffect(() => {
    if (!apiKey || typeof window === "undefined") return;

    if (window.google?.maps) {
      setIsSdkLoaded(true);
      return;
    }

    const scriptId = "google-maps-js-sdk";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsSdkLoaded(true);
      };
      script.onerror = () => {
        console.warn("Failed to load Google Maps SDK with provided API Key. Falling back to Google Embed.");
        setIsSdkLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      setIsSdkLoaded(true);
    }
  }, [apiKey]);

  // Initialize and Update Google Maps JS SDK when loaded
  useEffect(() => {
    if (!isSdkLoaded || !window.google?.maps || !mapContainerRef.current) return;

    const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };
    const activeStop = stops[activeStopIndex];

    const targetCenter =
      !isOverview && activeStop
        ? { lat: activeStop.attraction.lat, lng: activeStop.attraction.lng }
        : sriLankaCenter;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: targetCenter,
        zoom: activeStop && !isOverview ? 11 : 8,
        mapTypeId: mapType,
        styles: mapType === "roadmap" ? GOOGLE_MAP_DARK_STYLES : [],
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
      });
    } else {
      mapInstanceRef.current.setMapTypeId(mapType);
      mapInstanceRef.current.setOptions({
        styles: mapType === "roadmap" ? GOOGLE_MAP_DARK_STYLES : [],
      });
      mapInstanceRef.current.panTo(targetCenter);
      mapInstanceRef.current.setZoom(activeStop && !isOverview ? 11 : 8);
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const pathCoordinates: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    // Add numbered markers for each itinerary stop
    stops.forEach((stop, idx) => {
      const pos = { lat: stop.attraction.lat, lng: stop.attraction.lng };
      pathCoordinates.push(pos);
      bounds.extend(pos);

      const isSelected = idx === activeStopIndex;

      // Custom SVG Pin Badge
      const marker = new window.google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        title: `${idx + 1}. ${stop.attraction.name}`,
        label: {
          text: String(idx + 1),
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold",
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 16 : 12,
          fillColor: isSelected ? "#0d9488" : "#0284c7",
          fillOpacity: 1,
          strokeColor: isSelected ? "#2dd4bf" : "#ffffff",
          strokeWeight: isSelected ? 3 : 2,
        },
        zIndex: isSelected ? 999 : idx + 1,
      });

      marker.addListener("click", () => {
        onSelectStop(idx);
        setIsOverview(false);
      });

      markersRef.current.push(marker);
    });

    // Draw route polyline between consecutive stops
    if (pathCoordinates.length > 1) {
      polylineRef.current = new window.google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: "#14b8a6",
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });
    }

    if (isOverview && stops.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, 50);
    }
  }, [isSdkLoaded, stops, activeStopIndex, mapType, isOverview]);

  const activeStop = stops[activeStopIndex];

  // Fallback Google Maps Embed URL generator (Direct Google Maps iframe of Sri Lanka)
  const getGoogleEmbedUrl = () => {
    const query =
      !isOverview && activeStop
        ? `${activeStop.attraction.lat},${activeStop.attraction.lng}`
        : "Sri+Lanka";
    const typeCode = mapType === "satellite" ? "k" : mapType === "terrain" ? "p" : "m";
    const zoomLevel = !isOverview && activeStop ? "13" : "8";
    return `https://maps.google.com/maps?q=${query}&t=${typeCode}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  };

  // Google Maps external directions link
  const getGoogleDirectionsUrl = () => {
    if (stops.length === 0) return "https://www.google.com/maps/place/Sri+Lanka";
    const waypoints = stops
      .map((s) => `${s.attraction.lat},${s.attraction.lng}`)
      .join("/");
    return `https://www.google.com/maps/dir/${waypoints}`;
  };

  const handleSaveApiKey = () => {
    const trimmed = inputKey.trim();
    setApiKey(trimmed);
    localStorage.setItem("travelmate_google_maps_key", trimmed);
    setShowKeyModal(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
      {/* Top Map Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Compass className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold tracking-wide text-white">
                Sri Lanka Geospatial Google Map
              </h4>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live GPS
              </span>
            </div>
            <p className="text-[11px] text-teal-300 font-mono">
              {stops.length} Optimized Stops • Sri Lanka Transit Corridor
            </p>
          </div>
        </div>

        {/* Map View & Layer Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Map Type Buttons */}
          <div className="flex rounded-xl bg-slate-900/80 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setMapType("roadmap")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                mapType === "roadmap"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                mapType === "satellite"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType("terrain")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                mapType === "terrain"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🏔️ Terrain
            </button>
          </div>

          {/* Full Island Overview Toggle */}
          <button
            type="button"
            onClick={() => setIsOverview(!isOverview)}
            title={isOverview ? "Zoom to Active Stop" : "Fit Full Sri Lanka Island"}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold border transition-all ${
              isOverview
                ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Island View</span>
          </button>

          {/* Open in Official Google Maps Directions */}
          <a
            href={getGoogleDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Turn-by-Turn Route in Google Maps App"
            className="flex items-center gap-1 rounded-xl bg-teal-500/10 px-2.5 py-1.5 text-xs font-semibold text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Open in Maps</span>
          </a>

          {/* API Key Modal Button */}
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            title="Configure Google Maps API Key"
            className={`flex items-center gap-1 rounded-xl p-1.5 text-xs border transition-all ${
              apiKey
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-white/5 text-slate-400 border-white/10 hover:text-slate-200"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stop Waypoints Navigation Carousel */}
      {stops.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 bg-slate-950/40 px-3 py-2 scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
            Route:
          </span>
          {stops.map((s, idx) => {
            const isSelected = idx === activeStopIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectStop(idx);
                  setIsOverview(false);
                }}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs shrink-0 transition-all ${
                  isSelected
                    ? "bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20 scale-105"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    isSelected ? "bg-slate-950 text-teal-400" : "bg-teal-400/20 text-teal-300"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate max-w-[110px]">{s.attraction.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Google Map Canvas */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-950">
        {/* If Google Maps JS SDK is loaded and initialized, render native container */}
        {isSdkLoaded && apiKey ? (
          <div ref={mapContainerRef} className="h-full w-full" />
        ) : (
          /* Google Maps Interactive Embed of Sri Lanka */
          <div className="relative h-full w-full">
            <iframe
              title="Google Map of Sri Lanka"
              src={getGoogleEmbedUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full filter contrast-[1.05]"
            />

            {/* Quick Map Watermark Overlay */}
            <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] font-mono text-slate-400 backdrop-blur border border-white/10">
              <MapPin className="h-3 w-3 text-teal-400" />
              <span>Sri Lanka ({activeStop ? activeStop.attraction.name : "Island Overview"})</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Stop Details Footer Drawer */}
      {activeStop && (
        <div className="border-t border-white/10 bg-slate-950/95 p-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[11px] font-bold text-slate-950">
                  {activeStopIndex + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  {activeStop.attraction.category} • Stop {activeStopIndex + 1} of {stops.length}
                </span>
              </div>
              <h5 className="mt-1 text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {activeStop.attraction.name}
                <span className="text-xs font-normal text-slate-400">({activeStop.attraction.region})</span>
              </h5>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-400/10 px-2.5 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/30">
                ★ {activeStop.predictedEnjoyment.toFixed(2)} ML Enjoyment
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  activeStop.attraction.name + " " + activeStop.attraction.region + " Sri Lanka"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-white/20 transition-all"
              >
                <Navigation className="h-3.5 w-3.5 text-teal-400" />
                Directions
              </a>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-center text-xs">
            <div className="rounded-xl bg-white/5 p-2">
              <span className="text-[10px] text-slate-400">Scheduled Time</span>
              <p className="font-semibold text-slate-200">
                {activeStop.arrivalTime} - {activeStop.departureTime}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-2">
              <span className="text-[10px] text-slate-400">Foreigner Fee</span>
              <p className="font-semibold text-emerald-400">
                {activeStop.costUSD === 0 ? "FREE" : `$${activeStop.costUSD} USD`}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-2">
              <span className="text-[10px] text-slate-400">Dwell & Transit</span>
              <p className="font-semibold text-sky-400">
                {activeStop.dwellMinutes}m dwell • {activeStop.transitMinutesFromPrev}m drive
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-teal-400" />
                <h4 className="font-bold text-white text-sm">Google Maps API Configuration</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Enter your Google Maps JavaScript API Key to enable custom dark vector styling and live interactive route polylines across Sri Lanka.
            </p>

            <div className="mt-3">
              <label className="text-[11px] font-semibold text-slate-400">Google Maps API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                * If no key is set, the system automatically uses the Google Maps Embed of Sri Lanka seamlessly.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="rounded-xl bg-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-all flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Save & Apply Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
