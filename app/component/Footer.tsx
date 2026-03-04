"use client";

import React, { useState } from "react";
import s from "../css_module/Footer.module.css";

/* ── Data ─────────────────────────────────────────────────── */

const footerLinks = {
  sale: ["Real estate in Delhi", "Real estate in Mumbai", "Real estate in Gurgaon", "Real estate in Bangalore", "Real estate in Pune", "Real estate in Noida", "Real estate in Chennai", "Real estate in Hyderabad"],
  flatsSale: ["Flats in Delhi", "Flats in Mumbai", "Flats in Gurgaon", "Flats in Bangalore", "Flats in Pune", "Flats in Noida", "Flats in Chennai", "Flats in Hyderabad"],
  flatsRent: ["Flats for Rent in Delhi", "Flats for Rent in Mumbai", "Flats for Rent in Gurgaon", "Flats for Rent in Bangalore", "Flats for Rent in Pune", "Flats for Rent in Noida", "Flats for Rent in Chennai", "Flats for Rent in Hyderabad"],
  projects: ["Projects in Delhi", "Projects in Mumbai", "Projects in Gurgaon", "Projects in Bangalore", "Projects in Pune", "Projects in Noida", "Projects in Chennai", "Projects in Hyderabad"],
};
const SECTIONS = [
  { title: "Property for Sale", links: footerLinks.sale },
  { title: "Flats for Sale", links: footerLinks.flatsSale },
  { title: "Flats for Rent", links: footerLinks.flatsRent },
  { title: "New Projects", links: footerLinks.projects },
];
const QUICK = [
  { label: "About Us", href: "#" }, { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" }, { label: "Terms & Conditions", href: "#" },
  { label: "Sitemap", href: "#" }, { label: "RERA Info", href: "#" },
];
const SOCIAL = [
  { name: "Facebook", href: "#", icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
  { name: "Instagram", href: "#", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
  { name: "Twitter / X", href: "#", icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "YouTube", href: "#", icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg> },
  { name: "LinkedIn", href: "#", icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
];

/* ── Icons ────────────────────────────────────────────────── */

const HomeIco = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const PhoneIco = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const MailIco = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const ArrowUp = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
const ChevDown = ({ open }: { open: boolean }) => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`${s.accordionChev} ${open ? s.accordionChevOpen : ""}`}><path d="M6 9l6 6 6-6"/></svg>;

/* ── Accordion ────────────────────────────────────────────── */

const Accordion = ({ title, links }: { title: string; links: string[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.accordionItem}>
      <button className={s.accordionToggle} onClick={() => setOpen(!open)}>
        <span className={s.accordionTitle}>{title}</span>
        <ChevDown open={open} />
      </button>
      {open && (
        <div className={s.accordionLinks}>
          {links.map(l => <a key={l} href="#" className={s.accordionLink}>{l}</a>)}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className={s.footer} style={{ fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)" }}>

      {/* CTA Banner */}
      <div className={s.ctaBanner}>
        <div className={s.ctaInner}>
          <div>
            <p className={s.ctaTitle}>Post Your Property for FREE</p>
            <p className={s.ctaSub}>Connect with 10M+ genuine buyers across India</p>
          </div>
          <div className={s.ctaBtns}>
            <a href="#" className={s.ctaPrimary}>Post Property</a>
            <a href="#" className={s.ctaSecondary}>Learn More</a>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={s.body}>

        {/* Brand + Contact */}
        <div className={s.topRow}>
          <div className={s.brand}>
            <div className={s.brandRow}>
              <div className={s.brandLogo}><HomeIco /></div>
              <div>
                <p className={s.brandName} style={{ fontFamily: "var(--font-display)" }}>Think4BuySale</p>
                <p className={s.brandTag}>India&apos;s Premier Realty</p>
              </div>
            </div>
            <p className={s.brandDesc}>India&apos;s trusted real estate platform — buy, sell or rent verified properties across 50+ cities.</p>
            <div className={s.socialRow}>
              {SOCIAL.map(x => <a key={x.name} href={x.href} className={s.socialBtn} aria-label={x.name}>{x.icon}</a>)}
            </div>
          </div>

          <div className={s.contact}>
            <p className={s.contactLabel}>Get in Touch</p>
            <a href="tel:+918285257636" className={s.contactItem}>
              <span className={s.contactIcon}><PhoneIco /></span>8285-25-76-36
            </a>
            <a href="mailto:support@think4buysale.in" className={s.contactItem}>
              <span className={s.contactIcon}><MailIco /></span>support@think4buysale.in
            </a>
            <p className={s.contactItem} style={{ color: "rgba(255,255,255,0.6)" }}>
              <span className={s.contactIcon}>📍</span>
              <span>New Delhi, India — 110092</span>
            </p>
          </div>
        </div>

        {/* Accordion — mobile */}
        <div className={`${s.accordion} ${s.hideMd}`}>
          {SECTIONS.map(sec => <Accordion key={sec.title} title={sec.title} links={sec.links} />)}
        </div>

        {/* Grid — desktop */}
        <div className={s.linksGrid}>
          {SECTIONS.map(sec => (
            <div key={sec.title}>
              <h3 className={s.linksColTitle}>{sec.title}</h3>
              <ul className={s.linksList}>
                {sec.links.map(l => <li key={l}><a href="#" className={s.linksListItem}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={s.bottomBar}>
          <div className={s.quickLinks}>
            {QUICK.map(l => <a key={l.label} href={l.href} className={s.quickLink}>{l.label}</a>)}
          </div>
          <p className={s.copyright}>© {new Date().getFullYear()} Think4BuySale. All rights reserved.</p>
        </div>
      </div>

      {/* Back to top — mobile */}
      <button className={`${s.backToTop} ${s.hideSm}`} onClick={scrollTop} aria-label="Back to top">
        <ArrowUp />
      </button>
    </footer>
  );
}