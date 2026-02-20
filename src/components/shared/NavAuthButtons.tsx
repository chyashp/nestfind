"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { clearUser } from "@/store/slices/auth";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";

interface Props {
  variant?: "dark" | "light";
}

export default function NavAuthButtons({ variant = "dark" }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userId, role, fullName, avatarUrl } = useAppSelector((s) => s.auth);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    dispatch(clearUser());
    router.push("/login");
  };

  const dashboardPath = `/dashboard/${role || "buyer"}`;
  const isDark = variant === "dark";

  if (userId) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={dashboardPath}
          className={
            isDark
              ? "text-sm font-semibold text-slate-200 hover:text-white transition-colors"
              : "text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          }
        >
          Home
        </Link>
        <div className="flex items-center gap-2">
          <Avatar src={avatarUrl} name={fullName || "User"} size="xs" />
          <span
            className={
              isDark
                ? "text-sm font-medium text-slate-200"
                : "text-sm font-medium text-slate-700"
            }
          >
            {fullName || "User"}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className={
            isDark
              ? "rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              : "rounded-xl border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          }
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (isDark) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/25 hover:bg-primary-500 transition-colors"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
    >
      Sign In
    </Link>
  );
}
