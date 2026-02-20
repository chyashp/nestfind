"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BuildingOffice2Icon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  HomeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import {
  HomeModernIcon,
  FireIcon,
} from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import { cn, formatPrice, formatDate, formatSqft } from "@/lib/utils";
import { api } from "@/lib/api";
import { PROPERTY_TYPES, AMENITIES } from "@/lib/constants";
import type { Property } from "@/types/database";

/* -------------------------------------------------------------------------- */
/*  Lightbox                                                                  */
/* -------------------------------------------------------------------------- */

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-5 z-10 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
        {index + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="relative h-[85vh] w-[90vw]">
        <Image
          src={images[index]}
          alt={`Photo ${index + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Enquiry Modal Content                                                     */
/* -------------------------------------------------------------------------- */

function EnquiryForm({
  propertyId,
  onSuccess,
}: {
  propertyId: string;
  onSuccess: () => void;
}) {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.post("/api/enquiries", {
        property_id: propertyId,
        message: message.trim(),
        phone: phone.trim() || null,
        preferred_date: preferredDate || null,
      });
      setSent(true);
      setTimeout(onSuccess, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send enquiry");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-success-600" />
        </div>
        <h3 className="text-lg font-semibold text-(--foreground)">
          Enquiry Sent Successfully
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          The property owner will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="enquiry-message"
          className="block text-sm font-medium mb-1.5 text-(--foreground)"
        >
          Message <span className="text-error-500">*</span>
        </label>
        <textarea
          id="enquiry-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I'm interested in this property. Could you provide more details?"
          className="block w-full rounded-xl bg-(--input-bg) border border-(--input-border) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
        />
      </div>

      <Input
        id="enquiry-phone"
        label="Phone (optional)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 (555) 123-4567"
      />

      <Input
        id="enquiry-date"
        label="Preferred Viewing Date (optional)"
        type="date"
        value={preferredDate}
        onChange={(e) => setPreferredDate(e.target.value)}
      />

      {error && (
        <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        isLoading={submitting}
        className="w-full"
        size="lg"
      >
        <EnvelopeIcon className="h-5 w-5" />
        Send Enquiry
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail Stat Item                                                          */
/* -------------------------------------------------------------------------- */

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Enquiry modal
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Property>("/api/properties/" + id)
      .then((data) => {
        setProperty(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load property");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const images = property?.images ?? [];
  const hasImages = images.length > 0;

  const lightboxPrev = useCallback(() => {
    setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const lightboxNext = useCallback(() => {
    setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  /* -- Helpers ------------------------------------------------------------ */

  function getListingBadge() {
    if (!property) return null;
    return property.listing_type === "sale" ? (
      <Badge variant="primary" className="px-3 py-1 text-sm">For Sale</Badge>
    ) : (
      <Badge variant="accent" className="px-3 py-1 text-sm">For Rent</Badge>
    );
  }

  function getStatusBadge() {
    if (!property) return null;
    const map: Record<string, "success" | "warning" | "primary" | "accent" | "slate"> = {
      active: "success",
      under_contract: "warning",
      sold: "primary",
      rented: "accent",
      draft: "slate",
    };
    const labels: Record<string, string> = {
      active: "Active",
      under_contract: "Under Contract",
      sold: "Sold",
      rented: "Rented",
      draft: "Draft",
    };
    return (
      <Badge variant={map[property.status] ?? "slate"} className="px-3 py-1 text-sm">
        {labels[property.status] ?? property.status}
      </Badge>
    );
  }

  function getPropertyTypeLabel() {
    if (!property) return "";
    return (
      PROPERTY_TYPES.find((t) => t.value === property.property_type)?.label ??
      property.property_type
    );
  }

  /* -- Loading ------------------------------------------------------------ */

  if (loading) {
    return (
      <main className="min-h-screen bg-(--background)">
        <Nav />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
          <div className="animate-pulse space-y-8">
            {/* Image skeleton */}
            <div className="h-112 rounded-2xl bg-slate-200" />
            {/* Thumbnails skeleton */}
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 w-28 rounded-xl bg-slate-200" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-10 w-2/3 rounded-lg bg-slate-200" />
                <div className="h-6 w-1/3 rounded-lg bg-slate-200" />
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-200" />
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-4 w-4/6 rounded bg-slate-200" />
                </div>
              </div>
              <div className="h-72 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* -- Error -------------------------------------------------------------- */

  if (error || !property) {
    return (
      <main className="min-h-screen bg-(--background)">
        <Nav />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50">
              <XMarkIcon className="h-8 w-8 text-error-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Property Not Found
            </h1>
            <p className="mt-2 text-slate-500">
              {error ?? "The property you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/search">
              <Button variant="primary" className="mt-6">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* -- Render ------------------------------------------------------------- */

  const owner = property.owner;

  return (
    <main className="min-h-screen bg-(--background)">
      <Nav />

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <Lightbox
          images={images}
          index={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
        />
      )}

      <div className="mx-auto max-w-7xl px-6 pt-24 pb-20">
        {/* ---------------------------------------------------------------- */}
        {/*  Image Gallery                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-8">
          {/* Main Image */}
          <div
            className="group relative h-112 w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-100 shadow-lg transition-shadow hover:shadow-xl"
            onClick={() => hasImages && setLightboxOpen(true)}
          >
            {hasImages ? (
              <Image
                src={images[activeImageIndex]}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <HomeModernIcon className="h-24 w-24 text-slate-300" />
              </div>
            )}

            {/* Overlay gradient */}
            {hasImages && (
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* Expand icon */}
            {hasImages && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-black/50 px-3 py-2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <ArrowsPointingOutIcon className="h-4 w-4" />
                Click to expand
              </div>
            )}

            {/* Image count badge */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                {activeImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={cn(
                    "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl transition-all duration-200",
                    i === activeImageIndex
                      ? "ring-2 ring-primary-500 ring-offset-2 shadow-md"
                      : "opacity-60 hover:opacity-100 ring-1 ring-slate-200"
                  )}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Main Content Grid                                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left: Property Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* ---- Header ------------------------------------------------ */}
            <div>
              {/* Badges row */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {getListingBadge()}
                {getStatusBadge()}
                <Badge variant="slate" className="px-3 py-1 text-sm">
                  {getPropertyTypeLabel()}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                {property.title}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-slate-500">
                <MapPinIcon className="h-5 w-5 shrink-0" />
                <span className="text-sm">
                  {property.address}, {property.city}, {property.state}
                  {property.zip_code ? ` ${property.zip_code}` : ""},{" "}
                  {property.country}
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-primary-600 lg:text-4xl">
                  {formatPrice(property.price, property.listing_type)}
                </span>
              </div>
            </div>

            {/* ---- Stats Grid -------------------------------------------- */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatItem
                icon={({ className, ...props }) => (
                  <svg className={className} {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                )}
                label="Bedrooms"
                value={property.bedrooms}
              />
              <StatItem
                icon={({ className, ...props }) => (
                  <svg className={className} {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                label="Bathrooms"
                value={property.bathrooms}
              />
              <StatItem
                icon={Square3Stack3DIcon}
                label="Living Area"
                value={property.sqft ? formatSqft(property.sqft) : null}
              />
              <StatItem
                icon={ArrowsPointingOutIcon}
                label="Lot Size"
                value={property.lot_size ? formatSqft(property.lot_size) : null}
              />
              <StatItem
                icon={CalendarDaysIcon}
                label="Year Built"
                value={property.year_built}
              />
              <StatItem
                icon={({ className, ...props }) => (
                  <svg className={className} {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                )}
                label="Parking"
                value={property.parking_spaces != null ? `${property.parking_spaces} spaces` : null}
              />
            </div>

            {/* ---- Description ------------------------------------------- */}
            {property.description && (
              <div className="rounded-2xl border border-(--card-border) bg-(--card-bg) p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  About This Property
                </h2>
                <p className="whitespace-pre-line leading-relaxed text-slate-600">
                  {property.description}
                </p>
              </div>
            )}

            {/* ---- Amenities --------------------------------------------- */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="rounded-2xl border border-(--card-border) bg-(--card-bg) p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <SparklesIcon className="h-5 w-5 text-accent-500" />
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3.5 py-1.5 text-sm font-medium text-accent-700 ring-1 ring-inset ring-accent-200 transition-colors hover:bg-accent-100"
                    >
                      <CheckCircleIcon className="h-4 w-4 text-accent-500" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ---- Map Placeholder --------------------------------------- */}
            <div className="rounded-2xl border border-(--card-border) bg-(--card-bg) p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <MapPinIcon className="h-5 w-5 text-primary-500" />
                Location
              </h2>
              <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-center">
                  <MapPinIcon className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Map &mdash;{" "}
                    {property.latitude != null && property.longitude != null
                      ? `${property.latitude.toFixed(4)}, ${property.longitude.toFixed(4)}`
                      : "Coordinates unavailable"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Mapbox integration coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* ---- Listing Meta ------------------------------------------ */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>Listed {formatDate(property.created_at)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Updated {formatDate(property.updated_at)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>ID: {property.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/*  Right Sidebar: Owner Contact Card                              */}
          {/* -------------------------------------------------------------- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="rounded-2xl border border-(--card-border) bg-(--card-bg) p-6 shadow-lg">
                <h3 className="mb-5 text-base font-semibold text-slate-900">
                  Listed By
                </h3>

                {owner ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={owner.avatar_url}
                        name={owner.full_name}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {owner.full_name}
                        </p>
                        <p className="text-xs text-slate-500">Property Owner</p>
                      </div>
                    </div>

                    {owner.phone && (
                      <a
                        href={`tel:${owner.phone}`}
                        className="mt-4 flex items-center gap-2.5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <PhoneIcon className="h-4 w-4 text-primary-500" />
                        {owner.phone}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <HomeIcon className="h-7 w-7 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Property Owner
                      </p>
                      <p className="text-xs text-slate-500">
                        Sign in to see contact info
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setEnquiryOpen(true)}
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  Enquire About This Property
                </Button>

                <p className="mt-3 text-center text-xs text-slate-400">
                  We&apos;ll send your enquiry directly to the owner
                </p>
              </div>

              {/* Quick Facts Card */}
              <div className="rounded-2xl border border-(--card-border) bg-(--card-bg) p-6 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-slate-900">
                  Quick Facts
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Property Type</dt>
                    <dd className="font-medium text-slate-900">
                      {getPropertyTypeLabel()}
                    </dd>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Listing Type</dt>
                    <dd className="font-medium text-slate-900">
                      {property.listing_type === "sale" ? "For Sale" : "For Rent"}
                    </dd>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd>{getStatusBadge()}</dd>
                  </div>
                  {property.sqft && (
                    <>
                      <div className="h-px bg-slate-100" />
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Price / sqft</dt>
                        <dd className="font-medium text-slate-900">
                          {formatPrice(Math.round(property.price / property.sqft))}
                        </dd>
                      </div>
                    </>
                  )}
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Listed</dt>
                    <dd className="font-medium text-slate-900">
                      {formatDate(property.created_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Enquiry Modal                                                      */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        title="Enquire About This Property"
        size="md"
      >
        <EnquiryForm
          propertyId={property.id}
          onSuccess={() => setEnquiryOpen(false)}
        />
      </Modal>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nav                                                                       */
/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
            <BuildingOffice2Icon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">NestFind</span>
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Search
        </Link>
      </div>
    </nav>
  );
}
