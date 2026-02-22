"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchStates, fetchCities, fetchLocalities } from "@/store/slices/locationSlice";
import { Field, inp } from "../ui/Primitives";
import { Ico } from "../icons/Ico";

interface Step3Props {
  d: {
    country_id: number;
    state_id: number;
    city_id: number;
    locality: string;
    society: string;
    pincode: string;
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

  // Load states when country changes (country_id=1 India is default on mount)
  useEffect(() => {
    if (d.country_id) dispatch(fetchStates(d.country_id));
  }, [d.country_id]);

  // Load cities when state changes
  useEffect(() => {
    if (d.state_id) dispatch(fetchCities(d.state_id));
  }, [d.state_id]);

  // Load localities when city changes
  useEffect(() => {
    if (d.city_id) dispatch(fetchLocalities(d.city_id));
  }, [d.city_id]);

  // Cascade reset on parent change
  const handleCountry = (val: string) => {
    s("country_id", Number(val));
    s("state_id", 0);
    s("city_id", 0);
    s("locality", "");
  };

  const handleState = (val: string) => {
    s("state_id", Number(val));
    s("city_id", 0);
    s("locality", "");
  };

  const handleCity = (val: string) => {
    s("city_id", Number(val));
    s("locality", "");
  };

  // Shared select className
  const selCls = (disabled?: boolean) =>
    `w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-medium text-[#0B3C8C] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none pr-10
    ${disabled ? "border-blue-50 opacity-50 cursor-not-allowed" : "border-blue-100 focus:border-blue-400 cursor-pointer"}`;

  const SpinnerOrChev = ({ loading }: { loading: boolean }) =>
    loading ? (
      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    ) : (
      <Ico.ChevD />
    );

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 3 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          Location Details
        </h2>
        <p className="text-slate-500 text-sm mt-2">Help buyers find your property easily</p>
      </div>

      {/* Country */}
      <Field label="Country" req>
        <div className="relative">
          <select
            value={d.country_id || ""}
            onChange={(e) => handleCountry(e.target.value)}
            className={selCls()}
            style={{ fontSize: "16px" }}
          >
            <option value="">Select Country</option>
            {countries.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
            <Ico.ChevD />
          </span>
        </div>
      </Field>

      {/* State */}
      <Field label="State" req>
        <div className="relative">
          <select
            value={d.state_id || ""}
            onChange={(e) => handleState(e.target.value)}
            disabled={!d.country_id || loadingStates}
            className={selCls(!d.country_id || loadingStates)}
            style={{ fontSize: "16px" }}
          >
            <option value="">{loadingStates ? "Loading states..." : "Select State"}</option>
            {states.map((st: any) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
            <SpinnerOrChev loading={loadingStates} />
          </span>
        </div>
      </Field>

      {/* City */}
      <Field label="City" req>
        <div className="relative">
          <select
            value={d.city_id || ""}
            onChange={(e) => handleCity(e.target.value)}
            disabled={!d.state_id || loadingCities}
            className={selCls(!d.state_id || loadingCities)}
            style={{ fontSize: "16px" }}
          >
            <option value="">{loadingCities ? "Loading cities..." : "Select City"}</option>
            {cities.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
            <SpinnerOrChev loading={loadingCities} />
          </span>
        </div>
      </Field>

      {/* Locality — dropdown if API returned list, free-text fallback */}
      <Field label="Locality / Sector" req hint="Be specific — 'Sector 54 Gurgaon' beats just 'Gurgaon'">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 z-10">
            <Ico.Map />
          </span>
          {localities.length > 0 ? (
            <>
              <select
                value={d.locality}
                onChange={(e) => s("locality", e.target.value)}
                disabled={loadingLocalities}
                className={`${selCls(loadingLocalities)} pl-9`}
                style={{ fontSize: "16px" }}
              >
                <option value="">{loadingLocalities ? "Loading..." : "Select Locality"}</option>
                {localities.map((l: any) => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                <SpinnerOrChev loading={loadingLocalities} />
              </span>
            </>
          ) : (
            <input
              type="text"
              value={d.locality}
              onChange={(e) => s("locality", e.target.value)}
              placeholder="e.g. Sector 62, Whitefield, Bandra West"
              className={`${inp} pl-9`}
              style={{ fontSize: "16px" }}
            />
          )}
        </div>
      </Field>

      {/* Society */}
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

      {/* Pincode + Map button */}
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
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-xs font-bold rounded-2xl border-none cursor-pointer active:scale-95 transition-all whitespace-nowrap shadow-[0_4px_16px_rgba(29,78,216,0.2)]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Ico.Map /> Set on Map
          </button>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="rounded-3xl overflow-hidden border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 h-40 flex flex-col items-center justify-center gap-2 mb-4">
        <span className="text-4xl">🗺️</span>
        <p className="text-sm font-semibold text-blue-600">Tap "Set on Map" to pin your exact location</p>
        <p className="text-xs text-slate-400">Properties with map pins get 2x more clicks</p>
      </div>
    </div>
  );
};