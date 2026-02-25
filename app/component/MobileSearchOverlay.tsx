"use client";

/**
 * MobileSearchOverlay — Think4BuySale
 * ─────────────────────────────────────
 * Navigation (all via useRouter):
 *   Post FAB (guest)     → inline OTP auth bottom sheet
 *   Post FAB (logged in) → /post-property
 *   OTP success          → /my-dashboard
 *   Property card tap    → /property/[slug]
 *   Profile / Saved tabs → /my-dashboard (+ ?tab=saved)
 *
 * OTP Auth: 6-digit, real API (sendOtpApi / verifyOtpApi),
 *   access_token + refresh_token localStorage, Redux setUser
 *
 * Mobile: font-size:16px on all inputs, pb-safe, ≥48px tap targets
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter }      from "next/navigation";
import { sendOtpApi }     from "@/services/authApi";
import { verifyOtpApi }   from "@/services/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser }        from "@/store/slices/authSlice";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Property {
  id: string; slug: string; title: string; locality: string;
  price: string; type: string; bhk?: string; area?: string;
  tag?: "Verified" | "New" | "Featured"; image: string;
}
type AuthStep = "phone" | "otp" | "success";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const RECOMMENDED: Property[] = [
  { id:"1", slug:"3-bhk-flat-sector-150-noida",   title:"3 BHK Flat in Sector 150",    locality:"Noida",                price:"₹1.2 Cr", type:"Apartment", bhk:"3 BHK", area:"1450 sq.ft", tag:"Verified", image:"linear-gradient(135deg,#0B3C8C,#1E40AF)" },
  { id:"2", slug:"2-bhk-ready-gurgaon-sector-57", title:"2 BHK Ready to Move",         locality:"Gurgaon, Sector 57",   price:"₹75 L",   type:"Apartment", bhk:"2 BHK", area:"980 sq.ft",  tag:"New",      image:"linear-gradient(135deg,#1E3A5F,#2563EB)" },
  { id:"3", slug:"independent-villa-whitefield",  title:"Independent Villa",           locality:"Whitefield, Bangalore",price:"₹2.8 Cr", type:"Villa",     bhk:"4 BHK", area:"2800 sq.ft", tag:"Featured", image:"linear-gradient(135deg,#0B3C8C,#0D9488)" },
  { id:"4", slug:"studio-apartment-andheri-west", title:"Studio Apartment",            locality:"Andheri West, Mumbai", price:"₹42 L",   type:"Studio",               area:"420 sq.ft",              image:"linear-gradient(135deg,#1E3A5F,#7C3AED)" },
];
const CITIES  = ["Delhi","Mumbai","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Noida","Gurgaon","Ahmedabad"];
const POPULAR = [
  { q:"2 BHK in Delhi",     icon:"🏠", cat:"Buy"        },
  { q:"Flats in Mumbai",    icon:"🏢", cat:"Rent"       },
  { q:"Villa in Bangalore", icon:"🌿", cat:"Buy"        },
  { q:"PG in Noida",        icon:"🛏️", cat:"PG"        },
  { q:"Office Gurgaon",     icon:"💼", cat:"Commercial" },
  { q:"Ready to Move Pune", icon:"✅", cat:"Buy"        },
];
const CATS = ["All","Buy","Rent","Projects","Commercial","PG","Plots"];

// ─── ICONS ────────────────────────────────────────────────────────────────────

const Ic = {
  Back:     () => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  X:        ({ s=16 }: { s?: number }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Search:   ({ c="#94a3b8", s=15 }: { c?: string; s?: number }) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Pin:      ({ c="#94a3b8" }: { c?: string }) => <svg width="12" height="12" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>,
  Star:     () => <svg width="10" height="10" fill="#f59e0b" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Heart:    ({ f=false }: { f?: boolean }) => <svg width="14" height="14" fill={f?"#ef4444":"none"} stroke={f?"#ef4444":"white"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Arrow:    () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>,
  Trend:    () => <svg width="12" height="12" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  ChevR:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>,
  Check:    ({ s=10, c="white" }: { s?: number; c?: string }) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
  Spinner:  ({ c="white" }: { c?: string }) => <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke={c} strokeWidth="4"/><path className="opacity-75" fill={c} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  Shield:   () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Plus:     () => <svg width="21" height="21" fill="white" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
};

// ─── BOTTOM NAV ICONS ─────────────────────────────────────────────────────────

const NavHome   = ({ a }: { a: boolean }) => <svg width="21" height="21" viewBox="0 0 24 24" fill={a?"#0B3C8C":"none"} stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
const NavBar    = ({ a }: { a: boolean }) => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const NavHeart  = ({ a }: { a: boolean }) => <svg width="21" height="21" viewBox="0 0 24 24" fill={a?"#0B3C8C":"none"} stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const NavPerson = ({ a }: { a: boolean }) => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;

// ─── 6-BOX OTP INPUT ─────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  // Always exactly 6 slots — use a plain array, no string-padding tricks
  const refs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const safeValue = value.slice(0, 6);
  const slots = Array.from({ length: 6 }, (_, i) => safeValue[i] ?? "");

  const focus = (i: number) => setTimeout(() => refs.current[i]?.focus(), 0);

  const handleChange = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, "").slice(-1);
    const next = slots.slice(); next[i] = ch;
    onChange(next.join(""));
    if (ch && i < 5) focus(i + 1);
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = slots.slice(); next[i] = "";
      onChange(next.join(""));
      if (i > 0) focus(i - 1);
    }
    if (e.key === "ArrowLeft"  && i > 0) focus(i - 1);
    if (e.key === "ArrowRight" && i < 5) focus(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    focus(Math.min(p.length, 5));
  };

  return (
    <div style={{ display:"flex", gap:8 }} role="group" aria-label="6-digit OTP">
      {slots.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`OTP digit ${i + 1}`}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            flex: "1 1 0",
            minWidth: 0,
            height: 54,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 900,
            borderRadius: 14,
            border: `2px solid ${d ? "#2563EB" : "#e2e8f0"}`,
            background: d ? "#EFF6FF" : "#fff",
            color: d ? "#0B3C8C" : "#cbd5e1",
            outline: "none",
            boxShadow: d ? "0 2px 10px rgba(37,99,235,.15)" : "none",
            transition: "border-color .15s, background .15s, box-shadow .15s",
            WebkitTapHighlightColor: "transparent",
            opacity: disabled ? 0.45 : 1,
          }}
        />
      ))}
    </div>
  );
}

// ─── COUNTDOWN RING ───────────────────────────────────────────────────────────

function CountdownRing({ timer, total }: { timer: number; total: number }) {
  const r    = 12;
  const circ = 2 * Math.PI * r;
  const pct  = total > 0 ? timer / total : 0;
  return (
    <div className="relative w-8 h-8 flex-shrink-0">
      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 28 28" aria-hidden>
        <circle cx="14" cy="14" r={r} fill="none" stroke="#EFF6FF" strokeWidth="2.5"/>
        <circle cx="14" cy="14" r={r} fill="none" stroke="#2563EB" strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition:"stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#0B3C8C]">{timer}</span>
    </div>
  );
}

// ─── AUTH SHEET ───────────────────────────────────────────────────────────────
// Renders as a smooth bottom sheet with backdrop blur

function AuthSheet({ onClose, onSuccess }: {
  onClose:   () => void;
  onSuccess: (name: string) => void;
}) {
  const dispatch = useAppDispatch();

  const [step,        setStep]        = useState<AuthStep>("phone");
  const [phone,       setPhone]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [timer,       setTimer]       = useState(0);
  const [timerTotal,  setTimerTotal]  = useState(30);
  const [phoneErr,    setPhoneErr]    = useState("");
  const [otpErr,      setOtpErr]      = useState("");
  const [apiErr,      setApiErr]      = useState("");
  const [userName,    setUserName]    = useState("");
  const [visible,     setVisible]     = useState(false);   // controls CSS slide animation

  const phoneRef = useRef<HTMLInputElement>(null);

  // Trigger open animation on mount
  useEffect(() => {
    // rAF ensures the initial translateY(100%) is painted before we add the class
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    setTimeout(() => phoneRef.current?.focus(), 350);
  }, []);

  // OTP countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(p => Math.max(p - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Auto-verify on 6th digit
  useEffect(() => {
    if (step === "otp" && otp.length === 6 && !loading) doVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const closeWithAnimation = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // ── helpers: unwrap axios OR plain-fetch response ────────────────────────
  // sendOtpApi / verifyOtpApi may return axios {data:{...}} or plain {success, ...}
  const unwrap = (res: any) => res?.data ?? res;

  // ── SEND OTP ──────────────────────────────────────────────────────────────
  const doSend = async () => {
  if (!/^[6-9]\d{9}$/.test(phone)) {
    setPhoneErr("Enter a valid 10-digit mobile number");
    return;
  }

  setPhoneErr("");
  setApiErr("");
  setLoading(true);

  try {
    const raw = await sendOtpApi({ phone });
    const res = unwrap(raw);

    if (res?.success === false)
      throw new Error(res.message ?? "Failed to send OTP");

    const expiry = res?.expiresIn ?? 30;

    setTimerTotal(expiry);
    setTimer(expiry);

    setStep("otp");
    setOtpErr("");

    // ✅ AUTO FILL OTP IF AVAILABLE
    if (res?.otp) {
       setOtp(res.otp);
    } else {
      setOtp("");
    }

  } catch (err: any) {
    setApiErr(
      err?.response?.data?.message ??
      err?.message ??
      "Failed to send OTP. Try again."
    );
  } finally {
    setLoading(false);
  }
};

  // ── VERIFY OTP ────────────────────────────────────────────────────────────
  const doVerify = async () => {
    if (otp.length < 6) { setOtpErr("Enter the complete 6-digit OTP"); return; }
    setOtpErr(""); setApiErr(""); setLoading(true);
    try {
      const raw    = await verifyOtpApi({ phone, otp });
      const res    = unwrap(raw);                                  // { success, user, access_token, refresh_token }
      const result = res?.data ?? res;                             // handle nested data.data too
      if (result?.success === false) throw new Error(result.message ?? "Invalid OTP");
      if (result?.access_token)  localStorage.setItem("access_token",  result.access_token);
      if (result?.refresh_token) localStorage.setItem("refresh_token", result.refresh_token);
      if (result?.user) {
        dispatch(setUser(result.user));
        setUserName(result.user.name ?? result.user.ownerName ?? result.user.username ?? "");
      }
      setStep("success");
    } catch (err: any) {
      setOtpErr(
        err?.response?.data?.message ?? err?.message ?? "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── RESEND ────────────────────────────────────────────────────────────────
  const doResend = async () => {
  setOtp("");
  setOtpErr("");
  setApiErr("");

  try {
    const raw = await sendOtpApi({ phone });
    const res = unwrap(raw);

    const expiry = res?.expiresIn ?? timerTotal;
    setTimerTotal(expiry);
    setTimer(expiry);

    // ✅ Auto fill again if provided
    if (res?.otp) {
      setOtp(res.otp.toString().slice(0, 6));
    }

  } catch (err: any) {
    setApiErr(err?.response?.data?.message ?? "Could not resend OTP.");
  }
};

  const stepIdx = step === "phone" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end overflow-hidden">

      {/* ── Backdrop — fades in with sheet ── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background:"rgba(7,27,65,0.72)", backdropFilter:"blur(4px)", opacity: visible ? 1 : 0 }}
        onClick={closeWithAnimation}
      />

      {/* ── Sheet ── */}
      <div
        className="relative bg-white w-full overflow-hidden"
        style={{
          borderRadius: "24px 24px 0 0",
          maxHeight: "90dvh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          paddingBottom: "env(safe-area-inset-bottom, 20px)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
        }}
      >
        {/* Gradient top accent */}
        <div className="h-[3px] w-full" style={{ background:"linear-gradient(90deg,#0B3C8C,#1E40AF,#2563EB,#60a5fa)" }}/>

        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="w-9 h-[3px] bg-slate-200 rounded-full"/>
        </div>

        <div className="px-5 pt-5 pb-2">

          {/* ── Top row: title + close ── */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              {/* Back arrow on OTP step */}
              {step === "otp" && (
                <button
                  onClick={() => { setStep("phone"); setOtp(""); setOtpErr(""); setApiErr(""); }}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border-none cursor-pointer flex-shrink-0 active:bg-slate-200 transition-colors"
                  style={{ WebkitTapHighlightColor:"transparent" }}
                  aria-label="Back to phone"
                >
                  <Ic.Back/>
                </button>
              )}
              <div>
                <p className="text-[9px] font-black tracking-[.18em] uppercase text-[#2563EB] mb-0.5">
                  Think4BuySale · Free Listing
                </p>
                <h2 className="text-[19px] font-black text-[#0B3C8C] leading-tight">
                  {step === "phone"   && "Post Your Property"}
                  {step === "otp"     && "Enter OTP"}
                  {step === "success" && "You're Verified! 🎉"}
                </h2>
              </div>
            </div>
            <button
              onClick={closeWithAnimation}
              className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border-none cursor-pointer flex-shrink-0 active:bg-slate-200 transition-colors"
              style={{ WebkitTapHighlightColor:"transparent" }}
              aria-label="Close"
            >
              <Ic.X s={14}/>
            </button>
          </div>

          {/* ── Step dots ── */}
          <div className="flex items-center gap-1.5 mb-5">
            {[0,1,2].map(i => {
              const done   = i < stepIdx;
              const active = i === stepIdx;
              return (
                <React.Fragment key={i}>
                  <div className={`
                    flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-300
                    ${done   ? "w-5 h-5 bg-emerald-500" : ""}
                    ${active ? "w-5 h-5 bg-[#0B3C8C]"   : ""}
                    ${!done && !active ? "w-1.5 h-1.5 bg-slate-200" : ""}
                  `}>
                    {done   && <Ic.Check s={8}/>}
                    {active && <span className="text-white text-[8px] font-black">{i+1}</span>}
                  </div>
                  {i < 2 && <div className={`flex-1 h-[2px] rounded-full transition-all duration-400 ${done ? "bg-emerald-400" : "bg-slate-100"}`}/>}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── API error banner ── */}
          {apiErr && (
            <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-3.5 py-3 mb-4">
              <span className="text-red-500 text-sm flex-shrink-0 mt-px">⚠</span>
              <p className="text-red-600 text-[12px] font-semibold flex-1 leading-snug">{apiErr}</p>
              <button onClick={() => setApiErr("")} className="text-red-400 border-none bg-transparent cursor-pointer text-base p-0 leading-none">×</button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* STEP 1 — PHONE                                      */}
          {/* ════════════════════════════════════════════════════ */}
          {step === "phone" && (
            <div>
              {/* Trust pills */}
              <div className="flex gap-2 mb-5 overflow-x-auto no-sb">
                {[["⚡","Go Live Fast"],["🆓","100% Free"],["🔒","Hide Number"]].map(([icon, label]) => (
                  <div key={label} className="flex-shrink-0 flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
                    <span className="text-sm leading-none">{icon}</span>
                    <span className="text-[11px] font-bold text-[#1D4ED8] whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>

              {/* Phone input */}
              <label htmlFor="auth-phone" className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400 block mb-2">
                Mobile Number <span className="text-red-400">•</span>
              </label>
              <div className={`
                flex items-center rounded-2xl border-2 overflow-hidden transition-all duration-200
                ${phoneErr
                  ? "border-red-300 bg-red-50/30"
                  : "border-slate-200 bg-slate-50 focus-within:border-[#2563EB] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,.08)]"
                }
              `}>
                <span className="flex items-center gap-1 pl-4 pr-3 py-3.5 text-[14px] font-black text-[#0B3C8C] border-r-2 border-slate-200 bg-slate-100/80 flex-shrink-0 select-none whitespace-nowrap">
                  🇮🇳 +91
                </span>
                <input
                  id="auth-phone"
                  ref={phoneRef}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g,"").slice(0,10)); setPhoneErr(""); }}
                  onKeyDown={e => e.key === "Enter" && doSend()}
                  placeholder="10-digit number"
                  aria-required="true"
                  className="flex-1 border-none outline-none bg-transparent pl-3 pr-4 py-3.5 text-[#0B3C8C] font-semibold placeholder-slate-300"
                  style={{ fontSize:"16px" }}
                />
                {phone.length === 10 && (
                  <span className="pr-3.5 text-emerald-500">
                    <Ic.Check s={16} c="#059669"/>
                  </span>
                )}
              </div>
              {phoneErr && <p role="alert" className="text-red-500 text-[11px] font-semibold mt-1.5 flex items-center gap-1">⚠ {phoneErr}</p>}

              {/* CTA */}
              <button
                onClick={doSend}
                disabled={loading}
                className="w-full mt-5 py-[15px] rounded-2xl text-[15px] font-black text-white border-none cursor-pointer disabled:opacity-55 active:scale-[.98] transition-all flex items-center justify-center gap-2"
                style={{ background:"linear-gradient(135deg,#0B3C8C,#1E40AF,#2563EB)", boxShadow:"0 6px 24px rgba(11,60,140,.35)", WebkitTapHighlightColor:"transparent" }}
              >
                {loading ? <><Ic.Spinner/> Sending OTP…</> : <>Get OTP · Post FREE →</>}
              </button>

              <p className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-3">
                <Ic.Shield/> We never share your number with anyone
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* STEP 2 — OTP                                        */}
          {/* ════════════════════════════════════════════════════ */}
          {step === "otp" && (
            <div>
              <p className="text-[12px] text-slate-500 mb-1">
                Sent to <strong className="text-[#0B3C8C] font-black">+91 {phone}</strong>
              </p>
              <button
                onClick={() => { setStep("phone"); setOtp(""); setOtpErr(""); setApiErr(""); }}
                className="text-[11px] text-[#2563EB] font-bold border-none bg-transparent cursor-pointer p-0 mb-5 hover:underline"
                style={{ WebkitTapHighlightColor:"transparent" }}
              >
                Change number?
              </button>

              {/* OTP progress bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(otp.length / 6) * 100}%`,
                    background: "linear-gradient(90deg,#0B3C8C,#2563EB)",
                    transition: "width 0.15s ease",
                  }}
                />
              </div>

              {/* 6 boxes */}
              <OtpInput value={otp} onChange={setOtp} disabled={loading}/>

              {otpErr && (
                <p role="alert" className="text-red-500 text-[12px] font-bold mt-3 text-center flex items-center justify-center gap-1">
                  ⚠ {otpErr}
                </p>
              )}

              {/* Verify CTA */}
              <button
                onClick={doVerify}
                disabled={otp.length < 6 || loading}
                className="w-full mt-5 py-[15px] rounded-2xl text-[15px] font-black text-white border-none cursor-pointer disabled:opacity-50 active:scale-[.98] transition-all flex items-center justify-center gap-2"
                style={{ background:"linear-gradient(135deg,#0B3C8C,#1E40AF,#2563EB)", boxShadow:"0 6px 24px rgba(11,60,140,.35)", WebkitTapHighlightColor:"transparent" }}
              >
                {loading
                  ? <><Ic.Spinner/> Verifying…</>
                  : otp.length === 6
                    ? <><Ic.Check s={15}/> Verify &amp; Continue</>
                    : `Enter OTP (${otp.length}/6)`
                }
              </button>

              {/* Resend row */}
              <div className="flex items-center justify-between mt-4 pb-2">
                {timer > 0 ? (
                  <div className="flex items-center gap-2">
                    <CountdownRing timer={timer} total={timerTotal}/>
                    <p className="text-[11px] text-slate-500 font-semibold">Resend in {timer}s</p>
                  </div>
                ) : (
                  <button
                    onClick={doResend}
                    className="text-[13px] text-[#2563EB] font-black hover:underline border-none bg-transparent cursor-pointer"
                    style={{ WebkitTapHighlightColor:"transparent" }}
                  >
                    Resend OTP
                  </button>
                )}
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Ic.Shield/> Encrypted
                </p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* STEP 3 — SUCCESS                                    */}
          {/* ════════════════════════════════════════════════════ */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center pb-2">
              {/* Animated check circle */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg,#34d399,#059669)",
                  boxShadow: "0 8px 28px rgba(16,185,129,.4)",
                  animation: "successPop .5s cubic-bezier(.34,1.56,.64,1) both",
                }}
                aria-hidden
              >
                <Ic.Check s={28}/>
              </div>

              <h3 className="text-[18px] font-black text-[#0B3C8C] mb-1">Account Verified!</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed max-w-[200px] mb-5">
                {userName ? `Welcome, ${userName.split(" ")[0]}! ` : ""}Ready to post your property and get genuine enquiries.
              </p>

              {/* Checklist */}
              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                {["Post your listing for FREE","Upload photos & set price","Track views & enquiries live"].map(b => (
                  <div key={b} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Ic.Check s={8} c="#059669"/>
                    </div>
                    <span className="text-[12px] font-medium text-slate-700">{b}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSuccess(userName)}
                className="w-full py-[15px] rounded-2xl text-[15px] font-black text-white border-none cursor-pointer active:scale-[.98] transition-all flex items-center justify-center gap-2 mb-3"
                style={{ background:"linear-gradient(135deg,#0B3C8C,#1E40AF,#2563EB)", boxShadow:"0 6px 24px rgba(11,60,140,.35)", WebkitTapHighlightColor:"transparent" }}
              >
                Go to My Dashboard →
              </button>
              <button
                onClick={closeWithAnimation}
                className="w-full py-3 rounded-2xl text-[12px] font-bold text-slate-500 border border-slate-200 bg-white active:bg-slate-50 transition-all cursor-pointer"
                style={{ WebkitTapHighlightColor:"transparent" }}
              >
                Continue Browsing
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

const BottomNav: React.FC<{ active: string; onChange: (t: string) => void }> = ({ active, onChange }) => (
  <div className="flex-shrink-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(11,60,140,0.07)]"
    style={{ paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
    <div className="flex items-end h-16">
      {[{ id:"home", Icon:NavHome, label:"Home" }, { id:"insights", Icon:NavBar, label:"Insights" }].map(({ id, Icon, label }) => (
        <button key={id} onClick={() => onChange(id)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full border-none bg-transparent cursor-pointer"
          style={{ WebkitTapHighlightColor:"transparent" }}>
          <Icon a={active === id}/>
          <span className={`text-[10px] font-semibold ${active === id ? "text-[#0B3C8C]" : "text-slate-400"}`}>{label}</span>
        </button>
      ))}

      {/* Post FAB */}
      <div className="flex-1 flex flex-col items-center justify-end pb-2 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-white rounded-t-full"/>
        <button onClick={() => onChange("post")}
          className="relative -mt-7 rounded-full flex items-center justify-center border-4 border-white cursor-pointer active:scale-[.93] transition-transform"
          style={{ width:52, height:52, background:"linear-gradient(135deg,#0B3C8C,#1E40AF,#2563EB)", boxShadow:"0 6px 20px rgba(11,60,140,.38)", WebkitTapHighlightColor:"transparent" }}
          aria-label="Post property">
          <Ic.Plus/>
        </button>
        <span className={`text-[10px] font-semibold mt-1 ${active === "post" ? "text-[#0B3C8C]" : "text-slate-400"}`}>Post</span>
      </div>

      {[{ id:"saved", Icon:NavHeart, label:"Saved" }, { id:"profile", Icon:NavPerson, label:"Profile" }].map(({ id, Icon, label }) => (
        <button key={id} onClick={() => onChange(id)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full border-none bg-transparent cursor-pointer"
          style={{ WebkitTapHighlightColor:"transparent" }}>
          <Icon a={active === id}/>
          <span className={`text-[10px] font-semibold ${active === id ? "text-[#0B3C8C]" : "text-slate-400"}`}>{label}</span>
        </button>
      ))}
    </div>
  </div>
);

// ─── PROPERTY CARDS ───────────────────────────────────────────────────────────

const TC: Record<string, string> = { Verified:"bg-emerald-500", New:"bg-blue-500", Featured:"bg-amber-500" };

const PropCardV: React.FC<{ p: Property; i: number; onTap: (s: string) => void }> = ({ p, i, onTap }) => {
  const [saved, setSaved] = useState(false);
  return (
    <div onClick={() => onTap(p.slug)}
      className="prop-card flex-shrink-0 w-[180px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.97] transition-all cursor-pointer"
      style={{ animationDelay:`${i * 0.06}s` }} role="button" aria-label={`View ${p.title}`}>
      <div className="relative h-[100px]" style={{ background:p.image }}>
        {p.tag && <span className={`absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${TC[p.tag]}`}>{p.tag==="Verified"&&"✓ "}{p.tag}</span>}
        <button onClick={e=>{e.stopPropagation();setSaved(!saved);}} aria-label={saved?"Unsave":"Save"}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/25 rounded-full border-none cursor-pointer">
          <Ic.Heart f={saved}/>
        </button>
      </div>
      <div className="p-3">
        <p className="text-[12px] font-semibold text-[#0B3C8C] leading-tight truncate mb-0.5">{p.title}</p>
        <p className="text-[10px] text-slate-400 flex items-center gap-1 mb-2 truncate"><Ic.Pin c="#94a3b8"/>{p.locality}</p>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#0B3C8C]">{p.price}</span>
          {p.bhk && <span className="text-[10px] font-semibold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded-full">{p.bhk}</span>}
        </div>
      </div>
    </div>
  );
};

const PropCardH: React.FC<{ p: Property; i: number; onTap: (s: string) => void }> = ({ p, i, onTap }) => {
  const [saved, setSaved] = useState(false);
  return (
    <div onClick={() => onTap(p.slug)}
      className="prop-card flex gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.985] transition-all cursor-pointer"
      style={{ animationDelay:`${0.06 + i * 0.05}s` }} role="button" aria-label={`View ${p.title}`}>
      <div className="relative w-[100px] flex-shrink-0 min-h-[88px]" style={{ background:p.image }}>
        {p.tag && <span className={`absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${TC[p.tag]}`}>{p.tag==="Verified"&&"✓ "}{p.tag}</span>}
        <button onClick={e=>{e.stopPropagation();setSaved(!saved);}} aria-label={saved?"Unsave":"Save"}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-black/25 rounded-full border-none cursor-pointer">
          <Ic.Heart f={saved}/>
        </button>
      </div>
      <div className="flex-1 py-3 pr-3 min-w-0">
        <p className="text-[13px] font-semibold text-[#0B3C8C] leading-tight truncate mb-0.5">{p.title}</p>
        <p className="text-[11px] text-slate-400 truncate mb-2 flex items-center gap-1"><Ic.Pin c="#94a3b8"/>{p.locality}</p>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {p.bhk  && <span className="text-[10px] font-semibold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded-full">{p.bhk}</span>}
          {p.area && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.area}</span>}
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.type}</span>
        </div>
        <p className="text-[14px] font-bold text-[#0B3C8C]">{p.price}</p>
      </div>
    </div>
  );
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export const MobileSearchOverlay: React.FC<{
  isOpen: boolean; onClose: () => void; initialQuery?: string;
}> = ({ isOpen, onClose, initialQuery = "" }) => {
  const router   = useRouter();
  const [q,        setQ]        = useState(initialQuery);
  const [cat,      setCat]      = useState("All");
  const [results,  setResults]  = useState(false);
  const [navTab,   setNavTab]   = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = useCallback(() =>
    typeof window !== "undefined" && !!localStorage.getItem("access_token"), []);

  useEffect(() => {
    if (isOpen) {
      setQ(initialQuery); setResults(false); setNavTab("home"); setShowAuth(false);
      setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, initialQuery]);

  const handleNavChange = useCallback((tab: string) => {
    setNavTab(tab);
    if (tab === "post")    { isLoggedIn() ? router.push("/post-property") : setShowAuth(true); return; }
    if (tab === "profile") { router.push("/my-dashboard");        return; }
    if (tab === "saved")   { router.push("/my-dashboard?tab=saved"); return; }
    if (tab === "insights"){ router.push("/insights");             return; }
  }, [router, isLoggedIn]);

  const handlePropertyTap = useCallback((slug: string) => { router.push(`/property/${slug}`); }, [router]);
  const triggerSearch     = useCallback((query?: string) => { if (query !== undefined) setQ(query); setResults(true); }, []);
  const handleAuthSuccess = useCallback((_n: string) => { setShowAuth(false); router.push("/my-dashboard"); }, [router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *{font-family:'DM Sans',sans-serif;box-sizing:border-box}

        @keyframes slideUp2  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes cardIn    { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
        @keyframes cBounce   { from{opacity:0;transform:scale(0.9)}       to{opacity:1;transform:scale(1)} }
        @keyframes pr2       { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes successPop{ 0%{transform:scale(0.3);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

        .ov2       { animation: slideUp2 .25s cubic-bezier(.22,1,.36,1) both }
        .prop-card { animation: cardIn   .28s cubic-bezier(.22,1,.36,1) both }
        .cb2       { animation: cBounce  .3s  cubic-bezier(.22,1,.36,1) both }
        .pr2       { animation: pr2 1.6s ease-in-out infinite }

        .no-sb::-webkit-scrollbar{display:none}
        .no-sb{-ms-overflow-style:none;scrollbar-width:none}
        .pb-safe{padding-bottom:env(safe-area-inset-bottom,16px)}
      `}</style>

      <div className="ov2 flex flex-col h-full relative">

        {/* ── Dark Glass Header ── */}
        <div className="flex-shrink-0 relative overflow-hidden"
          style={{ background:"linear-gradient(160deg,#071B41 0%,#0B3C8C 50%,#1E40AF 100%)" }}>
          <div className="absolute inset-0 pointer-events-none" aria-hidden
            style={{ backgroundImage:"radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize:"20px 20px" }}/>
          <div className="absolute -top-10 right-0 w-[180px] h-[180px] rounded-full blur-[70px] pointer-events-none"
            style={{ background:"radial-gradient(circle,rgba(59,130,246,.25),transparent 65%)" }}/>

          <div className="relative px-4 pt-4 pb-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={onClose} aria-label="Back"
                className="flex items-center gap-2 text-white/80 bg-white/10 border border-white/15 rounded-xl px-3 py-2 cursor-pointer font-[inherit] active:scale-[0.97] transition-all"
                style={{ WebkitTapHighlightColor:"transparent" }}>
                <Ic.Back/>
                <span className="text-[13px] font-semibold">Back</span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pr2"/>
                <span className="text-[10px] font-black tracking-[0.18em] uppercase text-white/50">Find Properties</span>
              </div>
              <button onClick={onClose} aria-label="Close"
                className="text-white/50 bg-white/10 p-2 rounded-xl cursor-pointer border-none transition-all active:bg-white/20"
                style={{ WebkitTapHighlightColor:"transparent" }}>
                <Ic.X s={15}/>
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-3 border border-white/20"
              style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(12px)", boxShadow:"0 4px 16px rgba(0,0,0,0.18)" }}>
              <Ic.Search c="rgba(255,255,255,0.4)" s={16}/>
              <input ref={inputRef} type="text" value={q}
                onChange={e => { setQ(e.target.value); if (results && !e.target.value) setResults(false); }}
                onKeyDown={e => e.key === "Enter" && triggerSearch()}
                placeholder="City, locality, project..."
                aria-label="Search properties"
                className="flex-1 border-none outline-none bg-transparent text-white placeholder-white/35 font-[inherit]"
                style={{ fontSize:"16px" }}/>
              {q && (
                <button onClick={() => { setQ(""); setResults(false); }} aria-label="Clear"
                  className="text-white/40 border-none bg-transparent cursor-pointer p-0.5 hover:text-white transition-colors">
                  <Ic.X s={14}/>
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto no-sb pb-0.5 mb-3">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer font-[inherit]
                    ${cat === c ? "bg-white text-[#0B3C8C] border-white shadow-sm" : "bg-white/10 text-white/65 border-white/20 hover:bg-white/18 hover:text-white"}`}
                  style={{ WebkitTapHighlightColor:"transparent" }}>
                  {c}
                </button>
              ))}
            </div>

            <button onClick={() => triggerSearch()}
              className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-[#0B3C8C] border-none cursor-pointer active:scale-[0.98] transition-all font-[inherit]"
              style={{ background:"linear-gradient(135deg,#fde68a,#f59e0b,#d97706)", boxShadow:"0 4px 14px rgba(245,158,11,.38)", WebkitTapHighlightColor:"transparent" }}>
              🔍 Search {cat !== "All" ? `${cat} ` : ""}Properties
            </button>
          </div>
        </div>

        {/* ── Scroll Body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ background:"#F8FAFC" }}>
          {results ? (
            <div className="px-4 pt-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-bold text-[#0B3C8C]">
                    {q ? `"${q}"` : "All Properties"}
                    {cat !== "All" && <span className="text-slate-400 font-normal text-[13px]"> · {cat}</span>}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{RECOMMENDED.length} properties found</p>
                </div>
                <button onClick={() => setResults(false)}
                  className="text-[11px] font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full cursor-pointer font-[inherit]"
                  style={{ WebkitTapHighlightColor:"transparent" }}>← Edit</button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-3 no-sb mb-4">
                {["Price ↓","BHK","Area","✓ Verified","Ready Now","New Launch"].map(f => (
                  <button key={f} className="flex-shrink-0 text-[11px] font-semibold text-[#0B3C8C] border border-slate-200 bg-white px-3 py-1.5 rounded-full active:bg-blue-50 cursor-pointer font-[inherit] transition-all">{f}</button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {RECOMMENDED.map((p, i) => <PropCardH key={p.id} p={p} i={i} onTap={handlePropertyTap}/>)}
              </div>
              <button
                onClick={() => router.push(`/properties${q?`?q=${encodeURIComponent(q)}`:""}${cat!=="All"?`${q?"&":"?"}cat=${cat}`:""}`)}
                className="w-full mt-5 py-3.5 rounded-2xl text-[13px] font-semibold text-[#1E40AF] border-2 border-blue-200 bg-white active:bg-blue-50 cursor-pointer font-[inherit] transition-all flex items-center justify-center gap-2"
                style={{ WebkitTapHighlightColor:"transparent" }}>
                See All Results <Ic.ChevR/>
              </button>
            </div>
          ) : (
            <div className="px-4 pt-5 pb-6">
              {/* Recommended */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0B3C8C,#2563EB)" }}><Ic.Star/></div>
                    <span className="text-[13px] font-black text-[#0B3C8C]">Recommended for You</span>
                  </div>
                  <button onClick={() => router.push("/properties?sort=recommended")}
                    className="text-[11px] font-bold text-[#2563EB] cursor-pointer border-none bg-transparent font-[inherit] flex items-center gap-0.5"
                    style={{ WebkitTapHighlightColor:"transparent" }}>
                    View all <Ic.ChevR/>
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-sb">
                  {RECOMMENDED.map((p, i) => <PropCardV key={p.id} p={p} i={i} onTap={handlePropertyTap}/>)}
                </div>
              </div>

              {/* Trending */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100"><Ic.Trend/></div>
                  <span className="text-[13px] font-black text-[#0B3C8C]">Trending Searches</span>
                </div>
                <div className="flex flex-col gap-2">
                  {POPULAR.map((item, i) => (
                    <button key={item.q} onClick={() => triggerSearch(item.q)}
                      className="cb2 flex items-center gap-3 w-full text-left px-4 py-3.5 bg-white rounded-2xl border border-slate-100 active:bg-blue-50 transition-all cursor-pointer font-[inherit] shadow-sm"
                      style={{ animationDelay:`${i * 0.05}s`, WebkitTapHighlightColor:"transparent" }}>
                      <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: i%3===0?"linear-gradient(135deg,#EFF6FF,#DBEAFE)":i%3===1?"linear-gradient(135deg,#F0FDF4,#DCFCE7)":"linear-gradient(135deg,#FFFBEB,#FEF3C7)" }}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0B3C8C] leading-none mb-0.5 truncate">{item.q}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.cat}</p>
                      </div>
                      <span className="text-slate-300 flex-shrink-0"><Ic.Arrow/></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-100"><Ic.Pin c="#f59e0b"/></div>
                  <span className="text-[13px] font-black text-[#0B3C8C]">Browse by City</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c, i) => (
                    <button key={c} onClick={() => triggerSearch(`Property in ${c}`)}
                      className="cb2 px-4 py-2.5 rounded-full text-[12px] font-semibold border border-slate-200 bg-white text-[#0B3C8C] active:bg-blue-50 active:border-[#2563EB] transition-all cursor-pointer font-[inherit] shadow-sm"
                      style={{ animationDelay:`${0.3+i*0.03}s`, WebkitTapHighlightColor:"transparent" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Nav ── */}
        <BottomNav active={navTab} onChange={handleNavChange}/>

        {/* ── Auth Sheet (over everything, inside overlay) ── */}
        {showAuth && (
          <AuthSheet
            onClose={() => { setShowAuth(false); setNavTab("home"); }}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default MobileSearchOverlay;