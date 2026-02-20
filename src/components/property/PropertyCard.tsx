"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/types/database";

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  compact?: boolean;
  layout?: "grid" | "list";
}

export default function PropertyCard({
  property,
  isSaved,
  onToggleSave,
  compact,
  layout = "grid",
}: PropertyCardProps) {
  const mainImage = property.images?.[0];

  if (layout === "list") {
    return (
      <Link
        href={`/properties/${property.id}`}
        className="group flex rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-500/5"
      >
        {/* Image */}
        <div className="relative w-72 shrink-0 overflow-hidden bg-slate-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="288px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
              <span className="text-4xl text-primary-300">&#9750;</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant={property.listing_type === "sale" ? "primary" : "accent"}>
              {property.listing_type === "sale" ? "For Sale" : "For Rent"}
            </Badge>
          </div>

          {/* Save button */}
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(property.id);
              }}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110"
            >
              {isSaved ? (
                <HeartSolidIcon className="h-4.5 w-4.5 text-error-500" />
              ) : (
                <HeartIcon className="h-4.5 w-4.5 text-slate-600" />
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-center p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">
                {property.title}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500 truncate">
                {property.address}, {property.city}, {property.state}
              </p>
            </div>
            <span className="shrink-0 text-lg font-bold text-slate-900">
              {formatPrice(property.price, property.listing_type)}
            </span>
          </div>

          {property.description && (
            <p className="mt-2 text-sm text-slate-500 line-clamp-2">
              {property.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
            {property.bedrooms !== null && (
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}</span>
            )}
            {property.bathrooms !== null && (
              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}</span>
            )}
            {property.sqft !== null && (
              <span>{property.sqft.toLocaleString()} sqft</span>
            )}
            {property.property_type && (
              <span className="capitalize">{property.property_type}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
            <span className="text-4xl text-primary-300">&#9750;</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={property.listing_type === "sale" ? "primary" : "accent"}>
            {property.listing_type === "sale" ? "For Sale" : "For Rent"}
          </Badge>
        </div>

        {/* Save button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110"
          >
            {isSaved ? (
              <HeartSolidIcon className="h-4.5 w-4.5 text-error-500" />
            ) : (
              <HeartIcon className="h-4.5 w-4.5 text-slate-600" />
            )}
          </button>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-lg bg-white/95 backdrop-blur-sm px-3 py-1.5 text-base font-bold text-slate-900 shadow-sm">
            {formatPrice(property.price, property.listing_type)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className={compact ? "p-3" : "p-4"}>
        <h3 className="font-semibold text-[var(--foreground)] truncate">
          {property.title}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500 truncate">
          {property.address}, {property.city}, {property.state}
        </p>

        {!compact && (
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
            {property.bedrooms !== null && (
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}</span>
            )}
            {property.bathrooms !== null && (
              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}</span>
            )}
            {property.sqft !== null && (
              <span>{property.sqft.toLocaleString()} sqft</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
