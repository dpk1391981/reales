"use client";

interface SuccessProps {
  onReset: () => void;
}

export const Success = ({ onReset }: SuccessProps) => (
  <div className="min-h-screen bg-gradient-to-br from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.3)] p-8 max-w-sm w-full text-center relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0B3C8C] via-[#2563EB] to-emerald-400" />
      <div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_32px_rgba(52,211,153,0.5)]"
        style={{ animation: "successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#0B3C8C] mb-2">
        Property Listed! 🎉
      </h2>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Your listing is now live. Serious buyers will start contacting you soon.
      </p>
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {[
          ["📞", "Enquiries via SMS & Call"],
          ["✅", "Live within 24 hours"],
          ["🔒", "RERA badge applied"],
          ["📊", "Track in dashboard"],
          ["❤️", "Save to favourites"],
          ["🔍", "Appears in search"],
        ].map(([icon, label]) => (
          <div key={String(label)} className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-[10px] font-bold text-slate-600 leading-tight">{label}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onReset}
        className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white py-4 rounded-2xl text-sm font-bold border-none cursor-pointer hover:shadow-[0_8px_24px_rgba(29,78,216,0.3)] active:scale-[0.97] transition-all font-[inherit]"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        Post Another Property →
      </button>
    </div>
  </div>
);