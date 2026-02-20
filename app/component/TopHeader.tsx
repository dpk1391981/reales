"use client";

import React, { useState, useRef, useEffect } from "react";
import LoginModal from "./Login";
import RegisterModal from "./RegisterModal";
import MobileSearchOverlay from "./MobileSearchOverlay";

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
              <div className="hidden xs:block">
                <div className="font-[Playfair_Display,serif] text-base md:text-xl font-bold text-[#0f2342] leading-none">
                  Think4BuySale
                </div>
                <div className="text-[8px] font-semibold text-amber-500 tracking-[0.15em] uppercase">
                  India's Premier Realty
                </div>
              </div>
              {/* Compact logo text on tiny screens */}
              {/* <div className="xs:hidden">
                <div className="font-[Playfair_Display,serif] text-sm font-bold text-[#0f2342] leading-none">T4BS</div>
              </div> */}
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
              <a href="/post-property/guest"
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
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
};

export default RealEstateHeader;