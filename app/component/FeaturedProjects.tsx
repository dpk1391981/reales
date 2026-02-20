"use client";

import { useState } from "react";

const projects = [
  {
    name: "Prestige Royal Heights",
    location: "Whitefield, Bangalore",
    price: "₹85L - ₹1.6Cr",
    bhk: "2 & 3 BHK",
    status: "Ready to Move",
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
  },
  {
    name: "DLF Luxury Towers",
    location: "Gurgaon, Delhi NCR",
    price: "₹1.8Cr - ₹4.2Cr",
    bhk: "3 & 4 BHK",
    status: "Under Construction",
    tag: "New Launch",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1200",
  },
  {
    name: "Lodha Waterfront",
    location: "Worli, Mumbai",
    price: "₹2.5Cr - ₹6Cr",
    bhk: "3, 4 & 5 BHK",
    status: "Ready to Move",
    tag: "Premium",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200",
  },
  {
    name: "Sobha City Vista",
    location: "Sector 108, Noida",
    price: "₹65L - ₹1.2Cr",
    bhk: "2 & 3 BHK",
    status: "Ready to Move",
    tag: "Limited Units",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200",
  },
  {
    name: "Godrej Horizon",
    location: "Hinjewadi, Pune",
    price: "₹72L - ₹1.4Cr",
    bhk: "2 & 3 BHK",
    status: "Under Construction",
    tag: "Trending",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200",
  },
  {
    name: "Brigade Orchards",
    location: "Devanahalli, Bangalore",
    price: "₹55L - ₹95L",
    bhk: "1, 2 & 3 BHK",
    status: "Ready to Move",
    tag: "Affordable",
    image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?q=80&w=1200",
  },
];

const FILTERS = ["All", "Ready to Move", "Under Construction"];

// ── Icons ──────────────────────────────────────────────────────────────────────

const LocationIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const BedIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 9V19M22 9V19M2 14H22M2 9C2 9 5 7 12 7C19 7 22 9 22 9" />
    <rect x="5" y="9" width="4" height="3" rx="1" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "currentColor"}
    strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// ── Project Card ───────────────────────────────────────────────────────────────

const ProjectCard = ({ project }: { project: typeof projects[0] }) => {
  const [saved, setSaved] = useState(false);
  const isReady = project.status === "Ready to Move";

  return (
    <div className="group bg-white rounded-3xl overflow-hidden
      shadow-[0_2px_16px_rgba(15,35,66,0.08)]
      hover:shadow-[0_12px_40px_rgba(15,35,66,0.16)]
      active:scale-[0.99]
      transition-all duration-300 border border-slate-100 cursor-pointer">

      {/* ── Image ── */}
      <div className="relative h-[200px] sm:h-[220px] overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700
            group-hover:scale-110"
          loading="lazy"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top row badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Status badge */}
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide
            ${isReady
              ? "bg-emerald-500 text-white"
              : "bg-amber-400 text-[#0f2342]"
            }`}>
            {project.status}
          </span>

          {/* Wishlist button */}
          <button
            onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center
              border transition-all active:scale-90
              ${saved
                ? "bg-white border-red-200 text-red-500"
                : "bg-white/80 border-white/50 text-slate-600 backdrop-blur-sm"
              }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <HeartIcon filled={saved} />
          </button>
        </div>

        {/* Tag pill at bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[9px] font-bold tracking-[0.12em] uppercase
            bg-white/90 backdrop-blur-sm text-[#0f2342] px-2.5 py-1 rounded-full border border-white/50">
            {project.tag}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 md:p-5">

        {/* Name */}
        <h3 className="text-base md:text-lg font-bold text-[#0f2342] leading-snug mb-1.5
          group-hover:text-amber-600 transition-colors">
          {project.name}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-slate-500 mb-3">
          <span className="text-amber-500"><LocationIcon /></span>
          {project.location}
        </p>

        {/* Price + BHK row */}
        <div className="flex items-center justify-between mb-3 py-3
          border-y border-dashed border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">Price</p>
            <p className="text-base font-bold text-[#0f2342]">{project.price}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">Config</p>
            <p className="flex items-center gap-1 text-sm font-semibold text-slate-600">
              <span className="text-amber-500"><BedIcon /></span>
              {project.bhk}
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex gap-2">
          <button className="flex-1 bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
            text-sm font-bold py-3 rounded-2xl transition-all
            hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)] hover:-translate-y-px
            active:scale-[0.97] flex items-center justify-center gap-1.5">
            View Details
            <ArrowRightIcon />
          </button>
          <button className="px-4 py-3 rounded-2xl border-2 border-amber-400 text-amber-600
            font-semibold text-sm transition-all hover:bg-amber-50 active:scale-[0.97]
            whitespace-nowrap">
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Section ───────────────────────────────────────────────────────────────

export default function FeaturedProjects() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.status === activeFilter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
      `}</style>

      <section className="bg-[#f8fafc] py-10 md:py-20 px-4 md:px-6 font-[DM_Sans,sans-serif]">
        <div className="max-w-[1280px] mx-auto">

          {/* ── Section Header ── */}
          <div className="fade-up mb-7 md:mb-12 flex flex-col sm:flex-row sm:items-end
            sm:justify-between gap-4">
            <div>
              {/* Eyebrow */}
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
                ✦ Handpicked for You
              </p>
              <h2 className="font-[Playfair_Display,serif] text-2xl md:text-4xl font-bold text-[#0f2342] leading-tight">
                Featured{" "}
                <span className="text-amber-500">Projects</span>
              </h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-[420px]">
                Premium residential projects across top Indian cities — verified & RERA approved.
              </p>
              {/* Underline */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-10 h-1 bg-amber-500 rounded-full" />
                <div className="w-3 h-1 bg-amber-300 rounded-full" />
                <div className="w-1.5 h-1 bg-amber-200 rounded-full" />
              </div>
            </div>

            {/* View All — desktop */}
            <a href="#"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#0f2342]
                border-2 border-slate-200 rounded-xl px-5 py-2.5 no-underline shrink-0
                hover:border-[#0f2342] hover:bg-slate-50 transition-all">
              View All Projects
              <ChevronRightIcon />
            </a>
          </div>

          {/* ── Filter Tabs ── */}
          <div className="fade-up flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ animationDelay: "0.08s", scrollbarWidth: "none" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold
                  border transition-all cursor-pointer font-[inherit] active:scale-95
                  ${activeFilter === f
                    ? "bg-[#0f2342] text-white border-[#0f2342] shadow-[0_4px_12px_rgba(15,35,66,0.25)]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {f}
                {f !== "All" && (
                  <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full
                    ${activeFilter === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {projects.filter((p) => p.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Projects Grid ── */}
          {/* Mobile: horizontal scroll snap, Desktop: 3-col grid */}
          <div
            className="fade-up
              flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4
              sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none
              lg:grid-cols-3 sm:gap-6"
            style={{ animationDelay: "0.14s", scrollbarWidth: "none" }}
          >
            {filtered.map((project) => (
              <div key={project.name}
                className="snap-start flex-shrink-0 w-[82vw] xs:w-[75vw] sm:w-auto">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          {/* ── Mobile scroll hint ── */}
          <div className="sm:hidden flex items-center justify-center gap-1.5 mt-4">
            {filtered.map((_, i) => (
              <div key={i} className={`rounded-full transition-all ${i === 0 ? "w-5 h-1.5 bg-[#0f2342]" : "w-1.5 h-1.5 bg-slate-300"}`} />
            ))}
          </div>

          {/* ── View All — mobile ── */}
          <div className="sm:hidden mt-6">
            <a href="#"
              className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold
                text-[#0f2342] border-2 border-slate-200 rounded-2xl no-underline
                active:bg-slate-50 transition-all">
              View All Projects
              <ChevronRightIcon />
            </a>
          </div>

          {/* ── Stats row ── */}
          <div
            className="fade-up mt-10 md:mt-14 grid grid-cols-3 gap-3 md:gap-6
              bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] rounded-3xl p-5 md:p-8"
            style={{ animationDelay: "0.2s" }}
          >
            {[
              { value: "1,200+", label: "Projects Listed" },
              { value: "RERA", label: "Verified Only" },
              { value: "48hr", label: "Response Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl md:text-3xl font-bold text-amber-400 font-[Playfair_Display,serif]">
                  {stat.value}
                </p>
                <p className="text-[11px] md:text-sm text-white/60 font-medium mt-0.5">
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