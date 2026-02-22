import { Ico } from "../icons/Ico";

const STEPS = [
  { id: 1, label: "Property Type", icon: "🏠" },
  { id: 2, label: "Details", icon: "📋" },
  { id: 3, label: "Location", icon: "📍" },
  { id: 4, label: "Media", icon: "📸" },
  { id: 5, label: "Contact", icon: "👤" },
];

interface StepBarProps {
  step: number;
  onJump: (n: number) => void;
}

export const StepBar = ({ step, onJump }: StepBarProps) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    {STEPS.map((s, i) => {
      const done = s.id < step;
      const active = s.id === step;
      return (
        <div key={s.id} className="flex items-center gap-1.5 sm:gap-2 flex-1 last:flex-none">
          <button
            onClick={() => done && onJump(s.id)}
            className="flex items-center gap-1.5 flex-shrink-0 transition-all duration-300 border-none bg-transparent cursor-pointer font-[inherit] p-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-all duration-300 border-2
                ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
                    : active
                      ? "bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] border-[#1D4ED8] text-white shadow-[0_2px_12px_rgba(29,78,216,0.4)]"
                      : "bg-white border-blue-100 text-slate-400"
                }`}
            >
              {done ? <Ico.Check s={11} c="white" /> : <span className="text-[10px]">{s.icon}</span>}
            </div>
            <span
              className={`hidden sm:block text-[11px] font-bold transition-colors ${
                active ? "text-[#1D4ED8]" : done ? "text-emerald-500" : "text-slate-400"
              }`}
            >
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-blue-100 min-w-[12px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${s.id < step ? "bg-blue-400" : "bg-transparent"}`}
                style={{ width: s.id < step ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);