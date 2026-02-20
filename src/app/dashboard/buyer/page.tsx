"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import Card, { CardContent } from "@/components/ui/Card";
import {
  HeartIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const stats = [
  { label: "Saved Properties", value: "0", icon: HeartIcon, color: "primary" },
  { label: "Enquiries Sent", value: "0", icon: EnvelopeIcon, color: "accent" },
  { label: "Recent Searches", value: "0", icon: MagnifyingGlassIcon, color: "success" },
];

export default function BuyerDashboard() {
  return (
    <>
      <DashboardHeader title="Dashboard" subtitle="Welcome back! Start exploring properties." />
      <div className="p-6 lg:p-8">
        <div className="grid gap-6 sm:grid-cols-3">
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
