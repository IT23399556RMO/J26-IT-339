"use client";

import React from "react";
import { Sliders, MapPin, AlertTriangle, Compass, Bot } from "lucide-react";

export type ItineraryTab = "profile" | "day-plan" | "adaptive" | "on-site";

interface MobileBottomNavProps {
  activeTab: ItineraryTab;
  onChangeTab: (tab: ItineraryTab) => void;
  hasItinerary: boolean;
  hasConflict: boolean;
}

export default function MobileBottomNav({
  activeTab,
  onChangeTab,
  hasItinerary,
  hasConflict,
}: MobileBottomNavProps) {
  const tabs = [
    {
      id: "profile" as ItineraryTab,
      label: "Profile",
      icon: Sliders,
      badge: null,
    },
    {
      id: "day-plan" as ItineraryTab,
      label: "Day Plan",
      icon: MapPin,
      badge: hasItinerary ? "Active" : null,
      badgeColor: "bg-teal-500",
    },
    {
      id: "adaptive" as ItineraryTab,
      label: "Re-Plan",
      icon: AlertTriangle,
      badge: hasConflict ? "Alert" : null,
      badgeColor: "bg-rose-500 animate-pulse",
    },
    {
      id: "on-site" as ItineraryTab,
      label: "On-Site Hub",
      icon: Bot,
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur-2xl px-2 py-2 safe-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-teal-400 bg-teal-400/10 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2.5 flex h-2 w-2 rounded-full ${
                      tab.badgeColor || "bg-teal-400"
                    }`}
                  />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
