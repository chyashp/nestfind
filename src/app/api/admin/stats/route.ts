import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/stats — Platform statistics (admin only)
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, properties, activeListings, enquiries] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("enquiries").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    data: {
      totalUsers: users.count || 0,
      totalListings: properties.count || 0,
      activeListings: activeListings.count || 0,
      totalEnquiries: enquiries.count || 0,
    },
  });
}
