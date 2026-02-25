"use client";

import { useState } from "react";
import {
  coverUrl,
  allPhotoUrls,
  propertyTitle,
  locationLabel,
  categoryLabel,
  subcategoryLabel,
  configTypeLabel,
  amenityLabels,
  fmtPrice,
  fmtDate,
  daysUntilExpiry,
  statusStyle,
} from "@/utils/propertyDisplay";

// ─── TYPES ────────────────────────────────────────────────────────────────────
// Reflects the exact shape returned by GET /properties/my

interface ApiProperty {
  id:              number;
  poster_type:     "agent" | "owner";
  poster_id:       number;
  status:          "published" | "draft" | "rejected" | "expired";
  is_active:       boolean;
  is_deleted:      boolean;
  expires_at:      string | null;
  slug:            string | null;

  // category FKs
  category_id?:    number;
  subcategory_id?: number;
  config_type_id?: number;

  listingType:     string;
  plan:            string | null;
  title?:          string | null;

  // numerics
  area:            string | null;
  price:           string | null;
  bathrooms:       number | null;
  balconies:       number | null;
  deposit:         string | null;
  maintenance:     string | null;

  // location
  country_id:      number;
  state_id:        number;
  city_id:         number;
  locality_id:     number | null;
  locality?:       string | null;
  society:         string | null;
  pincode:         string | null;
  address?:        string | null;

  // attributes
  furnishing:      string | null;
  facing:          string | null;
  age:             string | null;
  description?:    string | null;

  // flags
  negotiable:      boolean;
  urgent:          boolean;
  loanAvailable:   boolean;
  featured:        boolean;
  virtualTour:     boolean;
  hideNumber:      boolean;

  // contact
  ownerName:       string | null;
  ownerPhone:      string | null;

  // media
  photos:          string[] | null;
  cover_photo:     string | null;
  amenities:       number[] | null;  // integer FK array

  // ranking
  base_score:      number;
  boost_score:     number;

  // stats
  views_count:     number;
  leads_count:     number;
  saves_count:     number;

  created_at:      string;
  updated_at:      string;
}

interface Props {
  listings:    ApiProperty[];
  loading:     boolean;
  onDelete:    (id: number) => void;
  onNavigate:  (k: string) => void;
  initialTab?: string;   // pre-select tab: "all" | "published" | "draft" | "rejected" | "expired"
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS: { key: string; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "published", label: "Active"    },
  { key: "draft",     label: "Drafts"    },
  { key: "rejected",  label: "Rejected"  },
  { key: "expired",   label: "Expired"   },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const MyListings = ({ listings, loading, onDelete, onNavigate, initialTab = "all" }: Props) => {
  const [tab,        setTab]        = useState(initialTab);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search,     setSearch]     = useState("");

  // Filter by tab + search
  const visible = listings.filter((p) => {
    const matchTab    = tab === "all" || p.status === tab;
    const matchSearch = !search.trim() ||
      propertyTitle(p).toLowerCase().includes(search.toLowerCase()) ||
      locationLabel(p).toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Tab counts
  const count = (key: string) =>
    key === "all"
      ? listings.length
      : listings.filter((p) => p.status === key).length;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="pf text-xl font-bold text-[#0B3C8C]">My Listings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {listings.length} total · {count("published")} active
          </p>
        </div>
        <button
          onClick={() => { window.location.href = "/post-property"; }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-xs font-black rounded-xl border-none cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.4)] active:scale-95 transition-all"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          ➕ New Listing
        </button>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or location…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-blue-100 rounded-2xl text-sm font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
          style={{ fontSize: "16px" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 border-none bg-transparent cursor-pointer text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {TABS.map((t) => {
          const n = count(t.key);
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap border-none cursor-pointer transition-all flex-shrink-0
                ${active
                  ? "bg-[#0B3C8C] text-white shadow-[0_2px_10px_rgba(11,60,140,0.25)]"
                  : "bg-white border-2 border-blue-100 text-slate-500 hover:border-blue-300"
                }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {t.label}
              {n > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center
                  ${active ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-blue-50 animate-pulse h-24" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState tab={tab} search={search} />
      ) : (
        <div className="space-y-3">
          {visible.map((p) => (
            <ListingCard
              key={p.id}
              p={p}
              expanded={expandedId === p.id}
              onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── LISTING CARD ─────────────────────────────────────────────────────────────

function ListingCard({
  p,
  expanded,
  onToggle,
  onDelete,
}: {
  p:        ApiProperty;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: number) => void;
}) {
  const thumb    = coverUrl(p);
  const allPhotos = allPhotoUrls(p.photos);
  const title    = propertyTitle(p);
  const location = locationLabel(p);
  const price    = fmtPrice(p.price);
  const ss       = statusStyle(p.status);
  const days     = daysUntilExpiry(p.expires_at);
  const expiring = days !== null && days <= 7 && days >= 0 && p.status === "published";
  const amen     = amenityLabels(p.amenities);

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all overflow-hidden
      ${expanded ? "border-blue-200 shadow-[0_4px_24px_rgba(11,60,140,0.12)]" : "border-blue-50 hover:border-blue-100 hover:shadow-sm"}`}>

      {/* ── Main row ──────────────────────────────────────────────────────── */}
      <div className="p-3 flex items-start gap-3">

        {/* Cover photo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blue-50 flex-shrink-0 overflow-hidden border border-blue-100 relative">
          {thumb ? (
            <img
              src={thumb}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
          )}

          {/* Photo count badge */}
          {allPhotos.length > 0 && (
            <span className="absolute bottom-1 right-1 text-[9px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded-full">
              📷{allPhotos.length}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-black text-[#0B3C8C] truncate leading-tight">{title}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{location}</p>

              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}>
                  {ss.label.toUpperCase()}
                </span>
                {p.listingType && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                    {p.listingType}
                  </span>
                )}
                {p.featured && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                    ⭐ Featured
                  </span>
                )}
                {p.urgent && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                    ⚡ Urgent
                  </span>
                )}
              </div>
            </div>

            {/* Price + actions */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black text-[#0B3C8C]">{price}</p>
              {p.area && (
                <p className="text-[10px] text-slate-400">{Number(p.area).toLocaleString()} sq.ft</p>
              )}
              {/* Stats */}
              <div className="flex items-center justify-end gap-2 mt-1.5">
                <span className="text-[9px] text-slate-400">👁 {p.views_count}</span>
                <span className="text-[9px] text-slate-400">📞 {p.leads_count}</span>
                <span className="text-[9px] text-slate-400">❤️ {p.saves_count}</span>
              </div>
            </div>
          </div>

          {/* Expiry warning */}
          {expiring && (
            <p className="text-[10px] font-black text-amber-600 mt-1.5 flex items-center gap-1">
              ⏰ Expires in {days} day{days !== 1 ? "s" : ""}
              <span className="font-normal text-amber-500">— renew to stay visible</span>
            </p>
          )}
          {days !== null && days < 0 && p.status === "published" && (
            <p className="text-[10px] font-black text-rose-500 mt-1.5">
              ❌ Expired {Math.abs(days)} day{Math.abs(days) !== 1 ? "s" : ""} ago
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">

            {/* ── draft: single "Continue editing" button ── */}
            {p.status === "draft" && (
              <a
                href={`/post-property?draft=${p.id}`}
                className="text-[10px] font-black text-[#1D4ED8] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg no-underline hover:bg-blue-100 transition-colors"
              >
                ✏️ Continue
              </a>
            )}

            {/* ── published: "View" (public page) + "Edit" (form) ── */}
            {p.status === "published" && (
              <>
                {/* View — opens the public property page using SEO slug */}
                <a
                  href={p.slug ? `/property/${p.slug}` : `/property/${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg no-underline hover:bg-emerald-100 transition-colors"
                >
                  👁 View
                </a>
                {/* Edit — opens the post-property form pre-filled */}
                <a
                  href={`/post-property?edit=${p.id}`}
                  className="text-[10px] font-black text-[#1D4ED8] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg no-underline hover:bg-blue-100 transition-colors"
                >
                  ✏️ Edit
                </a>
              </>
            )}

            {/* ── rejected / expired: "Edit & Resubmit" ── */}
            {(p.status === "rejected" || p.status === "expired") && (
              <a
                href={`/post-property?edit=${p.id}`}
                className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg no-underline hover:bg-amber-100 transition-colors"
              >
                ✏️ Edit &amp; Resubmit
              </a>
            )}

            {/* Boost — only for published */}
            {p.status === "published" && (
              <button
                className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg border-none cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => { /* TODO: open boost modal */ }}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                🚀 Boost
              </button>
            )}

            {/* Share — only for published */}
            {p.status === "published" && p.slug && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/property/${p.slug}`;
                  navigator.share
                    ? navigator.share({ title, url })
                    : navigator.clipboard.writeText(url);
                }}
                className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg border-none cursor-pointer hover:bg-slate-100 transition-colors"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                🔗 Share
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => {
                if (confirm(`Delete "${title}"? This cannot be undone.`)) {
                  onDelete(p.id);
                }
              }}
              className="text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg border-none cursor-pointer hover:bg-rose-100 transition-colors ml-auto"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              🗑 Delete
            </button>

            {/* Expand toggle */}
            <button
              onClick={onToggle}
              className="text-[10px] font-black text-slate-400 bg-transparent border-none cursor-pointer px-1"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {expanded ? "▲ Less" : "▼ More"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Expanded detail panel ──────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t-2 border-blue-50 p-3 space-y-4 bg-gradient-to-b from-blue-50/30 to-white">

          {/* Photo strip */}
          {allPhotos.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Photos ({allPhotos.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {allPhotos.map((url, i) => (
                  <div
                    key={i}
                    className={`w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border-2 ${i === 0 ? "border-blue-300" : "border-blue-100"}`}
                  >
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details grid */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Property Details
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {[
                ["Category",     categoryLabel(p.category_id)],
                ["Type",         subcategoryLabel(p.subcategory_id)],
                ["Configuration", configTypeLabel(p.config_type_id)],
                ["Listing For",  p.listingType   ?? "—"],
                ["Area",         p.area          ? `${Number(p.area).toLocaleString()} sq.ft` : "—"],
                ["Price",        fmtPrice(p.price)],
                ...(p.deposit     ? [["Deposit",    fmtPrice(p.deposit)]]    : []),
                ...(p.maintenance ? [["Maintenance", fmtPrice(p.maintenance)]] : []),
                ["Bathrooms",    p.bathrooms     ?? "—"],
                ["Balconies",    p.balconies     ?? "—"],
                ["Furnishing",   p.furnishing    ?? "—"],
                ["Facing",       p.facing        ?? "—"],
                ["Age",          p.age           ?? "—"],
                ["Society",      p.society       ?? "—"],
                ["Pincode",      p.pincode       ?? "—"],
                ["Plan",         p.plan          ?? "—"],
                ["RERA",         (p as any).rera ?? "—"],
                ["Listed on",    fmtDate(p.created_at)],
                ["Expires on",   fmtDate(p.expires_at)],
                ["Slug",         p.slug          ?? "—"],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-[11px] font-bold text-[#0B3C8C] mt-0.5 capitalize break-words">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {amen.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Amenities ({amen.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {amen.map((a) => (
                  <span key={a} className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feature flags */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Features
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                [p.negotiable,   "Price Negotiable"],
                [p.urgent,       "Urgent"],
                [p.loanAvailable,"Loan Available"],
                [p.featured,     "Featured"],
                [p.virtualTour,  "Virtual Tour"],
                [p.hideNumber,   "Number Hidden"],
              ]
                .filter(([v]) => v)
                .map(([, label]) => (
                  <span key={String(label)} className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                    ✓ {String(label)}
                  </span>
                ))}
            </div>
          </div>

          {/* Description */}
          {(p as any).description && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-xs text-slate-600 leading-relaxed">{(p as any).description}</p>
            </div>
          )}

          {/* Performance stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Views",   value: p.views_count,   icon: "👁️", color: "text-blue-600"   },
              { label: "Leads",   value: p.leads_count,   icon: "📞", color: "text-emerald-600" },
              { label: "Saves",   value: p.saves_count,   icon: "❤️", color: "text-rose-500"    },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-blue-100 p-2.5 text-center">
                <p className="text-base">{s.icon}</p>
                <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ tab, search }: { tab: string; search: string }) {
  const isSearch = search.trim().length > 0;

  const MESSAGES: Record<string, { emoji: string; title: string; sub: string }> = {
    all:       { emoji: "🏠", title: "No listings yet",          sub: "Post your first property to get started" },
    published: { emoji: "📡", title: "No active listings",       sub: "Publish a draft or post a new property"  },
    draft:     { emoji: "📝", title: "No drafts",                sub: "Start filling in a new property form"    },
    rejected:  { emoji: "✅", title: "No rejected listings",     sub: "All your listings are in good standing"  },
    expired:   { emoji: "⏰", title: "No expired listings",      sub: "Your listings are still active"          },
  };

  const m = isSearch
    ? { emoji: "🔍", title: "No results", sub: `Nothing matched "${search}"` }
    : (MESSAGES[tab] ?? MESSAGES.all);

  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-blue-100 p-12 text-center">
      <p className="text-4xl mb-3">{m.emoji}</p>
      <p className="text-sm font-black text-slate-600 mb-1">{m.title}</p>
      <p className="text-xs text-slate-400 mb-5">{m.sub}</p>
      {tab === "all" && !isSearch && (
        <a
          href="/post-property"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-xs font-black rounded-xl no-underline shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.4)] transition-all"
        >
          ➕ Post Your First Property
        </a>
      )}
    </div>
  );
}