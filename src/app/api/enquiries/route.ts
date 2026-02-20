import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEnquiryEmail } from "@/lib/resend";

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

  // Get property + owner info
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id, title, owner:profiles!properties_owner_id_fkey(full_name, user_id)")
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

  // Get sender profile
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

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

  // Send email notification to owner (best-effort, non-blocking)
  try {
    const ownerArr = property.owner as unknown as { full_name: string }[] | null;
    const ownerProfile = ownerArr?.[0] ?? null;

    // Try admin client first to get owner email, fall back to user.email lookup
    let ownerEmail: string | undefined;
    const admin = createAdminClient();
    if (admin) {
      const { data: ownerAuth } = await admin.auth.admin.getUserById(property.owner_id);
      ownerEmail = ownerAuth?.user?.email;
    }

    if (ownerEmail) {
      const result = await sendEnquiryEmail({
        ownerName: ownerProfile?.full_name || "Property Owner",
        ownerEmail,
        senderName: senderProfile?.full_name || "A buyer",
        senderPhone: body.phone || null,
        preferredDate: body.preferred_date || null,
        message: body.message,
        propertyTitle: property.title,
        propertyId: body.property_id,
      });
      console.log("Enquiry email sent to:", ownerEmail, result);
    } else {
      console.warn("Could not resolve owner email — SUPABASE_SERVICE_ROLE_KEY may be missing");
    }
  } catch (err) {
    console.error("Failed to send enquiry email:", err);
  }

  return NextResponse.json({ data }, { status: 201 });
}
