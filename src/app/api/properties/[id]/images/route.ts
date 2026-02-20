import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, MAX_IMAGES } from "@/lib/constants";

// POST /api/properties/[id]/images — Upload images
export async function POST(
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

  // Verify ownership
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id, images")
    .eq("id", id)
    .single();

  if (!property || property.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingImages = (property.images as string[]) || [];

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  if (existingImages.length + files.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES} images allowed` },
      { status: 400 }
    );
  }

  const uploadedUrls: string[] = [];

  for (const file of files) {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 5MB` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from("property-images")
      .getPublicUrl(fileName);

    uploadedUrls.push(publicUrl.publicUrl);
  }

  // Update property images array
  const newImages = [...existingImages, ...uploadedUrls];
  const { error: updateError } = await supabase
    .from("properties")
    .update({ images: newImages })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ data: { images: newImages, uploaded: uploadedUrls } });
}

// DELETE /api/properties/[id]/images — Delete an image
export async function DELETE(
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

  const { data: property } = await supabase
    .from("properties")
    .select("owner_id, images")
    .eq("id", id)
    .single();

  if (!property || property.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { imageUrl } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  // Remove from storage
  const parts = imageUrl.split("/property-images/");
  const storagePath = parts[1];
  if (storagePath) {
    await supabase.storage.from("property-images").remove([storagePath]);
  }

  // Remove from property images array
  const currentImages = (property.images as string[]) || [];
  const newImages = currentImages.filter((img: string) => img !== imageUrl);

  const { error } = await supabase
    .from("properties")
    .update({ images: newImages })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { images: newImages } });
}
