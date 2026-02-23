"use client";

import React, { useState, useRef, useEffect } from "react";

interface Property {
  id: string;
  title: string;
  locality: string;
  price: string;
  type: string;
  bhk?: string;
  area?: string;
  tag?: "Verified" | "New" | "Featured";
  image: string;
}

const RECOMMENDED: Property[] = [
  { id:"1", title:"3 BHK Flat in Sector 150", locality:"Noida",              price:"₹1.2 Cr", type:"Apartment", bhk:"3 BHK", area:"1450 sq.ft", tag:"Verified", image:"linear-gradient(135deg,#0B3C8C,#1E40AF)" },
  { id:"2", title:"2 BHK Ready to Move",      locality:"Gurgaon, Sector 57", price:"₹75 L",   type:"Apartment", bhk:"2 BHK", area:"980 sq.ft",  tag:"New",      image:"linear-gradient(135deg,#1E3A5F,#2563EB)" },
  { id:"3", title:"Independent Villa",        locality:"Whitefield, Bangalore",price:"₹2.8 Cr",type:"Villa",    bhk:"4 BHK", area:"2800 sq.ft", tag:"Featured", image:"linear-gradient(135deg,#0B3C8C,#0D9488)" },
  { id:"4", title:"Studio Apartment",         locality:"Andheri West, Mumbai",price:"₹42 L",  type:"Studio",               area:"420 sq.ft",              image:"linear-gradient(135deg,#1E3A5F,#7C3AED)" },
];

const CITIES = ["Delhi","Mumbai","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Noida","Gurgaon","Ahmedabad"];

const POPULAR = [
  { q:"2 BHK in Delhi",       icon:"🏠", cat:"Buy" },
  { q:"Flats in Mumbai",      icon:"🏢", cat:"Rent" },
  { q:"Villa in Bangalore",   icon:"🌿", cat:"Buy" },
  { q:"PG in Noida",          icon:"🛏️", cat:"PG" },
  { q:"Office Gurgaon",       icon:"💼", cat:"Commercial" },
  { q:"Ready to Move Pune",   icon:"✅", cat:"Buy" },
];

const CATS = ["All","Buy","Rent","Projects","Commercial","PG","Plots"];

// Icons
const Ic = {
  Back: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  X: ({ s=16 }: { s?:number }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Search: ({ c="#94a3b8",s=15 }: { c?:string;s?:number }) => (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Pin: ({ c="#94a3b8" }: { c?:string }) => (
    <svg width="12" height="12" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z"/>
      <circle cx="12" cy="11" r="2.5"/>
    </svg>
  ),
  Star: () => <svg width="10" height="10" fill="#f59e0b" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Heart: ({ f=false }: { f?:boolean }) => (
    <svg width="14" height="14" fill={f?"#ef4444":"none"} stroke={f?"#ef4444":"white"} strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M7 17L17 7M17 7H7M17 7v10"/>
    </svg>
  ),
  Trend: () => (
    <svg width="12" height="12" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
};

// Bottom nav icons
const NavHome   = ({ a }:{a:boolean}) => <svg width="21" height="21" viewBox="0 0 24 24" fill={a?"#0B3C8C":"none"} stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
const NavBar    = ({ a }:{a:boolean}) => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const NavHeart  = ({ a }:{a:boolean}) => <svg width="21" height="21" viewBox="0 0 24 24" fill={a?"#0B3C8C":"none"} stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const NavPerson = ({ a }:{a:boolean}) => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a?"#0B3C8C":"#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;

const BottomNav: React.FC<{ active:string; onChange:(t:string)=>void }> = ({ active, onChange }) => (
  <div className="flex-shrink-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(11,60,140,0.08)]"
    style={{ paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
    <div className="flex items-end h-16">
      {[
        { id:"home",     Icon: NavHome,   label:"Home" },
        { id:"insights", Icon: NavBar,    label:"Insights" },
      ].map(({ id, Icon, label }) => (
        <button key={id} onClick={()=>onChange(id)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full border-none bg-transparent cursor-pointer"
          style={{ WebkitTapHighlightColor:"transparent" }}>
          <Icon a={active===id}/>
          <span className={`text-[10px] font-semibold ${active===id?"text-[#0B3C8C]":"text-slate-400"}`}>{label}</span>
        </button>
      ))}

      {/* FAB */}
      <div className="flex-1 flex flex-col items-center justify-end pb-2 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-white rounded-t-full"/>
        <button onClick={()=>onChange("sell")}
          className="relative -mt-7 rounded-full flex items-center justify-center border-4 border-white cursor-pointer active:scale-95 transition-transform"
          style={{ width:52,height:52,background:"linear-gradient(135deg,#0B3C8C,#1E40AF,#2563EB)",boxShadow:"0 6px 20px rgba(11,60,140,0.35)",WebkitTapHighlightColor:"transparent" }}>
          <svg width="21" height="21" fill="white" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <span className={`text-[10px] font-semibold mt-1 ${active==="sell"?"text-[#0B3C8C]":"text-slate-400"}`}>Post</span>
      </div>

      {[
        { id:"saved",   Icon: NavHeart,  label:"Saved" },
        { id:"profile", Icon: NavPerson, label:"Profile" },
      ].map(({ id, Icon, label }) => (
        <button key={id} onClick={()=>onChange(id)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full border-none bg-transparent cursor-pointer"
          style={{ WebkitTapHighlightColor:"transparent" }}>
          <Icon a={active===id}/>
          <span className={`text-[10px] font-semibold ${active===id?"text-[#0B3C8C]":"text-slate-400"}`}>{label}</span>
        </button>
      ))}
    </div>
  </div>
);

// Property cards
const PropCardV: React.FC<{ p:Property; i:number }> = ({ p, i }) => {
  const [saved, setSaved] = useState(false);
  const tc: Record<string,string> = { Verified:"bg-emerald-500", New:"bg-blue-500", Featured:"bg-amber-500" };
  return (
    <div className="prop-card flex-shrink-0 w-[185px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.97] transition-all cursor-pointer"
      style={{ animationDelay:`${i*0.06}s` }}>
      <div className="relative h-[104px]" style={{ background:p.image }}>
        {p.tag && <span className={`absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${tc[p.tag]}`}>{p.tag==="Verified"&&"✓ "}{p.tag}</span>}
        <button onClick={e=>{e.stopPropagation();setSaved(!saved);}}
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

const PropCardH: React.FC<{ p:Property; i:number }> = ({ p, i }) => {
  const [saved, setSaved] = useState(false);
  const tc: Record<string,string> = { Verified:"bg-emerald-500", New:"bg-blue-500", Featured:"bg-amber-500" };
  return (
    <div className="prop-card flex gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.985] transition-all cursor-pointer"
      style={{ animationDelay:`${0.06+i*0.05}s` }}>
      <div className="relative w-[104px] flex-shrink-0 min-h-[90px]" style={{ background:p.image }}>
        {p.tag && <span className={`absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${tc[p.tag]}`}>{p.tag==="Verified"&&"✓ "}{p.tag}</span>}
        <button onClick={e=>{e.stopPropagation();setSaved(!saved);}}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-black/25 rounded-full border-none cursor-pointer">
          <Ic.Heart f={saved}/>
        </button>
      </div>
      <div className="flex-1 py-3 pr-3 min-w-0">
        <p className="text-[13px] font-semibold text-[#0B3C8C] leading-tight truncate mb-0.5">{p.title}</p>
        <p className="text-[11px] text-slate-400 truncate mb-2 flex items-center gap-1"><Ic.Pin c="#94a3b8"/>{p.locality}</p>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {p.bhk && <span className="text-[10px] font-semibold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded-full">{p.bhk}</span>}
          {p.area && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.area}</span>}
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.type}</span>
        </div>
        <p className="text-[14px] font-bold text-[#0B3C8C]">{p.price}</p>
      </div>
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const MobileSearchOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}> = ({ isOpen, onClose, initialQuery="" }) => {
  const [q, setQ]     = useState(initialQuery);
  const [cat, setCat] = useState("All");
  const [results, setResults] = useState(false);
  const [navTab, setNavTab]   = useState("home");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQ(initialQuery); setResults(false);
      setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *{font-family:'DM Sans',sans-serif;box-sizing:border-box}
        @keyframes slideUp2{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes cBounce{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes pr2{0%,100%{opacity:1}50%{opacity:0.35}}
        .ov2{animation:slideUp2 .22s cubic-bezier(.22,1,.36,1) both}
        .prop-card{animation:cardIn .3s cubic-bezier(.22,1,.36,1) both}
        .cb2{animation:cBounce .35s cubic-bezier(.34,1.56,.64,1) both}
        .pr2{animation:pr2 1.6s ease-in-out infinite}
        .no-sb::-webkit-scrollbar{display:none}
        .no-sb{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="ov2 flex flex-col h-full">

        {/* ── DARK GLASS HEADER ── */}
        <div className="flex-shrink-0 relative overflow-hidden"
          style={{ background:"linear-gradient(160deg,#071B41 0%,#0B3C8C 50%,#1E40AF 100%)" }}>
          {/* Mesh texture */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden
            style={{ backgroundImage:"radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize:"20px 20px" }}/>
          {/* Glow orb */}
          <div className="absolute -top-10 right-0 w-[180px] h-[180px] rounded-full blur-[70px] pointer-events-none"
            style={{ background:"radial-gradient(circle,rgba(59,130,246,.28),transparent 65%)" }}/>

          <div className="relative px-4 pt-4 pb-5">
            {/* Nav row */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={onClose}
                className="flex items-center gap-2 text-white/80 hover:text-white bg-white/10 border border-white/15 rounded-xl px-3 py-2 cursor-pointer border-none font-[inherit] active:scale-[0.97]"
                style={{ WebkitTapHighlightColor:"transparent" }}>
                <Ic.Back/>
                <span className="text-[13px] font-semibold">Back</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pr2"/>
                <span className="text-[10px] font-black tracking-[0.18em] uppercase text-white/55">Find Properties</span>
              </div>

              <button onClick={onClose}
                className="text-white/55 hover:text-white bg-white/10 p-2 rounded-xl cursor-pointer border-none transition-all"
                style={{ WebkitTapHighlightColor:"transparent" }}>
                <Ic.X s={15}/>
              </button>
            </div>

            {/* Search input */}
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-3 border border-white/20"
              style={{ background:"rgba(255,255,255,0.12)", backdropFilter:"blur(12px)", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>
              <Ic.Search c="rgba(255,255,255,0.45)" s={16}/>
              <input ref={inputRef} type="text" value={q}
                onChange={e=>{ setQ(e.target.value); if(results&&e.target.value.length===0) setResults(false); }}
                onKeyDown={e=>{ if(e.key==="Enter") setResults(true); }}
                placeholder="City, locality, project..."
                className="flex-1 border-none outline-none bg-transparent text-white placeholder-white/40 font-[inherit]"
                style={{ fontSize:"16px" }}/>
              {q && (
                <button onClick={()=>{ setQ(""); setResults(false); }}
                  className="text-white/45 hover:text-white border-none bg-transparent cursor-pointer p-0.5">
                  <Ic.X s={14}/>
                </button>
              )}
            </div>

            {/* Category pill bar */}
            <div className="flex gap-1.5 overflow-x-auto no-sb pb-0.5 mb-3">
              {CATS.map(c=>(
                <button key={c} onClick={()=>setCat(c)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer font-[inherit]
                    ${cat===c?"bg-white text-[#0B3C8C] border-white shadow-sm":"bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"}`}
                  style={{ WebkitTapHighlightColor:"transparent" }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Search CTA */}
            <button onClick={()=>setResults(true)}
              className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-[#0B3C8C] border-none cursor-pointer active:scale-[0.98] transition-all font-[inherit]"
              style={{ background:"linear-gradient(135deg,#fde68a,#f59e0b,#d97706)", boxShadow:"0 4px 16px rgba(245,158,11,.4)", WebkitTapHighlightColor:"transparent" }}>
              🔍 Search {cat!=="All"?`${cat} `:``}Properties
            </button>
          </div>
        </div>

        {/* ── SCROLL BODY ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ background:"#F8FAFC" }}>

          {/* RESULTS */}
          {results ? (
            <div className="px-4 pt-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-bold text-[#0B3C8C]">
                    {q ? `"${q}"` : "All Properties"}
                    {cat!=="All" && <span className="text-slate-400 font-normal text-[13px]"> · {cat}</span>}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{RECOMMENDED.length} properties found</p>
                </div>
                <button onClick={()=>setResults(false)}
                  className="text-[11px] font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full cursor-pointer font-[inherit]"
                  style={{ WebkitTapHighlightColor:"transparent" }}>
                  ← Edit
                </button>
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-3 no-sb mb-4">
                {["Price ↓","BHK","Area","✓ Verified","Ready Now","New Launch"].map(f=>(
                  <button key={f}
                    className="flex-shrink-0 text-[11px] font-semibold text-[#0B3C8C] border border-slate-200 bg-white px-3 py-1.5 rounded-full active:bg-blue-50 active:border-[#2563EB] active:text-[#1D4ED8] cursor-pointer font-[inherit] transition-all">
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {RECOMMENDED.map((p,i)=><PropCardH key={p.id} p={p} i={i}/>)}
              </div>

              <button className="w-full mt-5 py-3.5 rounded-2xl text-[13px] font-semibold text-[#1E40AF] border-2 border-blue-200 bg-white active:bg-blue-50 cursor-pointer font-[inherit] transition-all">
                Load More Properties
              </button>
            </div>

          ) : (
            /* DISCOVER / IDLE */
            <div className="px-4 pt-5 pb-6">

              {/* Recommended horizontal scroll */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-xl flex items-center justify-center"
                      style={{ background:"linear-gradient(135deg,#0B3C8C,#2563EB)" }}>
                      <Ic.Star/>
                    </div>
                    <span className="text-[13px] font-black text-[#0B3C8C]">Recommended for You</span>
                  </div>
                  <button className="text-[11px] font-bold text-[#2563EB] cursor-pointer border-none bg-transparent font-[inherit]">
                    View all →
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-sb">
                  {RECOMMENDED.map((p,i)=><PropCardV key={p.id} p={p} i={i}/>)}
                </div>
              </div>

              {/* Trending searches */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100">
                    <Ic.Trend/>
                  </div>
                  <span className="text-[13px] font-black text-[#0B3C8C]">Trending Searches</span>
                </div>
                <div className="flex flex-col gap-2">
                  {POPULAR.map((item,i)=>(
                    <button key={item.q} onClick={()=>{ setQ(item.q); setResults(true); }}
                      className="cb2 flex items-center gap-3 w-full text-left px-4 py-3.5 bg-white rounded-2xl border border-slate-100 active:bg-blue-50 active:border-blue-200 transition-all cursor-pointer font-[inherit] shadow-sm"
                      style={{ animationDelay:`${i*0.05}s`, WebkitTapHighlightColor:"transparent" }}>
                      {/* Icon tile */}
                      <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: i%3===0 ? "linear-gradient(135deg,#EFF6FF,#DBEAFE)" : i%3===1 ? "linear-gradient(135deg,#F0FDF4,#DCFCE7)" : "linear-gradient(135deg,#FFFBEB,#FEF3C7)" }}>
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

              {/* Browse by city */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-100">
                    <Ic.Pin c="#f59e0b"/>
                  </div>
                  <span className="text-[13px] font-black text-[#0B3C8C]">Browse by City</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c,i)=>(
                    <button key={c} onClick={()=>setQ(`Property in ${c}`)}
                      className="cb2 px-4 py-2.5 rounded-full text-[12px] font-semibold border border-slate-200 bg-white text-[#0B3C8C] active:bg-blue-50 active:border-[#2563EB] active:text-[#1D4ED8] transition-all cursor-pointer font-[inherit] shadow-sm"
                      style={{ animationDelay:`${0.3+i*0.03}s`, WebkitTapHighlightColor:"transparent" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <BottomNav active={navTab} onChange={setNavTab}/>
      </div>
    </div>
  );
};

export default MobileSearchOverlay;