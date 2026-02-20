"use client";

import { useState } from "react";

const TABS = [
  "Residential",
  "Commercial",
  "Industrial",
  "PG / Co-living",
  "New Project (Builder)",
];

export default function PostProperty99Style() {
  const [activeTab, setActiveTab] = useState("Residential");
  const [listingType, setListingType] = useState("Free");

  return (
    <div className="min-h-screen bg-[#f8fafc] font-[DM_Sans,sans-serif]">

      {/* Header Strip */}
      <div className="bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white px-6 py-4">
        <h1 className="text-lg font-bold">Post Your Property</h1>
      </div>

      {/* Property Category Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-4 overflow-x-auto py-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                ${activeTab === tab
                  ? "bg-[#0f2342] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Free / Paid Toggle */}
      <div className="px-6 pt-6">
        <div className="inline-flex bg-slate-100 rounded-xl p-1">
          {["Free", "Paid"].map((t) => (
            <button
              key={t}
              onClick={() => setListingType(t)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                ${listingType === t
                  ? "bg-[#0f2342] text-white shadow"
                  : "text-slate-600"
                }`}
            >
              {t} Listing
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-3 gap-6 px-6 py-6">

        {/* LEFT FORM */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Details */}
          <Section title="Basic Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Property For">
                <select className={inputCls}>
                  <option>Sell</option>
                  <option>Rent</option>
                </select>
              </Input>

              <Input label="Property Type">
                <select className={inputCls}>
                  <option>Flat / Apartment</option>
                  <option>Villa</option>
                  <option>Plot</option>
                </select>
              </Input>

              <Input label="Room Type">
                <select className={inputCls}>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                </select>
              </Input>

              <Input label="Area (Sq.ft)">
                <input type="number" className={inputCls} />
              </Input>

              <Input label="Expected Price / Rent">
                <input type="number" className={inputCls} />
              </Input>
            </div>

            <Input label="Description">
              <textarea rows={3} className={inputCls} />
            </Input>
          </Section>

          {/* Location */}
          <Section title="Location Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="City">
                <select className={inputCls}>
                  <option>Noida</option>
                  <option>Delhi</option>
                </select>
              </Input>

              <Input label="Locality / Sector">
                <input type="text" className={inputCls} />
              </Input>

              <Input label="Project Name">
                <input type="text" className={inputCls} />
              </Input>

              <Input label="Pin Code">
                <input type="number" className={inputCls} />
              </Input>
            </div>

            <button className="mt-3 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg text-sm font-semibold">
              📍 Set Location on Map
            </button>
          </Section>

          {/* Upload */}
          <Section title="Upload Photos (Free – Max 5)">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center text-xs text-slate-500 cursor-pointer hover:border-[#0f2342]">
                  📷 Add Photo
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button className="px-4 py-2 bg-[#0f2342] text-white rounded-lg text-sm font-semibold">
                Upload Photos
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm">
                Upload Video
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm">
                Virtual Tour
              </button>
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Name">
                <input type="text" className={inputCls} />
              </Input>
              <Input label="Mobile Number">
                <input type="tel" className={inputCls} />
              </Input>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input type="checkbox" />
              <span className="text-sm text-slate-600">Hide My Number</span>
            </div>
          </Section>

          {/* Submit */}
          <div className="flex justify-end">
            <button className="px-8 py-3 bg-gradient-to-r from-[#0f2342] to-[#1a3a6e]
              text-white rounded-xl font-bold shadow hover:shadow-lg transition-all">
              Post Property
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          <SidebarCard title="Free Listing Benefits">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>✔ Normal Ranking</li>
              <li>✔ WhatsApp Option</li>
              <li>✔ OTP Verified</li>
              <li>✔ Dashboard Access</li>
            </ul>
          </SidebarCard>

          <SidebarCard title="Paid Packages">
            {[
              { name: "Silver", price: "₹999" },
              { name: "Gold", price: "₹1,999" },
              { name: "Platinum", price: "₹3,999" },
            ].map((pkg) => (
              <div key={pkg.name}
                className="border border-slate-200 rounded-xl p-4 mb-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#0f2342]">{pkg.name}</span>
                  <span className="font-bold text-amber-600">{pkg.price}</span>
                </div>
                <button className="mt-3 w-full bg-amber-400 text-[#0f2342]
                  py-2 rounded-lg text-sm font-bold">
                  Buy Now
                </button>
              </div>
            ))}
          </SidebarCard>

        </div>
      </div>
    </div>
  );
}

/* ─── Small Reusable UI ─── */

const Section = ({ title, children }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <h2 className="text-sm font-bold text-[#0f2342] mb-4 border-b pb-2">
      {title}
    </h2>
    {children}
  </div>
);

const SidebarCard = ({ title, children }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <h3 className="text-sm font-bold text-[#0f2342] mb-3">
      {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, children }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none";