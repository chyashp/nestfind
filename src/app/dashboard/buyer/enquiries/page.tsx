"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Enquiry, EnquiryStatus } from "@/types/database";

const statusColors: Record<EnquiryStatus, "primary" | "slate" | "success"> = {
  unread: "primary",
  read: "slate",
  replied: "success",
  archived: "slate",
};

export default function BuyerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get<{ data: Enquiry[] }>("/api/enquiries");
        setEnquiries(res.data);
      } catch {
        setEnquiries([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <>
      <DashboardHeader
        title="My Enquiries"
        subtitle={`${enquiries.length} enquiries sent`}
      />
      <div className="p-6 lg:p-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <EmptyState
            icon={<EnvelopeIcon className="h-8 w-8" />}
            title="No enquiries yet"
            description="When you enquire about a property, it will appear here."
            action={
              <Link
                href="/search"
                className="inline-flex items-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Browse Properties
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {enquiries.map((enquiry) => (
              <Link
                key={enquiry.id}
                href={`/properties/${enquiry.property_id}`}
                className="block rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-colors hover:border-primary-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--foreground)]">
                        {enquiry.property?.title || "Property"}
                      </p>
                      <Badge variant={statusColors[enquiry.status]}>
                        {enquiry.status}
                      </Badge>
                    </div>
                    {enquiry.property && (
                      <p className="mt-0.5 text-sm text-primary-600 font-medium">
                        {formatPrice(
                          enquiry.property.price,
                          enquiry.property.listing_type
                        )}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {enquiry.message}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-slate-400">
                    {formatDate(enquiry.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
