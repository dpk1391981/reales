"use client";
import { useState } from "react";

const FAQS = [
  { q: "How do I post a property?",        a: "Click 'Post Property' from the sidebar. Fill in all 5 steps and hit Publish. Your listing goes live within 24h after review." },
  { q: "Why was my listing rejected?",     a: "Listings are rejected for incorrect info, prohibited content, or duplicates. Check Notifications for the specific reason and resubmit after editing." },
  { q: "How does the wallet work?",        a: "Add money to your wallet and use it to buy listing tokens. Every 20th free post deducts 1 token automatically." },
  { q: "How do I renew an expired listing?", a: "Go to My Listings → find expired listing → click Renew. This reactivates it and brings it back into search." },
  { q: "How do I boost my listing?",       a: "In My Listings, click ⚡ Boost on any active listing. The cost is deducted from your wallet balance." },
  { q: "How do I update my contact details?", a: "Go to My Profile → Info tab → update your name, email or phone number and save." },
];

export const Support = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="pf text-lg font-bold text-[#0B3C8C] mb-1">Help & Support</h2>
      <p className="text-xs text-slate-400 mb-5">Get answers or contact our team</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { icon: "💬", label: "Live Chat",  sub: "Mon–Sat 9AM–6PM" },
          { icon: "📧", label: "Email Us",   sub: "support@think4buysale.in" },
          { icon: "📞", label: "Call Us",    sub: "+91 98765 43210" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-blue-50 p-4 text-center hover:border-blue-200 hover:shadow-sm transition-all">
            <p className="text-2xl mb-2">{c.icon}</p>
            <p className="text-[11px] font-black text-[#0B3C8C]">{c.label}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">FAQ</p>
      <div className="space-y-2">
        {FAQS.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left border-none cursor-pointer bg-transparent font-[inherit] hover:bg-blue-50/50 transition-colors">
              <p className="text-[12px] font-bold text-[#0B3C8C]">{f.q}</p>
              <span className={`text-blue-400 transition-transform duration-200 flex-shrink-0 ${open === i ? "rotate-180" : ""}`}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 border-t border-blue-50">
                <p className="text-[11px] text-slate-500 leading-relaxed mt-3">{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
