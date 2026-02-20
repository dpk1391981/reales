"use client";

/**
 * Think4BuySale — Guest Property Post Landing Page
 * ─────────────────────────────────────────────────
 * SEO:     Semantic HTML5, structured headings, alt text, canonical meta suggested
 * Mobile:  font-size:16px on all inputs (prevent iOS zoom), pb-safe, tap targets ≥48px
 * UX:      3-step funnel (Details → OTP → Success), OTP boxes w/ auto-advance,
 *          countdown timer, inline validation, animated stats, testimonial carousel
 *
 * API Integration Points:
 *   sendOtp()   → POST /api/auth/send-otp   { phone }
 *   verifyOtp() → POST /api/auth/verify-otp { phone, otp, intent, propertyType, city, name }
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { v: "residential", l: "Residential",  icon: "🏠", desc: "Flat, Villa, House" },
  { v: "commercial",  l: "Commercial",   icon: "🏢", desc: "Office, Shop" },
  { v: "plot",        l: "Plot / Land",  icon: "📐", desc: "Residential, Farm" },
  { v: "pg",          l: "PG / Co-living", icon: "🛏️", desc: "Boys, Girls, Co-ed" },
];

const CITIES = [
  "Delhi","Mumbai","Bangalore","Hyderabad","Chennai",
  "Pune","Noida","Gurgaon","Kolkata","Ahmedabad",
  "Jaipur","Lucknow","Chandigarh","Surat","Kochi",
];

const STATS = [
  { value: 24,   suffix: "L+", label: "Monthly Visitors",  icon: "👁️" },
  { value: 50,   suffix: "K+", label: "Verified Buyers",   icon: "✅" },
  { value: 10,   suffix: "K+", label: "Deals Closed",      icon: "🤝" },
  { value: 500,  suffix: "+",  label: "Cities Covered",    icon: "🏙️" },
];

const FEATURES = [
  { icon: "⚡", heading: "Live in 2 Minutes",      body: "Fill the form, verify OTP — your listing goes live instantly." },
  { icon: "🔒", heading: "Hide Your Number",        body: "Stay private until you're ready. Only OTP-verified buyers reach you." },
  { icon: "📊", heading: "Real-time Dashboard",     body: "Track views, saves & enquiries from one smart dashboard." },
  { icon: "🏆", heading: "RERA Verified Badge",     body: "Get a trust badge that makes buyers 3× more likely to contact you." },
];

const TESTIMONIALS = [
  { name: "Amit Sharma",   role: "Property Owner", city: "Delhi",     avatar: "A", stars: 5, quote: "Listed my flat in 2 minutes and got 12 enquiries the same day. Unbelievably fast!" },
  { name: "Priya Mehta",   role: "Agent",          city: "Mumbai",    avatar: "P", stars: 5, quote: "Best portal for independent agents. Verification is smooth and leads are genuine." },
  { name: "Rohit Verma",   role: "Builder",        city: "Bangalore", avatar: "R", stars: 5, quote: "Sold 3 units from a single paid listing. The ROI is incredible compared to other portals." },
  { name: "Sunita Kapoor", role: "Property Owner", city: "Gurgaon",   avatar: "S", stars: 5, quote: "Got a tenant in 4 days! Would never go back to newspaper ads or other apps." },
];

// ─── TINY ICONS ───────────────────────────────────────────────────────────────

const IC = {
  Check: ({ s = 12, c = "currentColor" }: { s?: number; c?: string }) => (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
  ),
  Arrow: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
  ),
  ChevD: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
  ),
  Star: () => (
    <svg width="13" height="13" fill="#f59e0b" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  ),
  Phone: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 010 2.13 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
  ),
  Shield: () => (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  Spinner: ({ dark = false }: { dark?: boolean }) => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={dark ? "#0f2342" : "white"} strokeWidth="4" />
      <path className="opacity-75" fill={dark ? "#0f2342" : "white"} d="M4 12a8 8 0 018-8v8z" />
    </svg>
  ),
};

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimCounter({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      obs.disconnect();
      const steps = 50;
      const inc = target / steps;
      let cur = 0;
      const t = setInterval(() => {
        cur = Math.min(cur + inc, target);
        setVal(Math.floor(cur));
        if (cur >= target) clearInterval(t);
      }, 25);
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <em ref={ref} style={{ fontStyle: "normal" }}>{val}{suffix}</em>;
}

// ─── OTP INPUT BOXES ──────────────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const boxes = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const digits = (value + "    ").slice(0, 4).split("");

  const handleInput = (i: number, raw: string) => {
    const d = raw.replace(/\D/, "").slice(-1);
    const arr = (value + "    ").slice(0, 4).split("");
    arr[i] = d;
    const next = arr.join("").replace(/ /g, "");
    onChange(next);
    if (d && i < 3) setTimeout(() => boxes[i + 1].current?.focus(), 10);
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i]?.trim() && i > 0)
      boxes[i - 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(p);
    boxes[Math.min(p.length, 3)].current?.focus();
  };

  return (
    <div className="flex gap-3 justify-center my-5" role="group" aria-label="OTP input">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={boxes[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          aria-label={`OTP digit ${i + 1}`}
          onPaste={handlePaste}
          onChange={e => handleInput(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-14 h-16 text-center font-black border-2 rounded-2xl outline-none transition-all duration-200
            ${d.trim()
              ? "border-amber-400 bg-gradient-to-b from-amber-50 to-white text-[#0f2342] shadow-[0_4px_16px_rgba(245,158,11,0.2)]"
              : "border-slate-200 bg-slate-50 text-slate-300"
            }
            focus:border-amber-500 focus:ring-4 focus:ring-amber-100 focus:bg-white`}
          style={{ fontSize: "24px", WebkitTapHighlightColor: "transparent" }}
        />
      ))}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function Think4BuySaleLanding() {
  const router = useRouter();

  const [form, setForm] = useState({
    intent: "sell", propertyType: "residential",
    city: "", name: "", phone: "", otp: "",
  });
  const [step, setStep]     = useState<"form" | "otp" | "success">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [timer, setTimer]   = useState(0);
  const [testIdx, setTestIdx] = useState(0);

  const upd = useCallback((k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  }, []);

  // Testimonial auto-rotate
  useEffect(() => {
    const t = setInterval(() => setTestIdx(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // OTP countdown
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.city)                           e.city  = "Please select your city";
    if (!form.name || form.name.trim().length < 3) e.name  = "Enter your full name (min 3 chars)";
    if (!/^[6-9]\d{9}$/.test(form.phone))    e.phone = "Enter a valid 10-digit mobile number";
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── API POINT 1: Replace timeout → POST /api/auth/send-otp ─────────────────
  const sendOtp = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); setTimer(30); }, 1000);
  };

  // ── API POINT 2: Replace timeout → POST /api/auth/verify-otp ──────────────
  const verifyOtp = () => {
    if (form.otp.length < 4) { setErrors({ otp: "Enter the complete 4-digit OTP" }); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("success"); }, 1000);
  };

  const resend = () => { setTimer(30); /* call send-otp API again */ };

  // Shared input styling factory
  const inpCls = (err?: string) =>
    `w-full bg-white border-2 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-[#0f2342] placeholder-slate-300 outline-none transition-all duration-200
    ${err
      ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/30"
      : "border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 focus:bg-white"
    }`;

  return (
    <>
      {/* ── SEO & FONT IMPORTS ──────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

        :root {
          --navy: #0b1d3a;
          --navy-mid: #0f2342;
          --navy-light: #1a3a6e;
          --amber: #f59e0b;
          --amber-light: #fbbf24;
          --emerald: #10b981;
          --surface: #f8fafc;
        }

        * { font-family: 'DM Sans', sans-serif; }
        .display { font-family: 'Fraunces', serif; }

        @keyframes heroReveal  { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:none } }
        @keyframes cardReveal  { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes slideIn     { from { opacity:0; transform:translateX(18px) } to { opacity:1; transform:none } }
        @keyframes popBounce   { 0% { transform:scale(0.4); opacity:0 } 65% { transform:scale(1.1) } 100% { transform:scale(1); opacity:1 } }
        @keyframes floatY      { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-12px) } }
        @keyframes shimmer     { 0% { transform:translateX(-200%) } 100% { transform:translateX(200%) } }
        @keyframes pulseGlow   { 0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,0.4) } 50% { box-shadow:0 0 0 10px rgba(245,158,11,0) } }
        @keyframes marquee     { from { transform:translateX(0) } to { transform:translateX(-50%) } }

        .hero-in   { animation: heroReveal 0.8s cubic-bezier(0.22,1,0.36,1) both }
        .card-in   { animation: cardReveal 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both }
        .slide-in  { animation: slideIn   0.35s cubic-bezier(0.22,1,0.36,1) both }
        .float     { animation: floatY    5s ease-in-out infinite }
        .shimmer-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.12) 50%,transparent 100%);
          animation: shimmer 2.5s ease-in-out infinite;
        }
        .marquee-track { animation: marquee 22s linear infinite }

        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px) }
        .no-sb::-webkit-scrollbar { display:none }
        .no-sb { -ms-overflow-style:none; scrollbar-width:none }
        select { -webkit-appearance:none }

        /* Diagonal mesh background */
        .mesh {
          background-color: var(--navy);
          background-image:
            radial-gradient(ellipse 80% 50% at 20% -5%, rgba(245,158,11,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(26,58,110,0.5) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(15,35,66,0.6) 0%, transparent 80%);
        }

        /* Glassmorphism card */
        .glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Diagonal divider */
        .diagonal::after {
          content:'';
          position:absolute; bottom:-1px; left:0; right:0; height:60px;
          background:var(--surface);
          clip-path: polygon(0 100%, 100% 0, 100% 100%);
        }
      `}</style>

      {/* ── ROOT ─────────────────────────────────────────────────────────────── */}
      <div className="min-h-screen mesh relative overflow-x-hidden">

        {/* Decorative glow orbs */}
        <div aria-hidden className="pointer-events-none absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: "radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: "radial-gradient(circle,rgba(16,185,129,0.07),transparent 70%)" }} />

        {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
        <header role="banner">
          <nav aria-label="Main navigation" className="relative z-30 max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">

            {/* Logo */}
            <a href="/" aria-label="Think4BuySale Home" className="flex items-center gap-2.5 no-underline">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(245,158,11,0.5)]"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
              </div>
              <span className="display text-base font-bold text-white">Think4BuySale<span className="text-amber-400">.in</span></span>
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6" role="menubar">
              {["Browse Properties", "New Projects", "Agencies", "Blog"].map(l => (
                <a key={l} href="#" role="menuitem" className="text-white/60 text-sm font-medium hover:text-white transition-colors no-underline">{l}</a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <a href="/login" className="hidden sm:flex items-center gap-1.5 text-white/70 text-sm font-semibold hover:text-white no-underline transition-colors">
                Sign In
              </a>
              <a href="/post-property"
                className="flex items-center gap-1.5 px-4 py-2 text-[#0f2342] text-xs font-black rounded-xl no-underline transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(245,158,11,0.35)" }}>
                Post FREE
              </a>
            </div>
          </nav>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <main>
          <section aria-label="Post property hero" className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 pt-6 pb-16 lg:pt-10 lg:pb-24">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

              {/* ── FORM CARD — mobile first ──────────────────────────────── */}
              <div className="order-1 lg:order-2 card-in">
                <article aria-label="Post property form" className="bg-white rounded-[28px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.05)]">

                  {/* Rainbow top strip */}
                  <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#0f2342 0%,#1a3a6e 25%,#f59e0b 60%,#10b981 100%)" }} aria-hidden />

                  {/* Step indicator */}
                  {step !== "success" && (
                    <div className="flex items-center gap-1 px-6 pt-5 mb-1" aria-label="Form progress" role="progressbar">
                      {["Your Details", "Verify OTP", "You're In!"].map((l, i) => {
                        const cur = step === "form" ? 0 : step === "otp" ? 1 : 2;
                        const done = i < cur, active = i === cur;
                        return (
                          <div key={l} className="flex items-center gap-1 flex-1 last:flex-none">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[9px] font-black flex-shrink-0 transition-all duration-400
                              ${done ? "bg-emerald-500 border-emerald-500" : active ? "bg-[#0f2342] border-[#0f2342]" : "bg-white border-slate-200"}`}>
                              {done
                                ? <IC.Check s={10} c="white" />
                                : <span className={active ? "text-white" : "text-slate-400"}>{i + 1}</span>}
                            </div>
                            <span className={`hidden sm:block text-[10px] font-bold transition-colors ${active ? "text-[#0f2342]" : done ? "text-emerald-500" : "text-slate-300"}`}>{l}</span>
                            {i < 2 && <div className={`flex-1 h-px rounded-full min-w-[8px] transition-all duration-500 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="px-6 pb-6 pt-4 md:px-8 md:pb-8">

                    {/* ── STEP 1: DETAILS ─────────────────────────────────── */}
                    {step === "form" && (
                      <div className="slide-in">
                        <h1 className="display text-[22px] font-bold text-[#0f2342] leading-tight mb-0.5">
                          Post Your Property — <span className="text-emerald-600">FREE</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-medium mb-5">No registration · Go live in 2 minutes · 100% free</p>

                        {/* Intent toggle */}
                        <div className="mb-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2" id="intent-label">I want to</p>
                          <div role="group" aria-labelledby="intent-label" className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                            {[{ v: "sell", l: "📈 Sell" }, { v: "rent", l: "🔑 Rent / Lease" }].map(t => (
                              <button
                                key={t.v}
                                onClick={() => upd("intent", t.v)}
                                aria-pressed={form.intent === t.v}
                                className={`flex-1 py-3 text-sm font-black rounded-xl border-none cursor-pointer font-[inherit] transition-all duration-200
                                  ${form.intent === t.v
                                    ? "bg-white text-[#0f2342] shadow-[0_2px_12px_rgba(15,35,66,0.12)]"
                                    : "bg-transparent text-slate-400 hover:text-slate-600"}`}
                                style={{ WebkitTapHighlightColor: "transparent" }}>
                                {t.l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Property type grid */}
                        <div className="mb-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2" id="type-label">Property Type</p>
                          <div role="group" aria-labelledby="type-label" className="grid grid-cols-2 gap-2">
                            {PROPERTY_TYPES.map(t => (
                              <button
                                key={t.v}
                                onClick={() => upd("propertyType", t.v)}
                                aria-pressed={form.propertyType === t.v}
                                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer font-[inherit] active:scale-[0.97]
                                  ${form.propertyType === t.v
                                    ? "border-[#0f2342] bg-[#0f2342]/5 shadow-[0_2px_12px_rgba(15,35,66,0.1)]"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"}`}
                                style={{ WebkitTapHighlightColor: "transparent" }}>
                                <span className="text-2xl leading-none flex-shrink-0">{t.icon}</span>
                                <div>
                                  <p className={`text-xs font-black leading-none ${form.propertyType === t.v ? "text-[#0f2342]" : "text-slate-700"}`}>{t.l}</p>
                                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">{t.desc}</p>
                                </div>
                                {form.propertyType === t.v && (
                                  <div className="ml-auto w-4 h-4 rounded-full bg-[#0f2342] flex items-center justify-center flex-shrink-0">
                                    <IC.Check s={8} c="white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* City */}
                        <div className="mb-3">
                          <label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-2">
                            City <span className="text-rose-400" aria-label="required">•</span>
                          </label>
                          <div className="relative">
                            <select
                              id="city"
                              value={form.city}
                              onChange={e => upd("city", e.target.value)}
                              aria-required="true"
                              aria-invalid={!!errors.city}
                              className={`${inpCls(errors.city)} appearance-none pr-10 cursor-pointer`}
                              style={{ fontSize: "16px" }}>
                              <option value="">Select your city</option>
                              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <span aria-hidden className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><IC.ChevD /></span>
                          </div>
                          {errors.city && <p role="alert" className="text-rose-500 text-[11px] font-semibold mt-1.5 flex items-center gap-1">⚠ {errors.city}</p>}
                        </div>

                        {/* Name */}
                        <div className="mb-3">
                          <label htmlFor="owner-name" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-2">
                            Your Name <span className="text-rose-400" aria-label="required">•</span>
                          </label>
                          <input
                            id="owner-name"
                            type="text"
                            autoComplete="name"
                            value={form.name}
                            onChange={e => upd("name", e.target.value)}
                            placeholder="e.g. Rajesh Kumar"
                            aria-required="true"
                            aria-invalid={!!errors.name}
                            className={inpCls(errors.name)}
                            style={{ fontSize: "16px" }}
                          />
                          {errors.name && <p role="alert" className="text-rose-500 text-[11px] font-semibold mt-1.5 flex items-center gap-1">⚠ {errors.name}</p>}
                        </div>

                        {/* Phone */}
                        <div className="mb-5">
                          <label htmlFor="owner-phone" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-2">
                            Mobile Number <span className="text-rose-400" aria-label="required">•</span>
                          </label>
                          <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 border-2 border-slate-200 bg-slate-50 rounded-2xl px-3 text-sm font-black text-[#0f2342] flex-shrink-0 select-none">
                              🇮🇳 <span>+91</span>
                            </div>
                            <input
                              id="owner-phone"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              value={form.phone}
                              onChange={e => upd("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                              placeholder="10-digit number"
                              aria-required="true"
                              aria-invalid={!!errors.phone}
                              className={`${inpCls(errors.phone)} flex-1`}
                              style={{ fontSize: "16px" }}
                            />
                          </div>
                          {errors.phone && <p role="alert" className="text-rose-500 text-[11px] font-semibold mt-1.5 flex items-center gap-1">⚠ {errors.phone}</p>}
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={sendOtp}
                          disabled={loading}
                          aria-label="Send OTP and get started"
                          className="shimmer-btn relative w-full overflow-hidden py-4 rounded-2xl text-[15px] font-black text-white border-none cursor-pointer disabled:opacity-60 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] font-[inherit]"
                          style={{
                            background: "linear-gradient(135deg,#0b1d3a 0%,#0f2342 40%,#1e40af 100%)",
                            boxShadow: "0 8px 32px rgba(15,35,66,0.45), 0 2px 0 rgba(255,255,255,0.05) inset",
                            WebkitTapHighlightColor: "transparent",
                          }}>
                          {loading
                            ? <span className="flex items-center justify-center gap-2"><IC.Spinner />Sending OTP…</span>
                            : <span className="flex items-center justify-center gap-2"><IC.Phone />Get OTP & Go Live FREE <IC.Arrow /></span>}
                        </button>

                        {/* Legal micro-copy */}
                        <p className="text-center text-[10px] text-slate-400 mt-3 leading-relaxed">
                          <IC.Shield /> By continuing you agree to our{" "}
                          <a href="/terms" className="text-[#0f2342] font-bold hover:underline">Terms</a> &amp;{" "}
                          <a href="/privacy" className="text-[#0f2342] font-bold hover:underline">Privacy Policy</a>
                        </p>
                      </div>
                    )}

                    {/* ── STEP 2: OTP ─────────────────────────────────────── */}
                    {step === "otp" && (
                      <div className="slide-in">
                        <button
                          onClick={() => setStep("form")}
                          className="text-xs text-slate-400 font-semibold hover:text-[#0f2342] border-none bg-transparent cursor-pointer font-[inherit] p-0 mb-4 flex items-center gap-1 transition-colors"
                          style={{ WebkitTapHighlightColor: "transparent" }}
                          aria-label="Go back to edit details">
                          ← Back
                        </button>

                        <h2 className="display text-[22px] font-bold text-[#0f2342] mb-1">Verify Your Number</h2>
                        <p className="text-slate-500 text-sm mb-1">
                          OTP sent to <strong className="text-[#0f2342] font-black">+91 {form.phone}</strong>
                        </p>
                        <button
                          onClick={() => setStep("form")}
                          className="text-[11px] text-amber-600 font-black hover:underline border-none bg-transparent cursor-pointer font-[inherit] p-0 mb-1"
                          style={{ WebkitTapHighlightColor: "transparent" }}>
                          Change number?
                        </button>

                        {/* OTP Boxes */}
                        <OtpInput value={form.otp} onChange={v => { upd("otp", v); }} />
                        {errors.otp && <p role="alert" className="text-rose-500 text-[11px] font-semibold text-center -mt-2 mb-3 flex items-center justify-center gap-1">⚠ {errors.otp}</p>}

                        {/* Resend row */}
                        <div className="flex items-center justify-between mb-5">
                          {timer > 0 ? (
                            <div className="flex items-center gap-2.5">
                              {/* SVG countdown ring */}
                              <div className="relative w-9 h-9">
                                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="3"
                                    strokeDasharray={`${2 * Math.PI * 14}`}
                                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - timer / 30)}`}
                                    className="transition-all duration-1000" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-600">{timer}s</span>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold">Resend OTP in {timer}s</p>
                            </div>
                          ) : (
                            <button
                              onClick={resend}
                              className="text-sm text-amber-600 font-black hover:underline border-none bg-transparent cursor-pointer font-[inherit]"
                              style={{ WebkitTapHighlightColor: "transparent" }}>
                              Resend OTP
                            </button>
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold">Valid for 10 min</span>
                        </div>

                        {/* Verify CTA */}
                        <button
                          onClick={verifyOtp}
                          disabled={loading || form.otp.length < 4}
                          aria-label="Verify OTP and post property"
                          className="w-full py-4 rounded-2xl text-[15px] font-black text-[#0f2342] border-none cursor-pointer disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] font-[inherit]"
                          style={{
                            background: "linear-gradient(135deg,#fcd34d,#f59e0b)",
                            boxShadow: "0 8px 28px rgba(245,158,11,0.35)",
                            WebkitTapHighlightColor: "transparent",
                          }}>
                          {loading
                            ? <span className="flex items-center justify-center gap-2"><IC.Spinner dark />Verifying…</span>
                            : <span className="flex items-center justify-center gap-2">✓ Verify &amp; Post Property <IC.Arrow /></span>}
                        </button>
                      </div>
                    )}

                    {/* ── STEP 3: SUCCESS ──────────────────────────────────── */}
                    {step === "success" && (
                      <div className="slide-in text-center py-3">
                        <div
                          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.45)]"
                          style={{ background: "linear-gradient(135deg,#34d399,#059669)", animation: "popBounce 0.7s cubic-bezier(0.34,1.56,0.64,1) both" }}
                          aria-hidden>
                          <svg width="38" height="38" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>

                        <h2 className="display text-2xl font-bold text-[#0f2342] mb-2">You're Verified! 🎉</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
                          Your enquiry details are saved. Complete your full listing to get{" "}
                          <strong className="text-[#0f2342]">5× more buyer enquiries.</strong>
                        </p>

                        {/* Mini feature tiles */}
                        <div className="grid grid-cols-2 gap-2 mb-5 text-left">
                          {[
                            { icon: "📋", l: "Add Full Details" },
                            { icon: "📸", l: "Upload Photos" },
                            { icon: "💰", l: "Set Your Price" },
                            { icon: "📊", l: "Track Enquiries" },
                          ].map(({ icon, l }) => (
                            <div key={l} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                              <span className="text-xl flex-shrink-0">{icon}</span>
                              <span className="text-[11px] font-bold text-slate-700 leading-tight">{l}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => router.push("/post-property")}
                          className="w-full py-4 rounded-2xl text-[15px] font-black text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] font-[inherit] mb-2.5"
                          style={{
                            background: "linear-gradient(135deg,#0b1d3a,#1e40af)",
                            boxShadow: "0 8px 28px rgba(15,35,66,0.4)",
                            WebkitTapHighlightColor: "transparent",
                          }}
                          aria-label="Continue to complete your property listing">
                          <span className="flex items-center justify-center gap-2">Complete Your Listing <IC.Arrow /></span>
                        </button>

                        <button
                          onClick={() => { setStep("form"); setForm(p => ({ ...p, otp: "" })); }}
                          className="w-full py-3 rounded-2xl text-xs font-bold text-slate-500 border-2 border-slate-200 hover:border-slate-300 bg-white active:scale-[0.98] transition-all cursor-pointer font-[inherit]"
                          style={{ WebkitTapHighlightColor: "transparent" }}>
                          Post Another Property
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Trust strip inside card */}
                  {step === "form" && (
                    <div className="px-6 pb-5 md:px-8">
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-around">
                        {[
                          { icon: <IC.Shield />, l: "100% Secure" },
                          { icon: "✅", l: "RERA Verified" },
                          { icon: "⚡", l: "Instant Live" },
                          { icon: "🆓", l: "Always Free" },
                        ].map(({ icon, l }) => (
                          <div key={l} className="text-center">
                            <div className="flex justify-center text-emerald-600 mb-0.5">{typeof icon === "string" ? <span className="text-sm">{icon}</span> : icon}</div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </div>

              {/* ── HERO CONTENT ─────────────────────────────────────────── */}
              <div className="order-2 lg:order-1 text-white hero-in">

                {/* Live badge */}
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/15 glass">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                  <span className="text-xs font-bold text-white/90">India's Fastest Growing Realty Platform</span>
                </div>

                {/* Headline — SEO H1 is inside the form card; this is the marketing headline */}
                <h2 className="display font-bold leading-[1.1] mb-5">
                  <span className="block text-[32px] md:text-[42px] lg:text-[50px] text-white">Sell or Rent</span>
                  <span className="block text-[32px] md:text-[42px] lg:text-[50px] text-white">Your Property</span>
                  <span
                    className="block text-[34px] md:text-[44px] lg:text-[54px] mt-1"
                    style={{ background: "linear-gradient(90deg,#fcd34d,#f59e0b,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Faster &amp; Smarter
                  </span>
                </h2>

                <p className="text-white/65 text-[15px] leading-relaxed mb-6 max-w-md">
                  Join <strong className="text-amber-400">1M+ property owners</strong> across India who trust Think4BuySale to connect them with verified, genuine buyers and tenants.
                </p>

                {/* Feature checks */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 list-none p-0 m-0" aria-label="Key features">
                  {[
                    "Advertise for FREE — no credit card",
                    "Unlimited verified enquiries",
                    "Hide your number until ready",
                    "Go live in under 2 minutes",
                    "RERA verified badge for trust",
                    "Real-time views & analytics",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                        <IC.Check s={9} c="#10b981" />
                      </div>
                      <span className="text-white/75 text-sm font-medium leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Animated stat row */}
                <div className="grid grid-cols-4 gap-3 mb-8 pb-8 border-b border-white/10">
                  {STATS.map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-xl font-black text-amber-400 display leading-none mb-1">
                        <AnimCounter target={s.value} suffix={s.suffix} />
                      </p>
                      <p className="text-white/45 text-[9px] font-bold uppercase tracking-wider leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Feature mini-cards */}
                <div className="grid grid-cols-2 gap-2.5 mb-8">
                  {FEATURES.map(f => (
                    <div key={f.heading} className="glass rounded-2xl p-3.5 hover:bg-white/8 transition-colors">
                      <p className="text-2xl mb-2 float" style={{ animationDelay: `${FEATURES.indexOf(f) * 0.4}s` }}>{f.icon}</p>
                      <p className="text-white text-xs font-bold mb-1 leading-snug">{f.heading}</p>
                      <p className="text-white/45 text-[10px] leading-relaxed hidden sm:block">{f.body}</p>
                    </div>
                  ))}
                </div>

                {/* Testimonials */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-3">Trusted by Property Owners</p>

                  {/* Active testimonial card */}
                  <div className="glass rounded-2xl p-4 mb-3 transition-all duration-500" key={testIdx}>
                    <div className="flex gap-0.5 mb-2.5">
                      {Array(TESTIMONIALS[testIdx].stars).fill(0).map((_, i) => <IC.Star key={i} />)}
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed font-medium mb-3">
                      "{TESTIMONIALS[testIdx].quote}"
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm text-[#0f2342]"
                        style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)" }}>
                        {TESTIMONIALS[testIdx].avatar}
                      </div>
                      <div>
                        <p className="text-white text-xs font-black">{TESTIMONIALS[testIdx].name}</p>
                        <p className="text-white/40 text-[10px]">{TESTIMONIALS[testIdx].role} · {TESTIMONIALS[testIdx].city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dot indicators */}
                  <div className="flex gap-2 items-center" role="tablist" aria-label="Testimonials">
                    {TESTIMONIALS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTestIdx(i)}
                        role="tab"
                        aria-selected={i === testIdx}
                        aria-label={`Testimonial from ${TESTIMONIALS[i].name}`}
                        className={`rounded-full transition-all duration-300 border-none cursor-pointer ${i === testIdx ? "w-7 h-2.5 bg-amber-400" : "w-2.5 h-2.5 bg-white/20 hover:bg-white/35"}`}
                        style={{ WebkitTapHighlightColor: "transparent" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── MARQUEE TRUST BAR ─────────────────────────────────────────── */}
          <div className="relative z-10 border-t border-white/8 bg-white/3 overflow-hidden py-4" aria-label="Trust indicators" role="complementary">
            <div className="flex marquee-track gap-12 whitespace-nowrap">
              {[...Array(2)].flatMap(() =>
                ["RERA Compliant", "ISO 27001 Certified", "256-bit SSL Secure", "Google Trusted Partner",
                  "500+ Cities", "OTP Verified Buyers", "24/7 Customer Support", "No Hidden Charges"].map(b => (
                  <span key={new Date().getTime() + Math.random()} className="inline-flex items-center gap-2.5 text-white/40 text-[11px] font-bold">
                    <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                    {b}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
          <section
            aria-labelledby="how-heading"
            className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-14">
            <div className="text-center mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-2">Simple Process</p>
              <h2 id="how-heading" className="display text-3xl font-bold text-white mb-3">How it Works</h2>
              <p className="text-white/50 text-sm max-w-sm mx-auto">Post your property in 3 easy steps and start receiving genuine enquiries today</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "01", icon: "📝", title: "Fill Quick Details",  body: "Select property type, enter your city and contact number. Takes under 60 seconds." },
                { step: "02", icon: "🔐", title: "Verify via OTP",      body: "Enter the 4-digit OTP sent to your mobile. Your number is instantly verified." },
                { step: "03", icon: "🚀", title: "Go Live & Get Leads", body: "Complete your full listing with photos and price to start receiving genuine buyer enquiries." },
              ].map(s => (
                <div key={s.step} className="glass rounded-3xl p-6 text-center hover:bg-white/6 transition-all group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 block">{s.icon}</div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-[#0f2342] mx-auto mb-3"
                    style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)" }}>
                    {s.step}
                  </div>
                  <h3 className="display text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer role="contentinfo" className="relative z-10 border-t border-white/8 max-w-[1280px] mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
              </div>
              <span className="display text-sm font-bold text-white/70">Think4BuySale<span className="text-amber-400">.in</span></span>
            </div>
            <p className="text-white/30 text-[11px] text-center">
              © {new Date().getFullYear()} Think4BuySale. All rights reserved. |{" "}
              <a href="/privacy" className="hover:text-white/60 no-underline transition-colors">Privacy</a> ·{" "}
              <a href="/terms" className="hover:text-white/60 no-underline transition-colors">Terms</a> ·{" "}
              <a href="/sitemap.xml" className="hover:text-white/60 no-underline transition-colors">Sitemap</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}