"use client";

import { useState, useEffect } from "react";
import { getProfileApi } from "@/services/authApi";

interface Props { user: any; profile: any; onRefresh: () => void; }

const inp = "w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-2.5 text-sm text-[#0B3C8C] placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all";

export const ProfileSection = ({ user, profile, onRefresh }: Props) => {
  const [tab, setTab]     = useState<"info" | "security" | "preferences">("info");
  const [saving, setSave] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm]   = useState({
    username:    "",
    email:       "",
    phone:       "",
    agency_name: "",
    additional_info_en: "",
  });

  useEffect(() => {
    const src = profile ?? user ?? {};
    setForm({
      username:    src.username    ?? "",
      email:       src.email       ?? "",
      phone:       src.phone       ?? "",
      agency_name: src.agency_name ?? "",
      additional_info_en: src.additional_info_en ?? "",
    });
  }, [user, profile]);

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSave(true);
    try {
      // TODO: wire to updateProfileApi when available
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onRefresh();
    } catch { alert("Failed to save profile."); }
    finally { setSave(false); }
  };

  const src = profile ?? user ?? {};
  const initials = (form.username || form.phone || "U").charAt(0).toUpperCase();
  const joinDate = src.date_created ? new Date(src.date_created).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";
  const lastLogin = src.last_login_date ? new Date(src.last_login_date).toLocaleString("en-IN") : "—";

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">

      {/* Profile header */}
      <div className="bg-gradient-to-r from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0">
            {src.ava ? <img src={src.ava} alt="" className="w-full h-full object-cover rounded-2xl" /> : initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="pf text-xl font-bold">{form.username || form.phone || "User"}</h2>
            <p className="text-blue-200 text-xs mt-0.5">{form.email || "No email set"}</p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${src.is_otp_verified ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"}`}>
                {src.is_otp_verified ? "✅ OTP Verified" : "❌ Not Verified"}
              </span>
              <span className="text-[9px] font-bold text-blue-200 bg-blue-400/20 px-2 py-0.5 rounded-full capitalize">
                {src.role ?? "registered"}
              </span>
              {src.active ? (
                <span className="text-[9px] font-bold text-emerald-200 bg-emerald-400/20 px-2 py-0.5 rounded-full">Active</span>
              ) : (
                <span className="text-[9px] font-bold text-red-200 bg-red-400/20 px-2 py-0.5 rounded-full">Inactive</span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/15 relative z-10">
          {[["Joined", joinDate], ["Last Login", lastLogin], ["IP", src.last_ip_addr ?? "—"]].map(([l, v]) => (
            <div key={String(l)}>
              <p className="text-blue-300 text-[9px] font-semibold uppercase tracking-wider">{l}</p>
              <p className="text-white text-[10px] font-bold mt-0.5 break-all">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-blue-100 rounded-xl p-1 mb-5 w-fit">
        {(["info","security","preferences"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-[11px] font-bold capitalize transition-all border-none cursor-pointer font-[inherit]
              ${tab === t ? "bg-[#0B3C8C] text-white shadow-sm" : "text-slate-500 hover:bg-blue-50"}`}>
            {t === "info" ? "👤 Info" : t === "security" ? "🔒 Security" : "⚙️ Preferences"}
          </button>
        ))}
      </div>

      {/* ── INFO TAB ── */}
      {tab === "info" && (
        <div className="bg-white rounded-2xl border border-blue-50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Username / Name</label>
              <input value={form.username} onChange={(e) => set("username", e.target.value)}
                placeholder="Your name" className={inp} style={{fontSize:"16px"}} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com" className={inp} style={{fontSize:"16px"}} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Phone</label>
              <div className="flex gap-2">
                <span className="flex items-center border-2 border-blue-100 bg-white rounded-xl px-3 text-sm font-bold text-[#0B3C8C] flex-shrink-0">🇮🇳 +91</span>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/,"").slice(0,10))}
                  placeholder="10-digit number" className={`${inp} flex-1`} style={{fontSize:"16px"}} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Agency / Company Name</label>
              <input value={form.agency_name} onChange={(e) => set("agency_name", e.target.value)}
                placeholder="e.g. ABC Realty" className={inp} style={{fontSize:"16px"}} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Bio / About</label>
            <textarea value={form.additional_info_en} onChange={(e) => set("additional_info_en", e.target.value)}
              placeholder="Tell buyers about yourself..." rows={3}
              className={`${inp} resize-none`} style={{fontSize:"16px"}} />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-blue-50">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-[11px] font-black rounded-xl border-none cursor-pointer hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all disabled:opacity-60 font-[inherit]">
              {saving ? "Saving..." : saved ? "✅ Saved!" : "💾 Save Changes"}
            </button>
            {saved && <p className="text-[11px] font-bold text-emerald-600">Profile updated successfully</p>}
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {tab === "security" && (
        <div className="bg-white rounded-2xl border border-blue-50 p-5 space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-[#0B3C8C]">OTP Verification</p>
              <p className="text-xs text-slate-500 mt-0.5">Phone: {form.phone || "Not set"}</p>
            </div>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${src.is_otp_verified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {src.is_otp_verified ? "✅ Verified" : "❌ Not Verified"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-[#0B3C8C]">Account Status</p>
              <p className="text-xs text-slate-500 mt-0.5">Your account is {src.active ? "active" : "inactive"}</p>
            </div>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${src.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {src.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-[#0B3C8C]">Last Login IP</p>
              <p className="text-xs text-slate-500 mt-0.5">{src.last_ip_addr ?? "—"}</p>
            </div>
            <p className="text-xs text-slate-400">{lastLogin}</p>
          </div>
          <div className="pt-2">
            <button className="w-full py-3 bg-red-50 border-2 border-red-200 text-red-600 text-[11px] font-black rounded-xl hover:bg-red-100 transition-colors border-none cursor-pointer font-[inherit]">
              🚪 Sign Out From All Devices
            </button>
          </div>
        </div>
      )}

      {/* ── PREFERENCES TAB ── */}
      {tab === "preferences" && (
        <div className="bg-white rounded-2xl border border-blue-50 p-5 space-y-3">
          {[
            { label: "Email Notifications", sub: "Get leads and updates via email", key: "email_notif", val: true },
            { label: "SMS Alerts",           sub: "Receive SMS for new enquiries", key: "sms_notif",   val: true },
            { label: "Hide Contact Number", sub: "Show masked number to buyers",   key: "hide_number", val: false },
            { label: "Newsletter",          sub: "Market insights & property tips", key: "newsletter", val: false },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl border border-blue-50 hover:bg-blue-50/50 transition-colors">
              <div>
                <p className="text-sm font-bold text-[#0B3C8C]">{pref.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{pref.sub}</p>
              </div>
              <label className="relative flex-shrink-0 cursor-pointer">
                <input type="checkbox" defaultChecked={pref.val} className="sr-only peer" />
                <div className="w-10 h-5.5 bg-slate-200 rounded-full peer-checked:bg-[#1D4ED8] transition-colors" style={{height:"22px"}} />
                <div className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" style={{width:"18px",height:"18px"}} />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
