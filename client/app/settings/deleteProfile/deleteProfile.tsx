"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderView from "../../components/header/header";
import SidebarView from "../../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import ConfirmBox from "../../components/confirmBox/confirmBox";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 transition-colors outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 disabled:opacity-50";

const labelClass = "mb-2 block text-sm font-medium text-slate-200";

export default function DeleteProfileView() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, logoutContext } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your account email and password.");
      return;
    }

    // Open ConfirmBox modal to prevent accidental deletion
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const res = await fetch(`${apiUrl}/api/users/profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || `Failed to delete account (${res.status}).`,
        );
      }

      // Clear authentication state and redirect to landing page
      logoutContext();
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while deleting account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-slate-800/20 blur-3xl" />
      </div>

      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <HeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-rose-400">
                  Delete Account
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Permanently remove your account and all associated travel records.
                </p>
              </div>

              <Link
                href="/settings/settings"
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span>←</span> Cancel
              </Link>
            </div>

            {/* Warning Callout */}
            <div className="mb-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h2 className="font-semibold text-rose-300">
                    Warning: Irreversible Action
                  </h2>
                  <p className="mt-1 leading-relaxed text-rose-200/90">
                    Deleting your account is permanent. All your saved itineraries,
                    profile preferences, crowd insights, and bookmarks will be
                    immediately purged from our databases.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/15 p-4 text-sm text-rose-200"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="deleteEmail" className={labelClass}>
                    Confirm Your Email Address
                  </label>
                  <input
                    id="deleteEmail"
                    name="email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="deletePassword" className={labelClass}>
                    Confirm Your Password
                  </label>
                  <input
                    id="deletePassword"
                    name="password"
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Link
                    href="/settings/settings"
                    className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Keep My Account
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 items-center justify-center rounded-xl bg-rose-600 px-6 font-semibold text-white shadow-lg shadow-rose-600/30 transition-transform hover:scale-[1.02] hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-rose-400 active:scale-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Delete Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <FooterView />
      </div>

      {/* Confirmation Modal */}
      <ConfirmBox
        isOpen={showConfirm}
        title="Permanently Delete Account"
        message="Are you completely sure you want to permanently delete your account? This action cannot be undone."
        confirmText="Yes, Delete Account"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}