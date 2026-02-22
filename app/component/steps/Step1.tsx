"use client";

import { Ico } from "../icons/Ico";

const CATEGORY_ICONS: Record<string, string> = {
  home: "🏠",
  building: "🏢",
  factory: "🏭",
  bed: "🛏️",
  construction: "🏗️",
};

const PLANS = [
  {
    key: "silver",
    name: "Silver",
    price: "₹999",
    perks: ["20 Active Listings", "Normal Ranking", "WhatsApp Leads", "Dashboard Access"],
    gradient: "linear-gradient(135deg,#94a3b8 0%,#64748b 100%)",
    highlight: false,
  },
  {
    key: "gold",
    name: "Gold",
    price: "₹1,999",
    perks: ["30 Active Listings", "Priority Ranking", "HD Photo Boost", "Featured Badge", "Contact Analytics"],
    gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
    highlight: true,
  },
  {
    key: "platinum",
    name: "Platinum",
    price: "₹3,999",
    perks: ["Unlimited Listings", "Top Ranking", "HD + Virtual Tour", "Multiple Featured", "Full Analytics", "Dedicated Support"],
    gradient: "linear-gradient(135deg,#0B3C8C 0%,#3B82F6 100%)",
    highlight: false,
  },
];

interface Step1Props {
  d: {
    propertyCategory: string;
    listingType: string;
    plan: string;
    selectedPlan?: string;
  };
  s: (k: string, v: any) => void;
  masters: any;
}

export const Step1 = ({ d, s, masters }: Step1Props) => {
  const categories = masters?.categories?.filter((c: any) => c.is_active) || [];
  const selectedCategory = categories.find((c: any) => c.slug === d.propertyCategory);
  const listingTypes = selectedCategory?.listing_types?.filter((lt: any) => lt.is_active) || [];

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 1 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          What are you listing?
        </h2>
        <p className="text-slate-500 text-sm mt-2">Choose your property category and listing intent</p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => s("propertyCategory", cat.slug)}
            className={`relative flex flex-col items-center gap-2 py-5 px-3 rounded-3xl border-2 font-semibold text-sm
              transition-all duration-200 cursor-pointer font-[inherit] active:scale-[0.97] overflow-hidden
              ${
                d.propertyCategory === cat.slug
                  ? "border-[#1D4ED8] bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] text-white shadow-[0_8px_32px_rgba(29,78,216,0.25)]"
                  : "border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:shadow-md"
              }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {d.propertyCategory === cat.slug && (
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white" />
              </div>
            )}
            <span className="text-3xl relative z-10">{CATEGORY_ICONS[cat.icon] || "🏠"}</span>
            <span className="text-xs font-bold text-center leading-tight relative z-10">{cat.name}</span>
            {d.propertyCategory === cat.slug && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                <Ico.Check s={10} c="white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Listing intent */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-3xl p-5 border border-blue-100 mb-6">
        <p className="text-xs font-black tracking-[0.15em] uppercase text-slate-500 mb-3">Listing Intent</p>
        <div className="flex flex-wrap gap-2">
          {listingTypes.map((t: any) => (
            <button
              key={t.id}
              onClick={() => s("listingType", t.slug)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 font-bold text-sm
                transition-all duration-200 cursor-pointer font-[inherit] active:scale-95
                ${
                  d.listingType === t.slug
                    ? "border-[#1D4ED8] bg-[#1D4ED8]/10 text-[#1D4ED8] shadow-[0_2px_12px_rgba(29,78,216,0.2)]"
                    : "border-blue-100 bg-white text-slate-600 hover:border-blue-300"
                }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="text-lg">{t.icon}</span>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Plan toggle */}
      <div>
        <p className="text-xs font-black tracking-[0.15em] uppercase text-slate-500 mb-3">Listing Plan</p>
        <div className="flex gap-2 bg-blue-50 p-1.5 rounded-2xl mb-4">
          {["free", "paid"].map((p) => (
            <button
              key={p}
              onClick={() => s("plan", p)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer border-none font-[inherit]
                ${
                  d.plan === p
                    ? p === "free"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_2px_12px_rgba(29,78,216,0.4)]"
                    : "bg-transparent text-slate-400"
                }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {p === "free" ? "🆓 Free Listing" : "⚡ Paid Listing"}
            </button>
          ))}
        </div>

        {d.plan === "paid" && (
          <div className="grid gap-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                onClick={() => s("selectedPlan", plan.key)}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                  ${
                    d.selectedPlan === plan.key
                      ? "border-[#1D4ED8] bg-blue-50"
                      : "border-blue-100 bg-white hover:border-blue-200"
                  }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {plan.highlight && (
                  <div className="absolute -top-2.5 left-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-black"
                  style={{ background: plan.gradient }}
                >
                  {plan.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0B3C8C]">{plan.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.perks.slice(0, 3).map((p) => (
                      <span key={p} className="text-[9px] font-semibold text-slate-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                        {p}
                      </span>
                    ))}
                    {plan.perks.length > 3 && (
                      <span className="text-[9px] font-semibold text-slate-400">+{plan.perks.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black text-[#0B3C8C]">{plan.price}</p>
                  <p className="text-[10px] text-slate-400">/ listing</p>
                </div>
                {d.selectedPlan === plan.key && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1D4ED8] flex items-center justify-center">
                    <Ico.Check s={10} c="white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};