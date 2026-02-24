// src/services/propertyApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All property-related API calls.
//
// KEY RULES for the NestJS backend:
//  1. Request must be multipart/form-data (for photo uploads).
//  2. Do NOT manually set Content-Type — browser calculates the boundary.
//  3. category_id, subcategory_id, locality_id → integers (sent as string in
//     multipart, DTO @Transform(toInt) coerces them back).
//  4. amenities → JSON string '[1,2,3]' — DTO @Transform(toIntArray) parses it.
//  5. Booleans → "true" / "false" strings — DTO @Transform(toBool) parses them.
//  6. Each photo File appended under field name "photos" (matches FilesInterceptor).
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from "@/lib/axiosConfig";

// ─── PAYLOAD TYPES ────────────────────────────────────────────────────────────
// These match the NestJS CreatePropertyDto exactly.
// The form resolves string values to integer IDs before calling toPayload().

export interface PropertyPayload {
  // ── Category (integer FKs — required for publish, optional for draft) ─────
  category_id?:    number;
  subcategory_id?: number;
  config_type_id?: number;  // BHK / seat type / plot size type

  // ── Listing type ──────────────────────────────────────────────────────────
  listingType: string;      // "sell" | "rent" | "pg"
  plan?:       string;      // "free" | "paid"

  // ── Numerics ──────────────────────────────────────────────────────────────
  area?:        number | string;
  price?:       number | string;
  deposit?:     number | string;
  maintenance?: number | string;
  bathrooms?:   number;
  balconies?:   number;

  // ── Location FK IDs ───────────────────────────────────────────────────────
  country_id?: number;
  state_id?:   number;
  city_id?:    number;
  locality_id?: number;   // integer FK — required for publish

  // ── Text ──────────────────────────────────────────────────────────────────
  description?: string;
  society?:     string;
  pincode?:     string;
  projectName?: string;
  builderName?: string;
  rera?:        string;
  powerLoad?:   string;
  roadWidth?:   string;
  cabins?:      string;
  furnishing?:  string;
  facing?:      string;
  age?:         string;

  // ── Boolean flags ─────────────────────────────────────────────────────────
  virtualTour?:   boolean;
  hideNumber?:    boolean;
  negotiable?:    boolean;
  urgent?:        boolean;
  loanAvailable?: boolean;
  featured?:      boolean;

  // ── Contact ───────────────────────────────────────────────────────────────
  ownerName?:  string;
  ownerPhone?: string;

  // ── Amenities — integer FK array ──────────────────────────────────────────
  // e.g. [1, 3, 7]. Sent as JSON string via multipart, parsed by DTO @Transform.
  amenities?: number[];
}

export interface DraftPayload extends Partial<PropertyPayload> {
  draftId?: number;
}

export interface BrowseFilters {
  city_id?:        number;
  state_id?:       number;
  country_id?:     number;
  category_id?:    number;
  config_type_id?: number;
  listingType?:    string;
  minPrice?:       number;
  maxPrice?:       number;
  page?:           number;
  limit?:          number;
}

// ─── FORMDATA BUILDER ─────────────────────────────────────────────────────────
/**
 * Converts a PropertyPayload + File[] into multipart FormData for NestJS.
 *
 * Transformation rules (must match DTO @Transform decorators):
 *   • Numbers    → String(n)           (DTO @Transform(toInt / toNum) parses)
 *   • Booleans   → "true" / "false"    (DTO @Transform(toBool) parses)
 *   • amenities  → '[1,2,3]' JSON str  (DTO @Transform(toIntArray) parses)
 *   • Files      → appended as File    (FilesInterceptor('photos', 20))
 *   • undefined / null / "" → skipped
 *
 * IMPORTANT: Do NOT set Content-Type header — let the browser add the boundary.
 */
const toFormData = (
  payload: PropertyPayload | DraftPayload,
  files: File[],
): FormData => {
  const fd = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    // amenities and draftId handled separately
    if (key === "amenities" || key === "draftId") continue;
    if (value === undefined || value === null || value === "") continue;

    if (typeof value === "boolean") {
      fd.append(key, value ? "true" : "false");
    } else {
      // numbers, strings all become strings in multipart
      fd.append(key, String(value));
    }
  }

  // draftId — append if present (used by PUT /properties/draft to update existing draft)
  const draftId = (payload as DraftPayload).draftId;
  if (draftId !== undefined) {
    fd.append("draftId", String(draftId));
  }

  // amenities → JSON integer array string
  // DTO backend: @Transform(toIntArray) parses '[1,2,3]' → [1,2,3]
  const amenities = payload.amenities;
  if (amenities && amenities.length > 0) {
    fd.append("amenities", JSON.stringify(amenities));
  }

  // Photos — each File appended under "photos" field
  // FilesInterceptor('photos', 20) on the backend handles this.
  // Using file.name as the filename hint for the server.
  files.forEach((file) => {
    fd.append("photos", file, file.name);
  });

  return fd;
};

// ─── Axios config — no manual Content-Type (browser sets multipart boundary) ──
const multipartConfig = {
  headers: {
    // Explicitly delete Content-Type so axios doesn't set application/json,
    // allowing the browser to compute the correct multipart/form-data boundary.
    "Content-Type": undefined as unknown as string,
  },
};

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

/**
 * POST /properties
 * Publish a new listing. Consumes quota (agent) or wallet token (owner).
 * Requires: category_id, subcategory_id, locality_id, listingType (validated by DTO).
 */
export const publishPropertyApi = (payload: PropertyPayload, files: File[]) =>
  axiosInstance.post(
    "/properties",
    toFormData(payload, files),
    multipartConfig,
  );

/**
 * PUT /properties/draft
 * Save or update a draft. Does NOT consume quota or wallet tokens.
 * All DTO fields are optional — backend uses skipMissingProperties: true.
 * Pass draftId in payload to update an existing draft record.
 */
export const saveDraftApi = (payload: DraftPayload, files: File[] = []) =>
  axiosInstance.put(
    "/properties/draft",
    toFormData(payload, files),
    multipartConfig,
  );

/**
 * PUT /properties/:id
 * Update an existing listing by numeric ID.
 */
export const updatePropertyApi = (
  id: number,
  payload: Partial<PropertyPayload>,
  files: File[] = [],
) =>
  axiosInstance.put(
    `/properties/${id}`,
    toFormData(payload, files),
    multipartConfig,
  );

/** DELETE /properties/:id — soft delete */
export const deletePropertyApi = (id: number) =>
  axiosInstance.delete(`/properties/${id}`);

/** GET /properties — public browse with optional filters */
export const browsePropertiesApi = (filters?: BrowseFilters) =>
  axiosInstance.get("/properties", { params: filters });

/** GET /properties/:idOrSlug — single listing */
export const getPropertyApi = (idOrSlug: string | number) =>
  axiosInstance.get(`/properties/${idOrSlug}`);

/** GET /properties/my?status=... — authenticated user's own listings */
export const getMyPropertiesApi = (status?: string) =>
  axiosInstance.get("/properties/my", {
    params: status ? { status } : undefined,
  });

/** GET /properties/quota — agent subscription quota info */
export const getPropertyQuotaApi = () =>
  axiosInstance.get("/properties/quota");

// ─── BOOST ENDPOINTS ──────────────────────────────────────────────────────────

export const buyBoostApi = (propertyId: number, packageId: number) =>
  axiosInstance.post(`/properties/${propertyId}/boosts`, { package_id: packageId });

export const getActiveBoostsApi = (propertyId: number) =>
  axiosInstance.get(`/properties/${propertyId}/boosts`);

export const cancelBoostApi = (propertyId: number, boostId: number) =>
  axiosInstance.delete(`/properties/${propertyId}/boosts/${boostId}`);

// ─── WALLET ENDPOINTS ──────────────────────────────────────────────────────────

export const getWalletBalanceApi = () =>
  axiosInstance.get("/wallet/balance");

export const getWalletTransactionsApi = (page = 1, limit = 20) =>
  axiosInstance.get("/wallet/transactions", { params: { page, limit } });