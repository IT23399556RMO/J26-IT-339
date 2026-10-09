import Link from "next/link";

const features = [
  {
    icon: "🌿",
    title: "Eco Awareness",
    description:
      "Check weather and environmental conditions so you can travel safely and responsibly.",
  },
  {
    icon: "👥",
    title: "Crowd Insights",
    description:
      "See how busy attractions are before you go and pick the perfect time to visit.",
  },  
  {
    icon: "🗺️",
    title: "Smart Itineraries",
    description:
      "Build personalised day-by-day travel plans tailored to your interests, budget and pace.",
  },
  {
    icon: "🍛",
    title: "Local Food Guide",
    description:
      "Discover authentic local cuisine and highly rated places to eat wherever you travel.",
  },
];

const stats = [
  { value: "500+", label: "Destinations" },
  { value: "10K+", label: "Happy Travellers" },
  { value: "24/7", label: "Trip Support" },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 font-sans text-white">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-teal-500/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-500 text-xl shadow-lg shadow-teal-500/30">
              ✈️
            </span>
            <span className="text-2xl font-bold tracking-tight">
              Travel<span className="text-teal-400">Mate</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/sign/login"
              className="rounded-full px-5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
            >
              Login
            </Link>
            <Link
              href="/sign/register"
              className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-teal-500/30 transition-colors hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-16 pb-20 text-center lg:px-8 lg:pt-24">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-sm font-medium text-teal-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
            Your smart travel companion
          </span>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-teal-300 via-sky-400 to-teal-300 bg-clip-text text-transparent">
              TravelMate
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Explore breathtaking destinations, plan unforgettable journeys and
            travel smarter — all in one place. Your next adventure starts here.
          </p>

          <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <Link
              href="/sign/register"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-sky-500 px-8 text-base font-semibold text-slate-950 shadow-lg shadow-teal-500/30 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 sm:w-auto"
            >
              Get Started — Register
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/sign/login"
              className="flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 sm:w-auto"
            >
              I already have an account
            </Link>
          </div>

          {/* Stats */}
          <dl className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <dt className="order-2 mt-1 text-xs text-slate-400 sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="order-1 text-2xl font-bold text-teal-300 sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for the perfect trip
            </h2>
            <p className="mt-4 text-slate-400">
              Thoughtfully designed tools to make every journey effortless.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-teal-400/40 hover:bg-white/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-2xl transition-colors group-hover:bg-teal-400/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-24 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-teal-500 to-sky-600 p-10 text-center shadow-2xl shadow-teal-500/20 sm:p-14">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to explore the world?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-teal-50">
              Join TravelMate today and start planning your dream getaway in
              minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign/register"
                className="flex h-12 w-full items-center justify-center rounded-full bg-white px-8 font-semibold text-teal-700 transition-colors hover:bg-teal-50 sm:w-auto"
              >
                Register
              </Link> 
              <Link
                href="/sign/login"
                className="flex h-12 w-full items-center justify-center rounded-full border border-white/60 px-8 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} TravelMate. All rights reserved.</p>
          <p>Made with ❤️ for travellers everywhere.</p>
        </div>
      </footer>
    </div>
  );
}

