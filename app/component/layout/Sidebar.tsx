"use client";

import { FormData } from "../../types";
import { SaveStatus } from "../../types";
import { Ico } from "../icons/Ico";

interface SidebarProps {
  d: FormData;
  saveStatus: SaveStatus;
  onSave: () => void;
}

export const Sidebar = ({ d, saveStatus, onSave }: SidebarProps) => {
  const filled = [
    d.propertyCategory,
    d.listingType,
    d.price,
    d.area,
    d.city,
    d.locality,
    d.ownerName,
    d.ownerPhone,
    (d.photos || []).length > 0 ? "y" : "",
  ].filter(Boolean).length;

  const score = filled * 11;

  const checkItems = [
    { l: "Category selected", done: !!d.propertyCategory },
    { l: "Price filled", done: !!d.price },
    { l: "Location added", done: !!d.city && !!d.locality },
    { l: "Contact added", done: !!d.ownerName && !!d.ownerPhone },
    { l: "Photos uploaded", done: (d.photos || []).length > 0 },
    { l: "Description written", done: d.description.length > 50 },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Profile score */}
      <div className="bg-white rounded-2xl border-2 border-blue-100 p-4 shadow-[0_2px_16px_rgba(11,60,140,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-widest text-[#0B3C8C]">Profile Score</p>
          <span className="text-xs font-black text-blue-500">{score}%</span>
        </div>
        <div className="h-2 bg-blue-50 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] rounded-full transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {checkItems.map((item) => (
            <div key={item.l} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${item.done ? "bg-emerald-100" : "bg-blue-50"}`}
              >
                {item.done ? (
                  <Ico.Check s={9} c="#10b981" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 block" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${item.done ? "text-slate-700 line-through decoration-emerald-400" : "text-slate-400"}`}
              >
                {item.l}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save draft */}
      <button
        onClick={onSave}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-blue-100 bg-white text-[#0B3C8C] text-sm font-bold hover:border-[#1D4ED8] hover:bg-blue-50 active:scale-[0.97] transition-all cursor-pointer font-[inherit]"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <Ico.Save /> Save Draft
      </button>

      {/* Pro tips */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border-2 border-blue-100 p-4">
        <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-1.5">
          <Ico.Spark /> Pro Tips
        </p>
        {[
          "Properties with 5+ photos get 5× more views",
          "Detailed descriptions attract serious buyers",
          "Add amenities to rank higher in search",
          "Verify your number for trust badge",
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
            <div className="w-4 h-4 rounded-full bg-blue-200 flex-shrink-0 flex items-center justify-center mt-0.5">
              <span className="text-[9px] font-black text-blue-700">{i + 1}</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">{t}</p>
          </div>
        ))}
      </div>

      {/* Marketing executive */}
      <div className="bg-gradient-to-br from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] rounded-2xl p-4 text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-3">
          Marketing Executive
        </p>
        {[
          ["Listings Sold", "120"],
          ["Collection", "₹84,550"],
          ["Leads", "4 Active"],
          ["Commission", "₹12,990"],
        ].map(([l, v]) => (
          <div key={String(l)} className="flex justify-between py-1.5 border-b border-white/10 last:border-0">
            <span className="text-[11px] text-white/60">{l}</span>
            <span className="text-[11px] font-black text-blue-200">{v}</span>
          </div>
        ))}
        <button
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-xs font-black rounded-xl border-none cursor-pointer active:scale-95 transition-all font-[inherit] shadow-[0_2px_12px_rgba(37,99,235,0.4)]"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          + Add Paid Listing
        </button>
        <div className="mt-3 flex flex-col gap-1">
          {["Client List →", "Renew Reminder →", "Dashboard →"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[11px] text-white/50 hover:text-blue-200 no-underline transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
