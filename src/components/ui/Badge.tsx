import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "accent" | "success" | "error" | "warning" | "slate";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-50 text-primary-700 ring-primary-200",
  accent: "bg-accent-50 text-accent-700 ring-accent-200",
  success: "bg-success-50 text-success-600 ring-emerald-200",
  error: "bg-error-50 text-error-600 ring-rose-200",
  warning: "bg-warning-50 text-warning-600 ring-amber-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function Badge({ children, variant = "primary", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
