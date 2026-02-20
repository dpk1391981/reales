"use client";

import React, { useState, useRef, useEffect } from "react";
import MobileSearchOverlay from "./MobileSearchOverlay";
// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Quick access tiles shown on mobile hero ──────────────────────────────────
const QUICK_TILES = [
  { label: "Buy", icon: "🏠", href: "#" },
  { label: "Rent", icon: "🔑", href: "#" },
  { label: "Projects", icon: "🏗️", href: "#" },
  { label: "Commercial", icon: "🏢", href: "#" },
  { label: "PG", icon: "🛏️", href: "#" },
  { label: "Plots", icon: "📐", href: "#" },
];

const SearchIconGray = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="#94a3b8"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const SearchIconWhite = () => (
  <svg
    width="17"
    height="17"
    fill="none"
    stroke="rgba(255,255,255,0.7)"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const HomeSearch: React.FC = () => {
  const [searchType, setSearchType] = useState("Buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [overlayQuery, setOverlayQuery] = useState("");

  const openSearch = (q = "") => {
    setOverlayQuery(q);
    setMobileSearchOpen(true);
  };

  return (
    <>
      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        initialQuery={overlayQuery}
      />

      <div className="font-[DM_Sans,sans-serif]">
        {/* ── HERO SECTION ── */}
        <section
          className="relative bg-gradient-to-br from-[#0f2342] via-[#1a3a6e] to-[#0d3060]
          flex flex-col items-center justify-center text-center
          px-4 md:px-6 pt-10 pb-8 md:py-16 overflow-hidden"
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Trust badge */}
          <p
            className="relative text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400 mb-3"
            style={{ animation: "heroFadeUp 0.5s ease both" }}
          >
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
          <p
            className="relative text-white/60 text-sm max-w-[400px] mb-6 leading-relaxed hidden sm:block"
            style={{ animation: "heroFadeUp 0.5s 0.14s ease both" }}
          >
            Explore thousands of verified properties — flats, villas, plots &
            commercial spaces.
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
            <button
              className="bg-gradient-to-br from-amber-400 to-amber-600 text-[#0f2342]
              border-none rounded-lg px-5 py-[10px] text-sm font-bold font-[DM_Sans,sans-serif]
              cursor-pointer shrink-0 transition-all hover:-translate-y-px
              hover:shadow-[0_4px_14px_rgba(201,168,76,0.4)]"
            >
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
              <p className="text-xs font-semibold text-[#0f2342] leading-none mb-0.5">
                Search Properties
              </p>
              <p className="text-xs text-slate-400 truncate">
                City, locality, project...
              </p>
            </div>
            <span
              className="bg-amber-400 text-[#0f2342] text-[10px] font-black px-2.5 py-1.5
              rounded-lg flex-shrink-0"
            >
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
                <span className="text-white text-[9px] font-semibold tracking-wide">
                  {tile.label}
                </span>
              </a>
            ))}
          </div>

          {/* Quick chip searches — desktop */}
          <div
            className="relative hidden sm:flex flex-wrap justify-center gap-2"
            style={{ animation: "heroFadeUp 0.5s 0.22s ease both" }}
          >
            {[
              "2 BHK in Delhi",
              "Flats in Mumbai",
              "Villa in Bangalore",
              "PG in Noida",
            ].map((chip) => (
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
    </>
  );
};

export default HomeSearch;
