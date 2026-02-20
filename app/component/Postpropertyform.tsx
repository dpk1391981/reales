"use client";

import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: "residential", label: "Residential", icon: "🏠" },
  { value: "commercial", label: "Commercial", icon: "🏢" },
  { value: "industrial", label: "Industrial", icon: "🏭" },
  { value: "pg", label: "PG / Co-living", icon: "🛏️" },
  { value: "project", label: "New Project (Builder)", icon: "🏗️" },
];

const LISTING_TYPES = [
  { value: "sell", label: "Sell", icon: "📈" },
  { value: "rent", label: "Rent / Lease", icon: "🔑" },
  { value: "pg", label: "PG", icon: "🛏️" },
];

const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

const FURNISHING = [
  { value: "unfurnished", label: "Unfurnished", icon: "🪑" },
  { value: "semi-furnished", label: "Semi Furnished", icon: "🛋️" },
  { value: "fully-furnished", label: "Fully Furnished", icon: "🛏️" },
];

const AMENITIES = [
  "Lift",
  "Parking",
  "Power Backup",
  "Security",
  "Gymnasium",
  "Swimming Pool",
  "Club House",
  "Garden / Park",
  "Gated Society",
  "CCTV",
  "Intercom",
  "Visitor Parking",
];

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Noida",
  "Gurgaon",
];

const FACING = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const STEPS = [
  { id: 1, label: "Property", icon: "🏠" },
  { id: 2, label: "Location", icon: "📍" },
  { id: 3, label: "Details", icon: "📋" },
  { id: 4, label: "Pricing", icon: "₹" },
  { id: 5, label: "Photos", icon: "📸" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronRight = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ChevronLeft = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    stroke="white"
    strokeWidth="3"
    viewBox="0 0 24 24"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const UploadIcon = () => (
  <svg
    width="28"
    height="28"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M5 12h14" />
  </svg>
);

// ─── Reusable primitives ──────────────────────────────────────────────────────

const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

const inputCls =
  "w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-[#0f2342] bg-slate-50 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all font-[DM_Sans,sans-serif] placeholder-slate-400";

const Counter = ({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex items-center gap-0 border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50 w-fit">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100
        active:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <MinusIcon />
    </button>
    <span className="w-10 text-center text-sm font-bold text-[#0f2342]">
      {value}
    </span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100
        active:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <PlusIcon />
    </button>
  </div>
);

const OptionPill = ({
  label,
  selected,
  onClick,
  icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border-2 text-sm font-semibold
      transition-all cursor-pointer font-[inherit] active:scale-95 whitespace-nowrap
      ${
        selected
          ? "border-[#0f2342] bg-[#0f2342] text-white shadow-[0_4px_12px_rgba(15,35,66,0.25)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    style={{ WebkitTapHighlightColor: "transparent" }}
  >
    {icon && <span className="text-base leading-none">{icon}</span>}
    {label}
  </button>
);

const SectionCard = ({
  title,
  children,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div
    className="bg-white rounded-3xl border border-slate-100
    shadow-[0_2px_16px_rgba(15,35,66,0.06)] p-5 mb-4"
  >
    <p className="text-base font-bold text-[#0f2342] mb-0.5">{title}</p>
    {hint && <p className="text-xs text-slate-400 mb-4">{hint}</p>}
    {!hint && <div className="mb-4" />}
    {children}
  </div>
);

// ─── Step 1 — Property Basics ─────────────────────────────────────────────────

const Step1 = ({
  data,
  setData,
}: {
  data: any;
  setData: (k: string, v: any) => void;
}) => (
  <>
    <SectionCard title="Property Type" hint="Choose the type of property">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PROPERTY_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setData("propertyType", t.value)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border-2 font-semibold
              text-sm transition-all cursor-pointer font-[inherit] active:scale-95
              ${
                data.propertyType === t.value
                  ? "border-[#0f2342] bg-[#0f2342]/5 text-[#0f2342]"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </SectionCard>

    {data.propertyType === "residential" && (
      <SectionCard title="Residential Type">
        <div className="flex flex-wrap gap-2">
          {[
            "Flat / Apartment",
            "Independent House",
            "Villa",
            "Builder Floor",
            "Residential Plot",
            "Farm House",
          ].map((type) => (
            <OptionPill
              key={type}
              label={type}
              selected={data.residentialType === type}
              onClick={() => setData("residentialType", type)}
            />
          ))}
        </div>
      </SectionCard>
    )}
    <SectionCard
      title="What are you listing?"
      hint="Select what best describes your property"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LISTING_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setData("listingType", t.value)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border-2 font-semibold
              text-sm transition-all cursor-pointer font-[inherit] active:scale-95
              ${
                data.listingType === t.value
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </SectionCard>

    {(data.propertyType === "flat" ||
      data.propertyType === "house" ||
      data.propertyType === "villa") && (
      <SectionCard title="BHK / Configuration">
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((b) => (
            <OptionPill
              key={b}
              label={b}
              selected={data.bhk === b}
              onClick={() => setData("bhk", b)}
            />
          ))}
        </div>
      </SectionCard>
    )}
  </>
);

// ─── Step 2 — Location ────────────────────────────────────────────────────────

const Step2 = ({
  data,
  setData,
}: {
  data: any;
  setData: (k: string, v: any) => void;
}) => (
  <>
    <SectionCard
      title="City"
      hint="Select the city where your property is located"
    >
      <div className="flex flex-wrap gap-2">
        {CITIES.map((c) => (
          <OptionPill
            key={c}
            label={c}
            selected={data.city === c}
            onClick={() => setData("city", c)}
          />
        ))}
      </div>
    </SectionCard>

    <SectionCard title="Address Details">
      <div className="mb-3">
        <Label required>Society / Project Name</Label>
        <input
          type="text"
          value={data.society || ""}
          onChange={(e) => setData("society", e.target.value)}
          placeholder="e.g. DLF The Crest, Prestige Shantiniketan"
          className={inputCls}
          style={{ fontSize: "16px" }}
        />
      </div>
      <div className="mb-3">
        <Label required>Locality / Area</Label>
        <input
          type="text"
          value={data.locality || ""}
          onChange={(e) => setData("locality", e.target.value)}
          placeholder="e.g. Sector 54, Whitefield"
          className={inputCls}
          style={{ fontSize: "16px" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Flat / House No.</Label>
          <input
            type="text"
            value={data.flatNo || ""}
            onChange={(e) => setData("flatNo", e.target.value)}
            placeholder="e.g. B-204"
            className={inputCls}
            style={{ fontSize: "16px" }}
          />
        </div>
        <div>
          <Label>Floor No.</Label>
          <input
            type="number"
            value={data.floor || ""}
            onChange={(e) => setData("floor", e.target.value)}
            placeholder="e.g. 5"
            className={inputCls}
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Pin Code">
      <Label required>Area Pin Code</Label>
      <input
        type="number"
        value={data.pincode || ""}
        onChange={(e) => setData("pincode", e.target.value)}
        placeholder="e.g. 110001"
        maxLength={6}
        className={inputCls}
        style={{ fontSize: "16px" }}
      />
    </SectionCard>
  </>
);

// ─── Step 3 — Property Details ────────────────────────────────────────────────

const Step3 = ({
  data,
  setData,
}: {
  data: any;
  setData: (k: string, v: any) => void;
}) => (
  <>
    {data.propertyType === "commercial" && (
      <SectionCard title="Commercial Details">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Property Type</Label>
            <select
              value={data.commercialType || ""}
              onChange={(e) => setData("commercialType", e.target.value)}
              className={inputCls}
            >
              <option value="">Select</option>
              <option>Office Space</option>
              <option>IT Park</option>
              <option>Shop</option>
              <option>Showroom</option>
              <option>Warehouse</option>
              <option>Co-working Space</option>
            </select>
          </div>
          <div>
            <Label>Cabin / Seats</Label>
            <input
              type="text"
              value={data.cabins || ""}
              onChange={(e) => setData("cabins", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>
    )}

    {data.propertyType === "industrial" && (
      <SectionCard title="Industrial Details">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Electricity Load (KW)</Label>
            <input
              type="number"
              value={data.powerLoad || ""}
              onChange={(e) => setData("powerLoad", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <Label>Road Width (ft)</Label>
            <input
              type="number"
              value={data.roadWidth || ""}
              onChange={(e) => setData("roadWidth", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>
    )}

    {data.propertyType === "industrial" && (
      <SectionCard title="Industrial Details">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Electricity Load (KW)</Label>
            <input
              type="number"
              value={data.powerLoad || ""}
              onChange={(e) => setData("powerLoad", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <Label>Road Width (ft)</Label>
            <input
              type="number"
              value={data.roadWidth || ""}
              onChange={(e) => setData("roadWidth", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>
    )}

    {data.propertyType === "project" && (
      <SectionCard title="Project Details">
        <div className="mb-3">
          <Label>Project Name</Label>
          <input
            type="text"
            value={data.projectName || ""}
            onChange={(e) => setData("projectName", e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="mb-3">
          <Label>Builder Name</Label>
          <input
            type="text"
            value={data.builderName || ""}
            onChange={(e) => setData("builderName", e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <Label>RERA Number</Label>
          <input
            type="text"
            value={data.rera || ""}
            onChange={(e) => setData("rera", e.target.value)}
            className={inputCls}
          />
        </div>
      </SectionCard>
    )}
    <SectionCard title="Area / Size">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Built-up Area</Label>
          <div className="relative">
            <input
              type="number"
              value={data.builtArea || ""}
              onChange={(e) => setData("builtArea", e.target.value)}
              placeholder="e.g. 1200"
              className={`${inputCls} pr-14`}
              style={{ fontSize: "16px" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              sq.ft
            </span>
          </div>
        </div>
        <div>
          <Label>Carpet Area</Label>
          <div className="relative">
            <input
              type="number"
              value={data.carpetArea || ""}
              onChange={(e) => setData("carpetArea", e.target.value)}
              placeholder="e.g. 950"
              className={`${inputCls} pr-14`}
              style={{ fontSize: "16px" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              sq.ft
            </span>
          </div>
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Bathrooms & Balconies">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Bathrooms</Label>
          <Counter
            value={data.bathrooms || 1}
            onChange={(v) => setData("bathrooms", v)}
            min={1}
            max={10}
          />
        </div>
        <div>
          <Label>Balconies</Label>
          <Counter
            value={data.balconies || 0}
            onChange={(v) => setData("balconies", v)}
            min={0}
            max={6}
          />
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Furnishing Status">
      <div className="grid grid-cols-3 gap-2">
        {FURNISHING.map((f) => (
          <button
            key={f.value}
            onClick={() => setData("furnishing", f.value)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2
              font-semibold text-xs transition-all cursor-pointer font-[inherit] active:scale-95 text-center
              ${
                data.furnishing === f.value
                  ? "border-[#0f2342] bg-[#0f2342]/5 text-[#0f2342]"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-2xl">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>
    </SectionCard>

    <SectionCard title="Other Details">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label>Facing</Label>
          <select
            value={data.facing || ""}
            onChange={(e) => setData("facing", e.target.value)}
            className={inputCls}
            style={{ fontSize: "16px" }}
          >
            <option value="">Select</option>
            {FACING.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Total Floors</Label>
          <input
            type="number"
            value={data.totalFloors || ""}
            onChange={(e) => setData("totalFloors", e.target.value)}
            placeholder="e.g. 12"
            className={inputCls}
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>
      <div className="mb-3">
        <Label>Property Age</Label>
        <select
          value={data.age || ""}
          onChange={(e) => setData("age", e.target.value)}
          className={inputCls}
          style={{ fontSize: "16px" }}
        >
          <option value="">Select</option>
          <option>Under Construction</option>
          <option>0-1 Year</option>
          <option>1-5 Years</option>
          <option>5-10 Years</option>
          <option>10+ Years</option>
        </select>
      </div>
      <div>
        <Label>Availability</Label>
        <select
          value={data.availability || ""}
          onChange={(e) => setData("availability", e.target.value)}
          className={inputCls}
          style={{ fontSize: "16px" }}
        >
          <option value="">Select</option>
          <option>Ready to Move</option>
          <option>Within 3 Months</option>
          <option>Within 6 Months</option>
          <option>After 6 Months</option>
        </select>
      </div>
    </SectionCard>

    <SectionCard title="Amenities" hint="Select all that apply">
      <div className="flex flex-wrap gap-2">
        {AMENITIES.map((a) => {
          const selected = (data.amenities || []).includes(a);
          return (
            <button
              key={a}
              onClick={() => {
                const prev = data.amenities || [];
                setData(
                  "amenities",
                  selected ? prev.filter((x: string) => x !== a) : [...prev, a],
                );
              }}
              className={`px-3.5 py-2 rounded-full border-2 text-xs font-semibold
                transition-all cursor-pointer font-[inherit] active:scale-95
                ${
                  selected
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {selected && "✓ "}
              {a}
            </button>
          );
        })}
      </div>
    </SectionCard>
  </>
);

// ─── Step 4 — Pricing ─────────────────────────────────────────────────────────

const Step4 = ({
  data,
  setData,
}: {
  data: any;
  setData: (k: string, v: any) => void;
}) => {
  const isRent = data.listingType === "rent" || data.listingType === "pg";

  const formatPrice = (v: string) => {
    const n = parseInt(v.replace(/,/g, ""), 10);
    if (isNaN(n)) return "";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  return (
    <>
      <SectionCard title={isRent ? "Rent Details" : "Sale Price"}>
        <div className="mb-3">
          <Label required>{isRent ? "Monthly Rent" : "Expected Price"}</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              value={data.price || ""}
              onChange={(e) => setData("price", e.target.value)}
              placeholder={isRent ? "e.g. 25000" : "e.g. 7500000"}
              className={`${inputCls} pl-8`}
              style={{ fontSize: "16px" }}
            />
          </div>
          {data.price && (
            <p className="text-sm font-bold text-amber-600 mt-1.5 ml-1">
              {formatPrice(String(data.price))}
            </p>
          )}
        </div>

        {!isRent && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <input
              id="negotiable"
              type="checkbox"
              checked={data.negotiable || false}
              onChange={(e) => setData("negotiable", e.target.checked)}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
            <label
              htmlFor="negotiable"
              className="text-sm font-medium text-slate-600 cursor-pointer"
            >
              Price is Negotiable
            </label>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Professional Options">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.featured || false}
              onChange={(e) => setData("featured", e.target.checked)}
            />
            Featured Listing (Paid Boost)
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.urgent || false}
              onChange={(e) => setData("urgent", e.target.checked)}
            />
            Mark as Urgent
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.loanAvailable || false}
              onChange={(e) => setData("loanAvailable", e.target.checked)}
            />
            Loan Facility Available
          </label>
        </div>
      </SectionCard>

      {isRent && (
        <SectionCard title="Deposit & Extras">
          <div className="mb-3">
            <Label>Security Deposit</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                value={data.deposit || ""}
                onChange={(e) => setData("deposit", e.target.value)}
                placeholder="e.g. 100000"
                className={`${inputCls} pl-8`}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
          <div>
            <Label>Maintenance Charges (monthly)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                value={data.maintenance || ""}
                onChange={(e) => setData("maintenance", e.target.value)}
                placeholder="e.g. 2000"
                className={`${inputCls} pl-8`}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Description"
        hint="Describe your property to attract more buyers"
      >
        <textarea
          value={data.description || ""}
          onChange={(e) => setData("description", e.target.value)}
          placeholder="Describe key features, nearby landmarks, special highlights..."
          rows={4}
          className={`${inputCls} resize-none`}
          style={{ fontSize: "16px" }}
        />
        <p className="text-right text-[10px] text-slate-400 mt-1">
          {(data.description || "").length} / 1000
        </p>
      </SectionCard>

      <SectionCard title="Owner / Contact">
        <div className="mb-3">
          <Label required>Your Name</Label>
          <input
            type="text"
            value={data.ownerName || ""}
            onChange={(e) => setData("ownerName", e.target.value)}
            placeholder="Full name"
            className={inputCls}
            style={{ fontSize: "16px" }}
          />
        </div>
        <div>
          <Label required>Mobile Number</Label>
          <div className="flex gap-2">
            <span
              className="flex items-center gap-1 border-2 border-slate-200 bg-slate-50
              rounded-2xl px-3 text-sm font-semibold text-[#0f2342] flex-shrink-0"
            >
              🇮🇳 +91
            </span>
            <input
              type="tel"
              value={data.ownerPhone || ""}
              onChange={(e) =>
                setData(
                  "ownerPhone",
                  e.target.value.replace(/\D/, "").slice(0, 10),
                )
              }
              placeholder="10-digit number"
              className={`${inputCls} flex-1`}
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
};

// ─── Step 5 — Photos ──────────────────────────────────────────────────────────

const Step5 = ({
  data,
  setData,
  plan,
}: {
  data: any;
  setData: (k: string, v: any) => void;
  plan: "free" | "paid";
}) => {
  const photos: string[] = data.photos || [];
  const maxPhotos = plan === "free" ? 5 : 25;

  const handleFile = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(
      (f) => f.size <= 10 * 1024 * 1024,
    );

    if (photos.length + validFiles.length > maxPhotos) {
      alert(`Max ${maxPhotos} photos allowed in ${plan.toUpperCase()} plan`);
      return;
    }

    const urls = validFiles.map((f) => URL.createObjectURL(f));
    setData("photos", [...photos, ...urls]);
  };

  return (
    <>
      <SectionCard
        title="Upload Photos"
        hint={`Max ${maxPhotos} photos · JPG/PNG · 10MB each`}
      >
        {/* Drag & Drop */}
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files);
          }}
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed
          border-amber-300 rounded-2xl p-8 bg-amber-50 cursor-pointer
          hover:bg-amber-100 transition-colors mb-4 text-center"
        >
          <UploadIcon />
          <p className="text-sm font-bold text-[#0f2342]">
            Drag & Drop or Tap to Upload
          </p>
          <span className="px-5 py-2 bg-[#0f2342] text-white text-xs font-bold rounded-xl">
            Choose Photos
          </span>

          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
        </label>

        {/* Preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-2xl overflow-hidden group border"
              >
                <img src={url} className="w-full h-full object-cover" />

                {/* Remove */}
                <button
                  onClick={() =>
                    setData(
                      "photos",
                      photos.filter((_, j) => j !== i),
                    )
                  }
                  className="absolute top-1 right-1 w-6 h-6 rounded-full
                  bg-black/60 text-white text-xs flex items-center justify-center"
                >
                  ✕
                </button>

                {/* Cover */}
                {i === 0 && (
                  <span
                    className="absolute bottom-1 left-1 text-[9px] font-bold
                  bg-amber-400 text-[#0f2342] px-2 py-0.5 rounded-full"
                  >
                    Cover
                  </span>
                )}

                {/* Paid badge */}
                {plan === "paid" && (
                  <span
                    className="absolute top-1 left-1 text-[9px]
                  bg-emerald-500 text-white px-2 py-0.5 rounded-full"
                  >
                    HD Boost
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Plan Info */}
        <div className="mt-4 text-xs text-slate-500">
          {plan === "free"
            ? "Free listings appear normally in search results."
            : "Paid listings get priority ranking + HD visibility."}
        </div>
      </SectionCard>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PostPropertyForm() {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<"free" | "paid">("free");
  const [submitted, setSubmitted] = useState(false);
  const [data, setDataRaw] = useState<Record<string, any>>({
    listingType: "sell",
    propertyType: "flat",
    bhk: "2 BHK",
    bathrooms: 2,
    balconies: 1,
    amenities: [],
    photos: [],
    photoTypes: [],
  });

  const setData = (k: string, v: any) =>
    setDataRaw((prev) => ({ ...prev, [k]: v }));

  const goNext = () => {
    if (step < 5) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitted(true);
    }
  };
  const goPrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pct = ((step - 1) / 4) * 100;

  if (submitted) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
          @keyframes successPop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
          .success-pop { animation: successPop 0.5s ease both; }
        `}</style>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 font-[DM_Sans,sans-serif]">
          <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(15,35,66,0.12)] p-8 max-w-sm w-full text-center">
            <div
              className="success-pop w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
              flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(52,211,153,0.4)]"
            >
              <svg
                width="36"
                height="36"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-[Playfair_Display,serif] text-2xl font-bold text-[#0f2342] mb-2">
              Property Listed!
            </h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your property has been successfully posted. You'll start receiving
              enquiries shortly.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: "📞", label: "Enquiries will arrive via SMS & Call" },
                { icon: "✅", label: "Listing live within 24 hours" },
                { icon: "🔒", label: "RERA verified badge applied" },
                { icon: "📊", label: "Track views in dashboard" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100"
                >
                  <p className="text-2xl mb-1">{f.icon}</p>
                  <p className="text-[10px] font-semibold text-slate-600 leading-tight">
                    {f.label}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setDataRaw({
                  listingType: "sell",
                  propertyType: "flat",
                  bhk: "2 BHK",
                  bathrooms: 2,
                  balconies: 1,
                  amenities: [],
                  photos: [],
                  photoTypes: [],
                });
              }}
              className="w-full bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
                py-3.5 rounded-2xl text-sm font-bold border-none cursor-pointer
                hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)] active:scale-[0.97] transition-all font-[inherit]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              Post Another Property
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease both; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
      `}</style>

      <div className="min-h-screen bg-[#f8fafc] font-[DM_Sans,sans-serif]">
        {/* ── Sticky top header ── */}
        <div
          className="sticky top-0 z-50 bg-white border-b border-slate-100
          shadow-[0_2px_12px_rgba(15,35,66,0.08)]"
        >
          {/* Title row */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2 max-w-[640px] mx-auto">
            <div
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0f2342] to-[#1a3a6e]
              flex items-center justify-center flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0f2342] leading-none">
                Post Property
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Step {step} of {STEPS.length} — {STEPS[step - 1].label}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlan("free")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border
      ${
        plan === "free"
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-white text-slate-400 border-slate-200"
      }`}
              >
                FREE
              </button>
              <button
                onClick={() => setPlan("paid")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border
      ${
        plan === "paid"
          ? "bg-amber-50 text-amber-600 border-amber-300"
          : "bg-white text-slate-400 border-slate-200"
      }`}
              >
                PAID
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 mx-4 rounded-full mb-2 max-w-[640px] mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0f2342] to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${pct + 20}%` }}
            />
          </div>

          {/* Step pills */}
          <div className="flex overflow-x-auto no-scrollbar px-4 pb-3 gap-2 max-w-[640px] mx-auto">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full
                  text-[11px] font-bold transition-all border cursor-pointer font-[inherit]
                  ${
                    s.id === step
                      ? "bg-[#0f2342] text-white border-[#0f2342]"
                      : s.id < step
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-white text-slate-400 border-slate-200"
                  }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {s.id < step ? <CheckIcon /> : s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form content ── */}
        <div
          className="max-w-[640px] mx-auto px-4 pt-5 pb-32 fade-up"
          key={step}
        >
          {step === 1 && <Step1 data={data} setData={setData} />}
          {step === 2 && <Step2 data={data} setData={setData} />}
          {step === 3 && <Step3 data={data} setData={setData} />}
          {step === 4 && <Step4 data={data} setData={setData} />}
          {step === 5 && <Step5 data={data} setData={setData} plan={plan} />}
        </div>

        {/* ── Sticky bottom nav ── */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100
          shadow-[0_-4px_20px_rgba(15,35,66,0.08)] pb-safe"
        >
          <div className="max-w-[640px] mx-auto flex items-center gap-3 px-4 py-3">
            {step > 1 && (
              <button
                onClick={goPrev}
                className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2
                  border-slate-200 text-sm font-bold text-slate-600
                  hover:border-[#0f2342] active:scale-[0.97] transition-all cursor-pointer
                  font-[inherit] flex-shrink-0"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <ChevronLeft />
                Back
              </button>
            )}
            <button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2
                bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
                py-3.5 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer
                hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)] hover:-translate-y-px
                active:scale-[0.97] font-[inherit]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {step === 5 ? "Submit Listing" : `Save & Continue`}
              {step < 5 && <ChevronRight />}
            </button>
          </div>
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </>
  );
}
