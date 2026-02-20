import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/enquiries — Get enquiries (owner: for their properties, buyer: their sent)
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

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let query;

  if (profile.role === "owner") {
    // Owner sees enquiries for their properties
    query = supabase
      .from("enquiries")
      .select("*, property:properties(id, title, images, city, state), sender:profiles!enquiries_sender_id_fkey(full_name, avatar_url, phone)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
  } else if (profile.role === "admin") {
    // Admin sees all
    query = supabase
      .from("enquiries")
      .select("*, property:properties(id, title, images, city, state), sender:profiles!enquiries_sender_id_fkey(full_name, avatar_url)")
      .order("created_at", { ascending: false });
  } else {
    // Buyer sees their sent enquiries
    query = supabase
      .from("enquiries")
      .select("*, property:properties(id, title, images, city, state, price, listing_type)")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST /api/enquiries — Send an enquiry (buyer)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.property_id || !body.message) {
    return NextResponse.json(
      { error: "property_id and message are required" },
      { status: 400 }
    );
  }

  // Get property owner
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", body.property_id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  if (property.owner_id === user.id) {
    return NextResponse.json(
      { error: "Cannot enquire about your own property" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      property_id: body.property_id,
      sender_id: user.id,
      owner_id: property.owner_id,
      message: body.message,
      phone: body.phone || null,
      preferred_date: body.preferred_date || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
