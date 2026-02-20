"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAppDispatch } from "@/hooks/use-redux";
import { setSidebarOpen } from "@/store/slices/ui";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  action,
}: DashboardHeaderProps) {
  const dispatch = useAppDispatch();

  return (
    <header className="flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--card-bg)] px-6 py-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(setSidebarOpen(true))}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
