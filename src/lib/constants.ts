import type { PropertyType, ListingType, PropertyStatus, EnquiryStatus } from "@/types/database";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

export const PROPERTY_STATUSES: { value: PropertyStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "slate" },
  { value: "active", label: "Active", color: "success" },
  { value: "under_contract", label: "Under Contract", color: "warning" },
  { value: "sold", label: "Sold", color: "primary" },
  { value: "rented", label: "Rented", color: "accent" },
];

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string; color: string }[] = [
  { value: "unread", label: "Unread", color: "primary" },
  { value: "read", label: "Read", color: "slate" },
  { value: "replied", label: "Replied", color: "success" },
  { value: "archived", label: "Archived", color: "slate" },
];

export const AMENITIES = [
  "Pool",
  "Gym",
  "Garage",
  "Garden",
  "Air Conditioning",
  "Laundry",
  "Dishwasher",
  "Fireplace",
  "Balcony",
  "Elevator",
  "Security System",
  "Hardwood Floors",
  "Walk-in Closet",
  "Pet Friendly",
  "Furnished",
  "Waterfront",
  "Mountain View",
  "City View",
  "Smart Home",
  "Solar Panels",
] as const;

export const BEDROOM_OPTIONS = [
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

export const BATHROOM_OPTIONS = [
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
];

export const BUDGET_RANGES_SALE = [
  { min: 0, max: 100000, label: "Under $100k" },
  { min: 100000, max: 250000, label: "$100k - $250k" },
  { min: 250000, max: 500000, label: "$250k - $500k" },
  { min: 500000, max: 1000000, label: "$500k - $1M" },
  { min: 1000000, max: 2500000, label: "$1M - $2.5M" },
  { min: 2500000, max: Infinity, label: "$2.5M+" },
];

export const BUDGET_RANGES_RENT = [
  { min: 0, max: 1000, label: "Under $1k/mo" },
  { min: 1000, max: 2000, label: "$1k - $2k/mo" },
  { min: 2000, max: 3500, label: "$2k - $3.5k/mo" },
  { min: 3500, max: 5000, label: "$3.5k - $5k/mo" },
  { min: 5000, max: Infinity, label: "$5k+/mo" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export const ITEMS_PER_PAGE = 12;

export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
