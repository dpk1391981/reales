"use client";

import { Field, SelWrap, Pill, Counter, inp } from "../ui/Primitives";
import { Ico } from "../icons/Ico";

const BHK = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const FACING_OPT = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];
const AGE_OPT = ["Under Construction", "0-1 Year", "1-5 Years", "5-10 Years", "10+ Years"];
const FURNISHING = [
  { v: "unfurnished", l: "Unfurnished", icon: "🪑" },
  { v: "semi-furnished", l: "Semi Furnished", icon: "🛋️" },
  { v: "fully-furnished", l: "Fully Furnished", icon: "🛏️" },
];

const fmtPrice = (v: string) => {
  const n = parseInt(v, 10);
  if (isNaN(n) || n === 0) return "";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

interface Step2Props {
  d: {
    propertyCategory: string;
    listingType: string;
    residentialType: string;
    commercialType: string;
    industrialType: string;
    projectName: string;
    builderName: string;
    rera: string;
    bhk: string;
    area: string;
    price: string;
    bathrooms: number;
    balconies: number;
    furnishing: string;
    deposit: string;
    maintenance: string;
    powerLoad: string;
    roadWidth: string;
    cabins: string;
    facing: string;
    age: string;
    amenities: string[];
    description: string;
    negotiable: boolean;
    urgent: boolean;
    loanAvailable: boolean;
    featured: boolean;
  };
  s: (k: string, v: any) => void;
  masters: any;
}

export const Step2 = ({ d, s, masters }: Step2Props) => {
  const categories = masters?.categories || [];
  const selectedCategory = categories.find((c: any) => c.slug === d.propertyCategory);
  const subcategories = (selectedCategory?.subcategories || []).filter((sc: any) => sc.is_active);
  const amenitiesList = (selectedCategory?.amenities || []).filter((a: any) => a.is_active);
  const subNames: string[] = subcategories.map((sc: any) => sc.name);

  const isRes = d.propertyCategory === "residential";
  const isCom = d.propertyCategory === "commercial";
  const isInd = d.propertyCategory === "industrial";
  const isPrj = d.propertyCategory === "project";
  const isPG = d.propertyCategory === "pg";
  const isRnt = d.listingType === "rent" || d.listingType === "pg";
  const amen: string[] = d.amenities || [];

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 2 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          Property Details
        </h2>
        <p className="text-slate-500 text-sm mt-2">Tell buyers exactly what you're offering</p>
      </div>

      {/* Subcategory selector — from masters */}
      {(isRes || isCom || isInd) && subNames.length > 0 && (
        <Field label="Property Type" req>
          <SelWrap
            v={isRes ? d.residentialType : isCom ? d.commercialType : d.industrialType}
            onChange={(v) => {
              if (isRes) s("residentialType", v);
              else if (isCom) s("commercialType", v);
              else s("industrialType", v);
            }}
            opts={subNames}
            ph="Select property type"
          />
        </Field>
      )}

      {isPrj && (
        <>
          <Field label="Project Name" req>
            <input type="text" value={d.projectName} onChange={(e) => s("projectName", e.target.value)}
              placeholder="e.g. DLF The Crest" className={inp} style={{ fontSize: "16px" }} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Builder Name">
              <input type="text" value={d.builderName} onChange={(e) => s("builderName", e.target.value)}
                placeholder="Builder name" className={inp} style={{ fontSize: "16px" }} />
            </Field>
            <Field label="RERA Number">
              <input type="text" value={d.rera} onChange={(e) => s("rera", e.target.value)}
                placeholder="RERA/KA/..." className={inp} style={{ fontSize: "16px" }} />
            </Field>
          </div>
        </>
      )}

      {/* BHK */}
      {(isRes || isPG) && (
        <Field label="BHK / Room Type">
          <div className="flex flex-wrap gap-2">
            {BHK.map((b) => (
              <Pill key={b} label={b} selected={d.bhk === b} onClick={() => s("bhk", b)} />
            ))}
          </div>
        </Field>
      )}

      {/* Area + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Area" req>
          <div className="relative">
            <input type="number" value={d.area} onChange={(e) => s("area", e.target.value)}
              placeholder="e.g. 1200" className={`${inp} pr-14`} style={{ fontSize: "16px" }} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">sq.ft</span>
          </div>
        </Field>
        <Field label={isRnt ? "Monthly Rent" : "Expected Price"} req>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
            <input type="number" value={d.price} onChange={(e) => s("price", e.target.value)}
              placeholder={isRnt ? "25000" : "7500000"} className={`${inp} pl-8`} style={{ fontSize: "16px" }} />
          </div>
          {d.price && <p className="text-xs font-black text-blue-600 mt-1.5 ml-1 animate-pulse">{fmtPrice(d.price)}</p>}
        </Field>
      </div>

      {/* Counters */}
      {(isRes || isPG) && (
        <div className="bg-white rounded-2xl border-2 border-blue-100 px-4 py-1 mb-4">
          <Counter label="Bathrooms" v={d.bathrooms} set={(v) => s("bathrooms", v)} min={1} max={10} />
          <Counter label="Balconies" v={d.balconies} set={(v) => s("balconies", v)} min={0} max={6} />
        </div>
      )}

      {/* Furnishing */}
      {(isRes || isPG) && (
        <Field label="Furnishing Status">
          <div className="grid grid-cols-3 gap-2">
            {FURNISHING.map((f) => (
              <button key={f.v} onClick={() => s("furnishing", f.v)}
                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border-2 font-bold text-xs text-center transition-all cursor-pointer font-[inherit] active:scale-95
                  ${d.furnishing === f.v ? "border-[#1D4ED8] bg-blue-50 text-[#1D4ED8] shadow-[0_2px_12px_rgba(29,78,216,0.12)]"
                    : "border-blue-100 bg-white text-slate-500 hover:border-blue-200"}`}
                style={{ WebkitTapHighlightColor: "transparent" }}>
                <span className="text-2xl">{f.icon}</span>{f.l}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Rent extras */}
      {isRnt && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Security Deposit">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₹</span>
              <input type="number" value={d.deposit} onChange={(e) => s("deposit", e.target.value)}
                placeholder="100000" className={`${inp} pl-8`} style={{ fontSize: "16px" }} />
            </div>
          </Field>
          <Field label="Maintenance /mo">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₹</span>
              <input type="number" value={d.maintenance} onChange={(e) => s("maintenance", e.target.value)}
                placeholder="2000" className={`${inp} pl-8`} style={{ fontSize: "16px" }} />
            </div>
          </Field>
        </div>
      )}

      {/* Industrial */}
      {isInd && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Electricity Load (KW)">
            <input type="number" value={d.powerLoad} onChange={(e) => s("powerLoad", e.target.value)}
              placeholder="200" className={inp} style={{ fontSize: "16px" }} />
          </Field>
          <Field label="Road Width (ft)">
            <input type="number" value={d.roadWidth} onChange={(e) => s("roadWidth", e.target.value)}
              placeholder="40" className={inp} style={{ fontSize: "16px" }} />
          </Field>
        </div>
      )}

      {/* Commercial */}
      {isCom && (
        <Field label="Cabins / Seats">
          <input type="text" value={d.cabins} onChange={(e) => s("cabins", e.target.value)}
            placeholder="e.g. 10 Cabins, 50 Seats" className={inp} style={{ fontSize: "16px" }} />
        </Field>
      )}

      {/* Facing + Age */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Facing">
          <SelWrap v={d.facing} onChange={(v) => s("facing", v)} opts={FACING_OPT} ph="Select" />
        </Field>
        <Field label="Property Age">
          <SelWrap v={d.age} onChange={(v) => s("age", v)} opts={AGE_OPT} ph="Select" />
        </Field>
      </div>

      {/* Amenities — from masters */}
      <Field label="Amenities" hint="Select everything that applies — more amenities = more enquiries">
        <div className="flex flex-wrap gap-2">
          {amenitiesList.map((a: any) => {
            const selected = amen.includes(a.name);
            return (
              <button key={a.id}
                onClick={() => s("amenities", selected ? amen.filter((x) => x !== a.name) : [...amen, a.name])}
                className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all cursor-pointer font-[inherit] active:scale-95
                  ${selected ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                    : "border-blue-100 bg-white text-slate-500 hover:border-emerald-300"}`}
                style={{ WebkitTapHighlightColor: "transparent" }}>
                {selected ? "✓ " : ""}{a.name}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Description */}
      <Field label="Description" hint="Properties with detailed descriptions get 3x more views">
        <textarea value={d.description} onChange={(e) => s("description", e.target.value)}
          placeholder="Describe your property — nearby landmarks, special features, why it's a great buy..."
          rows={4} className={`${inp} resize-none leading-relaxed`} style={{ fontSize: "16px" }} />
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] text-slate-400">Min 50 characters recommended</p>
          <p className={`text-[10px] font-bold ${d.description.length > 50 ? "text-emerald-500" : "text-slate-400"}`}>
            {d.description.length}/1000
          </p>
        </div>
      </Field>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { k: "negotiable", l: "Price Negotiable", icon: "💬" },
          { k: "urgent", l: "Urgent Sale / Rent", icon: "⚡" },
          { k: "loanAvailable", l: "Loan Available", icon: "🏦" },
          { k: "featured", l: "Feature This Listing", icon: "⭐" },
        ].map(({ k, l, icon }) => (
          <label key={k}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all
              ${(d as any)[k] ? "border-[#1D4ED8]/30 bg-blue-50" : "border-blue-100 bg-white hover:border-blue-200"}`}>
            <span className="text-lg flex-shrink-0">{icon}</span>
            <span className="text-sm font-semibold text-slate-700 flex-1">{l}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${(d as any)[k] ? "border-[#1D4ED8] bg-[#1D4ED8]" : "border-slate-300"}`}>
              {(d as any)[k] && <Ico.Check s={10} c="white" />}
            </div>
            <input type="checkbox" checked={(d as any)[k] || false}
              onChange={(e) => s(k, e.target.checked)} className="hidden" />
          </label>
        ))}
      </div>
    </div>
  );
};