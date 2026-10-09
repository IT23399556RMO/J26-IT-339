"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderView from "../../components/header/header";
import SidebarView from "../../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 transition-colors outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 disabled:opacity-50";

const labelClass = "mb-2 block text-sm font-medium text-slate-200";

export default function EditProfileView() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, name, email, token, updateUserContext } = useAuth();

  const currentName = name || user?.name || "";
  const [formName, setFormName] = useState(() => currentName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If initial load was empty and auth hydrates, sync formName
  const [lastSyncedName, setLastSyncedName] = useState(currentName);
  if (currentName && currentName !== lastSyncedName && !formName) {
    setLastSyncedName(currentName);
    setFormName(currentName);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const payload: { name: string; password?: string } = {
        name: formName.trim(),
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || `Failed to update profile (${res.status}).`,
        );
      }

      if (data?.data?.user) {
        // Update context immediately
        updateUserContext({
          name: data.data.user.name,
        });

        setSuccess("Profile updated successfully! Redirecting...");

        setTimeout(() => {
          router.push("/settings/settings");
        }, 800);
      } else {
        router.push("/settings/settings");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while updating profile.",
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
        <div className="absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <HeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Edit Profile
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Update your display name and change your password.
                </p>
              </div>

              <Link
                href="/settings/settings"
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span>←</span> Cancel
              </Link>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
              {/* Feedback banners */}
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

              {success && (
                <div
                  role="status"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-sm text-emerald-200"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Read-only reference) */}
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={email || user?.email || ""}
                    className="w-full rounded-xl border border-white/5 bg-slate-900/40 px-4 py-3 text-slate-400 cursor-not-allowed"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Email address is uniquely tied to your account and cannot be modified directly.
                  </p>
                </div>

                {/* Name (Editable, pre-filled) */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={loading}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your Name"
                    className={inputClass}
                  />
                </div>

                {/* Password Change Section */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-base font-semibold text-white">
                    Change Password (Optional)
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Leave blank if you do not wish to change your existing password.
                  </p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="newPassword" className={labelClass}>
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmNewPassword" className={labelClass}>
                        Confirm New Password
                      </label>
                      <input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        disabled={loading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Link
                    href="/settings/settings"
                    className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 px-6 font-semibold text-slate-950 shadow-lg shadow-teal-500/30 transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-teal-400 active:scale-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}