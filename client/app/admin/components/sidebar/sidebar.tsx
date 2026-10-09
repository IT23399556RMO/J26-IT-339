"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  description: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Admin Dashboard",
    href: "/admin/home",
    icon: "📊",
    description: "System stats & overview",
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: "👥",
    description: "View & inspect registered users",
  },
];

type AdminSidebarViewProps = {
  open?: boolean;
  onClose?: () => void;
};

export default function AdminSidebarView({
  open = false,
  onClose,
}: AdminSidebarViewProps) {
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-purple-500/20 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-purple-500/20 px-5">
          <Link
            href="/admin/home"
            className="flex items-center gap-2"
            onClick={onClose}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-lg shadow-lg shadow-purple-500/30">
              ⚡
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Travel<span className="text-purple-400">Admin</span>
            </span>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close admin navigation menu"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden cursor-pointer"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Admin navigation"
          className="flex-1 overflow-y-auto px-3 py-6"
        >
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-purple-400">
            Admin Modules
          </p>
          <ul className="space-y-1.5">
            {adminNavItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin/home" && pathname?.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-purple-400 ${
                      active
                        ? "bg-purple-500/20 text-white ring-1 ring-purple-500/40"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
                        active
                          ? "bg-purple-500/30"
                          : "bg-white/5 group-hover:bg-white/10"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-slate-400">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Portal Link Card */}
        <div className="m-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Switch back to user mode anytime.
          </p>
          <Link
            href="/home"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          >
            <span>← User Portal</span>
          </Link>
        </div>
      </aside>
    </>
  );
}