"use client";

const services = [
  {
    title: "Buy a Home",
    description: "Explore verified flats, villas & plots across India's top cities.",
    icon: "🏠",
    button: "Browse Properties",
    stat: "2.4L+ listings",
    color: "from-blue-50 to-indigo-50",
    accent: "#0f2342",
  },
  {
    title: "Sell Property",
    description: "List your property and connect with thousands of genuine buyers.",
    icon: "📈",
    button: "Post Property",
    stat: "Free listing",
    color: "from-amber-50 to-orange-50",
    accent: "#b45309",
  },
  {
    title: "Rent a Home",
    description: "Find rental apartments, PGs & commercial spaces easily.",
    icon: "🔑",
    button: "Explore Rentals",
    stat: "50K+ rentals",
    color: "from-emerald-50 to-teal-50",
    accent: "#065f46",
  },
  {
    title: "New Projects",
    description: "Discover newly launched and upcoming residential projects.",
    icon: "🏗️",
    button: "View Projects",
    stat: "1,200+ projects",
    color: "from-purple-50 to-pink-50",
    accent: "#6b21a8",
  },
];

const ArrowRightIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// ── Service Card ──────────────────────────────────────────────────────────────

const ServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => (
  <div
    className="group bg-white rounded-3xl overflow-hidden border border-slate-100
      shadow-[0_2px_16px_rgba(15,35,66,0.07)]
      hover:shadow-[0_16px_48px_rgba(15,35,66,0.14)]
      active:scale-[0.98]
      transition-all duration-300 cursor-pointer"
    style={{
      animationDelay: `${index * 0.07}s`,
      WebkitTapHighlightColor: "transparent",
    }}
  >
    {/* Gradient top strip */}
    <div className={`h-1.5 w-full bg-gradient-to-r ${
      index === 0 ? "from-[#0f2342] to-[#1a3a6e]" :
      index === 1 ? "from-amber-400 to-orange-500" :
      index === 2 ? "from-emerald-400 to-teal-500" :
                    "from-purple-500 to-pink-500"
    }`} />

    <div className="p-5 md:p-7">
      {/* Icon + stat row */}
      <div className="flex items-start justify-between mb-5">
        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${service.color}
          flex items-center justify-center text-3xl md:text-4xl
          group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          {service.icon}
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600
          bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          <CheckIcon />
          {service.stat}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-[#0f2342] mb-2 leading-snug
        group-hover:text-amber-600 transition-colors duration-200">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed mb-5">
        {service.description}
      </p>

      {/* CTA */}
      <button
        className="w-full flex items-center justify-center gap-2
          bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
          text-sm font-bold py-3 md:py-3.5 rounded-2xl
          hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)] hover:-translate-y-px
          active:scale-[0.97] transition-all duration-200 border-none cursor-pointer
          font-[DM_Sans,sans-serif]"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {service.button}
        <ArrowRightIcon />
      </button>
    </div>
  </div>
);

// ── Why Us strip ──────────────────────────────────────────────────────────────

const WHY_US = [
  { icon: "✅", text: "RERA Verified" },
  { icon: "📞", text: "Free Expert Call" },
  { icon: "🔒", text: "Secure Listings" },
  { icon: "⚡", text: "Instant Response" },
];

// ── Main Section ──────────────────────────────────────────────────────────────

export default function TopServices() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
      `}</style>

      <section className="bg-[#f8fafc] py-10 md:py-20 px-4 md:px-6 font-[DM_Sans,sans-serif]">
        <div className="max-w-[1280px] mx-auto">

          {/* ── Section Header ── */}
          <div className="fade-up text-center mb-8 md:mb-14">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
              ✦ What We Offer
            </p>
            <h2 className="font-[Playfair_Display,serif] font-bold text-[#0f2342] leading-tight
              text-2xl md:text-4xl">
              Our{" "}
              <span className="text-amber-500">Real Estate Services</span>
            </h2>
            <p className="text-slate-500 mt-3 text-sm max-w-[480px] mx-auto leading-relaxed">
              Whether you're buying, selling or renting — Think4BuySale provides
              complete real estate solutions.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-10 h-1 bg-amber-500 rounded-full" />
              <div className="w-3 h-1 bg-amber-300 rounded-full" />
              <div className="w-1.5 h-1 bg-amber-200 rounded-full" />
            </div>
          </div>

          {/* ── Services Grid ──
               Mobile:  2-col compact grid
               Desktop: 4-col grid
          ── */}
          <div className="fade-up grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
            style={{ animationDelay: "0.1s" }}>
            {services.map((service, i) => (
              <ServiceCard key={service.title} service={service} index={i} />
            ))}
          </div>

          {/* ── Why Us Trust Strip ── */}
          <div
            className="fade-up mt-8 md:mt-12 flex flex-wrap sm:flex-nowrap gap-3 md:gap-4
              bg-gradient-to-r from-[#0f2342] to-[#1a3a6e]
              rounded-3xl px-5 md:px-10 py-5 md:py-6"
            style={{ animationDelay: "0.18s" }}
          >
            {WHY_US.map((item, i) => (
              <div key={item.text}
                className={`flex items-center gap-2.5 flex-1 min-w-[calc(50%-6px)] sm:min-w-0
                  ${i < WHY_US.length - 1 ? "sm:border-r sm:border-white/10 sm:pr-4 md:pr-8" : ""}`}>
                <span className="text-xl md:text-2xl flex-shrink-0">{item.icon}</span>
                <span className="text-white text-xs md:text-sm font-semibold leading-tight">
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* ── Mobile CTA banner ── */}
          <div className="fade-up mt-5 sm:hidden
            bg-amber-400 rounded-3xl px-5 py-4
            flex items-center justify-between gap-3"
            style={{ animationDelay: "0.22s" }}>
            <div>
              <p className="text-[#0f2342] font-bold text-sm leading-none mb-0.5">
                Post Your Property FREE
              </p>
              <p className="text-[#0f2342]/70 text-xs">
                Reach 10M+ verified buyers
              </p>
            </div>
            <button
              className="flex-shrink-0 bg-[#0f2342] text-white text-xs font-bold
                px-4 py-2.5 rounded-xl active:scale-95 transition-all border-none
                cursor-pointer font-[inherit]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              Post Now →
            </button>
          </div>

        </div>
      </section>
    </>
  );
}