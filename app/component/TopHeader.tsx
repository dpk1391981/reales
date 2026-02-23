"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import LoginModal from "./Login";
import RegisterModal from "./RegisterModal";
import MobileSearchOverlay from "./MobileSearchOverlay";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import ProfileIcon from "@/svg/ProfileIcon";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropdownColumn {
  heading: string;
  links: { label: string; href: string; viewAll?: boolean }[];
}
interface NavItem {
  label: string;
  href?: string;
  columns?: DropdownColumn[];
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
// Primary:  #2563EB  |  Deep: #1D4ED8  |  Darkest: #1E40AF  |  Brand: #0B3C8C
const T = { tap: { WebkitTapHighlightColor: "transparent" } };

// ─── ICONS ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
const ChevronDown = ({ open = false }: { open?: boolean }) => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const SearchIconGray = () => (
  <svg width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const CloseX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Buy",
    columns: [
      {
        heading: "By Locality",
        links: [
          { label: "Property in Delhi", href: "#" },
          { label: "Property in Noida", href: "#" },
          { label: "Property in Gurgaon", href: "#" },
          { label: "Property in Mumbai", href: "#" },
          { label: "Property in Bangalore", href: "#" },
          { label: "Property in Pune", href: "#" },
          { label: "View all localities →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By Budget",
        links: [
          { label: "Under ₹25 Lakhs", href: "#" },
          { label: "₹25L – ₹50L", href: "#" },
          { label: "₹50L – ₹75L", href: "#" },
          { label: "₹75L – ₹1 Cr", href: "#" },
          { label: "₹1Cr – ₹2Cr", href: "#" },
          { label: "Above ₹5 Crores", href: "#" },
          { label: "View all budgets →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By BHK",
        links: [
          { label: "1 BHK for Sale", href: "#" },
          { label: "2 BHK for Sale", href: "#" },
          { label: "3 BHK for Sale", href: "#" },
          { label: "4 BHK for Sale", href: "#" },
          { label: "Penthouses", href: "#" },
          { label: "Independent Houses", href: "#" },
          { label: "View all BHK options →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  {
    label: "Rent",
    columns: [
      {
        heading: "By Locality",
        links: [
          { label: "Rent in Delhi", href: "#" },
          { label: "Rent in Noida", href: "#" },
          { label: "Rent in Gurgaon", href: "#" },
          { label: "Rent in Mumbai", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By Type",
        links: [
          { label: "Furnished Flats", href: "#" },
          { label: "PG / Co-living", href: "#" },
          { label: "Studio Apartments", href: "#" },
          { label: "Commercial Rent", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
      {
        heading: "By BHK",
        links: [
          { label: "1 BHK Rent", href: "#" },
          { label: "2 BHK Rent", href: "#" },
          { label: "3 BHK Rent", href: "#" },
          { label: "4 BHK Rent", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  {
    label: "Projects",
    columns: [
      {
        heading: "New Projects",
        links: [
          { label: "Upcoming Launches", href: "#" },
          { label: "Under Construction", href: "#" },
          { label: "Ready to Move", href: "#" },
          { label: "Luxury Projects", href: "#" },
          { label: "Affordable Housing", href: "#" },
          { label: "View all projects →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  {
    label: "Commercial",
    columns: [
      {
        heading: "Commercial",
        links: [
          { label: "Office Spaces", href: "#" },
          { label: "Shop / Showroom", href: "#" },
          { label: "Warehouse / Godown", href: "#" },
          { label: "Industrial Land", href: "#" },
          { label: "View all →", href: "#", viewAll: true },
        ],
      },
    ],
  },
  { label: "Agents", href: "#" },
];

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Noida", "Gurgaon"];

const PROPERTY_TYPES = [
  { v: "residential", l: "Residential", icon: "🏠", desc: "Flat, Villa, House" },
  { v: "commercial",  l: "Commercial",  icon: "🏢", desc: "Office, Shop" },
  { v: "plot",        l: "Plot / Land", icon: "📐", desc: "Residential, Farm" },
  { v: "pg",          l: "PG / Co-living", icon: "🛏️", desc: "Boys, Girls, Co-ed" },
];

// ─── ProfileDropdown ──────────────────────────────────────────────────────────

const ProfileDropdown = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative hidden md:flex items-center gap-2.5">
      <span className="text-sm font-semibold text-[#1D4ED8]">Hi, {user?.username}</span>
      <button onClick={() => setOpen(!open)} style={T.tap}
        className="w-9 h-9 rounded-full border-2 border-blue-100 flex items-center justify-center bg-white hover:border-[#2563EB] transition-all shadow-sm">
        <ProfileIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[500]"
          style={{ animation: "ddFadeIn 0.15s ease both" }}>
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/50">
            <p className="text-sm font-bold text-[#1E40AF]">Hi, {user?.username}</p>
            <p className="text-xs text-slate-400">{user?.phone}</p>
          </div>
          {[{ label: "Dashboard", href: "/my-dashboard" }, { label: "Post Property", href: "/post-property" }].map(l => (
            <a key={l.label} href={l.href} className="block px-4 py-3 text-sm text-slate-600 hover:bg-blue-50/60 no-underline hover:text-[#1D4ED8] transition-colors">{l.label}</a>
          ))}
          <button onClick={() => dispatch(logout())}
            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 border-none bg-transparent cursor-pointer font-[inherit] transition-colors">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MegaDropdown ─────────────────────────────────────────────────────────────

const MegaDropdown: React.FC<{ columns: DropdownColumn[]; isVisible: boolean }> = ({ columns, isVisible }) => {
  if (!isVisible) return null;
  const isSingle = columns.length === 1;
  return (
    <div className={`absolute top-[calc(100%+6px)] left-0 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_60px_rgba(29,78,216,0.12)] p-5 z-[300] grid gap-6
      ${isSingle ? "grid-cols-1 min-w-[200px]" : "grid-cols-3 min-w-[660px]"}`}
      style={{ animation: "ddFadeIn 0.15s ease both" }}>
      {columns.map(col => (
        <div key={col.heading}>
          <h4 className="text-[10px] font-black tracking-[0.14em] uppercase text-[#1E40AF] mb-3 pb-2 border-b border-blue-100">
            {col.heading}
          </h4>
          {col.links.map(link => (
            <a key={link.label} href={link.href}
              className={`block text-[13px] py-[5px] transition-all duration-150 hover:pl-1 no-underline
                ${link.viewAll ? "font-bold text-[#2563EB] mt-1" : "font-normal text-slate-500 hover:text-[#1D4ED8]"}`}>
              {link.label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── NavLink ──────────────────────────────────────────────────────────────────

const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  if (!item.columns) {
    return (
      <a href={item.href} className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-slate-700 rounded-lg transition-all hover:bg-blue-50 hover:text-[#1D4ED8] no-underline whitespace-nowrap">
        {item.label}
      </a>
    );
  }
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-lg border-none whitespace-nowrap transition-all font-[inherit] cursor-pointer
        ${open ? "bg-blue-50 text-[#1D4ED8]" : "bg-transparent text-slate-700 hover:text-[#1D4ED8]"}`}>
        {item.label}<ChevronDown open={open} />
      </button>
      <MegaDropdown columns={item.columns} isVisible={open} />
    </div>
  );
};

// ─── PostFreeSheet — mobile only (guest only) ─────────────────────────────────

const PostFreeSheet = ({ onClose, onLoginRequired }: { onClose: () => void; onLoginRequired: () => void }) => {
  const [intent, setIntent]             = useState("sell");
  const [propertyType, setPropertyType] = useState("residential");
  const [city, setCity]                 = useState("");
  const [name, setName]                 = useState("");
  const [phone, setPhone]               = useState("");
  const [otp, setOtp]                   = useState("");
  const [step, setStep]                 = useState<"form" | "otp" | "success">("form");
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [timer, setTimer]               = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!city) e.city = "Select your city";
    if (!name || name.trim().length < 3) e.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(phone)) e.phone = "Enter valid 10-digit number";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const sendOtp = () => {
    if (!validate()) return;
    setLoading(true);
    // TODO: POST /api/auth/send-otp { phone }
    setTimeout(() => { setLoading(false); setStep("otp"); setTimer(30); }, 1000);
  };

  const verifyOtp = () => {
    if (otp.length < 4) { setErrors({ otp: "Enter complete OTP" }); return; }
    setLoading(true);
    // TODO: POST /api/auth/verify-otp { phone, otp }
    setTimeout(() => { setLoading(false); setStep("success"); }, 1000);
  };

  const inp = (err?: string) =>
    `w-full bg-white border-2 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-[#1E40AF] placeholder-slate-300 outline-none transition-all
    ${err ? "border-rose-400 bg-rose-50/30" : "border-slate-200 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"}`;

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const digits = (otp + "    ").slice(0, 4).split("");
  const handleOtpInput = (i: number, v: string) => {
    const d = v.replace(/\D/, "").slice(-1);
    const arr = (otp + "    ").slice(0, 4).split("");
    arr[i] = d;
    setOtp(arr.join("").replace(/ /g, ""));
    if (d && i < 3) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i]?.trim() && i > 0) otpRefs[i - 1].current?.focus();
  };

  return (
    <div className="fixed inset-0 z-[990] flex flex-col font-[DM_Sans,sans-serif]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[95vh] flex flex-col overflow-hidden"
        style={{ animation: "sheetUp 0.32s cubic-bezier(0.22,1,0.36,1) both" }}>

        {/* Sheet Header */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#0B3C8C,#1E40AF,#3B82F6)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                </div>
                <span className="text-sm font-black text-[#1E40AF]">Post Property</span>
                <span className="text-[9px] font-black bg-[#2563EB] text-white px-1.5 py-0.5 rounded">FREE</span>
              </div>
              {step !== "success" && (
                <div className="flex items-center gap-1.5">
                  {["Details", "Verify OTP", "Done!"].map((l, i) => {
                    const cur = step === "form" ? 0 : step === "otp" ? 1 : 2;
                    return (
                      <div key={l} className="flex items-center gap-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black transition-all
                          ${i < cur ? "bg-emerald-500 text-white" : i === cur ? "bg-[#1E40AF] text-white" : "bg-slate-200 text-slate-400"}`}>
                          {i < cur ? "✓" : i + 1}
                        </div>
                        <span className={`text-[9px] font-bold ${i === cur ? "text-[#1E40AF]" : i < cur ? "text-emerald-600" : "text-slate-300"}`}>{l}</span>
                        {i < 2 && <div className={`w-4 h-px rounded ${i < cur ? "bg-emerald-400" : "bg-slate-200"}`} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button onClick={onClose} style={T.tap}
              className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-90 transition-all border-none cursor-pointer flex-shrink-0">
              <CloseX />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 16px)" }}>

          {/* Brand strip */}
          <div className="h-1 w-full rounded-full mb-4"
            style={{ background: "linear-gradient(90deg,#0B3C8C 0%,#1E40AF 35%,#2563EB 70%,#3B82F6 100%)" }} />

          {/* STEP 1 */}
          {step === "form" && (
            <div style={{ animation: "slideIn 0.25s ease both" }}>
              <h2 className="text-xl font-black text-[#1E40AF] mb-0.5">Sell or Rent <span className="text-emerald-600">FREE</span></h2>
              <p className="text-slate-400 text-xs font-medium mb-4">No registration · Go live in 2 minutes</p>

              {/* Intent toggle */}
              <div className="flex p-1 bg-slate-100 rounded-2xl gap-1 mb-4">
                {[{ v: "sell", l: "📈 Sell" }, { v: "rent", l: "🔑 Rent / Lease" }].map(t => (
                  <button key={t.v} onClick={() => setIntent(t.v)} style={T.tap}
                    className={`flex-1 py-2.5 text-sm font-black rounded-xl border-none cursor-pointer font-[inherit] transition-all
                      ${intent === t.v ? "bg-white text-[#1E40AF] shadow-[0_2px_8px_rgba(29,78,216,0.12)]" : "bg-transparent text-slate-400"}`}>
                    {t.l}
                  </button>
                ))}
              </div>

              {/* Property type */}
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">Property Type</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PROPERTY_TYPES.map(t => (
                  <button key={t.v} onClick={() => setPropertyType(t.v)} style={T.tap}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer font-[inherit] active:scale-[0.97]
                      ${propertyType === t.v ? "border-[#2563EB] bg-blue-50" : "border-slate-200 bg-white"}`}>
                    <span className="text-xl flex-shrink-0">{t.icon}</span>
                    <div>
                      <p className={`text-xs font-black leading-none ${propertyType === t.v ? "text-[#1D4ED8]" : "text-slate-700"}`}>{t.l}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* City */}
              <div className="mb-3">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-1.5">City <span className="text-rose-400">•</span></label>
                <div className="relative">
                  <select value={city} onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: "" })); }}
                    className={`${inp(errors.city)} appearance-none pr-10 cursor-pointer`} style={{ fontSize: "16px" }}>
                    <option value="">Select your city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown /></span>
                </div>
                {errors.city && <p className="text-rose-500 text-[11px] font-semibold mt-1">⚠ {errors.city}</p>}
              </div>

              {/* Name */}
              <div className="mb-3">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Your Name <span className="text-rose-400">•</span></label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                  placeholder="e.g. Rajesh Kumar" className={inp(errors.name)} style={{ fontSize: "16px" }} />
                {errors.name && <p className="text-rose-500 text-[11px] font-semibold mt-1">⚠ {errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Mobile Number <span className="text-rose-400">•</span></label>
                <div className={`flex border-2 rounded-2xl overflow-hidden transition-all ${errors.phone ? "border-rose-400" : "border-slate-200 focus-within:border-[#2563EB]"}`}>
                  <div className="flex items-center gap-1.5 px-3 bg-slate-50 border-r border-slate-200 flex-shrink-0 text-sm font-black text-[#1E40AF]">🇮🇳 +91</div>
                  <input type="tel" inputMode="numeric" value={phone} maxLength={10}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, phone: "" })); }}
                    placeholder="10-digit number" className="flex-1 px-3 py-3.5 text-sm text-[#1E40AF] bg-white outline-none" style={{ fontSize: "16px" }} />
                </div>
                {errors.phone && <p className="text-rose-500 text-[11px] font-semibold mt-1">⚠ {errors.phone}</p>}
              </div>

              <button onClick={sendOtp} disabled={loading} style={{ background: "linear-gradient(135deg,#0B3C8C 0%,#1E40AF 50%,#2563EB 100%)", boxShadow: "0 8px 28px rgba(29,78,216,0.35)", ...T.tap }}
                className="w-full py-4 rounded-2xl text-[15px] font-black text-white border-none cursor-pointer disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-[0.98] font-[inherit]">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>Sending OTP…</span>
                  : "Get OTP & Go Live FREE →"}
              </button>

              <p className="text-center text-[10px] text-slate-400 mt-3">
                Already have account?{" "}
                <button onClick={() => { onClose(); onLoginRequired(); }} style={T.tap}
                  className="text-[#2563EB] font-black border-none bg-transparent cursor-pointer font-[inherit]">
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <div style={{ animation: "slideIn 0.25s ease both" }}>
              <button onClick={() => setStep("form")} style={T.tap}
                className="text-xs text-slate-400 font-semibold border-none bg-transparent cursor-pointer font-[inherit] mb-4 flex items-center gap-1 hover:text-[#1D4ED8] transition-colors">
                ← Back
              </button>
              <h2 className="text-xl font-black text-[#1E40AF] mb-1">Verify Your Number</h2>
              <p className="text-slate-500 text-sm mb-4">OTP sent to <strong className="text-[#1E40AF]">+91 {phone}</strong></p>

              <div className="flex gap-3 justify-center my-5">
                {otpRefs.map((ref, i) => (
                  <input key={i} ref={ref} type="text" inputMode="numeric" maxLength={1}
                    value={digits[i].trim()}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`w-16 h-16 text-center font-black border-2 rounded-2xl outline-none transition-all
                      ${digits[i].trim() ? "border-[#2563EB] bg-blue-50 text-[#1E40AF]" : "border-slate-200 bg-slate-50 text-slate-400"}
                      focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100`}
                    style={{ fontSize: "24px", WebkitTapHighlightColor: "transparent" }} />
                ))}
              </div>
              {errors.otp && <p className="text-rose-500 text-[11px] font-semibold text-center mb-3">⚠ {errors.otp}</p>}

              <div className="flex items-center justify-between mb-5">
                {timer > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-9 h-9">
                      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 14}`}
                          strokeDashoffset={`${2 * Math.PI * 14 * (1 - timer / 30)}`}
                          className="transition-all duration-1000" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-600">{timer}s</span>
                    </div>
                    <p className="text-xs text-slate-500">Resend in {timer}s</p>
                  </div>
                ) : (
                  <button onClick={() => setTimer(30)} style={T.tap}
                    className="text-sm text-[#2563EB] font-black border-none bg-transparent cursor-pointer font-[inherit]">
                    Resend OTP
                  </button>
                )}
                <span className="text-[10px] text-slate-400">Valid 10 min</span>
              </div>

              <button onClick={verifyOtp} disabled={loading || otp.length < 4}
                style={{ background: "linear-gradient(135deg,#0B3C8C 0%,#1E40AF 50%,#2563EB 100%)", boxShadow: "0 8px 24px rgba(29,78,216,0.35)", ...T.tap }}
                className="w-full py-4 rounded-2xl text-[15px] font-black text-white border-none cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98] font-[inherit]">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>Verifying…</span>
                  : "✓ Verify & Post Property →"}
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && (
            <div className="text-center py-4" style={{ animation: "slideIn 0.25s ease both" }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#34d399,#059669)", boxShadow: "0 8px 28px rgba(16,185,129,0.4)", animation: "popBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                <svg width="38" height="38" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h2 className="text-xl font-black text-[#1E40AF] mb-2">You're Verified! 🎉</h2>
              <p className="text-slate-500 text-sm mb-5 max-w-xs mx-auto leading-relaxed">
                Complete your full listing with photos & price to get <strong className="text-[#1E40AF]">5× more enquiries.</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5 text-left">
                {[["📋","Add Full Details"],["📸","Upload Photos"],["💰","Set Your Price"],["📊","Track Enquiries"]].map(([icon,l]) => (
                  <div key={l} className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 rounded-2xl p-3">
                    <span className="text-lg">{icon}</span>
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">{l}</span>
                  </div>
                ))}
              </div>
              <a href="/post-property"
                style={{ background: "linear-gradient(135deg,#0B3C8C,#1E40AF,#2563EB)", boxShadow: "0 8px 24px rgba(29,78,216,0.35)", ...T.tap }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[15px] font-black text-white no-underline border-none cursor-pointer transition-all active:scale-[0.98]">
                Complete Your Listing →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const RealEstateHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [mobileAccordion, setMobileAccordion]   = useState<string | null>(null);
  const [city, setCity]                         = useState("Delhi");
  const [cityOpen, setCityOpen]                 = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [overlayQuery, setOverlayQuery]         = useState("");
  const [loginOpen, setLoginOpen]               = useState(false);
  const [registerOpen, setRegisterOpen]         = useState(false);
  const [postSheetOpen, setPostSheetOpen]       = useState(false);

  const { user, isAuthenticated, loading } = useAppSelector((s: any) => s.auth);
  const dispatch = useAppDispatch();
  const cityRef  = useRef<HTMLDivElement>(null);

  const openSearch = (q = "") => { setOverlayQuery(q); setMobileSearchOpen(true); };

  /**
   * Post Property click:
   * - Authenticated → navigate to /post-property (no preventDefault)
   * - Guest + mobile → open bottom sheet
   * - Guest + desktop → navigate to /post-property/guest (no preventDefault)
   */
  const handlePostClick = useCallback((e: React.MouseEvent) => {
    if (isAuthenticated) return; // let <a href="/post-property"> navigate normally
    if (window.innerWidth < 1024) {
      e.preventDefault();
      setMobileOpen(false);
      setPostSheetOpen(true);
    }
    // desktop guest: let <a href="/post-property/guest"> navigate
  }, [isAuthenticated]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (mobileOpen || postSheetOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, postSheetOpen]);

  // Authenticated → full form; Guest → quick capture
  const postHref = isAuthenticated ? "/post-property" : "/post-property/guest";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes ddFadeIn  { from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes sheetUp   { from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn   { from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)} }
        @keyframes popBounce { 0%{transform:scale(0.4);opacity:0}65%{transform:scale(1.1)}100%{transform:scale(1);opacity:1} }
        *{box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;margin:0;}
        button,a{-webkit-tap-highlight-color:transparent;}
        .pb-safe{padding-bottom:env(safe-area-inset-bottom,16px);}
      `}</style>

      <MobileSearchOverlay isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} initialQuery={overlayQuery} />

      {/* Bottom sheet — only shown for unauthenticated guests on mobile */}
      {postSheetOpen && !isAuthenticated && (
        <PostFreeSheet
          onClose={() => setPostSheetOpen(false)}
          onLoginRequired={() => { setPostSheetOpen(false); setLoginOpen(true); }}
        />
      )}

      <div className="font-[DM_Sans,sans-serif]">

        {/* ── TOP BAR — desktop only ── */}
        <div className="hidden md:block text-white/70 text-xs tracking-wide py-1.5"
          style={{ background: "linear-gradient(90deg,#0B3C8C 0%,#1E40AF 50%,#2563EB 100%)" }}>
          <div className="max-w-[1280px] mx-auto px-6 flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-5 items-center">
              <span className="text-white/80">📞 8285-25-76-36</span>
              <span className="opacity-20">|</span>
              <a href="mailto:support@think4buysale.in" className="text-white/60 no-underline hover:text-white transition-colors">
                support@think4buysale.in
              </a>
            </div>
            <div className="flex gap-5 items-center">
              {["For Builders", "Advertise", "Download App"].map(t => (
                <a key={t} href="#" className="text-white/60 no-underline hover:text-blue-200 transition-colors">{t}</a>
              ))}
              <span className="opacity-20">|</span>
              <a href="#" className="text-white/60 no-underline hover:text-white transition-colors">🇮🇳 India</a>
            </div>
          </div>
        </div>

        {/* ── MAIN HEADER ── */}
        <header className="bg-white shadow-[0_2px_20px_rgba(29,78,216,0.10)] sticky top-0 z-[100]">
          {/* Top accent line */}
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,#0B3C8C 0%,#1E40AF 40%,#2563EB 70%,#3B82F6 100%)" }} />

          <div className="max-w-[1280px] mx-auto px-3 md:px-6 flex items-center h-14 md:h-[68px] gap-2 md:gap-4">

            {/* ── LOGO ── */}
            <a href="/" className="flex items-center gap-2 no-underline shrink-0">
              <div
                className="w-8 h-8 md:w-10 md:h-10 rounded-[9px] flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg,#0B3C8C 0%,#1E40AF 50%,#3B82F6 100%)" }}>
                <HomeIcon />
              </div>
              <div className="hidden xs:block">
                <div className="font-[Playfair_Display,serif] text-base md:text-[19px] font-bold text-[#1E40AF] leading-none">
                  Think4BuySale
                </div>
                <div className="text-[8px] font-black text-[#2563EB] tracking-[0.18em] uppercase">
                  India's Premier Realty
                </div>
              </div>
            </a>

            {/* ── MOBILE SEARCH BAR ── */}
            <button onClick={() => openSearch()} style={T.tap}
              className="lg:hidden flex items-center gap-2 flex-1 min-w-0 border-2 border-slate-200 rounded-xl px-3 py-2 bg-slate-50 cursor-pointer font-[inherit] text-left transition-all active:bg-slate-100 hover:border-[#2563EB]/30">
              <SearchIconGray />
              <span className="truncate text-sm text-slate-400 flex-1">Search properties…</span>
              {city && (
                <span className="hidden xs:flex items-center gap-1 text-[11px] text-[#1D4ED8] font-bold border border-blue-100 px-2 py-0.5 rounded-full shrink-0 bg-blue-50">
                  <MapPinIcon />{city}
                </span>
              )}
            </button>

            {/* ── CITY SELECTOR — desktop ── */}
            <div ref={cityRef} className="relative shrink-0 hidden lg:block">
              <button onClick={() => setCityOpen(!cityOpen)} style={T.tap}
                className="flex items-center gap-1.5 border-2 border-slate-200 rounded-xl px-3.5 py-2 cursor-pointer hover:border-[#2563EB]/50 text-sm font-semibold text-[#1D4ED8] whitespace-nowrap font-[inherit] transition-all">
                <MapPinIcon />{city}<ChevronDown open={cityOpen} />
              </button>
              {cityOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 bg-white border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgba(29,78,216,0.12)] z-[300] overflow-hidden min-w-[160px]"
                  style={{ animation: "ddFadeIn 0.15s ease" }}>
                  {CITIES.map(c => (
                    <button key={c} onClick={() => { setCity(c); setCityOpen(false); }} style={T.tap}
                      className={`block w-full text-left px-4 py-2.5 text-sm border-none cursor-pointer font-[inherit] transition-colors hover:bg-blue-50
                        ${c === city ? "font-bold text-[#1D4ED8] bg-blue-50/50" : "font-normal text-slate-600 bg-transparent"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── DESKTOP NAV ── */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV_ITEMS.map(item => <NavLink key={item.label} item={item} />)}
            </nav>

            {/* ── ACTIONS ── */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {/* Desktop auth — guest */}
              {!loading && !isAuthenticated && (
                <>
                  <button onClick={() => setLoginOpen(true)} style={T.tap}
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#1D4ED8] border-2 border-blue-200 rounded-xl transition-all hover:border-[#2563EB] hover:bg-blue-50 whitespace-nowrap">
                    <UserIcon />Sign In
                  </button>
                  <button onClick={() => setRegisterOpen(true)} style={T.tap}
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#1E40AF] border-2 border-[#2563EB] rounded-xl transition-all hover:bg-blue-50 whitespace-nowrap">
                    Register
                  </button>
                </>
              )}
              {/* Authenticated profile */}
              {!loading && isAuthenticated && <ProfileDropdown user={user} />}

              {/* ── POST FREE / POST PROPERTY button ── */}
              <a href={postHref} onClick={handlePostClick} style={{ background: "linear-gradient(135deg,#0B3C8C 0%,#1E40AF 50%,#2563EB 100%)", boxShadow: "0 4px 14px rgba(29,78,216,0.3)", ...T.tap }}
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-black text-white rounded-xl no-underline whitespace-nowrap transition-all hover:-translate-y-0.5 active:scale-[0.97]">
                <span className="hidden sm:inline">Post Property</span>
                <span className="sm:hidden">Post</span>
                <span className="bg-white text-[#1E40AF] text-[8px] md:text-[9px] font-black px-1.5 py-[2px] rounded-[3px]">FREE</span>
              </a>

              {/* ── HAMBURGER ── */}
              <button onClick={() => setMobileOpen(!mobileOpen)} style={T.tap}
                className="lg:hidden flex flex-col justify-center gap-[5px] cursor-pointer p-2 border-none bg-transparent rounded-lg active:bg-blue-50"
                aria-label="Toggle menu">
                <span className={`block w-5 h-0.5 bg-[#1E40AF] rounded-full transition-all duration-200 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block w-5 h-0.5 bg-[#1E40AF] rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-[#1E40AF] rounded-full transition-all duration-200 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── MOBILE DRAWER ── */}
          {mobileOpen && (
            <div className="lg:hidden bg-white border-t border-slate-100 overflow-y-auto overscroll-contain max-h-[88vh]"
              style={{ animation: "slideDown 0.2s ease" }}>

              {/* City pills */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your City</p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => setCity(c)} style={{ ...(c === city ? { background: "linear-gradient(135deg,#1E40AF,#2563EB)" } : {}), ...T.tap }}
                      className={`px-3 py-1.5 text-xs rounded-full border-2 font-bold transition-all cursor-pointer font-[inherit] active:scale-95
                        ${c === city ? "text-white border-[#2563EB]" : "bg-white border-slate-200 text-[#1D4ED8] hover:border-[#2563EB]/40"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nav accordion */}
              <div className="divide-y divide-slate-100">
                {NAV_ITEMS.map(item => (
                  <div key={item.label}>
                    {item.columns ? (
                      <>
                        <button onClick={() => setMobileAccordion(mobileAccordion === item.label ? null : item.label)}
                          style={T.tap}
                          className="flex w-full justify-between items-center px-4 py-4 text-[15px] font-semibold text-slate-700 bg-transparent border-none cursor-pointer font-[inherit] active:bg-slate-50">
                          {item.label}<ChevronDown open={mobileAccordion === item.label} />
                        </button>
                        {mobileAccordion === item.label && (
                          <div className="bg-blue-50/30 px-4 pb-4" style={{ animation: "slideDown 0.15s ease" }}>
                            {item.columns.map(col => (
                              <div key={col.heading} className="mb-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] mb-2 mt-3">{col.heading}</p>
                                <div className="grid grid-cols-2 gap-x-2">
                                  {col.links.map(link => (
                                    <a key={link.label} href={link.href}
                                      className={`text-[13px] py-2 no-underline transition-colors active:text-[#1D4ED8]
                                        ${link.viewAll ? "col-span-2 text-[#2563EB] font-bold mt-1" : "text-slate-600"}`}>
                                      {link.label}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <a href={item.href || "#"} className="flex justify-between items-center px-4 py-4 text-[15px] font-semibold text-slate-700 no-underline active:bg-slate-50">
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile auth + post CTA */}
              <div className="px-4 pt-4 pb-6 pb-safe flex flex-col gap-3 border-t border-slate-100">
                {!isAuthenticated ? (
                  <>
                    <button onClick={() => { setMobileOpen(false); setLoginOpen(true); }} style={T.tap}
                      className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-bold text-[#1D4ED8] border-2 border-blue-200 rounded-2xl active:bg-blue-50 font-[inherit] bg-white cursor-pointer w-full">
                      <UserIcon />Sign In
                    </button>
                    <button onClick={() => { setMobileOpen(false); setRegisterOpen(true); }} style={T.tap}
                      className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-bold text-[#1E40AF] border-2 border-[#2563EB] rounded-2xl bg-blue-50 active:bg-blue-100 font-[inherit] cursor-pointer w-full">
                      Create Free Account
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-center text-sm font-bold text-[#1E40AF]">Hi, {user?.username} 👋</p>
                    <a href="/my-dashboard"
                      className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-bold text-[#1D4ED8] border-2 border-blue-200 rounded-2xl bg-white no-underline text-center w-full">
                      Dashboard
                    </a>
                    <button onClick={() => { dispatch(logout()); setMobileOpen(false); }} style={T.tap}
                      className="flex items-center justify-center gap-2 py-3.5 text-[15px] font-bold text-red-600 border-2 border-red-300 rounded-2xl bg-red-50 active:bg-red-100 font-[inherit] cursor-pointer w-full">
                      Logout
                    </button>
                  </>
                )}

                {/* Post CTA: authenticated → link, guest → bottom sheet */}
                {isAuthenticated ? (
                  <a href="/post-property"
                    style={{ background: "linear-gradient(135deg,#0B3C8C 0%,#1E40AF 50%,#2563EB 100%)", boxShadow: "0 6px 20px rgba(29,78,216,0.3)", ...T.tap }}
                    className="flex items-center justify-center gap-2 py-4 text-[15px] font-black text-white rounded-2xl no-underline active:opacity-90 w-full">
                    🏠 Post Property
                    <span className="bg-white text-[#1E40AF] text-[9px] font-black px-1.5 py-0.5 rounded">FREE</span>
                  </a>
                ) : (
                  <button onClick={() => { setMobileOpen(false); setPostSheetOpen(true); }}
                    style={{ background: "linear-gradient(135deg,#0B3C8C 0%,#1E40AF 50%,#2563EB 100%)", boxShadow: "0 6px 20px rgba(29,78,216,0.3)", ...T.tap }}
                    className="flex items-center justify-center gap-2 py-4 text-[15px] font-black text-white rounded-2xl cursor-pointer font-[inherit] active:opacity-90 border-none w-full">
                    🏠 Post FREE Property
                    <span className="bg-white text-[#1E40AF] text-[9px] font-black px-1.5 py-0.5 rounded">FREE</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Auth modals */}
      <LoginModal    open={loginOpen}    onClose={() => setLoginOpen(false)} />
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
};

export default RealEstateHeader;