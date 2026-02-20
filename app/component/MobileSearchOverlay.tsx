"use client";

import React, { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  id: string;
  title: string;
  locality: string;
  price: string;
  type: string;
  bhk?: string;
  area?: string;
  tag?: "Verified" | "New" | "Featured";
  image: string;
  isVideo?: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const RECOMMENDED_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "3 BHK Flat in Sector 150",
    locality: "Noida",
    price: "₹1.2 Cr",
    type: "Apartment",
    bhk: "3 BHK",
    area: "1450 sq.ft",
    tag: "Verified",
    image: "linear-gradient(135deg,#1e3a5f 0%,#2d6a4f 100%)",
  },
  {
    id: "2",
    title: "2 BHK Ready to Move",
    locality: "Gurgaon, Sector 57",
    price: "₹75 L",
    type: "Apartment",
    bhk: "2 BHK",
    area: "980 sq.ft",
    tag: "New",
    image: "linear-gradient(135deg,#3d1a6e 0%,#1a3a8f 100%)",
  },
  {
    id: "3",
    title: "Independent Villa",
    locality: "Whitefield, Bangalore",
    price: "₹2.8 Cr",
    type: "Villa",
    bhk: "4 BHK",
    area: "2800 sq.ft",
    tag: "Featured",
    image: "linear-gradient(135deg,#6e1a1a 0%,#0f2342 100%)",
  },
  {
    id: "4",
    title: "Studio Apartment",
    locality: "Andheri West, Mumbai",
    price: "₹42 L",
    type: "Studio",
    area: "420 sq.ft",
    image: "linear-gradient(135deg,#0f4c3a 0%,#1a3a6e 100%)",
  },
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

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronDown = ({ open = false }: { open?: boolean }) => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-amber-500">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
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

const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="16" height="16" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "white"} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" fill="#f59e0b" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// ─── Bottom Nav Icons ─────────────────────────────────────────────────────────

const NavHomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#0f2342" : "none"}
    stroke={active ? "#0f2342" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const NavInsightsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#0f2342" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

const NavShortlistIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#0f2342" : "none"}
    stroke={active ? "#0f2342" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0 1 7.5 3c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0 1 16.5 3 5.5 5.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" />
  </svg>
);

const NavProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#0f2342" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

// ─── Bottom Navigation Bar ────────────────────────────────────────────────────

const BottomNavBar: React.FC<{
  activeTab: string;
  onTabChange: (id: string) => void;
}> = ({ activeTab, onTabChange }) => {
  return (
    <div
      className="flex-shrink-0 bg-white border-t border-slate-100
        shadow-[0_-6px_24px_rgba(15,35,66,0.08)] relative"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-end h-16">

        {/* Home */}
        <button
          onClick={() => onTabChange("home")}
          className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full
            border-none bg-transparent cursor-pointer transition-opacity active:opacity-60"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <NavHomeIcon active={activeTab === "home"} />
          <span className={`text-[10px] font-semibold leading-none
            ${activeTab === "home" ? "text-[#0f2342]" : "text-slate-400"}`}>
            Home
          </span>
          {activeTab === "home" && (
            <span className="absolute bottom-[6px] w-4 h-0.5 rounded-full bg-[#0f2342]" style={{ left: "calc(10% - 8px)" }} />
          )}
        </button>

        {/* Insights */}
        <button
          onClick={() => onTabChange("insights")}
          className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full
            border-none bg-transparent cursor-pointer transition-opacity active:opacity-60"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <NavInsightsIcon active={activeTab === "insights"} />
          <span className={`text-[10px] font-semibold leading-none
            ${activeTab === "insights" ? "text-[#0f2342]" : "text-slate-400"}`}>
            Insights
          </span>
        </button>

        {/* Sell / Rent — floating CTA centre button */}
        <div className="flex-1 flex flex-col items-center justify-end pb-2 relative">
          {/* Raised pill background behind FAB */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-white rounded-t-full" />
          <button
            onClick={() => onTabChange("sell")}
            className="relative w-14 h-14 -mt-7 rounded-full flex items-center justify-center
              shadow-[0_6px_20px_rgba(15,35,66,0.30)] border-4 border-white
              cursor-pointer active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #0f2342 0%, #1a3a6e 100%)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <svg width="22" height="22" fill="white" stroke="white" strokeWidth="1.5"
              strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <span className={`text-[10px] font-semibold leading-none mt-1
            ${activeTab === "sell" ? "text-[#0f2342]" : "text-slate-400"}`}>
            Sell/Rent
          </span>
        </div>

        {/* Shortlisted */}
        <button
          onClick={() => onTabChange("shortlisted")}
          className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full
            border-none bg-transparent cursor-pointer transition-opacity active:opacity-60"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <NavShortlistIcon active={activeTab === "shortlisted"} />
          <span className={`text-[10px] font-semibold leading-none
            ${activeTab === "shortlisted" ? "text-[#0f2342]" : "text-slate-400"}`}>
            Shortlisted
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onTabChange("profile")}
          className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full
            border-none bg-transparent cursor-pointer transition-opacity active:opacity-60"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <NavProfileIcon active={activeTab === "profile"} />
          <span className={`text-[10px] font-semibold leading-none
            ${activeTab === "profile" ? "text-[#0f2342]" : "text-slate-400"}`}>
            Profile
          </span>
        </button>

      </div>
    </div>
  );
};

// ─── Property Card — Vertical (horizontal scroll row) ────────────────────────

const PropertyCardVertical: React.FC<{ property: Property; index: number }> = ({ property, index }) => {
  const [wishlisted, setWishlisted] = useState(false);
  return (
    <div
      className="prop-card flex-shrink-0 w-[200px] bg-white rounded-2xl
        border border-slate-100 shadow-sm overflow-hidden active:scale-[0.97]
        transition-all cursor-pointer"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="relative h-[110px]" style={{ background: property.image }}>
        {property.tag && (
          <span className={`absolute top-2 left-2 text-white text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full
            ${property.tag === "Verified" ? "bg-emerald-500" : property.tag === "New" ? "bg-blue-500" : "bg-amber-500"}`}>
            {property.tag === "Verified" && "✓ "}{property.tag}
          </span>
        )}
        {property.isVideo && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
            <VideoIcon />
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center
            bg-black/30 rounded-full border-none cursor-pointer"
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-[12px] font-semibold text-[#0f2342] leading-tight truncate mb-1">{property.title}</p>
        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mb-2">
          <MapPinIcon />{property.locality}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#0f2342]">{property.price}</span>
          {property.bhk && (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {property.bhk}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Property Card — Horizontal (results list) ───────────────────────────────

const PropertyCardHorizontal: React.FC<{ property: Property; index: number }> = ({ property, index }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const tagColors: Record<string, string> = {
    Verified: "bg-emerald-500", New: "bg-blue-500", Featured: "bg-amber-500",
  };
  return (
    <div
      className="prop-card flex gap-3 bg-white rounded-2xl border border-slate-100
        shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
      style={{ animationDelay: `${0.1 + index * 0.06}s` }}
    >
      <div className="relative w-[110px] flex-shrink-0 min-h-[90px]" style={{ background: property.image }}>
        {property.tag && (
          <span className={`absolute top-2 left-2 text-white text-[9px] font-bold
            tracking-wide px-2 py-0.5 rounded-full ${tagColors[property.tag]}`}>
            {property.tag === "Verified" && "✓ "}{property.tag}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center
            bg-black/30 rounded-full border-none cursor-pointer"
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </div>
      <div className="flex-1 py-3 pr-3 min-w-0">
        <p className="text-[13px] font-semibold text-[#0f2342] leading-tight truncate mb-0.5">{property.title}</p>
        <p className="text-xs text-slate-400 truncate mb-2 flex items-center gap-1">
          <MapPinIcon />{property.locality}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {property.bhk && (
            <span className="text-[10px] font-semibold text-[#0f2342] bg-slate-100 px-2 py-0.5 rounded-full">
              {property.bhk}
            </span>
          )}
          {property.area && (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {property.area}
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {property.type}
          </span>
        </div>
        <p className="text-[14px] font-bold text-[#0f2342]">{property.price}</p>
      </div>
    </div>
  );
};

// ─── MobileSearchOverlay ──────────────────────────────────────────────────────

export const MobileSearchOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}> = ({ isOpen, onClose, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All Categories");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setShowResults(false);
      setActiveTab("home");
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
        @keyframes propCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .overlay-content { animation: overlaySlideUp 0.22s ease; }
        .chip-item { animation: chipFadeIn 0.3s ease both; }
        .prop-card { animation: propCardIn 0.35s ease both; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="overlay-content flex flex-col h-full">

        {/* ── Gradient header ── */}
        <div className="flex-shrink-0 px-4 pt-4 pb-4"
          style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6e 100%)" }}>

          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors
                border-none bg-white/10 cursor-pointer px-3 py-2 rounded-xl"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <BackIcon />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-amber-400">
              Search Properties
            </span>
            <button onClick={onClose}
              className="text-white/60 hover:text-white border-none bg-white/10
                cursor-pointer p-2 rounded-xl transition-colors"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <CloseIcon size={18} />
            </button>
          </div>

          {/* Search input */}
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
              onKeyDown={(e) => { if (e.key === "Enter") setShowResults(true); }}
              placeholder="City, locality or project..."
              className="flex-1 border-none outline-none text-[#0f2342] bg-transparent
                font-[DM_Sans,sans-serif] placeholder-slate-400"
              style={{ fontSize: "16px" }}
            />
            {query && (
              <button onClick={() => { setQuery(""); setShowResults(false); }}
                className="text-slate-400 border-none bg-transparent cursor-pointer p-1 rounded-full">
                <CloseIcon size={16} />
              </button>
            )}
          </div>

          {/* Category selector */}
          <div className="relative mt-3">
            <button onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full flex items-center justify-between bg-white/10 text-white
                border border-white/20 rounded-2xl px-4 py-3 text-sm font-medium
                cursor-pointer font-[inherit]"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <span>{category}</span>
              <ChevronDown open={categoryOpen} />
            </button>
            {categoryOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white
                border border-slate-100 rounded-2xl shadow-2xl z-10 overflow-hidden">
                {SEARCH_CATEGORIES.map((cat) => (
                  <button key={cat}
                    onClick={() => { setCategory(cat); setCategoryOpen(false); }}
                    className={`block w-full text-left px-4 py-3.5 text-sm border-none
                      cursor-pointer font-[inherit] transition-colors
                      ${cat === category
                        ? "font-semibold bg-amber-50 text-amber-600"
                        : "font-normal text-[#0f2342] bg-white active:bg-slate-50"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <button onClick={() => setShowResults(true)}
            className="w-full mt-3 py-3.5 rounded-2xl text-sm font-bold text-[#0f2342]
              cursor-pointer border-none active:scale-[0.98] transition-all"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", WebkitTapHighlightColor: "transparent" }}>
            Search Properties
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#f8fafc]">

          {/* RESULTS STATE */}
          {showResults ? (
            <div className="px-4 pt-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0f2342]">
                    {query ? `Results for "${query}"` : "All Properties"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {RECOMMENDED_PROPERTIES.length} properties found
                  </p>
                </div>
                <button onClick={() => setShowResults(false)}
                  className="text-xs font-semibold text-amber-600 border border-amber-200
                    bg-amber-50 px-3 py-1.5 rounded-full cursor-pointer font-[inherit]"
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  ← Modify
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                {["Price ▾", "BHK ▾", "Area ▾", "Verified", "Ready to Move", "New Launch"].map((f) => (
                  <button key={f} className="flex-shrink-0 text-xs font-semibold text-[#0f2342]
                    border border-slate-200 bg-white px-3 py-1.5 rounded-full
                    active:bg-amber-50 active:border-amber-300 cursor-pointer font-[inherit]">
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {RECOMMENDED_PROPERTIES.map((p, i) => (
                  <PropertyCardHorizontal key={p.id} property={p} index={i} />
                ))}
              </div>

              <button className="w-full mt-5 py-3.5 rounded-2xl text-sm font-semibold
                text-[#0f2342] border-2 border-slate-200 bg-white active:bg-slate-50
                cursor-pointer font-[inherit]">
                Load More Properties
              </button>
            </div>

          ) : (
            /* IDLE / BROWSE STATE */
            <div className="px-4 pt-5 pb-6">

              {/* Recommended Properties */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <StarIcon />
                    <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400">
                      Recommended for You
                    </span>
                  </div>
                  <button className="text-[11px] font-semibold text-amber-600 cursor-pointer
                    border-none bg-transparent font-[inherit]"
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    View all →
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">Curated especially for you</p>

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                  {RECOMMENDED_PROPERTIES.map((p, i) => (
                    <PropertyCardVertical key={p.id} property={p} index={i} />
                  ))}
                </div>
              </div>

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
                    <button key={term} onClick={() => setQuery(term)}
                      className="chip-item flex items-center gap-3 w-full text-left px-4 py-3.5
                        bg-white rounded-2xl border border-slate-100 text-sm text-[#0f2342]
                        active:bg-amber-50 active:border-amber-200 transition-all cursor-pointer
                        font-[inherit] shadow-sm"
                      style={{ animationDelay: `${i * 0.04}s`, WebkitTapHighlightColor: "transparent" }}>
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
                    <button key={c} onClick={() => setQuery(`Property in ${c}`)}
                      className="chip-item px-4 py-2.5 rounded-full text-xs font-semibold
                        border border-slate-200 bg-white text-[#0f2342]
                        active:bg-amber-50 active:border-amber-400 active:text-amber-700
                        transition-all cursor-pointer font-[inherit] shadow-sm"
                      style={{ animationDelay: `${0.28 + i * 0.03}s`, WebkitTapHighlightColor: "transparent" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV — fixed at the very bottom of the overlay ── */}
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      </div>
    </div>
  );
};

export default MobileSearchOverlay;