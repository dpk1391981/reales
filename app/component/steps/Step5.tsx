"use client";

import { Field, inp } from "../ui/Primitives";
import { Ico } from "../icons/Ico";
import { useAppSelector } from "@/store/hooks";
import { fmtPrice } from "../constants";

interface Step5Props {
  d: {
    propertyCategory: string;
    listingType: string;
    bhk: string;
    area: string;
    country_id: number;
    state_id: number;
    city_id: number;
    price: string;
    furnishing: string;
    photos: string[];
    amenities: string[];
    hideNumber: boolean;
    ownerName: string;
    ownerPhone: string;
  };
  s: (k: string, v: any) => void;
  masters: any;
}

export const Step5 = ({ d, s, masters }: Step5Props) => {
  const { countries, states, cities } = useAppSelector((state: any) => state.location);

  const categoryName = masters?.categories?.find((c: any) => c.slug === d.propertyCategory)?.name || "—";
  const countryName  = countries?.find((c: any) => c.id === d.country_id)?.name || "—";
  const stateName    = states?.find((st: any) => st.id === d.state_id)?.name    || "—";
  const cityName     = cities?.find((c: any) => c.id === d.city_id)?.name       || "—";

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 5 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          Contact & Review
        </h2>
        <p className="text-slate-500 text-sm mt-2">Final step — add your contact details</p>
      </div>

      {/* Hide number toggle */}
      <label className="flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer mb-5 transition-all bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-100 hover:border-blue-200">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${d.hideNumber ? "border-[#1D4ED8] bg-[#1D4ED8]" : "border-slate-300"}`}>
          {d.hideNumber && <Ico.Check s={11} c="white" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#0B3C8C]">Hide My Number 🔒</p>
          <p className="text-xs text-slate-500 mt-0.5">Show masked number to buyers. OTP verified calls only.</p>
        </div>
        <input type="checkbox" checked={d.hideNumber} onChange={(e) => s("hideNumber", e.target.checked)} className="hidden" />
      </label>

      {/* Contact fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Field label="Your Name" req>
          <input type="text" value={d.ownerName} onChange={(e) => s("ownerName", e.target.value)}
            placeholder="e.g. Rajesh Kumar" className={inp} style={{ fontSize: "16px" }} />
        </Field>
        <Field label="Mobile Number" req hint="OTP verification required">
          <div className="flex gap-2">
            <span className="flex items-center gap-1 border-2 border-blue-100 bg-white rounded-2xl px-3 text-sm font-bold text-[#0B3C8C] flex-shrink-0">
              🇮🇳 +91
            </span>
            <input type="tel" value={d.ownerPhone}
              onChange={(e) => s("ownerPhone", e.target.value.replace(/\D/, "").slice(0, 10))}
              placeholder="10-digit number" className={`${inp} flex-1`} style={{ fontSize: "16px" }} />
          </div>
        </Field>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] rounded-3xl p-5 text-white">
        <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-4 flex items-center gap-2">
          <Ico.Spark /> Listing Summary
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Category",   categoryName],
            ["Listing For", d.listingType || "—"],
            ["BHK",        d.bhk         || "—"],
            ["Area",       d.area        ? `${d.area} sq.ft` : "—"],
            ["Country",    countryName],
            ["State",      stateName],
            ["City",       cityName],
            ["Price",      d.price       ? fmtPrice(d.price) : "—"],
            ["Furnishing", d.furnishing  || "—"],
            ["Photos",     `${(d.photos || []).length} uploaded`],
          ].map(([l, v]) => (
            <div key={String(l)}>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">{l}</p>
              <p className="text-white text-sm font-bold capitalize mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        {(d.amenities || []).length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {d.amenities.map((a) => (
                <span key={a} className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};