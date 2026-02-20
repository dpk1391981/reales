"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FormData {
  propertyCategory: string;
  listingType: string;
  plan: string;
  residentialType: string;
  commercialType: string;
  industrialType: string;
  bhk: string;
  area: string;
  price: string;
  description: string;
  city: string;
  locality: string;
  society: string;
  pincode: string;
  photos: string[];
  virtualTour: boolean;
  hideNumber: boolean;
  ownerName: string;
  ownerPhone: string;
  negotiable: boolean;
  urgent: boolean;
  loanAvailable: boolean;
  featured: boolean;
  bathrooms: number;
  balconies: number;
  furnishing: string;
  facing: string;
  age: string;
  amenities: string[];
  deposit: string;
  maintenance: string;
  projectName: string;
  builderName: string;
  rera: string;
  powerLoad: string;
  roadWidth: string;
  cabins: string;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "residential", label: "Residential", icon: "🏠", color: "#0f2342" },
  { value: "commercial",  label: "Commercial",  icon: "🏢", color: "#1e40af" },
  { value: "industrial",  label: "Industrial",  icon: "🏭", color: "#7c3aed" },
  { value: "pg",          label: "PG / Co-living", icon: "🛏️", color: "#0891b2" },
  { value: "project",     label: "New Project", icon: "🏗️", color: "#059669" },
];

const LISTING = [
  { value: "sell", label: "Sell",       icon: "📈" },
  { value: "rent", label: "Rent/Lease", icon: "🔑" },
  { value: "pg",   label: "PG",         icon: "🛏️" },
];

const RES_TYPES   = ["Flat / Apartment","Independent House","Villa","Builder Floor","Residential Plot","Farm House"];
const COM_TYPES   = ["Office Space","IT Park / SEZ","Shop / Showroom","Warehouse / Godown","Co-working Space","Commercial Plot"];
const IND_TYPES   = ["Factory / Manufacturing","Warehouse","Cold Storage","Industrial Land","Industrial Shed"];
const BHK         = ["1 RK","1 BHK","2 BHK","3 BHK","4 BHK","4+ BHK"];
const CITIES      = ["Delhi","Mumbai","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Noida","Gurgaon","Ahmedabad"];
const FACING_OPT  = ["East","West","North","South","North-East","North-West","South-East","South-West"];
const AMENITIES   = ["Lift","Parking","Power Backup","Security","Gymnasium","Swimming Pool","Club House","Garden / Park","Gated Society","CCTV","Intercom","Visitor Parking","Children's Play Area","Jogging Track"];
const FURNISHING  = [
  { v:"unfurnished",    l:"Unfurnished",   icon:"🪑" },
  { v:"semi-furnished", l:"Semi Furnished", icon:"🛋️" },
  { v:"fully-furnished",l:"Fully Furnished",icon:"🛏️" },
];

const PLANS = [
  {
    key:"silver", name:"Silver", price:"₹999", tag:"Starter",
    perks:["20 Active Listings","Normal Ranking","WhatsApp Leads","Dashboard Access"],
    gradient:"linear-gradient(135deg,#94a3b8 0%,#64748b 100%)",
    highlight:false,
  },
  {
    key:"gold", name:"Gold", price:"₹1,999", tag:"Most Popular",
    perks:["30 Active Listings","Priority Ranking","HD Photo Boost","Featured Badge","Contact Analytics"],
    gradient:"linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
    highlight:true,
  },
  {
    key:"platinum", name:"Platinum", price:"₹3,999", tag:"Power User",
    perks:["Unlimited Listings","Top Ranking","HD + Virtual Tour","Multiple Featured","Full Analytics","Dedicated Support"],
    gradient:"linear-gradient(135deg,#0f2342 0%,#1e40af 100%)",
    highlight:false,
  },
];

const STEPS = [
  { id:1, label:"Property Type", icon:"🏠" },
  { id:2, label:"Details",       icon:"📋" },
  { id:3, label:"Location",      icon:"📍" },
  { id:4, label:"Media",         icon:"📸" },
  { id:5, label:"Contact",       icon:"👤" },
];

const INITIAL: FormData = {
  propertyCategory:"residential", listingType:"sell", plan:"free",
  residentialType:"", commercialType:"", industrialType:"", bhk:"",
  area:"", price:"", description:"", city:"", locality:"", society:"",
  pincode:"", photos:[], virtualTour:false, hideNumber:false, ownerName:"",
  ownerPhone:"", negotiable:false, urgent:false, loanAvailable:false,
  featured:false, bathrooms:2, balconies:1, furnishing:"", facing:"",
  age:"", amenities:[], deposit:"", maintenance:"", projectName:"",
  builderName:"", rera:"", powerLoad:"", roadWidth:"", cabins:"",
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtPrice = (v: string) => {
  const n = parseInt(v, 10);
  if (isNaN(n) || n === 0) return "";
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = {
  Check: ({s=14,c="currentColor"}:{s?:number,c?:string}) => (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
  ),
  ChevD: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>,
  ChevR: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>,
  ChevL: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>,
  Upload: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Map: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Save: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  Minus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>,
  Star: ({f=false}:{f?:boolean}) => <svg width="14" height="14" fill={f?"#f59e0b":"none"} stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Eye: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Video: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Spark: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Phone: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 010 2.13 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const inp = "w-full bg-white/80 backdrop-blur-sm border-2 border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-medium text-[#0f2342] placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all duration-200";
const sel = `${inp} appearance-none cursor-pointer pr-10`;

const Lbl = ({c, req}:{c:React.ReactNode;req?:boolean}) => (
  <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">
    {c}{req && <span className="text-rose-400 text-xs">•</span>}
  </label>
);

const Field = ({label,req,children,hint}:{label:string;req?:boolean;children:React.ReactNode;hint?:string}) => (
  <div className="mb-4">
    <Lbl c={label} req={req}/>
    {children}
    {hint && <p className="text-[10px] text-slate-400 mt-1.5 ml-1">{hint}</p>}
  </div>
);

const SelWrap = ({v,onChange,opts,ph}:{v:string;onChange:(s:string)=>void;opts:string[];ph:string}) => (
  <div className="relative">
    <select value={v} onChange={e=>onChange(e.target.value)} className={sel} style={{fontSize:"16px"}}>
      <option value="">{ph}</option>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Ico.ChevD/></span>
  </div>
);

const Pill = ({label,selected,onClick,icon,size="md"}:{label:string;selected:boolean;onClick:()=>void;icon?:string;size?:"sm"|"md"}) => (
  <button onClick={onClick}
    className={`flex items-center gap-1.5 font-bold rounded-2xl border-2 transition-all duration-200 cursor-pointer font-[inherit] active:scale-95 whitespace-nowrap
      ${size==="sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"}
      ${selected
        ? "border-[#0f2342] bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white shadow-[0_4px_16px_rgba(15,35,66,0.3)]"
        : "border-slate-200 bg-white/80 text-slate-600 hover:border-[#0f2342]/30 hover:bg-[#0f2342]/5"
      }`}
    style={{WebkitTapHighlightColor:"transparent"}}>
    {icon && <span className="text-base leading-none">{icon}</span>}{label}
  </button>
);

const Counter = ({label,v,set,min=0,max=20}:{label:string;v:number;set:(n:number)=>void;min?:number;max?:number}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <span className="text-sm font-semibold text-slate-600">{label}</span>
    <div className="flex items-center gap-0 bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden">
      <button onClick={()=>set(Math.max(min,v-1))} className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer" style={{WebkitTapHighlightColor:"transparent"}}><Ico.Minus/></button>
      <span className="w-10 text-center text-sm font-black text-[#0f2342]">{v}</span>
      <button onClick={()=>set(Math.min(max,v+1))} className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer" style={{WebkitTapHighlightColor:"transparent"}}><Ico.Plus/></button>
    </div>
  </div>
);

// ─── AUTO-SAVE INDICATOR ──────────────────────────────────────────────────────
const AutoSaveIndicator = ({status}:{status:"idle"|"saving"|"saved"|"error"}) => (
  <div className={`flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-300 ${
    status==="saving" ? "text-amber-500" :
    status==="saved"  ? "text-emerald-500" :
    status==="error"  ? "text-rose-400" : "text-slate-400"
  }`}>
    {status==="saving" && <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
    {status==="saved"  && <Ico.Check s={11} c="#10b981"/>}
    {status==="error"  && "⚠"}
    {status==="saving" && "Saving..."}
    {status==="saved"  && "Draft saved"}
    {status==="error"  && "Save failed"}
    {status==="idle"   && "Auto-save on"}
  </div>
);

// ─── STEP PROGRESS BAR ────────────────────────────────────────────────────────
const StepBar = ({step,total,onJump}:{step:number;total:number;onJump:(n:number)=>void}) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    {STEPS.map((s,i)=>{
      const done = s.id < step, active = s.id === step;
      return (
        <div key={s.id} className="flex items-center gap-1.5 sm:gap-2 flex-1 last:flex-none">
          <button onClick={()=>done && onJump(s.id)}
            className={`flex items-center gap-1.5 flex-shrink-0 transition-all duration-300 border-none bg-transparent cursor-pointer font-[inherit] p-0`}
            style={{WebkitTapHighlightColor:"transparent"}}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-all duration-300 border-2
              ${done   ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
              : active ? "bg-[#0f2342] border-[#0f2342] text-white shadow-[0_2px_12px_rgba(15,35,66,0.4)]"
              :          "bg-white border-slate-200 text-slate-400"}`}>
              {done ? <Ico.Check s={11} c="white"/> : <span className="text-[10px]">{s.icon}</span>}
            </div>
            <span className={`hidden sm:block text-[11px] font-bold transition-colors ${active?"text-[#0f2342]":done?"text-emerald-500":"text-slate-400"}`}>
              {s.label}
            </span>
          </button>
          {i < STEPS.length-1 && (
            <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-slate-200 min-w-[12px]">
              <div className={`h-full rounded-full transition-all duration-500 ${s.id<step?"bg-emerald-400":"bg-transparent"}`} style={{width:s.id<step?"100%":"0%"}}/>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// ─── CATEGORY SELECTOR (Step 1) ───────────────────────────────────────────────
const Step1 = ({d,s}:{d:FormData;s:(k:string,v:any)=>void}) => (
  <div className="fade-step">
    <div className="text-center mb-8">
      <p className="text-xs font-black tracking-[0.2em] uppercase text-amber-500 mb-2">Step 1 of 5</p>
      <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0f2342]">What are you listing?</h2>
      <p className="text-slate-500 text-sm mt-2">Choose your property category and listing intent</p>
    </div>

    {/* Category cards */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      {CATEGORIES.map(cat=>(
        <button key={cat.value} onClick={()=>s("propertyCategory",cat.value)}
          className={`relative flex flex-col items-center gap-2 py-5 px-3 rounded-3xl border-2 font-semibold text-sm
            transition-all duration-200 cursor-pointer font-[inherit] active:scale-[0.97] overflow-hidden group
            ${d.propertyCategory===cat.value
              ? "border-[#0f2342] bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] text-white shadow-[0_8px_32px_rgba(15,35,66,0.25)]"
              : "border-slate-200 bg-white/90 text-slate-700 hover:border-[#0f2342]/40 hover:shadow-md"
            }`}
          style={{WebkitTapHighlightColor:"transparent"}}>
          {d.propertyCategory===cat.value && (
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white"/>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white"/>
            </div>
          )}
          <span className="text-3xl relative z-10">{cat.icon}</span>
          <span className="text-xs font-bold text-center leading-tight relative z-10">{cat.label}</span>
          {d.propertyCategory===cat.value && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
              <Ico.Check s={10} c="#0f2342"/>
            </div>
          )}
        </button>
      ))}
    </div>

    {/* Listing type — sell/rent/pg */}
    <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-3xl p-5 border border-slate-200 mb-6">
      <p className="text-xs font-black tracking-[0.15em] uppercase text-slate-500 mb-3">Listing Intent</p>
      <div className="flex flex-wrap gap-2">
        {LISTING.map(t=>(
          <button key={t.value} onClick={()=>s("listingType",t.value)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 font-bold text-sm
              transition-all duration-200 cursor-pointer font-[inherit] active:scale-95
              ${d.listingType===t.value
                ? "border-amber-400 bg-amber-50 text-amber-700 shadow-[0_2px_12px_rgba(245,158,11,0.2)]"
                : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
              }`}
            style={{WebkitTapHighlightColor:"transparent"}}>
            <span className="text-lg">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </div>

    {/* Plan toggle */}
    <div>
      <p className="text-xs font-black tracking-[0.15em] uppercase text-slate-500 mb-3">Listing Plan</p>
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl mb-4">
        {["free","paid"].map(p=>(
          <button key={p} onClick={()=>s("plan",p)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer border-none font-[inherit]
              ${d.plan===p
                ? p==="free"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-[0_2px_12px_rgba(245,158,11,0.4)]"
                : "bg-transparent text-slate-400"
              }`}
            style={{WebkitTapHighlightColor:"transparent"}}>
            {p==="free" ? "🆓 Free Listing" : "⚡ Paid Listing"}
          </button>
        ))}
      </div>

      {d.plan==="paid" && (
        <div className="grid gap-3">
          {PLANS.map(plan=>(
            <div key={plan.key} onClick={()=>s("selectedPlan",plan.key)}
              className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${(d as any).selectedPlan===plan.key ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-200"}`}
              style={{WebkitTapHighlightColor:"transparent"}}>
              {plan.highlight && (
                <div className="absolute -top-2.5 left-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-black"
                style={{background:plan.gradient}}>
                {plan.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0f2342]">{plan.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {plan.perks.slice(0,3).map(p=>(
                    <span key={p} className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{p}</span>
                  ))}
                  {plan.perks.length>3 && <span className="text-[9px] font-semibold text-slate-400">+{plan.perks.length-3} more</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-black text-[#0f2342]">{plan.price}</p>
                <p className="text-[10px] text-slate-400">/ listing</p>
              </div>
              {(d as any).selectedPlan===plan.key && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                  <Ico.Check s={10} c="#0f2342"/>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── PROPERTY DETAILS (Step 2) ────────────────────────────────────────────────
const Step2 = ({d,s}:{d:FormData;s:(k:string,v:any)=>void}) => {
  const isRes = d.propertyCategory==="residential";
  const isCom = d.propertyCategory==="commercial";
  const isInd = d.propertyCategory==="industrial";
  const isPrj = d.propertyCategory==="project";
  const isPG  = d.propertyCategory==="pg";
  const isRnt = d.listingType==="rent"||d.listingType==="pg";
  const amen: string[] = d.amenities||[];

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-amber-500 mb-2">Step 2 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0f2342]">Property Details</h2>
        <p className="text-slate-500 text-sm mt-2">Tell buyers exactly what you're offering</p>
      </div>

      {/* Type selector */}
      {isRes && <Field label="Property Type" req><SelWrap v={d.residentialType} onChange={v=>s("residentialType",v)} opts={RES_TYPES} ph="Select property type"/></Field>}
      {isCom && <Field label="Commercial Type" req><SelWrap v={d.commercialType} onChange={v=>s("commercialType",v)} opts={COM_TYPES} ph="Select commercial type"/></Field>}
      {isInd && <Field label="Industrial Type" req><SelWrap v={d.industrialType} onChange={v=>s("industrialType",v)} opts={IND_TYPES} ph="Select industrial type"/></Field>}
      {isPrj && (
        <>
          <Field label="Project Name" req><input type="text" value={d.projectName} onChange={e=>s("projectName",e.target.value)} placeholder="e.g. DLF The Crest" className={inp} style={{fontSize:"16px"}}/></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Builder Name"><input type="text" value={d.builderName} onChange={e=>s("builderName",e.target.value)} placeholder="Builder name" className={inp} style={{fontSize:"16px"}}/></Field>
            <Field label="RERA Number"><input type="text" value={d.rera} onChange={e=>s("rera",e.target.value)} placeholder="RERA/KA/..." className={inp} style={{fontSize:"16px"}}/></Field>
          </div>
        </>
      )}

      {/* BHK */}
      {(isRes||isPG) && (
        <Field label="BHK / Room Type">
          <div className="flex flex-wrap gap-2">
            {BHK.map(b=><Pill key={b} label={b} selected={d.bhk===b} onClick={()=>s("bhk",b)}/>)}
          </div>
        </Field>
      )}

      {/* Area + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Area" req>
          <div className="relative">
            <input type="number" value={d.area} onChange={e=>s("area",e.target.value)} placeholder="e.g. 1200" className={`${inp} pr-14`} style={{fontSize:"16px"}}/>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">sq.ft</span>
          </div>
        </Field>
        <Field label={isRnt?"Monthly Rent":"Expected Price"} req>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
            <input type="number" value={d.price} onChange={e=>s("price",e.target.value)} placeholder={isRnt?"25000":"7500000"} className={`${inp} pl-8`} style={{fontSize:"16px"}}/>
          </div>
          {d.price && <p className="text-xs font-black text-amber-600 mt-1.5 ml-1 animate-pulse">{fmtPrice(d.price)}</p>}
        </Field>
      </div>

      {/* Counters */}
      {(isRes||isPG) && (
        <div className="bg-white/80 rounded-2xl border-2 border-slate-200 px-4 py-1 mb-4">
          <Counter label="Bathrooms" v={d.bathrooms} set={v=>s("bathrooms",v)} min={1} max={10}/>
          <Counter label="Balconies" v={d.balconies} set={v=>s("balconies",v)} min={0} max={6}/>
        </div>
      )}

      {/* Furnishing */}
      {(isRes||isPG) && (
        <Field label="Furnishing Status">
          <div className="grid grid-cols-3 gap-2">
            {FURNISHING.map(f=>(
              <button key={f.v} onClick={()=>s("furnishing",f.v)}
                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border-2 font-bold text-xs text-center transition-all cursor-pointer font-[inherit] active:scale-95
                  ${d.furnishing===f.v ? "border-[#0f2342] bg-[#0f2342]/5 text-[#0f2342] shadow-[0_2px_12px_rgba(15,35,66,0.12)]" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
                style={{WebkitTapHighlightColor:"transparent"}}>
                <span className="text-2xl">{f.icon}</span>{f.l}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Rent extras */}
      {isRnt && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Security Deposit">
            <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₹</span>
            <input type="number" value={d.deposit} onChange={e=>s("deposit",e.target.value)} placeholder="100000" className={`${inp} pl-8`} style={{fontSize:"16px"}}/></div>
          </Field>
          <Field label="Maintenance /mo">
            <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₹</span>
            <input type="number" value={d.maintenance} onChange={e=>s("maintenance",e.target.value)} placeholder="2000" className={`${inp} pl-8`} style={{fontSize:"16px"}}/></div>
          </Field>
        </div>
      )}

      {/* Industrial */}
      {isInd && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Electricity Load (KW)"><input type="number" value={d.powerLoad} onChange={e=>s("powerLoad",e.target.value)} placeholder="200" className={inp} style={{fontSize:"16px"}}/></Field>
          <Field label="Road Width (ft)"><input type="number" value={d.roadWidth} onChange={e=>s("roadWidth",e.target.value)} placeholder="40" className={inp} style={{fontSize:"16px"}}/></Field>
        </div>
      )}
      {isCom && <Field label="Cabins / Seats"><input type="text" value={d.cabins} onChange={e=>s("cabins",e.target.value)} placeholder="e.g. 10 Cabins, 50 Seats" className={inp} style={{fontSize:"16px"}}/></Field>}

      {/* Facing + Age */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Facing"><SelWrap v={d.facing} onChange={v=>s("facing",v)} opts={FACING_OPT} ph="Select"/></Field>
        <Field label="Property Age"><SelWrap v={d.age} onChange={v=>s("age",v)} opts={["Under Construction","0-1 Year","1-5 Years","5-10 Years","10+ Years"]} ph="Select"/></Field>
      </div>

      {/* Amenities */}
      <Field label="Amenities" hint="Select everything that applies — more amenities = more enquiries">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a=>{
            const sel2=amen.includes(a);
            return (
              <button key={a} onClick={()=>s("amenities",sel2?amen.filter(x=>x!==a):[...amen,a])}
                className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all cursor-pointer font-[inherit] active:scale-95
                  ${sel2 ? "border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.2)]" : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300"}`}
                style={{WebkitTapHighlightColor:"transparent"}}>
                {sel2?"✓ ":""}{a}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Description */}
      <Field label="Description" hint="Properties with detailed descriptions get 3x more views">
        <textarea value={d.description} onChange={e=>s("description",e.target.value)}
          placeholder="Describe your property — nearby landmarks, special features, why it's a great buy..."
          rows={4} className={`${inp} resize-none leading-relaxed`} style={{fontSize:"16px"}}/>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] text-slate-400">Min 50 characters recommended</p>
          <p className={`text-[10px] font-bold ${d.description.length>50?"text-emerald-500":"text-slate-400"}`}>{d.description.length}/1000</p>
        </div>
      </Field>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          {k:"negotiable",    l:"Price Negotiable",    icon:"💬"},
          {k:"urgent",        l:"Urgent Sale / Rent",  icon:"⚡"},
          {k:"loanAvailable", l:"Loan Available",      icon:"🏦"},
          {k:"featured",      l:"Feature This Listing",icon:"⭐"},
        ].map(({k,l,icon})=>(
          <label key={k} className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all
            ${(d as any)[k] ? "border-[#0f2342]/30 bg-[#0f2342]/5" : "border-slate-200 bg-white hover:border-[#0f2342]/20"}`}>
            <span className="text-lg flex-shrink-0">{icon}</span>
            <span className="text-sm font-semibold text-slate-700 flex-1">{l}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${(d as any)[k] ? "border-[#0f2342] bg-[#0f2342]" : "border-slate-300"}`}>
              {(d as any)[k] && <Ico.Check s={10} c="white"/>}
            </div>
            <input type="checkbox" checked={(d as any)[k]||false} onChange={e=>s(k,e.target.checked)} className="hidden"/>
          </label>
        ))}
      </div>
    </div>
  );
};

// ─── LOCATION (Step 3) ────────────────────────────────────────────────────────
const Step3 = ({d,s}:{d:FormData;s:(k:string,v:any)=>void}) => (
  <div className="fade-step">
    <div className="text-center mb-8">
      <p className="text-xs font-black tracking-[0.2em] uppercase text-amber-500 mb-2">Step 3 of 5</p>
      <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0f2342]">Location Details</h2>
      <p className="text-slate-500 text-sm mt-2">Help buyers find your property easily</p>
    </div>

    {/* City pills */}
    <Field label="City" req>
      <div className="flex flex-wrap gap-2 mb-2">
        {CITIES.slice(0,6).map(c=><Pill key={c} label={c} selected={d.city===c} onClick={()=>s("city",c)}/>)}
      </div>
      <SelWrap v={d.city} onChange={v=>s("city",v)} opts={CITIES} ph="Or choose from all cities"/>
    </Field>

    <Field label="Locality / Sector" req hint="Be specific — 'Sector 54 Gurgaon' beats just 'Gurgaon'">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"><Ico.Map/></span>
        <input type="text" value={d.locality} onChange={e=>s("locality",e.target.value)} placeholder="e.g. Sector 62, Whitefield, Bandra West" className={`${inp} pl-9`} style={{fontSize:"16px"}}/>
      </div>
    </Field>

    <Field label="Society / Project Name">
      <input type="text" value={d.society} onChange={e=>s("society",e.target.value)} placeholder="e.g. DLF The Crest, Prestige Shantiniketan" className={inp} style={{fontSize:"16px"}}/>
    </Field>

    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Field label="Pin Code" req>
          <input type="number" value={d.pincode} onChange={e=>s("pincode",e.target.value.slice(0,6))} placeholder="e.g. 201301" className={inp} style={{fontSize:"16px"}}/>
        </Field>
      </div>
      <div className="mb-4">
        <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white text-xs font-bold rounded-2xl border-none cursor-pointer active:scale-95 transition-all whitespace-nowrap shadow-[0_4px_16px_rgba(15,35,66,0.2)]"
          style={{WebkitTapHighlightColor:"transparent"}}>
          <Ico.Map/> Set on Map
        </button>
      </div>
    </div>

    {/* Map placeholder */}
    <div className="rounded-3xl overflow-hidden border-2 border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 h-40 flex flex-col items-center justify-center gap-2 mb-4">
      <span className="text-4xl">🗺️</span>
      <p className="text-sm font-semibold text-slate-500">Tap "Set on Map" to pin your exact location</p>
      <p className="text-xs text-slate-400">Properties with map pins get 2x more clicks</p>
    </div>
  </div>
);

// ─── MEDIA (Step 4) ───────────────────────────────────────────────────────────
const Step4 = ({d,s,plan}:{d:FormData;s:(k:string,v:any)=>void;plan:string}) => {
  const photoRef = useRef<HTMLInputElement>(null);
  const photos: string[] = d.photos||[];
  const maxP = plan==="free"?5:25;

  const add = (files:FileList|null) => {
    if(!files)return;
    const ok=Array.from(files).filter(f=>f.size<=10*1024*1024);
    if(photos.length+ok.length>maxP){alert(`Max ${maxP} photos`);return;}
    s("photos",[...photos,...ok.map(f=>URL.createObjectURL(f))]);
  };

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-amber-500 mb-2">Step 4 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0f2342]">Photos & Media</h2>
        <p className="text-slate-500 text-sm mt-2">Properties with photos get <span className="font-bold text-amber-600">5× more enquiries</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[["📸","Photos",`${photos.length}/${maxP}`],["🎥","Video",d.virtualTour?"Added":"0"],["✨","Quality",photos.length>3?"Good":photos.length>0?"Fair":"None"]].map(([icon,l,v])=>(
          <div key={l} className="bg-white border-2 border-slate-100 rounded-2xl p-3 text-center">
            <p className="text-xl mb-0.5">{icon}</p>
            <p className="text-[10px] font-semibold text-slate-500">{l}</p>
            <p className="text-sm font-black text-[#0f2342]">{v}</p>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <label
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();add(e.dataTransfer.files);}}
        className="block border-2 border-dashed border-amber-300 rounded-3xl p-8 bg-gradient-to-br from-amber-50 to-orange-50/50 cursor-pointer hover:from-amber-100 hover:border-amber-400 active:scale-[0.99] transition-all text-center mb-4"
        style={{WebkitTapHighlightColor:"transparent"}}>
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-amber-500"><Ico.Upload/></span>
        </div>
        <p className="text-sm font-bold text-[#0f2342]">Drag & drop or tap to upload</p>
        <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB · Max {maxP} photos</p>
        <div className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f2342] text-white text-xs font-bold rounded-xl">
          <Ico.Upload/> Choose Photos
        </div>
        <input ref={photoRef} type="file" multiple accept="image/*" className="hidden" onChange={e=>add(e.target.files)}/>
      </label>

      {/* Photo grid */}
      {photos.length>0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {photos.map((url,i)=>(
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 group shadow-sm">
              <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"/>
              <button onClick={()=>s("photos",photos.filter((_,j)=>j!==i))}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity shadow-md">✕</button>
              {i===0 && <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-amber-400 text-[#0f2342] px-2 py-0.5 rounded-full">Cover</span>}
              {i>0 && plan==="paid" && <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">HD</span>}
            </div>
          ))}
        </div>
      )}

      {/* Media buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          {icon:<Ico.Video/>, label:"Upload Video", active:false, onClick:()=>{}},
          {icon:<Ico.Eye/>, label:`Virtual Tour${d.virtualTour?" ✓":""}`, active:d.virtualTour, onClick:()=>s("virtualTour",!d.virtualTour)},
        ].map(btn=>(
          <button key={btn.label} onClick={btn.onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer font-[inherit] active:scale-95
              ${btn.active ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-[#0f2342] hover:border-[#0f2342]/30"}`}
            style={{WebkitTapHighlightColor:"transparent"}}>
            {btn.icon}{btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── CONTACT (Step 5) ─────────────────────────────────────────────────────────
const Step5 = ({d,s}:{d:FormData;s:(k:string,v:any)=>void}) => (
  <div className="fade-step">
    <div className="text-center mb-8">
      <p className="text-xs font-black tracking-[0.2em] uppercase text-amber-500 mb-2">Step 5 of 5</p>
      <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0f2342]">Contact & Review</h2>
      <p className="text-slate-500 text-sm mt-2">Final step — add your contact details</p>
    </div>

    <label className="flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer mb-5 transition-all
      bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200 hover:border-[#0f2342]/30">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${d.hideNumber ? "border-[#0f2342] bg-[#0f2342]" : "border-slate-300"}`}>
        {d.hideNumber && <Ico.Check s={11} c="white"/>}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#0f2342]">Hide My Number 🔒</p>
        <p className="text-xs text-slate-500 mt-0.5">Show masked number to buyers. OTP verified calls only.</p>
      </div>
      <input type="checkbox" checked={d.hideNumber} onChange={e=>s("hideNumber",e.target.checked)} className="hidden"/>
    </label>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
      <Field label="Your Name" req>
        <input type="text" value={d.ownerName} onChange={e=>s("ownerName",e.target.value)} placeholder="e.g. Rajesh Kumar" className={inp} style={{fontSize:"16px"}}/>
      </Field>
      <Field label="Mobile Number" req hint="OTP verification required">
        <div className="flex gap-2">
          <span className="flex items-center gap-1 border-2 border-slate-200 bg-white rounded-2xl px-3 text-sm font-bold text-[#0f2342] flex-shrink-0">
            🇮🇳 +91
          </span>
          <input type="tel" value={d.ownerPhone} onChange={e=>s("ownerPhone",e.target.value.replace(/\D/,"").slice(0,10))} placeholder="10-digit number" className={`${inp} flex-1`} style={{fontSize:"16px"}}/>
        </div>
      </Field>
    </div>

    {/* Summary card */}
    <div className="bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] rounded-3xl p-5 text-white">
      <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
        <Ico.Spark/> Listing Summary
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Category",     CATEGORIES.find(c=>c.value===d.propertyCategory)?.label||"—"],
          ["Listing For",  d.listingType||"—"],
          ["BHK",          d.bhk||"—"],
          ["Area",         d.area?`${d.area} sq.ft`:"—"],
          ["City",         d.city||"—"],
          ["Price",        d.price?fmtPrice(d.price):"—"],
          ["Furnishing",   d.furnishing||"—"],
          ["Photos",       `${(d.photos||[]).length} uploaded`],
        ].map(([l,v])=>(
          <div key={l}>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">{l}</p>
            <p className="text-white text-sm font-bold capitalize mt-0.5">{v}</p>
          </div>
        ))}
      </div>
      {d.amenities?.length>0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Amenities</p>
          <div className="flex flex-wrap gap-1.5">
            {d.amenities.map(a=><span key={a} className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{a}</span>)}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({d,saveStatus,onSave}:{d:FormData;saveStatus:string;onSave:()=>void}) => (
  <div className="flex flex-col gap-3">
    {/* Completeness score */}
    <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-[0_2px_16px_rgba(15,35,66,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest text-[#0f2342]">Profile Score</p>
        <span className="text-xs font-black text-amber-500">
          {[d.propertyCategory,d.listingType,d.price,d.area,d.city,d.locality,d.ownerName,d.ownerPhone,(d.photos||[]).length>0?"y":""].filter(Boolean).length * 11}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
          style={{width:`${[d.propertyCategory,d.listingType,d.price,d.area,d.city,d.locality,d.ownerName,d.ownerPhone,(d.photos||[]).length>0?"y":""].filter(Boolean).length*11}%`}}/>
      </div>
      <div className="flex flex-col gap-1.5">
        {[
          {l:"Category selected",   done:!!d.propertyCategory},
          {l:"Price filled",        done:!!d.price},
          {l:"Location added",      done:!!d.city&&!!d.locality},
          {l:"Contact added",       done:!!d.ownerName&&!!d.ownerPhone},
          {l:"Photos uploaded",     done:(d.photos||[]).length>0},
          {l:"Description written", done:d.description.length>50},
        ].map(item=>(
          <div key={item.l} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${item.done?"bg-emerald-100":"bg-slate-100"}`}>
              {item.done ? <Ico.Check s={9} c="#10b981"/> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block"/>}
            </div>
            <span className={`text-xs font-medium ${item.done?"text-slate-700 line-through decoration-emerald-400":"text-slate-400"}`}>{item.l}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Save draft */}
    <button onClick={onSave}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-[#0f2342]/20 bg-white text-[#0f2342] text-sm font-bold hover:border-[#0f2342] hover:bg-[#0f2342]/5 active:scale-[0.97] transition-all cursor-pointer font-[inherit]"
      style={{WebkitTapHighlightColor:"transparent"}}>
      <Ico.Save/> Save Draft
    </button>

    {/* Tips */}
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-100 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-1.5"><Ico.Spark/> Pro Tips</p>
      {[
        "Properties with 5+ photos get 5× more views",
        "Detailed descriptions attract serious buyers",
        "Add amenities to rank higher in search",
        "Verify your number for trust badge",
      ].map((t,i)=>(
        <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
          <div className="w-4 h-4 rounded-full bg-amber-200 flex-shrink-0 flex items-center justify-center mt-0.5">
            <span className="text-[9px] font-black text-amber-700">{i+1}</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">{t}</p>
        </div>
      ))}
    </div>

    {/* Marketing exec */}
    <div className="bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] rounded-2xl p-4 text-white">
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3">Marketing Executive</p>
      {[["Listings Sold","120"],["Collection","₹84,550"],["Leads","4 Active"],["Commission","₹12,990"]].map(([l,v])=>(
        <div key={l} className="flex justify-between py-1.5 border-b border-white/10 last:border-0">
          <span className="text-[11px] text-white/60">{l}</span>
          <span className="text-[11px] font-black text-amber-300">{v}</span>
        </div>
      ))}
      <button className="w-full mt-3 py-2.5 bg-amber-400 text-[#0f2342] text-xs font-black rounded-xl border-none cursor-pointer active:scale-95 transition-all font-[inherit]"
        style={{WebkitTapHighlightColor:"transparent"}}>
        + Add Paid Listing
      </button>
      <div className="mt-3 flex flex-col gap-1">
        {["Client List →","Renew Reminder →","Dashboard →"].map(l=>(
          <a key={l} href="#" className="text-[11px] text-white/50 hover:text-amber-400 no-underline transition-colors">{l}</a>
        ))}
      </div>
    </div>
  </div>
);

// ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
const Success = ({onReset}:{onReset:()=>void}) => (
  <div className="min-h-screen bg-gradient-to-br from-[#0f2342] via-[#1a3a6e] to-[#0f2342] flex items-center justify-center px-4">
    <style>{`@keyframes confetti{0%{transform:translateY(-20px)rotate(0);opacity:1}100%{transform:translateY(100vh)rotate(720deg);opacity:0}}`}</style>
    <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.3)] p-8 max-w-sm w-full text-center relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0f2342] via-amber-400 to-emerald-400"/>
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_32px_rgba(52,211,153,0.5)]"
        style={{animation:"successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both"}}>
        <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#0f2342] mb-2">Property Listed! 🎉</h2>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">Your listing is now live. Serious buyers will start contacting you soon.</p>
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {[["📞","Enquiries via SMS & Call"],["✅","Live within 24 hours"],["🔒","RERA badge applied"],["📊","Track in dashboard"],["❤️","Save to favourites"],["🔍","Appears in search"]].map(([icon,label])=>(
          <div key={String(label)} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-[10px] font-bold text-slate-600 leading-tight">{label}</p>
          </div>
        ))}
      </div>
      <button onClick={onReset} className="w-full bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white py-4 rounded-2xl text-sm font-bold border-none cursor-pointer hover:shadow-[0_8px_24px_rgba(15,35,66,0.3)] active:scale-[0.97] transition-all font-[inherit]"
        style={{WebkitTapHighlightColor:"transparent"}}>
        Post Another Property →
      </button>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PostPropertyForm() {
  const [step, setStep]           = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [data, setRaw]            = useState<FormData>(INITIAL);
  const autoSaveTimer             = useRef<ReturnType<typeof setTimeout>>();

  const set = useCallback((k:string,v:any) => {
    setRaw(p=>({...p,[k]:v}));
    // Trigger auto-save after 2s of inactivity
    clearTimeout(autoSaveTimer.current);
    setSaveStatus("idle");
    autoSaveTimer.current = setTimeout(()=>{
      setSaveStatus("saving");
      // ── AUTO-SAVE API POINT ──
      // await fetch("/api/properties/draft", { method:"POST", body: JSON.stringify({...data,[k]:v}) })
      setTimeout(()=>{
        try {
          localStorage.setItem("t4bs_draft", JSON.stringify({...data,[k]:v}));
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
        setTimeout(()=>setSaveStatus("idle"),3000);
      },600);
    },2000);
  },[data]);

  // Load draft on mount
  useEffect(()=>{
    try {
      const draft = localStorage.getItem("t4bs_draft");
      if(draft) setRaw(prev=>({...prev,...JSON.parse(draft)}));
    } catch {}
  },[]);

  const manualSave = () => {
    setSaveStatus("saving");
    setTimeout(()=>{
      try {
        localStorage.setItem("t4bs_draft",JSON.stringify(data));
        setSaveStatus("saved");
      } catch { setSaveStatus("error"); }
      setTimeout(()=>setSaveStatus("idle"),3000);
    },400);
  };

  // ── SUBMIT API POINT ──────────────────────────────────────────────────────
  // Replace this with: await fetch("/api/properties", { method:"POST", body: JSON.stringify(data) })
  const handleSubmit = async () => {
    setSubmitting(true);
    console.log("POST /api/properties →", data);
    await new Promise(r=>setTimeout(r,1200));
    localStorage.removeItem("t4bs_draft");
    setSubmitting(false);
    setSubmitted(true);
  };

  if(submitted) return <Success onReset={()=>{setSubmitted(false);setStep(1);setRaw(INITIAL);}}/>;

  const goNext = ()=>{ if(step<5){setStep(s=>s+1);window.scrollTo({top:0,behavior:"smooth"});} else handleSubmit(); };
  const goPrev = ()=>{ if(step>1){setStep(s=>s-1);window.scrollTo({top:0,behavior:"smooth"});} };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Nunito',sans-serif; }
        @keyframes successPop { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeStep { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .fade-step { animation: fadeStep 0.3s ease both; }
        .no-sb::-webkit-scrollbar{display:none} .no-sb{-ms-overflow-style:none;scrollbar-width:none}
        .pb-safe { padding-bottom: env(safe-area-inset-bottom,20px); }
        select{-webkit-appearance:none;}
      `}</style>

      <div className="min-h-screen bg-[#f0f4f8]">

        {/* ── STICKY HEADER ── */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_20px_rgba(15,35,66,0.08)]">

          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2.5 max-w-[1200px] mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f2342] to-amber-500 flex items-center justify-center shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              </div>
              <div>
                <span className="font-['Playfair_Display',serif] text-base font-bold text-[#0f2342]">Think4BuySale</span>
                <span className="text-amber-500 font-bold">.in</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AutoSaveIndicator status={saveStatus}/>
              <button onClick={manualSave}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-[#0f2342] hover:text-[#0f2342] transition-all cursor-pointer font-[inherit] bg-transparent"
                style={{WebkitTapHighlightColor:"transparent"}}>
                <Ico.Save/> Save Draft
              </button>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">FREE</span>
            </div>
          </div>

          {/* Step bar */}
          <div className="px-4 pb-3 max-w-[1200px] mx-auto">
            <StepBar step={step} total={5} onJump={setStep}/>
          </div>
        </div>

        {/* ── HERO STRIP ── */}
        <div className="bg-gradient-to-r from-[#0f2342] via-[#1a3a6e] to-[#0f2342] px-4 py-5">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-amber-400 mb-1">Post Your Property</p>
              <h1 className="font-['Playfair_Display',serif] text-xl md:text-2xl font-bold text-white">
                {STEPS[step-1].icon} {STEPS[step-1].label}
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {[["2.4L+","Buyers"],["50+","Cities"],["RERA","Verified"]].map(([v,l])=>(
                <div key={l} className="text-center">
                  <p className="text-base font-black text-amber-400">{v}</p>
                  <p className="text-[10px] text-white/50">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-[1200px] mx-auto px-3 md:px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* Form column */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 shadow-[0_4px_24px_rgba(15,35,66,0.08)] p-5 md:p-7">
                {step===1 && <Step1 d={data} s={set}/>}
                {step===2 && <Step2 d={data} s={set}/>}
                {step===3 && <Step3 d={data} s={set}/>}
                {step===4 && <Step4 d={data} s={set} plan={data.plan}/>}
                {step===5 && <Step5 d={data} s={set}/>}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 lg:sticky lg:top-[130px]">
              <Sidebar d={data} saveStatus={saveStatus} onSave={manualSave}/>
            </div>
          </div>
        </div>

        {/* ── STICKY BOTTOM NAV ── */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(15,35,66,0.10)] pb-safe">
          <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-4 py-3">
            {step>1 && (
              <button onClick={goPrev}
                className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-[#0f2342] active:scale-[0.97] transition-all cursor-pointer font-[inherit] flex-shrink-0 bg-white"
                style={{WebkitTapHighlightColor:"transparent"}}>
                <Ico.ChevL/> Back
              </button>
            )}
            <button onClick={goNext} disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f2342] via-[#1a3a6e] to-[#0f2342] text-white py-3.5 rounded-2xl text-sm font-black transition-all border-none cursor-pointer hover:shadow-[0_8px_28px_rgba(15,35,66,0.4)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 font-[inherit]"
              style={{backgroundSize:"200%",WebkitTapHighlightColor:"transparent"}}>
              {submitting
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>Publishing...</>
                : step<5
                  ? <>Save & Continue <Ico.ChevR/></>
                  : <>🏠 Publish Property</>
              }
            </button>
            {step<5 && (
              <button onClick={manualSave}
                className="w-11 h-11 rounded-2xl border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#0f2342] hover:text-[#0f2342] active:scale-95 transition-all cursor-pointer flex-shrink-0 bg-white"
                style={{WebkitTapHighlightColor:"transparent"}}>
                <Ico.Save/>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}