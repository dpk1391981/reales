"use client";

import { useRef, useState } from "react";

const agencies = [
  {
    name: "Kanhaiya Residency (P) Ltd.",
    location: "Karkardooma, Delhi",
    sale: 3,
    rent: 1,
    areas: ["Indirapuram", "Sector 28"],
    rating: 4.2,
    reviews: 18,
    initials: "KR",
  },
  {
    name: "Qube Real Estate Advisory LLP",
    location: "Barakhamba, Delhi",
    sale: 294,
    rent: 206,
    areas: ["Ambala", "Bathinda", "Bhiwadi"],
    rating: 4.8,
    reviews: 312,
    initials: "QR",
  },
  {
    name: "Sampatti Realty",
    location: "Dwarka, Delhi",
    sale: 87,
    rent: 12,
    areas: ["Dwarka", "Rohini", "Janakpuri"],
    rating: 4.5,
    reviews: 74,
    initials: "SR",
  },
  {
    name: "Shubham Properties",
    location: "Rohini, Delhi",
    sale: 124,
    rent: 98,
    areas: ["Rohini", "Pitampura"],
    rating: 4.6,
    reviews: 143,
    initials: "SP",
  },
  {
    name: "Perfect Property",
    location: "Laxmi Nagar, Delhi",
    sale: 32,
    rent: 11,
    areas: ["Laxmi Nagar", "Preet Vihar"],
    rating: 4.3,
    reviews: 52,
    initials: "PP",
  },
];

// ── Icons ──────────────────────────────────────────────────────────────────────

const LocationIcon = () => (
  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="11" height="11" viewBox="0 0 24 24"
    fill={filled ? "#f59e0b" : "none"}
    stroke={filled ? "#f59e0b" : "#d1d5db"}
    strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

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

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

// ── Star Rating ────────────────────────────────────────────────────────────────

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon key={i} filled={i <= Math.round(rating)} />
    ))}
  </div>
);

// ── Agency Card ───────────────────────────────────────────────────────────────

const AgencyCard = ({ agency }: { agency: typeof agencies[0] }) => {
  const total = agency.sale + agency.rent;

  return (
    <div
      className="flex-shrink-0 snap-start
        w-[82vw] max-w-[300px] sm:w-[300px] sm:max-w-none
        bg-white border border-slate-100 rounded-3xl overflow-hidden
        shadow-[0_2px_16px_rgba(15,35,66,0.07)]
        hover:shadow-[0_12px_40px_rgba(15,35,66,0.14)]
        active:scale-[0.98]
        transition-all duration-300 group cursor-pointer"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0f2342] to-amber-400" />

      <div className="p-4 md:p-5">
        {/* Header row: avatar + info */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex-shrink-0
            bg-gradient-to-br from-[#0f2342] to-[#1a3a6e]
            flex items-center justify-center
            text-white font-bold text-sm md:text-base shadow-sm
            group-hover:shadow-[0_4px_12px_rgba(15,35,66,0.3)]
            transition-shadow">
            {agency.initials}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-bold text-[#0f2342] leading-snug
              group-hover:text-amber-600 transition-colors line-clamp-2">
              {agency.name}
            </h3>
            <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <span className="text-amber-500"><LocationIcon /></span>
              {agency.location}
            </p>
          </div>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dashed border-slate-100">
          <StarRating rating={agency.rating} />
          <span className="text-xs font-bold text-[#0f2342]">{agency.rating}</span>
          <span className="text-xs text-slate-400">({agency.reviews} reviews)</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { value: agency.sale, label: "For Sale" },
            { value: agency.rent, label: "For Rent" },
            { value: total, label: "Total" },
          ].map((stat) => (
            <div key={stat.label}
              className="text-center bg-slate-50 rounded-2xl py-2.5 px-2">
              <p className="text-base md:text-lg font-bold text-[#0f2342] leading-none">
                {stat.value}
              </p>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-medium mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Area tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agency.areas.map((area) => (
            <span key={area}
              className="text-[10px] md:text-xs font-medium bg-white border border-slate-200
                px-2.5 py-1 rounded-full text-slate-600
                hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50
                active:bg-amber-50 transition-all cursor-pointer">
              {area}
            </span>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5
              bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
              text-xs md:text-sm font-bold py-2.5 md:py-3 rounded-2xl
              hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)] hover:-translate-y-px
              active:scale-[0.97] transition-all border-none cursor-pointer
              font-[DM_Sans,sans-serif]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            View Agency
            <ArrowRightIcon />
          </button>
          <button
            className="w-10 md:w-11 h-10 md:h-11 flex items-center justify-center flex-shrink-0
              border-2 border-amber-400 text-amber-600 rounded-2xl
              hover:bg-amber-50 active:scale-95
              transition-all border-none cursor-pointer bg-amber-50"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <PhoneIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Section ──────────────────────────────────────────────────────────────

export default function TopAgencies() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const cardWidth = sliderRef.current.scrollWidth / agencies.length;
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

      <section className="bg-[#f8fafc] py-10 md:py-20 overflow-hidden font-[DM_Sans,sans-serif]">
        <div className="max-w-[1280px] mx-auto">

          {/* ── Section Header ── */}
          <div className="fade-up px-4 md:px-6 mb-6 md:mb-10
            flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
                ✦ Trusted Partners
              </p>
              <h2 className="font-[Playfair_Display,serif] font-bold text-[#0f2342] leading-tight
                text-2xl md:text-3xl">
                Top{" "}
                <span className="text-amber-500">Real Estate Agencies</span>
                <br className="sm:hidden" />{" "}in Delhi
              </h2>
              <p className="text-slate-500 mt-2 text-sm max-w-[400px] leading-relaxed">
                Connect with verified, top-rated agencies with proven track records.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-10 h-1 bg-amber-500 rounded-full" />
                <div className="w-3 h-1 bg-amber-300 rounded-full" />
                <div className="w-1.5 h-1 bg-amber-200 rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View All — desktop */}
              <a href="#"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#0f2342]
                  border-2 border-slate-200 rounded-xl px-4 py-2.5 no-underline shrink-0
                  hover:border-[#0f2342] hover:bg-slate-50 transition-all">
                View All
                <ArrowRightIcon />
              </a>
              {/* Scroll arrows — desktop */}
              <div className="hidden md:flex gap-2">
                <button onClick={() => scroll("left")}
                  className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white
                    flex items-center justify-center text-slate-600
                    hover:border-[#0f2342] hover:bg-[#0f2342] hover:text-white
                    transition-all duration-200 shadow-sm cursor-pointer">
                  <ChevronLeftIcon />
                </button>
                <button onClick={() => scroll("right")}
                  className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white
                    flex items-center justify-center text-slate-600
                    hover:border-[#0f2342] hover:bg-[#0f2342] hover:text-white
                    transition-all duration-200 shadow-sm cursor-pointer">
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>

          {/* ── Slider ── */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="fade-up flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth no-scrollbar
              snap-x snap-mandatory
              pl-4 pr-4 md:pl-6 md:pr-6 pb-2"
            style={{ animationDelay: "0.1s" }}
          >
            {agencies.map((agency) => (
              <AgencyCard key={agency.name} agency={agency} />
            ))}

            {/* View All card */}
            <div
              className="flex-shrink-0 snap-start rounded-3xl overflow-hidden cursor-pointer
                flex flex-col items-center justify-center gap-3
                bg-gradient-to-br from-[#0f2342] to-[#1a3a6e]
                w-[60vw] max-w-[220px] sm:w-[200px] sm:max-w-none
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
                View All<br />Agencies
              </p>
              <p className="text-white/50 text-[10px]">500+ listed</p>
            </div>
          </div>

          {/* ── Scroll dots — mobile only ── */}
          <div className="md:hidden flex items-center justify-center gap-1.5 mt-4 px-4">
            {agencies.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!sliderRef.current) return;
                  const cardWidth = sliderRef.current.scrollWidth / (agencies.length + 1);
                  sliderRef.current.scrollTo({ left: i * cardWidth, behavior: "smooth" });
                  setActiveIdx(i);
                }}
                className={`rounded-full transition-all duration-300
                  ${i === activeIdx ? "w-6 h-2 bg-[#0f2342]" : "w-2 h-2 bg-slate-300"}`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              />
            ))}
          </div>

          {/* ── View All — mobile ── */}
          <div className="sm:hidden mt-5 px-4">
            <a href="#"
              className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold
                text-[#0f2342] border-2 border-slate-200 rounded-2xl no-underline
                active:bg-slate-50 transition-all">
              View All Agencies
              <ArrowRightIcon />
            </a>
          </div>

          {/* ── Trust strip ── */}
          <div className="fade-up mt-8 md:mt-12 mx-4 md:mx-6
            bg-gradient-to-r from-[#0f2342] to-[#1a3a6e]
            rounded-3xl px-5 md:px-10 py-5 md:py-6
            grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-0"
            style={{ animationDelay: "0.18s" }}>
            {[
              { value: "500+", label: "Verified Agencies" },
              { value: "4.6★", label: "Avg. Rating" },
              { value: "10yr+", label: "Avg. Experience" },
              { value: "RERA", label: "Certified Only" },
            ].map((stat, i) => (
              <div key={stat.label}
                className={`text-center ${i < 3 ? "sm:border-r sm:border-white/10" : ""}`}>
                <p className="text-xl md:text-2xl font-bold text-amber-400 font-[Playfair_Display,serif]">
                  {stat.value}
                </p>
                <p className="text-[11px] md:text-xs text-white/60 font-medium mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}