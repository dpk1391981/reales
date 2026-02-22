"use client";

import { PanelData } from "../UserPanel";

interface Props {
  data: PanelData;
  onNavigate: (k: string) => void;
  user: any;
}

const fmtPrice = (v: string | number) => {
  const n = Number(v);
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const statusColor: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-amber-100 text-amber-700",
  rejected:  "bg-red-100 text-red-600",
  expired:   "bg-slate-100 text-slate-600",
};

export const DashboardHome = ({ data, onNavigate, user }: Props) => {
  const totalViews   = data.published.reduce((s: number, p: any) => s + (p.views ?? 0), 0);
  const totalLeads   = data.published.reduce((s: number, p: any) => s + (p.enquiries ?? p.leads ?? 0), 0);
  const totalSaved   = data.published.reduce((s: number, p: any) => s + (p.saved_count ?? 0), 0);
  const walletBal    = data.wallet?.balance ?? user?.balance ?? 0;
  const allListings  = [...data.published, ...data.draft, ...data.rejected, ...data.expired];
  const recent5      = allListings.slice(0, 5);

  const STATS = [
    { label: "Active Listings",  value: data.loadingProps ? "—" : data.published.length, icon: "🏠", grad: "from-[#1D4ED8] to-[#2563EB]", sub: `${data.draft.length} drafts` },
    { label: "Total Views",      value: data.loadingProps ? "—" : totalViews.toLocaleString(), icon: "👁️", grad: "from-violet-500 to-violet-600", sub: "all time" },
    { label: "Enquiries",        value: data.loadingProps ? "—" : totalLeads, icon: "📞", grad: "from-emerald-500 to-emerald-600", sub: "received" },
    { label: "Wallet",           value: data.loadingWallet ? "—" : `₹${walletBal.toLocaleString("en-IN")}`, icon: "💳", grad: "from-amber-500 to-orange-500", sub: "balance" },
  ];

  const QUICK = [
    { label: "Post Property",    icon: "➕", action: () => { window.location.href = "/post-property"; },  style: "bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)]" },
    { label: "My Listings",      icon: "🏠", action: () => onNavigate("listings"),  style: "bg-white border-2 border-blue-100 text-[#0B3C8C] hover:border-blue-300" },
    { label: "Drafts",           icon: "📝", action: () => onNavigate("drafts"),    style: "bg-white border-2 border-blue-100 text-[#0B3C8C] hover:border-blue-300" },
    { label: "Payments",         icon: "💳", action: () => onNavigate("payments"),  style: "bg-white border-2 border-blue-100 text-[#0B3C8C] hover:border-blue-300" },
    { label: "Saved",            icon: "❤️", action: () => onNavigate("saved"),     style: "bg-white border-2 border-blue-100 text-[#0B3C8C] hover:border-blue-300" },
    { label: "Profile",          icon: "👤", action: () => onNavigate("profile"),   style: "bg-white border-2 border-blue-100 text-[#0B3C8C] hover:border-blue-300" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

      {/* Welcome banner */}
      <div className="fade-up bg-gradient-to-r from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] rounded-2xl p-5 text-white flex items-center justify-between overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-6 -left-4 w-28 h-28 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <p className="text-blue-200 text-[10px] font-black tracking-[0.2em] uppercase mb-1">Welcome back 👋</p>
          <h2 className="pf text-xl font-bold">{user?.username || user?.phone || "Property Owner"}</h2>
          <p className="text-blue-200 text-xs mt-1">
            {data.published.length} active · {data.draft.length} drafts · {data.rejected.length} need attention
          </p>
        </div>
        <div className="relative z-10 text-right hidden sm:block">
          <p className="text-blue-200 text-[10px] font-semibold">OTP Status</p>
          <p className={`text-xs font-black mt-0.5 ${user?.is_otp_verified ? "text-emerald-300" : "text-red-300"}`}>
            {user?.is_otp_verified ? "✅ Verified" : "❌ Unverified"}
          </p>
          <p className="text-blue-200 text-[10px] mt-1.5 font-semibold">Member since</p>
          <p className="text-white text-[11px] font-bold">
            {user?.date_created ? new Date(user.date_created).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s, i) => (
          <div key={i} className={`fade-up-${i + 1} bg-white rounded-2xl border border-blue-50 p-4 shadow-[0_2px_12px_rgba(11,60,140,0.05)] hover:shadow-[0_4px_20px_rgba(11,60,140,0.1)] transition-all`}>
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-sm mb-3`}>
              {s.icon}
            </div>
            <p className="text-xl font-black text-[#0B3C8C]">{s.value}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Quick actions */}
        <div className="lg:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quick Actions</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK.map((q, i) => (
              <button key={i} onClick={q.action}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center text-[10px] font-bold transition-all cursor-pointer border-none font-[inherit] active:scale-95 ${q.style}`}
                style={{WebkitTapHighlightColor:"transparent"}}>
                <span className="text-xl">{q.icon}</span>
                <span className="leading-tight">{q.label}</span>
              </button>
            ))}
          </div>

          {/* Alerts */}
          {(data.rejected.length > 0 || data.expired.length > 0) && (
            <div className="mt-4 space-y-2">
              {data.rejected.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5">
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-red-700">{data.rejected.length} Listing{data.rejected.length > 1 ? "s" : ""} Rejected</p>
                    <p className="text-[10px] text-red-500 mt-0.5">Review and resubmit</p>
                  </div>
                  <button onClick={() => onNavigate("listings")}
                    className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-1 rounded-lg border-none cursor-pointer whitespace-nowrap">
                    View
                  </button>
                </div>
              )}
              {data.expired.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
                  <span className="text-lg flex-shrink-0">⏰</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-amber-700">{data.expired.length} Listing{data.expired.length > 1 ? "s" : ""} Expired</p>
                    <p className="text-[10px] text-amber-500 mt-0.5">Renew to stay visible</p>
                  </div>
                  <button onClick={() => onNavigate("payments")}
                    className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-lg border-none cursor-pointer whitespace-nowrap">
                    Renew
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent listings */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Listings</p>
            <button onClick={() => onNavigate("listings")}
              className="text-[10px] font-black text-blue-600 border-none cursor-pointer bg-transparent hover:text-blue-800">
              View All →
            </button>
          </div>
          {data.loadingProps ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl p-3 border border-blue-50 animate-pulse h-16" />
              ))}
            </div>
          ) : recent5.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-blue-100 p-8 text-center">
              <p className="text-3xl mb-2">🏠</p>
              <p className="text-sm font-bold text-slate-500">No listings yet</p>
              <button onClick={() => { window.location.href = "/post-property"; }}
                className="mt-3 text-[11px] font-black text-white bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] px-4 py-2 rounded-xl border-none cursor-pointer">
                Post your first property
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent5.map((p: any, i: number) => (
                <div key={p.id ?? i} className="bg-white rounded-xl border border-blue-50 p-3 flex items-center gap-3 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex-shrink-0 overflow-hidden">
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🏠</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#0B3C8C] truncate">
                      {p.bhk ? `${p.bhk} ` : ""}{p.residentialType || p.commercialType || p.propertyCategory || "Property"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {p.locality ? `${p.locality}, ` : ""}{p.city || ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-black text-[#0B3C8C]">{fmtPrice(p.price)}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {(p.status ?? "unknown").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
