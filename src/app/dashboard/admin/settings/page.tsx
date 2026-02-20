"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import Card, { CardContent } from "@/components/ui/Card";

export default function AdminSettingsPage() {
  return (
    <>
      <DashboardHeader title="Platform Settings" subtitle="Manage platform configuration" />
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Platform Configuration
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Platform settings and configuration options will be available here.
              This includes theme customization, notification preferences, and
              platform-wide settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
