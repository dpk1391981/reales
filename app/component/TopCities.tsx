"use client";

import { useRef, useState } from "react";

const cities = [
  {
    name: "Delhi / NCR",
    properties: "139,000+",
    label: "Properties",
    tagline: "India's Capital Region",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200",
  },
  {
    name: "Mumbai",
    properties: "33,000+",
    label: "Properties",
    tagline: "City of Dreams",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200",
  },
  {
    name: "Bangalore",
    properties: "35,000+",
    label: "Properties",
    tagline: "Silicon Valley of India",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1200",
  },
  {
    name: "Hyderabad",
    properties: "21,000+",
    label: "Properties",
    tagline: "City of Pearls",
    image: "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=1200",
  },
  {
    name: "Chennai",
    properties: "18,000+",
    label: "Properties",
    tagline: "Gateway to South India",
    image: "https://images.unsplash.com/photo-1587125935554-5b57c76c2f6b?q=80&w=1200",
  },
  {
    name: "Pune",
    properties: "14,500+",
    label: "Properties",
    tagline: "Oxford of the East",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200",
  },
];

// ── Icons ──────────────────────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── City Card ─────────────────────────────────────────────────────────────────

const CityCard = ({ city, size = "normal" }: {
  city: typeof cities[0];
  size?: "normal" | "large";
}) => (
  <div
    className={`
      relative flex-shrink-0 rounded-3xl overflow-hidden cursor-pointer group
      snap-start
      ${size === "large"
        ? "w-[72vw] h-[52vw] max-w-[340px] max-h-[260px] sm:w-[300px] sm:h-[380px] sm:max-w-none sm:max-h-none"
        : "w-[60vw] h-[44vw] max-w-[260px] max-h-[200px] sm:w-[240px] sm:h-[320px] sm:max-w-none sm:max-h-none"
      }
    `}
    style={{ WebkitTapHighlightColor: "transparent" }}
  >
    {/* Image */}
    <img
      src={city.image}
      alt={city.name}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover
        transition-transform duration-700 group-hover:scale-110 group-active:scale-105"
    />

    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

    {/* Hover shimmer */}
    <div className="absolute inset-0 bg-[#0f2342]/0 group-hover:bg-[#0f2342]/20 transition-all duration-500" />

    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
      {/* Tagline — hidden on tiny cards */}
      <p className="hidden sm:block text-white/60 text-[10px] font-medium uppercase
        tracking-widest mb-1">
        {city.tagline}
      </p>

      <h3 className="text-white font-bold leading-tight mb-2
        text-base sm:text-xl md:text-2xl">
        {city.name}
      </h3>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 bg-amber-400 text-[#0f2342]
          text-[9px] sm:text-xs font-bold px-2.5 sm:px-4 py-1 rounded-full">
          <MapPinIcon />
          {city.properties} {city.label}
        </span>

        {/* Arrow — shows on hover desktop, always on mobile */}
        <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm
          flex items-center justify-center text-white
          sm:opacity-0 sm:group-hover:opacity-100 sm:-translate-x-2 sm:group-hover:translate-x-0
          transition-all duration-300">
          <ArrowRightIcon />
        </span>
      </div>
    </div>
  </div>
);

// ── Main Section ──────────────────────────────────────────────────────────────

export default function TopCities() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  // Track active dot on scroll
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const cardWidth = sliderRef.current.scrollWidth / cities.length;
    setActiveIdx(Math.round(scrollLeft / cardWidth));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
      `}</style>

      <section className="bg-white py-10 md:py-20 overflow-hidden font-[DM_Sans,sans-serif]">
        <div className="max-w-[1280px] mx-auto">

          {/* ── Section Header ── */}
          <div className="fade-up px-4 md:px-6 mb-6 md:mb-10
            flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
                ✦ Top Locations
              </p>
              <h2 className="font-[Playfair_Display,serif] font-bold text-[#0f2342] leading-tight
                text-2xl md:text-4xl">
                Explore Real Estate in{" "}
                <span className="text-amber-500">Popular Cities</span>
              </h2>
              <p className="text-slate-500 mt-2 text-sm max-w-[420px] leading-relaxed">
                Discover top residential hubs with thousands of verified listings
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-10 h-1 bg-amber-500 rounded-full" />
                <div className="w-3 h-1 bg-amber-300 rounded-full" />
                <div className="w-1.5 h-1 bg-amber-200 rounded-full" />
              </div>
            </div>

            {/* Desktop arrow controls */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => scroll("left")}
                className="w-11 h-11 rounded-full border-2 border-slate-200 bg-white
                  flex items-center justify-center text-slate-600
                  hover:border-[#0f2342] hover:bg-[#0f2342] hover:text-white
                  transition-all duration-200 shadow-sm"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-11 h-11 rounded-full border-2 border-slate-200 bg-white
                  flex items-center justify-center text-slate-600
                  hover:border-[#0f2342] hover:bg-[#0f2342] hover:text-white
                  transition-all duration-200 shadow-sm"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* ── Slider ── */}
          {/* px-4 bleed on mobile so first card peeks nicely */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="fade-up flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth no-scrollbar
              snap-x snap-mandatory
              pl-4 pr-4 md:pl-6 md:pr-6
              pb-2"
            style={{ animationDelay: "0.1s" }}
          >
            {cities.map((city, i) => (
              <CityCard
                key={city.name}
                city={city}
                /* First city gets the large card on mobile */
                size={i === 0 ? "large" : "normal"}
              />
            ))}

            {/* View All card at the end */}
            <div
              className="flex-shrink-0 snap-start rounded-3xl overflow-hidden cursor-pointer
                flex flex-col items-center justify-center gap-3
                bg-gradient-to-br from-[#0f2342] to-[#1a3a6e]
                w-[60vw] h-[44vw] max-w-[260px] max-h-[200px]
                sm:w-[200px] sm:h-[320px] sm:max-w-none sm:max-h-none
                border-2 border-dashed border-white/20
                active:scale-[0.97] transition-all"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="#0f2342" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-white font-bold text-sm text-center leading-tight px-4">
                View All<br />Cities
              </p>
              <p className="text-white/50 text-[10px]">50+ cities</p>
            </div>
          </div>

          {/* ── Scroll indicator dots — mobile only ── */}
          <div className="md:hidden flex items-center justify-center gap-1.5 mt-4 px-4">
            {cities.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!sliderRef.current) return;
                  const cardWidth = sliderRef.current.scrollWidth / (cities.length + 1);
                  sliderRef.current.scrollTo({ left: i * cardWidth, behavior: "smooth" });
                  setActiveIdx(i);
                }}
                className={`rounded-full transition-all duration-300
                  ${i === activeIdx
                    ? "w-6 h-2 bg-[#0f2342]"
                    : "w-2 h-2 bg-slate-300"
                  }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              />
            ))}
          </div>

          {/* ── City stat pills — horizontal scroll on mobile ── */}
          <div
            className="fade-up flex gap-3 overflow-x-auto no-scrollbar
              px-4 md:px-6 mt-7 md:mt-10 pb-1"
            style={{ animationDelay: "0.18s" }}
          >
            {cities.map((city) => (
              <button
                key={city.name}
                className="flex-shrink-0 flex items-center gap-2.5
                  bg-slate-50 hover:bg-amber-50 active:bg-amber-50
                  border border-slate-200 hover:border-amber-300 active:border-amber-300
                  rounded-2xl px-4 py-2.5 transition-all cursor-pointer font-[inherit]
                  active:scale-95"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span className="text-amber-500"><MapPinIcon /></span>
                <span className="text-[13px] font-semibold text-[#0f2342] whitespace-nowrap">
                  {city.name}
                </span>
                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                  {city.properties}
                </span>
              </button>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}