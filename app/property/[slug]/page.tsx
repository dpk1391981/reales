// app/property/[slug]/page.tsx
// SEO-friendly URL: /property/2-bhk-independent-house-sector-21-noida-1740234567890
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyViewClient } from "@/component/property/PropertyViewClient";
import Script from "next/script";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

const SITE_URL = "https://think4buysale.in";
const SITE_NAME = "Think4BuySale.in";

// ─── ID LABEL MAPS (for metadata only) ───────────────────────────────────────
const CONFIG_LABEL: Record<number, string> = {
  1: "1 RK", 2: "1 BHK", 3: "2 BHK", 4: "3 BHK", 5: "4 BHK", 6: "4+ BHK",
};
const SUB_LABEL: Record<number, string> = {
  101: "Flat / Apartment", 102: "Independent House", 103: "Villa",
  104: "Builder Floor",    105: "Residential Plot",  106: "Farm House",
  201: "Office Space",     202: "IT Park",           203: "Shop / Showroom",
  204: "Warehouse",        205: "Co-working Space",  206: "Commercial Plot",
  301: "Factory",          302: "Warehouse",         303: "Cold Storage",
  401: "PG / Hostel",      402: "Co-living",
  501: "Residential Project", 502: "Commercial Project",
};

const fmtPriceShort = (v: string | number | null): string => {
  const n = Number(v);
  if (!n || isNaN(n)) return "";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

function fullImgUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

// ─── SERVER FETCH ─────────────────────────────────────────────────────────────
async function getProperty(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/properties/${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60s
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json;
  } catch {
    return null;
  }
}

// ─── DYNAMIC METADATA ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {

  const slugData = await params;
  const p = await getProperty(slugData?.slug);
  if (!p) {
    return {
      title: `Property Not Found | ${SITE_NAME}`,
      description: "This listing is no longer available.",
    };
  }

  const bhk      = p.config_type_id ? (CONFIG_LABEL[p.config_type_id] ?? "") : "";
  const type     = p.subcategory_id ? (SUB_LABEL[p.subcategory_id] ?? "Property")  : "Property";
  const locality = p.locality ?? p.society ?? "";
  const city     = p.city     ?? "";
  const listFor  = p.listingType === "rent" ? "for Rent" : "for Sale";
  const price    = fmtPriceShort(p.price);
  const area     = p.area ? `${Number(p.area).toLocaleString()} sq.ft` : "";

  const heading  = p.title ?? [bhk, type].filter(Boolean).join(" ");
  const fullTitle = `${heading} ${listFor} in ${[locality, city].filter(Boolean).join(", ")} | ${SITE_NAME}`;

  const desc =
    p.description?.slice(0, 155) ??
    [
      `${heading} ${listFor}`,
      locality && `in ${locality}`,
      city && city,
      price && `at ${price}`,
      area && `· ${area}`,
      `Posted on ${SITE_NAME}`,
    ]
      .filter(Boolean)
      .join(" ");

  const cover = fullImgUrl(p.cover_photo ?? p.photos?.[0]);
  const canonical = `${SITE_URL}/property/${slugData?.slug}`;

  return {
    title: fullTitle,
    description: desc,
    keywords: [bhk, type, city, locality, "property", listFor, "India", SITE_NAME].filter(Boolean).join(", "),
    openGraph: {
      title:       heading,
      description: desc,
      url:         canonical,
      type:        "website",
      siteName:    SITE_NAME,
      images:      cover ? [{ url: cover, width: 1200, height: 630, alt: heading }] : [],
    },
    twitter: {
      card:        "summary_large_image",
      title:       heading,
      description: desc,
      images:      cover ? [cover] : [],
    },
    alternates: { canonical },
    robots:    { index: p.status === "published", follow: true },
  };
}

// ─── JSON-LD structured data ──────────────────────────────────────────────────
function buildJsonLd(p: any, slug: string) {
  const cover  = fullImgUrl(p.cover_photo ?? p.photos?.[0]);
  const price  = p.price ? Number(p.price) : undefined;
  const canonical = `${SITE_URL}/property/${slug}`;

  return {
    "@context":    "https://schema.org",
    "@type":       "RealEstateListing",
    "name":        p.title ?? `${CONFIG_LABEL[p.config_type_id] ?? ""} ${SUB_LABEL[p.subcategory_id] ?? "Property"}`.trim(),
    "description": p.description ?? "",
    "url":         canonical,
    ...(cover && { "image": cover }),
    ...(price && {
      "offers": {
        "@type":         "Offer",
        "price":         price,
        "priceCurrency": "INR",
        "availability":  "https://schema.org/InStock",
      },
    }),
    "address": {
      "@type":           "PostalAddress",
      "addressLocality": p.locality ?? p.society ?? "",
      "addressRegion":   p.state    ?? "",
      "postalCode":      p.pincode  ?? "",
      "addressCountry":  "IN",
    },
    "floorSize": p.area ? {
      "@type": "QuantitativeValue",
      "value": Number(p.area),
      "unitCode": "FTK",
    } : undefined,
    "numberOfBathroomsTotal": p.bathrooms ?? undefined,
    "datePosted": p.created_at,
    "provider":   { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
  };
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default async function PropertyPage({
  params,
}: {
  params: { slug: string };
}) {

const slugData = await params;
  const property = await getProperty(slugData?.slug);

  if (!property) notFound();

  return (
    <>
      {/* JSON-LD structured data for Google rich results */}
      <Script
        id="property-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(property, slugData?.slug)),
        }}
      />
      <PropertyViewClient property={property} slug={slugData?.slug} />
    </>
  );
}