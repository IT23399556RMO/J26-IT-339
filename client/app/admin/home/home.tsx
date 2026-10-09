"use client";

import { useState } from "react";
import Link from "next/link";
import AdminHeaderView from "../components/header/header";
import AdminSidebarView from "../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import { useAuth } from "../../context/AuthContext";

export default function AdminHomeView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, name } = useAuth();

  const displayName = name || user?.name || "Administrator";

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <AdminSidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <AdminHeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            {/* Admin Banner */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-700 p-8 shadow-2xl shadow-purple-600/20 sm:p-10">
              <div
                aria-hidden="true"
                className="absolute -top-10 -right-10 text-[10rem] leading-none opacity-20 select-none"
              >
                ⚡
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                  Admin Control Panel
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {displayName}! 🛡️
              </h1>
              <p className="mt-3 max-w-xl text-purple-100">
                You have full administrative privileges over TravelMate. Inspect
                registered accounts, audit user records, and oversee platform activity.
              </p>
            </section>

            {/* Admin Stats Overview */}
            <section
              aria-label="Admin Stats"
              className="mt-8 grid gap-4 sm:grid-cols-3"
            >
              <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role Permission
                </p>
                <p className="mt-2 text-2xl font-bold text-purple-300">
                  Super Admin
                </p>
                <p className="mt-1 text-xs text-slate-500">Full system access</p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Authentication Layer
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  JWT / RBAC Active
                </p>
                <p className="mt-1 text-xs text-slate-500">Bearer token validation</p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Database Cluster
                </p>
                <p className="mt-2 text-2xl font-bold text-sky-400">
                  PostgreSQL Online
                </p>
                <p className="mt-1 text-xs text-slate-500">Connection pool ready</p>
              </div>
            </section>

            {/* Quick Actions / Modules */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Administrative Tools</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Link
                  href="/admin/users"
                  className="group rounded-3xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-purple-500/40 hover:bg-white/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-2xl transition-colors group-hover:bg-purple-500/30">
                    👥
                  </div>
                  <h3 className="mt-4 text-lg font-bold">User Management</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Inspect all registered users, roles, creation timestamps, and
                    account identifiers in a real-time data table.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-400 group-hover:text-purple-300">
                    Manage Users
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>

                <Link
                  href="/home"
                  className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-2xl transition-colors group-hover:bg-teal-500/30">
                    🌐
                  </div>
                  <h3 className="mt-4 text-lg font-bold">Standard User Portal</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Switch to standard user mode to test tourism features,
                    explore itineraries, and verify user experience.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-400 group-hover:text-teal-300">
                    Open User Dashboard
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </section>
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}