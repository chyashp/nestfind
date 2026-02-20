import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/enquiries/[id] — Update enquiry status (owner)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  // Verify ownership or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (enquiry.owner_id !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const validStatuses = ["unread", "read", "replied", "archived"];

  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be: unread, read, replied, or archived" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("enquiries")
    .update({ status: body.status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
