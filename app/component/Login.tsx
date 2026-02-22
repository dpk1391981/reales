"use client";

import { useState, useEffect, useRef } from "react";
import { sendOtpApi, verifyOtpApi } from "@/services/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

interface Props {
  open: boolean;
  onClose: () => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ── 6-box OTP input ───────────────────────────────────────────────────────────

const OtpInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      onChange(value.slice(0, i - 1));
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[i] = digit;
    const next = arr.join("").slice(0, 6);
    onChange(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none
            transition-all duration-150 font-[DM_Sans,sans-serif] bg-white
            ${
              value[i]
                ? "border-[#0f2342] text-[#0f2342] bg-amber-50"
                : "border-slate-200 text-slate-400"
            }
            focus:border-amber-400 focus:bg-amber-50`}
          style={{ fontSize: "18px", WebkitTapHighlightColor: "transparent" }}
        />
      ))}
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function LoginModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mobileRef = useRef<HTMLInputElement>(null);

  // Lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => mobileRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
      // Reset on close
      setTimeout(() => {
        setStep("mobile");
        setMobile("");
        setOtp("");
        setError("");
        setTimer(0);
      }, 300);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6) verifyOtp();
  }, [otp]);

  if (!open) return null;

 const sendOtp = async () => {
  if (mobile.length !== 10) {
    setError("Please enter a valid 10-digit mobile number");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const { data } = await sendOtpApi({
      phone: mobile,
    });
    setStep("otp");
    setTimer(30);
    setLoading(true);
    setTimeout(() => {
      setOtp(data.otp || "");
      setLoading(false);
    }, 3000);
  } catch (err: any) {
    setError(err?.response?.data?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

  const verifyOtp = async () => {
  if (otp.length !== 6) return;

  try {
    setLoading(true);
    setError("");

    const { data } = await verifyOtpApi({
      phone: mobile,
      otp,
    });

    if (data.success) {
      // Save tokens
      localStorage.setItem("access_token", data.data.access_token);
      localStorage.setItem("refresh_token", data.data.refresh_token);

      // Update Redux
      dispatch(setUser(data.data.user));

      onClose();
    }
  } catch (err: any) {
    setError(err?.response?.data?.message || "Invalid OTP");
  } finally {
    setLoading(false);
  }
};

  const progress = step === "mobile" ? 1 : 2;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sheetUp {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .overlay-anim  { animation: overlayIn 0.22s ease both; }
        .sheet-anim    { animation: sheetUp 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .card-anim     { animation: cardIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .step-anim     { animation: stepIn 0.22s ease both; }
      `}</style>

      <div className="fixed inset-0 z-[999] font-[DM_Sans,sans-serif]">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="overlay-anim absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* ── MOBILE: bottom sheet ── */}
        <div
          className="sheet-anim sm:hidden absolute bottom-0 left-0 right-0
          bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.2)] overflow-hidden
          max-h-[92vh] flex flex-col"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          <div className="overflow-y-auto overscroll-contain flex-1 px-5 pb-10 pt-2">
            <ModalContent
              step={step}
              mobile={mobile}
              otp={otp}
              timer={timer}
              loading={loading}
              error={error}
              progress={progress}
              mobileRef={mobileRef}
              setMobile={setMobile}
              setOtp={setOtp}
              setError={setError}
              setStep={setStep}
              sendOtp={sendOtp}
              verifyOtp={verifyOtp}
              onClose={onClose}
            />
          </div>
        </div>

        {/* ── DESKTOP: centered card ── */}
        <div className="card-anim hidden sm:flex absolute inset-0 items-center justify-center p-4">
          <div
            className="relative bg-white w-full max-w-md rounded-3xl
            shadow-[0_24px_64px_rgba(0,0,0,0.25)] overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0f2342] via-[#1a3a6e] to-amber-400" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100
                hover:bg-slate-200 flex items-center justify-center text-slate-500
                transition-all border-none cursor-pointer"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <CloseIcon />
            </button>

            <div className="px-7 pb-8 pt-6">
              <ModalContent
                step={step}
                mobile={mobile}
                otp={otp}
                timer={timer}
                loading={loading}
                error={error}
                progress={progress}
                mobileRef={mobileRef}
                setMobile={setMobile}
                setOtp={setOtp}
                setError={setError}
                setStep={setStep}
                sendOtp={sendOtp}
                verifyOtp={verifyOtp}
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Shared modal content (used by both sheet + card) ─────────────────────────

interface ContentProps {
  step: "mobile" | "otp";
  mobile: string;
  otp: string;
  timer: number;
  loading: boolean;
  error: string;
  progress: number;
  mobileRef: any;
  setMobile: (v: string) => void;
  setOtp: (v: string) => void;
  setError: (v: string) => void;
  setStep: (s: "mobile" | "otp") => void;
  sendOtp: () => void;
  verifyOtp: () => void;
  onClose: () => void;
}

function ModalContent({
  step,
  mobile,
  otp,
  timer,
  loading,
  error,
  progress,
  mobileRef,
  setMobile,
  setOtp,
  setError,
  setStep,
  sendOtp,
  verifyOtp,
  onClose,
}: ContentProps) {
  return (
    <>
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-5">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300
            ${s === progress ? "w-8 bg-[#0f2342]" : s < progress ? "w-4 bg-amber-400" : "w-4 bg-slate-200"}`}
          />
        ))}
        <span className="ml-1 text-[10px] text-slate-400 font-medium">
          Step {progress} of 2
        </span>
      </div>

      {/* Header */}
      <div className="mb-5">
        {step === "otp" && (
          <button
            onClick={() => {
              setStep("mobile");
              setOtp("");
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500
              mb-3 border-none bg-transparent cursor-pointer p-0 font-[inherit]
              hover:text-[#0f2342] transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowLeftIcon />
            Back
          </button>
        )}
        <h2 className="font-[Playfair_Display,serif] text-xl font-bold text-[#0f2342] leading-tight">
          {step === "mobile" ? (
            <>
              Sign In to <span className="text-amber-500">Think4BuySale</span>
            </>
          ) : (
            <>
              Verify your <span className="text-amber-500">Number</span>
            </>
          )}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {step === "mobile"
            ? "Access saved properties & post listings"
            : `OTP sent to +91 ${mobile}`}
        </p>
      </div>

      {/* ── STEP 1: Mobile entry ── */}
      {step === "mobile" && (
        <div className="step-anim">
          {/* Google */}
          <button
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200
              py-3 rounded-2xl font-semibold text-sm text-[#0f2342]
              hover:border-[#0f2342] hover:bg-slate-50 active:scale-[0.98]
              transition-all cursor-pointer font-[inherit] bg-white"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Phone input */}
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
            Mobile Number
          </label>
          <div
            className={`flex items-center border-2 rounded-2xl overflow-hidden transition-all
            ${error ? "border-red-400" : "border-slate-200 focus-within:border-amber-400"}`}
          >
            <div className="flex items-center gap-1.5 px-3 py-3.5 bg-slate-50 border-r border-slate-200 flex-shrink-0">
              <span className="text-base">🇮🇳</span>
              <span className="text-sm font-semibold text-slate-600">+91</span>
            </div>
            <input
              ref={mobileRef}
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile"
              value={mobile}
              maxLength={10}
              onChange={(e) => {
                setError("");
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
              }}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              className="flex-1 border-none outline-none px-3 py-3.5 text-sm text-[#0f2342]
                bg-white font-[DM_Sans,sans-serif] placeholder-slate-400"
              style={{ fontSize: "16px" /* prevents iOS zoom */ }}
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>
          )}

          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2
              bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
              py-3.5 rounded-2xl font-bold text-sm
              disabled:opacity-60 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)]
              active:scale-[0.97] transition-all border-none cursor-pointer font-[inherit]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Send OTP"
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            By continuing you agree to our{" "}
            <a href="#" className="text-amber-500 no-underline font-medium">
              Terms
            </a>{" "}
            &{" "}
            <a href="#" className="text-amber-500 no-underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      )}

      {/* ── STEP 2: OTP verify ── */}
      {step === "otp" && (
        <div className="step-anim">
          {/* OTP hint */}
          <div
            className="flex items-center gap-2 bg-amber-50 border border-amber-200
            rounded-2xl px-4 py-3 mb-5"
          >
            <span className="text-amber-500 flex-shrink-0">
              <ShieldIcon />
            </span>
            <p className="text-xs text-amber-700 font-medium">
              Enter the 6-digit OTP — it expires in 10 minutes.
            </p>
          </div>

          {/* 6 OTP boxes */}
          <div className="mb-5">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          {error && (
            <p className="text-xs text-red-500 mb-3 text-center font-medium">
              {error}
            </p>
          )}

          <button
            onClick={verifyOtp}
            disabled={otp.length < 6 || loading}
            className="w-full flex items-center justify-center gap-2
              bg-gradient-to-r from-amber-400 to-amber-600 text-[#0f2342]
              py-3.5 rounded-2xl font-bold text-sm
              disabled:opacity-50 hover:-translate-y-px
              hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)]
              active:scale-[0.97] transition-all border-none cursor-pointer font-[inherit]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#0f2342]/30 border-t-[#0f2342] rounded-full animate-spin" />
            ) : (
              "Verify & Sign In"
            )}
          </button>

          {/* Resend row */}
          <div className="text-center mt-4">
            {timer > 0 ? (
              <div className="flex items-center justify-center gap-2">
                <div className="relative w-6 h-6">
                  <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray={`${(timer / 30) * 62.8} 62.8`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="absolute inset-0 flex items-center justify-center
                    text-[8px] font-bold text-amber-600"
                  >
                    {timer}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  Resend OTP in {timer}s
                </span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOtp("");
                  sendOtp();
                }}
                className="text-sm text-amber-500 font-bold hover:underline
                  border-none bg-transparent cursor-pointer font-[inherit]"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {/* Register nudge */}
      <p className="text-center text-xs text-slate-500 mt-5">
        New to Think4BuySale?{" "}
        <a
          href="#"
          className="text-[#0f2342] font-bold no-underline hover:text-amber-500 transition-colors"
        >
          Create Account
        </a>
      </p>
    </>
  );
}
