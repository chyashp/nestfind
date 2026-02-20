"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import Card, { CardContent } from "@/components/ui/Card";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  EyeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const stats = [
  { label: "Total Listings", value: "0", icon: BuildingOffice2Icon, color: "primary" },
  { label: "Active Listings", value: "0", icon: EyeIcon, color: "success" },
  { label: "Total Enquiries", value: "0", icon: EnvelopeIcon, color: "accent" },
  { label: "Total Value", value: "$0", icon: CurrencyDollarIcon, color: "warning" },
];

export default function OwnerDashboard() {
  return (
    <>
      <DashboardHeader title="Dashboard" subtitle="Welcome back! Here's an overview of your listings." />
      <div className="p-6 lg:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${stat.color}-50`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
