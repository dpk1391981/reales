"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { FormData, SaveStatus } from "./types";
import { INITIAL_FORM } from "./constants";

// Layout
import { Header, HeroStrip, BottomNav } from "./components/layout/PageLayout";
import { Sidebar } from "./components/layout/Sidebar";

// Steps
import { Step1 } from "./components/steps/Step1";
import { Step2 } from "./components/steps/Step2";
import { Step3 } from "./components/steps/Step3";
import { Step4 } from "./components/steps/Step4";
import { Step5 } from "./components/steps/Step5";

// Success
import { Success } from "./components/Success";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PostPropertyForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [data, setRaw] = useState<FormData>(INITIAL_FORM);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { masters } = useAppSelector((state: any) => state);

  // ── FIELD SETTER with auto-save ───────────────────────────────────────────
  const set = useCallback(
    (k: string, v: any) => {
      setRaw((prev) => {
        const next = { ...prev, [k]: v };

        // Trigger auto-save after 2s inactivity
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        setSaveStatus("idle");

        autoSaveTimer.current = setTimeout(() => {
          setSaveStatus("saving");
          // ── AUTO-SAVE API POINT ──────────────────────────────────────────
          // await fetch("/api/properties/draft", { method: "POST", body: JSON.stringify(next) });
          setTimeout(() => {
            try {
              localStorage.setItem("t4bs_draft", JSON.stringify(next));
              setSaveStatus("saved");
            } catch {
              setSaveStatus("error");
            }
            setTimeout(() => setSaveStatus("idle"), 3000);
          }, 600);
        }, 2000);

        return next;
      });
    },
    []
  );

  // ── LOAD DRAFT ON MOUNT ───────────────────────────────────────────────────
  useEffect(() => {
    try {
      const draft = localStorage.getItem("t4bs_draft");
      if (draft) setRaw((prev) => ({ ...prev, ...JSON.parse(draft) }));
    } catch {}
  }, []);

  // ── MANUAL SAVE ───────────────────────────────────────────────────────────
  const manualSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      try {
        localStorage.setItem("t4bs_draft", JSON.stringify(data));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 400);
  };

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  // ── SUBMIT API POINT ──────────────────────────────────────────────────────
  // Replace with: await fetch("/api/properties", { method: "POST", body: JSON.stringify(data) })
  const handleSubmit = async () => {
    setSubmitting(true);
    console.log("POST /api/properties →", data);
    await new Promise((r) => setTimeout(r, 1200));
    localStorage.removeItem("t4bs_draft");
    setSubmitting(false);
    setSubmitted(true);
  };

  // ── NAVIGATION ────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Success
        onReset={() => {
          setSubmitted(false);
          setStep(1);
          setRaw(INITIAL_FORM);
        }}
      />
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        @keyframes successPop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeStep {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .fade-step { animation: fadeStep 0.3s ease both; }
        select { -webkit-appearance: none; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
        {/* Sticky Header */}
        <Header
          step={step}
          saveStatus={saveStatus}
          onSave={manualSave}
          onJump={setStep}
        />

        {/* Hero Strip */}
        <HeroStrip step={step} />

        {/* Main Content */}
        <div className="max-w-[1200px] mx-auto px-3 md:px-5 py-5 pb-28">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Form Column */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-[0_4px_24px_rgba(11,60,140,0.08)] p-5 md:p-7">
                {step === 1 && <Step1 d={data} s={set} masters={masters} />}
                {step === 2 && <Step2 d={data} s={set} masters={masters} />}
                {step === 3 && <Step3 d={data} s={set} />}
                {step === 4 && <Step4 d={data} s={set} plan={data.plan} />}
                {step === 5 && <Step5 d={data} s={set} masters={masters} />}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 lg:sticky lg:top-[130px]">
              <Sidebar d={data} saveStatus={saveStatus} onSave={manualSave} />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Nav */}
        <BottomNav
          step={step}
          submitting={submitting}
          onNext={goNext}
          onPrev={goPrev}
          onSave={manualSave}
        />
      </div>
    </>
  );
}
