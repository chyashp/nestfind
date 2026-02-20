import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/properties — Search and filter properties (public)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("query");
  const listing_type = searchParams.get("listing_type");
  const property_type = searchParams.get("property_type");
  const min_price = searchParams.get("min_price");
  const max_price = searchParams.get("max_price");
  const bedrooms = searchParams.get("bedrooms");
  const bathrooms = searchParams.get("bathrooms");
  const min_sqft = searchParams.get("min_sqft");
  const max_sqft = searchParams.get("max_sqft");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const amenities = searchParams.getAll("amenities");
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const featured = searchParams.get("featured");

  // Map bounds for map search
  const north = searchParams.get("north");
  const south = searchParams.get("south");
  const east = searchParams.get("east");
  const west = searchParams.get("west");

  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from("properties")
    .select("*, owner:profiles!properties_owner_id_fkey(full_name, avatar_url, phone)", {
      count: "exact",
    })
    .eq("status", "active");

  // Text search
  if (query) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`
    );
  }

  // Filters
  if (listing_type) dbQuery = dbQuery.eq("listing_type", listing_type);
  if (property_type) dbQuery = dbQuery.eq("property_type", property_type);
  if (min_price) dbQuery = dbQuery.gte("price", parseFloat(min_price));
  if (max_price) dbQuery = dbQuery.lte("price", parseFloat(max_price));
  if (bedrooms) dbQuery = dbQuery.gte("bedrooms", parseInt(bedrooms));
  if (bathrooms) dbQuery = dbQuery.gte("bathrooms", parseInt(bathrooms));
  if (min_sqft) dbQuery = dbQuery.gte("sqft", parseInt(min_sqft));
  if (max_sqft) dbQuery = dbQuery.lte("sqft", parseInt(max_sqft));
  if (city) dbQuery = dbQuery.ilike("city", `%${city}%`);
  if (state) dbQuery = dbQuery.ilike("state", `%${state}%`);

  // Amenities filter — properties must contain all selected amenities
  if (amenities.length > 0) {
    dbQuery = dbQuery.contains("amenities", amenities);
  }

  // Map bounds
  if (north && south && east && west) {
    dbQuery = dbQuery
      .gte("latitude", parseFloat(south))
      .lte("latitude", parseFloat(north))
      .gte("longitude", parseFloat(west))
      .lte("longitude", parseFloat(east));
  }

  // Featured: just get the 6 most recent
  if (featured) {
    dbQuery = dbQuery.order("created_at", { ascending: false }).limit(parseInt(featured));
    const { data, error } = await dbQuery;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, total: data?.length || 0 });
  }

  // Sorting
  switch (sort) {
    case "price_asc":
      dbQuery = dbQuery.order("price", { ascending: true });
      break;
    case "price_desc":
      dbQuery = dbQuery.order("price", { ascending: false });
      break;
    case "oldest":
      dbQuery = dbQuery.order("created_at", { ascending: true });
      break;
    default: // newest
      dbQuery = dbQuery.order("created_at", { ascending: false });
  }

  // Pagination
  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST /api/properties — Create a new property (owner only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.role !== "owner" && profile.role !== "admin")) {
    return NextResponse.json(
      { error: "Only owners can create listings" },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Validate required fields
  const required = ["title", "property_type", "listing_type", "price", "address", "city", "state"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: user.id,
      title: body.title,
      description: body.description || null,
      property_type: body.property_type,
      listing_type: body.listing_type,
      status: body.status || "draft",
      price: body.price,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zip_code || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      bedrooms: body.bedrooms || null,
      bathrooms: body.bathrooms || null,
      sqft: body.sqft || null,
      lot_size: body.lot_size || null,
      year_built: body.year_built || null,
      parking_spaces: body.parking_spaces || null,
      amenities: body.amenities || [],
      images: body.images || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
