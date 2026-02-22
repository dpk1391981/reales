"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useSearchParams } from "next/navigation";

// ── Redux thunks (no direct API imports needed) ────────────────────────────
import {
  getProperty,
  saveDraft,
  publishProperty,
  clearSelectedProperty,
} from "@/store/slices/propertySlice";
import type { PropertyPayload, DraftPayload } from "@/services/propertyApi";

// Layout
import { Header, HeroStrip, BottomNav } from "../component/layout/PageLayout";
import { Sidebar } from "../component/layout/Sidebar";

// Steps
import { Step1 } from "../component/steps/Step1";
import { Step2 } from "../component/steps/Step2";
import { Step3 } from "../component/steps/Step3";
import { Step4 } from "../component/steps/Step4";
import { Step5 } from "../component/steps/Step5";


// Success
import { Success } from "../component/Success";

// ─── CONFIGURABLE DEFAULT ─────────────────────────────────────────────────────
const DEFAULT_COUNTRY_ID = 1;

// ─── FORM STATE SHAPE ─────────────────────────────────────────────────────────
interface FormData {
  propertyCategory: string;
  listingType:      string;
  plan:             string;
  selectedPlan:     string;
  residentialType:  string;
  commercialType:   string;
  industrialType:   string;
  bhk:              string;
  area:             string;
  price:            string;
  description:      string;
  country_id:       number;   // FK — drives state dropdown
  state_id:         number;   // FK — drives city dropdown
  city_id:          number;   // FK — drives locality dropdown
  locality:         string;   // free-text name, not an FK
  society:          string;
  pincode:          string;
  photos:           string[]; // blob URLs or server URLs — preview only
  photoFiles:       File[];   // real File objects sent to API
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
  amenities:        string[];
  deposit:          string;
  maintenance:      string;
  projectName:      string;
  builderName:      string;
  rera:             string;
  powerLoad:        string;
  roadWidth:        string;
  cabins:           string;
  draftId?:         number;   // server-assigned id, reused on auto-saves
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
  locality:         "",
  society:          "",
  pincode:          "",
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
// Maps every field returned by getProperty thunk back into FormData.
// Server photo URLs go into `photos` for preview.
// `photoFiles` stays empty — user must re-select files to replace photos.
const apiToForm = (p: any): Partial<FormData> => ({
  propertyCategory: p.propertyCategory ?? p.category      ?? "residential",
  listingType:      p.listingType      ?? "sell",
  plan:             p.plan             ?? "free",
  selectedPlan:     p.selectedPlan     ?? "",
  residentialType:  p.residentialType  ?? "",
  commercialType:   p.commercialType   ?? "",
  industrialType:   p.industrialType   ?? "",
  bhk:              p.bhk              ?? "",
  area:             String(p.area      ?? ""),
  price:            String(p.price     ?? ""),
  description:      p.description      ?? "",
  country_id:       Number(p.country_id ?? DEFAULT_COUNTRY_ID),
  state_id:         Number(p.state_id   ?? 0),
  city_id:          Number(p.city_id    ?? 0),
  locality:         p.locality          ?? "",
  society:          p.society           ?? "",
  pincode:          p.pincode           ?? "",
  photos:           Array.isArray(p.photos) ? p.photos : [],
  photoFiles:       [], // never carry File objects from API
  virtualTour:      Boolean(p.virtualTour),
  hideNumber:       Boolean(p.hideNumber),
  ownerName:        p.ownerName        ?? "",
  ownerPhone:       p.ownerPhone       ?? "",
  negotiable:       Boolean(p.negotiable),
  urgent:           Boolean(p.urgent),
  loanAvailable:    Boolean(p.loanAvailable),
  featured:         Boolean(p.featured),
  bathrooms:        Number(p.bathrooms  ?? 2),
  balconies:        Number(p.balconies  ?? 1),
  furnishing:       p.furnishing       ?? "",
  facing:           p.facing           ?? "",
  age:              p.age              ?? "",
  amenities:        Array.isArray(p.amenities) ? p.amenities : [],
  deposit:          String(p.deposit    ?? ""),
  maintenance:      String(p.maintenance ?? ""),
  projectName:      p.projectName      ?? "",
  builderName:      p.builderName      ?? "",
  rera:             p.rera             ?? "",
  powerLoad:        p.powerLoad        ?? "",
  roadWidth:        p.roadWidth        ?? "",
  cabins:           p.cabins           ?? "",
  draftId:          p.id              ?? undefined,
});

// ─── FORM STATE → PAYLOAD ─────────────────────────────────────────────────────
const toPayload = (data: FormData): PropertyPayload => ({
  propertyCategory: data.propertyCategory,
  listingType:      data.listingType,
  plan:             data.plan,
  residentialType:  data.residentialType || undefined,
  commercialType:   data.commercialType  || undefined,
  industrialType:   data.industrialType  || undefined,
  bhk:              data.bhk             || undefined,
  area:             data.area            || undefined,
  price:            data.price           || undefined,
  description:      data.description     || undefined,
  country_id:       data.country_id      || undefined,
  state_id:         data.state_id        || undefined,
  city_id:          data.city_id         || undefined,
  locality:         data.locality        || undefined,
  society:          data.society         || undefined,
  pincode:          data.pincode         || undefined,
  virtualTour:      data.virtualTour,
  hideNumber:       data.hideNumber,
  ownerName:        data.ownerName       || undefined,
  ownerPhone:       data.ownerPhone      || undefined,
  negotiable:       data.negotiable,
  urgent:           data.urgent,
  loanAvailable:    data.loanAvailable,
  featured:         data.featured,
  bathrooms:        data.bathrooms,
  balconies:        data.balconies,
  furnishing:       data.furnishing      || undefined,
  facing:           data.facing          || undefined,
  age:              data.age             || undefined,
  amenities:        data.amenities.length ? data.amenities : undefined,
  deposit:          data.deposit         || undefined,
  maintenance:      data.maintenance     || undefined,
  projectName:      data.projectName     || undefined,
  builderName:      data.builderName     || undefined,
  rera:             data.rera            || undefined,
  powerLoad:        data.powerLoad       || undefined,
  roadWidth:        data.roadWidth       || undefined,
  cabins:           data.cabins          || undefined,
});

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
  // ?draft=123 — load a draft and continue editing it
  // ?edit=123  — load any property; read-only if published/rejected/expired
  const paramId = searchParams.get("draft") ?? searchParams.get("edit") ?? null;

  const [step, setStep]             = useState(1);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [data, setRaw]              = useState<FormData>(INITIAL);
  const [loadState, setLoadState]   = useState<"idle"|"loading"|"error">(
    paramId ? "loading" : "idle"
  );
  const [loadError, setLoadError]   = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [propStatus, setPropStatus] = useState("");

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { masters }   = useAppSelector((state: any) => state);

  // Clean up selectedProperty in store on unmount so stale data doesn't linger
  useEffect(() => {
    return () => { dispatch(clearSelectedProperty()); };
  }, [dispatch]);

  // ── LOAD DRAFT / PROPERTY ON MOUNT ───────────────────────────────────────
  // Uses getProperty thunk → result lands in store.property.selectedProperty
  // AND is returned directly so we don't need a selector watch here.
  useEffect(() => {
    if (!paramId) return;

    (async () => {
      setLoadState("loading");
      const result = await dispatch(getProperty(paramId));

      if (getProperty.rejected.match(result)) {
        setLoadError(
          (result.payload as string) ?? "Failed to load listing."
        );
        setLoadState("error");
        return;
      }

      // Unwrap the property from the thunk result
      // getProperty.fulfilled payload = res.data (see slice)
      const raw      = result.payload;
      const property = raw?.data ?? raw; // handle {data:{…}} or flat object

      if (!property) {
        setLoadError("Property not found.");
        setLoadState("error");
        return;
      }

      const status = (property.status ?? "").toLowerCase();
      setPropStatus(status);

      // Published / rejected / expired → read-only view, form still pre-filled
      if (status === "published" || status === "rejected" || status === "expired") {
        setIsReadOnly(true);
      }

      setRaw((prev) => ({ ...prev, ...apiToForm(property) }));
      setLoadState("idle");
    })();
  }, [paramId, dispatch]);

  // ── FIELD SETTER ─────────────────────────────────────────────────────────
  const set = useCallback((k: string, v: any) => {
    if (isReadOnly) return; // silently block changes on read-only form
    setRaw((prev) => {
      const next = { ...prev, [k]: v };
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      setSaveStatus("idle");
      autoSaveTimer.current = setTimeout(() => runDraftSave(next), 2000);
      return next;
    });
  }, [isReadOnly]);

  // ── DRAFT SAVE via Redux thunk ────────────────────────────────────────────
  // Uses saveDraft thunk (PUT /properties/draft).
  // Passes draftId on subsequent saves so backend updates the same record.
  const runDraftSave = async (snapshot: FormData) => {
    if (isReadOnly) return;
    setSaveStatus("saving");

    const draftPayload: DraftPayload = {
      ...toPayload(snapshot),
      ...(snapshot.draftId ? { draftId: snapshot.draftId } : {}),
    };

    const result = await dispatch(
      saveDraft({ payload: draftPayload, files: snapshot.photoFiles })
    );

    if (saveDraft.fulfilled.match(result)) {
      // Persist the server-assigned draft id for subsequent saves
      const returnedId: number | undefined =
        result.payload?.data?.id ?? result.payload?.id;
      if (returnedId) setRaw((prev) => ({ ...prev, draftId: returnedId }));
      setSaveStatus("saved");
    } else {
      setSaveStatus("error");
    }

    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  // ── MANUAL SAVE ───────────────────────────────────────────────────────────
  const manualSave = useCallback(async () => {
    if (isReadOnly) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await runDraftSave(data);
  }, [data, isReadOnly]);

  // ── PUBLISH via Redux thunk ───────────────────────────────────────────────
  // Uses publishProperty thunk (POST /properties).
  // Consumes subscription quota (agent) or wallet token (owner).
  const handleSubmit = async () => {
    if (isReadOnly) return;
    setSubmitting(true);

    const result = await dispatch(
      publishProperty({ payload: toPayload(data), files: data.photoFiles })
    );

    if (publishProperty.fulfilled.match(result)) {
      setSubmitted(true);
    } else {
      const msg =
        (result.payload as string) ??
        "Failed to publish. Please try again.";
      alert(msg);
    }

    setSubmitting(false);
  };

  // ── NAVIGATION ────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step < 5) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else if (!isReadOnly) handleSubmit();
  };
  const goPrev = () => {
    if (step > 1) { setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Success onReset={() => {
        setSubmitted(false);
        setStep(1);
        setRaw(INITIAL);
        setIsReadOnly(false);
        setPropStatus("");
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
          <p style={{fontFamily:"'Playfair Display',serif"}} className="text-xl font-bold text-[#0B3C8C]">
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
          <p style={{fontFamily:"'Playfair Display',serif"}} className="text-lg font-bold text-[#0B3C8C] mb-2">
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
        @keyframes successPop  { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeStep    { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideDown   { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .fade-step  { animation: fadeStep  0.3s ease both; }
        .slide-down { animation: slideDown 0.3s ease both; }
        select { -webkit-appearance: none; }

        /* Read-only: visually dim all interactive elements inside .readonly-form */
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

        {/* ── READ-ONLY BANNER (sticky, mobile-first) ── */}
        {isReadOnly && (
          <div className={`slide-down sticky top-0 z-[60] bg-gradient-to-r ${statusUI.bg} shadow-md`}
            style={{paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
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

        {/* ── DRAFT EDITING INDICATOR (mobile-first pill bar) ── */}
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
                saveStatus === "error"  ? "bg-red-700/40 text-white" : "opacity-0 pointer-events-none"
              }`}>
                {saveStatus === "saving" ? "⏳ saving…" : saveStatus === "saved" ? "✅ saved" : saveStatus === "error" ? "⚠️ error" : "—"}
              </span>
            </div>
          </div>
        )}

        <Header step={step} saveStatus={saveStatus} onSave={manualSave} onJump={setStep} />
        <HeroStrip step={step} />

        <div className="max-w-[1200px] mx-auto px-3 md:px-5 py-5 pb-28">
          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* ── FORM PANEL ── */}
            <div className="flex-1 min-w-0">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_4px_24px_rgba(11,60,140,0.08)] p-5 md:p-7 transition-all
                ${isReadOnly
                  ? `border-2 ${statusUI.border} readonly-form`
                  : "border border-blue-100"
                }`}>
                {step === 1 && <Step1 d={data} s={set} masters={masters} />}
                {step === 2 && <Step2 d={data} s={set} masters={masters} />}
                {step === 3 && <Step3 d={data} s={set} />}
                {step === 4 && <Step4 d={data} s={set} plan={data.plan} />}
                {step === 5 && <Step5 d={data} s={set} masters={masters} />}
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 lg:sticky lg:top-[130px]">
              <Sidebar d={data} saveStatus={saveStatus} onSave={manualSave} />
            </div>
          </div>
        </div>

        {/* ── BOTTOM NAV ──────────────────────────────────────────────────────
            Read-only:  navigation only, no save/publish buttons
            Editable:   full BottomNav with save + publish/next
        ──────────────────────────────────────────────────────────────────── */}
        {isReadOnly ? (
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
            style={{paddingBottom:"env(safe-area-inset-bottom,16px)"}}>
            <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-4 py-3">

              {/* Back or "My Listings" */}
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

              {/* Step dots */}
              <div className="flex-1 flex items-center justify-center gap-1.5">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} data-nav onClick={() => setStep(s)}
                    className={`rounded-full border-none cursor-pointer transition-all ${
                      s === step
                        ? "bg-[#0B3C8C] w-5 h-2"
                        : "bg-slate-200 hover:bg-slate-300 w-2 h-2"
                    }`}
                  />
                ))}
              </div>

              {/* Next or status badge */}
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