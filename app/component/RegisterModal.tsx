"use client";

import { useState, useEffect, useRef } from "react";
import { sendOtpApi } from "@/services/authApi";
import { verifyOtpApi } from "@/services/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

interface Props {
  open: boolean;
  onClose: () => void;
}

const agenciesMock = [
  "ABC Realty",
  "Prime Estates",
  "Urban Homes",
  "Dream Properties",
];

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

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const BackIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const BuildingIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronDown = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ── Step indicator ─────────────────────────────────────────────────────────────

const StepDots = ({ step }: { step: "details" | "otp" | "success" }) => {
  const steps = ["details", "otp", "success"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`rounded-full transition-all duration-300 flex items-center justify-center
            ${
              i < idx
                ? "w-6 h-6 bg-emerald-500"
                : i === idx
                  ? "w-6 h-6 bg-[#0f2342]"
                  : "w-2 h-2 bg-slate-200"
            }`}
          >
            {i < idx && <CheckIcon />}
            {i === idx && (
              <span className="text-white text-[9px] font-bold">{i + 1}</span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-[2px] w-6 rounded-full transition-all duration-300
              ${i < idx ? "bg-emerald-400" : "bg-slate-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Input field ────────────────────────────────────────────────────────────────

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
      <span className="text-slate-400">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

const inputCls = `w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-[#0f2342]
  bg-slate-50 outline-none transition-all font-[DM_Sans,sans-serif]
  focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,191,36,0.15)]
  placeholder-slate-400`;

const selectCls = `w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-[#0f2342]
  bg-slate-50 outline-none transition-all font-[DM_Sans,sans-serif]
  focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,191,36,0.15)]
  appearance-none cursor-pointer`;

// ── OTP boxes ─────────────────────────────────────────────────────────────────

const OtpInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const digits = value.padEnd(6, " ").split("");

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = digits.slice();
      next[i] = "";
      onChange(next.join("").trimEnd());
      if (i > 0) refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[i] = ch;
    onChange(next.join("").trimEnd());
    if (ch && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center my-5">
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          type="tel"
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-2xl
            border-2 outline-none transition-all font-[DM_Sans,sans-serif]
            ${
              digits[i] && digits[i] !== " "
                ? "border-amber-400 bg-amber-50 text-[#0f2342] shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
                : "border-slate-200 bg-slate-50 text-[#0f2342] focus:border-amber-400 focus:bg-white"
            }`}
          style={{ fontSize: "20px" /* prevent iOS zoom */ }}
        />
      ))}
    </div>
  );
};

// ── Role selector ─────────────────────────────────────────────────────────────

const ROLES = [
  { value: "customer", label: "Buyer / Tenant", icon: "👤" },
  { value: "agent", label: "Agent", icon: "🤝" },
  { value: "agency", label: "Agency", icon: "🏢" },
];

const RoleSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex gap-2 mb-4">
    {ROLES.map((r) => (
      <button
        key={r.value}
        onClick={() => onChange(r.value)}
        className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl border-2
          text-xs font-semibold transition-all cursor-pointer font-[inherit]
          active:scale-95
          ${
            value === r.value
              ? "border-[#0f2342] bg-[#0f2342] text-white shadow-[0_4px_12px_rgba(15,35,66,0.2)]"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className="text-lg">{r.icon}</span>
        <span className="leading-tight text-center">{r.label}</span>
      </button>
    ))}
  </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function RegisterModal({ open, onClose }: Props) {
  const [role, setRole] = useState("registered");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // reset on close
      setTimeout(() => {
        setStep("details");
        setName("");
        setMobile("");
        setOtp("");
        setErrors({});
        setLoading(false);
      }, 300);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!mobile.trim() || mobile.length < 10)
      e.mobile = "Enter a valid 10-digit mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendOtp = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

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
      alert(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) return;

    try {
      setLoading(true);

      const { data } = await verifyOtpApi({
        phone: mobile,
        otp,
      });

      if (data.success) {
        // Save tokens
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("refresh_token", data.data.refresh_token);
        dispatch(setUser(data.data.user));

        setStep("success");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes modalUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .modal-enter { animation: modalUp 0.28s cubic-bezier(0.22,1,0.36,1); }
        .success-pop { animation: successPop 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div
        className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center
        font-[DM_Sans,sans-serif]"
      >
        {/* Overlay */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal — slides up from bottom on mobile, centered on desktop */}
        <div
          className="modal-enter relative bg-white
          w-full sm:w-[95%] sm:max-w-md
          rounded-t-3xl sm:rounded-3xl
          shadow-[0_-8px_40px_rgba(0,0,0,0.2)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.3)]
          max-h-[92vh] sm:max-h-none overflow-y-auto overscroll-contain
          pb-safe"
        >
          {/* Drag handle — mobile only */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-4 sm:px-6 sm:pt-6 pb-2">
            <div>
              {step !== "success" && (
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-amber-500 mb-1">
                  ✦ Join Think4BuySale
                </p>
              )}
              <h2 className="font-[Playfair_Display,serif] text-xl sm:text-2xl font-bold text-[#0f2342] leading-tight">
                {step === "details" && "Create Account"}
                {step === "otp" && "Verify Mobile"}
                {step === "success" && "Welcome Aboard! 🎉"}
              </h2>
              {step === "details" && (
                <p className="text-xs text-slate-500 mt-0.5">
                  India's premier property platform
                </p>
              )}
              {step === "otp" && (
                <p className="text-xs text-slate-500 mt-0.5">
                  OTP sent to <strong>+91 {mobile}</strong>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center
                text-slate-500 hover:bg-slate-200 active:scale-90 transition-all
                border-none cursor-pointer flex-shrink-0 mt-1"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Step dots */}
          <div className="px-5 sm:px-6">
            <StepDots step={step} />
          </div>

          {/* ── STEP: Details ── */}
          {step === "details" && (
            <div className="px-5 sm:px-6 pb-6">
              {/* Google */}
              <button
                className="w-full flex items-center justify-center gap-3 border-2 border-slate-200
                py-3 rounded-2xl font-semibold text-sm text-[#0f2342]
                hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]
                transition-all cursor-pointer font-[inherit] mb-5"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  or sign up with mobile
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Role selector */}
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">
                I am a...
              </label>
              <RoleSelector value={role} onChange={setRole} />

              {/* Name */}
              <Field label="Full Name" icon={<UserIcon />}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="Enter your full name"
                  className={`${inputCls} ${errors.name ? "border-red-400 bg-red-50" : ""}`}
                  style={{ fontSize: "16px" }}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </Field>

              {/* Mobile */}
              <Field label="Mobile Number" icon={<PhoneIcon />}>
                <div
                  className={`flex border rounded-2xl overflow-hidden bg-slate-50
                  transition-all focus-within:border-amber-400 focus-within:bg-white
                  focus-within:shadow-[0_0_0_3px_rgba(251,191,36,0.15)]
                  ${errors.mobile ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                >
                  <span
                    className="flex items-center px-3 text-sm font-bold text-[#0f2342]
                    border-r border-slate-200 bg-slate-100 flex-shrink-0"
                  >
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, ""));
                      setErrors((p) => ({ ...p, mobile: "" }));
                    }}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-3 py-3 text-sm text-[#0f2342] bg-transparent
                      outline-none font-[DM_Sans,sans-serif] placeholder-slate-400"
                    style={{ fontSize: "16px" }}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
                )}
              </Field>

              {/* Agent → agency dropdown */}
              {role === "agent" && (
                <Field label="Select Agency" icon={<BuildingIcon />}>
                  <div className="relative">
                    <select
                      value={selectedAgency}
                      onChange={(e) => setSelectedAgency(e.target.value)}
                      className={selectCls}
                      style={{ fontSize: "16px" }}
                    >
                      <option value="">Choose your agency</option>
                      {agenciesMock.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown />
                    </span>
                  </div>
                </Field>
              )}

              {/* Agency → name */}
              {role === "agency" && (
                <Field label="Agency Name" icon={<BuildingIcon />}>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Enter your agency name"
                    className={inputCls}
                    style={{ fontSize: "16px" }}
                  />
                </Field>
              )}

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
                  py-3.5 rounded-2xl font-bold text-sm
                  hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)] hover:-translate-y-px
                  active:scale-[0.97] transition-all border-none cursor-pointer
                  font-[DM_Sans,sans-serif] disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 mt-1"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {loading ? (
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="white"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : null}
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Already have an account?{" "}
                <button
                  className="text-amber-500 font-semibold border-none bg-transparent
                  cursor-pointer font-[inherit]"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === "otp" && (
            <div className="px-5 sm:px-6 pb-6">
              {/* Back */}
              <button
                onClick={() => setStep("details")}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500
                  mb-4 border-none bg-transparent cursor-pointer font-[inherit]
                  hover:text-[#0f2342] transition-colors"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <BackIcon /> Back
              </button>

              <p className="text-sm text-slate-600 text-center mb-1">
                Enter the 6-digit OTP sent to
              </p>
              <p className="text-sm font-bold text-[#0f2342] text-center">
                +91 {mobile}
              </p>

              {/* 6-box OTP */}
              <OtpInput value={otp} onChange={setOtp} />

              <button
                onClick={verifyOtp}
                disabled={otp.length < 6 || loading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#0f2342]
                  py-3.5 rounded-2xl font-bold text-sm
                  hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:-translate-y-px
                  active:scale-[0.97] transition-all border-none cursor-pointer
                  font-[DM_Sans,sans-serif] disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {loading ? (
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#0f2342"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="#0f2342"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : null}
                {loading ? "Verifying..." : "Verify & Register ✓"}
              </button>

              {/* Resend */}
              <div className="text-center mt-4 text-sm">
                {timer > 0 ? (
                  <p className="text-slate-400">
                    Resend OTP in{" "}
                    <span className="font-bold text-[#0f2342]">{timer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={sendOtp}
                    className="text-amber-500 font-bold border-none bg-transparent
                      cursor-pointer font-[inherit] hover:text-amber-600"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Trust note */}
              <p className="text-center text-[10px] text-slate-400 mt-5 leading-relaxed">
                🔒 Your data is safe and never shared with third parties.
              </p>
            </div>
          )}

          {/* ── STEP: Success ── */}
          {step === "success" && (
            <div className="px-5 sm:px-6 pb-8 flex flex-col items-center text-center">
              <div
                className="success-pop w-20 h-20 rounded-full bg-gradient-to-br
                from-emerald-400 to-emerald-600 flex items-center justify-center
                shadow-[0_8px_24px_rgba(16,185,129,0.4)] mb-5"
              >
                <svg
                  width="36"
                  height="36"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-[Playfair_Display,serif] text-xl font-bold text-[#0f2342] mb-2">
                Account Created!
              </h3>
              <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed mb-6">
                Welcome to Think4BuySale. Explore thousands of verified
                properties across India.
              </p>

              {/* Benefits */}
              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                {[
                  "Save properties to wishlist",
                  "Get price alerts",
                  "Chat with agents directly",
                  "Exclusive project launches",
                ].map((b) => (
                  <div
                    key={b}
                    className="flex items-center gap-2.5 py-2
                    border-b border-slate-100 last:border-0"
                  >
                    <span
                      className="w-5 h-5 rounded-full bg-emerald-100 flex items-center
                      justify-center flex-shrink-0 text-emerald-600"
                    >
                      <svg
                        width="10"
                        height="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSuccess}
                className="w-full bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white
                  py-3.5 rounded-2xl font-bold text-sm
                  hover:shadow-[0_6px_20px_rgba(15,35,66,0.3)]
                  active:scale-[0.97] transition-all border-none cursor-pointer
                  font-[DM_Sans,sans-serif]"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Explore Properties →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
