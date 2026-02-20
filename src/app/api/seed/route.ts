import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OTTAWA_PROPERTIES = [
  // ── The Glebe ──
  {
    title: "Charming Victorian in The Glebe",
    description: "Beautifully restored 3-storey Victorian home on a tree-lined street in the heart of The Glebe. Original hardwood floors, modern kitchen with quartz countertops, and a private backyard garden. Steps from Lansdowne Park and the Rideau Canal.",
    property_type: "house", listing_type: "sale", price: 1250000,
    address: "142 Fifth Avenue", city: "Ottawa", state: "Ontario", zip_code: "K1S 2M8", country: "CA",
    latitude: 45.3965, longitude: -75.6910,
    bedrooms: 4, bathrooms: 2.5, sqft: 2400, lot_size: 3200, year_built: 1912, parking_spaces: 1,
    amenities: ["Garden", "Hardwood Floors", "Fireplace", "Central Air"],
  },
  {
    title: "Modern Glebe Townhome",
    description: "Sleek 3-bedroom townhome with rooftop terrace and attached garage. Open-concept main floor, chef's kitchen with island, and floor-to-ceiling windows. Walk to Bank Street shops and restaurants.",
    property_type: "townhouse", listing_type: "sale", price: 875000,
    address: "38 Holmwood Avenue", city: "Ottawa", state: "Ontario", zip_code: "K1S 2P5", country: "CA",
    latitude: 45.3980, longitude: -75.6880,
    bedrooms: 3, bathrooms: 2, sqft: 1800, lot_size: 1500, year_built: 2019, parking_spaces: 1,
    amenities: ["Garage", "Central Air", "Rooftop Terrace", "In-Unit Laundry"],
  },
  // ── Westboro ──
  {
    title: "Westboro Waterfront Condo",
    description: "Stunning 2-bedroom condo overlooking the Ottawa River. Floor-to-ceiling windows, open-concept living, in-suite laundry, and underground parking. Walk to Westboro Beach and the vibrant village shops.",
    property_type: "condo", listing_type: "sale", price: 625000,
    address: "500 Richmond Road Unit 1204", city: "Ottawa", state: "Ontario", zip_code: "K2A 0E8", country: "CA",
    latitude: 45.3876, longitude: -75.7540,
    bedrooms: 2, bathrooms: 2, sqft: 1100, lot_size: null, year_built: 2021, parking_spaces: 1,
    amenities: ["Gym", "Pool", "Concierge", "In-Unit Laundry", "Central Air"],
  },
  {
    title: "Cozy Westboro Bungalow",
    description: "Completely renovated bungalow on a quiet crescent. New kitchen, updated bathrooms, finished basement with rec room. Large fenced yard perfect for families. Minutes from Westboro Village.",
    property_type: "house", listing_type: "sale", price: 785000,
    address: "27 Dorian Crescent", city: "Ottawa", state: "Ontario", zip_code: "K2A 1B5", country: "CA",
    latitude: 45.3850, longitude: -75.7610,
    bedrooms: 3, bathrooms: 2, sqft: 1600, lot_size: 5500, year_built: 1958, parking_spaces: 2,
    amenities: ["Garden", "Central Air", "Fireplace", "Finished Basement"],
  },
  {
    title: "Westboro Village Rental",
    description: "Bright 1-bedroom apartment in the heart of Westboro Village. Hardwood floors, updated kitchen, in-building laundry. Steps from shops, restaurants, and the Transitway.",
    property_type: "apartment", listing_type: "rent", price: 1850,
    address: "352 Richmond Road Unit 3", city: "Ottawa", state: "Ontario", zip_code: "K2A 0E7", country: "CA",
    latitude: 45.3870, longitude: -75.7500,
    bedrooms: 1, bathrooms: 1, sqft: 650, lot_size: null, year_built: 2005, parking_spaces: 0,
    amenities: ["Hardwood Floors", "Laundry", "Central Air"],
  },
  // ── Centretown ──
  {
    title: "Luxury Penthouse in Centretown",
    description: "Expansive 2-level penthouse with panoramic views of Parliament Hill and the Ottawa skyline. Private elevator, chef's kitchen, 3 bedrooms, home office, and wraparound terrace. Full concierge building.",
    property_type: "condo", listing_type: "sale", price: 1850000,
    address: "234 Laurier Avenue West PH1", city: "Ottawa", state: "Ontario", zip_code: "K1P 5J6", country: "CA",
    latitude: 45.4200, longitude: -75.6950,
    bedrooms: 3, bathrooms: 3, sqft: 2800, lot_size: null, year_built: 2020, parking_spaces: 2,
    amenities: ["Concierge", "Gym", "Pool", "Rooftop Terrace", "Central Air", "In-Unit Laundry"],
  },
  {
    title: "Centretown Brownstone Apartment",
    description: "Charming 2-bedroom in a classic Centretown brownstone. High ceilings, crown moulding, exposed brick accent wall. Walk to Elgin Street and the canal.",
    property_type: "apartment", listing_type: "rent", price: 2200,
    address: "185 MacLaren Street Unit 2", city: "Ottawa", state: "Ontario", zip_code: "K2P 0L5", country: "CA",
    latitude: 45.4175, longitude: -75.6920,
    bedrooms: 2, bathrooms: 1, sqft: 900, lot_size: null, year_built: 1920, parking_spaces: 0,
    amenities: ["Hardwood Floors", "Fireplace", "In-Unit Laundry"],
  },
  {
    title: "Modern Studio near Parliament",
    description: "Sleek studio apartment in a modern high-rise. Murphy bed, built-in storage, floor-to-ceiling windows with city views. Perfect for professionals. All utilities included.",
    property_type: "apartment", listing_type: "rent", price: 1650,
    address: "150 Metcalfe Street Unit 808", city: "Ottawa", state: "Ontario", zip_code: "K2P 1P1", country: "CA",
    latitude: 45.4190, longitude: -75.6935,
    bedrooms: 0, bathrooms: 1, sqft: 480, lot_size: null, year_built: 2022, parking_spaces: 0,
    amenities: ["Gym", "Concierge", "Central Air", "In-Unit Laundry"],
  },
  // ── Byward Market ──
  {
    title: "Loft-Style Condo in ByWard Market",
    description: "Industrial-chic loft with 14-foot ceilings, exposed ductwork, polished concrete floors, and oversized windows. Open-concept living in Ottawa's most vibrant neighbourhood.",
    property_type: "condo", listing_type: "sale", price: 545000,
    address: "55 By Ward Market Square Unit 402", city: "Ottawa", state: "Ontario", zip_code: "K1N 9C3", country: "CA",
    latitude: 45.4275, longitude: -75.6925,
    bedrooms: 1, bathrooms: 1, sqft: 850, lot_size: null, year_built: 2018, parking_spaces: 1,
    amenities: ["Gym", "Rooftop Terrace", "In-Unit Laundry", "Central Air"],
  },
  {
    title: "Heritage Lowertown Row House",
    description: "Lovingly restored heritage row house in Lowertown. 3 bedrooms, original wood detailing, updated systems, private courtyard garden. Walk to ByWard Market and the Rideau Centre.",
    property_type: "townhouse", listing_type: "sale", price: 695000,
    address: "280 St. Patrick Street", city: "Ottawa", state: "Ontario", zip_code: "K1N 5K5", country: "CA",
    latitude: 45.4310, longitude: -75.6870,
    bedrooms: 3, bathrooms: 1.5, sqft: 1400, lot_size: 1200, year_built: 1890, parking_spaces: 0,
    amenities: ["Garden", "Hardwood Floors", "Fireplace"],
  },
  // ── Sandy Hill ──
  {
    title: "Spacious Sandy Hill Family Home",
    description: "Grand 5-bedroom home near the University of Ottawa. Original character with modern updates. Large living and dining rooms, finished basement, and mature trees on a generous lot.",
    property_type: "house", listing_type: "sale", price: 1100000,
    address: "85 Blackburn Avenue", city: "Ottawa", state: "Ontario", zip_code: "K1N 8A5", country: "CA",
    latitude: 45.4220, longitude: -75.6780,
    bedrooms: 5, bathrooms: 3, sqft: 3200, lot_size: 4800, year_built: 1905, parking_spaces: 2,
    amenities: ["Garden", "Hardwood Floors", "Fireplace", "Finished Basement", "Central Air"],
  },
  {
    title: "Sandy Hill Student-Friendly Rental",
    description: "Clean and bright 3-bedroom upper unit near uOttawa campus. Includes heat and water. Laundry in building. Perfect for students or young professionals.",
    property_type: "apartment", listing_type: "rent", price: 2400,
    address: "210 Henderson Avenue Unit B", city: "Ottawa", state: "Ontario", zip_code: "K1N 7P2", country: "CA",
    latitude: 45.4235, longitude: -75.6760,
    bedrooms: 3, bathrooms: 1, sqft: 1050, lot_size: null, year_built: 1965, parking_spaces: 0,
    amenities: ["Laundry", "Hardwood Floors"],
  },
  // ── New Edinburgh ──
  {
    title: "Elegant New Edinburgh Estate",
    description: "Stately 4-bedroom home overlooking the Rideau River. Chef's kitchen, formal dining, library, and landscaped grounds with river access. One of Ottawa's most prestigious addresses.",
    property_type: "house", listing_type: "sale", price: 2400000,
    address: "10 Alexander Street", city: "Ottawa", state: "Ontario", zip_code: "K1N 9H4", country: "CA",
    latitude: 45.4380, longitude: -75.6800,
    bedrooms: 4, bathrooms: 3.5, sqft: 4200, lot_size: 8500, year_built: 1935, parking_spaces: 2,
    amenities: ["Garden", "Pool", "Fireplace", "Garage", "Central Air", "Hardwood Floors"],
  },
  {
    title: "New Edinburgh Village Condo",
    description: "Bright corner unit in a boutique building on Beechwood Avenue. 2 bedrooms, open kitchen, in-suite laundry, balcony with treetop views. Walk to cafes and the river pathways.",
    property_type: "condo", listing_type: "sale", price: 489000,
    address: "222 Beechwood Avenue Unit 305", city: "Ottawa", state: "Ontario", zip_code: "K1L 8A7", country: "CA",
    latitude: 45.4400, longitude: -75.6700,
    bedrooms: 2, bathrooms: 1, sqft: 950, lot_size: null, year_built: 2016, parking_spaces: 1,
    amenities: ["Central Air", "In-Unit Laundry", "Balcony"],
  },
  // ── Hintonburg ──
  {
    title: "Trendy Hintonburg Semi-Detached",
    description: "Fully renovated semi in the hottest neighbourhood in Ottawa. Open-concept main floor, quartz kitchen, 3 bedrooms upstairs, and a huge deck overlooking a private backyard. Steps from Wellington West shops.",
    property_type: "house", listing_type: "sale", price: 820000,
    address: "78 Fairmont Avenue", city: "Ottawa", state: "Ontario", zip_code: "K1Y 1X3", country: "CA",
    latitude: 45.4010, longitude: -75.7250,
    bedrooms: 3, bathrooms: 2, sqft: 1500, lot_size: 2000, year_built: 1920, parking_spaces: 1,
    amenities: ["Garden", "Hardwood Floors", "Central Air", "In-Unit Laundry"],
  },
  {
    title: "Hintonburg Artist Loft",
    description: "Unique loft-style 1-bedroom in a converted warehouse. Soaring ceilings, exposed brick, massive windows flooding the space with natural light. Includes heated underground parking.",
    property_type: "condo", listing_type: "rent", price: 2100,
    address: "1140 Wellington Street West Unit 210", city: "Ottawa", state: "Ontario", zip_code: "K1Y 2Z7", country: "CA",
    latitude: 45.3990, longitude: -75.7310,
    bedrooms: 1, bathrooms: 1, sqft: 780, lot_size: null, year_built: 2017, parking_spaces: 1,
    amenities: ["Gym", "In-Unit Laundry", "Central Air", "Hardwood Floors"],
  },
  // ── Old Ottawa South ──
  {
    title: "Classic Home in Old Ottawa South",
    description: "Beautiful 3-bedroom home on a quiet street near Brewer Park. Updated kitchen, main-floor family room, finished basement, and a large lot with mature trees. Walk to Bank Street and the canal.",
    property_type: "house", listing_type: "sale", price: 950000,
    address: "60 Aylmer Avenue", city: "Ottawa", state: "Ontario", zip_code: "K1S 5R3", country: "CA",
    latitude: 45.3890, longitude: -75.6860,
    bedrooms: 3, bathrooms: 2, sqft: 2000, lot_size: 4000, year_built: 1945, parking_spaces: 1,
    amenities: ["Garden", "Fireplace", "Finished Basement", "Central Air", "Hardwood Floors"],
  },
  {
    title: "Old Ottawa South Rental Duplex",
    description: "Spacious 2-bedroom lower unit in a well-maintained duplex. Separate entrance, in-unit laundry, updated kitchen. Includes parking pad. Close to Carleton University.",
    property_type: "apartment", listing_type: "rent", price: 1950,
    address: "15 Sunnyside Avenue Unit 1", city: "Ottawa", state: "Ontario", zip_code: "K1S 0R3", country: "CA",
    latitude: 45.3870, longitude: -75.6890,
    bedrooms: 2, bathrooms: 1, sqft: 900, lot_size: null, year_built: 1955, parking_spaces: 1,
    amenities: ["In-Unit Laundry", "Garden"],
  },
  // ── Rockcliffe Park ──
  {
    title: "Rockcliffe Park Luxury Estate",
    description: "Magnificent 6-bedroom estate on over an acre of manicured grounds. Grand foyer, gourmet kitchen, wine cellar, home theatre, and heated indoor pool. The pinnacle of Ottawa luxury living.",
    property_type: "house", listing_type: "sale", price: 4500000,
    address: "650 Acacia Avenue", city: "Ottawa", state: "Ontario", zip_code: "K1M 0M1", country: "CA",
    latitude: 45.4480, longitude: -75.6720,
    bedrooms: 6, bathrooms: 5, sqft: 7500, lot_size: 45000, year_built: 1948, parking_spaces: 4,
    amenities: ["Pool", "Gym", "Garden", "Fireplace", "Garage", "Central Air", "Hardwood Floors", "Security System"],
  },
  // ── Alta Vista ──
  {
    title: "Alta Vista Split-Level Home",
    description: "Spacious split-level with 4 bedrooms on a quiet crescent. Updated eat-in kitchen, family room with fireplace, large rec room, double garage, and a landscaped backyard with patio.",
    property_type: "house", listing_type: "sale", price: 725000,
    address: "1245 Featherston Drive", city: "Ottawa", state: "Ontario", zip_code: "K1H 6N5", country: "CA",
    latitude: 45.3840, longitude: -75.6490,
    bedrooms: 4, bathrooms: 2, sqft: 2200, lot_size: 6000, year_built: 1970, parking_spaces: 2,
    amenities: ["Garage", "Garden", "Fireplace", "Finished Basement", "Central Air"],
  },
  {
    title: "Alta Vista Bungalow for Rent",
    description: "Well-maintained 3-bedroom bungalow near CHEO and the Ottawa Hospital. Fenced yard, updated kitchen, and finished basement. Ideal for medical professionals or families.",
    property_type: "house", listing_type: "rent", price: 2800,
    address: "988 Smyth Road", city: "Ottawa", state: "Ontario", zip_code: "K1H 8L3", country: "CA",
    latitude: 45.3810, longitude: -75.6530,
    bedrooms: 3, bathrooms: 2, sqft: 1400, lot_size: 4500, year_built: 1962, parking_spaces: 2,
    amenities: ["Garden", "Garage", "Finished Basement", "Central Air"],
  },
  // ── Kanata ──
  {
    title: "Modern Kanata Family Home",
    description: "Stunning 4-bedroom home in Kanata Lakes. Open-concept main floor, gourmet kitchen with island, master with ensuite and walk-in closet. Backing onto greenspace with walking trails.",
    property_type: "house", listing_type: "sale", price: 895000,
    address: "35 Knudson Drive", city: "Ottawa", state: "Ontario", zip_code: "K2T 0C5", country: "CA",
    latitude: 45.3130, longitude: -75.9080,
    bedrooms: 4, bathrooms: 3.5, sqft: 2800, lot_size: 4500, year_built: 2018, parking_spaces: 2,
    amenities: ["Garage", "Garden", "Central Air", "In-Unit Laundry", "Finished Basement"],
  },
  {
    title: "Kanata Centrum Condo",
    description: "Bright 2-bedroom condo near Kanata Centrum. Open layout, 9-foot ceilings, balcony, underground parking, and locker. Close to tech park, shopping, and the Queensway.",
    property_type: "condo", listing_type: "sale", price: 415000,
    address: "4100 Strandherd Drive Unit 506", city: "Ottawa", state: "Ontario", zip_code: "K2J 6B1", country: "CA",
    latitude: 45.2780, longitude: -75.7420,
    bedrooms: 2, bathrooms: 2, sqft: 950, lot_size: null, year_built: 2020, parking_spaces: 1,
    amenities: ["Gym", "Central Air", "In-Unit Laundry", "Balcony"],
  },
  {
    title: "Kanata Tech Park Office Space",
    description: "Professional office space in Kanata's tech corridor. 2,500 sqft of open-plan workspace with private offices, kitchenette, and boardroom. Ample parking included.",
    property_type: "commercial", listing_type: "rent", price: 4500,
    address: "390 March Road Unit 200", city: "Ottawa", state: "Ontario", zip_code: "K2K 0G7", country: "CA",
    latitude: 45.3340, longitude: -75.9190,
    bedrooms: null, bathrooms: 2, sqft: 2500, lot_size: null, year_built: 2010, parking_spaces: 8,
    amenities: ["Central Air", "Security System"],
  },
  // ── Orleans ──
  {
    title: "Orleans Lakeside Family Home",
    description: "Beautiful 4-bedroom home in Fallingbrook with views of Petrie Island. Hardwood throughout, gourmet kitchen, finished walkout basement, and a huge deck overlooking the yard.",
    property_type: "house", listing_type: "sale", price: 780000,
    address: "1590 Meadowlands Drive East", city: "Ottawa", state: "Ontario", zip_code: "K1E 3R5", country: "CA",
    latitude: 45.4720, longitude: -75.5080,
    bedrooms: 4, bathrooms: 3, sqft: 2600, lot_size: 5200, year_built: 2005, parking_spaces: 2,
    amenities: ["Garage", "Garden", "Finished Basement", "Central Air", "Hardwood Floors", "Fireplace"],
  },
  {
    title: "Orleans Townhome Rental",
    description: "End-unit townhome with 3 bedrooms and 2.5 baths. Fenced backyard, attached garage, close to Place d'Orleans shopping centre and LRT station.",
    property_type: "townhouse", listing_type: "rent", price: 2400,
    address: "820 Trim Road Unit 44", city: "Ottawa", state: "Ontario", zip_code: "K4A 0G7", country: "CA",
    latitude: 45.4650, longitude: -75.5210,
    bedrooms: 3, bathrooms: 2.5, sqft: 1500, lot_size: 1800, year_built: 2012, parking_spaces: 1,
    amenities: ["Garage", "Garden", "Central Air", "In-Unit Laundry"],
  },
  // ── Barrhaven ──
  {
    title: "Brand New Barrhaven Detached",
    description: "Never-lived-in 4-bedroom detached home in Barrhaven's newest community. 9-foot ceilings, quartz counters, engineered hardwood, and a walk-in pantry. Smart home wiring throughout.",
    property_type: "house", listing_type: "sale", price: 835000,
    address: "105 Capstone Crescent", city: "Ottawa", state: "Ontario", zip_code: "K2J 5W7", country: "CA",
    latitude: 45.2730, longitude: -75.7380,
    bedrooms: 4, bathrooms: 2.5, sqft: 2400, lot_size: 3500, year_built: 2024, parking_spaces: 2,
    amenities: ["Garage", "Central Air", "In-Unit Laundry", "Hardwood Floors", "Smart Home"],
  },
  {
    title: "Barrhaven Starter Townhome",
    description: "Affordable 3-bedroom freehold townhome in Half Moon Bay. Open-concept living, ensuite master, finished basement. Steps to schools, parks, and splash pad.",
    property_type: "townhouse", listing_type: "sale", price: 525000,
    address: "288 Sweetflag Street", city: "Ottawa", state: "Ontario", zip_code: "K2J 0V5", country: "CA",
    latitude: 45.2700, longitude: -75.7510,
    bedrooms: 3, bathrooms: 1.5, sqft: 1350, lot_size: 1600, year_built: 2016, parking_spaces: 1,
    amenities: ["Garage", "Central Air", "Finished Basement", "In-Unit Laundry"],
  },
  // ── Golden Triangle ──
  {
    title: "Golden Triangle Heritage Home",
    description: "Impeccably maintained 3-storey heritage home in the Golden Triangle. 4 bedrooms, gourmet kitchen, landscaped garden, and original architectural details throughout. Steps from Elgin Street.",
    property_type: "house", listing_type: "sale", price: 1450000,
    address: "50 Gilmour Street", city: "Ottawa", state: "Ontario", zip_code: "K2P 0N5", country: "CA",
    latitude: 45.4160, longitude: -75.6880,
    bedrooms: 4, bathrooms: 2.5, sqft: 2800, lot_size: 2500, year_built: 1898, parking_spaces: 1,
    amenities: ["Garden", "Fireplace", "Hardwood Floors", "Central Air"],
  },
  // ── Nepean ──
  {
    title: "Nepean Raised Ranch with Pool",
    description: "Spacious raised ranch on a premium lot with in-ground pool. 4 bedrooms, open kitchen with breakfast bar, large rec room, and a 2-car garage. Great for entertaining.",
    property_type: "house", listing_type: "sale", price: 810000,
    address: "1680 Merivale Road", city: "Ottawa", state: "Ontario", zip_code: "K2G 5X1", country: "CA",
    latitude: 45.3470, longitude: -75.7270,
    bedrooms: 4, bathrooms: 2, sqft: 2100, lot_size: 7500, year_built: 1975, parking_spaces: 2,
    amenities: ["Pool", "Garage", "Garden", "Fireplace", "Central Air", "Finished Basement"],
  },
  {
    title: "Nepean Condo near College Square",
    description: "Move-in ready 2-bedroom condo with updated finishes. Open kitchen, large balcony, underground parking. Close to Algonquin College, transit, and shopping.",
    property_type: "condo", listing_type: "sale", price: 365000,
    address: "1480 Baseline Road Unit 712", city: "Ottawa", state: "Ontario", zip_code: "K2C 3L8", country: "CA",
    latitude: 45.3500, longitude: -75.7420,
    bedrooms: 2, bathrooms: 1, sqft: 880, lot_size: null, year_built: 2008, parking_spaces: 1,
    amenities: ["Gym", "Central Air", "In-Unit Laundry", "Balcony"],
  },
  // ── Manor Park ──
  {
    title: "Manor Park Mid-Century Gem",
    description: "Beautifully updated mid-century home on a mature, treed lot. 3 bedrooms, sunken living room, renovated kitchen, and a stunning sunroom addition overlooking the garden.",
    property_type: "house", listing_type: "sale", price: 920000,
    address: "475 Brittany Drive", city: "Ottawa", state: "Ontario", zip_code: "K1K 0R5", country: "CA",
    latitude: 45.4480, longitude: -75.6540,
    bedrooms: 3, bathrooms: 2, sqft: 1900, lot_size: 5000, year_built: 1960, parking_spaces: 1,
    amenities: ["Garden", "Hardwood Floors", "Fireplace", "Central Air"],
  },
  // ── Vanier ──
  {
    title: "Renovated Vanier Duplex",
    description: "Investor opportunity or live-in-one-rent-the-other. Fully renovated duplex with 2 bedrooms per unit. New kitchens, bathrooms, electrical, and plumbing. Strong rental income potential.",
    property_type: "house", listing_type: "sale", price: 680000,
    address: "340 Montreal Road", city: "Ottawa", state: "Ontario", zip_code: "K1L 6B3", country: "CA",
    latitude: 45.4370, longitude: -75.6590,
    bedrooms: 4, bathrooms: 2, sqft: 2000, lot_size: 3000, year_built: 1950, parking_spaces: 2,
    amenities: ["In-Unit Laundry", "Central Air"],
  },
  // ── Riverside South ──
  {
    title: "Riverside South Executive Home",
    description: "Gorgeous 5-bedroom executive home in a family-friendly community. Chef's kitchen, main-floor office, 3-car garage, and a professionally landscaped yard backing onto a pond.",
    property_type: "house", listing_type: "sale", price: 1150000,
    address: "4401 River Mist Crescent", city: "Ottawa", state: "Ontario", zip_code: "K1V 2M8", country: "CA",
    latitude: 45.3120, longitude: -75.6710,
    bedrooms: 5, bathrooms: 3.5, sqft: 3500, lot_size: 6000, year_built: 2017, parking_spaces: 3,
    amenities: ["Garage", "Garden", "Central Air", "Hardwood Floors", "Finished Basement", "Smart Home"],
  },
  // ── Beacon Hill ──
  {
    title: "Beacon Hill North Townhome",
    description: "Well-maintained 3-bedroom townhome near Gloucester Centre. Updated kitchen, hardwood on main, fenced yard with shed. Close to the Blair LRT station.",
    property_type: "townhouse", listing_type: "sale", price: 485000,
    address: "2100 Ogilvie Road Unit 18", city: "Ottawa", state: "Ontario", zip_code: "K1J 7N8", country: "CA",
    latitude: 45.4320, longitude: -75.6100,
    bedrooms: 3, bathrooms: 1.5, sqft: 1300, lot_size: 1400, year_built: 1985, parking_spaces: 1,
    amenities: ["Garden", "Hardwood Floors", "Central Air"],
  },
  // ── Little Italy ──
  {
    title: "Little Italy Character Home",
    description: "Stunning 3-bedroom home on a coveted Little Italy street. Chef's kitchen, exposed brick, private patio, and a finished basement with separate entrance. Walk to Preston Street restaurants.",
    property_type: "house", listing_type: "sale", price: 975000,
    address: "84 Larch Street", city: "Ottawa", state: "Ontario", zip_code: "K1R 6V2", country: "CA",
    latitude: 45.4060, longitude: -75.7140,
    bedrooms: 3, bathrooms: 2, sqft: 1700, lot_size: 2200, year_built: 1910, parking_spaces: 1,
    amenities: ["Garden", "Fireplace", "Hardwood Floors", "Finished Basement", "Central Air"],
  },
  {
    title: "Little Italy 2BR Rental",
    description: "Modern 2-bedroom apartment above a Preston Street cafe. Exposed brick, stainless appliances, in-suite laundry, and a private rooftop patio. Utilities included.",
    property_type: "apartment", listing_type: "rent", price: 2300,
    address: "370 Preston Street Unit 3", city: "Ottawa", state: "Ontario", zip_code: "K1R 7S1", country: "CA",
    latitude: 45.4050, longitude: -75.7120,
    bedrooms: 2, bathrooms: 1, sqft: 850, lot_size: null, year_built: 2019, parking_spaces: 0,
    amenities: ["In-Unit Laundry", "Rooftop Terrace", "Central Air", "Hardwood Floors"],
  },
  // ── Stittsville ──
  {
    title: "Stittsville New Build Detached",
    description: "Brand new 4-bedroom detached in Fernbank. Modern farmhouse design with wrap-around porch, open-concept living, quartz throughout, and a walk-out basement. Backing onto conservation land.",
    property_type: "house", listing_type: "sale", price: 870000,
    address: "22 Bankfield Road", city: "Ottawa", state: "Ontario", zip_code: "K2S 1V5", country: "CA",
    latitude: 45.2600, longitude: -75.9210,
    bedrooms: 4, bathrooms: 2.5, sqft: 2600, lot_size: 4200, year_built: 2025, parking_spaces: 2,
    amenities: ["Garage", "Garden", "Central Air", "In-Unit Laundry", "Hardwood Floors"],
  },
  // ── Hunt Club ──
  {
    title: "Hunt Club Bi-Level Home",
    description: "Affordable 3-bedroom bi-level in South Keys area. Eat-in kitchen, large living room, fenced yard, and a single garage. Close to South Keys shopping centre and Transitway.",
    property_type: "house", listing_type: "sale", price: 520000,
    address: "3040 Caravelle Drive", city: "Ottawa", state: "Ontario", zip_code: "K1T 3N3", country: "CA",
    latitude: 45.3530, longitude: -75.6370,
    bedrooms: 3, bathrooms: 2, sqft: 1200, lot_size: 3500, year_built: 1980, parking_spaces: 1,
    amenities: ["Garage", "Garden", "Central Air"],
  },
  // ── Manotick ──
  {
    title: "Manotick Riverside Retreat",
    description: "Stunning waterfront property on the Rideau River. 4 bedrooms, vaulted ceilings, wall of windows facing the river, private dock, and 2 acres of land. A rare find.",
    property_type: "house", listing_type: "sale", price: 1680000,
    address: "5580 River Road", city: "Ottawa", state: "Ontario", zip_code: "K4M 1B1", country: "CA",
    latitude: 45.2260, longitude: -75.6840,
    bedrooms: 4, bathrooms: 3, sqft: 3200, lot_size: 87120, year_built: 2002, parking_spaces: 3,
    amenities: ["Garden", "Garage", "Fireplace", "Central Air", "Hardwood Floors", "Waterfront"],
  },
];

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized — log in first" }, { status: 401 });
  }

  // Verify user is an owner or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = profile?.role || user.user_metadata?.role;
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json(
      { error: "Must be logged in as an owner to seed properties" },
      { status: 403 }
    );
  }

  const rows = OTTAWA_PROPERTIES.map((p) => ({
    owner_id: user.id,
    title: p.title,
    description: p.description,
    property_type: p.property_type,
    listing_type: p.listing_type,
    status: "active" as const,
    price: p.price,
    address: p.address,
    city: p.city,
    state: p.state,
    zip_code: p.zip_code,
    country: p.country,
    latitude: p.latitude,
    longitude: p.longitude,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    sqft: p.sqft,
    lot_size: p.lot_size,
    year_built: p.year_built,
    parking_spaces: p.parking_spaces,
    amenities: p.amenities,
    images: [],
  }));

  const { data, error } = await supabase
    .from("properties")
    .insert(rows)
    .select("id, title");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Seeded ${data.length} properties in Ottawa`,
    data,
  });
}
