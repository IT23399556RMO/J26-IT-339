"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import newLogo from "../../assets/newlogo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faShieldHalved,
  faCircleExclamation,
  faSpinner,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function RegisterView() {
  const router = useRouter();
  const { loginContext } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const res = await fetch(`${apiUrl}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || `Registration failed with status ${res.status}.`,
        );
      }

      if (data?.data?.user && data?.data?.token) {
        const user = data.data.user;
        const token = data.data.token;

        // Update global auth state & persist to localStorage
        loginContext(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        );

        // Role-based routing
        if (user.role === "user") {
          router.push("/sign/login");
        } else {
          router.push("/");
        }
      } else {
        throw new Error("Invalid response format received from server.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-gray-900">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <Image
            src={newLogo}
            alt="TravelMate Logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-cover shadow-sm border border-gray-200"
            priority
          />
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Travel<span className="text-emerald-600">Mate</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Start planning trips calibrated to your physical comfort
        </p>
      </div>

      {/* Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 px-4 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin text-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Toggle between Register and Login */}
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
