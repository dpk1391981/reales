"use client";

/**
 * Think4BuySale — Property Listings Page
 * ────────────────────────────────────────
 * Reusable for ALL listing views:
 *   /properties              → all
 *   /properties/sale         → for sale
 *   /properties/rent         → for rent
 *   /properties/pg           → PG
 *   /properties/agent/:id    → agent's listings  (pass defaultFilters)
 *   /properties/saved        → saved properties  (pass mode="saved")
 *
 * URL pattern (SquareYards-style):
 *   /properties/1bhk-flat-for-sale-in-mumbai?locality=Andheri&sort=latest
 *
 * API:
 *   browsePropertiesApi(BrowseFilters) → paginated results
 *   toggleSavePropertyApi(id)          → save/unsave
 *   sendEnquiryApi(id, payload)        → buyer enquiry
 *
 * Helpers: propertyDisplay.ts
 */

import {
  useState, useEffect, useCallback, useRef, Suspense
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  browsePropertiesApi,
  toggleSavePropertyApi,
  sendEnquiryApi,
  type ApiPropertyRaw,
  type BrowseFilters,
} from "@/services/propertyApi";
import {
  fmtPrice,
  propertyTitle,
  locationLabel,
  categoryLabel,
  configTypeLabel,
  coverUrl,
} from "@/utils/propertyDisplay";
import styles from "../PropertiesPage.module.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ListingPageProps {
  heading?:        string;
  defaultFilters?: Partial<BrowseFilters>;
  mode?:           "all" | "sale" | "rent" | "pg" | "agent" | "saved";
  breadcrumbs?:    { label: string; href?: string }[];
}

interface FilterState {
  listingType:    string;
  category_id:    number;
  config_type_id: number;
  minPrice:       number;
  maxPrice:       number;
  minArea:        number;
  maxArea:        number;
  keyword:        string;
  locality:       string;
  poster_type:    string;
  sort:           string;
  page:           number;
}

interface EnquiryState {
  propertyId: number | null;
  name:   string;
  phone:  string;
  msg:    string;
  sent:   boolean;
  busy:   boolean;
  error:  string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const BUDGET_RANGES = [
  { l:"Any Budget",     min:0,         max:0          },
  { l:"Under ₹25 L",   min:0,         max:2500000    },
  { l:"₹25–50 L",      min:2500000,   max:5000000    },
  { l:"₹50 L–1 Cr",    min:5000000,   max:10000000   },
  { l:"₹1–1.5 Cr",     min:10000000,  max:15000000   },
  { l:"₹1.5–2.5 Cr",   min:15000000,  max:25000000   },
  { l:"Above ₹2.5 Cr", min:25000000,  max:999999999  },
];

const BHK_OPTS = [
  { v:0, l:"Any" },{ v:1, l:"1 RK" },{ v:2, l:"1 BHK" },
  { v:3, l:"2 BHK" },{ v:4, l:"3 BHK" },{ v:5, l:"4 BHK" },{ v:6, l:"4+ BHK" },
];

const CATEGORY_OPTS = [
  { v:0, l:"Any Type"    },
  { v:1, l:"Residential" },
  { v:2, l:"Commercial"  },
  { v:4, l:"PG/Co-living"},
  { v:5, l:"New Project" },
];

const POSTER_OPTS = [
  { v:"",      l:"All"    },
  { v:"owner", l:"Owner"  },
  { v:"agent", l:"Agent"  },
];

const SORT_OPTS = [
  { v:"latest",    l:"Newest First"    },
  { v:"popular",   l:"Most Popular"    },
  { v:"price_asc", l:"Price: Low–High" },
  { v:"price_desc",l:"Price: High–Low" },
  { v:"area_asc",  l:"Area: Sm–Lg"    },
  { v:"area_desc", l:"Area: Lg–Sm"    },
];

const BUDGET_CHIPS = [
  { l:"Under ₹50L", min:0,        max:5000000   },
  { l:"₹50L–1Cr",   min:5000000,  max:10000000  },
  { l:"₹1Cr–2Cr",   min:10000000, max:20000000  },
  { l:"2Cr+",       min:20000000, max:999999999  },
];

const DEF: FilterState = {
  listingType:"sell", category_id:0, config_type_id:0,
  minPrice:0, maxPrice:0, minArea:0, maxArea:0,
  keyword:"", locality:"", poster_type:"", sort:"latest", page:1,
};

// ─── ICONS ────────────────────────────────────────────────────────────────────

const Ic = {
  Search: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Filter: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>,
  X:    ({s=13}:{s?:number}) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  ChevD: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>,
  ChevL: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>,
  ChevR: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>,
  Heart: ({f}:{f:boolean}) => <svg width="17" height="17" fill={f?"#ef4444":"none"} stroke={f?"#ef4444":"white"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Pin:  () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z"/><circle cx="12" cy="11" r="2"/></svg>,
  Area: () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>,
  Bed:  () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M2 14h20M6 14V9a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5"/></svg>,
  Bath: () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4Z"/><path d="M6 12V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1"/></svg>,
  Phone:() => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 010 2.13 2 2 0 012 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Reset:() => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Spin: () => <svg className={styles['lp-spin']} width="16" height="16" fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.8}} fill="currentColor" d="M4 12a8 8 0 0 1 8-8v8z"/></svg>,
  Eye:  () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Share:() => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function PropertiesPage(props: ListingPageProps) {
  return (
    <Suspense>
      <Inner {...props}/>
    </Suspense>
  );
}

function Inner({ heading, defaultFilters, mode = "all", breadcrumbs }: ListingPageProps) {
  const router = useRouter();
  const sp     = useSearchParams();

  // ── Filters ──
  const [f, setF] = useState<FilterState>(() => ({
    ...DEF,
    ...(defaultFilters ?? {}),
    listingType:    sp.get("listingType")    ?? defaultFilters?.listingType    ?? "sell",
    category_id:    Number(sp.get("category_id")    ?? defaultFilters?.category_id    ?? 0),
    config_type_id: Number(sp.get("config_type_id") ?? defaultFilters?.config_type_id ?? 0),
    minPrice:       Number(sp.get("minPrice")        ?? defaultFilters?.minPrice        ?? 0),
    maxPrice:       Number(sp.get("maxPrice")        ?? defaultFilters?.maxPrice        ?? 0),
    keyword:        sp.get("q")        ?? defaultFilters?.keyword  ?? "",
    locality:       sp.get("locality") ?? defaultFilters?.locality ?? "",
    sort:           sp.get("sort")     ?? "latest",
    page:           Number(sp.get("page") ?? 1),
  }));

  // ── Results ──
  const [props2, setProps2] = useState<ApiPropertyRaw[]>([]);
  const [total,  setTotal]  = useState(0);
  const [busy,   setBusy]   = useState(true);
  const [err,    setErr]    = useState("");

  // ── UI ──
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [savedIds,    setSavedIds]    = useState<Set<number>>(new Set());
  const [enq, setEnq] = useState<EnquiryState>({
    propertyId:null, name:"", phone:"", msg:"", sent:false, busy:false, error:"",
  });
  const [kwLocal, setKwLocal] = useState(f.keyword);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = Math.ceil(total / PAGE_SIZE);

  // ── Build BrowseFilters ──
  const toAPI = (s: FilterState): BrowseFilters => {
    const o: BrowseFilters = { page: s.page, limit: PAGE_SIZE, sort: s.sort as any };
    if (s.listingType)    o.listingType    = s.listingType;
    if (s.category_id)    o.category_id    = s.category_id;
    if (s.config_type_id) o.config_type_id = s.config_type_id;
    if (s.minPrice)       o.minPrice       = s.minPrice;
    if (s.maxPrice)       o.maxPrice       = s.maxPrice;
    if (s.minArea)        o.minArea        = s.minArea;
    if (s.maxArea)        o.maxArea        = s.maxArea;
    if (s.keyword)        o.keyword        = s.keyword;
    if (s.locality)       o.locality       = s.locality;
    return o;
  };

  // ── Fetch ──
  const fetch = useCallback(async (s: FilterState) => {
    setBusy(true); setErr("");
    try {
      const res  = await browsePropertiesApi(toAPI(s));
      const body = res?.data ?? res;
      const list: ApiPropertyRaw[] = body?.data ?? body?.items ?? (Array.isArray(body) ? body : []);
      setProps2(list);
      setTotal(body?.total ?? body?.count ?? list.length ?? 0);
      const saved = new Set<number>();
      list.forEach(p => { if (p.isSaved) saved.add(p.id); });
      setSavedIds(prev => new Set([...prev, ...saved]));
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to load properties. Please try again.");
    } finally { setBusy(false); }
  }, []);

  // ── Fetch on filter change ──
  useEffect(() => {
    fetch(f);
    // sync URL
    const p = new URLSearchParams();
    if (f.listingType)                p.set("listingType",    f.listingType);
    if (f.category_id)                p.set("category_id",    String(f.category_id));
    if (f.config_type_id)             p.set("config_type_id", String(f.config_type_id));
    if (f.minPrice)                   p.set("minPrice",       String(f.minPrice));
    if (f.maxPrice)                   p.set("maxPrice",       String(f.maxPrice));
    if (f.keyword)                    p.set("q",              f.keyword);
    if (f.locality)                   p.set("locality",       f.locality);
    if (f.sort !== "latest")          p.set("sort",           f.sort);
    if (f.page > 1)                   p.set("page",           String(f.page));
    router.replace(`?${p.toString()}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f]);

  const upd = (patch: Partial<FilterState>) =>
    setF(prev => ({ ...prev, ...patch, page: 1 }));

  const reset = () => {
    setKwLocal("");
    setF({ ...DEF, ...(defaultFilters ?? {}), page: 1 });
  };

  // ── Save ──
  const doSave = async (id: number) => {
    setSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    try { await toggleSavePropertyApi(id); }
    catch { setSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  };

  // ── Enquiry ──
  const doEnquiry = async () => {
    if (!enq.propertyId) return;
    if (!enq.name.trim() || !/^[6-9]\d{9}$/.test(enq.phone)) {
      setEnq(e => ({ ...e, error: "Enter valid name and 10-digit mobile." })); return;
    }
    setEnq(e => ({ ...e, busy: true, error: "" }));
    try {
      await sendEnquiryApi(enq.propertyId, { buyer_name: enq.name, buyer_phone: enq.phone, message: enq.msg });
      setEnq(e => ({ ...e, sent: true, busy: false }));
    } catch (err: any) {
      setEnq(e => ({ ...e, busy: false, error: err?.response?.data?.message ?? "Failed. Try again." }));
    }
  };

  // ── Active filter count ──
  const afCount = [f.category_id, f.config_type_id,
    f.minPrice || f.maxPrice, f.minArea || f.maxArea, f.locality, f.poster_type].filter(Boolean).length;

  // ── Page heading ──
  const h = heading ?? (() => {
    const parts: string[] = [];
    if (f.config_type_id) parts.push(configTypeLabel(f.config_type_id));
    if (f.category_id)    parts.push(categoryLabel(f.category_id));
    else                  parts.push("Properties");
    parts.push(`for ${f.listingType==="rent"?"Rent":f.listingType==="pg"?"PG":"Sale"}`);
    return parts.join(" ");
  })();

  // ── Filter sidebar (shared between desktop aside + mobile drawer) ──
  const FilterBody = () => (
    <>
      {/* Listing type tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid #f1f5f9" }}>
        {[{v:"sell",l:"Buy"},{v:"rent",l:"Rent"},{v:"pg",l:"PG"}].map(t => (
          <button key={t.v}
            style={{ flex:1, padding:"13px 0", textAlign:"center", fontSize:13, fontWeight:700,
              borderBottom:`2px solid ${f.listingType===t.v?"#1E40AF":"transparent"}`,
              color: f.listingType===t.v?"#1E40AF":"#64748b",
              border:"none", background:"none", cursor:"pointer", WebkitTapHighlightColor:"transparent" as any }}
            onClick={() => upd({ listingType: t.v })}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Keyword */}
      <Fsec label="Search">
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8" }}><Ic.Search/></span>
          <input className={styles['lp-inp']} style={{ paddingLeft:32 }} placeholder="Area, society, keyword…"
            ref={inputRef} value={kwLocal}
            onChange={e => setKwLocal(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") upd({ keyword: kwLocal }); }}
          />
          {kwLocal && (
            <button onClick={() => { setKwLocal(""); upd({ keyword:"" }); }}
              style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8" }}>
              <Ic.X s={11}/>
            </button>
          )}
        </div>
      </Fsec>

      {/* Locality */}
      <Fsec label="Locality / Area">
        <input className={styles['lp-inp']} placeholder="e.g. Andheri West"
          value={f.locality} onChange={e => upd({ locality: e.target.value })}/>
      </Fsec>

      {/* Property type */}
      <Fsec label="Property Type">
        <Sel value={f.category_id} onChange={v => upd({ category_id: v })}>
          {CATEGORY_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </Sel>
      </Fsec>

      {/* BHK */}
      {(f.category_id === 0 || f.category_id === 1) && (
        <Fsec label="BHK / Config">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {BHK_OPTS.map(o => (
              <Chip key={o.v} active={f.config_type_id===o.v}
                onClick={() => upd({ config_type_id: f.config_type_id===o.v?0:o.v })}>
                {o.l}
              </Chip>
            ))}
          </div>
        </Fsec>
      )}

      {/* Budget */}
      <Fsec label="Budget">
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {BUDGET_RANGES.map(b => {
            const on = f.minPrice===b.min && f.maxPrice===b.max;
            return (
              <label key={b.l} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <input type="radio" name="budget" checked={on}
                  onChange={() => upd({ minPrice: b.min, maxPrice: b.max })}
                  style={{ accentColor:"#2563EB", width:14, height:14, flexShrink:0 }}
                />
                <span style={{ fontSize:13, color:on?"#1E40AF":"#64748b", fontWeight:on?700:400 }}>{b.l}</span>
              </label>
            );
          })}
        </div>
      </Fsec>

      {/* Area range */}
      <Fsec label="Area (sq.ft)">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <input className={styles['lp-inp']} type="number" placeholder="Min"
            value={f.minArea || ""} onChange={e => upd({ minArea: Number(e.target.value)||0 })}/>
          <input className={styles['lp-inp']} type="number" placeholder="Max"
            value={f.maxArea || ""} onChange={e => upd({ maxArea: Number(e.target.value)||0 })}/>
        </div>
      </Fsec>

      {/* Posted by */}
      <Fsec label="Posted By">
        <div style={{ display:"flex", gap:6 }}>
          {POSTER_OPTS.map(o => (
            <Chip key={o.v} active={f.poster_type===o.v} onClick={() => upd({ poster_type: o.v })}>
              {o.l}
            </Chip>
          ))}
        </div>
      </Fsec>
    </>
  );

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/*
       * No inline <style> here — all styles live in PropertiesPage.module.css
       * which is scoped under .lp-root and uses lp- prefixed keyframes.
       * This prevents any conflict with RealEstateHeader's ddFadeIn/sheetUp/
       * popBounce animations or its body/button/a global rules.
       */}

      <div className={styles['lp-root']}>

        {/* ── BREADCRUMB ── */}
        <div style={{ background:"white", borderBottom:"1px solid #e8eef8" }}>
          <div className={styles['lp-wrap']} style={{ padding:"9px 20px", display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#94a3b8", flexWrap:"wrap" }}>
            <a href="/" style={{ color:"#2563EB", fontWeight:600 }}>Home</a>
            <span>›</span>
            <a href="/properties" style={{ color:"#2563EB", fontWeight:600 }}>Properties</a>
            {breadcrumbs?.map((b,i) => (
              <span key={i} style={{ display:"contents" }}>
                <span>›</span>
                {b.href
                  ? <a href={b.href} style={{ color:"#2563EB", fontWeight:600 }}>{b.label}</a>
                  : <span style={{ color:"#334155", fontWeight:600 }}>{b.label}</span>
                }
              </span>
            ))}
          </div>
        </div>

        {/* ── PAGE HEADING ── */}
        <div style={{ background:"white", borderBottom:"1px solid #e8eef8" }}>
          <div className={styles['lp-wrap']} style={{ padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <div>
              <h1 style={{ fontSize:"clamp(16px,2vw,21px)", fontWeight:800, color:"#0B3C8C" }}>{h}</h1>
              <p style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>
                {busy
                  ? "Loading…"
                  : <><strong style={{color:"#334155"}}>{total.toLocaleString("en-IN")}</strong> listings found{f.locality && <> in <strong style={{color:"#2563EB"}}>{f.locality}</strong></>}</>
                }
              </p>
            </div>

            {/* Budget quick-chips — desktop only */}
            <div className={styles['lp-budget-chips']} style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {BUDGET_CHIPS.map(b => {
                const on = f.minPrice===b.min && f.maxPrice===b.max;
                return (
                  <button key={b.l} onClick={() => upd({ minPrice:on?0:b.min, maxPrice:on?0:b.max })}
                    style={{ padding:"5px 12px", borderRadius:50, border:`1.5px solid ${on?"#2563EB":"#e2e8f0"}`, background:on?"#EFF6FF":"white", color:on?"#1E40AF":"#64748b", fontSize:11, fontWeight:700, cursor:"pointer", WebkitTapHighlightColor:"transparent" as any }}>
                    {b.l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className={`${styles['lp-layout']} ${styles['lp-wrap']}`}>

          {/* ──────────────────────────────────────────── */}
          {/* SIDEBAR — desktop                           */}
          {/* ──────────────────────────────────────────── */}
          <aside className={styles['lp-sidebar']}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 20px", borderBottom:"1px solid #f1f5f9" }}>
              <span style={{ fontSize:12, fontWeight:800, color:"#0B3C8C", textTransform:"uppercase", letterSpacing:".12em", display:"flex", alignItems:"center", gap:6 }}>
                <Ic.Filter/> Filters
                {afCount > 0 && <span style={{ background:"#1E40AF", color:"white", width:17, height:17, borderRadius:"50%", fontSize:9, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{afCount}</span>}
              </span>
              {afCount > 0 && (
                <button onClick={reset} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color:"#2563EB", background:"none", border:"none", cursor:"pointer" }}>
                  <Ic.Reset/> Reset
                </button>
              )}
            </div>

            {/* Active filter tags */}
            {afCount > 0 && (
              <div style={{ padding:"8px 16px 4px", display:"flex", flexWrap:"wrap", gap:5 }}>
                {f.config_type_id>0  && <FTag label={configTypeLabel(f.config_type_id)} onRm={() => upd({config_type_id:0})}/>}
                {f.category_id>0     && <FTag label={categoryLabel(f.category_id)} onRm={() => upd({category_id:0})}/>}
                {(f.minPrice||f.maxPrice) && <FTag label={`${fmtPrice(f.minPrice)||"Any"}–${fmtPrice(f.maxPrice)||"Any"}`} onRm={() => upd({minPrice:0,maxPrice:0})}/>}
                {f.locality          && <FTag label={f.locality} onRm={() => upd({locality:""})}/>}
              </div>
            )}

            <FilterBody/>
          </aside>

          {/* ──────────────────────────────────────────── */}
          {/* RESULTS                                     */}
          {/* ──────────────────────────────────────────── */}
          <section>

            {/* Topbar */}
            <div className={styles['lp-topbar']}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {/* Mobile filter button */}
                <button className={styles['lp-filter-trigger']} onClick={() => setDrawerOpen(true)}
                  style={{ display:"none", alignItems:"center", gap:5, padding:"7px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, background:"white", fontSize:12, fontWeight:700, color:"#334155", cursor:"pointer", WebkitTapHighlightColor:"transparent" as any }}>
                  <Ic.Filter/> Filters{afCount>0&&` (${afCount})`}
                </button>

                {/* Listing type toggle */}
                <div style={{ display:"flex", background:"#F1F5F9", borderRadius:10, padding:3 }}>
                  {[{v:"sell",l:"Buy"},{v:"rent",l:"Rent"},{v:"pg",l:"PG"}].map(t => (
                    <button key={t.v} onClick={() => upd({listingType:t.v})}
                      style={{ padding:"5px 13px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", WebkitTapHighlightColor:"transparent" as any, transition:"all .15s",
                        background: f.listingType===t.v?"white":"transparent",
                        color: f.listingType===t.v?"#1E40AF":"#94a3b8",
                        boxShadow: f.listingType===t.v?"0 1px 4px rgba(0,0,0,.09)":"none" }}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8" }} className={styles['lp-hide-sm']}>Sort:</span>
                <div style={{ position:"relative" }}>
                  <select className={styles['lp-sel']} style={{ width:"auto", padding:"6px 28px 6px 10px", fontSize:12, fontWeight:700, color:"#334155" }}
                    value={f.sort} onChange={e => upd({sort:e.target.value})}>
                    {SORT_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                  <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#94a3b8" }}><Ic.ChevD/></span>
                </div>
              </div>
            </div>

            {/* Error */}
            {err && (
              <div style={{ margin:"12px 16px", padding:"11px 14px", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:11, color:"#e11d48", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>⚠ {err}</span>
                <button onClick={() => fetch(f)} style={{ color:"#2563EB", background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:700 }}>Retry</button>
              </div>
            )}

            {/* Skeletons */}
            {busy && Array(4).fill(0).map((_,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"240px 1fr", borderBottom:"1px solid #eef2f9", background:"white" }}>
                <div className={styles['lp-sk']} style={{ borderRadius:0, height:182 }}/>
                <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
                  <div className={styles['lp-sk']} style={{ height:11, width:"55%" }}/>
                  <div className={styles['lp-sk']} style={{ height:20, width:"38%" }}/>
                  <div className={styles['lp-sk']} style={{ height:11, width:"72%" }}/>
                  <div style={{ display:"flex", gap:7, marginTop:4 }}>
                    {[60,72,80].map(w => <div key={w} className={styles['lp-sk']} style={{ height:24, width:w }}/>)}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty */}
            {!busy && !err && props2.length===0 && (
              <div style={{ textAlign:"center", padding:"72px 20px" }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🏠</div>
                <h3 style={{ fontSize:18, fontWeight:800, color:"#0B3C8C", marginBottom:6 }}>No listings found</h3>
                <p style={{ fontSize:13, color:"#94a3b8", marginBottom:20 }}>Try adjusting filters or searching a broader area</p>
                <button onClick={reset} className={styles['lp-btn-p']} style={{ margin:"0 auto", padding:"10px 24px" }}>Clear Filters</button>
              </div>
            )}

            {/* Cards */}
            {!busy && props2.map((p, idx) => (
              <Card
                key={p.id}
                p={p}
                idx={idx}
                saved={savedIds.has(p.id)}
                onSave={() => doSave(p.id)}
                onEnquire={() => setEnq({ propertyId:p.id, name:"", phone:"", msg:"", sent:false, busy:false, error:"" })}
              />
            ))}

            {/* Pagination */}
            {!busy && pages > 1 && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"22px 20px", borderTop:"1px solid #e8eef8", background:"white", flexWrap:"wrap" }}>
                <button className={styles['lp-pg-btn']} disabled={f.page<=1} onClick={() => setF(p => ({...p,page:p.page-1}))}>
                  <Ic.ChevL/>
                </button>

                {pgRange(f.page, pages).map((p,i) =>
                  p==="…"
                    ? <span key={`d${i}`} style={{ width:28,textAlign:"center",color:"#94a3b8",fontSize:13 }}>…</span>
                    : <button key={p} className={`${styles['pg-btn']}${f.page===p?" on":""}`}
                        onClick={() => setF(s => ({...s,page:p as number}))}>{p}</button>
                )}

                <button className={styles['lp-pg-btn']} disabled={f.page>=pages} onClick={() => setF(p => ({...p,page:p.page+1}))}>
                  <Ic.ChevR/>
                </button>

                <span style={{ fontSize:11, color:"#94a3b8", marginLeft:4 }}>
                  {f.page}/{pages}
                </span>
              </div>
            )}

          </section>
        </div>

        {/* ── MOBILE FILTER DRAWER ── */}
        {drawerOpen && (
          <>
            <div className={styles['lp-drawer-bg']} onClick={() => setDrawerOpen(false)}/>
            <div className={styles['lp-drawer-panel']}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px 12px", position:"sticky", top:0, background:"white", borderBottom:"1px solid #f1f5f9", zIndex:1 }}>
                <span style={{ fontSize:15, fontWeight:800, color:"#0B3C8C" }}>Filters</span>
                <div style={{ display:"flex", gap:10 }}>
                  {afCount>0 && <button onClick={reset} style={{ fontSize:12, fontWeight:700, color:"#f43f5e", background:"none", border:"none", cursor:"pointer" }}>Reset All</button>}
                  <button onClick={() => setDrawerOpen(false)}
                    style={{ width:28,height:28,borderRadius:50,border:"1.5px solid #e2e8f0",background:"white",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                    <Ic.X/>
                  </button>
                </div>
              </div>
              <FilterBody/>
              <div style={{ padding:"16px 20px 36px" }}>
                <button className={styles['lp-btn-p']} style={{ width:"100%",padding:"13px 0",justifyContent:"center",fontSize:14 }}
                  onClick={() => setDrawerOpen(false)}>
                  Show {total>0?`${total.toLocaleString("en-IN")} `:""}Results
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── ENQUIRY MODAL ── */}
        {enq.propertyId!==null && (
          <div className={styles['lp-modal-bg']} onClick={e => e.target===e.currentTarget && setEnq(e => ({...e,propertyId:null}))}>
            <div className={styles['lp-modal']}>
              <div style={{ width:32, height:4, borderRadius:2, background:"#e2e8f0", margin:"0 auto 18px" }}/>
              {enq.sent ? (
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                  <div style={{ fontSize:52, marginBottom:10 }}>✅</div>
                  <h3 style={{ fontSize:18, fontWeight:800, color:"#0B3C8C", marginBottom:6 }}>Enquiry Sent!</h3>
                  <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7 }}>The owner/agent will call you soon.</p>
                  <button className={styles['lp-btn-p']} style={{ margin:"18px auto 0", padding:"10px 28px" }}
                    onClick={() => setEnq(e => ({...e,propertyId:null}))}>Done</button>
                </div>
              ) : (
                <>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <h3 style={{ fontSize:16, fontWeight:800, color:"#0B3C8C" }}>Contact Seller</h3>
                    <button onClick={() => setEnq(e => ({...e,propertyId:null}))}
                      style={{ width:28,height:28,borderRadius:50,border:"1.5px solid #e2e8f0",background:"white",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                      <Ic.X/>
                    </button>
                  </div>

                  {enq.error && (
                    <div style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:9, padding:"9px 12px", marginBottom:11, fontSize:12, color:"#e11d48", fontWeight:600 }}>
                      ⚠ {enq.error}
                    </div>
                  )}

                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    <input className={styles['lp-modal-inp']} placeholder="Your full name *"
                      value={enq.name} onChange={e => setEnq(q => ({...q,name:e.target.value}))}/>
                    <input className={styles['lp-modal-inp']} type="tel" inputMode="numeric" maxLength={10}
                      placeholder="10-digit mobile *"
                      value={enq.phone} onChange={e => setEnq(q => ({...q,phone:e.target.value.replace(/\D/g,"").slice(0,10)}))}/>
                    <textarea className={styles['lp-modal-inp']} placeholder="Message (optional)" rows={3}
                      value={enq.msg} onChange={e => setEnq(q => ({...q,msg:e.target.value}))}
                      style={{ resize:"vertical", minHeight:68 }}/>
                  </div>

                  <button className={styles['lp-btn-p']} style={{ width:"100%", justifyContent:"center", marginTop:13, padding:"12px 0", fontSize:14 }}
                    disabled={enq.busy} onClick={doEnquiry}>
                    {enq.busy ? <><Ic.Spin/> Sending…</> : <><Ic.Phone/> Send Enquiry</>}
                  </button>

                  <p style={{ fontSize:10, color:"#94a3b8", textAlign:"center", marginTop:9 }}>
                    🔒 Only shared with this seller
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile FAB */}
        <div className={styles['lp-mobile-fab']} style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, padding:"10px 16px 18px", background:"linear-gradient(to top,white,rgba(255,255,255,.95))", zIndex:30 }}>
          <button onClick={() => setDrawerOpen(true)}
            style={{ width:"100%", padding:"13px 0", background:"linear-gradient(135deg,#0B3C8C,#2563EB)", color:"white", border:"none", borderRadius:14, fontSize:14, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", boxShadow:"0 4px 20px rgba(11,60,140,.32)", WebkitTapHighlightColor:"transparent" as any }}>
            <Ic.Filter/> Filters{afCount>0&&` (${afCount} active)`}
          </button>
        </div>

      </div>
    </>
  );
}

// ─── PROPERTY CARD ────────────────────────────────────────────────────────────

function Card({
  p, idx, saved, onSave, onEnquire,
}: { p: ApiPropertyRaw; idx: number; saved: boolean; onSave: ()=>void; onEnquire: ()=>void }) {
  const cover    = coverUrl(p);
  const title    = propertyTitle(p);
  const location = locationLabel(p);
  const price    = fmtPrice(p.price);
  const photoN   = p.photos?.length ?? 0;
  const detailUrl = `/property/${p.slug || p.id}`;

  const badge = p.featured ? { l:"Featured", c:"#d97706" }
              : p.urgent    ? { l:"Urgent",   c:"#ef4444" }
              : p.rera      ? { l:"RERA",      c:"#059669" }
              : null;

  return (
    <div className={styles['lp-card']} style={{ animationDelay:`${idx*.045}s` }}>

      {/* Image */}
      <a href={detailUrl} className={styles['lp-cimg']}>
        {cover
          ? <img src={cover} alt={title} loading="lazy"/>
          : <div style={{ width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6 }}>
              <svg width="24" height="24" fill="white" opacity=".3" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span style={{ color:"rgba(255,255,255,.4)", fontSize:9 }}>No photo</span>
            </div>
        }

        {/* Badge */}
        {badge && (
          <span style={{ position:"absolute",top:8,left:8,fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:50,background:badge.c,color:"white",textTransform:"uppercase",letterSpacing:".05em" }}>
            {badge.l}
          </span>
        )}

        {/* Photo count */}
        {photoN > 1 && (
          <span style={{ position:"absolute",bottom:7,left:7,background:"rgba(0,0,0,.55)",color:"white",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:50,display:"flex",alignItems:"center",gap:3 }}>
            <svg width="9" height="9" fill="white" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path fill="none" stroke="white" strokeWidth="2" d="m3 15 5-5 4 4 3-3 6 6"/></svg>
            {photoN}
          </span>
        )}

        {/* Save btn */}
        <button onClick={e => { e.preventDefault(); onSave(); }}
          style={{ position:"absolute",top:7,right:7,width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,.38)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",WebkitTapHighlightColor:"transparent" as any, transition:"background .15s" }}
          onMouseEnter={e => (e.currentTarget.style.background="rgba(0,0,0,.6)")}
          onMouseLeave={e => (e.currentTarget.style.background="rgba(0,0,0,.38)")}>
          <Ic.Heart f={saved}/>
        </button>
      </a>

      {/* Body */}
      <div className={styles['lp-cbody']} style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:0, overflow:"hidden" }}>

        {/* Tags row */}
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5, flexWrap:"wrap" }}>
          <span style={{ fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:50,textTransform:"uppercase",letterSpacing:".06em",
            background: p.listingType==="rent"?"#FEF3C7":p.listingType==="pg"?"#F3E8FF":"#EFF6FF",
            color: p.listingType==="rent"?"#92400e":p.listingType==="pg"?"#7e22ce":"#1E40AF" }}>
            For {p.listingType==="sell"?"Sale":p.listingType==="rent"?"Rent":"PG"}
          </span>
          {p.poster_type==="owner" && (
            <span style={{ fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:50,background:"#dcfce7",color:"#166534",textTransform:"uppercase",letterSpacing:".06em" }}>Owner</span>
          )}
          {p.rera && (
            <span style={{ fontSize:9,fontWeight:800,color:"#059669",display:"flex",alignItems:"center",gap:2 }}>
              <svg width="9" height="9" fill="#059669" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>RERA
            </span>
          )}
          {p.negotiable && (
            <span style={{ fontSize:9,fontWeight:700,color:"#0369a1",background:"#e0f2fe",padding:"2px 6px",borderRadius:50 }}>Negotiable</span>
          )}
        </div>

        {/* Title */}
        <a href={detailUrl}>
          <h2 style={{ fontSize:"clamp(13px,1.3vw,15px)", fontWeight:800, color:"#0B3C8C", lineHeight:1.3, marginBottom:2,
            display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {title}
          </h2>
        </a>

        {/* Price */}
        <p style={{ fontSize:"clamp(17px,1.7vw,21px)", fontWeight:900, color:"#0B3C8C", lineHeight:1, marginBottom:5 }}>
          {price}
          {p.listingType==="rent" && <span style={{ fontSize:11,fontWeight:500,color:"#94a3b8" }}>/mo</span>}
        </p>

        {/* Location */}
        <p style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#64748b", marginBottom:5,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          <span style={{ color:"#2563EB", flexShrink:0 }}><Ic.Pin/></span>
          {location}{p.society ? `, ${p.society}` : ""}
        </p>

        {/* Specs */}
        <div className={styles['lp-specs']}>
          {p.config_type_id && <span className={styles['lp-spec']}><Ic.Bed/>{configTypeLabel(p.config_type_id)}</span>}
          {p.bathrooms      && <span className={styles['lp-spec']}><Ic.Bath/>{p.bathrooms} Bath</span>}
          {p.area           && <span className={styles['lp-spec']}><Ic.Area/>{Number(p.area).toLocaleString("en-IN")} sq.ft</span>}
          {p.furnishing     && <span className={styles['lp-spec']} style={{ textTransform:"capitalize" }}>{p.furnishing}</span>}
          {p.facing         && <span className={`${styles['lp-spec']} ${styles['lp-hide-sm']}`} style={{ textTransform:"capitalize" }}>{p.facing} Facing</span>}
        </div>

        {/* Description */}
        {p.description && (
          <p style={{ fontSize:11, color:"#64748b", lineHeight:1.6, marginTop:6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {p.description}
          </p>
        )}

        {/* CTA row */}
        <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:"auto", paddingTop:10, borderTop:"1px solid #f1f5f9", flexWrap:"wrap" }}>
          {/* Poster */}
          <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, minWidth:0 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"white",
              background: p.poster_type==="agent"?"linear-gradient(135deg,#1E40AF,#3B82F6)":"linear-gradient(135deg,#059669,#34d399)" }}>
              {(p.ownerName ?? "U")[0].toUpperCase()}
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:"#334155", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {p.ownerName ?? (p.poster_type==="agent"?"Agent":"Owner")}
            </span>
            {p.views_count>0 && (
              <span className={styles['lp-hide-sm']} style={{ fontSize:10, color:"#94a3b8", display:"flex", alignItems:"center", gap:3 }}>
                <Ic.Eye/>{p.views_count}
              </span>
            )}
          </div>

          <button className={styles['lp-btn-o']} onClick={onEnquire}>
            <Ic.Phone/><span className={styles['lp-hide-sm']}>Contact</span>
          </button>
          <a href={detailUrl} className={styles['lp-btn-p']}>
            View<span className={styles['lp-hide-sm']}> Details</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Fsec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles['lp-fsec']}>
      <label className={styles['lp-fsec-label']}>{label}</label>
      {children}
    </div>
  );
}

function Sel({ value, onChange, children }: { value: number; onChange: (v:number)=>void; children: React.ReactNode }) {
  return (
    <div style={{ position:"relative" }}>
      <select className={styles['lp-sel']} value={value} onChange={e => onChange(Number(e.target.value))}>{children}</select>
      <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#94a3b8" }}>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </span>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: ()=>void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`${styles['lp-chip']}${active ? ` ${styles['lp-chip-on']}` : ""}`}>
      {children}
    </button>
  );
}

function FTag({ label, onRm }: { label: string; onRm: ()=>void }) {
  return (
    <span className={styles['lp-ftag']}>
      {label}
      <button onClick={onRm} className={styles['lp-ftag-rm']}>
        <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </span>
  );
}

function pgRange(cur: number, total: number): (number|"…")[] {
  if (total <= 7) return Array.from({length:total}, (_,i) => i+1);
  if (cur <= 4)   return [1,2,3,4,5,"…",total];
  if (cur >= total-3) return [1,"…",total-4,total-3,total-2,total-1,total];
  return [1,"…",cur-1,cur,cur+1,"…",total];
}