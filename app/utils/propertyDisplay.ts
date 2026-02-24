// src/utils/propertyDisplay.ts
// ─────────────────────────────────────────────────────────────────────────────
// Utilities for displaying property data that comes back from the API.
//
// The API returns integer FK IDs (category_id, subcategory_id, config_type_id)
// and relative photo paths (/uploads/properties/...).
// These helpers resolve them to human-readable labels and full URLs.
//
// Keep the ID maps in sync with PostPropertyForm_fixed.tsx ID maps.
// ─────────────────────────────────────────────────────────────────────────────

// ─── BASE URL ─────────────────────────────────────────────────────────────────
// All relative paths from the API are prefixed with this.
// Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 in .env.local
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Converts a relative server path to a full URL.
 * Handles:
 *   "/uploads/properties/foo.png"   → "http://localhost:3001/uploads/properties/foo.png"
 *   "http://cdn.example.com/x.png" → unchanged (already absolute)
 *   undefined / null / ""           → undefined
 */
export const imgUrl = (path: string | null | undefined): string | undefined => {
    console.log('=======API_BASE=============================');
    console.log(`${API_BASE}${path}`);
    console.log('====================================');
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
};

/**
 * Returns the full URL for the cover photo of a property.
 * Prefers `cover_photo`, falls back to first element of `photos[]`.
 */
export const coverUrl = (property: {
  cover_photo?: string | null;
  photos?:      string[] | null;
}): string | undefined =>
  imgUrl(property.cover_photo ?? property.photos?.[0]);

/**
 * Returns all photo URLs for a property as full absolute URLs.
 */
export const allPhotoUrls = (
  photos: string[] | null | undefined
): string[] =>
  (photos ?? []).map((p) => imgUrl(p)).filter(Boolean) as string[];

// ─── REVERSE ID MAPS ──────────────────────────────────────────────────────────
// Invert the PostPropertyForm maps so we can display labels from integer IDs.

const CATEGORY_LABEL: Record<number, string> = {
  1: "Residential",
  2: "Commercial",
  3: "Industrial",
  4: "PG / Co-living",
  5: "New Project",
};

const SUBCATEGORY_LABEL: Record<number, string> = {
  // Residential
  101: "Flat / Apartment",
  102: "Independent House",
  103: "Villa",
  104: "Builder Floor",
  105: "Residential Plot",
  106: "Farm House",
  // Commercial
  201: "Office Space",
  202: "IT Park / SEZ",
  203: "Shop / Showroom",
  204: "Warehouse / Godown",
  205: "Co-working Space",
  206: "Commercial Plot",
  // Industrial
  301: "Factory / Manufacturing",
  302: "Warehouse",
  303: "Cold Storage",
  304: "Industrial Land",
  305: "Industrial Shed",
  // PG
  401: "PG / Hostel",
  402: "Co-living",
  // Project
  501: "Residential Project",
  502: "Commercial Project",
  503: "Mixed Use",
};

const CONFIG_TYPE_LABEL: Record<number, string> = {
  1: "1 RK",
  2: "1 BHK",
  3: "2 BHK",
  4: "3 BHK",
  5: "4 BHK",
  6: "4+ BHK",
};

const AMENITY_LABEL: Record<number, string> = {
  1:  "Lift",
  2:  "Parking",
  3:  "Power Backup",
  4:  "Security",
  5:  "Gymnasium",
  6:  "Swimming Pool",
  7:  "Club House",
  8:  "Garden / Park",
  9:  "Gated Society",
  10: "CCTV",
  11: "Intercom",
  12: "Visitor Parking",
  13: "Children's Play Area",
  14: "Jogging Track",
};

// ─── LABEL RESOLVERS ──────────────────────────────────────────────────────────

export const categoryLabel = (id: number | null | undefined): string =>
  id ? (CATEGORY_LABEL[id] ?? `Category #${id}`) : "Property";

export const subcategoryLabel = (id: number | null | undefined): string =>
  id ? (SUBCATEGORY_LABEL[id] ?? `Type #${id}`) : "";

export const configTypeLabel = (id: number | null | undefined): string =>
  id ? (CONFIG_TYPE_LABEL[id] ?? "") : "";

export const amenityLabels = (ids: number[] | null | undefined): string[] =>
  (ids ?? []).map((id) => AMENITY_LABEL[id] ?? `Amenity #${id}`);

// ─── PROPERTY DISPLAY HELPERS ─────────────────────────────────────────────────

/**
 * Returns the primary display title for a listing.
 * e.g. "1 BHK Independent House" or "Office Space" or "Residential"
 */
export const propertyTitle = (p: {
  title?:          string | null;
  config_type_id?: number | null;
  subcategory_id?: number | null;
  category_id?:    number | null;
}): string => {
  if (p.title) return p.title;
  const parts: string[] = [];
  if (p.config_type_id) parts.push(configTypeLabel(p.config_type_id));
  if (p.subcategory_id) parts.push(subcategoryLabel(p.subcategory_id));
  else if (p.category_id) parts.push(categoryLabel(p.category_id));
  return parts.join(" ") || "Property";
};

/**
 * Short location string from the property.
 * Uses `locality` (text) if present, otherwise falls back to society / pincode.
 */
export const locationLabel = (p: {
  locality?:  string | null;
  society?:   string | null;
  pincode?:   string | null;
  address?:   string | null;
}): string => {
  const parts: string[] = [];
  if (p.locality) parts.push(p.locality);
  else if (p.society) parts.push(p.society);
  if (p.pincode) parts.push(p.pincode);
  return parts.join(", ") || "—";
};

/** Price formatter — matches fmtPrice in form components */
export const fmtPrice = (v: string | number | null | undefined): string => {
  const n = Number(v);
  if (!n || isNaN(n)) return "—";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/** Format a date string to "24 Feb 2026" */
export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
};

/** Days until expiry (negative = already expired) */
export const daysUntilExpiry = (
  expires_at: string | null | undefined
): number | null => {
  if (!expires_at) return null;
  const diff = new Date(expires_at).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ─── STATUS DISPLAY ───────────────────────────────────────────────────────────

export const STATUS_STYLE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  published: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Live"      },
  draft:     { bg: "bg-amber-100",   text: "text-amber-700",   label: "Draft"     },
  rejected:  { bg: "bg-red-100",     text: "text-red-600",     label: "Rejected"  },
  expired:   { bg: "bg-slate-100",   text: "text-slate-500",   label: "Expired"   },
};

export const statusStyle = (status: string | null | undefined) =>
  STATUS_STYLE[status ?? ""] ?? { bg: "bg-slate-100", text: "text-slate-500", label: status ?? "Unknown" };