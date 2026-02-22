// src/features/properties/hooks/usePropertyForm.ts
// ─────────────────────────────────────────────────────────────────────────────
// All state, auto-save, submit logic for PostPropertyForm.
// Location IDs (country_id, state_id, city_id) are set via setMany() when
// the user picks from the cascading dropdowns in useLocation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import {
  publishPropertyApi,
  saveDraftApi,
  type PropertyPayload,
  type DraftPayload,
} from "@/services/propertyApi";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface FormData {
  propertyCategory: string;
  listingType:      string;
  plan:             string;
  selectedPlan:     string;

  residentialType:  string;
  commercialType:   string;
  industrialType:   string;
  bhk:              string;

  area:        string;
  price:       string;
  description: string;

  // ── location FKs — mirrors property.entity.ts ─────────────────────────
  country_id:  number;   // required by backend
  state_id:    number;   // required by backend
  city_id:     number;   // required by backend
  locality_id: number;   // 0 = free-text fallback
  locality:    string;   // name sent to API (text, not FK)

  society: string;
  pincode: string;

  /**
   * Real File objects — multipart uploaded on save/publish.
   * Cannot be serialised; excluded from localStorage.
   */
  photoFiles: File[];

  virtualTour:   boolean;
  hideNumber:    boolean;
  ownerName:     string;
  ownerPhone:    string;
  negotiable:    boolean;
  urgent:        boolean;
  loanAvailable: boolean;
  featured:      boolean;
  bathrooms:     number;
  balconies:     number;
  furnishing:    string;
  facing:        string;
  age:           string;
  amenities:     string[];
  deposit:       string;
  maintenance:   string;
  projectName:   string;
  builderName:   string;
  rera:          string;
  powerLoad:     string;
  roadWidth:     string;
  cabins:        string;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DRAFT_LS_KEY = "t4bs_draft_meta";
export const photoLimit = (plan: string) => (plan === "free" ? 5 : 25);

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

export const INITIAL_FORM: FormData = {
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

  country_id:  0,
  state_id:    0,
  city_id:     0,
  locality_id: 0,
  locality:    "",

  society:    "",
  pincode:    "",
  photoFiles: [],

  virtualTour:   false,
  hideNumber:    false,
  ownerName:     "",
  ownerPhone:    "",
  negotiable:    false,
  urgent:        false,
  loanAvailable: false,
  featured:      false,
  bathrooms:     2,
  balconies:     1,
  furnishing:    "",
  facing:        "",
  age:           "",
  amenities:     [],
  deposit:       "",
  maintenance:   "",
  projectName:   "",
  builderName:   "",
  rera:          "",
  powerLoad:     "",
  roadWidth:     "",
  cabins:        "",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const persistLocally = (d: FormData) => {
  try {
    const { photoFiles, ...rest } = d;
    localStorage.setItem(DRAFT_LS_KEY, JSON.stringify(rest));
  } catch { /* quota / private browsing */ }
};

const toPayload = (d: FormData): PropertyPayload => ({
  propertyCategory: d.propertyCategory,
  listingType:      d.listingType,
  plan:             d.selectedPlan || d.plan || undefined,
  residentialType:  d.residentialType || undefined,
  commercialType:   d.commercialType  || undefined,
  industrialType:   d.industrialType  || undefined,
  bhk:              d.bhk             || undefined,
  area:             d.area            || undefined,
  price:            d.price           || undefined,
  description:      d.description     || undefined,

  // location — numeric FK IDs
  country_id: d.country_id || undefined,
  state_id:   d.state_id   || undefined,
  city_id:    d.city_id    || undefined,
  locality:   d.locality   || undefined,

  society:  d.society  || undefined,
  pincode:  d.pincode  || undefined,

  virtualTour:   d.virtualTour,
  hideNumber:    d.hideNumber,
  ownerName:     d.ownerName    || undefined,
  ownerPhone:    d.ownerPhone   || undefined,
  negotiable:    d.negotiable,
  urgent:        d.urgent,
  loanAvailable: d.loanAvailable,
  featured:      d.featured,
  bathrooms:     d.bathrooms,
  balconies:     d.balconies,
  furnishing:    d.furnishing   || undefined,
  facing:        d.facing       || undefined,
  age:           d.age          || undefined,
  amenities:     d.amenities.length ? d.amenities : undefined,
  deposit:       d.deposit      || undefined,
  maintenance:   d.maintenance  || undefined,
  projectName:   d.projectName  || undefined,
  builderName:   d.builderName  || undefined,
  rera:          d.rera         || undefined,
  powerLoad:     d.powerLoad    || undefined,
  roadWidth:     d.roadWidth    || undefined,
  cabins:        d.cabins       || undefined,
});

const extractDraftId = (res: any): number | undefined =>
  res?.data?.id ?? res?.data?.data?.id;

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function usePropertyForm() {
  const [step,        setStep]        = useState(1);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [saveStatus,  setSaveStatus]  = useState<SaveStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [data,        setRaw]         = useState<FormData>(INITIAL_FORM);
  const [draftId,     setDraftId]     = useState<number | undefined>(undefined);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Restore draft from localStorage on mount ──────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setRaw(prev => ({ ...prev, ...parsed, photoFiles: [] }));
    } catch { /* ignore */ }
  }, []);

  // ── Core save helper ─────────────────────────────────────────────────────
  const saveToServer = useCallback(async (
    current: FormData,
    currentDraftId: number | undefined,
  ) => {
    const payload: DraftPayload = {
      ...toPayload(current),
      ...(currentDraftId !== undefined ? { draftId: currentDraftId } : {}),
    };
    const res = await saveDraftApi(payload, current.photoFiles);
    const id = extractDraftId(res);
    if (id) setDraftId(id);
  }, []);

  // ── Debounced auto-save factory ───────────────────────────────────────────
  const scheduleAutoSave = useCallback((next: FormData) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus("idle");
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        persistLocally(next);
        await saveToServer(next, draftId);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 2000);
  }, [draftId, saveToServer]);

  // ── set — single field update ─────────────────────────────────────────────
  const set = useCallback(
    (k: keyof FormData, v: any) => {
      setRaw(prev => {
        const next = { ...prev, [k]: v };
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  // ── setMany — batch field update (used by location cascade) ───────────────
  /**
   * e.g. when user selects a city, call:
   *   setMany({ city_id: 22, locality_id: 0, locality: "" })
   * This avoids multiple re-renders and a single auto-save fires.
   */
  const setMany = useCallback(
    (patch: Partial<FormData>) => {
      setRaw(prev => {
        const next = { ...prev, ...patch };
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  // ── Photo management ─────────────────────────────────────────────────────
  const addPhotos = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const limit = photoLimit(data.plan);
      const valid = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
      if (data.photoFiles.length + valid.length > limit) {
        alert(`Maximum ${limit} photos allowed on the ${data.plan} plan.`);
        return;
      }
      set("photoFiles", [...data.photoFiles, ...valid]);
    },
    [data.photoFiles, data.plan, set],
  );

  const removePhoto = useCallback(
    (index: number) => {
      set("photoFiles", data.photoFiles.filter((_, i) => i !== index));
    },
    [data.photoFiles, set],
  );

  // ── Manual save ──────────────────────────────────────────────────────────
  const manualSave = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus("saving");
    try {
      persistLocally(data);
      await saveToServer(data, draftId);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus("idle"), 3000);
  }, [data, draftId, saveToServer]);

  // ── Publish ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await publishPropertyApi(toPayload(data), data.photoFiles);
      localStorage.removeItem(DRAFT_LS_KEY);
      setDraftId(undefined);
      setSubmitted(true);
    } catch (err: any) {
      const raw = err?.response?.data?.message ?? err?.message ?? "Publish failed. Please try again.";
      setSubmitError(typeof raw === "string" ? raw : raw.join?.(" ") ?? JSON.stringify(raw));
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (step < 5) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else handleSubmit();
  }, [step, handleSubmit]);

  const goPrev = useCallback(() => {
    if (step > 1) { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }, [step]);

  const jumpTo = useCallback((n: number) => setStep(n), []);

  // ── Reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setSubmitted(false); setStep(1); setRaw(INITIAL_FORM);
    setDraftId(undefined); setSubmitError(null);
  }, []);

  return {
    step, data, draftId, submitted, submitting, saveStatus, submitError,
    set, setMany,
    addPhotos, removePhoto,
    goNext, goPrev, jumpTo,
    manualSave, reset,
  };
}