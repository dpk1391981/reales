"use client";

import { useRef } from "react";

const agencies = [
  {
    name: "Kanhaiya Residency (P) Ltd.",
    location: "Karkardooma, Delhi",
    sale: 3,
    rent: 1,
    areas: ["Indirapuram", "Sector 28"],
  },
  {
    name: "Qube Real Estate Advisory LLP",
    location: "Barakhamba, Delhi",
    sale: 294,
    rent: 206,
    areas: ["Ambala", "Bathinda", "Bhiwadi"],
  },
  {
    name: "Sampatti Realty",
    location: "Dwarka, Delhi",
    sale: 87,
    rent: 12,
    areas: ["Dwarka", "Rohini", "Janakpuri"],
  },
  {
    name: "Shubham Properties",
    location: "Rohini, Delhi",
    sale: 124,
    rent: 98,
    areas: ["Rohini", "Pitampura"],
  },
  {
    name: "Perfect Property",
    location: "Laxmi Nagar, Delhi",
    sale: 32,
    rent: 11,
    areas: ["Laxmi Nagar", "Preet Vihar"],
  },
];

export default function TopAgencies() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-24 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">

        {/* Section Header */}
        <div className="flex justify-between items-center mb-14">
          <div>
            <h2 className="text-3xl font-bold text-[#0f2342]">
              Top{" "}
              <span className="text-amber-500">
                Real Estate Agencies
              </span>{" "}
              in Delhi
            </h2>
            <div className="w-16 h-1 bg-amber-500 mt-4 rounded-full" />
          </div>

          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow hover:bg-amber-50 transition"
            >
              ‹
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow hover:bg-amber-50 transition"
            >
              ›
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-8 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {agencies.map((agency) => (
            <div
              key={agency.name}
              className="min-w-[320px] bg-[#f9fafb] border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
            >
              {/* Logo Placeholder */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] flex items-center justify-center text-white font-bold text-lg shadow">
                  🏢
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#0f2342] group-hover:text-amber-500 transition">
                    {agency.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    📍 {agency.location}
                  </p>
                </div>
              </div>

              {/* Property Counts */}
              <div className="flex gap-6 text-sm mb-4">
                <div>
                  <span className="font-semibold text-[#0f2342]">
                    {agency.sale}
                  </span>{" "}
                  <span className="text-slate-500">
                    Sale
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-[#0f2342]">
                    {agency.rent}
                  </span>{" "}
                  <span className="text-slate-500">
                    Rent
                  </span>
                </div>
              </div>

              {/* Area Tags */}
              <div className="flex flex-wrap gap-2">
                {agency.areas.map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 hover:border-amber-400 hover:text-amber-600 transition"
                  >
                    {area}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <button className="mt-6 w-full bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg transition">
                View Agency
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
