"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import PropertyGrid from "@/components/property/PropertyGrid";
import NavAuthButtons from "@/components/shared/NavAuthButtons";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  SORT_OPTIONS,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  AMENITIES,
  ITEMS_PER_PAGE,
} from "@/lib/constants";
import { api } from "@/lib/api";
import type { Property, PaginatedResponse } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Inner component that reads useSearchParams (must be inside Suspense) */
/* ------------------------------------------------------------------ */

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ---- filter state ---- */
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [listingType, setListingType] = useState(searchParams.get("listing_type") ?? "");
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "");
  const [bathrooms, setBathrooms] = useState(searchParams.get("bathrooms") ?? "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "newest");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  /* ---- more filters ---- */
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [minSqft, setMinSqft] = useState(searchParams.get("min_sqft") ?? "");
  const [maxSqft, setMaxSqft] = useState(searchParams.get("max_sqft") ?? "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    const raw = searchParams.getAll("amenities");
    return raw.length > 0 ? raw : [];
  });

  /* ---- UI state ---- */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  /* ---- debounce for text inputs ---- */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);
  const [debouncedMinSqft, setDebouncedMinSqft] = useState(minSqft);
  const [debouncedMaxSqft, setDebouncedMaxSqft] = useState(maxSqft);

  /* Debounce text-based inputs */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
      setDebouncedMinSqft(minSqft);
      setDebouncedMaxSqft(maxSqft);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, minPrice, maxPrice, minSqft, maxSqft]);

  /* Reset to page 1 when any filter changes */
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedQuery,
    listingType,
    propertyType,
    debouncedMinPrice,
    debouncedMaxPrice,
    bedrooms,
    bathrooms,
    sortBy,
    debouncedMinSqft,
    debouncedMaxSqft,
    selectedAmenities,
  ]);

  /* ---- Fetch properties ---- */
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: ITEMS_PER_PAGE,
        sort: sortBy,
      };
      if (debouncedQuery) params.query = debouncedQuery;
      if (listingType) params.listing_type = listingType;
      if (propertyType) params.property_type = propertyType;
      if (debouncedMinPrice) params.min_price = Number(debouncedMinPrice);
      if (debouncedMaxPrice) params.max_price = Number(debouncedMaxPrice);
      if (bedrooms) params.bedrooms = Number(bedrooms);
      if (bathrooms) params.bathrooms = Number(bathrooms);
      if (debouncedMinSqft) params.min_sqft = Number(debouncedMinSqft);
      if (debouncedMaxSqft) params.max_sqft = Number(debouncedMaxSqft);
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities;

      const res = await api.get<PaginatedResponse<Property>>("/api/properties", params);
      setProperties(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setProperties([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    sortBy,
    debouncedQuery,
    listingType,
    propertyType,
    debouncedMinPrice,
    debouncedMaxPrice,
    bedrooms,
    bathrooms,
    debouncedMinSqft,
    debouncedMaxSqft,
    selectedAmenities,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  /* ---- Sync filters to URL ---- */
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("query", debouncedQuery);
    if (listingType) params.set("listing_type", listingType);
    if (propertyType) params.set("property_type", propertyType);
    if (debouncedMinPrice) params.set("min_price", debouncedMinPrice);
    if (debouncedMaxPrice) params.set("max_price", debouncedMaxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy);
    if (debouncedMinSqft) params.set("min_sqft", debouncedMinSqft);
    if (debouncedMaxSqft) params.set("max_sqft", debouncedMaxSqft);
    selectedAmenities.forEach((a) => params.append("amenities", a));
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    const newUrl = qs ? `/search?${qs}` : "/search";
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedQuery,
    listingType,
    propertyType,
    debouncedMinPrice,
    debouncedMaxPrice,
    bedrooms,
    bathrooms,
    sortBy,
    page,
    debouncedMinSqft,
    debouncedMaxSqft,
    selectedAmenities,
  ]);

  /* ---- Toggle amenity ---- */
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  /* ---- Toggle save ---- */
  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  /* ---- Clear all filters ---- */
  const clearAllFilters = () => {
    setQuery("");
    setListingType("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setSortBy("newest");
    setMinSqft("");
    setMaxSqft("");
    setSelectedAmenities([]);
    setPage(1);
  };

  const hasActiveFilters =
    query ||
    listingType ||
    propertyType ||
    minPrice ||
    maxPrice ||
    bedrooms ||
    bathrooms ||
    minSqft ||
    maxSqft ||
    selectedAmenities.length > 0;

  /* ---- Pagination helpers ---- */
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | "...")[] = [];
    if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* -------- Navigation -------- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary-600 to-accent-600 shadow-sm">
              <BuildingOffice2Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">NestFind</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/map"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              <MapIcon className="h-4 w-4" />
              Map View
            </Link>
            <NavAuthButtons variant="light" />
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* -------- Search Bar -------- */}
        <div className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-6 pt-6 pb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by city, address, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* -------- Filter Bar -------- */}
          <div className="mx-auto max-w-7xl px-6 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Buy / Rent toggle */}
              <div className="flex items-center rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => setListingType(listingType === "sale" ? "" : "sale")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    listingType === "sale"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setListingType(listingType === "rent" ? "" : "rent")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    listingType === "rent"
                      ? "bg-accent-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Rent
                </button>
              </div>

              {/* Property type */}
              <Select
                options={PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                placeholder="Property Type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-40"
              />

              {/* Price range */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-28 rounded-xl border border-(--input-border) bg-(--input-bg) px-3 py-2.5 text-sm text-(--foreground) placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-28 rounded-xl border border-(--input-border) bg-(--input-bg) px-3 py-2.5 text-sm text-(--foreground) placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Bedrooms */}
              <Select
                options={BEDROOM_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
                placeholder="Beds"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-28"
              />

              {/* Bathrooms */}
              <Select
                options={BATHROOM_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
                placeholder="Baths"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-28"
              />

              {/* Sort */}
              <Select
                options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-44"
              />

              {/* More Filters toggle */}
              <Button
                variant={showMoreFilters ? "secondary" : "outline"}
                size="md"
                onClick={() => setShowMoreFilters((v) => !v)}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                {showMoreFilters ? "Less Filters" : "More Filters"}
              </Button>

              {/* Grid / List toggle */}
              <div className="ml-auto flex items-center gap-1 rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-1.5 transition-all ${
                    viewMode === "grid"
                      ? "bg-primary-50 text-primary-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Grid view"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-1.5 transition-all ${
                    viewMode === "list"
                      ? "bg-primary-50 text-primary-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="List view"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* -------- More Filters Panel (slide-down) -------- */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showMoreFilters ? "mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                {/* Sqft Range */}
                <div className="mb-5">
                  <h4 className="mb-2.5 text-sm font-semibold text-slate-700">Square Footage</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min sqft"
                      value={minSqft}
                      onChange={(e) => setMinSqft(e.target.value)}
                      className="w-36"
                    />
                    <span className="text-sm text-slate-400">to</span>
                    <Input
                      type="number"
                      placeholder="Max sqft"
                      value={maxSqft}
                      onChange={(e) => setMaxSqft(e.target.value)}
                      className="w-36"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="mb-2.5 text-sm font-semibold text-slate-700">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-primary-100 text-primary-700 ring-1 ring-primary-300"
                              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear all filters */}
                {hasActiveFilters && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* -------- Results -------- */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Results count + active filter pills */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {isLoading ? (
                <span className="inline-block h-4 w-32 animate-pulse rounded bg-slate-200" />
              ) : (
                <>
                  <span className="font-semibold text-slate-900">{total.toLocaleString()}</span>{" "}
                  {total === 1 ? "property" : "properties"} found
                </>
              )}
            </p>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Property Grid */}
          <PropertyGrid
            properties={properties}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            isLoading={isLoading}
            emptyMessage="No properties found. Try adjusting your filters."
          />

          {/* -------- Pagination -------- */}
          {totalPages > 1 && !isLoading && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-sm text-slate-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                        p === page
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported page — wraps inner component in Suspense for searchParams */
/* ------------------------------------------------------------------ */

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <p className="text-sm text-slate-500">Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
