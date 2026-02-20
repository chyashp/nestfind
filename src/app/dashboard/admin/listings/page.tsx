"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Property, PropertyStatus } from "@/types/database";

const statusColors: Record<PropertyStatus, "slate" | "success" | "warning" | "primary" | "accent"> = {
  draft: "slate",
  active: "success",
  under_contract: "warning",
  sold: "primary",
  rented: "accent",
};

export default function AdminListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get<{ data: Property[] }>("/api/admin/listings");
        setProperties(res.data);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/admin/listings/${id}`, { status });
      setProperties(
        properties.map((p) =>
          p.id === id ? { ...p, status: status as PropertyStatus } : p
        )
      );
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <>
      <DashboardHeader
        title="All Listings"
        subtitle={`${properties.length} total`}
      />
      <div className="p-6 lg:p-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {property.images?.[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BuildingOffice2Icon className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--foreground)] truncate">
                      {property.title}
                    </p>
                    <Badge variant={statusColors[property.status]}>
                      {property.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {property.city}, {property.state} &middot; by{" "}
                    {property.owner?.full_name || "Unknown"} &middot;{" "}
                    {formatDate(property.created_at)}
                  </p>
                </div>
                <p className="shrink-0 text-base font-bold text-primary-600">
                  {formatPrice(property.price, property.listing_type)}
                </p>
                <select
                  value={property.status}
                  onChange={(e) => updateStatus(property.id, e.target.value)}
                  className="shrink-0 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-1.5 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="under_contract">Under Contract</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
