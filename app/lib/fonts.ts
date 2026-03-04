// src/lib/fonts.ts
// ─────────────────────────────────────────────────────────────
// Font configuration for Next.js — import in layout.tsx
// Uses Plus Jakarta Sans (display headlines) + DM Sans (body)
//
// Usage in layout.tsx:
//   import { fontVars } from "@/lib/fonts";
//   <body className={fontVars}> ...
//
// Then in CSS modules use:
//   font-family: var(--font-display);
//   font-family: var(--font-body);
// ─────────────────────────────────────────────────────────────

import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/** Combine both variables — apply to <body> className */
export const fontVars = `${plusJakarta.variable} ${dmSans.variable}`;