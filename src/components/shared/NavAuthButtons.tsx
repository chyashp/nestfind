"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { clearUser } from "@/store/slices/auth";
import { createClient } from "@/lib/supabase/client";

interface Props {
  variant?: "dark" | "light";
}

export default function NavAuthButtons({ variant = "dark" }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userId, role } = useAppSelector((s) => s.auth);

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
              ? "text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              : "text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          }
        >
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className={
            isDark
              ? "rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/25 hover:bg-primary-500 transition-colors"
              : "rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
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
