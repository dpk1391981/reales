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
    <section className="bg-[#f8fafc] py-20 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-semibold text-[#0f2342]">
            Top Real Estate Agencies in Delhi
          </h2>

          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow hover:bg-amber-50 transition"
            >
              ‹
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow hover:bg-amber-50 transition"
            >
              ›
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {agencies.map((agency) => (
            <div
              key={agency.name}
              className="min-w-[300px] bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Logo Placeholder */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 border border-slate-300 rounded-md flex items-center justify-center text-amber-500 font-bold text-xl">
                  🏠
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#0f2342]">
                    {agency.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {agency.location}
                  </p>
                </div>
              </div>

              {/* Property Counts */}
              <div className="text-sm text-slate-700 mb-3">
                <div>
                  <span className="font-semibold">
                    {agency.sale}
                  </span>{" "}
                  Sale Properties
                </div>
                <div>
                  <span className="font-semibold">
                    {agency.rent}
                  </span>{" "}
                  Rent Properties
                </div>
              </div>

              {/* Area Tags */}
              <div className="flex flex-wrap gap-2">
                {agency.areas.map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600"
                  >
                    {area}
                  </span>
                ))}
              </div>
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
