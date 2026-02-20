"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  AMENITIES,
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/constants";
import type { Property } from "@/types/database";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Existing images from the server
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "",
    listing_type: "",
    status: "",
    price: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    lot_size: "",
    year_built: "",
    parking_spaces: "",
    amenities: [] as string[],
  });

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await api.get<{ data: Property }>(`/api/properties/${id}`);
        const p = res.data;
        setExistingImages(p.images || []);
        setForm({
          title: p.title,
          description: p.description || "",
          property_type: p.property_type,
          listing_type: p.listing_type,
          status: p.status,
          price: String(p.price),
          address: p.address,
          city: p.city,
          state: p.state,
          zip_code: p.zip_code || "",
          bedrooms: p.bedrooms !== null ? String(p.bedrooms) : "",
          bathrooms: p.bathrooms !== null ? String(p.bathrooms) : "",
          sqft: p.sqft !== null ? String(p.sqft) : "",
          lot_size: p.lot_size !== null ? String(p.lot_size) : "",
          year_built: p.year_built !== null ? String(p.year_built) : "",
          parking_spaces:
            p.parking_spaces !== null ? String(p.parking_spaces) : "",
          amenities: p.amenities || [],
        });
      } catch {
        alert("Failed to load property");
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  /* ----------------------------- Image upload ------------------------------ */

  const uploadImages = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_IMAGES - existingImages.length;

      if (remaining <= 0) {
        setImageError(`Maximum ${MAX_IMAGES} images allowed.`);
        return;
      }

      // Validate
      for (const file of fileArray.slice(0, remaining)) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setImageError(`${file.name}: Only JPEG, PNG, and WebP are allowed.`);
          return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          setImageError(`${file.name}: File exceeds 5MB limit.`);
          return;
        }
      }

      setImageError(null);
      setUploading(true);

      try {
        const fd = new FormData();
        fileArray.slice(0, remaining).forEach((file) => {
          fd.append("files", file);
        });

        const res = await api.upload<{ data: { images: string[] } }>(
          `/api/properties/${id}/images`,
          fd
        );
        setExistingImages(res.data.images);
      } catch (err) {
        setImageError(
          err instanceof Error ? err.message : "Failed to upload images"
        );
      } finally {
        setUploading(false);
      }
    },
    [existingImages.length, id]
  );

  const deleteImage = useCallback(
    async (imageUrl: string) => {
      try {
        const res = await fetch(`/api/properties/${id}/images`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        const data = await res.json();
        if (res.ok) {
          setExistingImages(data.data.images);
        }
      } catch {
        setImageError("Failed to delete image");
      }
    },
    [id]
  );

  /* ------------------------------ Drag & drop ------------------------------ */

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        uploadImages(e.dataTransfer.files);
      }
    },
    [uploadImages]
  );

  /* --------------------------------- Save ---------------------------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/api/properties/${id}`, {
        ...form,
        price: parseFloat(form.price),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
        sqft: form.sqft ? parseInt(form.sqft) : null,
        lot_size: form.lot_size ? parseInt(form.lot_size) : null,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        parking_spaces: form.parking_spaces
          ? parseInt(form.parking_spaces)
          : null,
      });
      router.push("/dashboard/owner/listings");
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (a: string) => {
    setForm({
      ...form,
      amenities: form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    });
  };

  /* ------------------------------- Loading --------------------------------- */

  if (loading) {
    return (
      <>
        <DashboardHeader title="Edit Listing" />
        <div className="mx-auto max-w-3xl p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  /* ------------------------------- Render ---------------------------------- */

  return (
    <>
      <DashboardHeader title="Edit Listing" subtitle={form.title} />
      <div className="mx-auto max-w-3xl p-6 pb-24 lg:p-8 lg:pb-24">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Basic Info
            </h2>
            <Input
              id="edit-title"
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <div>
              <label
                htmlFor="edit-desc"
                className="block text-sm font-medium mb-1.5 text-[var(--foreground)]"
              >
                Description
              </label>
              <textarea
                id="edit-desc"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="block w-full rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                id="edit-type"
                label="Property Type"
                options={PROPERTY_TYPES.map((t) => ({
                  value: t.value,
                  label: t.label,
                }))}
                value={form.property_type}
                onChange={(e) =>
                  setForm({ ...form, property_type: e.target.value })
                }
              />
              <Select
                id="edit-listing"
                label="Listing Type"
                options={LISTING_TYPES.map((t) => ({
                  value: t.value,
                  label: t.label,
                }))}
                value={form.listing_type}
                onChange={(e) =>
                  setForm({ ...form, listing_type: e.target.value })
                }
              />
              <Select
                id="edit-status"
                label="Status"
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "under_contract", label: "Under Contract" },
                  { value: "sold", label: "Sold" },
                  { value: "rented", label: "Rented" },
                ]}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
            </div>
            <Input
              id="edit-price"
              label="Price ($)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </section>

          {/* Location */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Location
            </h2>
            <Input
              id="edit-address"
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="edit-city"
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <Input
                id="edit-state"
                label="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
              <Input
                id="edit-zip"
                label="Zip Code"
                value={form.zip_code}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
              />
            </div>
          </section>

          {/* Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="edit-beds"
                label="Bedrooms"
                type="number"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              />
              <Input
                id="edit-baths"
                label="Bathrooms"
                type="number"
                step="0.5"
                value={form.bathrooms}
                onChange={(e) =>
                  setForm({ ...form, bathrooms: e.target.value })
                }
              />
              <Input
                id="edit-sqft"
                label="Sq. Ft."
                type="number"
                value={form.sqft}
                onChange={(e) => setForm({ ...form, sqft: e.target.value })}
              />
              <Input
                id="edit-lot"
                label="Lot Size (sqft)"
                type="number"
                value={form.lot_size}
                onChange={(e) => setForm({ ...form, lot_size: e.target.value })}
              />
              <Input
                id="edit-year"
                label="Year Built"
                type="number"
                value={form.year_built}
                onChange={(e) =>
                  setForm({ ...form, year_built: e.target.value })
                }
              />
              <Input
                id="edit-parking"
                label="Parking Spaces"
                type="number"
                value={form.parking_spaces}
                onChange={(e) =>
                  setForm({ ...form, parking_spaces: e.target.value })
                }
              />
            </div>
          </section>

          {/* Photos */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Photos
            </h2>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {existingImages.map((url, idx) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--card-border)] bg-slate-50"
                  >
                    <Image
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    {idx === 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImage(url)}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-error-600"
                    >
                      <XMarkIcon className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload drop zone */}
            {existingImages.length < MAX_IMAGES && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300",
                  isDragging
                    ? "border-primary-500 bg-primary-50/50 scale-[1.01]"
                    : "border-slate-300 bg-[var(--input-bg)] hover:border-primary-400 hover:bg-primary-50/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) uploadImages(e.target.files);
                    e.target.value = "";
                  }}
                />
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                      isDragging
                        ? "bg-primary-100 text-primary-600"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {uploading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                    ) : (
                      <CloudArrowUpIcon className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {uploading
                        ? "Uploading..."
                        : isDragging
                          ? "Drop your images here"
                          : "Drag & drop images here"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      or{" "}
                      <span className="font-medium text-primary-600">
                        click to browse
                      </span>{" "}
                      &mdash; JPEG, PNG, WebP up to 5MB
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {existingImages.length} / {MAX_IMAGES} images
                  </span>
                </div>
              </div>
            )}

            {existingImages.length === 0 && !uploading && (
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <PhotoIcon className="h-5 w-5" />
                No photos yet. Upload some to make your listing stand out.
              </p>
            )}

            {imageError && (
              <p className="text-xs text-error-500">{imageError}</p>
            )}
          </section>

          {/* Amenities */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    form.amenities.includes(a)
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </section>

          <div className="flex gap-3">
            <Button type="submit" isLoading={saving} size="lg">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
