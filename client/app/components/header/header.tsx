"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ConfirmBox from "../confirmBox/confirmBox";

type HeaderViewProps = {
  /** Opens the sidebar on small screens. Optional so the header can render standalone. */
  onMenuClick?: () => void;
};

export default function HeaderView({ onMenuClick }: HeaderViewProps) {
  const router = useRouter();
  const { user, name, email, role, logoutContext } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName = name || user?.name || "User Name";
  const displayEmail = email || user?.email || "user@email.com";
  const userRole = role || user?.role || "user";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "UN";

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutContext();
    router.push("/sign/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left: menu toggle (mobile) + brand */}
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400 lg:hidden cursor-pointer"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link href="/home" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-500 text-lg shadow-lg shadow-teal-500/30">
                ✈️
              </span>
              <span className="hidden text-xl font-bold tracking-tight text-white sm:inline">
                Travel<span className="text-teal-400">Mate</span>
              </span>
            </Link>
          </div>

          {/* Right: user info + actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-sky-500 text-sm font-bold text-slate-950 shadow-md shadow-teal-500/20"
              >
                {initials}
              </div>
              <div className="hidden leading-tight md:block">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  {userRole === "admin" && (
                    <span className="rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-purple-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{displayEmail}</p>
              </div>
            </div>

            <span
              aria-hidden="true"
              className="hidden h-8 w-px bg-white/10 sm:block"
            />

            <Link
              href="/settings/settings"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.3 4.3c.4-1.7 2.9-1.7 3.4 0a1.7 1.7 0 0 0 2.6 1.1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 0 0 1 2.5c1.8.4 1.8 2.9 0 3.4a1.7 1.7 0 0 0-1 2.6c.9 1.5-.9 3.3-2.4 2.4a1.7 1.7 0 0 0-2.6 1c-.4 1.8-2.9 1.8-3.4 0a1.7 1.7 0 0 0-2.5-1c-1.6.9-3.3-.9-2.4-2.4a1.7 1.7 0 0 0-1.1-2.6c-1.7-.4-1.7-2.9 0-3.4a1.7 1.7 0 0 0 1.1-2.5c-.9-1.6.8-3.3 2.4-2.4a1.7 1.7 0 0 0 2.5-1.1z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-400 cursor-pointer"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmBox
        isOpen={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to end your current session?"
        confirmText="Log Out"
        cancelText="Stay Logged In"
        isDestructive={true}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
