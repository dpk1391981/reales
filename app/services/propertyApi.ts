// src/api/propertyApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All property-related API calls.
// Mirrors the structure of authApi.ts — every function returns an axios promise.
// Photos are sent as real File objects inside multipart/form-data.
// Bearer token is attached automatically by axiosInstance interceptor.
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from "@/lib/axiosConfig";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface PropertyPayload {
  propertyCategory: string;
  listingType: string;
  plan?: string;
  residentialType?: string;
  commercialType?: string;
  industrialType?: string;
  bhk?: string;
  area?: string;
  price?: string;
  description?: string;

  // ── Location — numeric FK IDs, mirrors property.entity.ts ──────────────
  // Sent as string form-data fields (multipart has no native number).
  // Backend @Transform(({ value }) => Number(value)) parses them back.
  country_id?: number;   // required for publish, optional on draft
  state_id?:   number;
  city_id?:    number;
  locality:    any;   // free-text name, not an FK (stored as VARCHAR)

  society?: string;
  pincode?: string;
  virtualTour?: boolean;
  hideNumber?: boolean;
  ownerName?: string;
  ownerPhone?: string;
  negotiable?: boolean;
  urgent?: boolean;
  loanAvailable?: boolean;
  featured?: boolean;
  bathrooms?: number;
  balconies?: number;
  furnishing?: string;
  facing?: string;
  age?: string;
  amenities?: string[];
  deposit?: string;
  maintenance?: string;
  projectName?: string;
  builderName?: string;
  rera?: string;
  powerLoad?: string;
  roadWidth?: string;
  cabins?: string;
}

export interface DraftPayload extends Partial<PropertyPayload> {
  draftId?: number;
}

export interface BrowseFilters {
  city_id?:    number;   // filter by city FK
  state_id?:   number;   // filter by state FK
  country_id?: number;
  category?: string;
  listingType?: string;
  bhk?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ─── FORMDATA BUILDER ─────────────────────────────────────────────────────────
/**
 * NestJS FilesInterceptor expects:
 *  - All scalar fields as form-data string fields
 *  - Booleans as "true" / "false" strings (multipart has no native bool)
 *  - amenities as a JSON string:  '["Lift","Parking"]'
 *  - Photo files appended under field name "photos"
 *  - NO Content-Type header — browser sets it with the correct multipart boundary
 */
const toFormData = (payload: PropertyPayload | DraftPayload, files: File[]): FormData => {
  const fd = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (key === "amenities") continue;               // handled separately below
    if (value === undefined || value === null) continue;
    if (value === "") continue;
    fd.append(key, typeof value === "boolean" ? String(value) : String(value));
  }

  // amenities must arrive as a JSON string so NestJS @Transform can parse it
  const amenities = (payload as PropertyPayload).amenities;
  if (amenities && amenities.length > 0) {
    fd.append("amenities", JSON.stringify(amenities));
  }

  // Real File objects under field name "photos"
  files.forEach((file) => fd.append("photos", file, file.name));

  return fd;
};

// ─── MULTIPART REQUEST CONFIG ─────────────────────────────────────────────────
// Setting Content-Type to undefined lets the browser/axios calculate the
// multipart boundary automatically. If you leave it as application/json the
// boundary will be missing and the server will reject the request.
const multipart = { headers: { "Content-Type": undefined as any } };

// ─── PROPERTY ENDPOINTS ──────────────────────────────────────────────────────

/**
 * POST /properties
 * Publish a full listing.
 * Agent  → consumes subscription quota
 * Owner  → consumes wallet token (every 20th post deducts 1 token)
 */
export const publishPropertyApi = (payload: PropertyPayload, files: File[]) =>
  axiosInstance.post("/properties", toFormData(payload, files), multipart);

/**
 * PUT /properties/draft
 * Auto-save or manual save a draft. Does NOT consume quota or tokens.
 * Omit draftId to create a new draft; include it to update an existing one.
 */
export const saveDraftApi = (payload: DraftPayload, files: File[] = []) =>
  axiosInstance.put("/properties/draft", toFormData(payload, files), multipart);

/**
 * PUT /properties/:id
 * Update an existing published or draft listing.
 */
export const updatePropertyApi = (id: number, payload: Partial<PropertyPayload>, files: File[] = []) =>
  axiosInstance.put(`/properties/${id}`, toFormData(payload, files), multipart);

/**
 * DELETE /properties/:id
 * Soft-delete a listing. Quota / tokens are NOT restored (prevents abuse).
 */
export const deletePropertyApi = (id: number) =>
  axiosInstance.delete(`/properties/${id}`);

/**
 * GET /properties
 * Public browse with optional filters.
 */
export const browsePropertiesApi = (filters?: BrowseFilters) =>
  axiosInstance.get("/properties", { params: filters });

/**
 * GET /properties/:idOrSlug
 * Single listing by numeric id or SEO slug.
 * Backend also fires the view counter on this call.
 */
export const getPropertyApi = (idOrSlug: string | number) =>
  axiosInstance.get(`/properties/${idOrSlug}`);

/**
 * GET /properties/my?status=published|draft|rejected|expired
 * Authenticated user's own listings.
 */
export const getMyPropertiesApi = (status?: string) =>
  axiosInstance.get("/properties/my", { params: status ? { status } : undefined });

/**
 * GET /properties/quota
 * Agent: returns subscription quota info.
 * Owner: redirects to wallet — use getWalletBalanceApi() instead.
 */
export const getPropertyQuotaApi = () =>
  axiosInstance.get("/properties/quota");

// ─── BOOST ENDPOINTS ─────────────────────────────────────────────────────────

/**
 * POST /properties/:propertyId/boosts
 * Buy a boost package for a listing.
 * Owner: deducts tokens from wallet.
 * Agent: included in plan perks (no token cost).
 */
export const buyBoostApi = (propertyId: number, packageId: number) =>
  axiosInstance.post(`/properties/${propertyId}/boosts`, { package_id: packageId });

/**
 * GET /properties/:propertyId/boosts
 * All currently active boosts for a property.
 */
export const getActiveBoostsApi = (propertyId: number) =>
  axiosInstance.get(`/properties/${propertyId}/boosts`);

/**
 * DELETE /properties/:propertyId/boosts/:boostId
 * Cancel an active boost. Owner boosts are fully refunded.
 */
export const cancelBoostApi = (propertyId: number, boostId: number) =>
  axiosInstance.delete(`/properties/${propertyId}/boosts/${boostId}`);

// ─── WALLET ENDPOINTS ─────────────────────────────────────────────────────────

/**
 * GET /wallet/balance
 * Owner's token balance + posts_remaining calculation.
 */
export const getWalletBalanceApi = () =>
  axiosInstance.get("/wallet/balance");

/**
 * GET /wallet/transactions?page=1&limit=20
 * Full immutable token ledger with pagination.
 */
export const getWalletTransactionsApi = (page = 1, limit = 20) =>
  axiosInstance.get("/wallet/transactions", { params: { page, limit } });