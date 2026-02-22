"use client";

import { useRef } from "react";
import { Ico } from "../icons/Ico";

interface Step4Props {
  d: {
    photos: string[];
    virtualTour: boolean;
  };
  s: (k: string, v: any) => void;
  plan: string;
}

export const Step4 = ({ d, s, plan }: Step4Props) => {
  const photoRef = useRef<HTMLInputElement>(null);
  const photos: string[] = d.photos || [];
  const maxP = plan === "free" ? 5 : 25;

  const add = (files: FileList | null) => {
    if (!files) return;
    const ok = Array.from(files).filter((f) => f.size <= 10 * 1024 * 1024);
    if (photos.length + ok.length > maxP) {
      alert(`Max ${maxP} photos allowed`);
      return;
    }
    s("photos", [...photos, ...ok.map((f) => URL.createObjectURL(f))]);
  };

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 4 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          Photos & Media
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Properties with photos get <span className="font-bold text-blue-600">5× more enquiries</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          ["📸", "Photos", `${photos.length}/${maxP}`],
          ["🎥", "Video", d.virtualTour ? "Added" : "0"],
          ["✨", "Quality", photos.length > 3 ? "Good" : photos.length > 0 ? "Fair" : "None"],
        ].map(([icon, l, v]) => (
          <div key={String(l)} className="bg-white border-2 border-blue-100 rounded-2xl p-3 text-center">
            <p className="text-xl mb-0.5">{icon}</p>
            <p className="text-[10px] font-semibold text-slate-500">{l}</p>
            <p className="text-sm font-black text-[#0B3C8C]">{v}</p>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
        className="block border-2 border-dashed border-blue-300 rounded-3xl p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 cursor-pointer hover:from-blue-100 hover:border-blue-400 active:scale-[0.99] transition-all text-center mb-4"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-blue-500"><Ico.Upload /></span>
        </div>
        <p className="text-sm font-bold text-[#0B3C8C]">Drag & drop or tap to upload</p>
        <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB · Max {maxP} photos</p>
        <div className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-xs font-bold rounded-xl">
          <Ico.Upload /> Choose Photos
        </div>
        <input ref={photoRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => add(e.target.files)} />
      </label>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {photos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-100 group shadow-sm">
              <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              <button
                onClick={() => s("photos", photos.filter((_, j) => j !== i))}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity shadow-md"
              >
                ✕
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  Cover
                </span>
              )}
              {i > 0 && plan === "paid" && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                  HD
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-blue-100 bg-white text-[#0B3C8C] text-xs font-bold hover:border-blue-300 transition-all cursor-pointer font-[inherit] active:scale-95"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Ico.Video /> Upload Video
        </button>
        <button
          onClick={() => s("virtualTour", !d.virtualTour)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer font-[inherit] active:scale-95
            ${d.virtualTour ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-blue-100 bg-white text-[#0B3C8C] hover:border-blue-300"}`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Ico.Eye /> {`Virtual Tour${d.virtualTour ? " ✓" : ""}`}
        </button>
      </div>
    </div>
  );
};