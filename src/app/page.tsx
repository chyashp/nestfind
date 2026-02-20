import Link from "next/link";
import {
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import LocationSearchBar from "@/components/shared/LocationSearchBar";

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: "Smart Search",
    description:
      "Filter by price, bedrooms, property type, amenities and more to find exactly what you need.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-400",
    span: "lg:col-span-2",
  },
  {
    icon: MapPinIcon,
    title: "Map Search",
    description:
      "Explore properties on an interactive map. Discover listings in any neighborhood.",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    iconColor: "text-violet-400",
    span: "",
  },
  {
    icon: HomeModernIcon,
    title: "Detailed Listings",
    description:
      "High-quality photos, amenity details, and comprehensive property information.",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
    span: "",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verified Owners",
    description:
      "Every listing is posted by verified property owners and agents you can trust.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    span: "",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Direct Enquiries",
    description:
      "Contact property owners directly. No middlemen, no delays.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
    span: "",
  },
  {
    icon: BuildingOffice2Icon,
    title: "List Your Property",
    description:
      "Create stunning listings with photos and details. Reach thousands of buyers and tenants.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
    span: "lg:col-span-2",
  },
];

const stats = [
  { value: "10K+", label: "Active Listings" },
  { value: "5K+", label: "Happy Buyers" },
  { value: "2K+", label: "Verified Owners" },
  { value: "50+", label: "Cities Covered" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
              <BuildingOffice2Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">NestFind</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/search"
              className="text-sm font-medium text-slate-400 hover:text-primary-400 transition-colors"
            >
              Search
            </Link>
            <Link
              href="/map"
              className="text-sm font-medium text-slate-400 hover:text-primary-400 transition-colors"
            >
              Map
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-primary-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-500/20 hover:bg-primary-500 transition-colors"
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

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary-400 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything you need to find{" "}
              <span className="bg-linear-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">the one</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Powerful search, interactive maps, and direct communication — all
              in one platform.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br ${feature.gradient} p-7 transition-all duration-300 hover:border-white/15 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 ${feature.span}`}
              >
                <div className="absolute inset-0 bg-slate-950/40" />
                <div className="relative">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6 ${feature.iconColor} backdrop-blur-sm ring-1 ring-white/8 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <BuildingOffice2Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">
                NestFind
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/search" className="hover:text-primary-400 transition-colors">
                Search
              </Link>
              <Link href="/map" className="hover:text-primary-400 transition-colors">
                Map
              </Link>
              <Link href="/login" className="hover:text-primary-400 transition-colors">
                Sign In
              </Link>
            </div>
            <p className="text-sm text-slate-600">
              &copy; {new Date().getFullYear()} NestFind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
