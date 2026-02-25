"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  imgUrl,
  allPhotoUrls,
  propertyTitle,
  categoryLabel,
  subcategoryLabel,
  configTypeLabel,
  amenityLabels,
  fmtPrice,
  fmtDate,
} from "@/utils/propertyDisplay";
import {
  sendEnquiryApi,
  toggleSavePropertyApi,
  checkSavedPropertyApi,
  getSimilarPropertiesApi,
  EnquiryPayload,
} from "@/services/propertyApi";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Props {
  property: any;
  slug: string;
}

// ─── MOCK SIMILAR / AGENTS (replace with real API) ────────────────────────────
const MOCK_SIMILAR = [
  { id: 1, title: "2 BHK Flat – Sector 21", price: "₹55 L", area: "950 sq.ft", locality: "Sector 21, Noida", type: "Sell", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=70", slug: "#" },
  { id: 2, title: "3 BHK Villa – DLF Phase 3", price: "₹2.1 Cr", area: "2,100 sq.ft", locality: "DLF Phase 3, Gurgaon", type: "Sell", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70", slug: "#" },
  { id: 3, title: "1 BHK Studio – Connaught Place", price: "₹18,000/mo", area: "480 sq.ft", locality: "Connaught Place, Delhi", type: "Rent", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=70", slug: "#" },
  { id: 4, title: "Office Space – Cyber City", price: "₹45,000/mo", area: "1,200 sq.ft", locality: "Cyber City, Gurgaon", type: "Rent", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70", slug: "#" },
  { id: 5, title: "2 BHK Builder Floor – Pitampura", price: "₹38 L", area: "850 sq.ft", locality: "Pitampura, Delhi", type: "Sell", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=70", slug: "#" },
];

const MOCK_AGENTS = [
  { id: 1, name: "Rajesh Properties", deals: 142, rating: 4.8, area: "Noida, Sector 18–62", avatar: "R", color: "from-blue-500 to-blue-700" },
  { id: 2, name: "Priya Realtors",     deals: 98,  rating: 4.9, area: "DLF, Gurgaon",       avatar: "P", color: "from-emerald-500 to-emerald-700" },
  { id: 3, name: "Delhi Homes Co.",    deals: 203, rating: 4.7, area: "South Delhi",         avatar: "D", color: "from-amber-500 to-amber-600" },
];

const AMENITY_ICON: Record<string, string> = {
  "Lift": "🛗", "Parking": "🅿️", "Power Backup": "🔋", "Security": "🔒",
  "Gymnasium": "🏋️", "Swimming Pool": "🏊", "Club House": "🏛️",
  "Garden / Park": "🌿", "Gated Society": "🚪", "CCTV": "📷",
  "Intercom": "☎️", "Visitor Parking": "🚗", "Children's Play Area": "🛝",
  "Jogging Track": "🏃",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export function PropertyViewClient({ property: p, slug }: Props) {
  const [activePhoto,   setActivePhoto]   = useState(0);
  const [lightbox,      setLightbox]      = useState(false);
  const [lightboxIdx,   setLightboxIdx]   = useState(0);
  const [saved,         setSaved]         = useState(false);
  const [enquirySent,   setEnquirySent]   = useState(false);
  const [enquiryOpen,   setEnquiryOpen]   = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [showPhone,     setShowPhone]     = useState(false);
  const [similar,       setSimilar]       = useState(MOCK_SIMILAR);
  const [enquiryForm,   setEnquiryForm]   = useState({ name: "", phone: "", message: "" });
  const touchX = useRef(0);

  const photos    = allPhotoUrls(p?.photos);
  const title     = propertyTitle(p);
  const price     = fmtPrice(p?.price);
  const area      = p?.area ? `${Number(p.area).toLocaleString("en-IN")} sq.ft` : null;
  const amenities = amenityLabels(p?.amenities);
  const isRent    = p?.listingType === "rent";
  const locality  = p?.locality ?? p?.society ?? "";
  const city      = p?.city ?? "";
  const fullAddr  = [locality, p?.address, city, p?.pincode].filter(Boolean).join(", ");
  const phone     = p?.hideNumber ? null : p?.ownerPhone;
  const ownerName = p?.ownerName ?? "Owner";
  const pricePerSqft = p?.price && p?.area
    ? fmtPrice(Math.round(Number(p.price) / Number(p.area)))
    : null;

  // Fetch saved state
  useEffect(() => {
    if (!p?.id) return;
    checkSavedPropertyApi(p.id)
      .then((r) => setSaved(r?.data?.saved ?? r?.data?.data?.saved ?? false))
      .catch(() => {});
  }, [p?.id]);

  // Scroll detection for sticky bar
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Swipe gallery
  const onTS = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTE = (e: React.TouchEvent) => {
    const d = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) {
      if (d > 0) setActivePhoto((n) => Math.min(n + 1, photos.length - 1));
      else       setActivePhoto((n) => Math.max(n - 1, 0));
    }
  };

  const handleSave = async () => {
    if (!p?.id) return;
    const next = !saved;
    setSaved(next);
    try { await toggleSavePropertyApi(p.id); } catch { setSaved(!next); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/property/${slug}`;
    if (navigator.share) { try { await navigator.share({ title, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p?.id || !enquiryForm.name || !enquiryForm.phone) return;
    try {
      await sendEnquiryApi(p.id, {
        buyer_name:  enquiryForm.name,
        buyer_phone: enquiryForm.phone,
        message:     enquiryForm.message || undefined,
      } as EnquiryPayload);
      setEnquirySent(true);
      setEnquiryOpen(false);
    } catch { setEnquirySent(true); setEnquiryOpen(false); }
  };

  if (!p) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] p-6">
      <div className="text-center max-w-sm">
        <div className="text-7xl mb-4">🏚️</div>
        <h1 className="pf text-2xl font-bold text-[#0B3C8C] mb-2">Listing Not Found</h1>
        <p className="text-slate-500 text-sm mb-6">This property may have been removed or the link is incorrect.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#0B3C8C] text-white text-sm font-bold px-6 py-3 rounded-2xl no-underline hover:bg-[#1D4ED8] transition-colors">← Browse Properties</Link>
      </div>
    </div>
  );

  const badges = [
    p.featured     && { label: "⭐ Featured",     bg: "#fbbf24", fg: "#78350f" },
    p.urgent       && { label: "🔥 Urgent",        bg: "#ef4444", fg: "#fff"    },
    p.negotiable   && { label: "Price Negotiable", bg: "#d1fae5", fg: "#065f46" },
    p.loanAvailable && { label: "Loan Available",  bg: "#dbeafe", fg: "#1e40af" },
    p.virtualTour  && { label: "🎥 Virtual Tour",  bg: "#ede9fe", fg: "#5b21b6" },
  ].filter(Boolean) as { label: string; bg: string; fg: string }[];

  const keyDetails = [
    p.config_type_id && { icon: "🏠", label: "Config",     val: configTypeLabel(p.config_type_id)   },
    p.subcategory_id && { icon: "🏢", label: "Type",       val: subcategoryLabel(p.subcategory_id)   },
    area             && { icon: "📐", label: "Area",        val: area                                },
    p.bathrooms      && { icon: "🚿", label: "Bathrooms",   val: `${p.bathrooms}`                    },
    p.balconies      && { icon: "🌅", label: "Balconies",   val: `${p.balconies}`                    },
    p.furnishing     && { icon: "🪑", label: "Furnishing",  val: p.furnishing                        },
    p.facing         && { icon: "🧭", label: "Facing",      val: `${p.facing} Facing`                },
    p.age            && { icon: "📅", label: "Age",         val: p.age                               },
    p.society        && { icon: "🏘️", label: "Society",     val: p.society                           },
    p.pincode        && { icon: "📮", label: "Pincode",     val: p.pincode                           },
    isRent && p.deposit     && { icon: "💰", label: "Deposit",     val: fmtPrice(p.deposit)              },
    isRent && p.maintenance && { icon: "🔧", label: "Maintenance", val: `${fmtPrice(p.maintenance)}/mo` },
    p.rera           && { icon: "📋", label: "RERA No.",    val: p.rera                              },
    p.plan           && { icon: "💎", label: "Plan",        val: p.plan                              },
    p.created_at     && { icon: "🗓️", label: "Posted",      val: fmtDate(p.created_at)               },
  ].filter(Boolean) as { icon: string; label: string; val: string }[];

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        html,body { font-family:'Plus Jakarta Sans',sans-serif; background:#f1f4f9; }
        .pf  { font-family:'Playfair Display',serif!important; }
        ::-webkit-scrollbar { display:none; }
        * { -ms-overflow-style:none; scrollbar-width:none; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 30%{transform:scale(1.35)} 60%{transform:scale(.9)} }
        .fu   { animation:fadeUp  .4s ease both; }
        .fi   { animation:fadeIn  .25s ease both; }
        .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
        .d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
        .heart-beat { animation:heartbeat .4s ease; }
        .tag-row { display:flex;gap:8px;overflow-x:auto;padding-bottom:2px; }
        .glass { background:rgba(255,255,255,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px); }
      `}</style>

      {/* ── STICKY TOPBAR ───────────────────────────────────────────────────── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-white/96 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,.08)]">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href="/" className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center no-underline text-slate-600 hover:bg-slate-200 transition-colors">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </Link>
              <div className="min-w-0">
                <p className="text-[13px] font-700 text-[#0B3C8C] truncate leading-tight font-bold">{title}</p>
                <p className="text-[12px] font-black text-[#1D4ED8] leading-none mt-0.5">{price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleSave} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 flex items-center justify-center border-none cursor-pointer transition-colors">
                <svg width="15" height="15" fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "#94a3b8"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </button>
              <button onClick={handleShare} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 flex items-center justify-center border-none cursor-pointer transition-colors">
                <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              </button>
              <button onClick={() => setEnquiryOpen(true)} className="hidden sm:flex items-center gap-2 bg-[#0B3C8C] hover:bg-[#1D4ED8] text-white text-[12px] font-black px-4 py-2 rounded-xl border-none cursor-pointer transition-colors">
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen">

        {/* ══ HERO GALLERY ════════════════════════════════════════════════════ */}
        <div className="relative bg-[#050f1f]" style={{ height: "clamp(260px, 52vw, 580px)" }}>
          {/* Photos */}
          {photos.length > 0 ? (
            <>
              {photos.map((url, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-500 ${i === activePhoto ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  onTouchStart={onTS} onTouchEnd={onTE}
                  onClick={() => { setLightboxIdx(i); setLightbox(true); }}
                  style={{ cursor: "zoom-in" }}
                >
                  <img src={url} alt={`${title} – photo ${i+1}`} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,15,31,.85) 0%, rgba(5,15,31,.1) 50%, rgba(5,15,31,.4) 100%)" }} />
                </div>
              ))}

              {/* Top bar: back + actions */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
                <Link href="/" className="glass w-10 h-10 rounded-2xl flex items-center justify-center text-white no-underline border border-white/15 hover:bg-white/20 transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="glass w-10 h-10 rounded-2xl flex items-center justify-center border border-white/15 border-none cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <svg width="17" height="17" fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "white"} strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  </button>
                  <button onClick={handleShare} className="glass w-10 h-10 rounded-2xl flex items-center justify-center border border-white/15 border-none cursor-pointer hover:bg-white/20 transition-colors text-white">
                    {copied
                      ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                      : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Bottom overlay: price hero + photo controls */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="max-w-screen-xl mx-auto">
                  {/* Badges */}
                  <div className="tag-row mb-3">
                    <span className="flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ background: isRent ? "#3b82f6" : "#10b981", color: "#fff" }}>
                      {isRent ? "For Rent" : "For Sale"}
                    </span>
                    {p.status === "published" && <span className="flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full bg-white/20 text-white uppercase tracking-wide">✓ Available</span>}
                    {badges.map((b, i) => (
                      <span key={i} className="flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.fg }}>{b.label}</span>
                    ))}
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="pf text-white font-bold leading-tight mb-1" style={{ fontSize: "clamp(18px,3.5vw,32px)" }}>{title}</h1>
                      <div className="flex items-center gap-2 text-white/70 text-[13px]">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>{fullAddr || "Location not specified"}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="pf text-white font-bold leading-none" style={{ fontSize: "clamp(22px,4vw,38px)" }}>{price}</p>
                      {pricePerSqft && <p className="text-white/60 text-[11px] mt-1">{pricePerSqft}/sq.ft</p>}
                    </div>
                  </div>

                  {/* Photo nav row */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      {photos.slice(0, 9).map((_, i) => (
                        <button key={i} onClick={() => setActivePhoto(i)}
                          className="border-none cursor-pointer rounded-full transition-all"
                          style={{ width: i === activePhoto ? 20 : 7, height: 7, background: i === activePhoto ? "#fff" : "rgba(255,255,255,.35)" }}
                        />
                      ))}
                      {photos.length > 9 && <span className="text-[10px] text-white/50 ml-1">+{photos.length-9}</span>}
                    </div>
                    <button
                      onClick={() => { setLightboxIdx(0); setLightbox(true); }}
                      className="glass text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 border-none cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1.5"
                    >
                      <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4" fill="none" stroke="white" strokeWidth="2"/></svg>
                      {photos.length} photos
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center text-5xl">🏠</div>
              <p className="text-white/50 text-sm font-medium">No photos uploaded</p>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="bg-[#050f1f] flex gap-2 px-4 pb-3 overflow-x-auto">
            {photos.map((url, i) => (
              <button key={i} onClick={() => setActivePhoto(i)}
                className="flex-shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer bg-transparent p-0 transition-all"
                style={{ width: 64, height: 46, borderColor: i === activePhoto ? "#3b82f6" : "transparent", opacity: i === activePhoto ? 1 : 0.55 }}
              >
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {/* ══ TWO-COLUMN LAYOUT ════════════════════════════════════════════════ */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            {/* ── LEFT / MAIN COLUMN ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* QUICK STATS BAR */}
              <div className="fu bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {[
                    { icon: "👁",  val: (p.views_count ?? 0).toLocaleString(), label: "Views"     },
                    { icon: "📞", val: (p.leads_count ?? 0).toLocaleString(), label: "Enquiries" },
                    { icon: "❤️", val: (p.saves_count ?? 0).toLocaleString(), label: "Saves"     },
                    area ? { icon: "📐", val: area,   label: "Area"  } : null,
                    pricePerSqft ? { icon: "💰", val: `${pricePerSqft}/sqft`, label: "Rate" } : null,
                  ].filter(Boolean).map((s: any, i) => (
                    <div key={i} className="text-center">
                      <p className="text-lg leading-none mb-1">{s.icon}</p>
                      <p className="text-[13px] font-black text-[#0B3C8C] leading-none">{s.val}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION */}
              {p.description && (
                <div className="fu d1 bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                  <h2 className="pf text-[18px] font-bold text-[#0B3C8C] mb-3">About This Property</h2>
                  <ExpandableText text={p.description} limit={300} />
                </div>
              )}

              {/* PROPERTY DETAILS */}
              <div className="fu d2 bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                <h2 className="pf text-[18px] font-bold text-[#0B3C8C] mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {keyDetails.map(({ icon, label, val }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#f0f4ff] flex items-center justify-center text-base flex-shrink-0">{icon}</div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                        <p className="text-[13px] font-bold text-[#0B3C8C] capitalize leading-snug">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AMENITIES */}
              {amenities.length > 0 && (
                <div className="fu d3 bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                  <h2 className="pf text-[18px] font-bold text-[#0B3C8C] mb-4">
                    Amenities
                    <span className="text-[14px] text-slate-400 font-normal ml-2">({amenities.length})</span>
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {amenities.map((a) => (
                      <div key={a} className="flex flex-col items-center gap-1.5 bg-gradient-to-b from-[#f0f4ff] to-[#f8faff] rounded-2xl p-3 border border-blue-50 hover:border-blue-200 hover:shadow-sm transition-all cursor-default">
                        <span className="text-2xl leading-none">{AMENITY_ICON[a] ?? "✓"}</span>
                        <span className="text-[10px] font-bold text-[#0B3C8C] text-center leading-tight">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEATURES / FLAGS */}
              {(p.negotiable || p.urgent || p.loanAvailable || p.featured || p.virtualTour) && (
                <div className="fu d3 bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                  <h2 className="pf text-[18px] font-bold text-[#0B3C8C] mb-4">Highlights</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      p.negotiable   && { icon: "🤝", label: "Price Negotiable",  desc: "Seller open to negotiation" },
                      p.loanAvailable && { icon: "🏦", label: "Loan Available",   desc: "Bank loan can be arranged"  },
                      p.urgent       && { icon: "🔥", label: "Urgent Sale/Rent",  desc: "Owner wants quick deal"     },
                      p.featured     && { icon: "⭐", label: "Featured Listing",  desc: "Top-ranked visibility"      },
                      p.virtualTour  && { icon: "🎥", label: "Virtual Tour",      desc: "360° tour available"        },
                    ].filter(Boolean).map((f: any) => (
                      <div key={f.label} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <span className="text-xl leading-none flex-shrink-0">{f.icon}</span>
                        <div>
                          <p className="text-[12px] font-bold text-emerald-800">{f.label}</p>
                          <p className="text-[10px] text-emerald-600 mt-0.5">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LOCATION MAP */}
              {fullAddr && (
                <div className="fu d4 bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h2 className="pf text-[18px] font-bold text-[#0B3C8C]">Location</h2>
                    {p.pincode && (
                      <span className="text-[11px] font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-full">📍 {p.pincode}</span>
                    )}
                  </div>
                  <div className="mx-5 mb-5 rounded-2xl overflow-hidden border border-slate-100" style={{ height: 220 }}>
                    <iframe
                      title="Location"
                      loading="lazy"
                      className="w-full h-full border-0"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddr)}&z=14&output=embed`}
                    />
                  </div>
                  <div className="px-5 pb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" fill="none" stroke="#1D4ED8" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <p className="text-[12px] font-semibold text-slate-600">{fullAddr}</p>
                  </div>
                </div>
              )}

              {/* ── SIMILAR PROPERTIES ──────────────────────────────────────── */}
              <div className="fu d5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="pf text-[20px] font-bold text-[#0B3C8C]">Similar Properties</h2>
                  <Link href={`/?city=${encodeURIComponent(city)}`} className="text-[12px] font-black text-[#1D4ED8] no-underline hover:underline flex items-center gap-1">
                    View All <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {similar.slice(0, 6).map((s) => (
                    <Link key={s.id} href={`/property/${s.slug}`} className="no-underline group">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.06)] border border-slate-100 hover:shadow-[0_8px_32px_rgba(11,60,140,.15)] hover:border-blue-200 transition-all">
                        <div className="relative overflow-hidden" style={{ paddingBottom: "62%" }}>
                          <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: s.type === "Rent" ? "#3b82f6" : "#10b981", color: "#fff" }}>
                              {s.type}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-[12px] font-bold text-[#0B3C8C] leading-snug line-clamp-1">{s.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">📍 {s.locality}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[13px] font-black text-[#0B3C8C]">{s.price}</p>
                            <p className="text-[10px] text-slate-400">{s.area}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── POPULAR AGENTS IN AREA ──────────────────────────────────── */}
              <div className="fu d6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="pf text-[20px] font-bold text-[#0B3C8C]">Top Agents in {city || "Your Area"}</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Verified agents with proven track records</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {MOCK_AGENTS.map((agent) => (
                    <div key={agent.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,.05)] border border-slate-100 flex items-center gap-4 hover:shadow-[0_4px_24px_rgba(11,60,140,.10)] hover:border-blue-100 transition-all">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm`}>
                        {agent.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-black text-[#0B3C8C] truncate">{agent.name}</p>
                          <span className="flex-shrink-0 text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Verified ✓</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">📍 {agent.area}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-bold text-amber-500">★ {agent.rating}</span>
                          <span className="text-[10px] text-slate-400">{agent.deals} deals closed</span>
                        </div>
                      </div>
                      <button className="flex-shrink-0 text-[11px] font-black text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border-none cursor-pointer transition-colors whitespace-nowrap">
                        Contact
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── AREA INSIGHTS ────────────────────────────────────────────── */}
              <div className="fu bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                <h2 className="pf text-[18px] font-bold text-[#0B3C8C] mb-4">
                  Area Insights — {locality || city || "This Location"}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: "🏫", label: "Schools",    val: "4 nearby"     },
                    { icon: "🏥", label: "Hospitals",  val: "2 within 2km" },
                    { icon: "🚇", label: "Metro",      val: "500m walk"    },
                    { icon: "🛒", label: "Markets",    val: "3 within 1km" },
                    { icon: "🏦", label: "Banks / ATM", val: "5 nearby"   },
                    { icon: "🌳", label: "Parks",      val: "1 nearby"     },
                    { icon: "🚌", label: "Bus Stop",   val: "200m away"    },
                    { icon: "📶", label: "Connectivity", val: "Excellent"  },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#f8faff] rounded-xl p-3 border border-blue-50">
                      <p className="text-xl mb-1">{item.icon}</p>
                      <p className="text-[11px] font-black text-[#0B3C8C]">{item.val}</p>
                      <p className="text-[9px] text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-300 mt-3">* Approximate data. Verify independently.</p>
              </div>

              {/* ── PRICE TREND ──────────────────────────────────────────────── */}
              <div className="fu bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                <h2 className="pf text-[18px] font-bold text-[#0B3C8C] mb-1">Price Trend</h2>
                <p className="text-[11px] text-slate-400 mb-4">Average price per sq.ft in {locality || city || "this area"}</p>
                <div className="flex items-end gap-1.5 h-24">
                  {[42, 45, 43, 48, 51, 54, 58, 56, 62, 65, 69, 72].map((v, i) => {
                    const max = 72; const pct = (v/max)*100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                        <div className="w-full rounded-t-md transition-all group-hover:opacity-80 relative" style={{ height: `${pct}%`, background: i === 11 ? "linear-gradient(to top, #1D4ED8, #3b82f6)" : "#e8eeff" }}>
                          {i === 11 && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#1D4ED8] whitespace-nowrap">₹{v}k</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-slate-300 mt-1">
                  <span>Jan '24</span><span>Jun '24</span><span>Dec '24</span><span>Now</span>
                </div>
                <div className="flex items-center gap-2 mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                  <span className="text-base">📈</span>
                  <p className="text-[11px] font-bold text-emerald-700">
                    Prices up <span className="text-emerald-800">+14.3%</span> YoY in this area · Good time to invest
                  </p>
                </div>
              </div>

              {/* ── SAFETY & LEGAL ───────────────────────────────────────────── */}
              <div className="fu bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-slate-100">
                <h2 className="pf text-[18px] font-bold text-[#0B3C8C] mb-4">Buyer Safety Checklist</h2>
                <div className="space-y-2.5">
                  {[
                    { done: true,  text: "Listing verified by Think4BuySale team"           },
                    { done: true,  text: "Owner identity verified via OTP"                    },
                    { done: !!p.rera, text: p.rera ? `RERA registered: ${p.rera}` : "RERA number not provided" },
                    { done: false, text: "Request property documents before paying any token" },
                    { done: false, text: "Visit property in person before finalising deal"    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black ${item.done ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                        {item.done ? "✓" : "!"}
                      </div>
                      <p className={`text-[12px] leading-snug ${item.done ? "text-slate-600" : "text-amber-700 font-semibold"}`}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            {/* END LEFT COLUMN */}

            {/* ── RIGHT / STICKY SIDEBAR ─────────────────────────────────────── */}
            <div className="w-full lg:w-[360px] flex-shrink-0 space-y-4 lg:sticky lg:top-20">

              {/* CONTACT CARD */}
              <div className="fu bg-gradient-to-br from-[#0B3C8C] via-[#1344a0] to-[#1D4ED8] rounded-3xl p-6 shadow-[0_8px_40px_rgba(11,60,140,.30)] overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="relative">
                  {/* Poster */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-xl flex-shrink-0 border border-white/20">
                      {ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Direct from</p>
                      <p className="pf text-[17px] font-bold text-white leading-tight">{ownerName}</p>
                      <p className="text-[10px] text-blue-200/80 capitalize mt-0.5">{p.poster_type ?? "Owner"} · Posted {fmtDate(p.created_at)}</p>
                    </div>
                  </div>

                  {/* Price pill */}
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-3 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-300 font-semibold">{isRent ? "Monthly Rent" : "Sale Price"}</p>
                      <p className="pf text-[22px] font-bold text-white leading-none mt-0.5">{price}</p>
                    </div>
                    {area && (
                      <div className="text-right">
                        <p className="text-[10px] text-blue-300 font-semibold">Area</p>
                        <p className="text-[14px] font-black text-white">{area}</p>
                      </div>
                    )}
                  </div>

                  {/* CTA buttons */}
                  <div className="space-y-2.5">
                    {phone ? (
                      <>
                        {!showPhone ? (
                          <button
                            onClick={() => setShowPhone(true)}
                            className="w-full flex items-center justify-center gap-2.5 bg-white text-[#0B3C8C] font-black text-[14px] py-3.5 rounded-2xl border-none cursor-pointer hover:bg-blue-50 active:scale-[.98] transition-all shadow-[0_4px_20px_rgba(0,0,0,.12)]"
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.22 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                            Show Phone Number
                          </button>
                        ) : (
                          <a
                            href={`tel:${phone}`}
                            className="w-full flex items-center justify-center gap-2.5 bg-white text-[#0B3C8C] font-black text-[15px] py-3.5 rounded-2xl no-underline hover:bg-blue-50 active:scale-[.98] transition-all shadow-[0_4px_20px_rgba(0,0,0,.12)]"
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.22 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                            {phone}
                          </a>
                        )}
                        <a
                          href={`https://wa.me/91${phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Hi, I'm interested in: ${p.title ?? title}\nhttps://think4buysale.in/property/${slug}`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-black text-[14px] py-3.5 rounded-2xl no-underline hover:bg-[#1da851] active:scale-[.98] transition-all shadow-[0_4px_16px_rgba(37,211,102,.35)]"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Chat on WhatsApp
                        </a>
                      </>
                    ) : (
                      <button
                        onClick={() => setEnquiryOpen(true)}
                        disabled={enquirySent}
                        className={`w-full flex items-center justify-center gap-2.5 font-black text-[14px] py-3.5 rounded-2xl border-none cursor-pointer active:scale-[.98] transition-all shadow-[0_4px_20px_rgba(0,0,0,.12)] ${enquirySent ? "bg-emerald-400 text-white" : "bg-white text-[#0B3C8C] hover:bg-blue-50"}`}
                      >
                        {enquirySent ? "✓ Enquiry Sent!" : "Send Enquiry"}
                      </button>
                    )}
                  </div>

                  <p className="text-[9px] text-blue-300/50 text-center mt-3 leading-relaxed">
                    Think4BuySale connects buyers & owners. Verify all details in person before any transaction.
                  </p>
                </div>
              </div>

              {/* EMI CALCULATOR (teaser) */}
              {!isRent && p.price && (
                <div className="fu bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,.05)] border border-slate-100">
                  <h3 className="pf text-[16px] font-bold text-[#0B3C8C] mb-3">EMI Calculator</h3>
                  <EmiCalculator price={Number(p.price)} />
                </div>
              )}

              {/* REPORT LISTING */}
              <div className="fu bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,.05)] border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-slate-600">Something wrong?</p>
                    <p className="text-[11px] text-slate-400">Report this listing</p>
                  </div>
                  <button className="text-[11px] font-bold text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-100 px-3 py-1.5 rounded-xl border-none cursor-pointer transition-all">
                    🚩 Report
                  </button>
                </div>
              </div>

            </div>
            {/* END RIGHT SIDEBAR */}

          </div>
        </div>
      </div>

      {/* ══ MOBILE STICKY BOTTOM BAR ════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/97 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,.10)]">
        <div className="px-4 py-2.5 flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <p className="pf text-[17px] font-bold text-[#0B3C8C] leading-none">{price}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{isRent ? "/ month" : "Sale price"}{area ? ` · ${area}` : ""}</p>
          </div>

          {/* Save */}
          <button onClick={handleSave} className="w-10 h-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 border-none cursor-pointer active:scale-95 transition-transform">
            <svg width="17" height="17" fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "#94a3b8"} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>

          {/* Primary CTA */}
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0B3C8C] to-[#1D4ED8] text-white text-[13px] font-black px-5 py-2.5 rounded-2xl no-underline flex-shrink-0 shadow-[0_4px_16px_rgba(11,60,140,.28)] active:scale-[.97] transition-transform"
            >
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.22 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Call Owner
            </a>
          ) : (
            <button
              onClick={() => setEnquiryOpen(true)}
              disabled={enquirySent}
              className={`flex items-center gap-2 text-[13px] font-black px-5 py-2.5 rounded-2xl border-none cursor-pointer flex-shrink-0 shadow-[0_4px_16px_rgba(11,60,140,.28)] active:scale-[.97] transition-all ${enquirySent ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-[#0B3C8C] to-[#1D4ED8] text-white"}`}
            >
              {enquirySent ? "✓ Sent!" : "Enquire"}
            </button>
          )}

          {/* WhatsApp */}
          {phone && (
            <a
              href={`https://wa.me/91${phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Hi, interested in: ${title}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-2xl bg-[#25D366] flex items-center justify-center flex-shrink-0 no-underline shadow-[0_4px_12px_rgba(37,211,102,.3)] active:scale-95 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          )}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>

      {/* ══ ENQUIRY MODAL ═══════════════════════════════════════════════════ */}
      {enquiryOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setEnquiryOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm fi" />
          <div
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 z-10 shadow-2xl"
            style={{ animation: "scaleIn .25s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="pf text-[20px] font-bold text-[#0B3C8C]">Send Enquiry</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Owner will contact you directly</p>
              </div>
              <button onClick={() => setEnquiryOpen(false)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer transition-colors text-slate-500 font-black">✕</button>
            </div>
            <form onSubmit={handleEnquirySubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Your Name *</label>
                <input
                  required
                  type="text"
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-50 rounded-2xl px-4 py-3 text-[14px] text-slate-700 font-medium outline-none transition-all"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Phone Number *</label>
                <input
                  required
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-50 rounded-2xl px-4 py-3 text-[14px] text-slate-700 font-medium outline-none transition-all"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Message (optional)</label>
                <textarea
                  rows={3}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder={`Hi, I'm interested in ${title}. Please contact me.`}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-50 rounded-2xl px-4 py-3 text-[14px] text-slate-700 font-medium outline-none transition-all resize-none"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0B3C8C] to-[#1D4ED8] text-white font-black text-[15px] py-4 rounded-2xl border-none cursor-pointer hover:shadow-[0_8px_24px_rgba(11,60,140,.30)] active:scale-[.98] transition-all"
              >
                Send Enquiry →
              </button>
            </form>
            <p className="text-[10px] text-slate-300 text-center mt-3">Your details are shared only with the property owner.</p>
          </div>
        </div>
      )}

      {/* ══ LIGHTBOX ════════════════════════════════════════════════════════ */}
      {lightbox && photos.length > 0 && (
        <div className="fixed inset-0 z-[300] bg-black/97 flex flex-col fi" onClick={() => setLightbox(false)}>
          <div className="flex items-center justify-between p-4 flex-shrink-0">
            <span className="text-white/60 text-sm font-bold">{lightboxIdx+1} / {photos.length}</span>
            <button className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black border-none cursor-pointer flex items-center justify-center text-lg transition-colors">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={photos[lightboxIdx]} alt="" className="max-w-full max-h-full object-contain rounded-2xl" style={{ maxHeight: "calc(100vh-180px)" }} />
          </div>
          <div className="flex items-center justify-between px-4 pb-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxIdx((i) => Math.max(i-1, 0))} disabled={lightboxIdx===0} className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer disabled:opacity-30 transition-all">←</button>
            <div className="flex gap-1.5 overflow-x-auto px-2">
              {photos.map((_,i) => (
                <button key={i} onClick={() => setLightboxIdx(i)} className="rounded-full flex-shrink-0 border-none cursor-pointer transition-all"
                  style={{ width: i===lightboxIdx?20:7, height:7, background: i===lightboxIdx?"#fff":"rgba(255,255,255,.3)" }} />
              ))}
            </div>
            <button onClick={() => setLightboxIdx((i) => Math.min(i+1, photos.length-1))} disabled={lightboxIdx===photos.length-1} className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer disabled:opacity-30 transition-all">→</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── EXPANDABLE TEXT ──────────────────────────────────────────────────────────
function ExpandableText({ text, limit = 280 }: { text: string; limit?: number }) {
  const [exp, setExp] = useState(false);
  const long = text.length > limit;
  return (
    <div>
      <p className="text-[14px] text-slate-600 leading-relaxed">
        {long && !exp ? text.slice(0, limit) + "…" : text}
      </p>
      {long && (
        <button onClick={() => setExp((v) => !v)} className="text-[12px] font-black text-[#1D4ED8] mt-2 border-none bg-transparent cursor-pointer p-0 hover:underline">
          {exp ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
}

// ─── EMI CALCULATOR ──────────────────────────────────────────────────────────
function EmiCalculator({ price }: { price: number }) {
  const [rate,   setRate]   = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const loan = price * 0.8;
  const r    = rate / 100 / 12;
  const n    = tenure * 12;
  const emi  = loan * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);

  return (
    <div className="space-y-3">
      <div className="bg-[#f0f4ff] rounded-2xl p-3 text-center">
        <p className="text-[11px] text-slate-400 font-semibold">Est. Monthly EMI (80% loan)</p>
        <p className="pf text-[24px] font-bold text-[#0B3C8C] mt-0.5">
          {isNaN(emi) ? "—" : `₹${Math.round(emi).toLocaleString("en-IN")}`}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-semibold">Interest Rate</span>
          <span className="font-black text-[#0B3C8C]">{rate}% p.a.</span>
        </div>
        <input type="range" min={6} max={15} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))}
          className="w-full h-1.5 rounded-full cursor-pointer accent-[#1D4ED8]" />
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-semibold">Loan Tenure</span>
          <span className="font-black text-[#0B3C8C]">{tenure} years</span>
        </div>
        <input type="range" min={5} max={30} step={1} value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
          className="w-full h-1.5 rounded-full cursor-pointer accent-[#1D4ED8]" />
      </div>
      <p className="text-[9px] text-slate-300 text-center">Indicative only. Actual EMI may vary by lender.</p>
    </div>
  );
}