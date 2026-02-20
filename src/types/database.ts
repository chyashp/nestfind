export type UserRole = "owner" | "buyer" | "admin";

export type PropertyType =
  | "house"
  | "apartment"
  | "condo"
  | "townhouse"
  | "land"
  | "commercial";

export type ListingType = "sale" | "rent";

export type PropertyStatus =
  | "draft"
  | "active"
  | "under_contract"
  | "sold"
  | "rented";

export type EnquiryStatus = "unread" | "read" | "replied" | "archived";

export interface Profile {
  user_id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  status: PropertyStatus;
  price: number;
  currency: string;

  // Location
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;

  // Details
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lot_size: number | null;
  year_built: number | null;
  parking_spaces: number | null;

  // JSON fields
  amenities: string[];
  images: string[];

  created_at: string;
  updated_at: string;

  // Joined fields (optional)
  owner?: Profile;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface Enquiry {
  id: string;
  property_id: string;
  sender_id: string;
  owner_id: string;
  message: string;
  phone: string | null;
  preferred_date: string | null;
  status: EnquiryStatus;
  created_at: string;

  // Joined fields (optional)
  property?: Property;
  sender?: Profile;
  owner?: Profile;
}

export interface SearchFilters {
  query?: string;
  listing_type?: ListingType;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  amenities?: string[];
  city?: string;
  state?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
  // Map bounds
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
