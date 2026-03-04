"use client";

import React from "react";
import s from "../css_module/TopServices.module.css";

/* ── Data ─────────────────────────────────────────────────── */

const services = [
  {
    title: "Buy a Home",
    description: "Explore verified flats, villas & plots across India's top cities.",
    icon: "🏠",
    button: "Browse Properties",
    stat: "2.4L+ listings",
    stripClass: "stripBlue",
    iconClass: "iconBlue",
  },
  {
    title: "Sell Property",
    description: "List your property and connect with thousands of genuine buyers.",
    icon: "📈",
    button: "Post Property",
    stat: "Free listing",
    stripClass: "stripGold",
    iconClass: "iconGold",
  },
  {
    title: "Rent a Home",
    description: "Find rental apartments, PGs & commercial spaces easily.",
    icon: "🔑",
    button: "Explore Rentals",
    stat: "50K+ rentals",
    stripClass: "stripGreen",
    iconClass: "iconGreen",
  },
  {
    title: "New Projects",
    description: "Discover newly launched and upcoming residential projects.",
    icon: "🏗️",
    button: "View Projects",
    stat: "1,200+ projects",
    stripClass: "stripPurple",
    iconClass: "iconPurple",
  },
];

const WHY_US = [
  { icon: "✅", text: "RERA Verified" },
  { icon: "📞", text: "Free Expert Call" },
  { icon: "🔒", text: "Secure Listings" },
  { icon: "⚡", text: "Instant Response" },
];

/* ── Icons ────────────────────────────────────────────────── */

const ArrowRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Check = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/* ── Card ─────────────────────────────────────────────────── */

const ServiceCard = ({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) => (
  <div
    className={`${s.card} ${s.fadeUp}`}
    style={{ animationDelay: `${index * 0.07}s` }}
  >
    {/* Color strip */}
    <div className={`${s.strip} ${s[service.stripClass as keyof typeof s]}`} />

    <div className={s.cardBody}>
      {/* Icon + stat */}
      <div className={s.iconRow}>
        <div className={`${s.iconBox} ${s[service.iconClass as keyof typeof s]}`}>
          {service.icon}
        </div>
        <span className={s.statBadge}>
          <Check />
          {service.stat}
        </span>
      </div>

      {/* Title */}
      <h3 className={s.cardTitle}>{service.title}</h3>

      {/* Description */}
      <p className={s.cardDesc}>{service.description}</p>

      {/* CTA */}
      <button className={s.cardCta}>
        {service.button}
        <ArrowRight />
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */

export default function TopServices() {
  return (
    <section
      className={s.section}
      style={{
        fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
      }}
    >
      <div className={s.container}>
        {/* ── Header ── */}
        <div className={`${s.header} ${s.fadeUp}`}>
          <p className={s.eyebrow}>✦ What We Offer</p>
          <h2
            className={s.title}
            style={{
              fontFamily:
                "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
            }}
          >
            Our <span className={s.titleGold}>Real Estate Services</span>
          </h2>
          <p className={s.subtitle}>
            Whether you&apos;re buying, selling or renting — Think4BuySale
            provides complete real estate solutions.
          </p>
          <div className={s.underline}>
            <div className={s.uDot1} />
            <div className={s.uDot2} />
            <div className={s.uDot3} />
          </div>
        </div>

        {/* ── Grid ── */}
        <div className={`${s.grid} ${s.fadeUp} ${s.d4}`}>
          {services.map((svc, i) => (
            <ServiceCard key={svc.title} service={svc} index={i} />
          ))}
        </div>

        {/* ── Why Us Strip ── */}
        <div className={`${s.whyUs} ${s.fadeUp} ${s.d5}`}>
          {WHY_US.map((item, i) => (
            <div
              key={item.text}
              className={`${s.whyItem} ${
                i < WHY_US.length - 1 ? s.whyItemBorder : ""
              }`}
            >
              <span className={s.whyIcon}>{item.icon}</span>
              <span className={s.whyText}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ── Mobile CTA Banner ── */}
        <div className={`${s.mobileCta} ${s.fadeUp} ${s.d6} ${s.hideSm}`}>
          <div>
            <p className={s.mobileCtaTitle}>Post Your Property FREE</p>
            <p className={s.mobileCtaSub}>Reach 10M+ verified buyers</p>
          </div>
          <button className={s.mobileCtaBtn}>Post Now →</button>
        </div>
      </div>
    </section>
  );
}