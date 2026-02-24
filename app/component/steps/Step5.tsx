"use client";

import { Field, inp } from "../ui/Primitives";
import { Ico } from "../icons/Ico";
import { useAppSelector } from "@/store/hooks";
import { fmtPrice } from "../constants";

// Import the ID maps so we can reverse-resolve labels for the summary
import {
  CATEGORY_ID,
  SUBCATEGORY_ID,
  CONFIG_TYPE_ID,
  AMENITY_ID,
} from "@/component/Postpropertyform";

interface PublishError {
  field: string;
  msg:   string;
}

interface Step5Props {
  d: {
    propertyCategory: string;
    listingType:      string;
    bhk:              string;
    area:             string;
    country_id:       number;
    state_id:         number;
    city_id:          number;
    price:            string;
    furnishing:       string;
    photos:           string[];
    photoFiles:       File[];
    amenities:        string[];   // label strings — displayed as-is in summary
    hideNumber:       boolean;
    ownerName:        string;
    ownerPhone:       string;
  };
  s:              (k: string, v: any) => void;
  masters:        any;
  publishErrors?: PublishError[];   // validation errors from PostPropertyForm
}

export const Step5 = ({ d, s, masters, publishErrors = [] }: Step5Props) => {
  const { countries, states, cities } = useAppSelector(
    (state: any) => state.location
  );

  // ── Resolve display labels ────────────────────────────────────────────────
  const categoryName = masters?.categories?.find(
    (c: any) => c.slug === d.propertyCategory
  )?.name ?? d.propertyCategory ?? "—";

  const countryName = countries?.find((c: any) => c.id === d.country_id)?.name ?? "—";
  const stateName   = states?.find((st: any) => st.id === d.state_id)?.name   ?? "—";
  const cityName    = cities?.find((c: any) => c.id === d.city_id)?.name      ?? "—";

  // Resolve IDs for display in the "What gets sent" debug hint
  const resolvedCatId  = CATEGORY_ID[d.propertyCategory];
  const resolvedSubId  = SUBCATEGORY_ID[d.propertyCategory === "residential"
    ? d.amenities[0]  // not actually used here — just for type completeness
    : ""] ?? undefined;

  // Photo count — prefer file count (new uploads), fall back to URL count (server photos)
  const photoCount = d.photoFiles?.length > 0 ? d.photoFiles.length : d.photos.length;

  // Amenity count
  const amenityCount = (d.amenities || []).length;

  // ── Field error helper ────────────────────────────────────────────────────
  const fieldError = (field: string) =>
    publishErrors.find(e => e.field === field);

  const ErrMsg = ({ field }: { field: string }) => {
    const err = fieldError(field);
    if (!err) return null;
    return (
      <p className="text-rose-500 text-[11px] font-bold mt-1 flex items-center gap-1">
        <span>⚠️</span> {err.msg}
      </p>
    );
  };

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 5 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          Contact & Review
        </h2>
        <p className="text-slate-500 text-sm mt-2">Final step — add your contact details</p>
      </div>

      {/* ── PUBLISH ERRORS (inline, step-level) ────────────────────────────── */}
      {publishErrors.length > 0 && (
        <div className="mb-5 bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
          <p className="text-xs font-black text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>⚠️</span> Fix these before publishing
          </p>
          <ul className="space-y-1">
            {publishErrors.map((e, i) => (
              <li key={i} className="text-xs text-rose-600 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
                {e.msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── HIDE NUMBER TOGGLE ─────────────────────────────────────────────── */}
      <label className="flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer mb-5 transition-all bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-100 hover:border-blue-200">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${d.hideNumber ? "border-[#1D4ED8] bg-[#1D4ED8]" : "border-slate-300"}`}
        >
          {d.hideNumber && <Ico.Check s={11} c="white" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#0B3C8C]">Hide My Number 🔒</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Show masked number to buyers. OTP-verified calls only.
          </p>
        </div>
        <input
          type="checkbox"
          checked={d.hideNumber}
          onChange={(e) => s("hideNumber", e.target.checked)}
          className="hidden"
        />
      </label>

      {/* ── CONTACT FIELDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <Field label="Your Name" req>
            <input
              type="text"
              value={d.ownerName}
              onChange={(e) => s("ownerName", e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className={`${inp} ${fieldError("ownerName") ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`}
              style={{ fontSize: "16px" }}
            />
          </Field>
          <ErrMsg field="ownerName" />
        </div>

        <div>
          <Field label="Mobile Number" req hint="OTP verification required">
            <div className="flex gap-2">
              <span className="flex items-center gap-1 border-2 border-blue-100 bg-white rounded-2xl px-3 text-sm font-bold text-[#0B3C8C] flex-shrink-0">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                value={d.ownerPhone}
                onChange={(e) =>
                  s("ownerPhone", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit number"
                className={`${inp} flex-1 ${fieldError("ownerPhone") ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`}
                style={{ fontSize: "16px" }}
              />
            </div>
          </Field>
          <ErrMsg field="ownerPhone" />
        </div>
      </div>

      {/* ── LISTING SUMMARY CARD ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] rounded-3xl p-5 text-white">
        <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-4 flex items-center gap-2">
          <Ico.Spark /> Listing Summary
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Category",    categoryName],
            ["Listing For", d.listingType  || "—"],
            ["BHK",         d.bhk          || "—"],
            ["Area",        d.area         ? `${d.area} sq.ft` : "—"],
            ["Country",     countryName],
            ["State",       stateName],
            ["City",        cityName],
            ["Price",       d.price        ? fmtPrice(d.price) : "—"],
            ["Furnishing",  d.furnishing   || "—"],
            ["Photos",      `${photoCount} uploaded`],
          ].map(([l, v]) => (
            <div key={String(l)}>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">{l}</p>
              <p className="text-white text-sm font-bold capitalize mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Amenities */}
        {amenityCount > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">
              Amenities ({amenityCount})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {d.amenities.map((a) => (
                <span
                  key={a}
                  className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What will be sent to the API — dev hint strip */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1.5">
              API payload preview (dev only)
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {[
                ["category_id",  CATEGORY_ID[d.propertyCategory]    ?? "❌ unmapped"],
                ["photos",       `${d.photoFiles?.length ?? 0} File objects`],
                ["amenities",    amenityCount > 0
                  ? `[${d.amenities.map(a => AMENITY_ID[a] ?? `❌${a}`).join(",")}]`
                  : "[]"],
              ].map(([k, v]) => (
                <span key={String(k)} className="text-white/40 text-[9px] font-mono">
                  {k}: <span className="text-white/60">{String(v)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};