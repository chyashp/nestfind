"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Property, PropertyStatus } from "@/types/database";

const statusColors: Record<PropertyStatus, "slate" | "success" | "warning" | "primary" | "accent"> = {
  draft: "slate",
  active: "success",
  under_contract: "warning",
  sold: "primary",
  rented: "accent",
};

const statusLabels: Record<PropertyStatus, string> = {
  draft: "Draft",
  active: "Active",
  under_contract: "Under Contract",
  sold: "Sold",
  rented: "Rented",
};

export default function OwnerListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await api.get<{ data: Property[] }>("/api/properties/mine");
        setProperties(res.data);
      } catch {
        // If /mine doesn't exist yet, try fetching all
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const filtered =
    filter === "all"
      ? properties
      : properties.filter((p) => p.status === filter);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/api/properties/${id}`);
      setProperties(properties.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete listing");
    }
  };

  return (
    <>
      <DashboardHeader
        title="My Listings"
        subtitle={`${properties.length} total listings`}
        action={
          <Link href="/dashboard/owner/listings/new">
            <Button size="md">
              <PlusIcon className="h-4 w-4" />
              Add Property
            </Button>
          </Link>
        }
      />
      <div className="p-6 lg:p-8">
        {/* Filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {["all", "active", "draft", "under_contract", "sold", "rented"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 [data-theme=dark]_&:bg-slate-800 [data-theme=dark]_&:text-slate-300 [data-theme=dark]_&:hover:bg-slate-700"
              }`}
            >
              {f === "all" ? "All" : statusLabels[f as PropertyStatus]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--card-border)] overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BuildingOffice2Icon className="h-8 w-8" />}
            title={filter === "all" ? "No listings yet" : `No ${statusLabels[filter as PropertyStatus] || filter} listings`}
            description="Create your first property listing to get started."
            action={
              <Link href="/dashboard/owner/listings/new">
                <Button>
                  <PlusIcon className="h-4 w-4" />
                  Add Property
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <div
                key={property.id}
                className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-slate-100 [data-theme=dark]_&:bg-slate-800">
                  {property.images?.[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
                      <BuildingOffice2Icon className="h-12 w-12 text-primary-300" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge variant={statusColors[property.status]}>
                      {statusLabels[property.status]}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--foreground)] truncate">
                    {property.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500 truncate">
                    {property.city}, {property.state}
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary-600">
                    {formatPrice(property.price, property.listing_type)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/dashboard/owner/listings/${property.id}/edit`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--card-border)] py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 [data-theme=dark]_&:text-slate-300 [data-theme=dark]_&:hover:bg-slate-800 transition-colors"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex items-center justify-center rounded-xl border border-error-200 px-3 py-2 text-sm text-error-600 hover:bg-error-50 [data-theme=dark]_&:border-error-800 [data-theme=dark]_&:hover:bg-error-950 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
