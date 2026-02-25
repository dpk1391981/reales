// src/services/propertyApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All property-related API calls for Think4BuySale.
//
// MULTIPART RULES (for any endpoint that accepts photos):
//  1. Never set Content-Type manually — browser writes the boundary.
//  2. category_id / subcategory_id / locality_id → DTO @Transform(toInt).
//  3. amenities  → JSON string '[1,2,3]'         → DTO @Transform(toIntArray).
//  4. booleans   → "true" / "false"              → DTO @Transform(toBool).
//  5. photos     → one File per fd.append("photos", file, file.name).
//  6. All other undefined / null / "" values are skipped (skipMissingProperties).
//
// READ REQUESTS use plain JSON (axios default — no special config needed).
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from "@/lib/axiosConfig";

// ══════════════════════════════════════════════════════════════════════════════
// § 1.  TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Full payload for creating or updating a property.
 * All integer FK IDs must already be resolved by the form before passing here.
 */
export interface PropertyPayload {
  // ─── Category (integer FKs) ───────────────────────────────────────────────
  category_id?:    number;   // 1=Residential 2=Commercial 3=Industrial 4=PG 5=Project
  subcategory_id?: number;   // 101=Flat 102=House 103=Villa … 201=Office …
  config_type_id?: number;   // 1=1RK 2=1BHK 3=2BHK … (residential only)

  // ─── Listing intent ───────────────────────────────────────────────────────
  listingType:  string;      // "sell" | "rent" | "pg"  ← required always
  plan?:        string;      // "free" | "paid" | "premium"

  // ─── Headline ─────────────────────────────────────────────────────────────
  title?:       string;      // mandatory for publish, optional for draft

  // ─── Numerics ─────────────────────────────────────────────────────────────
  area?:         number | string;
  price?:        number | string;
  deposit?:      number | string;   // rent security deposit
  maintenance?:  number | string;   // monthly maintenance charge
  bathrooms?:    number;
  balconies?:    number;

  // ─── Location — integer FK IDs ────────────────────────────────────────────
  country_id?:  number;
  state_id?:    number;
  city_id?:     number;
  locality_id?: number;    // integer FK (0 = free-text fallback mode)

  // ─── Location — text ──────────────────────────────────────────────────────
  locality?:    string;    // plain-text locality name (Step3 free-text mode)
  address?:     string;    // optional full street address (Step3 textarea)
  society?:     string;
  pincode?:     string;

  // ─── Description ──────────────────────────────────────────────────────────
  description?: string;

  // ─── Residential extras ───────────────────────────────────────────────────
  furnishing?:  string;    // "furnished"|"semi-furnished"|"unfurnished"
  facing?:      string;    // "east"|"west"|"north"|"south"|"north-east"|…
  age?:         string;    // "new"|"0-1 years"|"1-5 years"|"5-10 years"|"10+ years"

  // ─── Commercial / industrial extras ──────────────────────────────────────
  projectName?: string;
  builderName?: string;
  rera?:        string;
  powerLoad?:   string;
  roadWidth?:   string;
  cabins?:      string;

  // ─── Feature flags ────────────────────────────────────────────────────────
  virtualTour?:    boolean;
  hideNumber?:     boolean;   // hide owner's phone number on the listing
  negotiable?:     boolean;
  urgent?:         boolean;   // "Urgent" badge on listing card
  loanAvailable?:  boolean;
  featured?:       boolean;   // requires paid plan or boost

  // ─── Owner contact override ───────────────────────────────────────────────
  ownerName?:   string;
  ownerPhone?:  string;

  // ─── Amenities — integer FK array ─────────────────────────────────────────
  // e.g. [1,3,7]. Sent as JSON string "[1,3,7]" via multipart.
  // DTO: @Transform(({ value }) => JSON.parse(value))  → number[]
  amenities?:   number[];
}

/**
 * Draft save — all fields optional.
 * Include draftId to update an existing draft row; omit to create a new one.
 */
export interface DraftPayload extends Partial<PropertyPayload> {
  draftId?: number;
}

/**
 * Filter + pagination for GET /properties (public browse).
 */
export interface BrowseFilters {
  // Location
  country_id?:     number;
  state_id?:       number;
  city_id?:        number;
  locality_id?:    number;
  locality?:       string;    // LIKE '%...%' against locality column
  pincode?:        string;

  // Category
  category_id?:    number;
  subcategory_id?: number;
  config_type_id?: number;

  // Listing intent
  listingType?:    string;    // "sell" | "rent" | "pg"

  // Price
  minPrice?:       number;
  maxPrice?:       number;

  // Area
  minArea?:        number;
  maxArea?:        number;

  // Text search — backend searches title, description, society, locality
  keyword?:        string;

  // Sort
  sort?:
    | "latest"
    | "price_asc"
    | "price_desc"
    | "area_asc"
    | "area_desc"
    | "popular";   // popular = ORDER BY boost_score DESC, views_count DESC

  // Pagination (1-based)
  page?:           number;
  limit?:          number;   // max 50 per page
}

/**
 * Buyer enquiry payload — sent to POST /properties/:id/enquiry.
 * Backend: creates property_enquiries row + increments leads_count (trigger).
 */
export interface EnquiryPayload {
  buyer_name:    string;
  buyer_phone:   string;
  buyer_email?:  string;
  message?:      string;
}

/**
 * Wallet recharge / top-up payload.
 */
export interface WalletRechargePayload {
  tokens:         number;
  payment_ref?:   string;   // payment gateway reference (or mock ref for dev)
}

/**
 * Raw API response shape for a single property listing.
 * Use propertyDisplay.ts helpers to resolve integer IDs → human-readable labels.
 */
export interface ApiPropertyRaw {
  id:              number;
  slug:            string;
  poster_type:     "agent" | "owner";
  poster_id:       number;
  agent_id?:       number | null;
  category_id?:    number | null;
  subcategory_id?: number | null;
  config_type_id?: number | null;
  listingType:     string;
  plan?:           string | null;
  title?:          string | null;
  area?:           string | null;     // DECIMAL → string from MySQL
  price?:          string | null;
  deposit?:        string | null;
  maintenance?:    string | null;
  bathrooms?:      number | null;
  balconies?:      number | null;
  country_id?:     number | null;
  state_id?:       number | null;
  city_id?:        number | null;
  locality_id?:    number | null;
  locality?:       string | null;
  address?:        string | null;
  society?:        string | null;
  pincode?:        string | null;
  description?:    string | null;
  furnishing?:     string | null;
  facing?:         string | null;
  age?:            string | null;
  projectName?:    string | null;
  builderName?:    string | null;
  rera?:           string | null;
  virtualTour?:    boolean;
  hideNumber?:     boolean;
  negotiable?:     boolean;
  urgent?:         boolean;
  loanAvailable?:  boolean;
  featured?:       boolean;
  ownerName?:      string | null;
  ownerPhone?:     string | null;
  photos:          string[];          // relative paths: "/uploads/properties/..."
  cover_photo?:    string | null;
  amenities:       number[];
  views_count:     number;
  leads_count:     number;
  saves_count:     number;
  boost_score?:    number;
  status:          "published" | "draft" | "rejected" | "expired" | "deleted";
  expires_at?:     string | null;
  created_at:      string;
  updated_at:      string;
  isSaved?:        boolean;           // present when authenticated buyer fetches
}

// ══════════════════════════════════════════════════════════════════════════════
// § 2.  INTERNAL — FORMDATA BUILDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * toFormData — converts payload + files into multipart/form-data.
 *
 * Transformation table (must match NestJS DTO @Transform decorators):
 *   number    → String(n)          @Transform(toInt) / @Transform(toNum)
 *   boolean   → "true"/"false"     @Transform(toBool)
 *   amenities → '[1,2,3]'          @Transform(toIntArray) via JSON.parse
 *   File[]    → fd.append("photos", file)   FilesInterceptor('photos', 20)
 *   undefined / null / ""  → skipped (skipMissingProperties: true on DTO)
 */
const toFormData = (
  payload: PropertyPayload | DraftPayload,
  files: File[],
): FormData => {
  const fd = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (key === "amenities" || key === "draftId") continue;
    if (value === undefined || value === null || value === "") continue;

    if (typeof value === "boolean") {
      fd.append(key, value ? "true" : "false");
    } else {
      fd.append(key, String(value));
    }
  }

  // draftId — update vs create
  const draftId = (payload as DraftPayload).draftId;
  if (draftId != null) fd.append("draftId", String(draftId));

  // amenities → JSON array string
  if (payload.amenities?.length) {
    fd.append("amenities", JSON.stringify(payload.amenities));
  }

  // Photo files — one per field entry (not an array)
  files.forEach((f) => fd.append("photos", f, f.name));

  return fd;
};

/**
 * Axios config for multipart requests.
 * Setting Content-Type: undefined removes the axios default "application/json"
 * header so the browser can write the correct multipart boundary.
 */
const multipartConfig = {
  headers: { "Content-Type": undefined as unknown as string },
};

// ══════════════════════════════════════════════════════════════════════════════
// § 3.  PROPERTY CRUD
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /properties
 * Publish a new listing immediately.
 * Consumes: 1 wallet token (owner) OR 1 quota unit (agent).
 * Required fields: category_id, subcategory_id, locality_id (or locality text),
 *                  listingType, title, area, price, ownerName, ownerPhone.
 */
export const publishPropertyApi = (
  payload: PropertyPayload,
  files:   File[],
) =>
  axiosInstance.post("/properties", toFormData(payload, files), multipartConfig);

/**
 * PUT /properties/draft
 * Save or update a draft — does NOT consume tokens or quota.
 * Backend uses skipMissingProperties: true so only present fields are written.
 * Pass draftId in payload to UPDATE an existing draft; omit to CREATE a new one.
 */
export const saveDraftApi = (
  payload: DraftPayload,
  files:   File[] = [],
) =>
  axiosInstance.put("/properties/draft", toFormData(payload, files), multipartConfig);

/**
 * PUT /properties/:id/publish
 * Promote a draft to "published". Tokens / quota consumed here (not at draft save).
 * Optional: pass updated fields + new photo files in the same request.
 */
export const publishDraftApi = (
  id:      number,
  payload: Partial<PropertyPayload> = {},
  files:   File[]                   = [],
) =>
  axiosInstance.put(
    `/properties/${id}/publish`,
    toFormData(payload, files),
    multipartConfig,
  );

/**
 * PUT /properties/:id
 * Edit any existing listing (any status).
 * Only fields present in payload are updated — others remain unchanged.
 * New files are appended to existing photos.
 */
export const updatePropertyApi = (
  id:      number,
  payload: Partial<PropertyPayload>,
  files:   File[] = [],
) =>
  axiosInstance.put(
    `/properties/${id}`,
    toFormData(payload, files),
    multipartConfig,
  );

/**
 * DELETE /properties/:id
 * Soft-delete: sets status → "deleted", hides from browse.
 * Only the poster or admin can delete.
 */
export const deletePropertyApi = (id: number) =>
  axiosInstance.delete(`/properties/${id}`);

// ══════════════════════════════════════════════════════════════════════════════
// § 4.  PROPERTY READ ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /properties
 * Public browse — paginated, filterable. Auth optional.
 * Logged-in buyers receive isSaved: boolean on each result.
 */
export const browsePropertiesApi = (filters?: BrowseFilters) =>
  axiosInstance.get("/properties", { params: filters });

/**
 * GET /properties/:idOrSlug
 * Single listing by numeric ID or SEO slug.
 * Each successful call increments views_count server-side.
 */
export const getPropertyApi = (idOrSlug: string | number) =>
  axiosInstance.get(`/properties/${idOrSlug}`);

/**
 * GET /properties/my?status=published|draft|rejected|expired
 * Authenticated user's own listings.
 * Omit status (or pass "all") to get every listing regardless of status.
 */
export const getMyPropertiesApi = (
  status?: "published" | "draft" | "rejected" | "expired" | "all",
) =>
  axiosInstance.get("/properties/my", {
    params: status && status !== "all" ? { status } : undefined,
  });

/**
 * GET /properties/similar/:id?limit=6
 * Up to `limit` similar listings based on:
 * same category + config_type + city + price within ±30%.
 * Used in PropertyViewClient "Similar Properties" section.
 */
export const getSimilarPropertiesApi = (propertyId: number, limit = 6) =>
  axiosInstance.get(`/properties/similar/${propertyId}`, { params: { limit } });

/**
 * GET /properties/quota
 * Agent-only: subscription plan, quota used, quota remaining.
 * Returns 403 for owner / buyer accounts.
 */
export const getPropertyQuotaApi = () =>
  axiosInstance.get("/properties/quota");

// ══════════════════════════════════════════════════════════════════════════════
// § 5.  ENQUIRY / LEAD ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /properties/:id/enquiry
 * Submit a buyer enquiry.
 * - Creates property_enquiries row.
 * - MySQL trigger trg_enquiry_leads_count auto-increments leads_count.
 * - Sends push/email notification to the listing's poster.
 * Auth optional — unauthenticated buyers supply name + phone in payload.
 */
export const sendEnquiryApi = (
  propertyId: number,
  payload:    EnquiryPayload,
) =>
  axiosInstance.post(`/properties/${propertyId}/enquiry`, payload);

/**
 * GET /properties/:id/enquiries?page=1&limit=20&unread=true
 * Fetch enquiries for a specific listing.
 * Restricted to the listing's poster and admin.
 */
export const getPropertyEnquiriesApi = (
  propertyId: number,
  params?:    { page?: number; limit?: number; unread?: boolean },
) =>
  axiosInstance.get(`/properties/${propertyId}/enquiries`, { params });

/**
 * PATCH /properties/:id/enquiries/:enquiryId/read
 * Mark a single enquiry as read (is_read = 1).
 */
export const markEnquiryReadApi = (
  propertyId: number,
  enquiryId:  number,
) =>
  axiosInstance.patch(`/properties/${propertyId}/enquiries/${enquiryId}/read`);

/**
 * GET /enquiries/my?page=1&limit=20&unread=false
 * All enquiries received by the authenticated poster (across all their listings).
 * Used by Notifications section in UserPanel.
 */
export const getMyEnquiriesApi = (params?: {
  page?:   number;
  limit?:  number;
  unread?: boolean;
}) =>
  axiosInstance.get("/enquiries/my", { params });

// ══════════════════════════════════════════════════════════════════════════════
// § 6.  SAVED / FAVOURITES ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /properties/:id/save
 * Bookmark a listing. Creates property_saves row.
 * MySQL trigger trg_save_inc increments saves_count.
 * Returns 409 if already saved — use toggleSavePropertyApi for idempotency.
 */
export const savePropertyApi = (propertyId: number) =>
  axiosInstance.post(`/properties/${propertyId}/save`);

/**
 * DELETE /properties/:id/save
 * Remove a bookmark. MySQL trigger trg_save_dec decrements saves_count (≥0).
 */
export const unsavePropertyApi = (propertyId: number) =>
  axiosInstance.delete(`/properties/${propertyId}/save`);

/**
 * POST /properties/:id/save/toggle
 * Toggle saved in one call. Returns { saved: boolean }.
 * Use this for heart/bookmark button — avoids race conditions from check→save.
 */
export const toggleSavePropertyApi = (propertyId: number) =>
  axiosInstance.post(`/properties/${propertyId}/save/toggle`);

/**
 * GET /properties/:id/saved
 * Check if authenticated user has saved a specific listing.
 * Returns { saved: boolean }.
 * Used to initialise heart icon state when PropertyViewClient mounts.
 */
export const checkSavedPropertyApi = (propertyId: number) =>
  axiosInstance.get(`/properties/${propertyId}/saved`);

/**
 * GET /saved?page=1&limit=20
 * Paginated list of all properties saved by the authenticated buyer.
 * Returns full ApiPropertyRaw objects.
 * Used by SavedProperties section in UserPanel.
 */
export const getSavedPropertiesApi = (params?: {
  page?:  number;
  limit?: number;
}) =>
  axiosInstance.get("/saved", { params });

// ══════════════════════════════════════════════════════════════════════════════
// § 7.  LOCATION CASCADE ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════
// Step3 (PostPropertyForm) uses these for cascading dropdowns:
// Country → State → City → Locality

/** GET /locations/countries — all countries (typically just India) */
export const getCountriesApi = () =>
  axiosInstance.get("/locations/countries");

/** GET /locations/states?country_id=1 — states for a country */
export const getStatesApi = (countryId: number) =>
  axiosInstance.get("/locations/states", {
    params: { country_id: countryId },
  });

/** GET /locations/cities?state_id=9 — cities for a state */
export const getCitiesApi = (stateId: number) =>
  axiosInstance.get("/locations/cities", {
    params: { state_id: stateId },
  });

/**
 * GET /locations/localities?city_id=123 — localities / sectors for a city.
 * Step3: if response is empty → switch to free-text input automatically.
 * Returns: Array<{ id: number; name: string; city_id: number }>
 */
export const getLocalitiesApi = (cityId: number) =>
  axiosInstance.get("/locations/localities", {
    params: { city_id: cityId },
  });

// ══════════════════════════════════════════════════════════════════════════════
// § 8.  BOOST ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /properties/:id/boosts
 * Purchase a boost for a listing. Deducts wallet tokens immediately.
 * Increases boost_score for the duration specified by the package.
 */
export const buyBoostApi = (propertyId: number, packageId: number) =>
  axiosInstance.post(`/properties/${propertyId}/boosts`, {
    package_id: packageId,
  });

/** GET /properties/:id/boosts — active (and recent expired) boosts */
export const getActiveBoostsApi = (propertyId: number) =>
  axiosInstance.get(`/properties/${propertyId}/boosts`);

/** DELETE /properties/:id/boosts/:boostId — cancel a boost */
export const cancelBoostApi = (propertyId: number, boostId: number) =>
  axiosInstance.delete(`/properties/${propertyId}/boosts/${boostId}`);

// ══════════════════════════════════════════════════════════════════════════════
// § 9.  WALLET ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /wallet/balance
 * Returns { balance: number, posts_remaining: number, … }
 */
export const getWalletBalanceApi = () =>
  axiosInstance.get("/wallet/balance");

/**
 * GET /wallet/transactions?page=1&limit=20
 * Paginated token transaction history (credit / debit / boost / publish / …).
 */
export const getWalletTransactionsApi = (page = 1, limit = 20) =>
  axiosInstance.get("/wallet/transactions", { params: { page, limit } });

/**
 * POST /wallet/recharge
 * Initiate a wallet top-up. Backend credits tokens after payment validation.
 * For dev/test: pass a known mock payment_ref to trigger immediate credit.
 */
export const rechargeWalletApi = (payload: WalletRechargePayload) =>
  axiosInstance.post("/wallet/recharge", payload);

/**
 * GET /wallet/packages
 * Available token bundles (e.g. 50 tokens = ₹99, 200 tokens = ₹349).
 * Rendered in the Payments section of UserPanel.
 */
export const getWalletPackagesApi = () =>
  axiosInstance.get("/wallet/packages");

// ══════════════════════════════════════════════════════════════════════════════
// § 10.  NOTIFICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/** GET /notifications?page=1&limit=20 — user's notifications */
export const getNotificationsApi = (page = 1, limit = 20) =>
  axiosInstance.get("/notifications", { params: { page, limit } });

/** PATCH /notifications/read-all — mark every notification as read */
export const markAllNotificationsReadApi = () =>
  axiosInstance.patch("/notifications/read-all");

/** PATCH /notifications/:id/read — mark one notification as read */
export const markNotificationReadApi = (id: number) =>
  axiosInstance.patch(`/notifications/${id}/read`);

// ══════════════════════════════════════════════════════════════════════════════
// § 11.  PROFILE ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /auth/profile — authenticated user's full profile.
 * Fields: id, name, phone, email, avatar, role, created_at, …
 */
export const getProfileApi = () =>
  axiosInstance.get("/auth/profile");

/**
 * PATCH /auth/profile — update profile.
 * If an avatarFile is provided the request is sent as multipart/form-data;
 * otherwise sent as plain JSON.
 */
export const updateProfileApi = (
  payload: {
    name?:       string;
    email?:      string;
    ownerName?:  string;
  },
  avatarFile?: File,
) => {
  if (avatarFile) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, v);
    });
    fd.append("avatar", avatarFile, avatarFile.name);
    return axiosInstance.patch("/auth/profile", fd, multipartConfig);
  }
  return axiosInstance.patch("/auth/profile", payload);
};

// ══════════════════════════════════════════════════════════════════════════════
// § 12.  CLIENT-SIDE UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * generateSlug — build a SEO-friendly URL slug from display labels + id.
 *
 * Format:  {config}-{type}-{locality}-{id}
 * Example: "2-bhk-independent-house-dlf-sector-28-8"
 * Example: "office-space-connaught-place-new-delhi-47"
 *
 * Rules:
 *   - All parts lower-cased
 *   - Spaces and underscores → hyphens
 *   - Non-alphanumeric characters stripped
 *   - Double hyphens collapsed
 *   - Numeric id appended to guarantee global uniqueness
 *
 * The backend ALSO stores the final slug in properties.slug at INSERT time.
 * This util is used client-side for:
 *   1. Optimistic navigation before the API response arrives.
 *   2. Constructing share URLs in PropertyViewClient.
 *   3. Link href on listing cards.
 */
export const generateSlug = (params: {
  id:            number;
  configLabel?:  string;   // "2 BHK"
  typeLabel?:    string;   // "Independent House"
  locality?:     string;   // "DLF Sector 28"
  city?:         string;   // "Delhi" (fallback if no locality)
}): string => {
  const raw = [
    params.configLabel,
    params.typeLabel,
    params.locality || params.city,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")   // strip punctuation
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-{2,}/g, "-")         // collapse multiple hyphens
    .replace(/^-|-$/g, "");         // trim leading / trailing hyphens

  return `${raw}-${params.id}`;
};

/**
 * propertyUrl — canonical public URL for a listing.
 *
 * Usage:
 *   propertyUrl(p.slug)                → "/property/2-bhk-house-dlf-8"
 *   propertyUrl(p.slug, "https://think4buysale.in")
 *                                      → "https://think4buysale.in/property/…"
 */
export const propertyUrl = (
  slugOrId: string | number,
  baseUrl   = "",
): string => `${baseUrl}/property/${slugOrId}`;