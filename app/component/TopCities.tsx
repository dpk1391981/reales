"use client";

import { useRef } from "react";

const cities = [
  {
    name: "Delhi / NCR",
    properties: "139,000+ Properties",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200",
  },
  {
    name: "Mumbai",
    properties: "33,000+ Properties",
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200",
  },
  {
    name: "Bangalore",
    properties: "35,000+ Properties",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1200",
  },
  {
    name: "Hyderabad",
    properties: "21,000+ Properties",
    image:
      "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=1200",
  },
  {
    name: "Chennai",
    properties: "18,000+ Properties",
    image:
      "https://images.unsplash.com/photo-1587125935554-5b57c76c2f6b?q=80&w=1200",
  },
];

export default function TopCities() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#f9fafb] py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">

        {/* Section Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <h2 className="text-4xl font-bold text-[#0f2342]">
              Explore Real Estate in{" "}
              <span className="text-amber-500">
                Popular Indian Cities
              </span>
            </h2>
            <p className="text-slate-500 mt-3 text-sm">
              Discover top residential hubs with thousands of verified listings
            </p>
          </div>

          {/* Arrows */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-amber-50 transition"
            >
              ‹
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-amber-50 transition"
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
          {cities.map((city) => (
            <div
              key={city.name}
              className="relative min-w-[350px] h-[420px] rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
            >
              {/* Image */}
              <img
                src={city.image}
                alt={city.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-semibold mb-2">
                  {city.name}
                </h3>

                <span className="inline-block bg-amber-500 text-[#0f2342] text-xs font-semibold px-4 py-1 rounded-full">
                  {city.properties}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hide Scrollbar */}
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
