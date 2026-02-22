"use client";

import { useState } from "react";
import { PanelData } from "../UserPanel";
import { deletePropertyApi, buyBoostApi } from "@/services/propertyApi";

interface Props { data: PanelData; onRefresh: () => void; }

const fmtPrice = (v: any) => {
  const n = Number(v);
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const STATUS_TABS = [
  { key: "all",       label: "All",      color: "text-slate-600" },
  { key: "published", label: "Active",   color: "text-emerald-600" },
  { key: "draft",     label: "Drafts",   color: "text-amber-600" },
  { key: "rejected",  label: "Rejected", color: "text-red-600" },
  { key: "expired",   label: "Expired",  color: "text-slate-500" },
];

const statusBadge: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-amber-100  text-amber-700",
  rejected:  "bg-red-100    text-red-600",
  expired:   "bg-slate-100  text-slate-600",
};

export const MyListings = ({ data, onRefresh }: Props) => {
  const [tab, setTab]         = useState("all");
  const [deleting, setDel]    = useState<number | null>(null);
  const [boosting, setBoost]  = useState<number | null>(null);
  const [search, setSearch]   = useState("");

  const all = [
    ...data.published.map((p: any) => ({ ...p, status: p.status ?? "published" })),
    ...data.draft.map((p: any)     => ({ ...p, status: p.status ?? "draft" })),
    ...data.rejected.map((p: any)  => ({ ...p, status: p.status ?? "rejected" })),
    ...data.expired.map((p: any)   => ({ ...p, status: p.status ?? "expired" })),
  ];

  const filtered = all
    .filter((p) => tab === "all" || p.status === tab)
    .filter((p) => !search || JSON.stringify(p).toLowerCase().includes(search.toLowerCase()));

  const counts: Record<string, number> = {
    all:       all.length,
    published: data.published.length,
    draft:     data.draft.length,
    rejected:  data.rejected.length,
    expired:   data.expired.length,
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDel(id);
    try { await deletePropertyApi(id); onRefresh(); }
    catch { alert("Delete failed. Please try again."); }
    finally { setDel(null); }
  };

  const handleBoost = async (id: number) => {
    setBoost(id);
    try { await buyBoostApi(id, 1); alert("Boost activated! ✅"); onRefresh(); }
    catch { alert("Boost failed. Check wallet balance."); }
    finally { setBoost(null); }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search listings..."
            className="w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-2.5 text-sm text-[#0B3C8C] placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
        </div>
        <a href="/post-property"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-[11px] font-black rounded-xl no-underline hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all">
          ➕ Add Listing
        </a>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white border border-blue-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border-none cursor-pointer font-[inherit] flex-shrink-0
              ${tab === t.key ? "bg-[#0B3C8C] text-white shadow-sm" : `bg-transparent ${t.color} hover:bg-blue-50`}`}>
            {t.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black
              ${tab === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {data.loadingProps ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-blue-50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-blue-100 p-12 text-center">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-sm font-bold text-slate-500 mb-1">No listings found</p>
          <p className="text-xs text-slate-400">
            {tab === "all" ? "Post your first property to get started" : `No ${tab} listings`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border border-blue-50 shadow-[0_2px_12px_rgba(11,60,140,0.04)] hover:shadow-[0_4px_20px_rgba(11,60,140,0.08)] transition-all overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Photo */}
                <div className="w-20 h-16 rounded-xl bg-blue-50 flex-shrink-0 overflow-hidden">
                  {p.photos?.[0]
                    ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0B3C8C] truncate">
                        {p.bhk ? `${p.bhk} ` : ""}
                        {p.residentialType || p.commercialType || p.industrialType || p.propertyCategory || "Property"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        📍 {[p.locality, p.city].filter(Boolean).join(", ") || "Location not set"}
                      </p>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge[p.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {(p.status ?? "").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-sm font-black text-[#0B3C8C]">{fmtPrice(p.price)}</span>
                    {p.area && <span className="text-[11px] text-slate-400">{p.area} sq.ft</span>}
                    {p.listingType && (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                        {p.listingType}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">👁 {p.views ?? 0} views</span>
                    <span className="text-[10px] text-slate-400">📞 {p.enquiries ?? 0} leads</span>
                  </div>

                  {/* Rejection reason */}
                  {p.status === "rejected" && p.rejection_reason && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                      <p className="text-[10px] font-bold text-red-600">Reason: {p.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-blue-50 px-4 py-2.5 flex gap-2 flex-wrap">
                <a href={`/post-property?edit=${p.id}`}
                  className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg no-underline transition-colors">
                  ✏️ Edit
                </a>
                <a href={`/property/${p.slug ?? p.id}`} target="_blank" rel="noreferrer"
                  className="text-[10px] font-black text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg no-underline transition-colors">
                  👁 View
                </a>
                {p.status === "published" && (
                  <button onClick={() => handleBoost(p.id)} disabled={boosting === p.id}
                    className="text-[10px] font-black text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border-none cursor-pointer font-[inherit] transition-colors disabled:opacity-50">
                    {boosting === p.id ? "⏳" : "⚡ Boost"}
                  </button>
                )}
                {p.status === "draft" && (
                  <a href={`/post-property?draft=${p.id}`}
                    className="text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg no-underline transition-colors">
                    🚀 Publish
                  </a>
                )}
                {p.status === "expired" && (
                  <button className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border-none cursor-pointer font-[inherit] transition-colors">
                    🔄 Renew
                  </button>
                )}
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                  className="text-[10px] font-black text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border-none cursor-pointer font-[inherit] transition-colors disabled:opacity-50 ml-auto">
                  {deleting === p.id ? "⏳" : "🗑 Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
