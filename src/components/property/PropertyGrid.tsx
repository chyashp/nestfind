"use client";

import PropertyCard from "./PropertyCard";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import type { Property } from "@/types/database";

interface PropertyGridProps {
  properties: Property[];
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function PropertyGrid({
  properties,
  savedIds = [],
  onToggleSave,
  isLoading,
  emptyMessage = "No properties found",
}: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--card-border)] overflow-hidden">
            <Skeleton className="aspect-[4/3]" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<BuildingOffice2Icon className="h-8 w-8" />}
        title={emptyMessage}
        description="Try adjusting your search filters to find more properties."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isSaved={savedIds.includes(property.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
