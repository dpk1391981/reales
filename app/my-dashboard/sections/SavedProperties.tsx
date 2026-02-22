"use client";
export const SavedProperties = () => (
  <div className="p-4 md:p-6 max-w-3xl mx-auto">
    <h2 className="pf text-lg font-bold text-[#0B3C8C] mb-5">Saved Properties</h2>
    <div className="bg-white rounded-2xl border-2 border-dashed border-blue-100 p-12 text-center">
      <p className="text-4xl mb-3">❤️</p>
      <p className="text-sm font-bold text-slate-500">No saved properties yet</p>
      <p className="text-xs text-slate-400 mt-1">Browse properties and save your favourites</p>
      <a href="/properties" className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-[11px] font-black rounded-xl no-underline">Browse Properties</a>
    </div>
  </div>
);
