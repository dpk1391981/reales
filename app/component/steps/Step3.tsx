"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchStates, fetchCities, fetchLocalities } from "@/store/slices/locationSlice";
import { Field, inp } from "../ui/Primitives";
import { Ico } from "../icons/Ico";

interface Step3Props {
  d: {
    country_id: number;
    state_id:   number;
    city_id:    number;
    locality_id: number;  // 0 when free-text / not selected from dropdown
    locality:   string;   // free-text value OR name of selected locality
    address:    string;   // new optional full address line
    society:    string;
    pincode:    string;
  };
  s: (k: string, v: any) => void;
}

export const Step3 = ({ d, s }: Step3Props) => {
  const dispatch = useAppDispatch();
  const {
    countries,
    states,
    cities,
    localities,
    loadingStates,
    loadingCities,
    loadingLocalities,
  } = useAppSelector((state: any) => state.location);

  // ── Cascade data loading ────────────────────────────────────────────────
  useEffect(() => { if (d.country_id) dispatch(fetchStates(d.country_id)); },  [d.country_id]);
  useEffect(() => { if (d.state_id)   dispatch(fetchCities(d.state_id)); },    [d.state_id]);
  useEffect(() => { if (d.city_id)    dispatch(fetchLocalities(d.city_id)); }, [d.city_id]);

  // ── Cascade reset handlers ──────────────────────────────────────────────
  const handleCountry = (val: string) => {
    s("country_id",  Number(val));
    s("state_id",    0);
    s("city_id",     0);
    s("locality_id", 0);
    s("locality",    "");
  };

  const handleState = (val: string) => {
    s("state_id",    Number(val));
    s("city_id",     0);
    s("locality_id", 0);
    s("locality",    "");
  };

  const handleCity = (val: string) => {
    s("city_id",     Number(val));
    s("locality_id", 0);
    s("locality",    "");
  };

  // ── Locality handlers ────────────────────────────────────────────────────
  // When user picks from dropdown: store both the integer ID and the name.
  const handleLocalitySelect = (optionValue: string) => {
    // optionValue is the locality id (string from <option value={l.id}>)
    const id = Number(optionValue);
    if (!id) {
      // User selected the placeholder "Select Locality"
      s("locality_id", 0);
      s("locality",    "");
      return;
    }
    const found = localities.find((l: any) => l.id === id);
    s("locality_id", id);
    s("locality",    found?.name ?? "");
  };

  // When user types free-text: locality_id stays 0, locality holds the text.
  // The backend receives locality_id=undefined (omitted) and locality=text for the draft.
  // For publish, PostPropertyForm validates locality_id > 0 OR allows free-text
  // by passing it as locality text field (your DTO should accept it as optional).
  const handleLocalityText = (text: string) => {
    s("locality_id", 0);     // explicitly 0 = "not from DB"
    s("locality",    text);
  };

  // Whether the locality API returned results for the chosen city
  const hasApiLocalities = localities.length > 0;

  // ── Styles ───────────────────────────────────────────────────────────────
  const selCls = (disabled?: boolean) =>
    `w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-medium text-[#0B3C8C]
     focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none pr-10
     ${disabled
       ? "border-blue-50 opacity-50 cursor-not-allowed"
       : "border-blue-100 focus:border-blue-400 cursor-pointer"}`;

  const SpinnerOrChev = ({ loading }: { loading: boolean }) =>
    loading ? (
      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    ) : (
      <Ico.ChevD />
    );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 3 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          Location Details
        </h2>
        <p className="text-slate-500 text-sm mt-2">Help buyers find your property easily</p>
      </div>

      {/* ── Country ────────────────────────────────────────────────────────── */}
      <Field label="Country" req>
        <div className="relative">
          <select
            value={d.country_id || ""}
            onChange={(e) => handleCountry(e.target.value)}
            className={selCls()}
            style={{ fontSize: "16px" }}
          >
            <option value="">Select Country</option>
            {(countries || []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
            <Ico.ChevD />
          </span>
        </div>
      </Field>

      {/* ── State ──────────────────────────────────────────────────────────── */}
      <Field label="State" req>
        <div className="relative">
          <select
            value={d.state_id || ""}
            onChange={(e) => handleState(e.target.value)}
            disabled={!d.country_id || loadingStates}
            className={selCls(!d.country_id || loadingStates)}
            style={{ fontSize: "16px" }}
          >
            <option value="">{loadingStates ? "Loading states…" : "Select State"}</option>
            {(states || []).map((st: any) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
            <SpinnerOrChev loading={loadingStates} />
          </span>
        </div>
      </Field>

      {/* ── City ───────────────────────────────────────────────────────────── */}
      <Field label="City" req>
        <div className="relative">
          <select
            value={d.city_id || ""}
            onChange={(e) => handleCity(e.target.value)}
            disabled={!d.state_id || loadingCities}
            className={selCls(!d.state_id || loadingCities)}
            style={{ fontSize: "16px" }}
          >
            <option value="">{loadingCities ? "Loading cities…" : "Select City"}</option>
            {(cities || []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
            <SpinnerOrChev loading={loadingCities} />
          </span>
        </div>
      </Field>

      {/* ── Locality ───────────────────────────────────────────────────────── */}
      {/* Two modes:
            1. API returned localities for the city   → show dropdown, store locality_id + locality name
            2. No API localities (or city not picked) → show free-text input, locality_id = 0, locality = typed text
          Backend:
            • Draft:   locality_id omitted (0 becomes undefined in toPayload), locality text sent
            • Publish: PostPropertyForm validation warns if locality_id === 0 BUT still allows
                       the free-text path by passing locality as a text field if you loosen the DTO
      ─────────────────────────────────────────────────────────────────────── */}
      <Field
        label="Locality / Sector"
        req
        hint={
          hasApiLocalities
            ? "Select from the list, or clear to type your own"
            : "Be specific — 'Sector 54 Gurgaon' beats just 'Gurgaon'"
        }
      >
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 z-10 pointer-events-none">
            <Ico.Map />
          </span>

          {/* ── DROPDOWN MODE: API returned localities ── */}
          {hasApiLocalities && !loadingLocalities ? (
            <>
              <select
                value={d.locality_id || ""}
                onChange={(e) => handleLocalitySelect(e.target.value)}
                className={`${selCls()} pl-9`}
                style={{ fontSize: "16px" }}
              >
                <option value="">Select Locality</option>
                {localities.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                <Ico.ChevD />
              </span>

              {/* Allow override with free text */}
              {d.locality_id === 0 && d.city_id > 0 && (
                <p className="text-[11px] text-blue-500 font-semibold mt-1.5 ml-1">
                  Can't find your locality?{" "}
                  <button
                    type="button"
                    className="underline cursor-pointer bg-transparent border-none font-[inherit] text-[#1D4ED8]"
                    onClick={() => {
                      // Collapse dropdown mode by clearing localities via a dummy search
                      // We just switch to free-text by setting locality_id = 0
                      s("locality_id", 0);
                      s("locality", "");
                    }}
                  >
                    Type it manually
                  </button>
                </p>
              )}
            </>
          ) : loadingLocalities ? (
            /* ── LOADING SPINNER ── */
            <div className={`${selCls(true)} pl-9 flex items-center gap-2`}>
              <svg className="animate-spin w-3.5 h-3.5 text-blue-400 ml-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-sm text-slate-400">Loading localities…</span>
            </div>
          ) : (
            /* ── FREE-TEXT MODE: no API localities or city not selected ── */
            <>
              <input
                type="text"
                value={d.locality}
                onChange={(e) => handleLocalityText(e.target.value)}
                placeholder="e.g. Sector 62, Whitefield, Bandra West"
                className={`${inp} pl-9`}
                style={{ fontSize: "16px" }}
              />
              {/* Badge showing this will be stored as free text */}
              {d.locality && d.locality_id === 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                  custom
                </span>
              )}
            </>
          )}
        </div>
      </Field>

      {/* ── Society / Project Name ─────────────────────────────────────────── */}
      <Field label="Society / Project Name">
        <input
          type="text"
          value={d.society}
          onChange={(e) => s("society", e.target.value)}
          placeholder="e.g. DLF The Crest, Prestige Shantiniketan"
          className={inp}
          style={{ fontSize: "16px" }}
        />
      </Field>

      {/* ── Pincode + Map button ───────────────────────────────────────────── */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Field label="Pin Code" req>
            <input
              type="number"
              value={d.pincode}
              onChange={(e) => s("pincode", e.target.value.slice(0, 6))}
              placeholder="e.g. 201301"
              className={inp}
              style={{ fontSize: "16px" }}
            />
          </Field>
        </div>
        <div className="mb-4">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-xs font-bold rounded-2xl border-none cursor-pointer active:scale-95 transition-all whitespace-nowrap shadow-[0_4px_16px_rgba(29,78,216,0.2)]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Ico.Map /> Set on Map
          </button>
        </div>
      </div>

      {/* ── Address (optional full address line) ─────────────────────────── */}
      <Field
        label="Full Address"
        hint="Optional — flat/floor no., building name, street"
      >
        <textarea
          value={d.address || ""}
          onChange={(e) => s("address", e.target.value)}
          placeholder="e.g. Flat 4B, Tower 2, DLF Phase 5, Golf Course Road"
          rows={2}
          className={`${inp} resize-none leading-relaxed`}
          style={{ fontSize: "16px" }}
        />
      </Field>

      {/* ── Map placeholder ────────────────────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 h-40 flex flex-col items-center justify-center gap-2">
        <span className="text-4xl">🗺️</span>
        <p className="text-sm font-semibold text-blue-600">Tap "Set on Map" to pin exact location</p>
        <p className="text-xs text-slate-400">Properties with map pins get 2× more clicks</p>
      </div>
    </div>
  );
};