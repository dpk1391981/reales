"use client";

import { useState, useEffect } from "react";

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

export default function RegisterModal({ open, onClose }: Props) {
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [agency, setAgency] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
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

  const sendOtp = () => {
    if (!name || !mobile) {
      alert("Please fill required fields");
      return;
    }
    setStep("otp");
    setTimer(30);
  };

  const verifyOtp = () => {
    // call register API here
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
      <div className="relative bg-white w-[95%] max-w-lg rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 animate-[slideDown_0.25s_ease]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#0f2342] mb-2">
          Create Account on <span className="text-amber-500">Think4BuySale</span>
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          Join India's premium property platform
        </p>

        {/* GOOGLE SIGNUP */}
        <button className="w-full flex items-center justify-center gap-3 border border-slate-300 py-3 rounded-lg font-medium text-[#0f2342] hover:border-[#0f2342] transition-all duration-200 hover:shadow-sm">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* OR Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-white px-4 text-slate-400 font-medium">
              Or sign up with mobile
            </span>
          </div>
        </div>

        {step === "details" && (
          <>
            {/* Name */}
            <label className="text-sm font-medium text-slate-600">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full mt-2 mb-4 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
            />

            {/* Role Dropdown */}
            <label className="text-sm font-medium text-slate-600">
              Registering As
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-2 mb-4 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="agency">Agency</option>
            </select>

            {/* Mobile */}
            <label className="text-sm font-medium text-slate-600">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full mt-2 mb-4 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
            />

            {/* If Agent → Agency dropdown */}
            {role === "agent" && (
              <>
                <label className="text-sm font-medium text-slate-600">
                  Select Existing Agency
                </label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full mt-2 mb-4 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="">Choose Agency</option>
                  {agenciesMock.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* If Agency → Agency Name */}
            {role === "agency" && (
              <>
                <label className="text-sm font-medium text-slate-600">
                  Agency Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your agency name"
                  className="w-full mt-2 mb-4 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </>
            )}

            <button
              onClick={sendOtp}
              className="w-full bg-gradient-to-br from-[#0f2342] to-[#1a3a6e] text-white py-3 rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Send OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <label className="text-sm font-medium text-slate-600">
              Enter OTP sent to {mobile}
            </label>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="------"
              className="w-full mt-2 mb-5 border border-slate-300 rounded-lg px-4 py-3 tracking-[8px] text-center text-lg focus:ring-2 focus:ring-amber-400 outline-none"
            />

            <button
              onClick={verifyOtp}
              className="w-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#0f2342] py-3 rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Verify & Register
            </button>

            <div className="text-center mt-4 text-sm">
              {timer > 0 ? (
                <span className="text-slate-500">Resend OTP in {timer}s</span>
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
