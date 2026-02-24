"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";

// ─── API ──────────────────────────────────────────────────────────────────────
import {
  getMyPropertiesApi,
  getWalletBalanceApi,
  getWalletTransactionsApi,
  deletePropertyApi,
} from "@/services/propertyApi";

// authApi — GET /auth/profile returns the logged-in user's full profile
import axiosInstance from "@/lib/axiosConfig";
const getProfileApi = () => axiosInstance.get("/auth/profile");

// ─── SECTIONS ─────────────────────────────────────────────────────────────────
import { DashboardHome }   from "./sections/DashboardHome";
import { MyListings }      from "./sections/MyListings";
import { Payments }        from "./sections/Payments";
import { SavedProperties } from "./sections/SavedProperties";
import { Notifications }   from "./sections/Notifications";
import { ProfileSection }  from "./sections/ProfileSection";
import { Support }         from "./sections/Support";

// ─── DISPLAY UTILS ────────────────────────────────────────────────────────────
// imgUrl: build full avatar/profile image URL from a relative path
const API_BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
const imgUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",     label: "Dashboard",        icon: "⚡", group: "main"     },
  { key: "listings",      label: "My Listings",       icon: "🏠", group: "main",     badgeKey: "published" },
  { key: "drafts",        label: "Drafts",            icon: "📝", group: "main",     badgeKey: "draft"     },
  { key: "post",          label: "Post Property",     icon: "➕", group: "main",     highlight: true       },
  { key: "payments",      label: "Payments & Plans",  icon: "💳", group: "activity" },
  { key: "saved",         label: "Saved",             icon: "❤️", group: "activity" },
  { key: "notifications", label: "Notifications",     icon: "🔔", group: "activity", badgeKey: "notif"    },
  { key: "profile",       label: "My Profile",        icon: "👤", group: "account"  },
  { key: "support",       label: "Help & Support",    icon: "💬", group: "account"  },
];

const GROUPS = [
  { key: "main",     label: "Menu"     },
  { key: "activity", label: "Activity" },
  { key: "account",  label: "Account"  },
];

// ─── SHARED DATA SHAPE ────────────────────────────────────────────────────────
// Reflects the actual API response shape. All property arrays hold raw API
// objects with integer FK IDs (category_id, subcategory_id etc.) and relative
// photo paths (/uploads/...). Resolved by propertyDisplay.ts in each section.
export interface PanelData {
  published:     any[];
  draft:         any[];
  rejected:      any[];
  expired:       any[];
  wallet:        any;        // { balance, posts_remaining, ... }
  transactions:  any[];
  profile:       any;        // full user profile from /auth/profile
  loadingProps:  boolean;
  loadingWallet: boolean;
}

const EMPTY: PanelData = {
  published: [], draft: [], rejected: [], expired: [],
  wallet: null, transactions: [], profile: null,
  loadingProps: true, loadingWallet: true,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Unwrap NestJS { data: { data: [] } } OR { data: [] } safely */
const unwrapList = (res: any): any[] => {
  const inner = res?.data;
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner?.data)) return inner.data;
  return [];
};

/** Unwrap a single object response */
const unwrapObj = (res: any): any => {
  const inner = res?.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner.data ?? inner;
  }
  return inner ?? null;
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function UserPanel() {
  const [active,      setActive]      = useState("dashboard");
  const [sidebarOpen, setSidebar]     = useState(false);
  const [data,        setData]        = useState<PanelData>(EMPTY);
  const [deletingId,  setDeletingId]  = useState<number | null>(null);

  // Redux auth state — user object from login/OTP slice
  const { auth } = useAppSelector((state: any) => state);
  // Raw Redux user — may have stale/incomplete fields; profile from API is preferred
  const authUser = auth?.user ?? null;

  // Resolved user: prefer fresh profile fetch over Redux auth state
  const user = data.profile ?? authUser;

  // ── Display name resolution ──────────────────────────────────────────────
  // API profile may use: name, ownerName, username, phone
  const displayName =
    user?.name       ||
    user?.ownerName  ||
    user?.username   ||
    user?.phone      ||
    "User";

  const displayPhone =
    user?.phone      ||
    user?.ownerPhone ||
    "—";

  const displayAvatar = imgUrl(user?.avatar ?? user?.profile_photo ?? user?.photo);

  const displayInitial = displayName.charAt(0).toUpperCase();

  const memberSince = (() => {
    const d = user?.created_at ?? user?.date_created ?? user?.createdAt;
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  })();

  const walletBalance = Number(data.wallet?.balance ?? user?.balance ?? 0);

  // ── Fetch helpers ────────────────────────────────────────────────────────

  const fetchProperties = useCallback(async () => {
    setData((prev) => ({ ...prev, loadingProps: true }));
    try {
      const [pub, dft, rej, exp] = await Promise.allSettled([
        getMyPropertiesApi("published"),
        getMyPropertiesApi("draft"),
        getMyPropertiesApi("rejected"),
        getMyPropertiesApi("expired"),
      ]);
      setData((prev) => ({
        ...prev,
        published:    pub.status === "fulfilled" ? unwrapList(pub.value)  : prev.published,
        draft:        dft.status === "fulfilled" ? unwrapList(dft.value)  : prev.draft,
        rejected:     rej.status === "fulfilled" ? unwrapList(rej.value)  : prev.rejected,
        expired:      exp.status === "fulfilled" ? unwrapList(exp.value)  : prev.expired,
        loadingProps: false,
      }));
    } catch {
      setData((prev) => ({ ...prev, loadingProps: false }));
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    setData((prev) => ({ ...prev, loadingWallet: true }));
    try {
      const [bal, txn] = await Promise.allSettled([
        getWalletBalanceApi(),
        getWalletTransactionsApi(1, 20),
      ]);
      setData((prev) => ({
        ...prev,
        wallet:        bal.status === "fulfilled" ? unwrapObj(bal.value)   : prev.wallet,
        transactions:  txn.status === "fulfilled" ? unwrapList(txn.value)  : prev.transactions,
        loadingWallet: false,
      }));
    } catch {
      setData((prev) => ({ ...prev, loadingWallet: false }));
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfileApi();
      setData((prev) => ({ ...prev, profile: unwrapObj(res) }));
    } catch {}
  }, []);

  const fetchAll = useCallback(() => {
    fetchProperties();
    fetchWallet();
    fetchProfile();
  }, [fetchProperties, fetchWallet, fetchProfile]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Delete handler ────────────────────────────────────────────────────────
  // Called by MyListings when user confirms deletion.
  // Optimistically removes from all four status buckets, then re-fetches.
  const handleDelete = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      await deletePropertyApi(id);
      // Optimistic UI — remove immediately from every bucket
      setData((prev) => ({
        ...prev,
        published: prev.published.filter((p: any) => p.id !== id),
        draft:     prev.draft.filter((p: any)     => p.id !== id),
        rejected:  prev.rejected.filter((p: any)  => p.id !== id),
        expired:   prev.expired.filter((p: any)   => p.id !== id),
      }));
    } catch (err) {
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeletingId(null);
      // Full refresh to stay in sync with server
      fetchProperties();
    }
  }, [fetchProperties]);

  // ── Badge counts ──────────────────────────────────────────────────────────
  const badges: Record<string, number> = {
    published: data.published.length,
    draft:     data.draft.length,
    notif:     data.rejected.length + data.expired.length,
  };

  const goPost = () => { window.location.href = "/post-property"; };

  // ── All listings combined (for MyListings "all" tab) ─────────────────────
  const allListings = [
    ...data.published,
    ...data.draft,
    ...data.rejected,
    ...data.expired,
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .pf { font-family: 'Playfair Display', serif !important; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease both; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .bg-white\/8  { background: rgba(255,255,255,0.08); }
        .bg-white\/15 { background: rgba(255,255,255,0.15); }
        .hover\:bg-white\/8:hover { background: rgba(255,255,255,0.08); }
      `}</style>

      <div className="flex h-screen bg-[#f0f4ff] overflow-hidden">

        {/* ── Mobile overlay ──────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#0B3C8C]/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebar(false)}
          />
        )}

        {/* ══ SIDEBAR ════════════════════════════════════════════════════════ */}
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div>
              <p className="pf text-[13px] font-bold text-white leading-none">Think4BuySale</p>
              <p className="text-[9px] text-blue-300 font-semibold mt-0.5">.in</p>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setSidebar(false)}
              className="ml-auto lg:hidden w-6 h-6 rounded-md text-blue-300/60 hover:text-white border-none bg-transparent cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* User card */}
          <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-white/8 border border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Avatar — photo if available, else initial */}
              <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden shadow border border-white/10">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-black text-sm">
                    {displayInitial}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-[11px] font-bold truncate">{displayName}</p>
                <p className="text-blue-300 text-[9px] truncate">
                  {user?.email ?? displayPhone}
                </p>
              </div>
            </div>

            {/* Wallet row */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <span className="text-[9px] text-blue-300/70 font-semibold uppercase tracking-wider">Wallet</span>
              <span className="text-[11px] font-black text-emerald-300">
                {data.loadingWallet
                  ? "…"
                  : `₹${walletBalance.toLocaleString("en-IN")}`
                }
              </span>
            </div>

            {/* Listing counts row */}
            {!data.loadingProps && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] text-emerald-300/80 font-bold">
                  {data.published.length} live
                </span>
                {data.draft.length > 0 && (
                  <span className="text-[9px] text-amber-300/80 font-bold">
                    · {data.draft.length} draft{data.draft.length !== 1 ? "s" : ""}
                  </span>
                )}
                {data.rejected.length > 0 && (
                  <span className="text-[9px] text-red-300/80 font-bold">
                    · {data.rejected.length} rejected
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
            {GROUPS.map((g) => (
              <div key={g.key} className="mb-3">
                <p className="text-[8px] font-black tracking-[0.25em] uppercase text-blue-400/50 px-2 mb-1">
                  {g.label}
                </p>
                {NAV.filter((n) => n.group === g.key).map((n) => {
                  const isActive = active === n.key;
                  const count    = n.badgeKey ? (badges[n.badgeKey] ?? 0) : 0;

                  if (n.key === "post") {
                    return (
                      <button
                        key="post"
                        onClick={goPost}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-0.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[11px] font-black border-none cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] transition-all"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                      >
                        <span className="text-sm">➕</span> Post Property
                      </button>
                    );
                  }

                  return (
                    <button
                      key={n.key}
                      onClick={() => { setActive(n.key); setSidebar(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-0.5 text-left text-[11px] font-bold transition-all duration-150 border-none cursor-pointer font-[inherit]
                        ${isActive
                          ? "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                          : "text-blue-200/60 hover:bg-white/8 hover:text-blue-100"}`}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                    >
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

          {/* Bottom: OTP status + logout */}
          <div className="p-3 border-t border-white/[0.08] flex-shrink-0 space-y-1">
            <div className="text-[9px] text-blue-400/40 text-center">
              OTP: {user?.is_otp_verified ? "✅ Verified" : "❌ Not verified"} ·
              Since {memberSince}
            </div>
            <button
              onClick={() => {
                // Clear auth and redirect — implement logout action as needed
                window.location.href = "/";
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-blue-300/50 hover:text-red-300 hover:bg-red-500/10 transition-all border-none cursor-pointer font-[inherit] text-[11px] font-bold"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Topbar */}
          <header
            className="flex-shrink-0 flex items-center justify-between px-4 md:px-5 bg-white border-b border-blue-50 shadow-[0_1px_12px_rgba(11,60,140,0.06)]"
            style={{ minHeight: "52px" }}
          >
            <div className="flex items-center gap-3">
              {/* Hamburger */}
              <button
                onClick={() => setSidebar(true)}
                className="lg:hidden w-8 h-8 rounded-lg border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent"
              >
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
              {/* Notification bell */}
              <button
                onClick={() => setActive("notifications")}
                className="relative w-8 h-8 rounded-lg border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 cursor-pointer bg-white transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {badges.notif > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {badges.notif}
                  </span>
                )}
              </button>

              {/* Avatar in topbar */}
              <div
                className="w-8 h-8 rounded-lg overflow-hidden border-2 border-blue-100 cursor-pointer flex-shrink-0"
                onClick={() => setActive("profile")}
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center text-white font-black text-xs">
                    {displayInitial}
                  </div>
                )}
              </div>

              {/* Post button */}
              <button
                onClick={goPost}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-[11px] font-black rounded-xl border-none cursor-pointer hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                ➕ Post Property
              </button>
            </div>
          </header>

          {/* ── Content ─────────────────────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto">
            <div key={active} className="fade-up min-h-full">
              {active === "dashboard" && (
                <DashboardHome
                  data={data}
                  onNavigate={setActive}
                  user={user}
                />
              )}

              {/* MyListings handles ALL statuses via internal tabs:
                  All / Active / Drafts / Rejected / Expired
                  Pass the full combined listings array so tab counts work.
                  `loading` drives skeleton states.
                  `onDelete` calls deletePropertyApi + optimistic update.
                  `onNavigate` allows "Post Property" empty-state link.        */}
              {(active === "listings" || active === "drafts") && (
                <MyListings
                  listings={allListings}
                  loading={data.loadingProps}
                  onDelete={handleDelete}
                  onNavigate={setActive}
                  // Pre-select the correct tab when navigating from sidebar
                  initialTab={active === "drafts" ? "draft" : "all"}
                />
              )}

              {active === "payments" && (
                <Payments
                  data={data}
                  onRefresh={fetchAll}
                />
              )}

              {active === "saved" && (
                <SavedProperties />
              )}

              {active === "notifications" && (
                <Notifications
                  data={data}
                />
              )}

              {active === "profile" && (
                <ProfileSection
                  user={user}
                  profile={data.profile}
                  onRefresh={fetchAll}
                />
              )}

              {active === "support" && (
                <Support />
              )}

              {active === "post" && (
                <div className="flex items-center justify-center h-full p-8 text-slate-400 text-sm">
                  Redirecting…
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ── Deleting overlay ──────────────────────────────────────────────── */}
        {deletingId !== null && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
              <svg className="animate-spin w-5 h-5 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-sm font-black text-[#0B3C8C]">Deleting listing…</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}