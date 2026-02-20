"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { EnvelopeIcon, CheckIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Enquiry, EnquiryStatus } from "@/types/database";

const statusColors: Record<EnquiryStatus, "primary" | "slate" | "success" | "slate"> = {
  unread: "primary",
  read: "slate",
  replied: "success",
  archived: "slate",
};

export default function OwnerEnquiriesPage() {
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

  const updateStatus = async (id: string, status: EnquiryStatus) => {
    try {
      await api.patch(`/api/enquiries/${id}`, { status });
      setEnquiries(
        enquiries.map((e) => (e.id === id ? { ...e, status } : e))
      );
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <>
      <DashboardHeader
        title="Enquiries"
        subtitle={`${enquiries.filter((e) => e.status === "unread").length} unread`}
      />
      <div className="p-6 lg:p-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <EmptyState
            icon={<EnvelopeIcon className="h-8 w-8" />}
            title="No enquiries yet"
            description="When buyers enquire about your properties, they'll appear here."
          />
        ) : (
          <div className="space-y-3">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className={`rounded-2xl border bg-[var(--card-bg)] p-5 transition-colors ${
                  enquiry.status === "unread"
                    ? "border-primary-200 bg-primary-50/30 [data-theme=dark]_&:border-primary-800 [data-theme=dark]_&:bg-primary-950/40"
                    : "border-[var(--card-border)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={enquiry.sender?.avatar_url}
                      name={enquiry.sender?.full_name || "User"}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--foreground)]">
                          {enquiry.sender?.full_name || "Anonymous"}
                        </p>
                        <Badge variant={statusColors[enquiry.status]}>
                          {enquiry.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">
                        Re: {enquiry.property?.title || "Property"} &middot;{" "}
                        {formatDate(enquiry.created_at)}
                      </p>
                      <p className="mt-2 text-sm text-[var(--foreground)]">
                        {enquiry.message}
                      </p>
                      {enquiry.phone && (
                        <p className="mt-1 text-xs text-slate-500">
                          Phone: {enquiry.phone}
                        </p>
                      )}
                      {enquiry.preferred_date && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Preferred viewing: {formatDate(enquiry.preferred_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {enquiry.status === "unread" && (
                      <button
                        onClick={() => updateStatus(enquiry.id, "read")}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 border border-[var(--card-border)] hover:bg-slate-50 [data-theme=dark]_&:text-slate-300 [data-theme=dark]_&:hover:bg-slate-800 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    {(enquiry.status === "unread" || enquiry.status === "read") && (
                      <button
                        onClick={() => updateStatus(enquiry.id, "replied")}
                        className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors"
                      >
                        <CheckIcon className="h-3 w-3" />
                        Replied
                      </button>
                    )}
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
