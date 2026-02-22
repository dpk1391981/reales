import React from "react";
import { Ico } from "../icons/Ico";

// ─── THEME ────────────────────────────────────────────────────────────────────
export const inp =
  "w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-medium text-[#0B3C8C] placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200";

export const sel =
  "w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-medium text-[#0B3C8C] placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 appearance-none cursor-pointer pr-10";

// ─── LABEL ────────────────────────────────────────────────────────────────────
export const Lbl = ({ c, req }: { c: React.ReactNode; req?: boolean }) => (
  <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">
    {c}
    {req && <span className="text-rose-400 text-xs">•</span>}
  </label>
);

// ─── FIELD ────────────────────────────────────────────────────────────────────
export const Field = ({
  label,
  req,
  children,
  hint,
}: {
  label: string;
  req?: boolean;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="mb-4">
    <Lbl c={label} req={req} />
    {children}
    {hint && <p className="text-[10px] text-slate-400 mt-1.5 ml-1">{hint}</p>}
  </div>
);

// ─── SELECT WRAPPER ───────────────────────────────────────────────────────────
export const SelWrap = ({
  v,
  onChange,
  opts,
  ph,
}: {
  v: string;
  onChange: (s: string) => void;
  opts: string[];
  ph: string;
}) => (
  <div className="relative">
    <select
      value={v}
      onChange={(e) => onChange(e.target.value)}
      className={sel}
      style={{ fontSize: "16px" }}
    >
      <option value="">{ph}</option>
      {opts.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
      <Ico.ChevD />
    </span>
  </div>
);

// ─── PILL ─────────────────────────────────────────────────────────────────────
export const Pill = ({
  label,
  selected,
  onClick,
  icon,
  size = "md",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
  size?: "sm" | "md";
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 font-bold rounded-2xl border-2 transition-all duration-200 cursor-pointer font-[inherit] active:scale-95 whitespace-nowrap
      ${size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"}
      ${
        selected
          ? "border-[#1D4ED8] bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white shadow-[0_4px_16px_rgba(29,78,216,0.3)]"
          : "border-blue-100 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
      }`}
    style={{ WebkitTapHighlightColor: "transparent" }}
  >
    {icon && <span className="text-base leading-none">{icon}</span>}
    {label}
  </button>
);

// ─── COUNTER ──────────────────────────────────────────────────────────────────
export const Counter = ({
  label,
  v,
  set,
  min = 0,
  max = 20,
}: {
  label: string;
  v: number;
  set: (n: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-blue-50 last:border-0">
    <span className="text-sm font-semibold text-slate-600">{label}</span>
    <div className="flex items-center bg-blue-50 border-2 border-blue-100 rounded-xl overflow-hidden">
      <button
        onClick={() => set(Math.max(min, v - 1))}
        className="w-9 h-9 flex items-center justify-center text-blue-500 hover:bg-blue-100 active:bg-blue-200 transition-colors border-none bg-transparent cursor-pointer"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <Ico.Minus />
      </button>
      <span className="w-10 text-center text-sm font-black text-[#0B3C8C]">{v}</span>
      <button
        onClick={() => set(Math.min(max, v + 1))}
        className="w-9 h-9 flex items-center justify-center text-blue-500 hover:bg-blue-100 active:bg-blue-200 transition-colors border-none bg-transparent cursor-pointer"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <Ico.Plus />
      </button>
    </div>
  </div>
);

// ─── AUTO-SAVE INDICATOR ──────────────────────────────────────────────────────
export const AutoSaveIndicator = ({
  status,
}: {
  status: "idle" | "saving" | "saved" | "error";
}) => (
  <div
    className={`flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-300 ${
      status === "saving"
        ? "text-blue-500"
        : status === "saved"
          ? "text-emerald-500"
          : status === "error"
            ? "text-rose-400"
            : "text-slate-400"
    }`}
  >
    {status === "saving" && (
      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    )}
    {status === "saved" && <Ico.Check s={11} c="#10b981" />}
    {status === "error" && "⚠"}
    {status === "saving" && "Saving..."}
    {status === "saved" && "Draft saved"}
    {status === "error" && "Save failed"}
    {status === "idle" && "Auto-save on"}
  </div>
);