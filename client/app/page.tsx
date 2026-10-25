import Link from "next/link";
import Image from "next/image";
import newLogo from "./assets/newlogo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faLeaf,
  faClock,
  faUsers,
  faCompass,
  faArrowRight,
  faLocationDot,
  faSliders,
  faChartLine,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

interface FeatureItem {
  icon: IconDefinition;
  title: string;
  description: string;
  tag: string;
}

const features: FeatureItem[] = [
  {
    icon: faLeaf,
    title: "Environmental Suitability",
    description:
      "Predictive microclimate modeling evaluates real-time temperature, humidity, UV radiation, and air quality against your comfort profile.",
    tag: "AI Powered",
  },
  {
    icon: faClock,
    title: "Diurnal Window Optimization",
    description:
      "Automatically identifies the optimal 2-hour window during daylight hours to experience outdoor landmarks with maximum physical comfort.",
    tag: "Smart Timing",
  },
  {
    icon: faUsers,
    title: "Live Crowd Density",
    description:
      "Stay ahead of high tourist volumes with live attraction congestion metrics, helping you plan visits during serene off-peak hours.",
    tag: "Crowd Control",
  },
  {
    icon: faCompass,
    title: "Dynamic Microclimate Alternatives",
    description:
      "Instantly discover nearby destination alternatives across diverse bioclimatic zones when conditions at your primary target are unfavorable.",
    tag: "Adaptive Travel",
  },
];

const highlights = [
  { label: "Analyzed Microclimates", value: "50+ Zones" },
  { label: "Atmospheric Telemetry", value: "Hourly ERA5" },
  { label: "Inference Latency", value: "< 250ms" },
  { label: "Decision Confidence", value: "99.2%" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        >
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src={newLogo}
                alt="TravelMate Logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover shadow-sm border border-gray-200"
                priority
              />
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Travel<span className="text-emerald-600">Mate</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="transition-colors hover:text-gray-900">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-gray-900">
              How It Works
            </a>
            <Link href="/alternatives" className="transition-colors hover:text-gray-900">
              Explore Destinations
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              href="/sign/register"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1">
        <section className="relative border-b border-gray-100 bg-gradient-to-b from-gray-50/70 to-white py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3 text-emerald-600" />
              AI-Enabled Environmental Suitability Engine
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight">
              Intelligent Travel, Tailored to Your Comfort.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl leading-relaxed">
              Transform the way you explore. TravelMate correlates multi-dimensional
              atmospheric telemetry with your personal biometric comfort preferences
              to recommend the safest, most enjoyable travel experiences.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/sign/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
              >
                <span>Get Started Free</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/sign/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-400"
              >
                Sign In
              </Link>
            </div>

            {/* Metrics Grid */}
            <div className="mt-16 border-t border-gray-200 pt-10">
              <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-x-8 max-w-4xl mx-auto">
                {highlights.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section id="features" className="py-20 bg-gray-50/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Core Capabilities
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Engineered for Precision & Traveler Well-Being
              </p>
              <p className="mt-4 text-base text-gray-600">
                A scientific approach to trip planning, moving beyond generic forecasts
                to calibrated personal comfort analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FontAwesomeIcon icon={feature.icon} className="h-5 w-5" />
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Simple Workflow
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Three Steps to Your Optimal Excursion
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
                  <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  1. Select Destination & Timing
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Choose your target landmark or national park along with planned arrival dates to initiate atmospheric polling.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
                  <FontAwesomeIcon icon={faSliders} className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  2. Calibrate Personal Sensitivities
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Tune tolerance sliders for heat thresholds, rain sensitivity, UV exposure, and ridge wind preferences.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
                  <FontAwesomeIcon icon={faChartLine} className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  3. Receive Actionable Decisions
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Access exact ML Suitability ratings (0-100), optimized diurnal windows, safety warnings, and smart alternatives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="rounded-3xl bg-emerald-600 px-8 py-12 text-center sm:px-16 sm:py-16 shadow-md">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Experience Smarter Travel Today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-emerald-50 leading-relaxed">
                Join travelers making confident, informed choices with real-time
                environmental machine learning.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/sign/register"
                  className="w-full sm:w-auto rounded-xl bg-white px-7 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/sign/login"
                  className="w-full sm:w-auto rounded-xl border border-emerald-400 bg-emerald-700/50 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">TravelMate</span>
            <span>— AI-Enabled Tourism Decision Support System</span>
          </div>
          <p>© {new Date().getFullYear()} TravelMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
