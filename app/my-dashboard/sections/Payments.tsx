"use client";

import { useState } from "react";
import { PanelData } from "../UserPanel";
import { getWalletTransactionsApi } from "@/services/propertyApi";

interface Props { data: PanelData; onRefresh: () => void; }

const PLANS = [
  { key: "silver",   name: "Silver",   price: "₹999",   posts: 20, rank: "Normal",   color: "from-slate-400 to-slate-500",   perks: ["20 Active Listings","Normal Ranking","WhatsApp Leads","Dashboard"] },
  { key: "gold",     name: "Gold",     price: "₹1,999", posts: 30, rank: "Priority", color: "from-amber-400 to-amber-500",   perks: ["30 Listings","Priority Rank","HD Photo Boost","Featured Badge","Analytics"], hot: true },
  { key: "platinum", name: "Platinum", price: "₹3,999", posts: 99, rank: "Top",      color: "from-[#1D4ED8] to-[#2563EB]",  perks: ["Unlimited Listings","Top Rank","Virtual Tour","Full Analytics","Support"] },
];

const TXN_TYPE_COLOR: Record<string, string> = {
  credit:  "text-emerald-600 bg-emerald-50",
  debit:   "text-red-500 bg-red-50",
  refund:  "text-blue-600 bg-blue-50",
};

export const Payments = ({ data, onRefresh }: Props) => {
  const [tab, setTab] = useState<"wallet" | "plans" | "history">("wallet");
  const [loadingMore, setLoadMore] = useState(false);
  const [txns, setTxns] = useState<any[] | null>(null);

  const wallet = data.wallet;
  const balance = wallet?.balance ?? 0;
  const postsUsed = wallet?.posts_used ?? 0;
  const postsRemaining = wallet?.posts_remaining ?? 0;

  const loadHistory = async () => {
    if (txns) return;
    setLoadMore(true);
    try {
      const res = await getWalletTransactionsApi(1, 20);
      setTxns(res.data?.data ?? res.data ?? []);
    } catch { setTxns([]); }
    finally { setLoadMore(false); }
  };

  if (tab === "history" && !txns && !loadingMore) loadHistory();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-blue-100 rounded-xl p-1 mb-5 w-fit">
        {(["wallet","plans","history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-[11px] font-bold capitalize transition-all border-none cursor-pointer font-[inherit]
              ${tab === t ? "bg-[#0B3C8C] text-white shadow-sm" : "text-slate-500 hover:bg-blue-50"}`}>
            {t === "wallet" ? "💳 Wallet" : t === "plans" ? "📦 Plans" : "📋 History"}
          </button>
        ))}
      </div>

      {/* ── WALLET TAB ── */}
      {tab === "wallet" && (
        <div className="space-y-4">
          {/* Balance card */}
          <div className="bg-gradient-to-br from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6] rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white" />
            </div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-200 mb-1">Wallet Balance</p>
            <p className="text-4xl font-black mt-1">
              ₹{data.loadingWallet ? "—" : balance.toLocaleString("en-IN")}
            </p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-blue-200 text-[10px] font-semibold">Posts Used</p>
                <p className="text-white font-black text-lg">{postsUsed}</p>
              </div>
              <div>
                <p className="text-blue-200 text-[10px] font-semibold">Posts Remaining</p>
                <p className="text-emerald-300 font-black text-lg">{postsRemaining}</p>
              </div>
              <div>
                <p className="text-blue-200 text-[10px] font-semibold">Token Rate</p>
                <p className="text-white font-black text-lg">Every 20 posts</p>
              </div>
            </div>
          </div>

          {/* Add money */}
          <div className="bg-white rounded-2xl border border-blue-50 p-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Add Money to Wallet</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                <button key={amt}
                  className="py-2.5 text-[11px] font-black text-[#0B3C8C] bg-blue-50 hover:bg-blue-100 rounded-xl border-none cursor-pointer transition-colors font-[inherit]">
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="Enter custom amount"
                className="flex-1 bg-white border-2 border-blue-100 rounded-xl px-4 py-2.5 text-sm text-[#0B3C8C] focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
              <button className="px-5 py-2.5 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-[11px] font-black rounded-xl border-none cursor-pointer hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all">
                Pay Now
              </button>
            </div>
          </div>

          {/* Recent txns preview */}
          <div className="bg-white rounded-2xl border border-blue-50 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Recent Transactions</p>
              <button onClick={() => setTab("history")} className="text-[10px] font-black text-blue-600 border-none cursor-pointer bg-transparent">View All →</button>
            </div>
            {data.transactions.slice(0, 5).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No transactions yet</p>
            ) : data.transactions.slice(0, 5).map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${TXN_TYPE_COLOR[t.type] ?? "bg-slate-50 text-slate-500"}`}>
                  {t.type === "credit" ? "↑" : "↓"} {(t.type ?? "").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{t.description ?? t.reason ?? "Transaction"}</p>
                  <p className="text-[10px] text-slate-400">{t.created_at ? new Date(t.created_at).toLocaleDateString("en-IN") : "—"}</p>
                </div>
                <p className={`text-[11px] font-black flex-shrink-0 ${t.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                  {t.type === "credit" ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PLANS TAB ── */}
      {tab === "plans" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 mb-4">Upgrade your plan to post more listings and rank higher in search results.</p>
          {PLANS.map((plan) => (
            <div key={plan.key} className={`bg-white rounded-2xl border-2 p-5 relative overflow-hidden transition-all hover:shadow-md ${plan.hot ? "border-amber-300" : "border-blue-50"}`}>
              {plan.hot && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow`}>
                  {plan.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-black text-[#0B3C8C]">{plan.name}</p>
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{plan.posts === 99 ? "Unlimited" : `${plan.posts} listings`}</span>
                    <span className="text-[9px] font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{plan.rank} Rank</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {plan.perks.map((perk) => (
                      <span key={perk} className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">✓ {perk}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-black text-[#0B3C8C]">{plan.price}</p>
                  <p className="text-[10px] text-slate-400">/listing</p>
                  <button className={`mt-2 px-4 py-2 text-[10px] font-black rounded-xl border-none cursor-pointer transition-all font-[inherit]
                    ${plan.hot
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
                      : "bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"}`}>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
          <div className="p-4 border-b border-blue-50">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Full Transaction History</p>
          </div>
          {loadingMore ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : !txns || txns.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No transactions found</div>
          ) : txns.map((t: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${TXN_TYPE_COLOR[t.type] ?? "bg-slate-50 text-slate-500"}`}>
                {t.type === "credit" ? "↑" : "↓"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-700 truncate">{t.description ?? t.reason ?? "Transaction"}</p>
                <p className="text-[9px] text-slate-400">{t.created_at ? new Date(t.created_at).toLocaleString("en-IN") : "—"} · Ref: {t.id ?? "—"}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-[12px] font-black ${t.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                  {t.type === "credit" ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}
                </p>
                <p className="text-[9px] text-slate-400">Bal: ₹{Number(t.balance_after ?? 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
