import Link from "next/link";
import Image from "next/image";
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
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=520&fit=crop&q=80",
    count: "2,400+",
  },
  {
    type: "apartment",
    label: "Apartments",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=520&fit=crop&q=80",
    count: "3,800+",
  },
  {
    type: "condo",
    label: "Condos",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=520&fit=crop&q=80",
    count: "1,600+",
  },
  {
    type: "townhouse",
    label: "Townhouses",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=520&fit=crop&q=80",
    count: "900+",
  },
  {
    type: "land",
    label: "Land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=520&fit=crop&q=80",
    count: "500+",
  },
  {
    type: "commercial",
    label: "Commercial",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=520&fit=crop&q=80",
    count: "700+",
  },
];

const steps = [
  {
    number: "01",
    title: "Search & Discover",
    description: "Use smart filters, interactive maps, and neighborhood search to find properties that match your lifestyle.",
    icon: MagnifyingGlassIcon,
  },
  {
    number: "02",
    title: "Connect with Owners",
    description: "Send enquiries directly to verified property owners and agents. No middlemen, no delays.",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    number: "03",
    title: "Move Into Your Nest",
    description: "Schedule viewings, finalize details, and settle into your new home with confidence.",
    icon: HomeModernIcon,
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
        {/* Real background image */}
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/90 via-slate-950/85 to-slate-950" />
        <div className="absolute inset-0 bg-primary-950/40" />
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary-600/8 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium text-primary-400 ring-1 ring-white/10 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
              Find your dream property today
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Discover Your{" "}
              <span className="bg-linear-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Perfect Home
              </span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-slate-300">
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
                    className="rounded-full bg-white/5 px-4 py-1.5 text-sm text-slate-300 ring-1 ring-white/10 backdrop-blur-sm hover:ring-primary-500/40 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                  >
                    {city}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Floating property preview cards */}
          <div className="mt-14 flex justify-center gap-4 overflow-hidden">
            {[
              {
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=280&h=180&fit=crop&q=80",
                price: "$425,000",
                location: "Austin, TX",
                beds: "3 bed",
              },
              {
                image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=280&h=180&fit=crop&q=80",
                price: "$2,800/mo",
                location: "San Francisco, CA",
                beds: "2 bed",
              },
              {
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=280&h=180&fit=crop&q=80",
                price: "$1,250,000",
                location: "Miami, FL",
                beds: "5 bed",
              },
            ].map((card) => (
              <Link
                key={card.location}
                href="/search"
                className="group hidden w-56 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-primary-400/20 hover:bg-white/8 sm:block"
              >
                <div className="relative h-28 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.location}
                    fill
                    sizes="224px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-white">{card.price}</p>
                  <p className="text-xs text-slate-400">
                    {card.beds} &middot; {card.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Property Type — Photo tiles */}
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
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
              >
                <Image
                  src={pt.image}
                  alt={pt.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-primary-600/0 transition-colors duration-300 group-hover:bg-primary-600/15" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-bold text-white">{pt.label}</p>
                  <p className="text-xs text-white/60">{pt.count} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Cinematic section with blurred house background */}
      <section className="relative py-28 overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        {/* Dark overlay + blur */}
        <div className="absolute inset-0 bg-primary-950/85 backdrop-blur-sm" />
        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary-500/8 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-400">
              Simple process
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              How NestFind Works
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:border-primary-400/20 hover:bg-white/8"
              >
                {/* Step number */}
                <span className="text-5xl font-black text-primary-500/20">
                  {step.number}
                </span>

                <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/15 ring-1 ring-primary-400/20">
                  <step.icon className="h-6 w-6 text-primary-400" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.description}
                </p>

                {/* Connector arrow (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="absolute -right-3.5 top-1/2 hidden -translate-y-1/2 text-white/20 md:block">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
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

      {/* CTA — with background image */}
      <section className="relative overflow-hidden py-28">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=800&fit=crop&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary-950/95 via-primary-900/90 to-accent-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/10 via-transparent to-transparent" />
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
