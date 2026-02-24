"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useSearchParams } from "next/navigation";

// ── Redux thunks ───────────────────────────────────────────────────────────────
import {
  getProperty,
  saveDraft,
  publishProperty,
  clearSelectedProperty,
} from "@/store/slices/propertySlice";

// Layout
import { Header, HeroStrip, BottomNav } from "../component/layout/PageLayout";
import { Sidebar } from "../component/layout/Sidebar";

// Steps
import { Step1 } from "../component/steps/Step1";
import { Step2 } from "../component/steps/Step2";
import { Step3 } from "../component/steps/Step3";
import { Step4 } from "../component/steps/Step4";
import { Step5 } from "../component/steps/Step5";
import { Success } from "../component/Success";

// ─── ID MAPS — must match your DB seed data ───────────────────────────────────
// Keep these in sync with your master tables.
// If you fetch masters from /api/v1/masters, replace the hardcoded values below
// with the dynamic lookup once data is loaded.

/** Main property category string → category_id FK */
export const CATEGORY_ID: Record<string, number> = {
  residential: 1,
  commercial:  2,
  industrial:  3,
  pg:          4,
  project:     5,
};

/**
 * Subcategory string → subcategory_id FK.
 * Keys must match exactly what Step1/Step2 stores in residentialType / commercialType / industrialType.
 */
export const SUBCATEGORY_ID: Record<string, number> = {
  // Residential
  "Flat / Apartment":    101,
  "Independent House":   102,
  "Villa":               103,
  "Builder Floor":       104,
  "Residential Plot":    105,
  "Farm House":          106,
  // Commercial
  "Office Space":        201,
  "IT Park / SEZ":       202,
  "Shop / Showroom":     203,
  "Warehouse / Godown":  204,
  "Co-working Space":    205,
  "Commercial Plot":     206,
  // Industrial
  "Factory / Manufacturing": 301,
  "Warehouse":           302,
  "Cold Storage":        303,
  "Industrial Land":     304,
  "Industrial Shed":     305,
  // PG / Co-living
  "PG / Hostel":         401,
  "Co-living":           402,
  // Project
  "Residential Project": 501,
  "Commercial Project":  502,
  "Mixed Use":           503,
};

/**
 * BHK config string → config_type_id FK.
 * Matches the BHK array in Step2 / your config_types master table.
 */
export const CONFIG_TYPE_ID: Record<string, number> = {
  "1 RK":   1,
  "1 BHK":  2,
  "2 BHK":  3,
  "3 BHK":  4,
  "4 BHK":  5,
  "4+ BHK": 6,
};

/**
 * Amenity label → amenity_id FK (matches your amenities master table).
 * Sent as JSON integer array so DTO @Transform can parse it.
 */
export const AMENITY_ID: Record<string, number> = {
  "Lift":                  1,
  "Parking":               2,
  "Power Backup":          3,
  "Security":              4,
  "Gymnasium":             5,
  "Swimming Pool":         6,
  "Club House":            7,
  "Garden / Park":         8,
  "Gated Society":         9,
  "CCTV":                 10,
  "Intercom":             11,
  "Visitor Parking":      12,
  "Children's Play Area": 13,
  "Jogging Track":        14,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve category_id from the form's string category field */
const resolveCategoryId = (cat: string): number | undefined =>
  CATEGORY_ID[cat] ?? undefined;

/** Resolve subcategory_id from whichever type field is populated */
const resolveSubcategoryId = (data: FormData): number | undefined => {
  const raw =
    data.residentialType ||
    data.commercialType  ||
    data.industrialType  ||
    "";
  return raw ? (SUBCATEGORY_ID[raw] ?? undefined) : undefined;
};

/** Resolve config_type_id from bhk string */
const resolveConfigTypeId = (bhk: string): number | undefined =>
  bhk ? (CONFIG_TYPE_ID[bhk] ?? undefined) : undefined;

/**
 * Convert amenity label strings → integer IDs.
 * Silently skips any label not found in the map (safe for draft saves).
 */
const resolveAmenityIds = (labels: string[]): number[] =>
  labels
    .map(l => AMENITY_ID[l])
    .filter((id): id is number => id !== undefined);

// ─── CONFIGURABLE DEFAULT ─────────────────────────────────────────────────────
const DEFAULT_COUNTRY_ID = 1; // India

// ─── FORM STATE SHAPE ─────────────────────────────────────────────────────────
// The form always stores human-readable strings. ID resolution happens only in
// toPayload() right before the API call — single source of truth.
export interface FormData {
  propertyCategory: string;   // "residential" | "commercial" | "industrial" | "pg" | "project"
  listingType:      string;   // "sell" | "rent" | "pg"
  plan:             string;
  selectedPlan:     string;
  residentialType:  string;   // e.g. "Flat / Apartment"
  commercialType:   string;
  industrialType:   string;
  bhk:              string;   // e.g. "2 BHK"
  area:             string;
  price:            string;
  description:      string;
  country_id:       number;
  state_id:         number;
  city_id:          number;
  locality_id:      number;   // 0 = not selected / free-text mode
  locality:         string;   // free-text fallback if no locality_id
  society:          string;
  pincode:          string;
  address:          string;   // optional full address line (Step 3)
  title:            string;   // mandatory listing headline (Step 2)
  photos:           string[]; // preview URLs (blob: or server URL)
  photoFiles:       File[];   // actual File objects → sent to API
  virtualTour:      boolean;
  hideNumber:       boolean;
  ownerName:        string;
  ownerPhone:       string;
  negotiable:       boolean;
  urgent:           boolean;
  loanAvailable:    boolean;
  featured:         boolean;
  bathrooms:        number;
  balconies:        number;
  furnishing:       string;
  facing:           string;
  age:              string;
  amenities:        string[]; // label strings — resolved to IDs in toPayload()
  deposit:          string;
  maintenance:      string;
  projectName:      string;
  builderName:      string;
  rera:             string;
  powerLoad:        string;
  roadWidth:        string;
  cabins:           string;
  draftId?:         number;
}

const INITIAL: FormData = {
  propertyCategory: "residential",
  listingType:      "sell",
  plan:             "free",
  selectedPlan:     "",
  residentialType:  "",
  commercialType:   "",
  industrialType:   "",
  bhk:              "",
  area:             "",
  price:            "",
  description:      "",
  country_id:       DEFAULT_COUNTRY_ID,
  state_id:         0,
  city_id:          0,
  locality_id:      0,
  locality:         "",
  society:          "",
  pincode:          "",
  address:          "",
  title:            "",
  photos:           [],
  photoFiles:       [],
  virtualTour:      false,
  hideNumber:       false,
  ownerName:        "",
  ownerPhone:       "",
  negotiable:       false,
  urgent:           false,
  loanAvailable:    false,
  featured:         false,
  bathrooms:        2,
  balconies:        1,
  furnishing:       "",
  facing:           "",
  age:              "",
  amenities:        [],
  deposit:          "",
  maintenance:      "",
  projectName:      "",
  builderName:      "",
  rera:             "",
  powerLoad:        "",
  roadWidth:        "",
  cabins:           "",
  draftId:          undefined,
};

// ─── API RESPONSE → FORM STATE ────────────────────────────────────────────────
// Handles both the new FK-based entity AND old string-based records gracefully.
const apiToForm = (p: any): Partial<FormData> => {
  // Amenities from API may be number[] (new) or string[] (old) — normalise to string[] for the UI
  let amenityLabels: string[] = [];
  if (Array.isArray(p.amenities)) {
    if (typeof p.amenities[0] === "number") {
      // Reverse-map IDs back to labels for display
      const idToLabel = Object.fromEntries(
        Object.entries(AMENITY_ID).map(([l, id]) => [id, l])
      );
      amenityLabels = p.amenities
        .map((id: number) => idToLabel[id])
        .filter(Boolean);
    } else {
      amenityLabels = p.amenities as string[];
    }
  }

  return {
    propertyCategory: p.propertyCategory ?? p.category ?? "residential",
    listingType:      p.listingType       ?? "sell",
    plan:             p.plan              ?? "free",
    selectedPlan:     p.selectedPlan      ?? "",
    residentialType:  p.residentialType   ?? "",
    commercialType:   p.commercialType    ?? "",
    industrialType:   p.industrialType    ?? "",
    bhk:              p.bhk               ?? "",
    area:             String(p.area       ?? ""),
    price:            String(p.price      ?? ""),
    description:      p.description       ?? "",
    country_id:       Number(p.country_id  ?? DEFAULT_COUNTRY_ID),
    state_id:         Number(p.state_id    ?? 0),
    city_id:          Number(p.city_id     ?? 0),
    locality_id:      Number(p.locality_id ?? 0),
    locality:         p.locality           ?? "",
    society:          p.society            ?? "",
    pincode:          p.pincode            ?? "",
    address:          p.address            ?? "",
    title:            p.title              ?? "",
    photos:           Array.isArray(p.photos) ? p.photos : [],
    photoFiles:       [],
    virtualTour:      Boolean(p.virtualTour),
    hideNumber:       Boolean(p.hideNumber),
    ownerName:        p.ownerName         ?? "",
    ownerPhone:       p.ownerPhone        ?? "",
    negotiable:       Boolean(p.negotiable),
    urgent:           Boolean(p.urgent),
    loanAvailable:    Boolean(p.loanAvailable),
    featured:         Boolean(p.featured),
    bathrooms:        Number(p.bathrooms   ?? 2),
    balconies:        Number(p.balconies   ?? 1),
    furnishing:       p.furnishing        ?? "",
    facing:           p.facing            ?? "",
    age:              p.age               ?? "",
    amenities:        amenityLabels,
    deposit:          String(p.deposit    ?? ""),
    maintenance:      String(p.maintenance ?? ""),
    projectName:      p.projectName       ?? "",
    builderName:      p.builderName       ?? "",
    rera:             p.rera              ?? "",
    powerLoad:        p.powerLoad         ?? "",
    roadWidth:        p.roadWidth         ?? "",
    cabins:           p.cabins            ?? "",
    draftId:          p.id                ?? undefined,
  };
};

// ─── FORM STATE → API PAYLOAD ─────────────────────────────────────────────────
// This is the critical function — resolves all string values to integer IDs.
// Called once right before each API request (publish or draft save).
//
// What the NestJS DTO requires:
//   category_id    (integer, required for publish)
//   subcategory_id (integer, required for publish)
//   locality_id    (integer, required for publish)
//   amenities      (number[], sent as JSON string '[1,2,3]' via multipart)
//   photos         (files via multipart, NOT in this payload object)
//
const toPayload = (data: FormData) => {
  const category_id    = resolveCategoryId(data.propertyCategory);
  const subcategory_id = resolveSubcategoryId(data);
  const config_type_id = resolveConfigTypeId(data.bhk);
  const amenityIds     = resolveAmenityIds(data.amenities);

  // locality_id: prefer the cascade-selected ID, fall back to undefined (omit) for draft
  // locality: always send as text — backend stores it whether ID exists or not
  const locality_id = data.locality_id > 0 ? data.locality_id : undefined;

  return {
    // ── Required category fields ──────────────────────────────────────────
    ...(category_id    !== undefined && { category_id }),
    ...(subcategory_id !== undefined && { subcategory_id }),
    ...(config_type_id !== undefined && { config_type_id }),

    // ── Listing type ──────────────────────────────────────────────────────
    listingType: data.listingType,
    plan:        data.plan || undefined,

    // ── Numerics (send as strings for multipart, DTO @Transform handles) ─
    ...(data.area        && { area:        data.area }),
    ...(data.price       && { price:       data.price }),
    ...(data.deposit     && { deposit:     data.deposit }),
    ...(data.maintenance && { maintenance: data.maintenance }),
    bathrooms: data.bathrooms,
    balconies: data.balconies,

    // ── Location FKs ──────────────────────────────────────────────────────
    country_id:  data.country_id || undefined,
    state_id:    data.state_id   || undefined,
    city_id:     data.city_id    || undefined,
    locality_id,
    // Always send locality text — used by backend even when locality_id is set,
    // and as the sole locality identifier when free-text mode (locality_id = 0).
    ...(data.locality && { locality: data.locality }),

    // ── Text fields ───────────────────────────────────────────────────────
    ...(data.title        && { title:        data.title }),        // mandatory
    ...(data.description  && { description:  data.description }),
    ...(data.address      && { address:      data.address }),      // optional
    ...(data.society      && { society:      data.society }),
    ...(data.pincode      && { pincode:      data.pincode }),
    ...(data.projectName  && { projectName:  data.projectName }),
    ...(data.builderName  && { builderName:  data.builderName }),
    ...(data.rera         && { rera:         data.rera }),
    ...(data.powerLoad    && { powerLoad:    data.powerLoad }),
    ...(data.roadWidth    && { roadWidth:    data.roadWidth }),
    ...(data.cabins       && { cabins:       data.cabins }),
    ...(data.furnishing   && { furnishing:   data.furnishing }),
    ...(data.facing       && { facing:       data.facing }),
    ...(data.age          && { age:          data.age }),

    // ── Boolean flags ─────────────────────────────────────────────────────
    virtualTour:  data.virtualTour,
    hideNumber:   data.hideNumber,
    negotiable:   data.negotiable,
    urgent:       data.urgent,
    loanAvailable:data.loanAvailable,
    featured:     data.featured,

    // ── Contact ───────────────────────────────────────────────────────────
    ...(data.ownerName  && { ownerName:  data.ownerName }),
    ...(data.ownerPhone && { ownerPhone: data.ownerPhone }),

    // ── Amenities as integer array ────────────────────────────────────────
    // Passed separately as JSON string in FormData builder (see propertyApi.ts)
    amenities: amenityIds.length ? amenityIds : undefined,
  };
};

// ─── DRAFT PAYLOAD ────────────────────────────────────────────────────────────
// Draft saves skip required-field validation (backend uses skipMissingProperties)
// so we can send whatever is available without category/locality being mandatory.
const toDraftPayload = (data: FormData) => {
  const base = toPayload(data);
  return {
    ...base,
    ...(data.draftId !== undefined && { draftId: data.draftId }),
  };
};

// ─── VALIDATION — run before publish (not before draft) ──────────────────────
interface ValidationError { field: string; msg: string }

const validateForPublish = (data: FormData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const catId = resolveCategoryId(data.propertyCategory);
  const subId = resolveSubcategoryId(data);

  if (!catId)          errors.push({ field: "propertyCategory", msg: "Select a property category" });
  if (!subId)          errors.push({ field: "residentialType",  msg: "Select the property type" });
  if (!data.title || data.title.length < 10)
                       errors.push({ field: "title",            msg: "Add a listing title (min 10 characters)" });
  if (!data.area)      errors.push({ field: "area",             msg: "Area is required" });
  if (!data.price)     errors.push({ field: "price",            msg: "Price is required" });
  if (!data.city_id)   errors.push({ field: "city_id",          msg: "Select a city" });

  // locality: accept EITHER a dropdown-selected locality_id > 0
  //           OR a free-text locality string (locality_id = 0 but locality has text)
  if (!data.locality_id && !data.locality.trim())
    errors.push({ field: "locality_id", msg: "Enter or select a locality" });

  if (!data.ownerName)  errors.push({ field: "ownerName",  msg: "Contact name is required" });
  if (!data.ownerPhone) errors.push({ field: "ownerPhone", msg: "Contact phone is required" });

  return errors;
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_UI: Record<string, {
  bg: string; border: string; icon: string; msg: string; sub: string;
}> = {
  published: {
    bg:     "from-emerald-500 to-emerald-600",
    border: "border-emerald-200",
    icon:   "✅",
    msg:    "This listing is live — read only",
    sub:    "Published listings cannot be edited. Contact support to request changes.",
  },
  rejected: {
    bg:     "from-red-500 to-rose-600",
    border: "border-red-200",
    icon:   "❌",
    msg:    "This listing was rejected — read only",
    sub:    "Create a new listing or contact support for assistance.",
  },
  expired: {
    bg:     "from-amber-500 to-orange-500",
    border: "border-amber-200",
    icon:   "⏰",
    msg:    "This listing has expired — read only",
    sub:    "Go to My Listings and click Renew to make it live again.",
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function PostPropertyForm() {
  const dispatch     = useAppDispatch();
  const searchParams = useSearchParams();

  const paramId = searchParams.get("draft") ?? searchParams.get("edit") ?? null;

  const [step,       setStep]       = useState(1);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [data,       setRaw]        = useState<FormData>(INITIAL);
  const [loadState,  setLoadState]  = useState<"idle"|"loading"|"error">(
    paramId ? "loading" : "idle"
  );
  const [loadError,  setLoadError]  = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [propStatus, setPropStatus] = useState("");
  const [publishErrors, setPublishErrors] = useState<ValidationError[]>([]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { masters }   = useAppSelector((state: any) => state);

  // Clean up on unmount
  useEffect(() => {
    return () => { dispatch(clearSelectedProperty()); };
  }, [dispatch]);

  // ── LOAD DRAFT / PROPERTY ─────────────────────────────────────────────────
  useEffect(() => {
    if (!paramId) return;

    (async () => {
      setLoadState("loading");
      const result = await dispatch(getProperty(paramId));

      if (getProperty.rejected.match(result)) {
        setLoadError((result.payload as string) ?? "Failed to load listing.");
        setLoadState("error");
        return;
      }

      const raw      = result.payload;
      const property = raw?.data ?? raw;

      if (!property) {
        setLoadError("Property not found.");
        setLoadState("error");
        return;
      }

      const status = (property.status ?? "").toLowerCase();
      setPropStatus(status);

      if (status === "published" || status === "rejected" || status === "expired") {
        setIsReadOnly(true);
      }

      setRaw((prev) => ({ ...prev, ...apiToForm(property) }));
      setLoadState("idle");
    })();
  }, [paramId, dispatch]);

  // ── FIELD SETTER + AUTO-SAVE ──────────────────────────────────────────────
  const set = useCallback((k: string, v: any) => {
    if (isReadOnly) return;
    setRaw((prev) => {
      const next = { ...prev, [k]: v } as FormData;
      // Debounced auto-save — waits 2s after last keystroke
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      setSaveStatus("idle");
      autoSaveTimer.current = setTimeout(() => runDraftSave(next), 2000);
      return next;
    });
  }, [isReadOnly]);

  // ── PHOTO MANAGEMENT ──────────────────────────────────────────────────────
  // Photos are stored in TWO parallel arrays:
  //   photos:     string[]  — blob: URLs for <img> preview
  //   photoFiles: File[]    — actual File objects sent to the API
  //
  // When we receive saved photos from the API, they land in `photos` as server
  // URLs and `photoFiles` stays empty (user must re-pick to replace them).
  //
  // addPhotos: takes new File[], creates blob previews, appends both arrays
  const addPhotos = useCallback((files: File[]) => {
    if (isReadOnly) return;
    setRaw((prev) => {
      const newFiles    = [...prev.photoFiles, ...files].slice(0, 20);
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      return { ...prev, photoFiles: newFiles, photos: newPreviews };
    });
  }, [isReadOnly]);

  // removePhoto: removes by index from both arrays, revokes the blob URL
  const removePhoto = useCallback((index: number) => {
    if (isReadOnly) return;
    setRaw((prev) => {
      // Only revoke if it's a blob URL (not a server URL)
      const url = prev.photos[index];
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      const newFiles    = prev.photoFiles.filter((_, i) => i !== index);
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      return { ...prev, photoFiles: newFiles, photos: newPreviews };
    });
  }, [isReadOnly]);

  // ── DRAFT SAVE ────────────────────────────────────────────────────────────
  // Skips validation — backend uses skipMissingProperties for draft endpoint.
  // Sends real File[] via the saveDraft Redux thunk → propertyApi.ts → FormData.
  const runDraftSave = async (snapshot: FormData) => {
    if (isReadOnly) return;
    setSaveStatus("saving");

    const draftPayload = toDraftPayload(snapshot);

    const result = await dispatch(
      saveDraft({
        payload: draftPayload as any,
        files:   snapshot.photoFiles,  // ← real File objects, sent via multipart
      })
    );

    if (saveDraft.fulfilled.match(result)) {
      // Persist server-assigned draft ID for subsequent saves
      const returnedId: number | undefined =
        result.payload?.data?.id ?? result.payload?.id;
      if (returnedId && returnedId !== snapshot.draftId) {
        setRaw((prev) => ({ ...prev, draftId: returnedId }));
      }
      setSaveStatus("saved");
    } else {
      setSaveStatus("error");
    }

    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const manualSave = useCallback(async () => {
    if (isReadOnly) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await runDraftSave(data);
  }, [data, isReadOnly]);

  // ── PUBLISH ───────────────────────────────────────────────────────────────
  // Runs client-side validation first so the user gets clear error messages
  // before the request even leaves the browser.
  const handleSubmit = async () => {
    if (isReadOnly) return;

    // Client-side validation
    const errors = validateForPublish(data);
    if (errors.length > 0) {
      setPublishErrors(errors);
      // Jump to the first step that has an error
      const firstError = errors[0].field;
      if (["propertyCategory", "residentialType", "commercialType", "industrialType"].includes(firstError)) setStep(1);
      else if (["area", "price", "bhk"].includes(firstError)) setStep(2);
      else if (["city_id", "locality_id"].includes(firstError)) setStep(3);
      else if (["ownerName", "ownerPhone"].includes(firstError)) setStep(5);
      return;
    }

    setPublishErrors([]);
    setSubmitting(true);

    const result = await dispatch(
      publishProperty({
        payload: toPayload(data) as any,
        files:   data.photoFiles,         // ← real File objects
      })
    );

    if (publishProperty.fulfilled.match(result)) {
      setSubmitted(true);
    } else {
      const msg = (result.payload as string) ?? "Failed to publish. Please try again.";
      alert(msg);
    }

    setSubmitting(false);
  };

  // ── NAVIGATION ────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (!isReadOnly) {
      handleSubmit();
    }
  };
  const goPrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Success onReset={() => {
        setSubmitted(false);
        setStep(1);
        setRaw(INITIAL);
        setIsReadOnly(false);
        setPropStatus("");
        setPublishErrors([]);
        dispatch(clearSelectedProperty());
      }} />
    );
  }

  // ── LOADING SCREEN ────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center shadow-[0_8px_32px_rgba(37,99,235,0.35)]">
          <svg className="animate-spin w-7 h-7 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
        <div className="text-center">
          <p style={{ fontFamily:"'Playfair Display',serif" }} className="text-xl font-bold text-[#0B3C8C]">
            Loading your listing…
          </p>
          <p className="text-sm text-slate-400 mt-1">Fetching saved data, just a moment</p>
        </div>
      </div>
    );
  }

  // ── ERROR SCREEN ──────────────────────────────────────────────────────────
  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border-2 border-red-100 shadow-[0_8px_40px_rgba(239,68,68,0.1)] p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <p style={{ fontFamily:"'Playfair Display',serif" }} className="text-lg font-bold text-[#0B3C8C] mb-2">
            Couldn't load listing
          </p>
          <p className="text-sm text-slate-500 mb-5">{loadError}</p>
          <a href="/post-property"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-sm font-bold rounded-2xl no-underline shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.4)] transition-all">
            ➕ Start New Listing
          </a>
        </div>
      </div>
    );
  }

  const statusUI = STATUS_UI[propStatus] ?? STATUS_UI["published"];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        @keyframes fadeStep  { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .fade-step  { animation: fadeStep  0.3s ease both; }
        .slide-down { animation: slideDown 0.3s ease both; }
        select { -webkit-appearance: none; }
        .readonly-form input,
        .readonly-form select,
        .readonly-form textarea {
          pointer-events: none !important;
          opacity: 0.6 !important;
          background: #f8faff !important;
          cursor: not-allowed !important;
        }
        .readonly-form button:not([data-nav]) {
          pointer-events: none !important;
          opacity: 0.4 !important;
          cursor: not-allowed !important;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">

        {/* ── READ-ONLY BANNER ──────────────────────────────────────────────── */}
        {isReadOnly && (
          <div className={`slide-down sticky top-0 z-[60] bg-gradient-to-r ${statusUI.bg} shadow-md`}
            style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
            <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{statusUI.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-black leading-tight">{statusUI.msg}</p>
                <p className="text-white/70 text-[10px] mt-0.5 hidden sm:block">{statusUI.sub}</p>
              </div>
              <a href="/user-panel"
                className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-3 py-1.5 rounded-xl no-underline transition-colors whitespace-nowrap">
                ← My Listings
              </a>
            </div>
          </div>
        )}

        {/* ── DRAFT INDICATOR ───────────────────────────────────────────────── */}
        {!isReadOnly && data.draftId && (
          <div className="sticky top-0 z-[55] bg-amber-500/95 backdrop-blur-sm">
            <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center gap-2">
              <svg className="w-3 h-3 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              <p className="text-white text-[11px] font-black flex-1">
                Editing draft #{data.draftId} · changes auto-save every 2s
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                saveStatus === "saving" ? "bg-white/20 text-white" :
                saveStatus === "saved"  ? "bg-emerald-700/40 text-emerald-100" :
                saveStatus === "error"  ? "bg-red-700/40 text-white" :
                "opacity-0 pointer-events-none"
              }`}>
                {saveStatus === "saving" ? "⏳ saving…" :
                 saveStatus === "saved"  ? "✅ saved" :
                 saveStatus === "error"  ? "⚠️ error" : "—"}
              </span>
            </div>
          </div>
        )}

        {/* ── PUBLISH VALIDATION ERRORS BANNER ─────────────────────────────── */}
        {publishErrors.length > 0 && (
          <div className="slide-down sticky top-0 z-[58] bg-rose-500 shadow-md">
            <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-white text-xs font-black mb-1">Please fix these issues before publishing:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {publishErrors.map((e, i) => (
                    <li key={i} className="text-white/90 text-[11px]">{e.msg}</li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setPublishErrors([])}
                className="text-white/70 hover:text-white text-lg leading-none mt-0.5 flex-shrink-0">✕</button>
            </div>
          </div>
        )}

        <Header step={step} saveStatus={saveStatus} onSave={manualSave} onJump={setStep} />
        <HeroStrip step={step} />

        <div className="max-w-[1200px] mx-auto px-3 md:px-5 py-5 pb-28">
          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* ── FORM PANEL ────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_4px_24px_rgba(11,60,140,0.08)] p-5 md:p-7 transition-all
                ${isReadOnly
                  ? `border-2 ${statusUI.border} readonly-form`
                  : "border border-blue-100"
                }`}>

                {/* Pass CATEGORY_ID and SUBCATEGORY_ID maps to steps so they can
                    display human-readable labels from IDs if needed */}
                {step === 1 && (
                  <Step1
                    d={data}
                    s={set}
                    masters={masters}
                  />
                )}
                {step === 2 && (
                  <Step2
                    d={data}
                    s={set}
                    masters={masters}
                    publishErrors={publishErrors}
                  />
                )}
                {step === 3 && (
                  <Step3
                    d={data}
                    s={set}
                  />
                )}
                {step === 4 && (
                  <Step4
                    d={data}
                    s={set}
                    plan={data.plan}
                    photoFiles={data.photoFiles}
                    addPhotos={addPhotos}
                    removePhoto={removePhoto}
                  />
                )}
                {step === 5 && (
                  <Step5
                    d={data}
                    s={set}
                    masters={masters}
                    publishErrors={publishErrors}
                  />
                )}
              </div>
            </div>

            {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
            <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 lg:sticky lg:top-[130px]">
              <Sidebar d={data} saveStatus={saveStatus} onSave={manualSave} />
            </div>
          </div>
        </div>

        {/* ── BOTTOM NAV ────────────────────────────────────────────────────── */}
        {isReadOnly ? (
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom,16px)" }}>
            <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-4 py-3">
              {step > 1 ? (
                <button data-nav onClick={goPrev}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-blue-100 text-sm font-bold text-blue-600 bg-white cursor-pointer font-[inherit] hover:border-blue-300 active:scale-95 transition-all">
                  ← Back
                </button>
              ) : (
                <a href="/user-panel"
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-blue-100 text-sm font-bold text-blue-600 bg-white no-underline hover:border-blue-300 transition-all">
                  ← Listings
                </a>
              )}
              <div className="flex-1 flex items-center justify-center gap-1.5">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} data-nav onClick={() => setStep(s)}
                    className={`rounded-full border-none cursor-pointer transition-all ${
                      s === step ? "bg-[#0B3C8C] w-5 h-2" : "bg-slate-200 hover:bg-slate-300 w-2 h-2"
                    }`}
                  />
                ))}
              </div>
              {step < 5 ? (
                <button data-nav onClick={goNext}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-100 text-sm font-bold text-slate-500 border-none cursor-pointer font-[inherit] hover:bg-slate-200 active:scale-95 transition-all">
                  Next →
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                  <span>{statusUI.icon}</span>
                  <span className="text-xs font-black text-slate-500 hidden sm:block capitalize">
                    {propStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <BottomNav
            step={step}
            submitting={submitting}
            onNext={goNext}
            onPrev={goPrev}
            onSave={manualSave}
          />
        )}
      </div>
    </>
  );
}