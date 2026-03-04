"use client";

import React, { useRef, useState } from "react";
import s from "../css_module/TopAgencies.module.css";

/* ── Data ─────────────────────────────────────────────────── */

const agencies = [
  { name: "Kanhaiya Residency (P) Ltd.", location: "Karkardooma, Delhi", sale: 3, rent: 1, areas: ["Indirapuram", "Sector 28"], rating: 4.2, reviews: 18, initials: "KR" },
  { name: "Qube Real Estate Advisory LLP", location: "Barakhamba, Delhi", sale: 294, rent: 206, areas: ["Ambala", "Bathinda", "Bhiwadi"], rating: 4.8, reviews: 312, initials: "QR" },
  { name: "Sampatti Realty", location: "Dwarka, Delhi", sale: 87, rent: 12, areas: ["Dwarka", "Rohini", "Janakpuri"], rating: 4.5, reviews: 74, initials: "SR" },
  { name: "Shubham Properties", location: "Rohini, Delhi", sale: 124, rent: 98, areas: ["Rohini", "Pitampura"], rating: 4.6, reviews: 143, initials: "SP" },
  { name: "Perfect Property", location: "Laxmi Nagar, Delhi", sale: 32, rent: 11, areas: ["Laxmi Nagar", "Preet Vihar"], rating: 4.3, reviews: 52, initials: "PP" },
];

/* ── Icons ────────────────────────────────────────────────── */

const Ico = {
  Loc: () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Star: ({ on }: { on: boolean }) => <svg width="11" height="11" viewBox="0 0 24 24" fill={on ? "#f59e0b" : "none"} stroke={on ? "#f59e0b" : "#d1d5db"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  ChevL: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>,
  ChevR: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>,
  ArrR: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  Phone: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  ArrRBig: () => <svg width="20" height="20" fill="none" stroke="#0B3C8C" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
};

const Stars = ({ r }: { r: number }) => (
  <div className={s.stars}>
    {[1,2,3,4,5].map(i => <Ico.Star key={i} on={i <= Math.round(r)} />)}
  </div>
);

/* ── Card ─────────────────────────────────────────────────── */

const AgencyCard = ({ a }: { a: typeof agencies[0] }) => (
  <div className={s.card}>
    <div className={s.cardStrip} />
    <div className={s.cardBody}>
      <div className={s.avatarRow}>
        <div className={s.avatar}>{a.initials}</div>
        <div className={s.avatarInfo}>
          <h3 className={s.agencyName}>{a.name}</h3>
          <p className={s.agencyLoc}><span className={s.locIcon}><Ico.Loc /></span>{a.location}</p>
        </div>
      </div>
      <div className={s.ratingRow}>
        <Stars r={a.rating} />
        <span className={s.ratingNum}>{a.rating}</span>
        <span className={s.ratingCount}>({a.reviews} reviews)</span>
      </div>
      <div className={s.statsGrid}>
        {[{ v: a.sale, l: "For Sale" }, { v: a.rent, l: "For Rent" }, { v: a.sale + a.rent, l: "Total" }].map(x => (
          <div key={x.l} className={s.statBox}>
            <p className={s.statVal}>{x.v}</p>
            <p className={s.statLabel}>{x.l}</p>
          </div>
        ))}
      </div>
      <div className={s.areaTags}>
        {a.areas.map(ar => <span key={ar} className={s.areaTag}>{ar}</span>)}
      </div>
      <div className={s.ctaRow}>
        <button className={s.ctaView}>View Agency <Ico.ArrR /></button>
        <button className={s.ctaCall}><Ico.Phone /></button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */

export default function TopAgencies() {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };
  const onScroll = () => {
    if (!ref.current) return;
    const w = ref.current.scrollWidth / agencies.length;
    setIdx(Math.round(ref.current.scrollLeft / w));
  };

  return (
    <section className={s.section} style={{ fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)" }}>
      <div className={s.container}>

        {/* Header */}
        <div className={`${s.header} ${s.fadeUp}`}>
          <div>
            <p className={s.eyebrow}>✦ Trusted Partners</p>
            <h2 className={s.title} style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              Top <span className={s.titleGold}>Real Estate Agencies</span> in Delhi
            </h2>
            <p className={s.subtitle}>Connect with verified, top-rated agencies with proven track records.</p>
            <div className={s.underline}><div className={s.uDot1}/><div className={s.uDot2}/><div className={s.uDot3}/></div>
          </div>
          <div className={s.headerActions}>
            <a href="/agencies" className={`${s.viewAllLink} ${s.showSm}`} style={{ display: "none" }}>
              View All <Ico.ArrR />
            </a>
            <div className={`${s.arrowBtns} ${s.showMd}`} style={{ display: "none" }}>
              <button className={s.arrowBtn} onClick={() => scroll("left")}><Ico.ChevL /></button>
              <button className={s.arrowBtn} onClick={() => scroll("right")}><Ico.ChevR /></button>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div ref={ref} onScroll={onScroll} className={`${s.slider} ${s.fadeUp} ${s.d1}`}>
          {agencies.map(a => <AgencyCard key={a.name} a={a} />)}
          {/* View all card */}
          <div className={s.viewAllCard}>
            <div className={s.viewAllCircle}><Ico.ArrRBig /></div>
            <p className={s.viewAllText}>View All<br/>Agencies</p>
            <p className={s.viewAllMeta}>500+ listed</p>
          </div>
        </div>

        {/* Dots — mobile */}
        <div className={`${s.dots} ${s.hideMd}`}>
          {agencies.map((_, i) => (
            <button key={i} className={`${s.dot} ${i === idx ? s.dotActive : s.dotInactive}`}
              onClick={() => {
                if (!ref.current) return;
                const w = ref.current.scrollWidth / (agencies.length + 1);
                ref.current.scrollTo({ left: i * w, behavior: "smooth" }); setIdx(i);
              }} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className={`${s.mobileViewAll} ${s.hideSm}`}>
          <a href="/agencies" className={s.mobileViewAllBtn}>View All Agencies <Ico.ArrR /></a>
        </div>

        {/* Trust strip */}
        <div className={`${s.trustStrip} ${s.fadeUp} ${s.d2}`}>
          {[
            { v: "500+", l: "Verified Agencies" }, { v: "4.6★", l: "Avg. Rating" },
            { v: "10yr+", l: "Avg. Experience" }, { v: "RERA", l: "Certified Only" },
          ].map((x, i) => (
            <div key={x.l} className={`${s.trustItem} ${i < 3 ? s.trustItemBorder : ""}`}>
              <p className={s.trustVal} style={{ fontFamily: "var(--font-display)" }}>{x.v}</p>
              <p className={s.trustLabel}>{x.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}