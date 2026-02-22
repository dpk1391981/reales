"use client";

import { PanelData } from "../UserPanel";
import { deletePropertyApi } from "@/services/propertyApi";
import { useState } from "react";

interface Props { data: PanelData; onRefresh: () => void; }

const fmtPrice = (v: any) => {
  const n = Number(v);
  if (!n) return "No price";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

export const MyDrafts = ({ data, onRefresh }: Props) => {
  const [deleting, setDel] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this draft?")) return;
    setDel(id);
    try { await deletePropertyApi(id); onRefresh(); }
    catch { alert("Failed to delete."); }
    finally { setDel(null); }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="pf text-lg font-bold text-[#0B3C8C]">Saved Drafts</h2>
          <p className="text-xs text-slate-400 mt-0.5">Continue where you left off</p>
        </div>
        <a href="/post-property"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-[11px] font-black rounded-xl no-underline hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all">
          ➕ New Listing
        </a>
      </div>

      {data.loadingProps ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-blue-50" />)}
        </div>
      ) : data.draft.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-blue-100 p-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm font-bold text-slate-500">No drafts saved</p>
          <p className="text-xs text-slate-400 mt-1">Start a listing — it auto-saves as a draft</p>
          <a href="/post-property"
            className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-[11px] font-black rounded-xl no-underline">
            Start Now
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {data.draft.map((p: any) => {
            // Calculate completion percentage based on filled fields
            const fields = ["propertyCategory","listingType","price","area","locality","ownerName","ownerPhone"];
            const filled = fields.filter((f) => p[f]).length;
            const pct = Math.round((filled / fields.length) * 100);

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-amber-100 shadow-[0_2px_12px_rgba(245,158,11,0.06)] hover:shadow-md transition-all overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-16 h-14 rounded-xl bg-amber-50 flex-shrink-0 overflow-hidden">
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-[#0B3C8C] truncate">
                        {p.bhk ? `${p.bhk} ` : ""}
                        {p.residentialType || p.commercialType || p.propertyCategory || "Untitled Draft"}
                      </p>
                      <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full flex-shrink-0">DRAFT</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {[p.locality, p.city].filter(Boolean).join(", ") || "Location not set"} · {fmtPrice(p.price)}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-slate-400">Completion</span>
                        <span className="text-[9px] font-black text-amber-600">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{width:`${pct}%`}} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-300 mt-1.5">
                      Last saved: {p.updated_at ? new Date(p.updated_at).toLocaleString("en-IN") : "—"}
                    </p>
                  </div>
                </div>
                <div className="border-t border-amber-50 px-4 py-2.5 flex gap-2">
                  <a href={`/post-property?draft=${p.id}`}
                    className="text-[10px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg no-underline transition-colors">
                    ✏️ Continue Editing
                  </a>
                  <a href={`/post-property?draft=${p.id}&publish=1`}
                    className="text-[10px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg no-underline transition-colors">
                    🚀 Publish Now
                  </a>
                  <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                    className="text-[10px] font-black text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border-none cursor-pointer font-[inherit] transition-colors disabled:opacity-50 ml-auto">
                    {deleting === p.id ? "⏳" : "🗑 Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
