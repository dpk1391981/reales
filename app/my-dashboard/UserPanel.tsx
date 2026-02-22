"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getMyPropertiesApi, getWalletBalanceApi, getWalletTransactionsApi } from "@/services/propertyApi";
import { getProfileApi } from "@/services/authApi";

// ─── SECTIONS ─────────────────────────────────────────────────────────────────
import { DashboardHome }   from "./sections/DashboardHome";
import { MyListings }      from "./sections/MyListings";
import { MyDrafts }        from "./sections/MyDrafts";
import { Payments }        from "./sections/Payments";
import { SavedProperties } from "./sections/SavedProperties";
import { Notifications }   from "./sections/Notifications";
import { ProfileSection }  from "./sections/ProfileSection";
import { Support }         from "./sections/Support";

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",     label: "Dashboard",       icon: "⚡", group: "main" },
  { key: "listings",      label: "My Listings",      icon: "🏠", group: "main", badgeKey: "published" },
  { key: "drafts",        label: "Drafts",           icon: "📝", group: "main", badgeKey: "draft" },
  { key: "post",          label: "Post Property",    icon: "➕", group: "main", highlight: true },
  { key: "payments",      label: "Payments & Plans", icon: "💳", group: "activity" },
  { key: "saved",         label: "Saved",            icon: "❤️", group: "activity" },
  { key: "notifications", label: "Notifications",    icon: "🔔", group: "activity", badgeKey: "notif" },
  { key: "profile",       label: "My Profile",       icon: "👤", group: "account" },
  { key: "support",       label: "Help & Support",   icon: "💬", group: "account" },
];
const GROUPS = [
  { key: "main",     label: "Menu" },
  { key: "activity", label: "Activity" },
  { key: "account",  label: "Account" },
];

// ─── SHARED DATA SHAPE ────────────────────────────────────────────────────────
export interface PanelData {
  published:    any[];
  draft:        any[];
  rejected:     any[];
  expired:      any[];
  wallet:       any;
  transactions: any[];
  profile:      any;
  loadingProps: boolean;
  loadingWallet: boolean;
}

const EMPTY_DATA: PanelData = {
  published: [], draft: [], rejected: [], expired: [],
  wallet: null, transactions: [], profile: null,
  loadingProps: true, loadingWallet: true,
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function UserPanel() {
  const [active, setActive]       = useState("dashboard");
  const [sidebarOpen, setSidebar] = useState(false);
  const [data, setData]           = useState<PanelData>(EMPTY_DATA);

  const { auth } = useAppSelector((state: any) => state);
  const user = auth?.user;

  // ── Fetch everything on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    // Properties — 4 status calls in parallel
    try {
      const [pub, draft, rej, exp] = await Promise.allSettled([
        getMyPropertiesApi("published"),
        getMyPropertiesApi("draft"),
        getMyPropertiesApi("rejected"),
        getMyPropertiesApi("expired"),
      ]);
      setData((prev) => ({
        ...prev,
        published:    pub.status    === "fulfilled" ? (pub.value.data?.data    ?? pub.value.data    ?? []) : [],
        draft:        draft.status  === "fulfilled" ? (draft.value.data?.data  ?? draft.value.data  ?? []) : [],
        rejected:     rej.status    === "fulfilled" ? (rej.value.data?.data    ?? rej.value.data    ?? []) : [],
        expired:      exp.status    === "fulfilled" ? (exp.value.data?.data    ?? exp.value.data    ?? []) : [],
        loadingProps: false,
      }));
    } catch {
      setData((prev) => ({ ...prev, loadingProps: false }));
    }

    // Wallet
    try {
      const [bal, txn] = await Promise.allSettled([
        getWalletBalanceApi(),
        getWalletTransactionsApi(1, 20),
      ]);
      setData((prev) => ({
        ...prev,
        wallet:       bal.status === "fulfilled" ? (bal.value.data?.data ?? bal.value.data) : null,
        transactions: txn.status === "fulfilled" ? (txn.value.data?.data ?? txn.value.data ?? []) : [],
        loadingWallet: false,
      }));
    } catch {
      setData((prev) => ({ ...prev, loadingWallet: false }));
    }

    // Profile
    try {
      const res = await getProfileApi();
      setData((prev) => ({ ...prev, profile: res.data?.data ?? res.data }));
    } catch {}
  };

  const badges: Record<string, number> = {
    published: data.published.length,
    draft:     data.draft.length,
    notif:     data.rejected.length + data.expired.length, // unread = issues
  };

  // ── Navigate to post-property page (Next.js link) ─────────────────────────
  const goPost = () => { window.location.href = "/post-property"; };

  const SECTIONS: any = {
    dashboard:     <DashboardHome   data={data} onNavigate={setActive} user={user} />,
    listings:      <MyListings      data={data} onRefresh={fetchAll} />,
    drafts:        <MyDrafts        data={data} onRefresh={fetchAll} />,
    payments:      <Payments        data={data} onRefresh={fetchAll} />,
    saved:         <SavedProperties />,
    notifications: <Notifications   data={data} />,
    profile:       <ProfileSection  user={user} profile={data.profile} onRefresh={fetchAll} />,
    support:       <Support />,
  };

  return (
    <>
      
      <div className="flex h-screen bg-[#f0f4ff] overflow-hidden">

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-[#0B3C8C]/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebar(false)} />
        )}

        {/* ══ SIDEBAR ══ */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-[220px] flex flex-col h-full
          bg-gradient-to-b from-[#0a2d6e] via-[#0e3a8a] to-[#0a2d6e]
          border-r border-white/5
          shadow-[4px_0_40px_rgba(10,45,110,0.4)]
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </div>
            <div>
              <p className="pf text-[13px] font-bold text-white leading-none">Think4BuySale</p>
              <p className="text-[9px] text-blue-300 font-semibold mt-0.5">.in</p>
            </div>
          </div>

          {/* User card */}
          <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-white/8 border border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
                {(user?.username || user?.phone || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-[11px] font-bold truncate">{user?.username || user?.phone || "User"}</p>
                <p className="text-blue-300 text-[9px] truncate">{user?.email || user?.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <span className="text-[9px] text-blue-300/70 font-semibold uppercase tracking-wider">Wallet</span>
              <span className="text-[11px] font-black text-emerald-300">
                ₹{(data.wallet?.balance ?? user?.balance ?? 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            {GROUPS.map((g) => (
              <div key={g.key} className="mb-3">
                <p className="text-[8px] font-black tracking-[0.25em] uppercase text-blue-400/50 px-2 mb-1">{g.label}</p>
                {NAV.filter((n) => n.group === g.key).map((n) => {
                  const isActive = active === n.key;
                  const count    = n.badgeKey ? (badges[n.badgeKey] ?? 0) : 0;
                  if (n.key === "post") {
                    return (
                      <button key="post" onClick={goPost}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-0.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[11px] font-black border-none cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] transition-all"
                        style={{WebkitTapHighlightColor:"transparent"}}>
                        <span className="text-sm">➕</span> Post Property
                      </button>
                    );
                  }
                  return (
                    <button key={n.key} onClick={() => { setActive(n.key); setSidebar(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-0.5 text-left text-[11px] font-bold transition-all duration-150 border-none cursor-pointer font-[inherit]
                        ${isActive
                          ? "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                          : "text-blue-200/60 hover:bg-white/8 hover:text-blue-100"}`}
                      style={{WebkitTapHighlightColor:"transparent"}}>
                      <span className="text-sm w-4 text-center flex-shrink-0">{n.icon}</span>
                      <span className="flex-1 text-left">{n.label}</span>
                      {count > 0 && (
                        <span className="text-[8px] font-black bg-blue-400/25 text-blue-100 px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/8 flex-shrink-0">
            <div className="text-[9px] text-blue-400/40 text-center mb-2">
              OTP: {user?.is_otp_verified ? "✅ Verified" : "❌ Not Verified"}
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-blue-300/50 hover:text-red-300 hover:bg-red-500/10 transition-all border-none cursor-pointer font-[inherit] text-[11px] font-bold">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Topbar */}
          <header className="flex-shrink-0 h-13 flex items-center justify-between px-4 md:px-5 bg-white border-b border-blue-50 shadow-[0_1px_12px_rgba(11,60,140,0.06)]" style={{minHeight:"52px"}}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebar(true)}
                className="lg:hidden w-8 h-8 rounded-lg border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              </button>
              <h1 className="pf text-[15px] font-bold text-[#0B3C8C]">
                {NAV.find((n) => n.key === active)?.icon}{" "}
                {NAV.find((n) => n.key === active)?.label ?? "Panel"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setActive("notifications")}
                className="relative w-8 h-8 rounded-lg border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 cursor-pointer bg-white transition-colors">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {badges.notif > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {badges.notif}
                  </span>
                )}
              </button>
              <button onClick={goPost}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[11px] font-black rounded-xl border-none cursor-pointer hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all">
                ➕ Post Property
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div key={active} className="fade-up min-h-full">
              {active === "post"
                ? <div className="flex items-center justify-center h-full p-8 text-slate-400">Redirecting...</div>
                : SECTIONS[active]}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
