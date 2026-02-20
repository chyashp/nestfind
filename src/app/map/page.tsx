"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import MapGL, { Marker, Source, Layer } from "react-map-gl/mapbox";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import type { GeoJSON } from "geojson";
import {
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ListBulletIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

import PropertyCard from "@/components/property/PropertyCard";
import Skeleton from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import type { Property, PaginatedResponse } from "@/types/database";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  latitude: 39.8,
  longitude: -98.5,
  zoom: 4,
};

// ─── Cluster layer styles ────────────────────────────────────────────────────

const clusterLayer: mapboxgl.LayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "properties",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#818cf8", // accent-400 (< 10)
      10,
      "#6366f1", // primary-500 (10-50)
      50,
      "#4f46e5", // primary-600 (50+)
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 10, 26, 50, 34],
    "circle-stroke-width": 3,
    "circle-stroke-color": "#ffffff",
  },
};

const clusterCountLayer: mapboxgl.LayerSpecification = {
  id: "cluster-count",
  type: "symbol",
  source: "properties",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 13,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

// ─── Price Marker ────────────────────────────────────────────────────────────

function PriceMarker({
  property,
  isActive,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  property: Property;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const highlighted = isActive || isHovered;

  return (
    <Marker
      longitude={property.longitude!}
      latitude={property.latitude!}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          "cursor-pointer select-none whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold shadow-md transition-all duration-150",
          highlighted
            ? "z-10 scale-110 bg-primary-600 text-white shadow-lg shadow-primary-500/30"
            : "bg-white text-slate-800 shadow-slate-200/80 hover:shadow-lg hover:shadow-slate-300/50 hover:scale-105"
        )}
      >
        {formatPrice(property.price, property.listing_type)}
      </div>
    </Marker>
  );
}

// ─── Skeleton card for loading state ─────────────────────────────────────────

function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function MapPage() {
  const mapRef = useRef<MapRef>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  // Derived: only properties that have coords (for markers)
  const geoProperties = useMemo(
    () => properties.filter((p) => p.latitude !== null && p.longitude !== null),
    [properties]
  );

  // GeoJSON for clustering
  const geojson = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: geoProperties.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude!, p.latitude!],
        },
        properties: {
          id: p.id,
          price: p.price,
          listing_type: p.listing_type,
        },
      })),
    }),
    [geoProperties]
  );

  // Whether to show individual markers vs clusters
  // Show individual markers at higher zoom levels
  const showIndividualMarkers = viewState.zoom >= 10;

  // ── Fetch properties within map bounds ──────────────────────────────────

  const fetchProperties = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    setIsLoading(true);
    try {
      const response = await api.get<PaginatedResponse<Property>>(
        "/api/properties",
        { north, south, east, west, limit: 100 }
      );
      setProperties(response.data);
    } catch {
      // Silently handle errors — user can re-pan to retry
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Map move handler with debounce ──────────────────────────────────────

  const handleMoveEnd = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);

      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
      fetchTimerRef.current = setTimeout(() => {
        fetchProperties();
      }, 300);
    },
    [fetchProperties]
  );

  // Fetch once on initial load after map is ready
  const handleMapLoad = useCallback(() => {
    fetchProperties();
  }, [fetchProperties]);

  // ── Click marker → scroll card into view ────────────────────────────────

  const handleMarkerClick = useCallback((propertyId: string) => {
    setActivePropertyId(propertyId);
    setMobileView("list");

    // Scroll the card into view
    requestAnimationFrame(() => {
      const el = cardRefs.current.get(propertyId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }, []);

  // ── Hover card → highlight marker ───────────────────────────────────────

  const handleCardHover = useCallback((propertyId: string | null) => {
    setHoveredPropertyId(propertyId);
  }, []);

  // ── Handle cluster click → zoom in ─────────────────────────────────────

  const handleClusterClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });

      if (features.length === 0) return;

      const feature = features[0];
      const clusterId = feature.properties?.cluster_id;

      const source = map.getSource("properties") as mapboxgl.GeoJSONSource;
      if (!source) return;

      source.getClusterExpansionZoom(clusterId, (err: Error | null | undefined, zoom: number | null | undefined) => {
        if (err || zoom === null || zoom === undefined) return;

        const geometry = feature.geometry as GeoJSON.Point;
        map.easeTo({
          center: geometry.coordinates as [number, number],
          zoom,
        });
      });
    },
    []
  );

  // Register cluster click events
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const onClusterClick = (e: mapboxgl.MapMouseEvent) => handleClusterClick(e);
    const onMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", "clusters", onClusterClick);
    map.on("mouseenter", "clusters", onMouseEnter);
    map.on("mouseleave", "clusters", onMouseLeave);

    return () => {
      map.off("click", "clusters", onClusterClick);
      map.off("mouseenter", "clusters", onMouseEnter);
      map.off("mouseleave", "clusters", onMouseLeave);
    };
  }, [handleClusterClick]);

  // ── Fly to location (from geocoding search) ───────────────────────────

  const handleFlyTo = useCallback(
    (lng: number, lat: number, zoom?: number) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      map.flyTo({ center: [lng, lat], zoom: zoom ?? 12, duration: 1500 });
    },
    []
  );

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, []);

  // ── No token fallback ──────────────────────────────────────────────────

  if (!MAPBOX_TOKEN) {
    return (
      <main className="flex h-screen flex-col bg-(--background)">
        <MapNav onFlyTo={handleFlyTo} />
        <div className="flex flex-1 items-center justify-center bg-slate-100">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <MapIcon className="h-8 w-8 text-primary-500" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              Map Unavailable
            </p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Set <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-mono text-slate-700">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable the interactive map.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <ListBulletIcon className="h-4 w-4" />
              Browse List View
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <main className="flex h-screen flex-col bg-(--background)">
      {/* Top navigation */}
      <MapNav onFlyTo={handleFlyTo} />

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div
          className={cn(
            "relative flex-1",
            mobileView === "list" ? "hidden lg:block" : "block"
          )}
        >
          <MapGL
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onMoveEnd={handleMoveEnd}
            onLoad={handleMapLoad}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            maxZoom={18}
            minZoom={2}
            reuseMaps
          >
            {/* Cluster source + layers (visible when zoomed out) */}
            {!showIndividualMarkers && (
              <Source
                id="properties"
                type="geojson"
                data={geojson}
                cluster
                clusterMaxZoom={14}
                clusterRadius={60}
              >
                <Layer {...clusterLayer} />
                <Layer {...clusterCountLayer} />
              </Source>
            )}

            {/* Individual price markers (visible when zoomed in) */}
            {showIndividualMarkers &&
              geoProperties.map((property) => (
                <PriceMarker
                  key={property.id}
                  property={property}
                  isActive={activePropertyId === property.id}
                  isHovered={hoveredPropertyId === property.id}
                  onClick={() => handleMarkerClick(property.id)}
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                />
              ))}
          </MapGL>

          {/* Mobile toggle button */}
          <button
            onClick={() => setMobileView("list")}
            className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl transition-transform hover:scale-105 active:scale-95 lg:hidden"
          >
            <ListBulletIcon className="h-4 w-4" />
            Show List
          </button>
        </div>

        {/* Property sidebar / list */}
        <div
          className={cn(
            "flex flex-col border-l border-slate-200 bg-white",
            mobileView === "map"
              ? "hidden lg:flex lg:w-105"
              : "w-full lg:flex lg:w-105"
          )}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700">
              {isLoading ? (
                <span className="text-slate-400">Searching...</span>
              ) : (
                <>
                  {properties.length}
                  {properties.length === 1 ? " property" : " properties"} in
                  this area
                </>
              )}
            </p>

            {/* Mobile: back to map */}
            <button
              onClick={() => setMobileView("map")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 lg:hidden"
            >
              <MapIcon className="h-4 w-4" />
              Map
            </button>
          </div>

          {/* Scrollable property list */}
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <BuildingOffice2Icon className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  No properties found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try panning or zooming the map to explore a different area
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    ref={(el) => {
                      if (el) {
                        cardRefs.current.set(property.id, el);
                      } else {
                        cardRefs.current.delete(property.id);
                      }
                    }}
                    onMouseEnter={() => handleCardHover(property.id)}
                    onMouseLeave={() => handleCardHover(null)}
                    className={cn(
                      "rounded-2xl transition-shadow duration-150",
                      activePropertyId === property.id &&
                        "ring-2 ring-primary-500 ring-offset-2"
                    )}
                  >
                    <PropertyCard property={property} compact />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Geocoding suggestion type ───────────────────────────────────────────────

interface GeoSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
}

// ─── Top Navigation Bar with Geocoding Search ───────────────────────────────

function MapNav({ onFlyTo }: { onFlyTo: (lng: number, lat: number, zoom?: number) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text.trim() || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&types=place,neighborhood,address,locality,region&limit=5`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelect = (suggestion: GeoSuggestion) => {
    setQuery(suggestion.place_name);
    setIsOpen(false);
    setSuggestions([]);
    const zoom = suggestion.place_type.includes("address") ? 15 : 12;
    onFlyTo(suggestion.center[0], suggestion.center[1], zoom);
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    // If there are suggestions, pick the first one
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      // Trigger a fetch and pick the first result
      fetchSuggestions(query).then(() => {
        // handled by state update — user can press Enter again
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(suggestions[activeIndex]);
        } else {
          handleSubmit();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <nav className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
          <BuildingOffice2Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-slate-900">NestFind</span>
      </Link>

      <div className="flex items-center gap-3">
        {/* Geocoding search */}
        <div ref={containerRef} className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-primary-400 transition-colors">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search city or address..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setIsOpen(true)}
              className="w-40 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:w-56"
            />
          </div>

          {/* Autocomplete dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {suggestions.map((s, index) => {
                const parts = s.place_name.split(", ");
                const primary = parts[0];
                const secondary = parts.slice(1).join(", ");
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      index === activeIndex ? "bg-primary-50" : "hover:bg-slate-50"
                    )}
                  >
                    <MapPinIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        index === activeIndex ? "text-primary-500" : "text-slate-400"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{primary}</p>
                      {secondary && (
                        <p className="truncate text-xs text-slate-400">{secondary}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/search"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <ListBulletIcon className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </Link>
      </div>
    </nav>
  );
}
