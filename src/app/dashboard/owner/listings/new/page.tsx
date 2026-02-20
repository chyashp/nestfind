"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  HomeModernIcon,
  MapPinIcon,
  CameraIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { api } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  AMENITIES,
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/constants";
import type { Property } from "@/types/database";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FormData {
  // Step 1 - Basic Info
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: string;
  status: string;
  // Step 2 - Location & Details
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  lot_size: string;
  year_built: string;
  parking_spaces: string;
  // Step 3 - Amenities
  amenities: string[];
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface FormErrors {
  [key: string]: string;
}

const STEPS = [
  { number: 1, title: "Basic Info", icon: HomeModernIcon },
  { number: 2, title: "Location & Details", icon: MapPinIcon },
  { number: 3, title: "Photos & Amenities", icon: CameraIcon },
  { number: 4, title: "Review & Publish", icon: ClipboardDocumentCheckIcon },
] as const;

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
];

const INITIAL_FORM_DATA: FormData = {
  title: "",
  description: "",
  property_type: "",
  listing_type: "",
  price: "",
  status: "active",
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
  amenities: [],
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function NewListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  /* ----------------------------- Field handlers ----------------------------- */

  const updateField = useCallback(
    (field: keyof FormData, value: string | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const toggleAmenity = useCallback((amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  /* ------------------------------ Image handling ----------------------------- */

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_IMAGES - images.length;

      if (remaining <= 0) {
        setErrors((prev) => ({
          ...prev,
          images: `Maximum ${MAX_IMAGES} images allowed.`,
        }));
        return;
      }

      const validFiles: ImageFile[] = [];
      const newErrors: string[] = [];

      fileArray.slice(0, remaining).forEach((file) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          newErrors.push(`${file.name}: Only JPEG, PNG, and WebP are allowed.`);
          return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          newErrors.push(`${file.name}: File exceeds 5MB limit.`);
          return;
        }
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        });
      });

      if (newErrors.length > 0) {
        setErrors((prev) => ({ ...prev, images: newErrors.join(" ") }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.images;
          return next;
        });
      }

      setImages((prev) => [...prev, ...validFiles]);
    },
    [images.length]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
  }, []);

  /* -------------------------------- Drag drop ------------------------------- */

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addImages(e.dataTransfer.files);
      }
    },
    [addImages]
  );

  /* ------------------------------- Validation ------------------------------- */

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: FormErrors = {};

      if (step === 1) {
        if (!formData.title.trim()) newErrors.title = "Title is required.";
        if (!formData.description.trim())
          newErrors.description = "Description is required.";
        if (!formData.property_type)
          newErrors.property_type = "Property type is required.";
        if (!formData.listing_type)
          newErrors.listing_type = "Listing type is required.";
        if (!formData.price.trim()) {
          newErrors.price = "Price is required.";
        } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
          newErrors.price = "Enter a valid price.";
        }
        if (!formData.status) newErrors.status = "Status is required.";
      }

      if (step === 2) {
        if (!formData.address.trim()) newErrors.address = "Address is required.";
        if (!formData.city.trim()) newErrors.city = "City is required.";
        if (!formData.state.trim()) newErrors.state = "State is required.";
        if (formData.bedrooms && (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) < 0))
          newErrors.bedrooms = "Enter a valid number.";
        if (formData.bathrooms && (isNaN(Number(formData.bathrooms)) || Number(formData.bathrooms) < 0))
          newErrors.bathrooms = "Enter a valid number.";
        if (formData.sqft && (isNaN(Number(formData.sqft)) || Number(formData.sqft) < 0))
          newErrors.sqft = "Enter a valid number.";
        if (formData.year_built && (isNaN(Number(formData.year_built)) || Number(formData.year_built) < 1800 || Number(formData.year_built) > new Date().getFullYear()))
          newErrors.year_built = "Enter a valid year.";
      }

      // Step 3 and 4 have no required fields (images/amenities are optional)

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  /* ------------------------------- Navigation ------------------------------- */

  const goNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      // Only allow navigating to completed steps or the next step
      if (step < currentStep) {
        setCurrentStep(step);
      } else if (step === currentStep + 1) {
        goNext();
      }
    },
    [currentStep, goNext]
  );

  /* --------------------------------- Submit --------------------------------- */

  const handleSubmit = useCallback(async () => {
    if (!validateStep(1) || !validateStep(2)) {
      // Go back to the first step with errors
      if (!validateStep(1)) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        price: Number(formData.price),
        status: formData.status,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zip_code.trim() || null,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        sqft: formData.sqft ? Number(formData.sqft) : null,
        lot_size: formData.lot_size ? Number(formData.lot_size) : null,
        year_built: formData.year_built ? Number(formData.year_built) : null,
        parking_spaces: formData.parking_spaces
          ? Number(formData.parking_spaces)
          : null,
        amenities: formData.amenities,
      };

      const res = await api.post<{ data: Property }>("/api/properties", body);
      const property = res.data;

      // Upload images if any
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach((img) => {
          fd.append("files", img.file);
        });
        await api.upload(`/api/properties/${property.id}/images`, fd);
      }

      router.push("/dashboard/owner/listings");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, images, router, validateStep]);

  /* -------------------------------------------------------------------------- */
  /*  Step Indicator                                                            */
  /* -------------------------------------------------------------------------- */

  function StepIndicator() {
    return (
      <nav aria-label="Form progress" className="mb-8">
        <ol className="flex items-center">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <li
                key={step.number}
                className={cn("flex items-center", idx < STEPS.length - 1 && "flex-1")}
              >
                {/* Circle + label */}
                <button
                  type="button"
                  onClick={() => goToStep(step.number)}
                  className={cn(
                    "group flex flex-col items-center gap-2 transition-all duration-300",
                    (isCompleted || isCurrent) ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                      isCompleted &&
                        "border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-500/25",
                      isCurrent &&
                        "border-primary-600 bg-primary-50 text-primary-700 shadow-md shadow-primary-500/20 ring-4 ring-primary-100",
                      !isCompleted &&
                        !isCurrent &&
                        "border-slate-200 bg-[var(--card-bg)] text-slate-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5" strokeWidth={2.5} />
                    ) : (
                      step.number
                    )}
                  </span>
                  <span
                    className={cn(
                      "hidden text-xs font-medium transition-colors duration-300 sm:block",
                      isCurrent && "text-primary-700",
                      isCompleted && "text-primary-600",
                      !isCompleted && !isCurrent && "text-slate-400"
                    )}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Connecting line */}
                {idx < STEPS.length - 1 && (
                  <div className="mx-2 h-0.5 flex-1 sm:mx-4">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        currentStep > step.number
                          ? "bg-primary-600"
                          : "bg-slate-200"
                      )}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  Step 1 — Basic Info                                                       */
  /* -------------------------------------------------------------------------- */

  function StepBasicInfo() {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <HomeModernIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Basic Information
            </h2>
            <p className="text-sm text-slate-500">
              Tell us about your property listing.
            </p>
          </div>
        </div>

        <Input
          label="Listing Title"
          id="title"
          placeholder="e.g. Stunning Modern Home with Ocean View"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          error={errors.title}
          required
        />

        {/* Textarea for description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1.5 text-[var(--foreground)]"
          >
            Description <span className="text-error-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Describe your property in detail — features, condition, nearby attractions..."
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={cn(
              "block w-full rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none",
              errors.description && "border-error-500 focus:ring-error-500"
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-error-500">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="Property Type"
            id="property_type"
            options={PROPERTY_TYPES}
            placeholder="Select type..."
            value={formData.property_type}
            onChange={(e) => updateField("property_type", e.target.value)}
            error={errors.property_type}
          />

          <Select
            label="Listing Type"
            id="listing_type"
            options={LISTING_TYPES}
            placeholder="Sale or Rent..."
            value={formData.listing_type}
            onChange={(e) => updateField("listing_type", e.target.value)}
            error={errors.listing_type}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label="Price ($)"
            id="price"
            type="number"
            placeholder="0"
            value={formData.price}
            onChange={(e) => updateField("price", e.target.value)}
            error={errors.price}
            hint={
              formData.listing_type === "rent"
                ? "Monthly rent amount"
                : "Total asking price"
            }
            required
          />

          <Select
            label="Status"
            id="status"
            options={STATUS_OPTIONS}
            placeholder="Select status..."
            value={formData.status}
            onChange={(e) => updateField("status", e.target.value)}
            error={errors.status}
          />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  Step 2 — Location & Details                                               */
  /* -------------------------------------------------------------------------- */

  function StepLocationDetails() {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <MapPinIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Location & Details
            </h2>
            <p className="text-sm text-slate-500">
              Where is the property and what are its specifications?
            </p>
          </div>
        </div>

        {/* Location fields */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Location
          </h3>
          <Input
            label="Street Address"
            id="address"
            placeholder="123 Main Street"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            error={errors.address}
            required
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              id="city"
              placeholder="San Francisco"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              error={errors.city}
              required
            />
            <Input
              label="State"
              id="state"
              placeholder="CA"
              value={formData.state}
              onChange={(e) => updateField("state", e.target.value)}
              error={errors.state}
              required
            />
            <Input
              label="ZIP Code"
              id="zip_code"
              placeholder="94102"
              value={formData.zip_code}
              onChange={(e) => updateField("zip_code", e.target.value)}
              error={errors.zip_code}
            />
          </div>
        </div>

        {/* Property details */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Property Specifications
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Bedrooms"
              id="bedrooms"
              type="number"
              placeholder="0"
              value={formData.bedrooms}
              onChange={(e) => updateField("bedrooms", e.target.value)}
              error={errors.bedrooms}
            />
            <Input
              label="Bathrooms"
              id="bathrooms"
              type="number"
              placeholder="0"
              value={formData.bathrooms}
              onChange={(e) => updateField("bathrooms", e.target.value)}
              error={errors.bathrooms}
            />
            <Input
              label="Parking Spaces"
              id="parking_spaces"
              type="number"
              placeholder="0"
              value={formData.parking_spaces}
              onChange={(e) => updateField("parking_spaces", e.target.value)}
              error={errors.parking_spaces}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Square Feet"
              id="sqft"
              type="number"
              placeholder="0"
              value={formData.sqft}
              onChange={(e) => updateField("sqft", e.target.value)}
              error={errors.sqft}
            />
            <Input
              label="Lot Size (sqft)"
              id="lot_size"
              type="number"
              placeholder="0"
              value={formData.lot_size}
              onChange={(e) => updateField("lot_size", e.target.value)}
              error={errors.lot_size}
            />
            <Input
              label="Year Built"
              id="year_built"
              type="number"
              placeholder="2024"
              value={formData.year_built}
              onChange={(e) => updateField("year_built", e.target.value)}
              error={errors.year_built}
            />
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  Step 3 — Photos & Amenities                                               */
  /* -------------------------------------------------------------------------- */

  function StepPhotosAmenities() {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Photos */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <CameraIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Photos
              </h2>
              <p className="text-sm text-slate-500">
                Add up to {MAX_IMAGES} images. High-quality photos attract more
                buyers.
              </p>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300",
              isDragging
                ? "border-primary-500 bg-primary-50/50 scale-[1.01]"
                : "border-slate-300 bg-[var(--input-bg)] hover:border-primary-400 hover:bg-primary-50/30",
              errors.images && "border-error-500"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addImages(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300",
                  isDragging
                    ? "bg-primary-100 text-primary-600"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                <CloudArrowUpIcon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {isDragging ? "Drop your images here" : "Drag & drop images here"}
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
                {images.length} / {MAX_IMAGES} images
              </span>
            </div>
          </div>

          {errors.images && (
            <p className="text-xs text-error-500">{errors.images}</p>
          )}

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--card-border)] bg-slate-50 transition-shadow hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.preview}
                    alt={`Upload ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-error-600"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
              <CheckIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Amenities
              </h2>
              <p className="text-sm text-slate-500">
                Select all the amenities your property offers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    isSelected
                      ? "border-primary-300 bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10"
                      : "border-[var(--input-border)] bg-[var(--card-bg)] text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                      isSelected
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <CheckIcon className="h-3 w-3" strokeWidth={3} />
                    )}
                  </span>
                  {amenity}
                </button>
              );
            })}
          </div>

          {formData.amenities.length > 0 && (
            <p className="text-xs text-slate-500">
              {formData.amenities.length} amenit
              {formData.amenities.length === 1 ? "y" : "ies"} selected
            </p>
          )}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  Step 4 — Review & Publish                                                 */
  /* -------------------------------------------------------------------------- */

  function ReviewSection({
    title,
    step,
    children,
  }: {
    title: string;
    step: number;
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-3.5">
          <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
          <button
            type="button"
            onClick={() => setCurrentStep(step)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    );
  }

  function ReviewField({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <div className="flex flex-col gap-0.5">
        <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </dt>
        <dd className="text-sm font-medium text-[var(--foreground)]">
          {value || <span className="text-slate-300">--</span>}
        </dd>
      </div>
    );
  }

  function StepReview() {
    const propertyTypeLabel =
      PROPERTY_TYPES.find((t) => t.value === formData.property_type)?.label ??
      formData.property_type;
    const listingTypeLabel =
      LISTING_TYPES.find((t) => t.value === formData.listing_type)?.label ??
      formData.listing_type;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Review Your Listing
            </h2>
            <p className="text-sm text-slate-500">
              Make sure everything looks good before publishing.
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <ReviewSection title="Basic Information" step={1}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ReviewField label="Title" value={formData.title} />
            <ReviewField label="Property Type" value={propertyTypeLabel} />
            <ReviewField label="Listing Type" value={listingTypeLabel} />
            <ReviewField
              label="Price"
              value={
                formData.price
                  ? formatPrice(
                      Number(formData.price),
                      formData.listing_type as "sale" | "rent"
                    )
                  : null
              }
            />
            <ReviewField
              label="Status"
              value={
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    formData.status === "active"
                      ? "bg-success-50 text-success-600"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {formData.status === "active" ? "Active" : "Draft"}
                </span>
              }
            />
          </div>
          {formData.description && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Description
              </dt>
              <dd className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                {formData.description}
              </dd>
            </div>
          )}
        </ReviewSection>

        {/* Location & Details */}
        <ReviewSection title="Location & Details" step={2}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ReviewField label="Address" value={formData.address} />
            <ReviewField label="City" value={formData.city} />
            <ReviewField label="State" value={formData.state} />
            <ReviewField label="ZIP Code" value={formData.zip_code} />
            <ReviewField
              label="Bedrooms"
              value={formData.bedrooms || null}
            />
            <ReviewField
              label="Bathrooms"
              value={formData.bathrooms || null}
            />
            <ReviewField
              label="Square Feet"
              value={
                formData.sqft
                  ? Number(formData.sqft).toLocaleString() + " sqft"
                  : null
              }
            />
            <ReviewField
              label="Lot Size"
              value={
                formData.lot_size
                  ? Number(formData.lot_size).toLocaleString() + " sqft"
                  : null
              }
            />
            <ReviewField label="Year Built" value={formData.year_built || null} />
            <ReviewField
              label="Parking Spaces"
              value={formData.parking_spaces || null}
            />
          </div>
        </ReviewSection>

        {/* Photos & Amenities */}
        <ReviewSection title="Photos & Amenities" step={3}>
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-[var(--card-border)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.preview}
                    alt={`Photo ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <PhotoIcon className="h-5 w-5" />
              No photos uploaded
            </p>
          )}

          {formData.amenities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Amenities
              </dt>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.amenities.length === 0 && images.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
              <p className="text-sm text-slate-400">No amenities selected</p>
            </div>
          )}
        </ReviewSection>

        {/* Submit error */}
        {errors.submit && (
          <div className="rounded-2xl border border-error-500/20 bg-error-50 p-4">
            <p className="text-sm font-medium text-error-600">
              {errors.submit}
            </p>
          </div>
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  Render                                                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      <DashboardHeader
        title="Create New Listing"
        subtitle="Add your property to the marketplace"
        action={
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl p-6 pb-24 lg:p-8 lg:pb-24">
        <StepIndicator />

        {/* Form card */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm sm:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep < 4) goNext();
              else handleSubmit();
            }}
          >
            {currentStep === 1 && <StepBasicInfo />}
            {currentStep === 2 && <StepLocationDetails />}
            {currentStep === 3 && <StepPhotosAmenities />}
            {currentStep === 4 && <StepReview />}

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-[var(--card-border)] pt-6">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goBack}
                    className="gap-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Step counter (mobile) */}
                <span className="text-xs font-medium text-slate-400 sm:hidden">
                  Step {currentStep} of 4
                </span>

                {currentStep < 4 ? (
                  <Button type="submit" className="gap-2">
                    Next
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="gap-2 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 shadow-lg shadow-primary-500/25"
                  >
                    {isSubmitting ? "Publishing..." : "Publish Listing"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
