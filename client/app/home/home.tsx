"use client";

import { useState } from "react";
import Link from "next/link";
import HeaderView from "../components/header/header";
import SidebarView, { navItems } from "../components/sidebar/sidebar";
import FooterView from "../components/footer/footer";
import { useAuth } from "../context/AuthContext";

const quickStats = [
  { label: "Upcoming Trips", value: "—" },
  { label: "Saved Places", value: "—" },
  { label: "Days Travelled", value: "—" },
];

export default function HomeView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const displayName = user?.name || "User Name";

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <SidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <HeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {/* Welcome banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 to-sky-600 p-8 shadow-2xl shadow-teal-500/20 sm:p-10">
            <div aria-hidden="true" className="absolute -top-10 -right-10 text-[10rem] leading-none opacity-20 select-none">
              ✈️
            </div>
            <p className="text-sm font-medium text-teal-50/90">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="mt-3 max-w-xl text-teal-50">
              Ready for your next adventure? Explore the modules below to check
              conditions, avoid the crowds, plan your itinerary and find great food.
            </p>
          </section>

          {/* Quick stats */}
          <section aria-label="Quick stats" className="mt-8 grid gap-4 sm:grid-cols-3">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-teal-300">{stat.value}</p>
              </div>
            ))}
          </section>

          {/* Module shortcuts */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Explore modules</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-teal-400/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-teal-400"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-2xl transition-colors group-hover:bg-teal-400/20">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-400">
                    Open
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <FooterView />
      </div>
    </div>
  );
};