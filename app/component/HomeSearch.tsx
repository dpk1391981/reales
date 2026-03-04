"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { browsePropertiesApi } from "@/services/propertyApi";
import type { BrowseFilters, ApiPropertyRaw } from "@/services/propertyApi";
import { useDebounce } from "@/hooks/useDebounce";
import s from "../css_module/HomeSearch.module.css";

/* ── Types ────────────────────────────────────────────────── */

interface Category {
  id: number; name: string; slug: string;
  listing_types?: { id: number; name: string; slug: string; icon: string; is_active: number }[];
  subcategories: { id: number; category_id: number; name: string; slug: string; is_active?: boolean; config_types: { id: number; name: string }[] }[];
}
interface LocState {
  country_id: number; state_id: number; city_id: number; locality_id: number; locality: string;
  states: any[]; cities: any[]; localities: any[];
}

/* ── Static data ──────────────────────────────────────────── */

const TABS = [
  { label: "Buy",         catSlug: "residential", ltSlug: "sell", icon: "🏠", subSlug: undefined as string | undefined },
  { label: "Rent",        catSlug: "residential", ltSlug: "rent", icon: "🔑", subSlug: undefined as string | undefined },
  { label: "New Project", catSlug: "project",     ltSlug: "sell", icon: "🏗️", subSlug: undefined as string | undefined },
  { label: "Commercial",  catSlug: "commercial",  ltSlug: "sell", icon: "🏢", subSlug: undefined as string | undefined },
  { label: "PG",          catSlug: "pg",          ltSlug: "pg",   icon: "🛏️", subSlug: undefined as string | undefined },
  { label: "Plot",        catSlug: "residential", ltSlug: "sell", icon: "📐", subSlug: "residential-plot" },
] as const;
type TabLabel = (typeof TABS)[number]["label"];

const B_SELL = [
  { label: "Under ₹20L", min: 0, max: 2000000 }, { label: "₹20L–50L", min: 2000000, max: 5000000 },
  { label: "₹50L–1Cr", min: 5000000, max: 10000000 }, { label: "₹1Cr–2Cr", min: 10000000, max: 20000000 },
  { label: "₹2Cr–5Cr", min: 20000000, max: 50000000 }, { label: "₹5Cr+", min: 50000000, max: undefined },
];
const B_RENT = [
  { label: "Under ₹5K", min: 0, max: 5000 }, { label: "₹5K–10K", min: 5000, max: 10000 },
  { label: "₹10K–25K", min: 10000, max: 25000 }, { label: "₹25K–50K", min: 25000, max: 50000 },
  { label: "₹50K–1L", min: 50000, max: 100000 }, { label: "₹1L+", min: 100000, max: undefined },
];
const CITIES = [
  { name: "Mumbai",    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=200&h=200&fit=crop&q=70" },
  { name: "Delhi",     img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&fit=crop&q=70" },
  { name: "Bangalore", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=200&h=200&fit=crop&q=70" },
  { name: "Pune",      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&q=70" },
  { name: "Hyderabad", img: "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?w=200&h=200&fit=crop&q=70" },
  { name: "Chennai",   img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200&h=200&fit=crop&q=70" },
  { name: "Gurgaon",   img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&q=70" },
  { name: "Noida",     img: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=200&h=200&fit=crop&q=70" },
];
const SUGGESTIONS_MAP: Record<TabLabel, string[]> = {
  Buy: ["Flats in Mumbai", "2 BHK Delhi NCR", "Villa Bangalore", "3 BHK Pune"],
  Rent: ["1 BHK Bangalore", "Furnished Gurgaon", "Studio Pune", "2 BHK Noida"],
  "New Project": ["Projects Mumbai", "New Flats Delhi", "Upcoming Noida"],
  Commercial: ["Office BKC", "Shop CP Delhi", "Warehouse Gurgaon"],
  PG: ["PG Bangalore", "Girls PG Delhi", "Boys PG Mumbai"],
  Plot: ["Plot Gurgaon", "Farm Pune", "Industrial Noida"],
};

/* ── SVG icons ────────────────────────────────────────────── */
const IC = {
  Search: ({ sz = 18, c = "#94a3b8" }: { sz?: number; c?: string }) => <svg width={sz} height={sz} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Pin: ({ c = "#2563EB" }: { c?: string }) => <svg width="15" height="15" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>,
  X: ({ sz = 14 }: { sz?: number }) => <svg width={sz} height={sz} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Chev: ({ sz = 12 }: { sz?: number }) => <svg width={sz} height={sz} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>,
  Back: () => <svg width="22" height="22" fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Mic: () => <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  Home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#0B3C8C"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
};

/* ── Suggestion item type ─────────────────────────────────── */
interface SugItem { type: "property" | "keyword"; label: string; meta?: string; id?: number; slug?: string; }

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

const HomeSearch: React.FC = () => {
  const router = useRouter();
  const cats = useSelector((r: RootState) => r.masters?.categories ?? []) as Category[];
  const loc  = useSelector((r: RootState) => r.location) as LocState;

  const [tab, setTab]             = useState<TabLabel>("Buy");
  const [q, setQ]                 = useState("");
  const [mobile, setMobile]       = useState(false);
  const [floating, setFloating]   = useState(false);
  const [subs, setSubs]           = useState<number[]>([]);
  const [budget, setBudget]       = useState<string | null>(null);
  const [drop, setDrop]           = useState<string | null>(null);
  const [sugs, setSugs]           = useState<SugItem[]>([]);
  const [sugLoad, setSugLoad]     = useState(false);
  const [showSug, setShowSug]     = useState(false);
  const [sugIdx, setSugIdx]       = useState(-1);

  const heroRef  = useRef<HTMLDivElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);
  const sugRef   = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Derived
  const cfg = TABS.find(t => t.label === tab)!;
  const cat = cats.find(c => c.slug === cfg.catSlug);
  const lt  = cat?.listing_types?.find(l => l.slug === cfg.ltSlug);
  const subList = useMemo(() => cat?.subcategories?.filter(sc => sc.is_active) ?? [], [cat]);
  const budgets = cfg.ltSlug === "rent" || cfg.ltSlug === "pg" ? B_RENT : B_SELL;
  const debouncedQ = useDebounce(q, 350);

  const placeholder = useMemo(() => ({
    Buy: "Search locality, project, builder...", Rent: "Search rental properties...",
    "New Project": "Search new launch projects...", Commercial: "Search office, shop, warehouse...",
    PG: "Search PG / co-living...", Plot: "Search plots & land...",
  }[tab]), [tab]);

  // ── Scroll → floating ──
  useEffect(() => {
    const fn = () => { if (heroRef.current) setFloating(heroRef.current.getBoundingClientRect().bottom < 0); };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Close dropdowns on outside click ──
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDrop(null);
      if (sugRef.current && !sugRef.current.contains(e.target as Node)) setShowSug(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Reset on tab switch ──
  useEffect(() => { setSubs([]); setBudget(null); setDrop(null); setSugs([]); setShowSug(false); }, [tab]);

  // ── DEBOUNCED LIVE SEARCH ──
  useEffect(() => {
    if (!debouncedQ || debouncedQ.trim().length < 2) { setSugs([]); setShowSug(false); return; }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      setSugLoad(true);
      try {
        const filters: BrowseFilters = { keyword: debouncedQ.trim(), limit: 6, page: 1 };
        if (cat) filters.category_id = cat.id;
        if (lt) filters.listingType = lt.slug;
        const res = await browsePropertiesApi(filters);
        if (ctrl.signal.aborted) return;
        const raw: ApiPropertyRaw[] = res.data?.data ?? res.data?.properties ?? res.data ?? [];
        const items: SugItem[] = (Array.isArray(raw) ? raw : []).slice(0, 5).map(p => ({
          type: "property" as const,
          label: p.title || p.locality || `Property #${p.id}`,
          meta: [p.locality, p.society].filter(Boolean).join(", ") || undefined,
          id: p.id, slug: p.slug,
        }));
        items.unshift({ type: "keyword", label: `Search "${debouncedQ.trim()}"` });
        setSugs(items); setShowSug(true); setSugIdx(-1);
      } catch (err: any) {
        if (err?.name !== "AbortError" && err?.name !== "CanceledError") {
          setSugs([{ type: "keyword", label: `Search "${debouncedQ.trim()}"` }]);
          setShowSug(true);
        }
      } finally { if (!ctrl.signal.aborted) setSugLoad(false); }
    })();
    return () => ctrl.abort();
  }, [debouncedQ, cat, lt]);

  // ── Helpers ──
  const toggle = (a: number[], v: number) => a.includes(v) ? a.filter(x => x !== v) : [...a, v];

  const buildParams = useCallback((kwOverride?: string): Record<string, string> => {
    const p: Record<string, string> = {};
    if (cat) p.category_id = String(cat.id);
    if (lt) p.listingType = lt.slug;
    if (subs.length === 1) p.subcategory_id = String(subs[0]);
    if (tab === "Plot" && cfg.subSlug) { const ps = subList.find(sc => sc.slug === cfg.subSlug); if (ps) p.subcategory_id = String(ps.id); }
    if (budget) { const r = budgets.find(b => b.label === budget); if (r) { if (r.min) p.minPrice = String(r.min); if (r.max) p.maxPrice = String(r.max); } }
    const kw = kwOverride ?? q.trim(); if (kw) p.keyword = kw;
    if (loc.city_id) p.city_id = String(loc.city_id);
    else if (loc.state_id) p.state_id = String(loc.state_id);
    return p;
  }, [cat, lt, subs, budget, budgets, q, loc, tab, subList, cfg]);

  const go = useCallback((kw?: string) => {
    const qs = new URLSearchParams(buildParams(kw)).toString();
    router.push(`/properties${qs ? `?${qs}` : ""}`);
    setMobile(false); setShowSug(false);
  }, [buildParams, router]);

  const pickSug = (item: SugItem) => {
    if (item.type === "property" && item.slug) router.push(`/property/${item.slug}`);
    else go(item.label.replace(/^Search\s*"?|"?\s*$/g, ""));
    setShowSug(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!showSug || !sugs.length) { if (e.key === "Enter") go(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx(i => Math.min(i + 1, sugs.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); sugIdx >= 0 ? pickSug(sugs[sugIdx]) : go(); }
    else if (e.key === "Escape") setShowSug(false);
  };

  /* ─── SUGGESTIONS PANEL ─────────────────────────────────── */

  const SugPanel = () => {
    if (!showSug || !sugs.length) return null;
    return (
      <div className={s.sugPanel} ref={sugRef}>
        {sugLoad && (
          <div className={s.sugLoading}>
            <div className={s.sugSpinner} />
            <span>Searching...</span>
          </div>
        )}
        {sugs.map((item, i) => (
          <button key={`${item.type}-${i}`}
            className={`${s.sugItem} ${i === sugIdx ? s.sugItemActive : ""}`}
            onClick={() => pickSug(item)} onMouseEnter={() => setSugIdx(i)}>
            <IC.Search sz={15} c={item.type === "property" ? "#2563EB" : "#cbd5e1"} />
            <div>
              <div className={s.sugLabel}>{item.label}</div>
              {item.meta && <div className={s.sugMeta}>{item.meta}</div>}
            </div>
          </button>
        ))}
      </div>
    );
  };

  /* ─── MOBILE OVERLAY ────────────────────────────────────── */

  const MobileOverlay = () => {
    if (!mobile) return null;
    return (
      <div className={s.overlay}>
        <div className={s.oHeader}>
          <button className={s.oBack} onClick={() => setMobile(false)}><IC.Back /></button>
          <div className={s.oInputWrap}>
            <IC.Search sz={16} c="#2563EB" />
            <input autoFocus type="text" value={q}
              onChange={e => { setQ(e.target.value); setShowSug(true); }}
              onKeyDown={onKey} placeholder={placeholder} className={s.oInput} />
            {q && <button className={s.xBtn} onClick={() => { setQ(""); setSugs([]); }}><IC.X sz={14} /></button>}
          </div>
        </div>

        <div className={s.oTabs}>
          {TABS.map(t => (
            <button key={t.label} onClick={() => setTab(t.label)}
              className={`${s.oTab} ${tab === t.label ? s.oTabActive : ""}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className={s.oBody}>
          {/* Live suggestions */}
          {showSug && sugs.length > 0 && (
            <div className={s.oSection}>
              {sugLoad && <div className={s.sugSpinner} style={{ margin: "8px auto" }} />}
              {sugs.map((item, i) => (
                <button key={`m-${i}`} className={s.oSugItem} onClick={() => pickSug(item)}>
                  <IC.Search sz={14} c={item.type === "property" ? "#2563EB" : "#cbd5e1"} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.label}</div>
                    {item.meta && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{item.meta}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Subcategories */}
          {!showSug && subList.length > 0 && (
            <div className={s.oSection}>
              <p className={s.oSectionLabel}>Property Type</p>
              <div className={s.oChips}>
                {subList.map(sc => (
                  <button key={sc.id} onClick={() => setSubs(toggle(subs, sc.id))}
                    className={`${s.oChip} ${subs.includes(sc.id) ? s.oChipActive : ""}`}>{sc.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          {!showSug && (
            <div className={s.oSection}>
              <p className={s.oSectionLabel}>Budget</p>
              <div className={s.oChips}>
                {budgets.map(b => (
                  <button key={b.label} onClick={() => setBudget(budget === b.label ? null : b.label)}
                    className={`${s.oChip} ${budget === b.label ? s.oChipActive : ""}`}>{b.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Popular suggestions */}
          {!showSug && (
            <div className={s.oSection}>
              <p className={s.oSectionLabel}>Popular Searches</p>
              {(SUGGESTIONS_MAP[tab] ?? []).map(chip => (
                <button key={chip} className={s.oSugItem} onClick={() => go(chip)}>
                  <IC.Search sz={14} c="#93c5fd" /><span>{chip}</span>
                </button>
              ))}
            </div>
          )}

          {/* Cities */}
          {!showSug && (
            <div className={s.oSection} style={{ paddingBottom: 24 }}>
              <p className={s.oSectionLabel}>Top Cities</p>
              <div className={s.oCities}>
                {CITIES.map(c => (
                  <button key={c.name} className={s.oCityBtn} onClick={() => go(c.name)}>
                    <div className={s.oCityImg}><img src={c.img} alt={c.name} loading="lazy" /></div>
                    <span className={s.oCityName}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={s.oFooter}>
          <button className={s.oSearchBtn} onClick={() => go()}>Search Properties</button>
        </div>
      </div>
    );
  };

  /* ─── FLOATING BAR ──────────────────────────────────────── */

  const FloatingBar = () => (
    <div className={`${s.floatBar} ${floating ? s.floatShow : s.floatHide}`}>
      <div className={s.floatInner}>
        <div className={s.floatLogo}><IC.Home /></div>
        <div className={s.floatTabs}>
          {TABS.map(t => (
            <button key={t.label} onClick={() => setTab(t.label)}
              className={`${s.floatTab} ${tab === t.label ? s.floatTabActive : ""}`}>{t.label}</button>
          ))}
        </div>
        <div className={s.floatInput}>
          <IC.Search sz={15} c="#94a3b8" />
          <input type="text" value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && go()}
            placeholder={`Search ${tab} properties...`} className={s.floatField} />
          {q && <button className={s.xBtn} onClick={() => setQ("")}><IC.X sz={12} /></button>}
        </div>
        <button className={s.floatCta} onClick={() => go()}>Search</button>
      </div>
    </div>
  );

  /* ─── MAIN RENDER ───────────────────────────────────────── */

  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)" }}>
      <MobileOverlay />
      <FloatingBar />

      <section ref={heroRef} className={s.hero}>
        <div className={s.heroDots} aria-hidden="true" />
        <div className={s.heroGlow} aria-hidden="true" />

        {/* Badge */}
        <div className={`${s.fadeUp} ${s.floatAnim}`}>
          <span className={s.badge}><span className={`${s.badgeDot} ${s.pulseDot}`} />Trusted by 10M+ Buyers</span>
        </div>

        {/* Headline */}
        <h1 className={`${s.headline} ${s.fadeUp} ${s.d1}`}
          style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
          Find Your <span className={s.gold}>Perfect</span> Home
        </h1>

        {/* Subtext — desktop only */}
        <p className={`${s.subtext} ${s.fadeUp} ${s.d2} ${s.showSm}`} style={{ display: "none" }}>
          Explore thousands of verified properties — flats, villas, plots &amp; commercial spaces.
        </p>

        {/* ── DESKTOP SEARCH CARD ── */}
        <div className={`${s.cardWrap} ${s.fadeUp} ${s.d3} ${s.showSm}`} style={{ display: "none" }}>
          <div className={s.card}>
            {/* Tabs */}
            <div className={s.tabs}>
              {TABS.map(t => (
                <button key={t.label} onClick={() => setTab(t.label)}
                  className={`${s.tab} ${tab === t.label ? s.tabActive : ""}`}>
                  <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
                  {tab === t.label && <span className={s.tabLine} />}
                </button>
              ))}
            </div>

            {/* Search row */}
            <div className={s.searchRow} ref={dropRef}>
              {/* Category dropdown */}
              {subList.length > 0 && (
                <div className={s.relative}>
                  <button onClick={() => setDrop(drop === "type" ? null : "type")}
                    className={`${s.catBtn} ${drop === "type" ? s.catBtnOpen : ""}`}>
                    {subs.length > 0 ? `${subs.length} selected` : "All Types"} <IC.Chev />
                  </button>
                  {drop === "type" && (
                    <div className={s.dropdown}>
                      <p className={s.dropLabel}>Property Type</p>
                      {subList.map(sc => (
                        <label key={sc.id} className={s.dropItem}>
                          <input type="checkbox" checked={subs.includes(sc.id)}
                            onChange={() => setSubs(toggle(subs, sc.id))}
                            style={{ accentColor: "#2563EB", width: 16, height: 16 }} />
                          {sc.name}
                        </label>
                      ))}
                      {subs.length > 0 && <button className={s.dropClear} onClick={() => setSubs([])}>Clear</button>}
                    </div>
                  )}
                </div>
              )}

              <div className={s.divider} />

              {/* Input + live suggestions */}
              <div className={s.inputWrap} ref={sugRef}>
                <IC.Search sz={18} c="#94a3b8" />
                <input type="text" value={q}
                  onChange={e => { setQ(e.target.value); setShowSug(true); }}
                  onFocus={() => { if (sugs.length) setShowSug(true); }}
                  onKeyDown={onKey}
                  placeholder={placeholder} className={s.input} />
                {q && <button className={s.xBtn} onClick={() => { setQ(""); setSugs([]); setShowSug(false); }}><IC.X /></button>}
                <SugPanel />
              </div>

              <button className={s.iconBtn} title="Detect location"><IC.Pin /></button>
              <button className={s.iconBtn} title="Voice search"><IC.Mic /></button>
              <button className={s.searchCta} onClick={() => go()}>Search</button>
            </div>

            {/* Filter pills */}
            <div className={s.filters}>
              {/* Budget */}
              <div className={s.relative}>
                <button onClick={() => setDrop(drop === "budget" ? null : "budget")}
                  className={`${s.pill} ${budget ? s.pillActive : ""}`}>
                  {budget || "Budget"} <IC.Chev sz={11} />
                </button>
                {drop === "budget" && (
                  <div className={s.dropdown} style={{ minWidth: 300 }}>
                    <p className={s.dropLabel}>Budget Range</p>
                    <div className={s.dropChips}>
                      {budgets.map(b => (
                        <button key={b.label} onClick={() => { setBudget(budget === b.label ? null : b.label); setDrop(null); }}
                          className={`${s.pill} ${budget === b.label ? s.pillActive : ""}`}>{b.label}</button>
                      ))}
                    </div>
                    {budget && <button className={s.dropClear} onClick={() => { setBudget(null); setDrop(null); }}>Clear</button>}
                  </div>
                )}
              </div>
              {["Posted By", "Verified Only"].map(f => (
                <button key={f} className={s.pill}>{f} <IC.Chev sz={11} /></button>
              ))}
              {(budget || subs.length > 0) && (
                <button className={s.clearAll} onClick={() => { setBudget(null); setSubs([]); }}>
                  <IC.X sz={10} /> Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── MOBILE PILL ── */}
        <div className={`${s.hideSm} ${s.fadeUp} ${s.d3}`}>
          <button onClick={() => setMobile(true)} className={s.mobilePill}>
            <div className={s.mobilePillIcon}><IC.Search sz={17} c="white" /></div>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <p className={s.mobilePillTitle}>Search Properties</p>
              <p className={s.mobilePillSub}>City, locality, project, builder...</p>
            </div>
            <span className={s.mobilePillGo}>GO</span>
          </button>
        </div>

        {/* ── MOBILE QUICK LINKS ── */}
        <div className={`${s.quickGrid} ${s.fadeUp} ${s.d4} ${s.hideSm}`}>
          {TABS.map(t => (
            <button key={t.label} className={s.quickTile} onClick={() => { setTab(t.label); setMobile(true); }}>
              <span className={s.quickIcon}>{t.icon}</span>
              <span className={s.quickLabel}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── DESKTOP: SUGGESTION CHIPS ── */}
        <div className={`${s.chips} ${s.fadeUp} ${s.d4} ${s.showSm}`} style={{ display: "none" }}>
          {(SUGGESTIONS_MAP[tab] ?? []).map(chip => (
            <button key={chip} className={s.chip} onClick={() => go(chip)}>🔍 {chip}</button>
          ))}
        </div>

        {/* ── DESKTOP: CITIES ROW ── */}
        <div className={`${s.citiesRow} ${s.fadeUp} ${s.d5} ${s.showSm}`} style={{ display: "none" }}>
          <span className={s.citiesLabel}>Top Cities</span>
          {CITIES.slice(0, 6).map(c => (
            <button key={c.name} className={s.cityBtn} onClick={() => go(c.name)}>
              <div className={s.cityImg}><img src={c.img} alt={c.name} width={52} height={52} /></div>
              <span className={s.cityName}>{c.name}</span>
            </button>
          ))}
        </div>

        {/* ── DESKTOP: STATS ── */}
        <div className={`${s.stats} ${s.fadeUp} ${s.d6} ${s.showSm}`} style={{ display: "none" }}>
          {[{ n: "24L+", l: "Monthly Visitors" }, { n: "50K+", l: "Verified Buyers" }, { n: "500+", l: "Cities" }, { n: "10K+", l: "Deals Closed" }].map(x => (
            <div key={x.l} className={s.statBox}>
              <p className={s.statNum} style={{ fontFamily: "var(--font-display)" }}>{x.n}</p>
              <p className={s.statLabel}>{x.l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSearch;