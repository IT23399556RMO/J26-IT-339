"use client";

import { useState } from "react";
import Link from "next/link";
import HeaderView from "../../components/header/header";
import SidebarView from "../../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import { useAuth } from "../../context/AuthContext";

export default function SettingsView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, name, email, role } = useAuth();

  const displayName = name || user?.name || "User Name";
  const displayEmail = email || user?.email || "user@email.com";
  const userRole = role || user?.role || "user";
  const userId = user?.id || "N/A";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "UN";

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
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Account Settings
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Manage your personal details, profile credentials, and account options.
                </p>
              </div>

              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white self-start sm:self-auto"
              >
                <span>←</span> Back to Dashboard
              </Link>
            </div>

            {/* Profile Overview Card */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-2xl font-bold text-slate-950 shadow-lg shadow-teal-500/30">
                  {initials}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    <h2 className="text-2xl font-bold text-white">
                      {displayName}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        userRole === "admin"
                          ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40"
                          : "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40"
                      }`}
                    >
                      {userRole.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{displayEmail}</p>
                  <p className="mt-2 text-xs font-mono text-slate-500">
                    User ID: {userId}
                  </p>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Full Name
                  </p>
                  <p className="mt-1 text-base font-medium text-white">
                    {displayName}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </p>
                  <p className="mt-1 text-base font-medium text-white">
                    {displayEmail}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    System Role
                  </p>
                  <p className="mt-1 text-base font-medium text-teal-300 capitalize">
                    {userRole}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Authentication Status
                  </p>
                  <p className="mt-1 text-base font-medium text-emerald-400">
                    ● Active Session
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Action Cards */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {/* Edit Profile Action */}
              <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-teal-400/30 sm:p-7">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-xl text-teal-300">
                    ✏️
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white">
                    Edit Profile
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Update your account name or change your password to keep your
                    account secure.
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href="/settings/editProfile"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-teal-400"
                  >
                    <span>Edit Profile Details</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Delete Profile Action */}
              <div className="flex flex-col justify-between rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-xl transition-all hover:border-rose-500/40 sm:p-7">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-xl text-rose-300">
                    🗑️
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white">
                    Delete Profile
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Permanently delete your account, travel plans, and all associated
                    data from TravelMate.
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href="/settings/deleteProfile"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-400"
                  >
                    <span>Delete Account</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}