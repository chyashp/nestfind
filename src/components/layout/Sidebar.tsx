"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  BuildingOffice2Icon,
  PlusCircleIcon,
  EnvelopeIcon,
  HeartIcon,
  Cog6ToothIcon,
  UsersIcon,
  ChartBarIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { useTheme } from "@/hooks/use-theme";
import { clearUser } from "@/store/slices/auth";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import type { UserRole } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ownerNav: NavItem[] = [
  { href: "/dashboard/owner", label: "Overview", icon: HomeIcon },
  { href: "/dashboard/owner/listings", label: "My Listings", icon: BuildingOffice2Icon },
  { href: "/dashboard/owner/listings/new", label: "Add Property", icon: PlusCircleIcon },
  { href: "/dashboard/owner/enquiries", label: "Enquiries", icon: EnvelopeIcon },
  { href: "/dashboard/owner/settings", label: "Settings", icon: Cog6ToothIcon },
];

const buyerNav: NavItem[] = [
  { href: "/dashboard/buyer", label: "Overview", icon: HomeIcon },
  { href: "/dashboard/buyer/saved", label: "Saved Properties", icon: HeartIcon },
  { href: "/dashboard/buyer/enquiries", label: "My Enquiries", icon: EnvelopeIcon },
  { href: "/dashboard/buyer/settings", label: "Settings", icon: Cog6ToothIcon },
];

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: ChartBarIcon },
  { href: "/dashboard/admin/users", label: "Users", icon: UsersIcon },
  { href: "/dashboard/admin/listings", label: "All Listings", icon: BuildingOffice2Icon },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Cog6ToothIcon },
];

function getNavItems(role: UserRole | null): NavItem[] {
  switch (role) {
    case "owner":
      return ownerNav;
    case "buyer":
      return buyerNav;
    case "admin":
      return adminNav;
    default:
      return [];
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  const { role, fullName, avatarUrl, email } = useAppSelector((s) => s.auth);
  const navItems = getNavItems(role);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    dispatch(clearUser());
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[var(--sidebar-bg)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
          <BuildingOffice2Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">NestFind</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-600/30 text-white"
                  : "text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Browse link */}
      <div className="px-3 pb-2">
        <Link
          href="/search"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white transition-colors"
        >
          <HomeIcon className="h-5 w-5 shrink-0" />
          Browse Properties
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white transition-colors"
        >
          {theme === "light" ? (
            <MoonIcon className="h-5 w-5 shrink-0" />
          ) : (
            <SunIcon className="h-5 w-5 shrink-0" />
          )}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5 shrink-0" />
          Sign Out
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar src={avatarUrl} name={fullName || "User"} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {fullName || "User"}
            </p>
            <p className="truncate text-xs text-[var(--sidebar-text)]">
              {email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
