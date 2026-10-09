"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  description: string;
};

// Placeholder routes — update once each module's page is created.
export const navItems: NavItem[] = [
  { label: "Environment", href: "/environment", icon: "🌿", description: "Weather & conditions" },
  { label: "Crowds", href: "/crowd", icon: "👥", description: "Live crowd levels" },
  { label: "Itinerary", href: "/itinerary", icon: "🗺️", description: "Plan your trips" },
  { label: "Food", href: "/food", icon: "🍛", description: "Local cuisine guide" },
];

type SidebarViewProps = {
  /** Whether the sidebar is open on small screens. Always visible on large screens. */
  open?: boolean;
  onClose?: () => void;
};

export default function SidebarView({ open = false, onClose }: SidebarViewProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/common" className="flex items-center gap-2" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-500 text-lg shadow-lg shadow-teal-500/30">
              ✈️
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Travel<span className="text-teal-400">Mate</span>
            </span>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Modules
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-teal-400 ${
                      active
                        ? "bg-teal-400/15 text-white ring-1 ring-teal-400/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
                        active ? "bg-teal-400/20" : "bg-white/5 group-hover:bg-white/10"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-slate-500">{item.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom card */}
        <div className="m-3 rounded-2xl bg-gradient-to-br from-teal-500/20 to-sky-500/20 p-4 ring-1 ring-white/10">
          <p className="text-sm font-semibold text-white">Need help?</p>
          <p className="mt-1 text-xs text-slate-400">Our travel support team is available 24/7.</p>
        </div>
      </aside>
    </>
  );
};