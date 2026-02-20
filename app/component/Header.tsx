"use client";

import React, { useState, useRef, useEffect } from "react";
import LoginModal from "./Login";
import RegisterModal from "./RegisterModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropdownColumn {
  heading: string;
  links: { label: string; href: string; viewAll?: boolean }[];
}

interface NavItem {
  label: string;
  href?: string;
  columns?: DropdownColumn[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Buy",
    columns: [
      {
        heading: "By Locality",
        links: [
          { label: "Property in Delhi", href: "#" },
          { label: "Property in Noida", href: "#" },
          { label: "Property in Gurgaon", href: "#" },
          { label: "Property in Mumbai", href: "#" },
          { label: "Property in Bangalore", href: "#" },
          { label: "Property in Pune", href: "#" },
          { label: "View all localities →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By Budget",
        links: [
          { label: "Under ₹25 Lakhs", href: "#" },
          { label: "₹25L – ₹50L", href: "#" },
          { label: "₹50L – ₹75L", href: "#" },
          { label: "₹75L – ₹1 Cr", href: "#" },
          { label: "₹1Cr – ₹2Cr", href: "#" },
          { label: "Above ₹5 Crores", href: "#" },
          { label: "View all budgets →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By BHK",
        links: [
          { label: "1 BHK for Sale", href: "#" },
          { label: "2 BHK for Sale", href: "#" },
          { label: "3 BHK for Sale", href: "#" },
          { label: "4 BHK for Sale", href: "#" },
          { label: "Penthouses", href: "#" },
          { label: "Independent Houses", href: "#" },
          { label: "View all BHK options →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  {
    label: "Rent",
    columns: [
      {
        heading: "By Locality",
        links: [
          { label: "Rent in Delhi", href: "#" },
          { label: "Rent in Noida", href: "#" },
          { label: "Rent in Gurgaon", href: "#" },
          { label: "Rent in Mumbai", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By Type",
        links: [
          { label: "Furnished Flats", href: "#" },
          { label: "PG / Co-living", href: "#" },
          { label: "Studio Apartments", href: "#" },
          { label: "Commercial Rent", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By BHK",
        links: [
          { label: "1 BHK Rent", href: "#" },
          { label: "2 BHK Rent", href: "#" },
          { label: "3 BHK Rent", href: "#" },
          { label: "4 BHK Rent", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  {
    label: "Projects",
    columns: [
      {
        heading: "New Projects",
        links: [
          { label: "Upcoming Launches", href: "#" },
          { label: "Under Construction", href: "#" },
          { label: "Ready to Move", href: "#" },
          { label: "Luxury Projects", href: "#" },
          { label: "Affordable Housing", href: "#" },
          { label: "View all projects →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  {
    label: "Commercial",
    columns: [
      {
        heading: "Commercial",
        links: [
          { label: "Office Spaces", href: "#" },
          { label: "Shop / Showroom", href: "#" },
          { label: "Warehouse / Godown", href: "#" },
          { label: "Industrial Land", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  { label: "Agents", href: "#" },
];

const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad",
  "Chennai", "Pune", "Kolkata", "Noida", "Gurgaon",
];

const POPULAR_SEARCHES = [
  "2 BHK in Delhi",
  "Flats in Mumbai",
  "Villa in Bangalore",
  "PG in Noida",
  "Office Space Gurgaon",
  "Ready to Move Pune",
];

const SEARCH_CATEGORIES = [
  "All Categories", "Buy", "Rent", "Projects",
  "Commercial", "PG / Co-living", "Plots & Land",
];

// ─── Quick access tiles shown on mobile hero ──────────────────────────────────
const QUICK_TILES = [
  { label: "Buy", icon: "🏠", href: "#" },
  { label: "Rent", icon: "🔑", href: "#" },
  { label: "Projects", icon: "🏗️", href: "#" },
  { label: "Commercial", icon: "🏢", href: "#" },
  { label: "PG", icon: "🛏️", href: "#" },
  { label: "Plots", icon: "📐", href: "#" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const ChevronDown = ({ open = false }: { open?: boolean }) => (
  <svg
    width="14" height="14" fill="none" stroke="currentColor"
    strokeWidth="2.5" viewBox="0 0 24 24"
    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-amber-500">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const SearchIconGray = () => (
  <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const SearchIconWhite = () => (
  <svg width="17" height="17" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TrendingIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

// ─── MobileSearchOverlay ──────────────────────────────────────────────────────

const MobileSearchOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}> = ({ isOpen, onClose, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All Categories");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-white">
      <style>{`
        @keyframes overlaySlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chipFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .overlay-content { animation: overlaySlideUp 0.22s ease; }
        .chip-item { animation: chipFadeIn 0.3s ease both; }
      `}</style>

      <div className="overlay-content flex flex-col h-full">

        {/* ── Gradient header ── */}
        <div className="flex-shrink-0 px-4 pt-safe-top pt-4 pb-4"
          style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6e 100%)" }}>

          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors
                border-none bg-white/10 cursor-pointer px-3 py-2 rounded-xl"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <BackIcon />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-amber-400">
              Search
            </span>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white border-none bg-white/10
                cursor-pointer p-2 rounded-xl transition-colors"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {/* Search input — white card */}
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5
            shadow-[0_6px_24px_rgba(0,0,0,0.15)]">
            <svg width="16" height="16" fill="none" stroke="#0f2342" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onClose()}
              placeholder="City, locality or project..."
              className="flex-1 border-none outline-none text-[15px] text-[#0f2342] bg-transparent
                font-[DM_Sans,sans-serif] placeholder-slate-400"
              style={{ fontSize: "16px" /* prevents iOS auto-zoom */ }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-slate-400 border-none bg-transparent cursor-pointer p-1 rounded-full"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>

          {/* Category selector */}
          <div className="relative mt-3">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full flex items-center justify-between bg-white/10 text-white
                border border-white/20 rounded-2xl px-4 py-3 text-sm font-medium
                cursor-pointer font-[inherit]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span>{category}</span>
              <ChevronDown open={categoryOpen} />
            </button>
            {categoryOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white
                border border-slate-100 rounded-2xl shadow-2xl z-10 overflow-hidden">
                {SEARCH_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setCategoryOpen(false); }}
                    className={`block w-full text-left px-4 py-3.5 text-sm border-none
                      cursor-pointer font-[inherit] transition-colors
                      ${cat === category
                        ? "font-semibold bg-amber-50 text-amber-600"
                        : "font-normal text-[#0f2342] bg-white active:bg-slate-50"
                      }`}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            className="w-full mt-3 py-3.5 rounded-2xl text-sm font-bold text-[#0f2342]
              cursor-pointer border-none active:scale-[0.98] transition-all"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Search Properties
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-10 bg-[#f8fafc]">

          {/* Popular searches */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingIcon />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400">
                Popular Searches
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {POPULAR_SEARCHES.map((term, i) => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); }}
                  className="chip-item flex items-center gap-3 w-full text-left px-4 py-3.5
                    bg-white rounded-2xl border border-slate-100 text-sm text-[#0f2342]
                    active:bg-amber-50 active:border-amber-200 transition-all cursor-pointer
                    font-[inherit] shadow-sm"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span className="text-slate-400 flex-shrink-0">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </span>
                  <span className="flex-1">{term}</span>
                  <span className="text-slate-300 flex-shrink-0"><ArrowUpRightIcon /></span>
                </button>
              ))}
            </div>
          </div>

          {/* Browse by city */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPinIcon />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400">
                Browse by City
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c, i) => (
                <button
                  key={c}
                  onClick={() => { setQuery(`Property in ${c}`); }}
                  className="chip-item px-4 py-2.5 rounded-full text-xs font-semibold
                    border border-slate-200 bg-white text-[#0f2342]
                    active:bg-amber-50 active:border-amber-400 active:text-amber-700
                    transition-all cursor-pointer font-[inherit] shadow-sm"
                  style={{
                    animationDelay: `${0.28 + i * 0.03}s`,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MegaDropdown (desktop only) ──────────────────────────────────────────────

const MegaDropdown: React.FC<{ columns: DropdownColumn[]; isVisible: boolean }> = ({
  columns, isVisible,
}) => {
  if (!isVisible) return null;
  const isSingle = columns.length === 1;
  return (
    <div className={`
      absolute top-[calc(100%+8px)] left-0 bg-white rounded-2xl
      border border-slate-200 shadow-2xl p-5 z-[300]
      animate-[ddFadeIn_0.18s_ease] grid gap-6
      ${isSingle ? "grid-cols-1 min-w-[220px]" : "grid-cols-3 min-w-[680px]"}
    `}>
      {columns.map((col) => (
        <div key={col.heading}>
          <h4 className="text-[10px] font-semibold tracking-[0.12em] uppercase text-amber-500 mb-3 pb-2 border-b border-slate-200">
            {col.heading}
          </h4>
          {col.links.map((link) => (
            <a key={link.label} href={link.href}
              className={`block text-[13px] py-[5px] transition-all duration-150 hover:pl-1 no-underline
                ${link.viewAll ? "font-medium text-amber-500 mt-1" : "font-normal text-slate-500 hover:text-[#0f2342]"}`}>
              {link.label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── NavLink (desktop) ────────────────────────────────────────────────────────

const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!item.columns) {
    return (
      <a href={item.href}
        className="flex items-center gap-[5px] px-[14px] py-2 text-sm font-medium text-[#0f2342]
          rounded-lg whitespace-nowrap transition-all duration-150 hover:bg-slate-100
          hover:text-amber-500 no-underline">
        {item.label}
      </a>
    );
  }
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`flex items-center gap-[5px] px-[14px] py-2 text-sm font-medium rounded-lg
        border-none whitespace-nowrap transition-all duration-150 font-[inherit] cursor-pointer
        ${open ? "bg-slate-100 text-amber-500" : "bg-transparent text-[#0f2342]"}`}>
        {item.label}
        <ChevronDown open={open} />
      </button>
      <MegaDropdown columns={item.columns} isVisible={open} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RealEstateHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [city, setCity] = useState("Delhi");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchType, setSearchType] = useState("Buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [overlayQuery, setOverlayQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);

  const openSearch = (q = "") => {
    setOverlayQuery(q);
    setMobileSearchOpen(true);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes ddFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; margin: 0; }
        /* Smooth tap on iOS */
        button, a { -webkit-tap-highlight-color: transparent; }
        /* Safe area for notched phones */
        .pt-safe { padding-top: env(safe-area-inset-top, 0px); }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }
      `}</style>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        initialQuery={overlayQuery}
      />

      <div className="font-[DM_Sans,sans-serif]">

        {/* ── TOP BAR — desktop only ── */}
        <div className="hidden md:block bg-[#0f2342] text-white/65 text-xs tracking-wide py-[7px]">
          <div className="max-w-[1280px] mx-auto px-6 flex justify-between items-center flex-wrap gap-3">
            <div className="flex gap-5 items-center">
              <span>📞 8285-25-76-36</span>
              <span className="opacity-30">|</span>
              <a href="mailto:support@think4buysale.in"
                className="text-white/65 no-underline hover:text-white transition-colors">
                support@think4buysale.in
              </a>
            </div>
            <div className="flex gap-5 items-center">
              {["For Builders", "Advertise", "Download App"].map((t) => (
                <a key={t} href="#" className="text-white/65 no-underline hover:text-white transition-colors">{t}</a>
              ))}
              <span className="opacity-30">|</span>
              <a href="#" className="text-white/65 no-underline hover:text-white transition-colors">🇮🇳 India</a>
            </div>
          </div>
        </div>

        {/* ── MAIN HEADER ── */}
        <header className="bg-white shadow-[0_2px_16px_rgba(15,35,66,0.10)] sticky top-0 z-[100]">
          <div className="max-w-[1280px] mx-auto px-3 md:px-6 flex items-center h-14 md:h-[70px] gap-2 md:gap-6">

            {/* LOGO */}
            <a href="#" className="flex items-center gap-2 no-underline shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#0f2342] via-[#0f2342] to-[#c9a84c] rounded-[9px] flex items-center justify-center shadow-sm">
                <HomeIcon />
              </div>
              <div className="xs:hidden lg:block">
                <div className="font-[Playfair_Display,serif] text-base md:text-xl font-bold text-[#0f2342] leading-none">
                  Think4BuySale
                </div>
                <div className="text-[8px] font-semibold text-amber-500 tracking-[0.15em] uppercase">
                  India's Premier Realty
                </div>
              </div>
              {/* Compact logo text on tiny screens */}
              <div className="lg:hidden">
                <div className="font-[Playfair_Display,serif] text-sm font-bold text-[#0f2342] leading-none">T4BS</div>
              </div>
            </a>

            {/* MOBILE SEARCH BAR — prominent, takes most of the header space */}
            <button
              onClick={() => openSearch()}
              className="lg:hidden flex items-center gap-2 flex-1 min-w-0 border border-slate-200
                rounded-xl px-3 py-2.5 bg-slate-50 cursor-pointer font-[inherit] text-left
                transition-colors active:bg-slate-100"
            >
              <SearchIconGray />
              <span className="truncate text-sm text-slate-400 flex-1">Search properties…</span>
              {city && (
                <span className="hidden xs:flex items-center gap-1 text-xs text-amber-600 font-medium
                  bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                  <MapPinIcon />
                  {city}
                </span>
              )}
            </button>

            {/* CITY SELECTOR — desktop only */}
            <div ref={cityRef} className="relative shrink-0 hidden lg:block">
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-[6px] border border-slate-200 rounded-lg px-[14px]
                  py-[7px] cursor-pointer bg-[#fdf8f0] text-[13px] font-medium text-[#0f2342]
                  whitespace-nowrap font-[inherit] transition-colors hover:border-[#0f2342]"
              >
                <MapPinIcon />
                {city}
                <ChevronDown open={cityOpen} />
              </button>
              {cityOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 bg-white border border-slate-200
                  rounded-[10px] shadow-[0_8px_24px_rgba(15,35,66,0.12)] z-[300] overflow-hidden
                  min-w-[160px] animate-[ddFadeIn_0.15s_ease]">
                  {CITIES.map((c) => (
                    <button key={c}
                      onClick={() => { setCity(c); setCityOpen(false); }}
                      className={`block w-full text-left px-4 py-[9px] text-[13px] border-none
                        cursor-pointer font-[inherit] transition-colors hover:bg-slate-100
                        ${c === city ? "font-semibold text-amber-500 bg-[#fdf8f0]" : "font-normal text-[#0f2342] bg-transparent"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV_ITEMS.map((item) => <NavLink key={item.label} item={item} />)}
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">

              {/* Sign In — desktop */}
              <button onClick={() => setLoginOpen(true)}
                className="hidden md:flex items-center gap-[6px] px-4 py-2 text-[13px] font-medium
                  text-[#0f2342] border border-slate-200 rounded-lg whitespace-nowrap
                  transition-all hover:border-[#0f2342] hover:bg-slate-100">
                <UserIcon />
                Sign In
              </button>

              {/* Register — desktop */}
              <button onClick={() => setRegisterOpen(true)}
                className="hidden md:flex items-center gap-[6px] px-4 py-2 text-[13px] font-medium
                  text-amber-600 border border-amber-400 rounded-lg whitespace-nowrap
                  transition-all hover:bg-amber-50">
                Register
              </button>

              {/* Post Property — always visible, shorter on mobile */}
              <a href="#"
                className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-[9px] text-xs md:text-[13px]
                  font-bold text-white bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] rounded-lg
                  no-underline whitespace-nowrap transition-all hover:-translate-y-px
                  hover:shadow-[0_6px_20px_rgba(15,35,66,0.25)] active:scale-[0.97]">
                <span className="hidden sm:inline">Post Property</span>
                <span className="sm:hidden">Post</span>
                <span className="bg-amber-400 text-[#0f2342] text-[8px] md:text-[9px] font-black
                  tracking-wide px-1 md:px-[5px] py-[2px] rounded-[3px]">
                  FREE
                </span>
              </a>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex flex-col justify-center gap-[5px] cursor-pointer
                  p-2 border-none bg-none rounded-lg active:bg-slate-100"
                aria-label="Toggle menu"
              >
                <span className={`block w-[20px] h-[2px] bg-[#0f2342] rounded-sm transition-all duration-200
                  ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block w-[20px] h-[2px] bg-[#0f2342] rounded-sm transition-all duration-200
                  ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-[20px] h-[2px] bg-[#0f2342] rounded-sm transition-all duration-200
                  ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── MOBILE DRAWER MENU ── */}
          {mobileOpen && (
            <div className="lg:hidden bg-white border-t border-slate-100
              animate-[slideDown_0.2s_ease] overflow-y-auto overscroll-contain max-h-[85vh]">

              {/* City pills */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your City</p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <button key={c} onClick={() => setCity(c)}
                      className={`px-3 py-1.5 text-xs rounded-full border font-semibold
                        transition-all cursor-pointer font-[inherit] active:scale-95
                        ${c === city
                          ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                          : "bg-white border-slate-200 text-[#0f2342] active:bg-amber-50 active:border-amber-400"
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion nav items */}
              <div className="divide-y divide-slate-100">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    {item.columns ? (
                      <>
                        <button
                          onClick={() => setMobileAccordion(mobileAccordion === item.label ? null : item.label)}
                          className="flex w-full justify-between items-center px-4 py-4
                            text-[15px] font-medium text-[#0f2342] bg-transparent border-none
                            cursor-pointer font-[inherit] active:bg-slate-50"
                        >
                          {item.label}
                          <ChevronDown open={mobileAccordion === item.label} />
                        </button>
                        {mobileAccordion === item.label && (
                          <div className="bg-slate-50 px-4 pb-4 animate-[slideDown_0.15s_ease]">
                            {item.columns.map((col) => (
                              <div key={col.heading} className="mb-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2 mt-3">
                                  {col.heading}
                                </p>
                                {/* 2-column grid for links on mobile = easier scanning */}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                  {col.links.map((link) => (
                                    <a key={link.label} href={link.href}
                                      className={`text-[13px] py-2 no-underline transition-colors
                                        active:text-amber-500
                                        ${link.viewAll
                                          ? "col-span-2 text-amber-500 font-semibold mt-1"
                                          : "text-slate-600"
                                        }`}
                                    >
                                      {link.label}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <a href={item.href || "#"}
                        className="flex justify-between items-center px-4 py-4 text-[15px]
                          font-medium text-[#0f2342] no-underline active:bg-slate-50">
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Auth buttons */}
              <div className="px-4 pt-4 pb-safe pb-6 flex flex-col gap-3 border-t border-slate-100">
                <button onClick={() => { setMobileOpen(false); setLoginOpen(true); }}
                  className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-semibold
                    text-[#0f2342] border-2 border-slate-200 rounded-2xl active:bg-slate-50">
                  <UserIcon />
                  Sign In
                </button>
                <button onClick={() => { setMobileOpen(false); setRegisterOpen(true); }}
                  className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-semibold
                    text-amber-600 border-2 border-amber-400 rounded-2xl bg-amber-50 active:bg-amber-100">
                  Create Free Account
                </button>
                <a href="#"
                  className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-bold
                    text-white bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] rounded-2xl no-underline active:opacity-90">
                  Post FREE Property
                </a>
              </div>
            </div>
          )}
        </header>

        {/* ── HERO SECTION ── */}
        <section className="relative bg-gradient-to-br from-[#0f2342] via-[#1a3a6e] to-[#0d3060]
          flex flex-col items-center justify-center text-center
          px-4 md:px-6 pt-10 pb-8 md:py-16 overflow-hidden">

          {/* Dot texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          {/* Trust badge */}
          <p className="relative text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400 mb-3"
            style={{ animation: "heroFadeUp 0.5s ease both" }}>
            Trusted by 10M+ buyers across India
          </p>

          {/* Headline — tighter on mobile */}
          <h1
            className="relative font-[Playfair_Display,serif] font-bold text-white leading-tight
              max-w-[680px] mb-3 md:mb-4"
            style={{
              fontSize: "clamp(26px, 7vw, 56px)",
              animation: "heroFadeUp 0.5s 0.08s ease both",
            }}
          >
            Find Your{" "}
            <em className="not-italic text-amber-300 font-bold">Perfect</em>{" "}
            Home in India
          </h1>

          {/* Sub */}
          <p className="relative text-white/60 text-sm max-w-[400px] mb-6 leading-relaxed hidden sm:block"
            style={{ animation: "heroFadeUp 0.5s 0.14s ease both" }}>
            Explore thousands of verified properties — flats, villas, plots & commercial spaces.
          </p>

          {/* ── DESKTOP SEARCH BAR ── */}
          <div
            className="relative w-full max-w-[600px] hidden sm:flex bg-white rounded-xl
              shadow-[0_12px_40px_rgba(15,35,66,0.18)] p-1.5 items-center gap-0 pl-4 mb-5"
            style={{ animation: "heroFadeUp 0.5s 0.18s ease both" }}
          >
            <SearchIconGray />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, locality or project..."
              className="flex-1 border-none outline-none text-sm font-[DM_Sans,sans-serif]
                text-[#0f2342] bg-transparent min-w-0 py-2 px-2 placeholder-slate-400"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="border-none outline-none text-[13px] font-[DM_Sans,sans-serif]
                text-slate-500 bg-slate-100 px-3 py-2 rounded-lg cursor-pointer shrink-0 mx-1"
            >
              <option>Buy</option>
              <option>Rent</option>
              <option>Projects</option>
            </select>
            <button className="bg-gradient-to-br from-amber-400 to-amber-600 text-[#0f2342]
              border-none rounded-lg px-5 py-[10px] text-sm font-bold font-[DM_Sans,sans-serif]
              cursor-pointer shrink-0 transition-all hover:-translate-y-px
              hover:shadow-[0_4px_14px_rgba(201,168,76,0.4)]">
              Search
            </button>
          </div>

          {/* ── MOBILE SEARCH PILL — large tap target ── */}
          <button
            onClick={() => openSearch()}
            className="relative sm:hidden w-full max-w-[400px] flex items-center gap-3
              bg-white/95 rounded-2xl px-4 py-4 cursor-pointer border border-white/30
              shadow-[0_8px_32px_rgba(15,35,66,0.20)] mb-6 active:scale-[0.98] transition-all"
            style={{ animation: "heroFadeUp 0.5s 0.18s ease both" }}
          >
            <div className="w-8 h-8 bg-[#0f2342] rounded-xl flex items-center justify-center flex-shrink-0">
              <SearchIconWhite />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-[#0f2342] leading-none mb-0.5">Search Properties</p>
              <p className="text-xs text-slate-400 truncate">City, locality, project...</p>
            </div>
            <span className="bg-amber-400 text-[#0f2342] text-[10px] font-black px-2.5 py-1.5
              rounded-lg flex-shrink-0">
              GO
            </span>
          </button>

          {/* ── QUICK TILES — mobile only ── */}
          <div
            className="relative grid grid-cols-6 sm:hidden gap-2 w-full max-w-[400px] mb-5"
            style={{ animation: "heroFadeUp 0.5s 0.24s ease both" }}
          >
            {QUICK_TILES.map((tile) => (
              <a
                key={tile.label}
                href={tile.href}
                className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20
                  border border-white/15 rounded-2xl py-2.5 px-1 no-underline
                  active:scale-95 transition-all"
              >
                <span className="text-xl">{tile.icon}</span>
                <span className="text-white text-[9px] font-semibold tracking-wide">{tile.label}</span>
              </a>
            ))}
          </div>

          {/* Quick chip searches — desktop */}
          <div
            className="relative hidden sm:flex flex-wrap justify-center gap-2"
            style={{ animation: "heroFadeUp 0.5s 0.22s ease both" }}
          >
            {["2 BHK in Delhi", "Flats in Mumbai", "Villa in Bangalore", "PG in Noida"].map((chip) => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5
                  rounded-full border border-white/20 cursor-pointer font-[inherit] transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
};

export default RealEstateHeader;