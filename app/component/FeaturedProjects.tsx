"use client";

import s from "../css_module/FeaturedProjects.module.css";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { browsePropertiesApi, toggleSavePropertyApi, generateSlug, propertyUrl } from "@/services/propertyApi";
import type { ApiPropertyRaw, BrowseFilters } from "@/services/propertyApi";
import {
  coverUrl,
} from "@/utils/propertyDisplay";

/* ── Helpers ──────────────────────────────────────────────── */

interface MCat {
  id: number; name: string; slug: string;
  subcategories: { id: number; name: string; slug: string; config_types: { id: number; name: string }[] }[];
}

const resolve = (p: ApiPropertyRaw, cats: MCat[]) => {
  let sub = "", cfg = "";
  const c = cats.find(x => x.id === p.category_id);
  if (c) { const sc = c.subcategories.find(x => x.id === p.subcategory_id); if (sc) { sub = sc.name; const cf = sc.config_types?.find(x => x.id === p.config_type_id); if (cf) cfg = cf.name; } }
  return { sub, cfg };
};

const fmtP = (v: string | number | null | undefined, lt?: string): string => {
  if (!v) return "Price on Request";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n) || n <= 0) return "Price on Request";
  const sf = lt === "rent" || lt === "pg" ? "/mo" : "";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr${sf}`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L${sf}`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K${sf}`;
  return `₹${n.toLocaleString("en-IN")}${sf}`;
};

const fmtA = (v: string | number | null | undefined): string => {
  if (!v) return ""; const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) || n <= 0 ? "" : `${n.toLocaleString("en-IN")} sq.ft`;
};

/* ── Icons ────────────────────────────────────────────────── */
const Pin = () => <svg width="12" height="12" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
const Heart = ({ on }: { on: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={on?"#ef4444":"none"} stroke={on?"#ef4444":"white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const ArrR = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const Tel = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const Chev = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>;
const AreaIco = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>;

/* ── Filter tabs ──────────────────────────────────────────── */
const FILTERS = ["All", "Ready to Move", "Under Construction", "New Launch"] as const;
type Filter = (typeof FILTERS)[number];

/* ── Card ─────────────────────────────────────────────────── */

const Card = ({ p, cats, auth }: { p: ApiPropertyRaw; cats: MCat[]; auth: boolean }) => {
  const router = useRouter();
  const [saved, setSaved] = useState(p.isSaved ?? false);
  const [busy, setBusy] = useState(false);
  const { sub, cfg } = resolve(p, cats);
  const title = p.title || `${cfg} ${sub}`.trim() || "Property";
  const loc = p.locality || p.society || "";
  const tags: string[] = [];
  if (p.featured) tags.push("Featured");
  if (p.urgent) tags.push("Urgent");
  if (p.negotiable) tags.push("Negotiable");

  const go = () => {
    const sl = p.slug || generateSlug({ id: p.id, configLabel: cfg, typeLabel: sub, locality: p.locality || undefined });
    router.push(propertyUrl(sl));
  };
  const onSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); if (!auth || busy) return; setBusy(true);
    try { const r = await toggleSavePropertyApi(p.id); setSaved(r.data?.saved ?? !saved); } catch {} finally { setBusy(false); }
  };

  const cover    = coverUrl(p);
  return (
    <div className={s.card} onClick={go}>
      <div className={s.cardImg}>
        <img src={cover} alt={title} width={600} height={400} loading="lazy" />
        <div className={s.cardOverlay} />
        <div className={s.cardTopRow}>
          <span className={`${s.cardBadge} ${p.listingType === "rent" || p.listingType === "pg" ? s.bRent : s.bSale}`}>
            {p.listingType === "rent" ? "For Rent" : p.listingType === "pg" ? "PG" : "For Sale"}
          </span>
          <button onClick={onSave} className={`${s.heartBtn} ${saved ? s.heartSaved : ""}`}><Heart on={saved} /></button>
        </div>
        {tags.length > 0 && <div className={s.cardTags}>{tags.map(t => <span key={t} className={s.cardTag}>{t}</span>)}</div>}
      </div>
      <div className={s.cardBody}>
        {(cfg || sub) && <p className={s.cardConfig}>{[cfg, sub].filter(Boolean).join(" · ")}</p>}
        <h3 className={s.cardTitle}>{title}</h3>
        {loc && <p className={s.cardLoc}><Pin /><span className={s.cardLocText}>{loc}</span></p>}
        <div className={s.priceRow}>
          <div><p className={s.priceLabel}>Price</p><p className={s.price}>{fmtP(p.price, p.listingType)}</p></div>
          {fmtA(p.area) && <div style={{ textAlign: "right" }}><p className={s.priceLabel}>Area</p><p className={s.area}><span className={s.areaIco}><AreaIco /></span>{fmtA(p.area)}</p></div>}
        </div>
        <div className={s.actions}>
          <button className={s.viewBtn} onClick={e => { e.stopPropagation(); go(); }}>View Details <ArrR /></button>
          {!p.hideNumber && <button className={s.callBtn} onClick={e => e.stopPropagation()}><Tel /> Call</button>}
        </div>
      </div>
    </div>
  );
};

/* ── Skeleton ─────────────────────────────────────────────── */

const Skel = () => (
  <div className={s.skel}>
    <div className={s.skelImg} />
    <div className={s.skelBody}>
      <div className={`${s.skelLine} ${s.sl1}`} />
      <div className={`${s.skelLine} ${s.sl2}`} />
      <div className={`${s.skelLine} ${s.sl3}`} />
      <div className={s.skelPriceRow}><div className={s.skelPrice} /><div className={s.skelPrice} /></div>
      <div className={s.skelActions}>
        <div className={`${s.skelBtn} ${s.skelBtnMain}`} />
        <div className={`${s.skelBtn} ${s.skelBtnCall}`} />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */

const FeaturedProjects: React.FC = () => {
  const router = useRouter();
  const cats = useSelector((r: RootState) => r.masters?.categories ?? []) as MCat[];
  const auth = useSelector((r: RootState) => r.auth?.isAuthenticated ?? false);

  const [filter, setFilter] = useState<Filter>("All");
  const [props, setProps] = useState<ApiPropertyRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await browsePropertiesApi({ sort: "popular", limit: 9, page: 1 } as BrowseFilters);
      const d = r.data?.data ?? r.data?.properties ?? r.data ?? [];
      setProps(Array.isArray(d) ? d : []);
    } catch { setError("Unable to load properties"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "All" ? props : props.filter(p => {
    if (filter === "Ready to Move") return p.age === "new" || p.age === "0-1 years";
    if (filter === "Under Construction") return p.age === "1-5 years" || p.age === "5-10 years";
    return !p.age || p.category_id === 5;
  });

  const goAll = () => router.push("/properties?sort=popular");

  return (
    <section className={s.section} style={{ fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)" }}>
      <div className={s.container}>

        {/* Header */}
        <div className={`${s.header} ${s.fadeUp}`}>
          <div>
            <p className={s.eyebrow}><span className={s.eyebrowLine} />Handpicked for You</p>
            <h2 className={s.title} style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              <span className={s.titleBlue}>Featured</span>{" "}<span className={s.titleDark}>Properties</span>
            </h2>
            <p className={s.subtitle}>Premium properties across top Indian cities — verified &amp; RERA approved.</p>
            <div className={s.underline}><div className={s.uDot1} /><div className={s.uDot2} /><div className={s.uDot3} /></div>
          </div>
          <button className={`${s.viewAllBtn} ${s.showSm}`} style={{ display: "none" }} onClick={goAll}>View All Properties <Chev /></button>
        </div>

        {/* Filters */}
        <div className={`${s.filterRow} ${s.fadeUp} ${s.d1}`}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`${s.filterBtn} ${filter === f ? s.filterBtnActive : ""}`}>
              {f}
              {f !== "All" && (
                <span className={`${s.filterCount} ${filter === f ? s.fcActive : s.fcInactive}`}>
                  {f === "Ready to Move" ? props.filter(p => p.age === "new" || p.age === "0-1 years").length
                    : f === "Under Construction" ? props.filter(p => p.age === "1-5 years" || p.age === "5-10 years").length
                    : props.filter(p => !p.age || p.category_id === 5).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={s.grid}>{Array.from({ length: 6 }).map((_, i) => <div key={i} className={s.gridItem}><Skel /></div>)}</div>
        ) : error ? (
          <div className={s.empty}><p className={s.emptyTxt}>{error}</p><button className={s.retryBtn} onClick={load}>Try again</button></div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}><p className={s.emptyTxt}>No properties found for this filter.</p></div>
        ) : (
          <>
            <div className={`${s.grid} ${s.fadeUp} ${s.d2}`}>
              {filtered.slice(0, 9).map(p => <div key={p.id} className={s.gridItem}><Card p={p} cats={cats} auth={auth} /></div>)}
            </div>
            {/* Scroll dots — mobile only */}
            <div className={`${s.dots} ${s.hideSm}`}>
              {filtered.slice(0, 9).map((_, i) => <div key={i} className={`${s.dot} ${i === 0 ? s.dotActive : s.dotOther}`} />)}
            </div>
          </>
        )}

        {/* Mobile view all */}
        <div className={`${s.mViewAll} ${s.hideSm}`}>
          <button className={s.mViewAllBtn} onClick={goAll}>View All Properties <Chev /></button>
        </div>

        {/* Stats */}
        <div className={`${s.statsBar} ${s.fadeUp} ${s.d3}`}>
          {[{ v: "1,200+", l: "Projects Listed" }, { v: "RERA", l: "Verified Only" }, { v: "< 48hr", l: "Response Time" }].map(x => (
            <div key={x.l} className={s.statItem}>
              <p className={s.statVal} style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>{x.v}</p>
              <p className={s.statLbl}>{x.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;