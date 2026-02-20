"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Think4BuySaleLanding() {
  const [form, setForm] = useState({
    intent: "sell",
    propertyType: "residential",
    city: "",
    name: "",
    phone: "",
    otp: "",
  });

  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const update = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: any = {};
    if (!form.city) e.city = "City is required";
    if (!form.name || form.name.length < 3) e.name = "Enter valid full name";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter valid 10 digit mobile";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendOtp = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1000);
  };

  const verifyOtp = () => {
    if (form.otp.length !== 4) {
      setErrors({ otp: "Enter valid 4 digit OTP" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2342] via-[#1a3a6e] to-[#0d3060] font-[DM_Sans,sans-serif]">
      <div className="max-w-[1200px] mx-auto px-4 py-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* ───────── FORM FIRST (Mobile) ───────── */}
        <div className="order-1 lg:order-2 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6 lg:p-8">
          {step === "form" && (
            <>
              <h2 className="text-xl font-bold text-[#0f2342] mb-5">
                Post Property FREE
              </h2>

              {/* Sell / Rent */}
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  You want to
                </label>
                <div className="flex gap-2 mt-2">
                  {["sell", "rent"].map((v) => (
                    <button
                      key={v}
                      onClick={() => update("intent", v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border
                        ${
                          form.intent === v
                            ? "bg-[#0f2342] text-white border-[#0f2342]"
                            : "border-slate-200 text-slate-500"
                        }`}
                    >
                      {v === "sell" ? "Sell" : "Rent"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Property Type
                </label>
                <select
                  value={form.propertyType}
                  onChange={(e) => update("propertyType", e.target.value)}
                  className="w-full mt-2 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="plot">Plot / Land</option>
                  <option value="pg">PG / Co-living</option>
                </select>
              </div>

              {/* City */}
              <InputField
                label="City"
                value={form.city}
                onChange={(v: any) => update("city", v)}
                error={errors.city}
              />

              {/* Name */}
              <InputField
                label="Full Name"
                value={form.name}
                onChange={(v: any) => update("name", v)}
                error={errors.name}
              />

              {/* Phone */}
              <InputField
                label="Mobile Number"
                value={form.phone}
                onChange={(v: any) =>
                  update("phone", v.replace(/\D/g, "").slice(0, 10))
                }
                error={errors.phone}
              />

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-[#0f2342] to-[#1a3a6e]
                text-white py-3.5 rounded-xl text-sm font-bold"
              >
                {loading ? "Sending OTP..." : "Start Now"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="text-lg font-bold text-[#0f2342] mb-4">
                Verify OTP
              </h2>

              <input
                value={form.otp}
                onChange={(e) =>
                  update("otp", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest"
                placeholder="••••"
              />

              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
              )}

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full mt-4 bg-amber-400 text-[#0f2342]
                py-3.5 rounded-xl text-sm font-bold"
              >
                {loading ? "Verifying..." : "Verify & Post"}
              </button>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 flex items-center justify-center mb-4 text-white text-2xl">
                ✓
              </div>

              <h2 className="text-xl font-bold text-[#0f2342] mb-2">
                Property Submitted!
              </h2>

              <p className="text-sm text-slate-500 mb-6">
                Click below to continue listing details.
              </p>

              <button
                onClick={() => router.push("/post-property")}
                className="w-full bg-gradient-to-r from-[#0f2342] to-[#1a3a6e]
      text-white py-3.5 rounded-xl text-sm font-bold
      hover:shadow-lg transition-all"
              >
                Continue to Full Listing
              </button>
            </div>
          )}
        </div>

        {/* ───────── CONTENT (Below on Mobile) ───────── */}
        <div className="order-2 lg:order-1 text-white">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            Sell or Rent Property
            <br />
            <span className="text-amber-400">Faster with Think4BuySale</span>
          </h1>

          <ul className="space-y-2 text-white/80 text-sm mb-8">
            <li>✔ Advertise for FREE</li>
            <li>✔ Get unlimited enquiries</li>
            <li>✔ Verified buyers & tenants</li>
            <li>✔ Assistance in closing deals</li>
          </ul>

          <div className="grid grid-cols-3 gap-4 text-center mt-6">
            <Stat number="1M+" label="Visitors" />
            <Stat number="50K+" label="Buyers" />
            <Stat number="10K+" label="Sold" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, error }: any) {
  return (
    <div className="mb-4">
      <label className="text-xs font-bold text-slate-500 uppercase">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm"
        placeholder={`Enter ${label}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Stat({ number, label }: any) {
  return (
    <div>
      <p className="text-xl font-bold text-amber-400">{number}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}
