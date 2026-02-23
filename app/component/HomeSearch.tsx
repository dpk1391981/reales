"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import MobileSearchOverlay from "./MobileSearchOverlay";

// ─── Types & Constants ────────────────────────────────────────────────────────

type Tab = "Buy" | "Rent" | "New Launch" | "Commercial" | "Plots/Land" | "Projects";

const TABS: Tab[] = ["Buy", "Rent", "New Launch", "Commercial", "Plots/Land", "Projects"];

const RESIDENTIAL_TYPES = [
  "Flat/Apartment", "Builder Floor", "Independent House/Villa",
  "Residential Land", "1 RK/ Studio Apartment", "Farm House",
  "Serviced Apartments", "Other",
];

const COMMERCIAL_TYPES = [
  "Ready to move offices", "Bare shell offices", "Shops & Retail",
  "Commercial/Inst. Land", "Agricultural/Farm Land", "Industrial Land/Plots",
  "Warehouse", "Cold Storage", "Factory & Manufacturing", "Hotel/Resorts", "Others",
];

const INVESTMENT_OPTIONS = [
  "Pre Leased Spaces", "Food Courts", "Restaurants", "Multiplexes", "SCO Plots",
];

const PLOT_TYPES = [
  "Residential Plot", "Commercial Plot", "Agricultural Land",
  "Industrial Plot", "Farm House", "Other",
];

const PROJECT_STATUSES = ["New Launch", "Under Construction", "Ready to Move"];

const BEDROOM_OPTIONS = ["1 RK/1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

const BUDGET_RANGES_BUY = [
  "Under ₹20L", "₹20L–50L", "₹50L–1Cr", "₹1Cr–2Cr", "₹2Cr–5Cr", "Above ₹5Cr",
];
const BUDGET_RANGES_RENT = [
  "Under ₹5K", "₹5K–10K", "₹10K–20K", "₹20K–40K", "₹40K–80K", "Above ₹80K",
];

const CONSTRUCTION_STATUS = ["Ready to Move", "Under Construction", "New Launch"];

const POSTED_BY = ["All", "Owner", "Builder", "Agent"];

const QUICK_TILES = [
  { label: "Buy", icon: "🏠", href: "#" },
  { label: "Rent", icon: "🔑", href: "#" },
  { label: "Projects", icon: "🏗️", href: "#" },
  { label: "Commercial", icon: "🏢", href: "#" },
  { label: "PG", icon: "🛏️", href: "#" },
  { label: "Plots", icon: "📐", href: "#" },
];

const SUGGESTION_CHIPS: Record<Tab, string[]> = {
  "Buy": ["2 BHK in Delhi", "Flats in Mumbai", "Villa in Bangalore", "Plot in Hyderabad"],
  "Rent": ["PG in Noida", "1 BHK in Pune", "Furnished flat Gurgaon", "Studio in Bangalore"],
  "New Launch": ["Projects in Mumbai", "New flats Delhi", "Upcoming in Noida", "Launch Hyderabad"],
  "Commercial": ["Office in BKC", "Shop in Connaught Place", "Warehouse Gurgaon", "Co-working Bangalore"],
  "Plots/Land": ["Plot in Gurgaon", "Farm land Pune", "Industrial plot Noida", "Land in Chennai"],
  "Projects": ["Residential Noida", "Luxury Mumbai", "Affordable Delhi NCR", "Smart city Pune"],
};

// ─── Icon Components ──────────────────────────────────────────────────────────

const SearchIcon = ({ size = 16, color = "#94a3b8" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const LocationIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="16" height="16" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.5" />
  </svg>
);

const MicIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="15" height="15" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const ChevronDown = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronUp = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── Checkbox Component ───────────────────────────────────────────────────────

const BlueCheckbox = ({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-2 cursor-pointer group select-none">
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150
        ${checked ? "bg-[#2563EB] border-[#2563EB]" : "bg-white border-slate-300 group-hover:border-[#2563EB]"}`}
    >
      {checked && (
        <svg width="9" height="9" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </div>
    <span className="text-[13px] text-slate-700 group-hover:text-slate-900">{label}</span>
  </label>
);

// ─── Filter Pill ──────────────────────────────────────────────────────────────

const FilterPill = ({
  label, active, onClick, children,
}: { label: string; active: boolean; onClick: () => void; children?: React.ReactNode }) => (
  <div className="relative">
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[13px] font-semibold transition-all duration-150 whitespace-nowrap
        ${active
          ? "bg-blue-50 border-[#2563EB] text-[#1D4ED8]"
          : "bg-white border-slate-200 text-slate-600 hover:border-[#2563EB]/50 hover:text-slate-800"
        }`}
    >
      {label}
      {active ? <ChevronUp size={11} color="#1D4ED8" /> : <ChevronDown size={11} />}
    </button>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const HomeSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [overlayQuery, setOverlayQuery] = useState("");
  const [isFloating, setIsFloating] = useState(false);

  // Category dropdown for Buy/Rent
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedResTypes, setSelectedResTypes] = useState<string[]>(RESIDENTIAL_TYPES);
  const [selectedCommTypes, setSelectedCommTypes] = useState<string[]>(COMMERCIAL_TYPES);
  const [selectedInvestOptions, setSelectedInvestOptions] = useState<string[]>([]);
  const [selectedPlotTypes, setSelectedPlotTypes] = useState<string[]>(PLOT_TYPES);
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string[]>(PROJECT_STATUSES);

  // Filter pills
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);
  const [selectedConstructionStatus, setSelectedConstructionStatus] = useState<string[]>([]);
  const [selectedPostedBy, setSelectedPostedBy] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<[number, number]>([0, 10000]);

  // Buy sub-intent for Commercial
  const [commercialIntent, setCommercialIntent] = useState<"Buy" | "Rent">("Buy");

  const heroRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Scroll → floating behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const bottom = heroRef.current.getBoundingClientRect().bottom;
      setIsFloating(bottom < 64);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const openSearch = (q = "") => {
    setOverlayQuery(q);
    setMobileSearchOpen(true);
  };

  // Filters shown per tab
  const getFilters = () => {
    if (activeTab === "Commercial") return ["Budget", "Area", "Construction Status", "Posted By"];
    if (activeTab === "New Launch" || activeTab === "Projects") return ["Budget", "Bedroom", "Posted By"];
    if (activeTab === "Plots/Land") return ["Budget", "Area", "Posted By"];
    return ["Budget", "Bedroom", "Construction Status", "Posted By"];
  };

  const getBudgetRanges = () =>
    (activeTab === "Rent" ? BUDGET_RANGES_RENT : BUDGET_RANGES_BUY);

  const getCategoryLabel = () => {
    if (activeTab === "Commercial") return "All Commercial";
    if (activeTab === "Plots/Land") return "All Plots";
    if (activeTab === "Projects") return "Residential Project";
    return "All Residential";
  };

  const getSearchPlaceholder = () => {
    const map: Record<Tab, string> = {
      "Buy": 'Search "2 BHK in Delhi"',
      "Rent": 'Search "1 BHK for rent in Bangalore"',
      "New Launch": 'Search "New projects in Pune"',
      "Commercial": 'Search "Office space in BKC Mumbai"',
      "Plots/Land": 'Search "Plot in Gurgaon sector 48"',
      "Projects": 'Search "Residential project in Noida"',
    };
    return map[activeTab];
  };

  // ── Category Dropdown Content ──────────────────────────────────────────────

  const CategoryDropdown = () => {
    if (!categoryOpen) return null;

    if (activeTab === "Commercial") {
      return (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-5 w-[720px]">
          <div className="grid grid-cols-2 gap-x-8">
            {/* Left: Property Types */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Property Types</p>
              <div className="grid grid-cols-2 gap-y-2.5">
                {COMMERCIAL_TYPES.map((t) => (
                  <BlueCheckbox key={t} label={t} checked={selectedCommTypes.includes(t)}
                    onChange={() => setSelectedCommTypes(toggleArr(selectedCommTypes, t))} />
                ))}
              </div>
              <button className="mt-3 text-xs text-[#2563EB] font-bold hover:underline"
                onClick={() => setSelectedCommTypes(selectedCommTypes.length === COMMERCIAL_TYPES.length ? [] : COMMERCIAL_TYPES)}>
                {selectedCommTypes.length === COMMERCIAL_TYPES.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            {/* Right: Investment Options */}
            <div className="border-l border-slate-100 pl-8">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Investment Options</p>
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">NEW</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {INVESTMENT_OPTIONS.map((t) => (
                  <BlueCheckbox key={t} label={t} checked={selectedInvestOptions.includes(t)}
                    onChange={() => setSelectedInvestOptions(toggleArr(selectedInvestOptions, t))} />
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Looking for residential properties?{" "}
                  <button className="text-[#2563EB] font-bold hover:underline" onClick={() => { setActiveTab("Buy"); setCategoryOpen(false); }}>
                    Click here
                  </button>
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span className="bg-rose-500 text-white text-[8px] font-black px-1 py-0.5 rounded">NEW</span>
                  Looking to invest?{" "}
                  <button className="text-[#2563EB] font-bold hover:underline">Click here</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "Projects") {
      return (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-5 w-[500px]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Residential Project</p>
          <div className="flex gap-5">
            {PROJECT_STATUSES.map((t) => (
              <BlueCheckbox key={t} label={t} checked={selectedProjectStatus.includes(t)}
                onChange={() => setSelectedProjectStatus(toggleArr(selectedProjectStatus, t))} />
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Looking for commercial projects?{" "}
              <button className="text-[#2563EB] font-bold hover:underline"
                onClick={() => { setActiveTab("Commercial"); setCategoryOpen(false); }}>
                Click here
              </button>
            </p>
          </div>
        </div>
      );
    }

    if (activeTab === "Plots/Land") {
      return (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-5 w-[460px]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Plot / Land Type</p>
          <div className="grid grid-cols-2 gap-y-2.5">
            {PLOT_TYPES.map((t) => (
              <BlueCheckbox key={t} label={t} checked={selectedPlotTypes.includes(t)}
                onChange={() => setSelectedPlotTypes(toggleArr(selectedPlotTypes, t))} />
            ))}
          </div>
        </div>
      );
    }

    // Buy / Rent / New Launch
    return (
      <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-5 w-[560px]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Residential Type</p>
          <button className="text-[11px] text-[#2563EB] font-bold hover:underline"
            onClick={() => setSelectedResTypes([])}>Clear</button>
        </div>
        <div className="grid grid-cols-3 gap-y-2.5">
          {RESIDENTIAL_TYPES.map((t) => (
            <BlueCheckbox key={t} label={t} checked={selectedResTypes.includes(t)}
              onChange={() => setSelectedResTypes(toggleArr(selectedResTypes, t))} />
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Looking for commercial properties?{" "}
            <button className="text-[#2563EB] font-bold hover:underline"
              onClick={() => { setActiveTab("Commercial"); setCategoryOpen(false); }}>
              Click here
            </button>
          </p>
        </div>
      </div>
    );
  };

  // ── Filter Dropdowns ───────────────────────────────────────────────────────

  const FilterDropdown = ({ name }: { name: string }) => {
    if (openFilter !== name) return null;

    if (name === "Budget") {
      const ranges = getBudgetRanges();
      return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-4 w-64">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Budget Range</p>
          <div className="flex flex-wrap gap-2">
            {ranges.map((r) => (
              <button key={r} onClick={() => setSelectedBudgets(toggleArr(selectedBudgets, r))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${selectedBudgets.includes(r) ? "bg-blue-50 border-[#2563EB] text-[#1D4ED8]" : "bg-white border-slate-200 text-slate-600 hover:border-[#2563EB]/50"}`}>
                {r}
              </button>
            ))}
          </div>
          {selectedBudgets.length > 0 && (
            <button className="mt-3 text-[11px] text-rose-500 font-bold hover:underline"
              onClick={() => setSelectedBudgets([])}>Clear</button>
          )}
        </div>
      );
    }

    if (name === "Bedroom") {
      return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-4 w-72">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Number of Bedrooms</p>
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((b) => (
              <button key={b} onClick={() => setSelectedBedrooms(toggleArr(selectedBedrooms, b))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${selectedBedrooms.includes(b) ? "bg-blue-50 border-[#2563EB] text-[#1D4ED8]" : "bg-white border-slate-200 text-slate-600 hover:border-[#2563EB]/50"}`}>
                + {b}
              </button>
            ))}
          </div>
          {selectedBedrooms.length > 0 && (
            <button className="mt-3 text-[11px] text-rose-500 font-bold hover:underline"
              onClick={() => setSelectedBedrooms([])}>Clear</button>
          )}
        </div>
      );
    }

    if (name === "Construction Status") {
      return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-4 w-64">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Construction Status</p>
          <div className="flex flex-col gap-2.5">
            {CONSTRUCTION_STATUS.map((s) => (
              <BlueCheckbox key={s} label={s} checked={selectedConstructionStatus.includes(s)}
                onChange={() => setSelectedConstructionStatus(toggleArr(selectedConstructionStatus, s))} />
            ))}
          </div>
        </div>
      );
    }

    if (name === "Posted By") {
      return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-4 w-52">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Posted By</p>
          <div className="flex flex-wrap gap-2">
            {POSTED_BY.map((p) => (
              <button key={p} onClick={() => setSelectedPostedBy(toggleArr(selectedPostedBy, p))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${selectedPostedBy.includes(p) ? "bg-blue-50 border-[#2563EB] text-[#1D4ED8]" : "bg-white border-slate-200 text-slate-600 hover:border-[#2563EB]/50"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (name === "Area") {
      return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-blue-100 p-4 w-64">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Area (sq ft)</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 font-semibold">Min</label>
              <input type="number" value={selectedArea[0]}
                onChange={(e) => setSelectedArea([+e.target.value, selectedArea[1]])}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#2563EB] outline-none mt-1" placeholder="0" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 font-semibold">Max</label>
              <input type="number" value={selectedArea[1]}
                onChange={(e) => setSelectedArea([selectedArea[0], +e.target.value])}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#2563EB] outline-none mt-1" placeholder="10000" />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ── Active filter count ────────────────────────────────────────────────────
  const hasActiveFilters =
    selectedBudgets.length > 0 || selectedBedrooms.length > 0 ||
    selectedConstructionStatus.length > 0 || selectedPostedBy.length > 0;

  const clearAllFilters = () => {
    setSelectedBudgets([]);
    setSelectedBedrooms([]);
    setSelectedConstructionStatus([]);
    setSelectedPostedBy([]);
  };

  // ── Full Search Bar (used in both hero and floating) ─────────────────────

  const SearchBarFull = ({ compact = false }: { compact?: boolean }) => (
    <div className={`w-full bg-white rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-slate-200/80 overflow-visible
      ${compact ? "shadow-[0_8px_32px_rgba(37,99,235,0.18)]" : ""}`}>

      {/* Tabs row */}
      {!compact && (
        <div className="flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCategoryOpen(false); setOpenFilter(null); }}
                className={`relative px-4 py-4 text-[13px] font-semibold transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab ? "text-[#1D4ED8]" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab}
                {tab === "New Launch" && (
                  <span className="absolute top-3 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full"
                    style={{ background: "linear-gradient(90deg,#1E40AF,#2563EB)" }} />
                )}
              </button>
            ))}
          </div>
          {/* <a href="/post-property"
            className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-slate-700 no-underline hover:text-[#1D4ED8] transition-colors mr-2">
            Post Property
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">FREE</span>
          </a> */}
        </div>
      )}

      {/* Search row */}
      <div className={`flex items-center gap-3 ${compact ? "px-4 py-2" : "px-5 py-3.5"}`}>

        {/* Commercial: Buy/Rent toggle */}
        {activeTab === "Commercial" && !compact && (
          <div className="flex items-center gap-0 border border-slate-200 rounded-xl overflow-hidden flex-shrink-0">
            {(["Buy", "Rent"] as const).map((i) => (
              <button key={i} onClick={() => setCommercialIntent(i)}
                className={`px-3 py-2 text-[12px] font-bold transition-all
                  ${commercialIntent === i ? "bg-[#1E40AF] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                {i}
              </button>
            ))}
          </div>
        )}

        {/* Category dropdown trigger */}
        <div className="relative flex-shrink-0" ref={compact ? undefined : categoryRef}>
          {compact ? (
            <span className="text-[12px] font-bold text-[#1D4ED8] bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
              {activeTab}
            </span>
          ) : (
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all whitespace-nowrap
                ${categoryOpen ? "bg-blue-50 border-[#2563EB] text-[#1D4ED8]" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-[#2563EB]/50"}`}
            >
              {getCategoryLabel()}
              {categoryOpen ? <ChevronUp size={11} color="#1D4ED8" /> : <ChevronDown size={11} />}
            </button>
          )}
          <CategoryDropdown />
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-200 flex-shrink-0" />

        {/* Search input */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <SearchIcon size={16} color="#94a3b8" />
          <input
            ref={compact ? undefined : inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && console.log("Search:", activeTab, searchQuery)}
            placeholder={compact ? `Search ${activeTab} properties...` : getSearchPlaceholder()}
            className="flex-1 border-none outline-none text-[14px] text-slate-800 bg-transparent placeholder-slate-400 min-w-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Action buttons */}
        {!compact && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#2563EB] flex items-center justify-center transition-all group">
              <LocationIcon color="#64748b" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 flex items-center justify-center transition-all">
              <MicIcon color="#64748b" />
            </button>
          </div>
        )}

        {/* Search button */}
        <button
          className={`flex-shrink-0 font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]
            ${compact ? "px-5 py-2 text-[13px]" : "px-7 py-2.5 text-[14px]"}`}
          style={{ background: "linear-gradient(135deg,#1E40AF,#2563EB)", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
          onClick={() => console.log("Search:", activeTab, searchQuery)}
        >
          Search
        </button>
      </div>

      {/* Filters row */}
      {!compact && (
        <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100 overflow-x-auto no-scrollbar" ref={filterRef}>
          {getFilters().map((f) => (
            <div key={f} className="relative flex-shrink-0">
              <FilterPill
                label={f}
                active={openFilter === f}
                onClick={() => setOpenFilter(openFilter === f ? null : f)}
              >
                <FilterDropdown name={f} />
              </FilterPill>
            </div>
          ))}

          {hasActiveFilters && (
            <button onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-[12px] text-rose-500 font-bold hover:text-rose-600 ml-2 flex-shrink-0">
              <CloseIcon /> Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );

  // ── Floating Bar (compact single-line) ─────────────────────────────────────

  const FloatingBar = () => (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isFloating ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
      style={{ background: "linear-gradient(to bottom,rgba(11,60,140,0.97),rgba(30,64,175,0.95))", backdropFilter: "blur(20px)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
        {/* Logo */}
        <a href="/" className="flex-shrink-0 flex items-center gap-1.5 no-underline mr-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1E40AF,#2563EB)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
        </a>

        {/* Tab pills — scrollable */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap
                ${activeTab === tab
                  ? "bg-white text-[#1E40AF]"
                  : "text-white/60 hover:text-white hover:bg-white/10"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Compact search */}
        <div className="flex-1 flex items-center gap-2.5 bg-white rounded-xl px-4 py-2 min-w-0">
          <SearchIcon size={15} color="#94a3b8" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && console.log("Search:", activeTab, searchQuery)}
            placeholder={`Search ${activeTab} properties...`}
            className="flex-1 border-none outline-none text-[13px] text-slate-800 bg-transparent placeholder-slate-400 min-w-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <CloseIcon />
            </button>
          )}
        </div>

        <button
          className="flex-shrink-0 px-5 py-2 text-[13px] font-bold text-white rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg,#0B3C8C,#2563EB)" }}
          onClick={() => console.log("Search:", activeTab, searchQuery)}
        >
          Search
        </button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes heroFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes floatBadge { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
        .badge-float { animation: floatBadge 3s ease-in-out infinite }
        .search-card-shadow { box-shadow: 0 24px 80px rgba(11,60,140,0.2), 0 4px 16px rgba(11,60,140,0.08); }
      `}</style>

      <MobileSearchOverlay
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        initialQuery={overlayQuery}
      />

      {/* Floating bar */}
      <FloatingBar />

      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* ── HERO ── */}
        <section ref={heroRef}
          className="relative flex flex-col items-center justify-center text-center px-4 md:px-6 pt-10 pb-8 md:py-16 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0B3C8C 0%,#1E40AF 45%,#2563EB 80%,#3B82F6 100%)" }}
        >
          {/* Dot mesh */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none" aria-hidden
            style={{ background: "radial-gradient(circle,rgba(96,165,250,0.2),transparent 70%)" }} />

          {/* Badge */}
          <div className="relative badge-float mb-3" style={{ animation: "heroFadeUp 0.5s ease both" }}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Trusted by 10M+ buyers across India
            </span>
          </div>

          {/* Headline */}
          <h1
            className="relative font-bold text-white leading-[1.1] max-w-[680px] mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(28px,6.5vw,56px)", fontWeight: 800, animation: "heroFadeUp 0.5s 0.08s ease both" }}
          >
            Find Your{" "}
            <span className="relative inline-block">
              <em className="not-italic" style={{ background: "linear-gradient(90deg,#fde68a,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Perfect
              </em>
            </span>{" "}
            Home in India
          </h1>

          <p className="relative text-white/60 text-sm max-w-[400px] mb-7 leading-relaxed hidden sm:block"
            style={{ animation: "heroFadeUp 0.5s 0.14s ease both" }}>
            Explore thousands of verified properties — flats, villas, plots & commercial spaces.
          </p>

          {/* ── DESKTOP SEARCH ── */}
          <div className="relative w-full max-w-5xl hidden sm:block search-card-shadow rounded-2xl mb-6"
            style={{ animation: "heroFadeUp 0.5s 0.18s ease both" }}>
            <SearchBarFull />
          </div>

          {/* ── MOBILE SEARCH PILL ── */}
          <button
            onClick={() => openSearch()}
            className="relative sm:hidden w-full max-w-[400px] flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 cursor-pointer border border-white/20 active:scale-[0.98] transition-all mb-5"
            style={{ boxShadow: "0 8px 32px rgba(11,60,140,0.3)", animation: "heroFadeUp 0.5s 0.18s ease both" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#0B3C8C,#2563EB)" }}>
              <SearchIcon size={16} color="white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-bold text-[#0B3C8C] leading-none mb-0.5">Search Properties</p>
              <p className="text-xs text-slate-400 truncate">City, locality, project...</p>
            </div>
            <span className="bg-amber-400 text-[#0B3C8C] text-[10px] font-black px-2.5 py-1.5 rounded-lg flex-shrink-0">
              GO
            </span>
          </button>

          {/* ── QUICK TILES — mobile ── */}
          <div className="relative grid grid-cols-6 sm:hidden gap-2 w-full max-w-[400px] mb-4"
            style={{ animation: "heroFadeUp 0.5s 0.22s ease both" }}>
            {QUICK_TILES.map((tile) => (
              <a key={tile.label} href={tile.href}
                className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/18 border border-white/15 rounded-2xl py-2.5 px-1 no-underline active:scale-95 transition-all">
                <span className="text-xl">{tile.icon}</span>
                <span className="text-white text-[9px] font-semibold tracking-wide">{tile.label}</span>
              </a>
            ))}
          </div>

          {/* ── SUGGESTION CHIPS ── */}
          <div className="relative hidden sm:flex flex-wrap justify-center gap-2"
            style={{ animation: "heroFadeUp 0.5s 0.24s ease both" }}>
            {SUGGESTION_CHIPS[activeTab].map((chip) => (
              <button key={chip} onClick={() => setSearchQuery(chip)}
                className="bg-white/10 hover:bg-white/20 text-white text-[12px] px-3.5 py-1.5 rounded-full border border-white/20 cursor-pointer font-[inherit] transition-colors backdrop-blur-sm">
                🔍 {chip}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="relative hidden sm:flex items-center gap-8 mt-8 pt-6 border-t border-white/10"
            style={{ animation: "heroFadeUp 0.5s 0.28s ease both" }}>
            {[
              { n: "24L+", l: "Monthly Visitors" },
              { n: "50K+", l: "Verified Buyers" },
              { n: "500+", l: "Cities" },
              { n: "10K+", l: "Deals Closed" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <p className="text-xl font-black text-amber-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>{n}</p>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default HomeSearch;