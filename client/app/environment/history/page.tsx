"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HeaderView from "../../components/header/header";
import SidebarView from "../../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import { useAuth } from "../../context/AuthContext";
import {
  fetchHistory,
  toggleSaveHistory,
  deleteHistoryItem,
  clearUnsavedHistory,
  type HistoryItem,
} from "../../services/historyService";

export default function HistoryPage() {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<HistoryItem[]>([]);
  const [recentItems, setRecentItems] = useState<HistoryItem[]>([]);
  const [unsavedCount, setUnsavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recent" | "saved">("recent");

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchHistory(token);
      setSavedItems(data.saved);
      setRecentItems(data.recent);
      setUnsavedCount(data.unsavedCount);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;
    if (!token) {
      return;
    }

    fetchHistory(token)
      .then((data) => {
        if (!ignore) {
          setSavedItems(data.saved);
          setRecentItems(data.recent);
          setUnsavedCount(data.unsavedCount);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load history:", err);
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleToggleSave = async (id: string) => {
    if (!token) return;
    try {
      await toggleSaveHistory(id, token);
      await loadData();
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteHistoryItem(id, token);
      await loadData();
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleClearUnsaved = async () => {
    if (!token) return;
    try {
      await clearUnsavedHistory(token);
      await loadData();
    } catch (err) {
      console.error("Failed to clear unsaved history:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <HeaderView onMenuClick={() => setSidebarOpen(true)} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <Link href="/environment" className="hover:underline">
                Environmental Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-400">History & Watchlist</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Search History & Watchlist
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Review your spatio-temporal evaluations and pinned destinations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/environment"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setActiveTab("recent")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "recent"
                  ? "bg-teal-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Recent Searches</span>
              <span className="rounded-full bg-slate-950/20 px-2 py-0.5 text-[10px]">
                {unsavedCount} / 10
              </span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "saved"
                  ? "bg-teal-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Saved Watchlist</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                {savedItems.length}
              </span>
            </button>
          </div>

          {activeTab === "recent" && recentItems.length > 0 && (
            <button
              onClick={handleClearUnsaved}
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <span>🗑️</span> Clear Unsaved Searches
            </button>
          )}
        </div>

        {/* Content Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
              <p className="text-sm">Loading search history...</p>
            </div>
          ) : activeTab === "recent" ? (
            recentItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-400">
                <div className="text-4xl mb-3">🧭</div>
                <h3 className="text-base font-bold text-white">No Recent Searches</h3>
                <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
                  Evaluate destination suitability on the dashboard to build your recent history automatically.
                </p>
                <Link
                  href="/environment"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-teal-400/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                            {item.activity_category}
                          </span>
                          <h3 className="mt-2 text-base font-bold text-white">
                            {item.destination_name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-teal-400">
                            {item.suitability_score}%
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Target Date: <strong>{item.target_date}</strong>
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <button
                        onClick={() => handleToggleSave(item.id)}
                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <span>⭐</span> Save to Watchlist
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : savedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-400">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-base font-bold text-white">Watchlist is Empty</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
                Pin your favorite destinations to keep them safely in your permanent watchlist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5 hover:border-teal-400/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-500/30">
                          {item.activity_category}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-teal-200">
                          {item.destination_name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-teal-400">
                          {item.suitability_score}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Target Date: <strong>{item.target_date}</strong>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-teal-500/10 pt-3">
                    <button
                      onClick={() => handleToggleSave(item.id)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>★</span> Unsave
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <FooterView />
    </div>
  );
}