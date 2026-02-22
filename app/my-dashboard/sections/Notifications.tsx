"use client";
import { PanelData } from "../UserPanel";

interface Props { data: PanelData; }

const typeStyle: Record<string, string> = {
  error:   "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  success: "bg-emerald-50 border-emerald-200",
};

export const Notifications = ({ data }: Props) => {
  const notifs = [
    ...data.rejected.map((p: any) => ({
      id: `rej-${p.id}`, type: "error", icon: "❌",
      title: "Listing Rejected",
      body: `"${p.residentialType || p.propertyCategory || "Property"}" was rejected.${p.rejection_reason ? ` Reason: ${p.rejection_reason}` : ""}`,
      time: p.updated_at,
    })),
    ...data.expired.map((p: any) => ({
      id: `exp-${p.id}`, type: "warning", icon: "⏰",
      title: "Listing Expired",
      body: `"${p.residentialType || p.propertyCategory || "Property"}" in ${p.city || "unknown"} has expired. Renew to stay visible.`,
      time: p.updated_at,
    })),
    ...data.published.filter((p: any) => (p.enquiries ?? 0) > 0).map((p: any) => ({
      id: `lead-${p.id}`, type: "success", icon: "📞",
      title: "New Enquiry",
      body: `${p.enquiries} enquir${p.enquiries === 1 ? "y" : "ies"} on "${p.residentialType || p.propertyCategory || "Property"}"`,
      time: p.updated_at,
    })),
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="pf text-lg font-bold text-[#0B3C8C]">Notifications</h2>
        {notifs.length > 0 && <button className="text-[10px] font-black text-blue-600 border-none cursor-pointer bg-transparent">Mark all read</button>}
      </div>
      {notifs.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-blue-100 p-12 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-sm font-bold text-slate-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${typeStyle[n.type] ?? "bg-white border-blue-50"}`}>
              <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0B3C8C]">{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                {n.time && <p className="text-[9px] text-slate-400 mt-1.5">{new Date(n.time).toLocaleString("en-IN")}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
