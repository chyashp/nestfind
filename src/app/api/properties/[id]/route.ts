import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/properties/[id] — Get single property
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the property without the owner join (avoids RLS issues on profiles)
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }

  // Fetch owner profile bypassing RLS via admin client, falling back to
  // the regular client when the service-role key is unavailable.
  const profileClient = createAdminClient() ?? supabase;
  const { data: ownerProfile } = await profileClient
    .from("profiles")
    .select("user_id, full_name, avatar_url, phone, bio")
    .eq("user_id", data.owner_id)
    .single();

  data.owner = ownerProfile ?? null;

  return NextResponse.json({ data });
}

// PATCH /api/properties/[id] — Update property (owner or admin)
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

  // Verify ownership or admin
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (property.owner_id !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Only allow updating specific fields
  const allowedFields = [
    "title", "description", "property_type", "listing_type", "status",
    "price", "address", "city", "state", "zip_code", "latitude", "longitude",
    "bedrooms", "bathrooms", "sqft", "lot_size", "year_built", "parking_spaces",
    "amenities", "images",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { data, error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/properties/[id] — Delete property (owner or admin)
export async function DELETE(
  _request: NextRequest,
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

  const { data: property } = await supabase
    .from("properties")
    .select("owner_id, images")
    .eq("id", id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (property.owner_id !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete associated images from storage
  const images = (property.images as string[]) || [];
  if (images.length > 0) {
    const paths = images.map((url: string) => {
      const parts = url.split("/property-images/");
      return parts[1] || "";
    }).filter(Boolean);

    if (paths.length > 0) {
      await supabase.storage.from("property-images").remove(paths);
    }
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
