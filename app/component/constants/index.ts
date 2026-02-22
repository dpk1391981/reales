// ─── CATEGORY ICON MAP ────────────────────────────────────────────────────────
export const CATEGORY_ICONS: Record<string, string> = {
  home: "🏠",
  building: "🏢",
  factory: "🏭",
  bed: "🛏️",
  construction: "🏗️",
};

// ─── STATIC OPTIONS ───────────────────────────────────────────────────────────
export const BHK = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];



export const FACING_OPT = [
  "East", "West", "North", "South",
  "North-East", "North-West", "South-East", "South-West",
];

export const AGE_OPT = [
  "Under Construction", "0-1 Year", "1-5 Years", "5-10 Years", "10+ Years",
];

export const FURNISHING = [
  { v: "unfurnished", l: "Unfurnished", icon: "🪑" },
  { v: "semi-furnished", l: "Semi Furnished", icon: "🛋️" },
  { v: "fully-furnished", l: "Fully Furnished", icon: "🛏️" },
];

export const PLANS = [
  {
    key: "silver",
    name: "Silver",
    price: "₹999",
    perks: ["20 Active Listings", "Normal Ranking", "WhatsApp Leads", "Dashboard Access"],
    gradient: "linear-gradient(135deg,#94a3b8 0%,#64748b 100%)",
    highlight: false,
  },
  {
    key: "gold",
    name: "Gold",
    price: "₹1,999",
    perks: ["30 Active Listings", "Priority Ranking", "HD Photo Boost", "Featured Badge", "Contact Analytics"],
    gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
    highlight: true,
  },
  {
    key: "platinum",
    name: "Platinum",
    price: "₹3,999",
    perks: ["Unlimited Listings", "Top Ranking", "HD + Virtual Tour", "Multiple Featured", "Full Analytics", "Dedicated Support"],
    gradient: "linear-gradient(135deg,#0B3C8C 0%,#3B82F6 100%)",
    highlight: false,
  },
];

export const STEPS = [
  { id: 1, label: "Property Type", icon: "🏠" },
  { id: 2, label: "Details", icon: "📋" },
  { id: 3, label: "Location", icon: "📍" },
  { id: 4, label: "Media", icon: "📸" },
  { id: 5, label: "Contact", icon: "👤" },
];

// ─── THEME CSS STRINGS ────────────────────────────────────────────────────────
export const inp =
  "w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-medium text-[#0B3C8C] placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200";

export const sel =
  "w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-medium text-[#0B3C8C] placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 appearance-none cursor-pointer pr-10";

// ─── UTILITY ──────────────────────────────────────────────────────────────────
export const fmtPrice = (v: string): string => {
  const n = parseInt(v, 10);
  if (isNaN(n) || n === 0) return "";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

// ─── INITIAL FORM STATE ───────────────────────────────────────────────────────
export const INITIAL_FORM = {
  propertyCategory: "residential",
  listingType: "sell",
  plan: "free",
  selectedPlan: "",
  residentialType: "",
  commercialType: "",
  industrialType: "",
  bhk: "",
  area: "",
  price: "",
  description: "",
  country_id: 1,        // default India
  state_id: 0,
  city_id: 0,
  locality: "",
  society: "",
  pincode: "",
  photos: [] as string[],
  virtualTour: false,
  hideNumber: false,
  ownerName: "",
  ownerPhone: "",
  negotiable: false,
  urgent: false,
  loanAvailable: false,
  featured: false,
  bathrooms: 2,
  balconies: 1,
  furnishing: "",
  facing: "",
  age: "",
  amenities: [] as string[],
  deposit: "",
  maintenance: "",
  projectName: "",
  builderName: "",
  rera: "",
  powerLoad: "",
  roadWidth: "",
  cabins: "",
};