// ─── Types ───────────────────────────────────────────────────────────────────

export type PropertySeed = {
  title: string;
  description: string;
  property_type: "house" | "apartment" | "condo" | "townhouse" | "land" | "commercial";
  listing_type: "sale" | "rent";
  price: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number;
  lot_size: number | null;
  year_built: number | null;
  parking_spaces: number;
  amenities: string[];
};

// ─── Deterministic helpers ───────────────────────────────────────────────────

/** Deterministic pseudo-value from an index within a range (inclusive). */
function pick(index: number, min: number, max: number): number {
  return min + (index % (max - min + 1));
}

/** Pick an item from an array using modular arithmetic. */
function pickFrom<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

/** Round to nearest 0.5 */
function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

/** Generate a deterministic coordinate offset from center. */
function coordOffset(index: number, spread: number): number {
  // Use a simple deterministic pattern to spread coordinates
  const patterns = [
    -0.035, 0.028, -0.015, 0.032, -0.008, 0.022, -0.030, 0.012,
    -0.025, 0.018, -0.003, 0.037, -0.020, 0.005, -0.012, 0.029,
    -0.038, 0.015, -0.006, 0.025,
  ];
  return patterns[index % patterns.length] * (spread / 0.035);
}

// ─── Title templates ─────────────────────────────────────────────────────────

const HOUSE_TITLE_TEMPLATES = [
  (bed: number, hood: string) => `Charming ${bed}-Bedroom Home in ${hood}`,
  (bed: number, hood: string) => `Spacious Family Home in ${hood}`,
  (_bed: number, hood: string) => `Renovated Gem in ${hood}`,
  (bed: number, hood: string) => `Beautiful ${bed}-Bed Residence near ${hood}`,
  (_bed: number, hood: string) => `Modern Home with Character in ${hood}`,
  (_bed: number, hood: string) => `Stunning ${hood} Property with Garden`,
  (bed: number, hood: string) => `Classic ${bed}-Bedroom in ${hood}`,
  (_bed: number, hood: string) => `Sun-Drenched Home in ${hood}`,
  (bed: number, hood: string) => `Updated ${bed}-Bed Home in Prime ${hood}`,
  (_bed: number, hood: string) => `Move-In Ready Home in ${hood}`,
  (_bed: number, hood: string) => `Elegant Residence in ${hood}`,
  (bed: number, hood: string) => `Lovely ${bed}-Bedroom near ${hood} Park`,
  (_bed: number, hood: string) => `Bright and Airy Home in ${hood}`,
  (_bed: number, hood: string) => `${hood} Colonial with Modern Updates`,
  (bed: number, hood: string) => `${bed}-Bed ${hood} Home with Garage`,
  (_bed: number, hood: string) => `Turnkey Home in ${hood}`,
];

const APARTMENT_TITLE_TEMPLATES = [
  (bed: number, hood: string) => `Modern ${bed === 0 ? "Studio" : bed + "-Bedroom"} in ${hood}`,
  (_bed: number, hood: string) => `Bright Apartment in ${hood}`,
  (bed: number, hood: string) => `${bed === 0 ? "Studio" : bed + "-Bed"} Rental Steps from ${hood}`,
  (_bed: number, hood: string) => `Renovated Unit in the Heart of ${hood}`,
  (_bed: number, hood: string) => `Sunny ${hood} Apartment with Views`,
  (bed: number, hood: string) => `Spacious ${bed === 0 ? "Studio" : bed + "-Bedroom"} near ${hood}`,
  (_bed: number, hood: string) => `Updated ${hood} Apartment with Balcony`,
  (_bed: number, hood: string) => `Cozy Apartment in ${hood}`,
  (bed: number, hood: string) => `${bed === 0 ? "Studio" : bed + "-Bed"} in Prime ${hood} Location`,
  (_bed: number, hood: string) => `High-Rise Living in ${hood}`,
  (_bed: number, hood: string) => `Pet-Friendly Apartment in ${hood}`,
  (_bed: number, hood: string) => `${hood} Walk-Up with Character`,
  (bed: number, hood: string) => `Affordable ${bed === 0 ? "Studio" : bed + "-Bed"} in ${hood}`,
  (_bed: number, hood: string) => `Newly Finished Apartment in ${hood}`,
  (_bed: number, hood: string) => `${hood} Flat with Modern Finishes`,
  (_bed: number, hood: string) => `Contemporary ${hood} Apartment`,
];

const CONDO_TITLE_TEMPLATES = [
  (bed: number, hood: string) => `Luxury ${bed}-Bed Condo in ${hood}`,
  (_bed: number, hood: string) => `Modern Downtown Condo with City Views`,
  (_bed: number, hood: string) => `Sleek ${hood} Condo with Amenities`,
  (bed: number, hood: string) => `${bed}-Bedroom Condo in ${hood}`,
  (_bed: number, hood: string) => `Penthouse-Style Living in ${hood}`,
  (_bed: number, hood: string) => `Open-Concept Condo in ${hood}`,
  (_bed: number, hood: string) => `Corner Unit Condo in ${hood}`,
  (_bed: number, hood: string) => `Boutique Condo in ${hood}`,
  (bed: number, hood: string) => `${bed}-Bed ${hood} Condo with Parking`,
  (_bed: number, hood: string) => `Bright ${hood} Condo Near Transit`,
  (_bed: number, hood: string) => `New Construction Condo in ${hood}`,
  (_bed: number, hood: string) => `${hood} Loft-Style Condo`,
  (_bed: number, hood: string) => `Waterfront Condo in ${hood}`,
  (_bed: number, hood: string) => `Top-Floor ${hood} Condo`,
  (bed: number, hood: string) => `Stunning ${bed}-Bed Condo near ${hood}`,
  (_bed: number, hood: string) => `Designer Condo in ${hood}`,
];

const TOWNHOUSE_TITLE_TEMPLATES = [
  (bed: number, hood: string) => `${bed}-Bedroom Townhouse in ${hood}`,
  (_bed: number, hood: string) => `Modern Townhome in ${hood}`,
  (_bed: number, hood: string) => `End-Unit Townhouse in ${hood}`,
  (_bed: number, hood: string) => `Townhome with Garage in ${hood}`,
  (bed: number, hood: string) => `Spacious ${bed}-Bed Townhouse near ${hood}`,
  (_bed: number, hood: string) => `Bright Townhome in ${hood}`,
  (_bed: number, hood: string) => `Family Townhouse in ${hood}`,
  (_bed: number, hood: string) => `Updated Townhome Steps from ${hood}`,
  (_bed: number, hood: string) => `${hood} Row Home with Patio`,
  (bed: number, hood: string) => `${bed}-Bed Townhouse near ${hood} Park`,
  (_bed: number, hood: string) => `Turnkey Townhome in ${hood}`,
  (_bed: number, hood: string) => `Freehold Townhouse in ${hood}`,
  (_bed: number, hood: string) => `${hood} Townhome with Private Yard`,
  (_bed: number, hood: string) => `Recently Renovated Townhouse in ${hood}`,
  (bed: number, hood: string) => `Charming ${bed}-Bed Townhome in ${hood}`,
  (_bed: number, hood: string) => `Multi-Level Townhouse in ${hood}`,
];

const COMMERCIAL_TITLE_TEMPLATES = [
  (_: null, hood: string) => `Prime Retail Space in ${hood}`,
  (_: null, hood: string) => `${hood} Office Suite with Parking`,
  (_: null, hood: string) => `Commercial Space in ${hood}`,
  (_: null, hood: string) => `Versatile ${hood} Commercial Unit`,
  (_: null, hood: string) => `${hood} Storefront Opportunity`,
  (_: null, hood: string) => `Modern Office Space in ${hood}`,
  (_: null, hood: string) => `Open-Plan Commercial Space in ${hood}`,
  (_: null, hood: string) => `${hood} Mixed-Use Commercial`,
  (_: null, hood: string) => `Professional Office in ${hood}`,
  (_: null, hood: string) => `High-Visibility ${hood} Space`,
  (_: null, hood: string) => `${hood} Business Space for Lease`,
  (_: null, hood: string) => `${hood} Commercial Loft`,
  (_: null, hood: string) => `Turnkey Commercial Unit in ${hood}`,
  (_: null, hood: string) => `${hood} Ground-Floor Retail`,
  (_: null, hood: string) => `Flexible ${hood} Commercial Space`,
  (_: null, hood: string) => `${hood} Office with Street Access`,
];

const LAND_TITLE_TEMPLATES = [
  (_: null, hood: string) => `Buildable Lot in ${hood}`,
  (_: null, hood: string) => `Prime Development Land in ${hood}`,
  (_: null, hood: string) => `Vacant Lot near ${hood}`,
  (_: null, hood: string) => `${hood} Land Opportunity`,
  (_: null, hood: string) => `Residential Lot in ${hood}`,
  (_: null, hood: string) => `${hood} Corner Lot`,
  (_: null, hood: string) => `Cleared Land in ${hood}`,
  (_: null, hood: string) => `${hood} Building Site`,
  (_: null, hood: string) => `Investment Land near ${hood}`,
  (_: null, hood: string) => `Flat Lot in ${hood}`,
  (_: null, hood: string) => `${hood} Infill Lot`,
  (_: null, hood: string) => `Scenic Land Parcel in ${hood}`,
  (_: null, hood: string) => `${hood} Residential Plot`,
  (_: null, hood: string) => `Opportunity Lot in ${hood}`,
  (_: null, hood: string) => `${hood} Development Parcel`,
  (_: null, hood: string) => `Rare ${hood} Vacant Land`,
];

// ─── Description templates ───────────────────────────────────────────────────

const HOUSE_DESC_TEMPLATES = [
  (bed: number, hood: string, city: string) =>
    `Welcome to this beautifully maintained ${bed}-bedroom home in ${hood}. Featuring hardwood floors, a renovated kitchen, and a spacious backyard perfect for entertaining. A true gem in ${city}.`,
  (bed: number, hood: string, _city: string) =>
    `This charming ${bed}-bedroom residence in ${hood} offers an open-concept layout with modern finishes throughout. Enjoy the private garden and quiet tree-lined street.`,
  (bed: number, hood: string, city: string) =>
    `Set on a generous lot in ${hood}, this ${bed}-bedroom home combines classic architecture with contemporary upgrades. Close to parks, schools, and the best of ${city}.`,
  (_bed: number, hood: string, city: string) =>
    `Nestled in the heart of ${hood}, this family home features updated bathrooms, a chef's kitchen, and a finished basement. One of ${city}'s most sought-after neighborhoods.`,
  (bed: number, hood: string, _city: string) =>
    `Don't miss this stunning ${bed}-bedroom property in ${hood}. Original character blends seamlessly with modern amenities including central air and a two-car garage.`,
  (_bed: number, hood: string, city: string) =>
    `This inviting home in ${hood} has been lovingly updated while preserving its original charm. Enjoy the fireplace, sunroom, and lush garden. Walk to everything ${city} has to offer.`,
  (bed: number, hood: string, _city: string) =>
    `A rare find in ${hood}: this ${bed}-bedroom home features soaring ceilings, abundant natural light, and a wraparound porch. Perfect for families or professionals.`,
  (_bed: number, hood: string, city: string) =>
    `Located in desirable ${hood}, this home offers move-in-ready living with updated systems, a modern kitchen, and a private backyard oasis. Convenient to all that ${city} provides.`,
  (bed: number, hood: string, _city: string) =>
    `This well-appointed ${bed}-bedroom home in ${hood} features an eat-in kitchen, formal dining room, and a master suite with walk-in closet. Freshly painted throughout.`,
  (_bed: number, hood: string, city: string) =>
    `Situated on a quiet street in ${hood}, this turnkey home offers hardwood floors, stainless steel appliances, and a large deck. Minutes from downtown ${city}.`,
  (bed: number, hood: string, _city: string) =>
    `Bright and spacious ${bed}-bedroom home in ${hood} with an updated interior, energy-efficient windows, and a fully fenced yard. Move right in.`,
  (_bed: number, hood: string, city: string) =>
    `This classic ${hood} home has been thoughtfully renovated with a new roof, updated electrical, and a gourmet kitchen. Walking distance to shops and restaurants in ${city}.`,
];

const APARTMENT_DESC_TEMPLATES = [
  (bed: number, hood: string, city: string) =>
    `This ${bed === 0 ? "studio" : bed + "-bedroom"} apartment in ${hood} offers modern living with easy access to transit. Updated kitchen, in-building laundry, and great natural light. Experience the best of ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `Bright and airy apartment in the heart of ${hood}. Features hardwood floors, a renovated bathroom, and a spacious layout. Steps from shops and restaurants.`,
  (bed: number, hood: string, city: string) =>
    `Enjoy city living in this well-maintained ${bed === 0 ? "studio" : bed + "-bedroom"} in ${hood}. Central air, dedicated parking, and proximity to ${city}'s top attractions make this a standout.`,
  (_bed: number, hood: string, _city: string) =>
    `Located in sought-after ${hood}, this apartment features large windows, updated finishes, and plenty of closet space. Pet-friendly building with on-site management.`,
  (bed: number, hood: string, city: string) =>
    `This ${bed === 0 ? "studio" : bed + "-bedroom"} unit in ${hood} combines comfort and convenience. Modern kitchen, balcony with views, and easy access to public transit in ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `Move into this freshly renovated apartment in ${hood}. New flooring, stainless appliances, and in-unit laundry. A wonderful place to call home.`,
  (bed: number, hood: string, city: string) =>
    `Spacious ${bed === 0 ? "studio" : bed + "-bedroom"} apartment with an open floor plan in ${hood}. Building amenities include a gym and rooftop deck. Central to everything in ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `This ${hood} apartment is perfect for professionals seeking a quiet retreat. Features include a modern kitchen, ample storage, and a private balcony.`,
  (bed: number, hood: string, _city: string) =>
    `Cozy ${bed === 0 ? "studio" : bed + "-bedroom"} in a well-managed building in ${hood}. Laundry on-site, secure entry, and close to parks and dining.`,
  (_bed: number, hood: string, city: string) =>
    `Enjoy the vibrant energy of ${hood} from this comfortable apartment. Updated interior, great closet space, and walk score that makes ${city} living a breeze.`,
  (bed: number, hood: string, _city: string) =>
    `Affordable ${bed === 0 ? "studio" : bed + "-bedroom"} apartment in ${hood} with modern amenities. Central air, elevator access, and friendly neighbors make this a great find.`,
  (_bed: number, hood: string, city: string) =>
    `This sunlit apartment in ${hood} features an open kitchen, hardwood floors, and a balcony overlooking the neighborhood. Minutes from downtown ${city}.`,
];

const CONDO_DESC_TEMPLATES = [
  (bed: number, hood: string, city: string) =>
    `This stunning ${bed}-bedroom condo in ${hood} features floor-to-ceiling windows, an open-concept layout, and premium finishes. Building amenities include a gym, pool, and concierge. Live the ${city} lifestyle.`,
  (_bed: number, hood: string, _city: string) =>
    `Modern condo living at its finest in ${hood}. Enjoy quartz countertops, hardwood floors, and a private balcony with breathtaking views. Underground parking included.`,
  (bed: number, hood: string, city: string) =>
    `Sleek ${bed}-bedroom condo in the heart of ${hood}. In-suite laundry, smart home features, and top-tier building amenities. Walking distance to the best of ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `Corner unit condo in ${hood} with abundant natural light and panoramic views. Spacious layout, modern kitchen, and a large master bedroom with ensuite.`,
  (bed: number, hood: string, city: string) =>
    `This ${bed}-bedroom condo in ${hood} is perfect for urban living. Open floor plan, gourmet kitchen, and full-service building with gym and rooftop terrace. ${city} at your doorstep.`,
  (_bed: number, hood: string, _city: string) =>
    `Immaculate condo in a boutique building in ${hood}. Features include in-unit laundry, central air, and a private storage locker. Move-in ready.`,
  (bed: number, hood: string, city: string) =>
    `Bright and airy ${bed}-bedroom condo in ${hood}. High ceilings, engineered hardwood, and a chef's kitchen with island. One of the best values in ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `Enjoy the best of ${hood} in this beautifully appointed condo. Open living space, spa-like bathroom, and floor-to-ceiling windows. Parking and locker included.`,
  (bed: number, hood: string, _city: string) =>
    `This ${bed}-bedroom condo in ${hood} offers sophisticated urban living. Modern finishes, balcony with views, and access to premium building amenities.`,
  (_bed: number, hood: string, city: string) =>
    `Tastefully designed condo in ${hood} with an efficient layout and high-end finishes. Concierge, gym, and excellent transit access in ${city}.`,
  (bed: number, hood: string, _city: string) =>
    `Elegant ${bed}-bedroom condo in a sought-after ${hood} building. Spacious rooms, updated fixtures, and a private terrace for outdoor enjoyment.`,
  (_bed: number, hood: string, city: string) =>
    `Loft-style condo in ${hood} with exposed details and industrial charm. Open-concept living, great light, and steps from the energy of ${city}.`,
];

const TOWNHOUSE_DESC_TEMPLATES = [
  (bed: number, hood: string, city: string) =>
    `This ${bed}-bedroom townhouse in ${hood} offers multi-level living with a modern kitchen, private patio, and attached garage. Perfect for families looking for space in ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `Move into this beautifully updated townhome in ${hood}. Open-concept main floor, in-unit laundry, and a fenced backyard. Close to schools and parks.`,
  (bed: number, hood: string, city: string) =>
    `Spacious ${bed}-bedroom end-unit townhouse in ${hood}. Extra windows mean extra light. Modern finishes throughout. Walk to shops and dining in ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `Well-maintained townhome in ${hood} featuring hardwood floors, an updated kitchen, and a private courtyard garden. Garage parking included.`,
  (bed: number, hood: string, city: string) =>
    `This ${bed}-bedroom townhouse in ${hood} combines convenience and comfort. Three levels of living space, a rooftop terrace, and proximity to ${city}'s best neighborhoods.`,
  (_bed: number, hood: string, _city: string) =>
    `Bright and contemporary townhome in ${hood} with an open layout, quartz counters, and stainless appliances. Private yard and direct-access garage.`,
  (bed: number, hood: string, city: string) =>
    `Family-friendly ${bed}-bedroom townhouse in ${hood}. Features include a finished basement, master ensuite, and a backyard deck. Minutes from downtown ${city}.`,
  (_bed: number, hood: string, _city: string) =>
    `Charming townhome on a tree-lined street in ${hood}. Updated systems, cozy fireplace, and a welcoming front porch. A wonderful community.`,
  (bed: number, hood: string, _city: string) =>
    `This ${bed}-bedroom townhome in ${hood} is move-in ready with fresh paint, new flooring, and modern fixtures. Garage and private patio included.`,
  (_bed: number, hood: string, city: string) =>
    `Enjoy low-maintenance living in this ${hood} townhouse. Open floor plan, in-suite laundry, and great access to ${city} transit.`,
  (bed: number, hood: string, _city: string) =>
    `Renovated ${bed}-bedroom townhome in ${hood} featuring a chef's kitchen, spa bathroom, and private rooftop deck. A rare find.`,
  (_bed: number, hood: string, city: string) =>
    `This freehold townhouse in ${hood} offers the space of a house with the convenience of condo living. Steps from parks and restaurants in ${city}.`,
];

const COMMERCIAL_DESC_TEMPLATES = [
  (sqft: number, hood: string, city: string) =>
    `Prime ${sqft.toLocaleString()} sqft commercial space in ${hood}. Open floor plan suitable for office, retail, or creative use. High foot traffic location in ${city}.`,
  (sqft: number, hood: string, _city: string) =>
    `Versatile ${sqft.toLocaleString()} sqft commercial unit in ${hood}. Features include high ceilings, loading access, and ample parking. Ready for tenant improvements.`,
  (_sqft: number, hood: string, city: string) =>
    `Professional office space in the heart of ${hood}. Modern build-out with private offices, open workspace, and conference room. One of ${city}'s most desirable business addresses.`,
  (sqft: number, hood: string, _city: string) =>
    `Ground-floor retail opportunity in bustling ${hood}. ${sqft.toLocaleString()} sqft with large storefront windows and excellent visibility. Ideal for restaurant or boutique.`,
  (_sqft: number, hood: string, city: string) =>
    `This ${hood} commercial space offers a blank canvas for your business. High ceilings, open layout, and proximity to major transit routes in ${city}. Parking included.`,
  (sqft: number, hood: string, _city: string) =>
    `Move your business to ${hood} with this turnkey ${sqft.toLocaleString()} sqft space. Modern HVAC, security system, and flexible layout for any use.`,
  (_sqft: number, hood: string, city: string) =>
    `Established commercial location in ${hood} with excellent street-level access and signage opportunities. A prime ${city} business address.`,
  (sqft: number, hood: string, _city: string) =>
    `Bright and open ${sqft.toLocaleString()} sqft commercial unit in ${hood}. Perfect for co-working, medical office, or professional services. All utilities included.`,
  (_sqft: number, hood: string, city: string) =>
    `Invest in this ${hood} commercial property with strong rental potential. Modern systems, elevator access, and central ${city} location.`,
  (sqft: number, hood: string, _city: string) =>
    `Flexible commercial space in ${hood} offering ${sqft.toLocaleString()} sqft of functional workspace. Suitable for tech startup, gallery, or consulting firm.`,
];

const LAND_DESC_TEMPLATES = [
  (lotSize: number, hood: string, city: string) =>
    `${lotSize.toLocaleString()} sqft buildable lot in ${hood}. Flat, cleared, and ready for construction. Utilities available at the street. An excellent opportunity in ${city}.`,
  (lotSize: number, hood: string, _city: string) =>
    `Prime ${lotSize.toLocaleString()} sqft parcel in desirable ${hood}. Zoned residential with potential for a custom home or small development. Survey available.`,
  (_lotSize: number, hood: string, city: string) =>
    `Rare vacant lot in ${hood} surrounded by established homes. Build your dream residence on this tree-lined street in one of ${city}'s best neighborhoods.`,
  (lotSize: number, hood: string, _city: string) =>
    `Development-ready land in ${hood}. ${lotSize.toLocaleString()} sqft with road frontage and all services nearby. Ideal for builders or investors.`,
  (_lotSize: number, hood: string, city: string) =>
    `This corner lot in ${hood} offers excellent visibility and flexible zoning options. A rare land opportunity in the heart of ${city}.`,
  (lotSize: number, hood: string, _city: string) =>
    `Invest in the future with this ${lotSize.toLocaleString()} sqft lot in up-and-coming ${hood}. Surrounded by new construction and growing demand.`,
  (_lotSize: number, hood: string, city: string) =>
    `Scenic lot in ${hood} with mature trees and gentle topography. Perfect setting for a custom home. Close to parks and amenities in ${city}.`,
  (lotSize: number, hood: string, _city: string) =>
    `${lotSize.toLocaleString()} sqft of undeveloped land in ${hood}. Excellent drainage, clear title, and ready for permits. Don't miss this opportunity.`,
  (_lotSize: number, hood: string, city: string) =>
    `Spacious lot in ${hood} offering privacy and room to build. Established neighborhood with easy access to highways and downtown ${city}.`,
  (lotSize: number, hood: string, _city: string) =>
    `Build-ready ${lotSize.toLocaleString()} sqft lot in ${hood}. All municipal services available. Architectural plans available upon request.`,
];

// ─── Amenity pools by type ───────────────────────────────────────────────────

const HOUSE_AMENITIES = ["Garden", "Garage", "Central Air", "Fireplace", "Hardwood Floors", "Pool", "Finished Basement", "Smart Home", "EV Charging", "Security System"];
const APARTMENT_AMENITIES = ["Laundry", "Central Air", "Elevator", "Gym", "Balcony", "Hardwood Floors", "Storage", "Dog Park", "In-Unit Laundry", "Security System"];
const CONDO_AMENITIES = ["Gym", "Pool", "Concierge", "In-Unit Laundry", "Central Air", "Balcony", "Rooftop Terrace", "Smart Home", "EV Charging", "Storage"];
const TOWNHOUSE_AMENITIES = ["Garage", "Garden", "Central Air", "In-Unit Laundry", "Hardwood Floors", "Fireplace", "Finished Basement", "Smart Home", "Storage", "Balcony"];
const COMMERCIAL_AMENITIES = ["Central Air", "Security System", "Elevator", "Storage", "EV Charging", "Smart Home"];

function getAmenities(type: string, index: number): string[] {
  let pool: string[];
  let count: number;
  switch (type) {
    case "house": pool = HOUSE_AMENITIES; count = 4 + (index % 3); break;       // 4-6
    case "apartment": pool = APARTMENT_AMENITIES; count = 3 + (index % 3); break; // 3-5
    case "condo": pool = CONDO_AMENITIES; count = 4 + (index % 3); break;        // 4-6
    case "townhouse": pool = TOWNHOUSE_AMENITIES; count = 3 + (index % 3); break; // 3-5
    case "commercial": pool = COMMERCIAL_AMENITIES; count = 2 + (index % 3); break; // 2-4
    case "land": return index % 5 === 0 ? ["Waterfront"] : [];
    default: return [];
  }
  const start = index % pool.length;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(start + i) % pool.length]);
  }
  return result;
}

// ─── City data ───────────────────────────────────────────────────────────────

interface CityData {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  priceMultiplier: number;
  zipPrefix: string;
  neighborhoods: string[];
  streets: string[];
}

const CITIES: CityData[] = [
  // ── US Cities (20) ──
  {
    name: "New York", state: "NY", country: "US",
    lat: 40.758, lng: -73.986, priceMultiplier: 2.5, zipPrefix: "100",
    neighborhoods: ["Upper West Side", "Chelsea", "Tribeca", "SoHo", "Greenwich Village", "Brooklyn Heights", "Park Slope", "Harlem"],
    streets: ["Broadway", "Fifth Avenue", "Madison Avenue", "Park Avenue", "Lexington Avenue", "West End Avenue", "Amsterdam Avenue", "Columbus Avenue", "Riverside Drive", "Central Park West", "Bleecker Street", "Hudson Street", "Spring Street", "Prince Street", "Waverly Place"],
  },
  {
    name: "Los Angeles", state: "CA", country: "US",
    lat: 34.052, lng: -118.244, priceMultiplier: 2.0, zipPrefix: "900",
    neighborhoods: ["Beverly Hills", "Silver Lake", "Venice", "Santa Monica", "Echo Park", "Los Feliz", "Downtown", "Culver City"],
    streets: ["Sunset Boulevard", "Wilshire Boulevard", "Melrose Avenue", "Hollywood Boulevard", "La Brea Avenue", "Fairfax Avenue", "Venice Boulevard", "Santa Monica Boulevard", "Fountain Avenue", "Robertson Boulevard", "Beverly Drive", "Canon Drive", "Abbot Kinney Boulevard", "Main Street", "Ocean Avenue"],
  },
  {
    name: "San Francisco", state: "CA", country: "US",
    lat: 37.775, lng: -122.419, priceMultiplier: 2.5, zipPrefix: "941",
    neighborhoods: ["Pacific Heights", "Mission District", "Castro", "Noe Valley", "Marina District", "Russian Hill", "North Beach", "Hayes Valley"],
    streets: ["Market Street", "Valencia Street", "Mission Street", "Divisadero Street", "Fillmore Street", "Haight Street", "Lombard Street", "Columbus Avenue", "Grant Avenue", "Union Street", "Chestnut Street", "Sacramento Street", "Folsom Street", "Howard Street", "Guerrero Street"],
  },
  {
    name: "Chicago", state: "IL", country: "US",
    lat: 41.878, lng: -87.630, priceMultiplier: 1.3, zipPrefix: "606",
    neighborhoods: ["Lincoln Park", "Wicker Park", "River North", "Logan Square", "Hyde Park", "Lakeview", "Old Town", "Pilsen"],
    streets: ["Michigan Avenue", "Lake Shore Drive", "Clark Street", "Halsted Street", "Damen Avenue", "Milwaukee Avenue", "Armitage Avenue", "Division Street", "Fullerton Avenue", "Belmont Avenue", "Ashland Avenue", "Western Avenue", "North Avenue", "Clybourn Avenue", "Wells Street"],
  },
  {
    name: "Miami", state: "FL", country: "US",
    lat: 25.762, lng: -80.192, priceMultiplier: 1.7, zipPrefix: "331",
    neighborhoods: ["South Beach", "Brickell", "Wynwood", "Coconut Grove", "Coral Gables", "Little Havana", "Design District", "Edgewater"],
    streets: ["Collins Avenue", "Ocean Drive", "Biscayne Boulevard", "Coral Way", "Brickell Avenue", "Flagler Street", "Calle Ocho", "Alton Road", "Washington Avenue", "Lincoln Road", "NW 2nd Avenue", "Grand Avenue", "Main Highway", "Ponce de Leon Boulevard", "Miracle Mile"],
  },
  {
    name: "Seattle", state: "WA", country: "US",
    lat: 47.606, lng: -122.332, priceMultiplier: 1.8, zipPrefix: "981",
    neighborhoods: ["Capitol Hill", "Ballard", "Fremont", "Queen Anne", "Wallingford", "Green Lake", "University District", "Beacon Hill"],
    streets: ["Pike Street", "Pine Street", "Broadway", "15th Avenue", "Market Street", "Leary Way", "Aurora Avenue", "Rainier Avenue", "Denny Way", "Mercer Street", "Eastlake Avenue", "Westlake Avenue", "Stone Way", "NW 65th Street", "NE 45th Street"],
  },
  {
    name: "Austin", state: "TX", country: "US",
    lat: 30.267, lng: -97.743, priceMultiplier: 1.4, zipPrefix: "787",
    neighborhoods: ["Downtown", "South Congress", "East Austin", "Zilker", "Travis Heights", "Mueller", "Hyde Park", "Clarksville"],
    streets: ["Congress Avenue", "South Lamar Boulevard", "Guadalupe Street", "Barton Springs Road", "Cesar Chavez Street", "Manor Road", "East 6th Street", "South 1st Street", "Red River Street", "Rainey Street", "Duval Street", "Speedway", "Burnet Road", "Anderson Lane", "Oltorf Street"],
  },
  {
    name: "Denver", state: "CO", country: "US",
    lat: 39.739, lng: -104.990, priceMultiplier: 1.5, zipPrefix: "802",
    neighborhoods: ["LoDo", "RiNo", "Capitol Hill", "Cherry Creek", "Highlands", "Washington Park", "Baker", "Congress Park"],
    streets: ["16th Street", "Colfax Avenue", "Broadway", "Larimer Street", "Blake Street", "Market Street", "Tennyson Street", "Platte Street", "Wazee Street", "Wynkoop Street", "Champa Street", "Welton Street", "South Pearl Street", "East 17th Avenue", "Downing Street"],
  },
  {
    name: "Boston", state: "MA", country: "US",
    lat: 42.360, lng: -71.058, priceMultiplier: 2.0, zipPrefix: "021",
    neighborhoods: ["Back Bay", "Beacon Hill", "South End", "North End", "Charlestown", "Jamaica Plain", "Cambridge", "Brookline"],
    streets: ["Boylston Street", "Newbury Street", "Commonwealth Avenue", "Beacon Street", "Charles Street", "Tremont Street", "Hanover Street", "Atlantic Avenue", "Cambridge Street", "Marlborough Street", "Dartmouth Street", "Clarendon Street", "Centre Street", "Harvard Street", "Massachusetts Avenue"],
  },
  {
    name: "Dallas", state: "TX", country: "US",
    lat: 32.777, lng: -96.797, priceMultiplier: 1.1, zipPrefix: "752",
    neighborhoods: ["Uptown", "Deep Ellum", "Oak Lawn", "Bishop Arts", "Knox-Henderson", "Lakewood", "Highland Park", "Preston Hollow"],
    streets: ["McKinney Avenue", "Elm Street", "Commerce Street", "Main Street", "Ross Avenue", "Cedar Springs Road", "Greenville Avenue", "Fitzhugh Avenue", "Gaston Avenue", "Mockingbird Lane", "Preston Road", "Northwest Highway", "Lovers Lane", "Oak Lawn Avenue", "Harry Hines Boulevard"],
  },
  {
    name: "Houston", state: "TX", country: "US",
    lat: 29.760, lng: -95.370, priceMultiplier: 1.0, zipPrefix: "770",
    neighborhoods: ["Montrose", "Heights", "Midtown", "River Oaks", "Museum District", "EaDo", "West University", "Rice Village"],
    streets: ["Westheimer Road", "Montrose Boulevard", "Kirby Drive", "Main Street", "Washington Avenue", "Richmond Avenue", "Shepherd Drive", "Heights Boulevard", "Bagby Street", "Allen Parkway", "San Felipe Street", "Memorial Drive", "Bissonnet Street", "University Boulevard", "Rice Boulevard"],
  },
  {
    name: "Phoenix", state: "AZ", country: "US",
    lat: 33.449, lng: -112.074, priceMultiplier: 1.1, zipPrefix: "850",
    neighborhoods: ["Downtown", "Arcadia", "Biltmore", "Roosevelt Row", "Encanto", "Camelback East", "North Central", "Ahwatukee"],
    streets: ["Central Avenue", "Camelback Road", "Indian School Road", "Thomas Road", "McDowell Road", "7th Street", "7th Avenue", "Roosevelt Street", "Van Buren Street", "Washington Street", "Cave Creek Road", "Tatum Boulevard", "Scottsdale Road", "44th Street", "24th Street"],
  },
  {
    name: "Philadelphia", state: "PA", country: "US",
    lat: 39.953, lng: -75.164, priceMultiplier: 1.2, zipPrefix: "191",
    neighborhoods: ["Rittenhouse Square", "Old City", "Fishtown", "Northern Liberties", "Society Hill", "Graduate Hospital", "Fairmount", "Manayunk"],
    streets: ["Broad Street", "Market Street", "Walnut Street", "Chestnut Street", "South Street", "Pine Street", "Spruce Street", "Girard Avenue", "Frankford Avenue", "Front Street", "2nd Street", "5th Street", "Main Street", "Ridge Avenue", "Lancaster Avenue"],
  },
  {
    name: "Nashville", state: "TN", country: "US",
    lat: 36.163, lng: -86.781, priceMultiplier: 1.3, zipPrefix: "372",
    neighborhoods: ["The Gulch", "East Nashville", "Germantown", "12 South", "Sylvan Park", "Green Hills", "Berry Hill", "Salemtown"],
    streets: ["Broadway", "Church Street", "West End Avenue", "Gallatin Pike", "Nolensville Pike", "8th Avenue South", "12th Avenue South", "Woodland Street", "5th Avenue North", "Charlotte Pike", "Belmont Boulevard", "Wedgewood Avenue", "Dickerson Pike", "Lebanon Pike", "Division Street"],
  },
  {
    name: "Portland", state: "OR", country: "US",
    lat: 45.523, lng: -122.677, priceMultiplier: 1.4, zipPrefix: "972",
    neighborhoods: ["Pearl District", "Alberta Arts", "Hawthorne", "Division", "Sellwood", "Nob Hill", "St. Johns", "Mississippi"],
    streets: ["Burnside Street", "Hawthorne Boulevard", "Division Street", "Alberta Street", "Mississippi Avenue", "NW 23rd Avenue", "Belmont Street", "Sandy Boulevard", "MLK Jr Boulevard", "Lombard Street", "Fremont Street", "Glisan Street", "Powell Boulevard", "Killingsworth Street", "Foster Road"],
  },
  {
    name: "San Diego", state: "CA", country: "US",
    lat: 32.716, lng: -117.161, priceMultiplier: 1.8, zipPrefix: "921",
    neighborhoods: ["Gaslamp Quarter", "North Park", "Hillcrest", "La Jolla", "Pacific Beach", "Little Italy", "Mission Hills", "Bankers Hill"],
    streets: ["5th Avenue", "India Street", "University Avenue", "El Cajon Boulevard", "30th Street", "Adams Avenue", "Garnet Avenue", "Grand Avenue", "Kettner Boulevard", "Harbor Drive", "Broadway", "Market Street", "Island Avenue", "Prospect Street", "Coast Boulevard"],
  },
  {
    name: "Atlanta", state: "GA", country: "US",
    lat: 33.749, lng: -84.388, priceMultiplier: 1.1, zipPrefix: "303",
    neighborhoods: ["Midtown", "Virginia-Highland", "Buckhead", "Inman Park", "Old Fourth Ward", "Decatur", "Grant Park", "East Atlanta"],
    streets: ["Peachtree Street", "Ponce de Leon Avenue", "North Highland Avenue", "Monroe Drive", "10th Street", "Piedmont Avenue", "Moreland Avenue", "Euclid Avenue", "DeKalb Avenue", "Memorial Drive", "Spring Street", "Juniper Street", "Edgewood Avenue", "Boulevard", "Ralph McGill Boulevard"],
  },
  {
    name: "Washington", state: "DC", country: "US",
    lat: 38.907, lng: -77.037, priceMultiplier: 2.0, zipPrefix: "200",
    neighborhoods: ["Georgetown", "Dupont Circle", "Capitol Hill", "Adams Morgan", "Logan Circle", "Shaw", "U Street Corridor", "Navy Yard"],
    streets: ["M Street", "Connecticut Avenue", "Pennsylvania Avenue", "Wisconsin Avenue", "14th Street", "H Street", "U Street", "Massachusetts Avenue", "K Street", "Rhode Island Avenue", "New Hampshire Avenue", "P Street", "Q Street", "16th Street", "Columbia Road"],
  },
  {
    name: "Minneapolis", state: "MN", country: "US",
    lat: 44.978, lng: -93.265, priceMultiplier: 1.1, zipPrefix: "554",
    neighborhoods: ["North Loop", "Uptown", "Northeast", "Linden Hills", "Whittier", "Lowry Hill", "Seward", "Longfellow"],
    streets: ["Hennepin Avenue", "Nicollet Avenue", "Lake Street", "Washington Avenue", "Lyndale Avenue", "1st Avenue", "2nd Street", "3rd Avenue", "Portland Avenue", "Central Avenue", "University Avenue", "Franklin Avenue", "Excelsior Boulevard", "Bryant Avenue", "Calhoun Boulevard"],
  },
  {
    name: "Las Vegas", state: "NV", country: "US",
    lat: 36.169, lng: -115.140, priceMultiplier: 1.0, zipPrefix: "891",
    neighborhoods: ["Summerlin", "Henderson", "Arts District", "Downtown", "Spring Valley", "Green Valley", "Centennial Hills", "Rhodes Ranch"],
    streets: ["Las Vegas Boulevard", "Sahara Avenue", "Flamingo Road", "Tropicana Avenue", "Charleston Boulevard", "Fremont Street", "Desert Inn Road", "Rainbow Boulevard", "Durango Drive", "Eastern Avenue", "Maryland Parkway", "Paradise Road", "Decatur Boulevard", "Jones Boulevard", "Rampart Boulevard"],
  },
  // ── Canadian Cities (5) ──
  {
    name: "Toronto", state: "ON", country: "CA",
    lat: 43.653, lng: -79.383, priceMultiplier: 2.0, zipPrefix: "M5",
    neighborhoods: ["Yorkville", "Queen West", "Liberty Village", "Distillery District", "The Annex", "Leslieville", "Roncesvalles", "King West"],
    streets: ["Queen Street West", "King Street West", "Bloor Street", "Dundas Street", "College Street", "Yonge Street", "Bay Street", "Spadina Avenue", "Ossington Avenue", "Bathurst Street", "Parliament Street", "Broadview Avenue", "Danforth Avenue", "St. Clair Avenue", "Eglinton Avenue"],
  },
  {
    name: "Vancouver", state: "BC", country: "CA",
    lat: 49.283, lng: -123.121, priceMultiplier: 2.2, zipPrefix: "V6",
    neighborhoods: ["Kitsilano", "Yaletown", "Gastown", "Mount Pleasant", "West End", "Kerrisdale", "Commercial Drive", "South Granville"],
    streets: ["Robson Street", "Granville Street", "Main Street", "Broadway", "Davie Street", "Hastings Street", "Cambie Street", "Commercial Drive", "4th Avenue", "Denman Street", "Burrard Street", "West Boulevard", "Kingsway", "Oak Street", "Fraser Street"],
  },
  {
    name: "Montreal", state: "QC", country: "CA",
    lat: 45.502, lng: -73.567, priceMultiplier: 1.3, zipPrefix: "H2",
    neighborhoods: ["Plateau Mont-Royal", "Mile End", "Old Montreal", "Griffintown", "Outremont", "Westmount", "Verdun", "Villeray"],
    streets: ["Saint-Laurent Boulevard", "Saint-Denis Street", "Sainte-Catherine Street", "Sherbrooke Street", "Mont-Royal Avenue", "Rachel Street", "Laurier Avenue", "Bernard Avenue", "Duluth Avenue", "Fairmount Avenue", "Notre-Dame Street", "Wellington Street", "de la Commune Street", "McGill Street", "Peel Street"],
  },
  {
    name: "Calgary", state: "AB", country: "CA",
    lat: 51.048, lng: -114.072, priceMultiplier: 1.1, zipPrefix: "T2",
    neighborhoods: ["Kensington", "Inglewood", "Beltline", "Mission", "Bridgeland", "Marda Loop", "Altadore", "Hillhurst"],
    streets: ["17th Avenue SW", "4th Street SW", "Centre Street", "Edmonton Trail", "Macleod Trail", "Crowchild Trail", "9th Avenue SE", "1st Street SW", "Stephen Avenue", "10th Street NW", "14th Street SW", "Kensington Road", "Memorial Drive", "Bow Trail", "Elbow Drive"],
  },
  {
    name: "Edmonton", state: "AB", country: "CA",
    lat: 53.546, lng: -113.491, priceMultiplier: 0.9, zipPrefix: "T5",
    neighborhoods: ["Old Strathcona", "Oliver", "Downtown", "Garneau", "Glenora", "Ritchie", "Highlands", "Bonnie Doon"],
    streets: ["Whyte Avenue", "Jasper Avenue", "104th Street", "124th Street", "Stony Plain Road", "109th Street", "82nd Avenue", "97th Street", "Gateway Boulevard", "Calgary Trail", "75th Street", "118th Avenue", "St. Albert Trail", "Groat Road", "Saskatchewan Drive"],
  },
];

// ─── Property distribution per city ──────────────────────────────────────────

// 20 properties per city:
// 6 houses:      indices 0-5   (5 sale, 1 rent)
// 4 apartments:  indices 6-9   (1 sale, 3 rent)
// 4 condos:      indices 10-13 (3 sale, 1 rent)
// 3 townhouses:  indices 14-16 (2 sale, 1 rent)
// 2 commercial:  indices 17-18 (1 sale, 1 rent)
// 1 land:        index 19      (1 sale)

interface PropertySlot {
  type: "house" | "apartment" | "condo" | "townhouse" | "commercial" | "land";
  listingType: "sale" | "rent";
}

const PROPERTY_SLOTS: PropertySlot[] = [
  // 6 houses: 5 sale, 1 rent
  { type: "house", listingType: "sale" },
  { type: "house", listingType: "sale" },
  { type: "house", listingType: "sale" },
  { type: "house", listingType: "sale" },
  { type: "house", listingType: "sale" },
  { type: "house", listingType: "rent" },
  // 4 apartments: 1 sale, 3 rent
  { type: "apartment", listingType: "sale" },
  { type: "apartment", listingType: "rent" },
  { type: "apartment", listingType: "rent" },
  { type: "apartment", listingType: "rent" },
  // 4 condos: 3 sale, 1 rent
  { type: "condo", listingType: "sale" },
  { type: "condo", listingType: "sale" },
  { type: "condo", listingType: "sale" },
  { type: "condo", listingType: "rent" },
  // 3 townhouses: 2 sale, 1 rent
  { type: "townhouse", listingType: "sale" },
  { type: "townhouse", listingType: "sale" },
  { type: "townhouse", listingType: "rent" },
  // 2 commercial: 1 sale, 1 rent
  { type: "commercial", listingType: "sale" },
  { type: "commercial", listingType: "rent" },
  // 1 land: 1 sale
  { type: "land", listingType: "sale" },
];

// ─── Price calculation ───────────────────────────────────────────────────────

function getPrice(
  type: string,
  listingType: string,
  multiplier: number,
  index: number,
): number {
  let min: number;
  let max: number;

  if (type === "house" && listingType === "sale") { min = 350000; max = 1200000; }
  else if (type === "house" && listingType === "rent") { min = 2000; max = 5000; }
  else if (type === "apartment" && listingType === "rent") { min = 1200; max = 3500; }
  else if (type === "apartment" && listingType === "sale") { min = 200000; max = 500000; }
  else if (type === "condo" && listingType === "sale") { min = 250000; max = 700000; }
  else if (type === "condo" && listingType === "rent") { min = 1500; max = 3500; }
  else if (type === "townhouse" && listingType === "sale") { min = 300000; max = 800000; }
  else if (type === "townhouse" && listingType === "rent") { min = 1800; max = 4000; }
  else if (type === "commercial" && listingType === "sale") { min = 500000; max = 3000000; }
  else if (type === "commercial" && listingType === "rent") { min = 3000; max = 12000; }
  else if (type === "land" && listingType === "sale") { min = 80000; max = 500000; }
  else { min = 100000; max = 500000; }

  const step = (max - min) / 19; // 20 increments
  const raw = min + step * (index % 20);
  const price = Math.round(raw * multiplier);

  // Round sale prices to nearest 1000, rent to nearest 50
  if (listingType === "sale") {
    return Math.round(price / 1000) * 1000;
  }
  return Math.round(price / 50) * 50;
}

// ─── Property details by type ────────────────────────────────────────────────

interface PropertyDetails {
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number;
  lot_size: number | null;
  year_built: number | null;
  parking_spaces: number;
}

function getPropertyDetails(type: string, index: number): PropertyDetails {
  switch (type) {
    case "house": {
      const bed = pick(index, 2, 6);
      const bath = roundHalf(pick(index + 3, 2, 8) / 2); // 1 - 4
      const sqft = pick(index + 1, 0, 10) * 330 + 1200; // 1200-4500
      const lot = pick(index + 2, 0, 12) * 1000 + 2000; // 2000-14000 (close to 15000 range)
      const year = pick(index + 4, 1920, 2025);
      const park = pick(index + 5, 1, 3);
      return { bedrooms: bed, bathrooms: bath, sqft, lot_size: lot, year_built: year, parking_spaces: park };
    }
    case "apartment": {
      const bed = pick(index, 0, 3);
      const bath = pick(index + 1, 1, 2);
      const sqft = pick(index + 2, 0, 10) * 110 + 400; // 400-1500
      const year = pick(index + 3, 1960, 2024);
      const park = pick(index + 4, 0, 1);
      return { bedrooms: bed, bathrooms: bath, sqft, lot_size: null, year_built: year, parking_spaces: park };
    }
    case "condo": {
      const bed = pick(index, 1, 3);
      const bath = roundHalf(pick(index + 1, 2, 5) / 2); // 1 - 2.5
      const sqft = pick(index + 2, 0, 13) * 100 + 600; // 600-1900 (close to 2000)
      const year = pick(index + 3, 2000, 2025);
      return { bedrooms: bed, bathrooms: bath, sqft, lot_size: null, year_built: year, parking_spaces: 1 };
    }
    case "townhouse": {
      const bed = pick(index, 2, 4);
      const bath = roundHalf(pick(index + 1, 3, 7) / 2); // 1.5 - 3.5
      const sqft = pick(index + 2, 0, 14) * 100 + 1000; // 1000-2400 (close to 2500)
      const lot = pick(index + 3, 0, 10) * 200 + 1000; // 1000-3000
      const year = pick(index + 4, 1980, 2024);
      const park = pick(index + 5, 1, 2);
      return { bedrooms: bed, bathrooms: bath, sqft, lot_size: lot, year_built: year, parking_spaces: park };
    }
    case "commercial": {
      const bath = pick(index, 1, 4);
      const sqft = pick(index + 1, 0, 7) * 500 + 1000; // 1000-4500 (close to 5000)
      const year = pick(index + 2, 1990, 2023);
      const park = pick(index + 3, 3, 10);
      return { bedrooms: null, bathrooms: bath, sqft, lot_size: null, year_built: year, parking_spaces: park };
    }
    case "land": {
      const lot = pick(index, 0, 8) * 5000 + 5000; // 5000-45000 (close to 50000)
      return { bedrooms: null, bathrooms: null, sqft: lot, lot_size: lot, year_built: null, parking_spaces: 0 };
    }
    default:
      return { bedrooms: null, bathrooms: null, sqft: 0, lot_size: null, year_built: null, parking_spaces: 0 };
  }
}

// ─── ZIP code generation ─────────────────────────────────────────────────────

function generateZip(city: CityData, index: number): string {
  if (city.country === "CA") {
    // Canadian postal code: prefix + " " + digit + letter + digit
    const d1 = index % 10;
    const letters = "ABCEGHJKLMNPRSTVWXYZ"; // valid Canadian postal code letters
    const l1 = letters[(index * 3 + 7) % letters.length];
    const d2 = (index * 2 + 3) % 10;
    return `${city.zipPrefix}${d1} ${d2}${l1}${(index + 1) % 10}`;
  }
  // US ZIP: prefix + 2 digits
  const suffix = ((index * 7 + 13) % 100).toString().padStart(2, "0");
  return `${city.zipPrefix}${suffix}`;
}

// ─── Address generation ──────────────────────────────────────────────────────

function generateAddress(
  type: string,
  streets: string[],
  index: number,
  globalIndex: number,
): string {
  const street = pickFrom(streets, index + globalIndex);
  const number = ((globalIndex * 137 + index * 41 + 23) % 9900) + 100; // 100-9999
  const base = `${number} ${street}`;

  if (type === "apartment" || type === "condo") {
    // Generate a unit number
    const floor = ((index * 3 + globalIndex) % 20) + 1;
    const unit = ((index + globalIndex * 2) % 12) + 1;
    const unitStr = floor > 5 ? `${floor}${String.fromCharCode(65 + (unit % 6))}` : `${unit}`;
    return `${base} Unit ${unitStr}`;
  }
  return base;
}

// ─── Title generation ────────────────────────────────────────────────────────

function generateTitle(
  type: string,
  bed: number | null,
  hood: string,
  index: number,
): string {
  switch (type) {
    case "house":
      return pickFrom(HOUSE_TITLE_TEMPLATES, index)(bed ?? 3, hood);
    case "apartment":
      return pickFrom(APARTMENT_TITLE_TEMPLATES, index)(bed ?? 1, hood);
    case "condo":
      return pickFrom(CONDO_TITLE_TEMPLATES, index)(bed ?? 2, hood);
    case "townhouse":
      return pickFrom(TOWNHOUSE_TITLE_TEMPLATES, index)(bed ?? 3, hood);
    case "commercial":
      return pickFrom(COMMERCIAL_TITLE_TEMPLATES, index)(null, hood);
    case "land":
      return pickFrom(LAND_TITLE_TEMPLATES, index)(null, hood);
    default:
      return `Property in ${hood}`;
  }
}

// ─── Description generation ──────────────────────────────────────────────────

function generateDescription(
  type: string,
  details: PropertyDetails,
  hood: string,
  city: string,
  index: number,
): string {
  switch (type) {
    case "house":
      return pickFrom(HOUSE_DESC_TEMPLATES, index)(details.bedrooms ?? 3, hood, city);
    case "apartment":
      return pickFrom(APARTMENT_DESC_TEMPLATES, index)(details.bedrooms ?? 1, hood, city);
    case "condo":
      return pickFrom(CONDO_DESC_TEMPLATES, index)(details.bedrooms ?? 2, hood, city);
    case "townhouse":
      return pickFrom(TOWNHOUSE_DESC_TEMPLATES, index)(details.bedrooms ?? 3, hood, city);
    case "commercial":
      return pickFrom(COMMERCIAL_DESC_TEMPLATES, index)(details.sqft, hood, city);
    case "land":
      return pickFrom(LAND_DESC_TEMPLATES, index)(details.lot_size ?? details.sqft, hood, city);
    default:
      return `A wonderful property in ${hood}, ${city}.`;
  }
}

// ─── Main generator ──────────────────────────────────────────────────────────

export function generateNAProperties(): PropertySeed[] {
  const properties: PropertySeed[] = [];

  for (let cityIdx = 0; cityIdx < CITIES.length; cityIdx++) {
    const city = CITIES[cityIdx];

    for (let slotIdx = 0; slotIdx < PROPERTY_SLOTS.length; slotIdx++) {
      const globalIndex = cityIdx * 20 + slotIdx;
      const slot = PROPERTY_SLOTS[slotIdx];
      const { type, listingType } = slot;

      // Deterministic neighborhood and index for variety
      const hood = pickFrom(city.neighborhoods, slotIdx + cityIdx * 3);

      // Property details
      const details = getPropertyDetails(type, globalIndex);

      // Coordinates: spread around city center
      const latOffset = coordOffset(slotIdx, 1.0);
      const lngOffset = coordOffset((slotIdx + 7) % 20, 1.0);
      const latitude = parseFloat((city.lat + latOffset).toFixed(4));
      const longitude = parseFloat((city.lng + lngOffset).toFixed(4));

      // Price
      const price = getPrice(type, listingType, city.priceMultiplier, globalIndex);

      // ZIP
      const zip_code = generateZip(city, slotIdx);

      // Address
      const address = generateAddress(type, city.streets, slotIdx, globalIndex);

      // Title
      const title = generateTitle(type, details.bedrooms, hood, globalIndex);

      // Description
      const description = generateDescription(type, details, hood, city.name, globalIndex);

      // Amenities
      const amenities = getAmenities(type, globalIndex);

      properties.push({
        title,
        description,
        property_type: type,
        listing_type: listingType,
        price,
        address,
        city: city.name,
        state: city.state,
        zip_code,
        country: city.country,
        latitude,
        longitude,
        bedrooms: details.bedrooms,
        bathrooms: details.bathrooms,
        sqft: details.sqft,
        lot_size: details.lot_size,
        year_built: details.year_built,
        parking_spaces: details.parking_spaces,
        amenities,
      });
    }
  }

  return properties;
}
