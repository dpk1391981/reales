import { AutoSaveIndicator } from "../ui/Primitives";
import { StepBar } from "../steps/StepBar";
import { Ico } from "../icons/Ico";
import { SaveStatus } from "../../types";
import { STEPS } from "../constants/index";

interface HeaderProps {
  step: number;
  saveStatus: SaveStatus;
  onSave: () => void;
  onJump: (n: number) => void;
}

export const Header = ({ step, saveStatus, onSave, onJump }: HeaderProps) => (
  <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-[0_2px_20px_rgba(11,60,140,0.08)]">
    {/* Top bar */}
    <div className="flex items-center justify-between px-4 py-2.5 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3C8C] to-[#3B82F6] flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </div>
        <div>
          <span className="font-['Playfair_Display',serif] text-base font-bold text-[#0B3C8C]">
            Think4BuySale
          </span>
          <span className="text-blue-400 font-bold">.in</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AutoSaveIndicator status={saveStatus} />
        <button
          onClick={onSave}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-2 border-blue-100 rounded-xl text-xs font-bold text-blue-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all cursor-pointer font-[inherit] bg-transparent"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Ico.Save /> Save Draft
        </button>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          FREE
        </span>
      </div>
    </div>
    {/* Step bar */}
    <div className="px-4 pb-3 max-w-[1200px] mx-auto">
      <StepBar step={step} onJump={onJump} />
    </div>
  </div>
);

interface HeroStripProps {
  step: number;
}

export const HeroStrip = ({ step }: HeroStripProps) => (
  <div className="bg-gradient-to-r from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] px-4 py-5">
    <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-200 mb-1">
          Post Your Property
        </p>
        <h1 className="font-['Playfair_Display',serif] text-xl md:text-2xl font-bold text-white">
          {STEPS[step - 1].icon} {STEPS[step - 1].label}
        </h1>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        {[["2.4L+", "Buyers"], ["50+", "Cities"], ["RERA", "Verified"]].map(([v, l]) => (
          <div key={l} className="text-center">
            <p className="text-base font-black text-blue-200">{v}</p>
            <p className="text-[10px] text-white/50">{l}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface BottomNavProps {
  step: number;
  submitting: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
}

export const BottomNav = ({ step, submitting, onNext, onPrev, onSave }: BottomNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-blue-100 shadow-[0_-4px_24px_rgba(11,60,140,0.10)]" style={{ paddingBottom: "env(safe-area-inset-bottom,20px)" }}>
    <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-4 py-3">
      {step > 1 && (
        <button
          onClick={onPrev}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-blue-100 text-sm font-bold text-blue-600 hover:border-[#1D4ED8] active:scale-[0.97] transition-all cursor-pointer font-[inherit] flex-shrink-0 bg-white"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Ico.ChevL /> Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={submitting}
        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white py-3.5 rounded-2xl text-sm font-black transition-all border-none cursor-pointer hover:shadow-[0_8px_28px_rgba(29,78,216,0.4)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 font-[inherit]"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {submitting ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Publishing...
          </>
        ) : step < 5 ? (
          <>Save & Continue <Ico.ChevR /></>
        ) : (
          <>🏠 Publish Property</>
        )}
      </button>
      {step < 5 && (
        <button
          onClick={onSave}
          className="w-11 h-11 rounded-2xl border-2 border-blue-100 flex items-center justify-center text-blue-400 hover:border-[#1D4ED8] hover:text-[#1D4ED8] active:scale-95 transition-all cursor-pointer flex-shrink-0 bg-white"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Ico.Save />
        </button>
      )}
    </div>
  </div>
);
