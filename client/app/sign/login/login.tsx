"use client";

import Link from "next/link";
import type { FormEvent } from "react";

export default function LoginView() {
  // UI only — authentication logic will be added later.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 font-sans text-white">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-teal-500/30 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-500 text-xl shadow-lg shadow-teal-500/30">
            ✈️
          </span>
          <span className="text-2xl font-bold tracking-tight">
            Travel<span className="text-teal-400">Mate</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <h1 className="text-center text-3xl font-bold tracking-tight">Login</h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 transition-colors outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
                >
                  Forgotten Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 transition-colors outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 font-semibold text-slate-950 shadow-lg shadow-teal-500/30 transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 active:scale-100"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-wider text-slate-500 uppercase">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google (UI only) */}
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white font-medium text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
          >
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Sign in with Google
          </button>

          {/* Register prompt */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <p className="text-sm text-slate-400">Don&apos;t have an account?</p>
            <Link
              href="/sign/register"
              className="rounded-full border border-teal-400/50 px-5 py-1.5 text-sm font-semibold text-teal-300 transition-colors hover:bg-teal-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
