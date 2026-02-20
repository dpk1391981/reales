"use client";

import { useState } from "react";

const footerLinks = {
  sale: [
    "Real estate in Delhi",
    "Real estate in Mumbai",
    "Real estate in Gurgaon",
    "Real estate in Bangalore",
    "Real estate in Pune",
    "Real estate in Noida",
    "Real estate in Chennai",
    "Real estate in Hyderabad",
  ],
  flatsSale: [
    "Flats in Delhi",
    "Flats in Mumbai",
    "Flats in Gurgaon",
    "Flats in Bangalore",
    "Flats in Pune",
    "Flats in Noida",
    "Flats in Chennai",
    "Flats in Hyderabad",
  ],
  flatsRent: [
    "Flats for Rent in Delhi",
    "Flats for Rent in Mumbai",
    "Flats for Rent in Gurgaon",
    "Flats for Rent in Bangalore",
    "Flats for Rent in Pune",
    "Flats for Rent in Noida",
    "Flats for Rent in Chennai",
    "Flats for Rent in Hyderabad",
  ],
  projects: [
    "Projects in Delhi",
    "Projects in Mumbai",
    "Projects in Gurgaon",
    "Projects in Bangalore",
    "Projects in Pune",
    "Projects in Noida",
    "Projects in Chennai",
    "Projects in Hyderabad",
  ],
};

const QUICK_LINKS = [
  { label: "About Us", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Sitemap", href: "#" },
  { label: "RERA Info", href: "#" },
];

const SOCIAL = [
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    href: "#",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

const FOOTER_SECTIONS = [
  { title: "Property for Sale", links: footerLinks.sale },
  { title: "Flats for Sale",    links: footerLinks.flatsSale },
  { title: "Flats for Rent",    links: footerLinks.flatsRent },
  { title: "New Projects",      links: footerLinks.projects },
];

// ── Icons ──────────────────────────────────────────────────────────────────────

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    className={`transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

// ── Accordion Section (mobile) ────────────────────────────────────────────────

const FooterAccordion = ({ title, links }: { title: string; links: string[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left
          border-none bg-transparent cursor-pointer font-[inherit]
          active:opacity-80"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className="text-sm font-bold text-amber-400 tracking-wide">{title}</span>
        <ChevronDown open={open} />
      </button>

      {/* Links */}
      {open && (
        <div className="pb-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {links.map((link) => (
            <a key={link} href="#"
              className="text-xs text-white/70 no-underline active:text-amber-400 transition-colors leading-snug">
              {link}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Footer ───────────────────────────────────────────────────────────────

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <footer className="bg-[#0f2342] text-white font-[DM_Sans,sans-serif]">

        {/* ── CTA Banner ── */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 md:px-6 py-5 md:py-6">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center
            justify-between gap-4">
            <div>
              <p className="font-bold text-[#0f2342] text-base md:text-lg leading-none mb-0.5">
                Post Your Property for FREE
              </p>
              <p className="text-[#0f2342]/70 text-xs md:text-sm">
                Connect with 10M+ genuine buyers across India
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <a href="#"
                className="flex-1 sm:flex-none flex items-center justify-center
                  bg-[#0f2342] text-white text-sm font-bold px-6 py-3 rounded-xl
                  no-underline active:scale-95 transition-all hover:bg-[#1a3a6e]"
                style={{ WebkitTapHighlightColor: "transparent" }}>
                Post Property
              </a>
              <a href="#"
                className="flex-1 sm:flex-none flex items-center justify-center
                  bg-white/30 text-[#0f2342] text-sm font-bold px-6 py-3 rounded-xl
                  no-underline active:scale-95 transition-all hover:bg-white/50 border border-[#0f2342]/20"
                style={{ WebkitTapHighlightColor: "transparent" }}>
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* ── Main Footer Body ── */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-10 md:pt-16">

          {/* Brand + contact row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10 md:mb-14
            pb-8 md:pb-12 border-b border-white/10">

            {/* Brand block */}
            <div className="max-w-[280px]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-white/20 to-amber-400/60
                  rounded-[9px] flex items-center justify-center">
                  <HomeIcon />
                </div>
                <div>
                  <p className="font-[Playfair_Display,serif] text-lg font-bold text-white leading-none">
                    Think4BuySale
                  </p>
                  <p className="text-[9px] font-semibold text-amber-400 tracking-[0.15em] uppercase">
                    India's Premier Realty
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                India's trusted real estate platform — buy, sell or rent verified properties across 50+ cities.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-2">
                {SOCIAL.map((s) => (
                  <a key={s.name} href={s.href}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-[#0f2342]
                      text-white/70 flex items-center justify-center transition-all
                      active:scale-90"
                    aria-label={s.name}
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact block */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-amber-400 mb-1">
                Get in Touch
              </p>
              <a href="tel:+918285257636"
                className="flex items-center gap-2.5 text-sm text-white/80 no-underline
                  hover:text-amber-400 active:text-amber-400 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <PhoneIcon />
                </span>
                8285-25-76-36
              </a>
              <a href="mailto:support@think4buysale.in"
                className="flex items-center gap-2.5 text-sm text-white/80 no-underline
                  hover:text-amber-400 active:text-amber-400 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MailIcon />
                </span>
                support@think4buysale.in
              </a>
              <p className="flex items-start gap-2.5 text-sm text-white/60">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  📍
                </span>
                <span>New Delhi, India — 110092</span>
              </p>
            </div>
          </div>

          {/* ── Links: Accordion on mobile, 4-col grid on desktop ── */}

          {/* Mobile accordions */}
          <div className="md:hidden divide-y divide-white/10 mb-8">
            {FOOTER_SECTIONS.map((sec) => (
              <FooterAccordion key={sec.title} title={sec.title} links={sec.links} />
            ))}
          </div>

          {/* Desktop 4-col grid */}
          <div className="hidden md:grid grid-cols-4 gap-10 mb-14">
            {FOOTER_SECTIONS.map((sec) => (
              <div key={sec.title}>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-[0.12em] mb-5">
                  {sec.title}
                </h3>
                <ul className="space-y-2.5">
                  {sec.links.map((link) => (
                    <li key={link}>
                      <a href="#"
                        className="text-sm text-white/70 no-underline hover:text-amber-400
                          transition-colors leading-snug">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Bottom bar ── */}
          <div className="border-t border-white/10 pt-6 pb-8
            flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Quick links */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2">
              {QUICK_LINKS.map((link) => (
                <a key={link.label} href={link.href}
                  className="text-xs text-white/60 no-underline hover:text-amber-400
                    active:text-amber-400 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-white/40 text-center sm:text-right flex-shrink-0">
              © {new Date().getFullYear()} Think4BuySale. All rights reserved.
            </p>
          </div>

        </div>

        {/* ── Back to top — mobile floating ── */}
        <button
          onClick={scrollTop}
          className="fixed bottom-5 right-4 z-50 sm:hidden
            w-11 h-11 rounded-full bg-amber-400 text-[#0f2342]
            flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.5)]
            active:scale-90 transition-all border-none cursor-pointer"
          aria-label="Back to top"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <ArrowUpIcon />
        </button>

      </footer>
    </>
  );
}