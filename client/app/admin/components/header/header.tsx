"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ConfirmBox from "../../../components/confirmBox/confirmBox";

type AdminHeaderViewProps = {
  /** Opens the admin sidebar on small screens. */
  onMenuClick?: () => void;
};

export default function AdminHeaderView({ onMenuClick }: AdminHeaderViewProps) {
  const router = useRouter();
  const { user, name, email, logoutContext } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName = name || user?.name || "Administrator";
  const displayEmail = email || user?.email || "admin@travelmate.com";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutContext();
    router.push("/sign/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left: Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Open admin navigation menu"
                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-purple-400 lg:hidden cursor-pointer"
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

            <Link href="/admin/home" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-lg shadow-lg shadow-purple-500/30">
                ⚡
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Admin<span className="text-purple-400">Portal</span>
              </span>
            </Link>
          </div>

          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Link to standard user home */}
            <Link
              href="/home"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400"
            >
              <span>🌐</span>
              <span>View User App</span>
            </Link>

            <span
              aria-hidden="true"
              className="hidden h-8 w-px bg-white/10 sm:block"
            />

            {/* Admin Profile Details */}
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-purple-500/30"
              >
                {initials}
              </div>
              <div className="hidden leading-tight md:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  <span className="rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 ring-1 ring-purple-500/40">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-400">{displayEmail}</p>
              </div>
            </div>

            <span
              aria-hidden="true"
              className="hidden h-8 w-px bg-white/10 sm:block"
            />

            {/* Logout Button */}
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
        title="Admin Sign Out"
        message="Are you sure you want to end your administrator session?"
        confirmText="Sign Out"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}