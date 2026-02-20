import Link from "next/link";
import {
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeModernIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import LocationSearchBar from "@/components/shared/LocationSearchBar";

const propertyTypes = [
  {
    type: "house",
    label: "Houses",
    emoji: "🏠",
    gradient: "from-amber-500/15 to-orange-500/15",
    border: "hover:border-amber-500/30",
    count: "2,400+",
  },
  {
    type: "apartment",
    label: "Apartments",
    emoji: "🏢",
    gradient: "from-blue-500/15 to-cyan-500/15",
    border: "hover:border-blue-500/30",
    count: "3,800+",
  },
  {
    type: "condo",
    label: "Condos",
    emoji: "🏙️",
    gradient: "from-violet-500/15 to-purple-500/15",
    border: "hover:border-violet-500/30",
    count: "1,600+",
  },
  {
    type: "townhouse",
    label: "Townhouses",
    emoji: "🏘️",
    gradient: "from-emerald-500/15 to-teal-500/15",
    border: "hover:border-emerald-500/30",
    count: "900+",
  },
  {
    type: "land",
    label: "Land",
    emoji: "🌳",
    gradient: "from-lime-500/15 to-green-500/15",
    border: "hover:border-lime-500/30",
    count: "500+",
  },
  {
    type: "commercial",
    label: "Commercial",
    emoji: "🏬",
    gradient: "from-rose-500/15 to-pink-500/15",
    border: "hover:border-rose-500/30",
    count: "700+",
  },
];

const steps = [
  {
    number: "01",
    title: "Search & Discover",
    description: "Use smart filters, interactive maps, and neighborhood search to find properties that match your lifestyle.",
    icon: MagnifyingGlassIcon,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    ring: "ring-indigo-500/20",
  },
  {
    number: "02",
    title: "Connect with Owners",
    description: "Send enquiries directly to verified property owners and agents. No middlemen, no delays.",
    icon: ChatBubbleLeftRightIcon,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
  },
  {
    number: "03",
    title: "Move Into Your Nest",
    description: "Schedule viewings, finalize details, and settle into your new home with confidence.",
    icon: HomeModernIcon,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary-400/10 bg-primary-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-500/25">
              <BuildingOffice2Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">NestFind</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/search"
              className="text-sm font-medium text-primary-200/70 hover:text-primary-300 transition-colors"
            >
              Search
            </Link>
            <Link
              href="/map"
              className="text-sm font-medium text-primary-200/70 hover:text-primary-300 transition-colors"
            >
              Map
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-primary-200 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/25 hover:bg-primary-500 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-accent-500/8 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-400 ring-1 ring-primary-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
              Find your dream property today
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Discover Your{" "}
              <span className="bg-linear-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Perfect Home
              </span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-slate-400">
              Browse thousands of verified listings. Search by map, filter by
              your needs, and connect directly with property owners.
            </p>

            {/* Search bar */}
            <div className="mt-10">
              <LocationSearchBar variant="dark" />
            </div>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["New York", "San Francisco", "Austin", "Miami", "Seattle"].map(
                (city) => (
                  <Link
                    key={city}
                    href={`/search?query=${encodeURIComponent(city)}`}
                    className="rounded-full bg-white/5 px-4 py-1.5 text-sm text-slate-400 ring-1 ring-white/10 hover:ring-primary-500/40 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                  >
                    {city}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Property Type */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Browse by Property Type
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              What kind of place are you looking for?
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {propertyTypes.map((pt) => (
              <Link
                key={pt.type}
                href={`/search?propertyType=${pt.type}`}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br ${pt.gradient} p-5 text-center transition-all duration-300 ${pt.border} hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}
              >
                <div className="text-3xl">{pt.emoji}</div>
                <p className="mt-2 text-sm font-semibold text-white">{pt.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{pt.count} listings</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary-950/40" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-400">
              Simple process
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              How NestFind Works
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {/* Connector line between steps (desktop) */}
                {i < steps.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] hidden h-px bg-linear-to-r from-white/10 to-white/5 md:block" />
                )}

                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${step.bg} ring-1 ${step.ring}`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>

                <p className={`mt-5 text-xs font-bold uppercase tracking-widest ${step.color}`}>
                  Step {step.number}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-y border-primary-400/10 bg-primary-950/30 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6">
          {[
            { icon: MapPinIcon, text: "50+ cities covered" },
            { icon: BuildingOffice2Icon, text: "10,000+ active listings" },
            { icon: ChatBubbleLeftRightIcon, text: "Direct owner contact" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5 text-sm text-slate-400">
              <item.icon className="h-4.5 w-4.5 text-primary-400" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-linear-to-r from-primary-950 via-primary-900 to-accent-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/15 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to find your next home?
          </h2>
          <p className="mt-4 text-lg text-primary-200/70">
            Join thousands of buyers and owners on NestFind.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-primary-900 shadow-lg hover:bg-primary-50 transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              href="/signup"
              className="rounded-full border-2 border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-400/10 bg-primary-950 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-md shadow-primary-500/20">
                <BuildingOffice2Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">
                NestFind
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-primary-200/60">
              <Link href="/search" className="hover:text-primary-300 transition-colors">
                Search
              </Link>
              <Link href="/map" className="hover:text-primary-300 transition-colors">
                Map
              </Link>
              <Link href="/login" className="hover:text-primary-300 transition-colors">
                Sign In
              </Link>
            </div>
            <p className="text-sm text-primary-300/40">
              &copy; {new Date().getFullYear()} NestFind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
