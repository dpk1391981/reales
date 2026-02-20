"use client";

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

export default function Footer() {
  return (
    <footer className="bg-[#0f2342] text-white pt-20 pb-10 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">

        {/* Top Links Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Property for Sale */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-6">
              Property for Sale
            </h3>
            <ul className="space-y-3">
              {footerLinks.sale.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/80 hover:text-amber-400 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Flats for Sale */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-6">
              Flats for Sale
            </h3>
            <ul className="space-y-3">
              {footerLinks.flatsSale.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/80 hover:text-amber-400 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Flats for Rent */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-6">
              Flats for Rent
            </h3>
            <ul className="space-y-3">
              {footerLinks.flatsRent.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/80 hover:text-amber-400 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* New Projects */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-6">
              New Projects
            </h3>
            <ul className="space-y-3">
              {footerLinks.projects.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/80 hover:text-amber-400 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold">
              Think4BuySale
            </h2>
            <p className="text-sm text-white/60 mt-2">
              India's Premier Realty Platform
            </p>
          </div>

          {/* Footer Bottom Links */}
          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            <a href="#" className="hover:text-amber-400 transition">
              About Us
            </a>
            <a href="#" className="hover:text-amber-400 transition">
              Contact
            </a>
            <a href="#" className="hover:text-amber-400 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-amber-400 transition">
              Terms & Conditions
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} Think4BuySale. All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  );
}
