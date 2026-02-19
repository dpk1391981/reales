"use client";

import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: Props) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [open]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!open) return null;

  const sendOtp = async () => {
    setStep("otp");
    setTimer(30);
  };

  const verifyOtp = async () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">

      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative bg-white w-[92%] max-w-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 animate-[slideDown_0.25s_ease]">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-[#0f2342] mb-2">
          Sign In to <span className="text-amber-500">Think4BuySale</span>
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Access saved properties & post listings
        </p>

        {/* GOOGLE LOGIN */}
        {step === "mobile" && (
          <>
            <button
              className="w-full flex items-center justify-center gap-3 border border-slate-300 py-3 rounded-lg font-medium text-[#0f2342] hover:border-[#0f2342] transition-all duration-200"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* OR Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="px-3 text-xs text-slate-400 font-medium">
                OR
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Mobile Login */}
            <label className="text-sm font-medium text-slate-600">
              Mobile Number
            </label>

            <input
              type="tel"
              placeholder="Enter 10 digit mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full mt-2 mb-5 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <button
              onClick={sendOtp}
              className="w-full bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Send OTP
            </button>
          </>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <>
            <label className="text-sm font-medium text-slate-600">
              Enter OTP sent to {mobile}
            </label>

            <input
              type="text"
              maxLength={6}
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mt-2 mb-5 border border-slate-300 rounded-lg px-4 py-3 tracking-[8px] text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <button
              onClick={verifyOtp}
              className="w-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#0f2342] py-3 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Verify OTP
            </button>

            <div className="text-center mt-4 text-sm">
              {timer > 0 ? (
                <span className="text-slate-500">
                  Resend OTP in {timer}s
                </span>
              ) : (
                <button
                  onClick={sendOtp}
                  className="text-amber-500 font-medium hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
