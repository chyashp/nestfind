"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Profile, UserRole } from "@/types/database";

const roleColors: Record<UserRole, "primary" | "accent" | "error"> = {
  owner: "primary",
  buyer: "accent",
  admin: "error",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api.get<{ data: Profile[] }>("/api/admin/users");
        setUsers(res.data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filtered =
    filterRole === "all"
      ? users
      : users.filter((u) => u.role === filterRole);

  return (
    <>
      <DashboardHeader
        title="Users"
        subtitle={`${users.length} total users`}
      />
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex gap-2">
          {["all", "owner", "buyer", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filterRole === r
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}s
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {filtered.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar_url}
                            name={user.full_name}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {user.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleColors[user.role]}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
