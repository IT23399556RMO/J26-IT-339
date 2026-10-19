"use client";

import { useState } from "react";
import type { HistoryItem } from "../../services/historyService";

export interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: HistoryItem[];
  recentItems: HistoryItem[];
  unsavedCount: number;
  maxLimit?: number;
  loading?: boolean;
  onToggleSave: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onClearUnsaved: () => void | Promise<void>;
  onSelectDestination?: (item: HistoryItem) => void;
}

/** Formats ISO dates into clean human-readable date representation */
function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.includes("T") ? dateStr.split("T") : [dateStr];
    return parts[0] ?? dateStr;
  } catch {
    return dateStr;
  }
}

/** Color-code suitability score badges */
function getScoreBadge(score: number) {
  if (score >= 80) {
    return {
      bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      label: "Excellent",
    };
  }
  if (score >= 65) {
    return {
      bg: "bg-teal-500/15 border-teal-500/30 text-teal-400",
      label: "Good",
    };
  }
  if (score >= 50) {
    return {
      bg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      label: "Moderate",
    };
  }
  return {
    bg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    label: "Poor",
  };
}

export function HistoryDrawer({
  isOpen,
  onClose,
  savedItems,
  recentItems,
  unsavedCount,
  maxLimit = 10,
  loading = false,
  onToggleSave,
  onDelete,
  onClearUnsaved,
  onSelectDestination,
}: HistoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "saved">("recent");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform border-l border-white/10 bg-slate-900/95 p-6 text-white shadow-2xl backdrop-blur-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-xl border border-teal-500/20 text-teal-400">
                🕒
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Search History & Watchlist
                </h2>
                <p className="text-xs text-slate-400">
                  Component 1 Telemetry Audit & Watchlist
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Close panel"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "recent"
                  ? "bg-teal-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Recent Searches</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === "recent"
                    ? "bg-slate-950/20 text-slate-950"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {unsavedCount} / {maxLimit}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "saved"
                  ? "bg-teal-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Saved Watchlist</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === "saved"
                    ? "bg-slate-950/20 text-slate-950"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {savedItems.length}
              </span>
            </button>
          </div>

          {/* Tab Actions Bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            {activeTab === "recent" ? (
              <>
                <span className="font-mono text-[11px] text-slate-400">
                  FIFO Capacity: <strong className="text-teal-400">{unsavedCount}</strong> of{" "}
                  {maxLimit} slots
                </span>
                {recentItems.length > 0 && (
                  <button
                    onClick={() => onClearUnsaved()}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:underline transition-colors"
                  >
                    <span>🗑️</span> Clear Unsaved
                  </button>
                )}
              </>
            ) : (
              <>
                <span>Pinned destinations permanently stored</span>
                <span className="font-semibold text-teal-400">
                  {savedItems.length} Saved
                </span>
              </>
            )}
          </div>

          {/* List Content */}
          <div className="mt-4 h-[calc(100vh-230px)] overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                <span className="text-xs">Synchronizing history...</span>
              </div>
            ) : activeTab === "recent" ? (
              recentItems.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">
                  <div className="text-3xl mb-2">🧭</div>
                  <p className="text-sm font-semibold text-white">No recent evaluations</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Run an environmental suitability analysis to see automatic FIFO history logs here.
                  </p>
                </div>
              ) : (
                recentItems.map((item) => {
                  const badge = getScoreBadge(item.suitability_score);
                  return (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-teal-500/40 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="cursor-pointer flex-1"
                          onClick={() => onSelectDestination?.(item)}
                          title="Click to load destination"
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">
                              {item.destination_name}
                            </h4>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                              {item.activity_category}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                            <span>📅 {formatDate(item.target_date)}</span>
                            <span>•</span>
                            <span className="text-[11px] text-slate-400">
                              Logged: {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        {/* Suitability Score Pill */}
                        <div
                          className={`flex flex-col items-end rounded-xl border px-2.5 py-1 text-xs font-bold ${badge.bg}`}
                        >
                          <span className="text-sm font-black">
                            {item.suitability_score}%
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider">
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                        {onSelectDestination && (
                          <button
                            onClick={() => onSelectDestination(item)}
                            className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1"
                          >
                            <span>Load Target</span> →
                          </button>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          {/* Bookmark / Save Button */}
                          <button
                            onClick={() => onToggleSave(item.id)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-300 hover:bg-teal-500/10 hover:text-teal-300 border border-transparent hover:border-teal-500/20 transition-all"
                            title="Save to Watchlist"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill={item.is_saved ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                            <span>Save</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDelete(item.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title="Delete entry"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : savedItems.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-sm font-semibold text-white">No saved destinations</p>
                <p className="mt-1 text-xs text-slate-400">
                  Bookmark destinations from Recent Searches to keep them pinned permanently in your Watchlist.
                </p>
              </div>
            ) : (
              savedItems.map((item) => {
                const badge = getScoreBadge(item.suitability_score);
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl border border-teal-500/20 bg-teal-950/20 p-4 transition-all hover:border-teal-400/40 hover:bg-teal-950/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="cursor-pointer flex-1"
                        onClick={() => onSelectDestination?.(item)}
                        title="Click to load destination"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-teal-300 group-hover:text-teal-200 transition-colors">
                            {item.destination_name}
                          </h4>
                          <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-medium text-teal-300 border border-teal-500/30">
                            {item.activity_category}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          <span>📅 {formatDate(item.target_date)}</span>
                          <span>•</span>
                          <span className="text-[11px] text-teal-400/80">Saved Watchlist</span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div
                        className={`flex flex-col items-end rounded-xl border px-2.5 py-1 text-xs font-bold ${badge.bg}`}
                      >
                        <span className="text-sm font-black">
                          {item.suitability_score}%
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider">
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-3 flex items-center justify-between border-t border-teal-500/10 pt-2 text-xs">
                      {onSelectDestination && (
                        <button
                          onClick={() => onSelectDestination(item)}
                          className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                        >
                          <span>Load Target</span> →
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        {/* Remove from Saved (Unsave) */}
                        <button
                          onClick={() => onToggleSave(item.id)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors border border-amber-500/20"
                          title="Remove from saved watchlist"
                        >
                          <svg
                            className="h-3.5 w-3.5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          <span>Unsave</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDelete(item.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          title="Delete entry completely"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryDrawer;
