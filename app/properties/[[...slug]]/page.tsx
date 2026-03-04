/**
 * Think4BuySale — Dynamic Listing Route
 * ───────────────────────────────────────
 * Handles SquareYards-style SEO URLs:
 *
 *   /properties                               → all listings
 *   /properties/sale                          → for sale
 *   /properties/rent                          → for rent
 *   /properties/pg                            → PG listings
 *   /properties/1bhk-for-sale-in-mumbai       → filtered (by segment)
 *   /properties/2bhk-flat-for-rent-in-noida
 *   /properties/commercial-for-sale
 *   /properties/top                           → popular sort
 *   /properties/verified                      → RERA verified
 *
 * File: app/properties/[[...slug]]/page.tsx
 *       (catch-all so /properties also works)
 */

import { Metadata } from "next";
import PropertiesPage from "@/properties/component/PropertiesPage";
import type { BrowseFilters } from "@/services/propertyApi";

// ─── URL SEGMENT PARSING ──────────────────────────────────────────────────────

interface ParsedSegment {
  listingType?: string;
  config_type_id?: number;   // BHK
  category_id?: number;      // property type
  localityHint?: string;     // for heading only (city / area from URL)
  sort?: string;
  heading: string;
  breadcrumbs: { label: string; href?: string }[];
}

const BHK_MAP: Record<string, number> = {
  "1rk":1, "1bhk":2, "2bhk":3, "3bhk":4, "4bhk":5, "4bhk+":6,
};

const CATEGORY_MAP: Record<string, number> = {
  "flat":1, "apartment":1, "house":1, "villa":1, "plot":1,
  "residential":1, "commercial":2, "office":2, "shop":2,
  "pg":4, "hostel":4, "coliving":4, "co-living":4,
  "project":5,
};

function parseSlug(slug: string[]): ParsedSegment {
  if (!slug || slug.length === 0) {
    return { heading:"All Properties", breadcrumbs:[{label:"All Properties"}] };
  }

  const raw = slug[0].toLowerCase();

  // Simple shortcuts
  if (raw === "sale"     ) return { listingType:"sell", heading:"Properties for Sale",     breadcrumbs:[{label:"For Sale"}] };
  if (raw === "rent"     ) return { listingType:"rent", heading:"Properties for Rent",     breadcrumbs:[{label:"For Rent"}] };
  if (raw === "pg"       ) return { listingType:"pg",   heading:"PG & Co-living",          breadcrumbs:[{label:"PG/Co-living"}] };
  if (raw === "top"      ) return { sort:"popular",     heading:"Top & Featured Listings", breadcrumbs:[{label:"Top Listings"}] };
  if (raw === "new"      ) return { sort:"latest",      heading:"Newly Listed Properties", breadcrumbs:[{label:"New Listings"}] };
  if (raw === "verified" ) return { listingType:"sell", heading:"RERA Verified Listings",  breadcrumbs:[{label:"Verified Listings"}] };

  // Parse compound slug: "2bhk-flat-for-sale-in-mumbai"
  const parts  = raw.split("-");
  const result: ParsedSegment = { heading:"", breadcrumbs:[] };
  const headParts: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];

    // BHK
    if (BHK_MAP[w]) {
      result.config_type_id = BHK_MAP[w];
      headParts.push(w.toUpperCase());
      continue;
    }

    // Category / subtype
    if (CATEGORY_MAP[w]) {
      result.category_id = CATEGORY_MAP[w];
      const label = w.charAt(0).toUpperCase() + w.slice(1);
      headParts.push(label);
      continue;
    }

    // Listing type
    if (w === "sale") { result.listingType = "sell"; headParts.push("for Sale"); continue; }
    if (w === "rent") { result.listingType = "rent"; headParts.push("for Rent"); continue; }

    // "in" separator → rest is city/locality
    if (w === "in" && i < parts.length - 1) {
      const city = parts.slice(i+1).map(p => p.charAt(0).toUpperCase()+p.slice(1)).join(" ");
      result.localityHint = city;
      headParts.push(`in ${city}`);
      break;
    }
  }

  if (!headParts.length) headParts.push("Properties");
  if (!result.listingType) result.listingType = "sell";

  result.heading = headParts.join(" ");
  result.breadcrumbs = [{ label: result.heading }];
  return result;
}

// ─── GENERATE METADATA ───────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug?: string[] } }
): Promise<Metadata> {
  const { heading } = parseSlug(params.slug ?? []);
  return {
    title:       `${heading} | Think4BuySale`,
    description: `Browse ${heading} on Think4BuySale. 50,000+ verified properties across India. Post for free, no broker fees.`,
    openGraph: {
      title:       `${heading} | Think4BuySale`,
      description: `Explore verified ${heading.toLowerCase()} listings on Think4BuySale`,
      type: "website",
    },
  };
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PropertyListingRoute({
  params,
}: {
  params: { slug?: string[] };
}) {
  const { heading, breadcrumbs, listingType, config_type_id, category_id, sort } =
    parseSlug(params.slug ?? []);

  const defaultFilters: Partial<BrowseFilters> = {};
  if (listingType)    defaultFilters.listingType    = listingType;
  if (config_type_id) defaultFilters.config_type_id = config_type_id;
  if (category_id)    defaultFilters.category_id    = category_id;
  if (sort)           defaultFilters.sort           = sort as any;

  return (
    <PropertiesPage
      heading={heading}
      defaultFilters={defaultFilters}
      breadcrumbs={breadcrumbs}
    />
  );
}