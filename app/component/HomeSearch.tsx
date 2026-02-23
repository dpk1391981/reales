"use client";

import React, {
  useState, useRef, useEffect, useCallback, useLayoutEffect,
} from "react";
import MobileSearchOverlay from "./MobileSearchOverlay";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Tab    = "Buy" | "Rent" | "New Launch" | "Commercial" | "Plots/Land" | "Projects";
type Filter = "category" | "budget" | "bedroom" | "status" | "postedBy" | null;

/* ─── Static data ────────────────────────────────────────────────────────── */
const TABS: { id: Tab; hot?: boolean }[] = [
  { id: "Buy" }, { id: "Rent" }, { id: "New Launch", hot: true },
  { id: "Commercial" }, { id: "Plots/Land" }, { id: "Projects" },
];

const RES_TYPES   = ["Flat/Apartment","Builder Floor","Independent House","Villa","1 RK/Studio","Farm House","Serviced Apt","Other"];
const COMM_TYPES  = ["Ready-to-move Office","Bare Shell Office","Shops & Retail","Commercial Land","Warehouse","Industrial Plots","Hotel/Resorts","Others"];
const INVEST_OPTS = ["Pre Leased Spaces","Food Courts","Restaurants","Multiplexes","SCO Plots"];
const PLOT_TYPES  = ["Residential Plot","Commercial Plot","Agricultural Land","Industrial Plot","Farm House","Other"];
const PROJ_STAT   = ["New Launch","Under Construction","Ready to Move"];
const BEDROOMS    = ["1 RK/1 BHK","2 BHK","3 BHK","4 BHK","4+ BHK"];
const BUY_BUDGET  = ["Under ₹20L","₹20–50L","₹50L–1Cr","₹1–2Cr","₹2–5Cr","Above ₹5Cr"];
const RENT_BUDGET = ["Under ₹5K","₹5–10K","₹10–20K","₹20–40K","₹40–80K","Above ₹80K"];
const POSTED_BY   = ["Owner","Builder","Agent"];
const CONST_ST    = ["Ready to Move","Under Construction","New Launch"];

const CHIPS: Record<Tab, string[]> = {
  "Buy":        ["2 BHK Delhi NCR","Flat in Mumbai","Villa Bangalore","Plot Hyderabad"],
  "Rent":       ["PG in Noida","1 BHK Pune","Furnished Gurgaon","Studio Chennai"],
  "New Launch": ["Projects Mumbai","New Flats Delhi","Launch Noida","Pre-launch Pune"],
  "Commercial": ["Office in BKC","Shop CP Delhi","Warehouse Gurgaon","Cowork Bangalore"],
  "Plots/Land": ["Plot Gurgaon","Farm Pune","Industrial Noida","Land Chennai"],
  "Projects":   ["Luxury Mumbai","Affordable Delhi","Smart City Pune","Integrated Noida"],
};

const PLACEHOLDER: Record<Tab, string> = {
  "Buy":        "City, locality, project name…",
  "Rent":       "City, society, locality…",
  "New Launch": "Search upcoming projects…",
  "Commercial": "Office, shop, warehouse…",
  "Plots/Land": "Search plots by city or area…",
  "Projects":   "Builder, project, city…",
};

const tog = (a: string[], v: string) =>
  a.includes(v) ? a.filter(x => x !== v) : [...a, v];

/* ─── Mini icons ─────────────────────────────────────────────────────────── */
const SearchIco = ({ c = "#94a3b8", s = 16 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const PinIco = ({ c = "#2563EB" }: { c?: string }) => (
  <svg width="14" height="14" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.5" />
  </svg>
);
const MicIco = () => (
  <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);
const XIco = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const ChkIco = () => (
  <svg width="9" height="9" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const ChevIco = ({ up = false }: { up?: boolean }) => (
  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    style={{ display: "inline-block", transition: "transform .18s", transform: up ? "rotate(180deg)" : "none" }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ─── Checkbox ───────────────────────────────────────────────────────────── */
const CB = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", userSelect:"none" }}>
    <div onClick={onChange} style={{
      width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? "#2563EB" : "#cbd5e1"}`,
      background: checked ? "#2563EB" : "white", display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink: 0, transition: "all .15s",
    }}>
      {checked && <ChkIco />}
    </div>
    <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
  </label>
);

/* ─── Portal dropdown — renders fixed so it's never clipped ─────────────── */
const DropPortal: React.FC<{
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  children: React.ReactNode;
}> = ({ anchorRef, open, children }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const r = anchorRef.current.getBoundingClientRect();

    setPos({
      top: r.bottom + 8,  // always below button
      left: r.left,
    });
  }, [open, anchorRef]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
};

/* ─── Dropdown shell style ───────────────────────────────────────────────── */
const dropStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 16px 48px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.07)",
  padding: 20,
  animation: "dropIn .18s cubic-bezier(.22,1,.36,1) both",
};

/* ══════════════════════════════════════════════════════════════════════════ */
const HomeSearch: React.FC = () => {
  const [tab, setTab]             = useState<Tab>("Buy");
  const [query, setQuery]         = useState("");
  const [filter, setFilter]       = useState<Filter>(null);
  const [floating, setFloat]      = useState(false);
  const [mobileOpen, setMob]      = useState(false);
  const [toast, setToast]         = useState<string | null>(null);  // search toast
  const [commMode, setCommMode]   = useState<"Buy" | "Rent">("Buy");

  /* filter state */
  const [resTypes,  setResTypes]  = useState<string[]>(RES_TYPES);
  const [commTypes, setCommTypes] = useState<string[]>(COMM_TYPES);
  const [investOpts,setInvOpts]   = useState<string[]>([]);
  const [plotTypes, setPlotTypes] = useState<string[]>(PLOT_TYPES);
  const [projStat,  setProjStat]  = useState<string[]>(PROJ_STAT);
  const [budgets,   setBudgets]   = useState<string[]>([]);
  const [bedrooms,  setBedrooms]  = useState<string[]>([]);
  const [constSt,   setConstSt]   = useState<string[]>([]);
  const [postedBy,  setPostedBy]  = useState<string[]>([]);

  /* anchor refs for portal dropdowns */
  const heroRef      = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const catBtnRef    = useRef<HTMLButtonElement>(null);
  const budgetBtnRef = useRef<HTMLButtonElement>(null);
  const bedroomBtnRef= useRef<HTMLButtonElement>(null);
  const statusBtnRef = useRef<HTMLButtonElement>(null);
  const postedByRef  = useRef<HTMLButtonElement>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── scroll → sticky ───────────────────────────────────────────────── */
  useEffect(() => {
    const fn = () => {
      if (heroRef.current) setFloat(heroRef.current.getBoundingClientRect().bottom < 60);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── close dropdown on outside click ──────────────────────────────── */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as Node;
      const refs = [catBtnRef, budgetBtnRef, bedroomBtnRef, statusBtnRef, postedByRef];
      if (refs.every(r => !r.current?.contains(t))) setFilter(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const switchTab = (t: Tab) => { setTab(t); setFilter(null); };

  /* ── Search ────────────────────────────────────────────────────────── */
  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) { inputRef.current?.focus(); return; }
    setFilter(null);

    const params = new URLSearchParams({ q, type: tab });
    if (budgets.length)  params.set("budget",   budgets.join(","));
    if (bedrooms.length) params.set("bedroom",  bedrooms.join(","));
    if (constSt.length)  params.set("status",   constSt.join(","));
    if (postedBy.length) params.set("postedBy", postedBy.join(","));
    if (tab === "Commercial") params.set("intent", commMode);

    const url = `/api/v1/search?${params.toString()}`;
    console.log("→ GET", url);
    // Uncomment to navigate:
    // router.push(`/search?${params}`);

    /* show toast */
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(`${tab} · "${q}"`);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, [query, tab, budgets, bedrooms, constSt, postedBy, commMode]);

  const clearFilters = () => {
    setBudgets([]); setBedrooms([]); setConstSt([]); setPostedBy([]);
  };
  const hasFilters = budgets.length + bedrooms.length + constSt.length + postedBy.length > 0;

  const catLabel: Record<Tab, string> = {
    "Buy":"Residential","Rent":"Residential","New Launch":"Residential",
    "Commercial":"Commercial","Plots/Land":"Plots","Projects":"Projects",
  };

  /* ── Category panel content ───────────────────────────────────────── */
  const CatContent = () => {
    if (tab === "Commercial") return (
      <div style={{ ...dropStyle, width: 620, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8" }}>Property Types</span>
            <button style={{ fontSize:10, fontWeight:700, color:"#2563EB", background:"none", border:"none", cursor:"pointer" }}
              onClick={() => setCommTypes(commTypes.length===COMM_TYPES.length?[]:COMM_TYPES)}>
              {commTypes.length===COMM_TYPES.length?"Deselect all":"Select all"}
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", rowGap:10, columnGap:8 }}>
            {COMM_TYPES.map(t=><CB key={t} label={t} checked={commTypes.includes(t)} onChange={()=>setCommTypes(tog(commTypes,t))}/>)}
          </div>
        </div>
        <div style={{ borderLeft:"1px solid #f1f5f9", paddingLeft:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8" }}>Investment Options</span>
            <span style={{ background:"#ef4444", color:"white", fontSize:8, fontWeight:800, padding:"2px 5px", borderRadius:4 }}>NEW</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
            {INVEST_OPTS.map(t=><CB key={t} label={t} checked={investOpts.includes(t)} onChange={()=>setInvOpts(tog(investOpts,t))}/>)}
          </div>
          <p style={{ fontSize:11, color:"#94a3b8", borderTop:"1px solid #f1f5f9", paddingTop:10, margin:0 }}>
            Residential?{" "}
            <button style={{ color:"#2563EB", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontSize:11 }}
              onClick={()=>switchTab("Buy")}>Click here</button>
          </p>
        </div>
      </div>
    );
    if (tab === "Projects") return (
      <div style={{ ...dropStyle, width: 380 }}>
        <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8", marginBottom:12 }}>Project Status</p>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {PROJ_STAT.map(t=><CB key={t} label={t} checked={projStat.includes(t)} onChange={()=>setProjStat(tog(projStat,t))}/>)}
        </div>
        <p style={{ fontSize:11, color:"#94a3b8", borderTop:"1px solid #f1f5f9", paddingTop:10, marginTop:14, marginBottom:0 }}>
          Commercial projects?{" "}
          <button style={{ color:"#2563EB", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontSize:11 }}
            onClick={()=>switchTab("Commercial")}>Click here</button>
        </p>
      </div>
    );
    if (tab === "Plots/Land") return (
      <div style={{ ...dropStyle, width: 360 }}>
        <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8", marginBottom:12 }}>Plot Type</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", rowGap:10 }}>
          {PLOT_TYPES.map(t=><CB key={t} label={t} checked={plotTypes.includes(t)} onChange={()=>setPlotTypes(tog(plotTypes,t))}/>)}
        </div>
      </div>
    );
    return (
      <div style={{ ...dropStyle, width: 480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8" }}>Residential Type</span>
          <button style={{ fontSize:10, fontWeight:700, color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}
            onClick={()=>setResTypes([])}>Clear all</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", rowGap:10 }}>
          {RES_TYPES.map(t=><CB key={t} label={t} checked={resTypes.includes(t)} onChange={()=>setResTypes(tog(resTypes,t))}/>)}
        </div>
        <p style={{ fontSize:11, color:"#94a3b8", borderTop:"1px solid #f1f5f9", paddingTop:10, marginTop:14, marginBottom:0 }}>
          Commercial?{" "}
          <button style={{ color:"#2563EB", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontSize:11 }}
            onClick={()=>switchTab("Commercial")}>Click here</button>
        </p>
      </div>
    );
  };

  /* ── Filter panel content ─────────────────────────────────────────── */
  const BudgetContent = () => {
    const list = tab==="Rent" ? RENT_BUDGET : BUY_BUDGET;
    return (
      <div style={{ ...dropStyle, width: 230 }}>
        <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8", marginBottom:10 }}>Budget</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {list.map(b=>(
            <button key={b} onClick={()=>setBudgets(tog(budgets,b))}
              style={{
                padding:"6px 10px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"none",
                background: budgets.includes(b) ? "#eff6ff" : "#f8fafc",
                color:      budgets.includes(b) ? "#1d4ed8" : "#475569",
                outline:    budgets.includes(b) ? "1.5px solid #2563EB" : "1px solid #e2e8f0",
                transition: "all .12s",
              }}>
              {b}
            </button>
          ))}
        </div>
        {budgets.length>0 && (
          <button style={{ marginTop:10, fontSize:11, fontWeight:700, color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}
            onClick={()=>setBudgets([])}>Clear</button>
        )}
      </div>
    );
  };
  const BedroomContent = () => (
    <div style={{ ...dropStyle, width: 250 }}>
      <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8", marginBottom:10 }}>Bedrooms</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {BEDROOMS.map(b=>(
          <button key={b} onClick={()=>setBedrooms(tog(bedrooms,b))}
            style={{
              padding:"6px 10px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"none",
              background: bedrooms.includes(b) ? "#eff6ff" : "#f8fafc",
              color:      bedrooms.includes(b) ? "#1d4ed8" : "#475569",
              outline:    bedrooms.includes(b) ? "1.5px solid #2563EB" : "1px solid #e2e8f0",
            }}>
            +{b}
          </button>
        ))}
      </div>
      {bedrooms.length>0 && (
        <button style={{ marginTop:10, fontSize:11, fontWeight:700, color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}
          onClick={()=>setBedrooms([])}>Clear</button>
      )}
    </div>
  );
  const StatusContent = () => (
    <div style={{ ...dropStyle, width: 220 }}>
      <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8", marginBottom:10 }}>Status</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {CONST_ST.map(s=><CB key={s} label={s} checked={constSt.includes(s)} onChange={()=>setConstSt(tog(constSt,s))}/>)}
      </div>
    </div>
  );
  const PostedByContent = () => (
    <div style={{ ...dropStyle, width: 190 }}>
      <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"#94a3b8", marginBottom:10 }}>Posted By</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {POSTED_BY.map(p=>(
          <button key={p} onClick={()=>setPostedBy(tog(postedBy,p))}
            style={{
              padding:"6px 10px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"none",
              background: postedBy.includes(p) ? "#eff6ff" : "#f8fafc",
              color:      postedBy.includes(p) ? "#1d4ed8" : "#475569",
              outline:    postedBy.includes(p) ? "1.5px solid #2563EB" : "1px solid #e2e8f0",
            }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Filter pill button ───────────────────────────────────────────── */
  const FilterBtn = ({
    name, label, count, anchorRef,
  }: { name: Filter; label: string; count: number; anchorRef: React.RefObject<HTMLButtonElement | null> }) => {
    const active = filter === name || count > 0;
    return (
      <button
        ref={anchorRef as React.RefObject<HTMLButtonElement>}
        onClick={() => setFilter(filter === name ? null : name)}
        style={{
          display:"flex", alignItems:"center", gap:5,
          padding:"7px 12px", borderRadius:20, fontSize:12, fontWeight:600,
          cursor:"pointer", border:"none", fontFamily:"inherit", whiteSpace:"nowrap",
          background: active ? "#eff6ff" : "white",
          color:      active ? "#1d4ed8" : "#64748b",
          outline:    active ? "1.5px solid #2563EB" : "1px solid #e2e8f0",
          transition:"all .15s",
        }}>
        {label}
        {count > 0 && (
          <span style={{
            minWidth:16, height:16, borderRadius:10, background:"#2563EB", color:"white",
            fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px",
          }}>{count}</span>
        )}
        <ChevIco up={filter === name} />
      </button>
    );
  };

  /* filters per tab */
  type FilterDef = { name: Filter; label: string; count: number; ref: React.RefObject<HTMLButtonElement | null> };
  const filterDefs: FilterDef[] = [
    { name:"budget",   label:"Budget",    count:budgets.length,  ref:budgetBtnRef },
    ...(tab!=="Commercial"&&tab!=="Plots/Land" ? [{ name:"bedroom" as Filter, label:"Bedroom",  count:bedrooms.length, ref:bedroomBtnRef }] : []),
    ...(tab!=="Plots/Land" ? [{ name:"status" as Filter, label:"Status",    count:constSt.length, ref:statusBtnRef }] : []),
    { name:"postedBy", label:"Posted By", count:postedBy.length, ref:postedByRef  },
  ];

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing:border-box; font-family:'DM Sans',sans-serif; }
        .no-sb::-webkit-scrollbar{display:none}
        .no-sb{-ms-overflow-style:none;scrollbar-width:none}

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px) scale(.98)} to{opacity:1;transform:none scale(1)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(12px) scale(.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes toastOut { from{opacity:1} to{opacity:0;transform:translateX(-50%) translateY(-6px)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes shimmerBtn {
          0%  { background-position: -200% center; }
          100%{ background-position:  200% center; }
        }
        @keyframes floatIn { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:none} }

        .ha { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both }
        .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite }
        .toast-in  { animation: toastIn .28s cubic-bezier(.22,1,.36,1) both }
        .toast-out { animation: toastOut .22s ease forwards }
        .float-in  { animation: floatIn .28s cubic-bezier(.22,1,.36,1) both }

        /* ── Chrome tab CSS ──────────────────────────────────────────────
           Active tab: white background, rounded top corners, bottom edge
           merges seamlessly with the white search card below.
           Inactive: transparent, faint hover fill.
        ── */
        .ctab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 18px;
          height: 38px;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,.65);
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          border-radius: 10px 10px 0 0;
          transition: color .15s, background .15s;
          outline: none;
          /* push active tab forward */
          z-index: 1;
        }
        .ctab:hover:not(.ctab-active) {
          background: rgba(255,255,255,.1);
          color: rgba(255,255,255,.9);
        }
        .ctab-active {
          background: white;
          color: #0B3C8C;
          font-weight: 700;
          z-index: 3;
          /* extend 1px downward to cover the card's top border/shadow gap */
          margin-bottom: -1px;
          height: 39px;
        }
        /* subtle curved notch via box-shadow on siblings not needed —
           the rounded border-radius on active tab is enough for Chrome feel */

        /* Search card */
        .search-card {
          background: white;
          border-radius: 0 12px 12px 12px;
          box-shadow: 0 20px 60px rgba(11,60,140,.22), 0 4px 12px rgba(11,60,140,.07);
          position: relative;
          z-index: 2;
        }

        /* Search btn shimmer on active */
        .search-btn {
          background: linear-gradient(135deg,#0B3C8C,#1E40AF 50%,#2563EB);
          background-size: 200% auto;
          transition: background-position .4s, box-shadow .2s, transform .1s;
        }
        .search-btn:hover {
          background-position: right center;
          box-shadow: 0 6px 20px rgba(37,99,235,.45);
          transform: translateY(-1px);
        }
        .search-btn:active { transform: scale(.97); }

        /* Floating sticky bar */
        .sticky-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 400;
          background: rgba(7,27,65,.93);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
      `}</style>

      {/* Portal dropdowns — rendered at body level */}
      <DropPortal anchorRef={catBtnRef as React.RefObject<HTMLElement>} open={filter==="category"}>
        <CatContent />
      </DropPortal>
      <DropPortal anchorRef={budgetBtnRef as React.RefObject<HTMLElement>} open={filter==="budget"}>
        <BudgetContent />
      </DropPortal>
      <DropPortal anchorRef={bedroomBtnRef as React.RefObject<HTMLElement>} open={filter==="bedroom"}>
        <BedroomContent />
      </DropPortal>
      <DropPortal anchorRef={statusBtnRef as React.RefObject<HTMLElement>} open={filter==="status"}>
        <StatusContent />
      </DropPortal>
      <DropPortal anchorRef={postedByRef as React.RefObject<HTMLElement>} open={filter==="postedBy"}>
        <PostedByContent />
      </DropPortal>

      {/* Mobile overlay */}
      <MobileSearchOverlay isOpen={mobileOpen} onClose={() => setMob(false)} initialQuery={query} />

      {/* ── Search toast ─────────────────────────────────────────────────── */}
      {toast && (
        <div className="toast-in" style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, pointerEvents: "none",
          display: "flex", alignItems: "center", gap: 10,
          background: "#0B3C8C", color: "white",
          borderRadius: 40, padding: "10px 20px",
          boxShadow: "0 8px 32px rgba(11,60,140,.4), 0 2px 8px rgba(0,0,0,.2)",
          fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
        }}>
          <span className="pulse-dot" style={{ width:8, height:8, borderRadius:"50%", background:"#34d399", flexShrink:0 }} />
          <SearchIco c="rgba(255,255,255,.6)" s={14} />
          Searching — {toast}
        </div>
      )}

      {/* ── Floating sticky bar ───────────────────────────────────────────── */}
      <div className={`sticky-bar transition-all duration-300 ${floating ? "float-in" : "opacity-0 pointer-events-none -translate-y-full"}`}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
          {/* logo */}
          <a href="/" style={{ textDecoration:"none", flexShrink:0 }}>
            <div style={{
              width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
              background:"linear-gradient(135deg,#1E40AF,#2563EB)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </div>
          </a>
          {/* tab pills */}
          <div className="no-sb" style={{ display:"flex", gap:2, background:"rgba(255,255,255,.1)", borderRadius:24, padding:3, flexShrink:0, overflowX:"auto" }}>
            {TABS.map(({id})=>(
              <button key={id} onClick={()=>switchTab(id)}
                style={{
                  padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight: tab===id ? 700 : 500,
                  cursor:"pointer", border:"none", fontFamily:"inherit", whiteSpace:"nowrap",
                  background: tab===id ? "white" : "transparent",
                  color:      tab===id ? "#1E40AF" : "rgba(255,255,255,.6)",
                  transition:"all .15s",
                }}>
                {id}
              </button>
            ))}
          </div>
          {/* input */}
          <div style={{
            flex:1, display:"flex", alignItems:"center", gap:8,
            background:"white", borderRadius:12, padding:"8px 14px", minWidth:0,
          }}>
            <SearchIco c="#94a3b8" s={14}/>
            <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSearch()}
              placeholder={`Search ${tab}…`}
              style={{ flex:1, border:"none", outline:"none", fontSize:13, color:"#1e293b", background:"transparent", minWidth:0, fontFamily:"inherit" }}/>
            {query&&<button onClick={()=>setQuery("")} style={{ color:"#94a3b8", border:"none", background:"transparent", cursor:"pointer", display:"flex" }}><XIco s={12}/></button>}
          </div>
          <button onClick={handleSearch} className="search-btn"
            style={{ flexShrink:0, padding:"9px 20px", borderRadius:10, fontSize:13, fontWeight:700, color:"white", border:"none", cursor:"pointer" }}>
            Search
          </button>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        position:"relative", display:"flex", flexDirection:"column", alignItems:"center",
        textAlign:"center", padding:"40px 16px 56px",
        background:"linear-gradient(158deg,#071B41 0%,#0B3C8C 40%,#1E40AF 68%,#2563EB 100%)",
        overflow:"visible",
      }}>
        {/* mesh dots */}
        <div aria-hidden style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)",
          backgroundSize:"26px 26px",
        }}/>
        {/* soft glow */}
        <div aria-hidden style={{
          position:"absolute", top:-60, left:"30%", width:400, height:400,
          borderRadius:"50%", filter:"blur(130px)", pointerEvents:"none",
          background:"radial-gradient(circle,rgba(59,130,246,.18),transparent 65%)",
        }}/>

        {/* Badge */}
        <div className="ha" style={{ marginBottom:14, animationDelay:"0s" }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.18)",
            borderRadius:40, padding:"6px 16px", fontSize:11, fontWeight:700,
            letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,.75)",
          }}>
            <span className="pulse-dot" style={{ width:6, height:6, borderRadius:"50%", background:"#34d399" }}/>
            10M+ buyers · 500+ cities
          </span>
        </div>

        {/* Headline */}
        <h1 className="ha" style={{
          fontWeight:800, color:"white", lineHeight:1.08,
          fontSize:"clamp(26px,5.5vw,50px)", maxWidth:620, marginBottom:8,
          animationDelay:"0.07s",
        }}>
          Find Your{" "}
          <span style={{ background:"linear-gradient(90deg,#fde68a,#fb923c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Perfect
          </span>{" "}Home in India
        </h1>

        <p className="ha" style={{
          color:"rgba(255,255,255,.5)", fontSize:14, maxWidth:360, marginBottom:32,
          animationDelay:"0.12s", lineHeight:1.6,
        }}>
          Verified properties across India's top cities — buy, rent or invest.
        </p>

        {/* ── DESKTOP SEARCH WIDGET ────────────────────────────────────────── */}
        <div className="ha" style={{ width:"100%", maxWidth:880, display:"none", animationDelay:"0.17s" }}
          id="desktop-search">
          {/* Chrome-style tabs */}
          <div style={{ display:"flex", alignItems:"flex-end", paddingLeft:8, gap:1 }}>
            {TABS.map(({id, hot})=>(
              <button key={id} onClick={()=>switchTab(id)}
                className={`ctab${tab===id?" ctab-active":""}`}>
                {id}
                {hot && (
                  <span className="pulse-dot" style={{
                    width:6, height:6, borderRadius:"50%", background:"#f87171", flexShrink:0,
                  }}/>
                )}
              </button>
            ))}
          </div>

          {/* Search card */}
          <div className="search-card">
            {/* gradient accent top bar */}
            <div style={{ height:3, borderRadius:"12px 12px 0 0",
              background:"linear-gradient(90deg,#0B3C8C,#1E40AF,#2563EB,#60a5fa)" }}/>

            {/* Main search row */}
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px" }}>

              {/* Commercial intent toggle */}
              {tab==="Commercial" && (
                <div style={{ display:"flex", borderRadius:8, overflow:"hidden", border:"1px solid #e2e8f0", flexShrink:0 }}>
                  {(["Buy","Rent"] as const).map(m=>(
                    <button key={m} onClick={()=>setCommMode(m)} style={{
                      padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", border:"none", fontFamily:"inherit",
                      background: commMode===m ? "linear-gradient(135deg,#1E40AF,#2563EB)" : "white",
                      color: commMode===m ? "white" : "#64748b",
                      transition:"all .15s",
                    }}>{m}</button>
                  ))}
                </div>
              )}

              {/* Category button */}
              <button ref={catBtnRef} onClick={()=>setFilter(filter==="category"?null:"category")}
                style={{
                  display:"flex", alignItems:"center", gap:6, flexShrink:0,
                  padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit",
                  background: filter==="category" ? "#eff6ff" : "#f8fafc",
                  color:      filter==="category" ? "#1d4ed8" : "#475569",
                  outline:    filter==="category" ? "1.5px solid #2563EB" : "1px solid #e2e8f0",
                  border:"none", transition:"all .15s",
                }}>
                {catLabel[tab]}
                <ChevIco up={filter==="category"}/>
              </button>

              {/* divider */}
              <div style={{ width:1, height:28, background:"#e2e8f0", flexShrink:0 }}/>

              {/* Text input */}
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                <SearchIco c="#94a3b8" s={16}/>
                <input ref={inputRef} type="text" value={query}
                  onChange={e=>setQuery(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  placeholder={PLACEHOLDER[tab]}
                  style={{ flex:1, border:"none", outline:"none", fontSize:14, color:"#1e293b", background:"transparent", minWidth:0, fontFamily:"inherit" }}/>
                {query && (
                  <button onClick={()=>setQuery("")} style={{ color:"#94a3b8", border:"none", background:"transparent", cursor:"pointer", display:"flex", flexShrink:0 }}>
                    <XIco/>
                  </button>
                )}
              </div>

              {/* Location + Mic */}
              <button title="Use my location" style={{
                width:34, height:34, borderRadius:8, background:"#f1f5f9", border:"none",
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0,
              }}>
                <PinIco/>
              </button>
              <button title="Voice search" style={{
                width:34, height:34, borderRadius:8, background:"#f1f5f9", border:"none",
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0,
              }}>
                <MicIco/>
              </button>

              {/* Search button */}
              <button onClick={handleSearch} className="search-btn"
                style={{
                  flexShrink:0, display:"flex", alignItems:"center", gap:7,
                  padding:"10px 24px", borderRadius:10, fontSize:14, fontWeight:700,
                  color:"white", border:"none", cursor:"pointer",
                  boxShadow:"0 4px 14px rgba(37,99,235,.38)",
                }}>
                <SearchIco c="white" s={14}/>
                Search
              </button>
            </div>

            {/* Filter pills */}
            <div className="no-sb" style={{ display:"flex", alignItems:"center", gap:8, padding:"0 16px 14px", overflowX:"auto" }}>
              {filterDefs.map(({name,label,count,ref})=>(
                <FilterBtn key={name} name={name} label={label} count={count} anchorRef={ref}/>
              ))}
              {hasFilters && (
                <button onClick={clearFilters} style={{
                  display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700,
                  color:"#ef4444", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", flexShrink:0,
                }}>
                  <XIco s={10}/> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* show desktop search on sm+ */}
        <style>{`@media(min-width:640px){#desktop-search{display:block!important}}`}</style>

        {/* ── MOBILE SEARCH PILL ── */}
        <button onClick={()=>setMob(true)} className="ha"
          style={{
            display:"flex", alignItems:"center", gap:12,
            width:"100%", maxWidth:400, background:"white", borderRadius:18,
            padding:"14px 16px", cursor:"pointer", border:"none",
            boxShadow:"0 10px 36px rgba(11,60,140,.32)",
            animationDelay:"0.17s", marginBottom:18,
          }}
          id="mobile-pill">
          <div style={{
            width:36, height:36, borderRadius:12, flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"linear-gradient(135deg,#0B3C8C,#2563EB)",
          }}>
            <SearchIco c="white" s={16}/>
          </div>
          <div style={{ flex:1, textAlign:"left", minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#0B3C8C", margin:0, marginBottom:2 }}>Search Properties</p>
            <p style={{ fontSize:11, color:"#94a3b8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>City, locality, project, builder…</p>
          </div>
          <span style={{
            background:"#fbbf24", color:"#0B3C8C", fontSize:10, fontWeight:800,
            padding:"6px 10px", borderRadius:8, flexShrink:0,
          }}>GO</span>
        </button>
        <style>{`@media(min-width:640px){#mobile-pill{display:none!important}}`}</style>

        {/* Mobile quick tiles */}
        <div className="ha" style={{ animationDelay:"0.22s" }} id="mobile-tiles">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, width:"100%", maxWidth:400, marginBottom:20 }}>
            {[{l:"Buy",e:"🏠"},{l:"Rent",e:"🔑"},{l:"Projects",e:"🏗️"},{l:"Commercial",e:"🏢"},{l:"PG",e:"🛏️"},{l:"Plots",e:"📐"}].map(t=>(
              <a key={t.l} href="#" style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.14)",
                borderRadius:14, padding:"10px 4px", textDecoration:"none",
              }}>
                <span style={{ fontSize:17 }}>{t.e}</span>
                <span style={{ fontSize:9, fontWeight:700, color:"white" }}>{t.l}</span>
              </a>
            ))}
          </div>
        </div>
        <style>{`@media(min-width:640px){#mobile-tiles{display:none!important}}`}</style>

        {/* Suggestion chips — desktop */}
        <div className="ha" id="chips" style={{ animationDelay:"0.24s" }}>
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:8 }}>
            {CHIPS[tab].map((chip,i)=>(
              <button key={chip} onClick={()=>setQuery(chip)}
                style={{
                  background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.18)",
                  borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:500, color:"white",
                  cursor:"pointer", fontFamily:"inherit", transition:"background .15s",
                  animation:`fadeUp .35s cubic-bezier(.22,1,.36,1) ${i*0.05}s both`,
                }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.18)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,.1)")}>
                {chip}
              </button>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:639px){#chips{display:none!important}}`}</style>

        {/* Stats */}
        <div className="ha" id="stats" style={{ animationDelay:"0.28s" }}>
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:40,
            marginTop:28, paddingTop:24,
            borderTop:"1px solid rgba(255,255,255,.1)",
          }}>
            {[{n:"24L+",l:"Monthly Visitors"},{n:"50K+",l:"Verified Buyers"},{n:"500+",l:"Cities"},{n:"10K+",l:"Deals Closed"}].map(({n,l})=>(
              <div key={l} style={{ textAlign:"center" }}>
                <p style={{ fontSize:20, fontWeight:900, color:"#fde68a", margin:"0 0 3px" }}>{n}</p>
                <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:639px){#stats{display:none!important}}`}</style>
      </section>
    </>
  );
};

export default HomeSearch;