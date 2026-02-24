"use client";

import { useRef, useMemo } from "react";
import { Ico } from "../icons/Ico";

interface Step4Props {
  d: {
    photos:      string[];   // preview URLs (blob: or server URLs from API)
    photoFiles:  File[];     // actual File objects → sent to API
    virtualTour: boolean;
  };
  s:           (k: string, v: any) => void;
  plan:        string;
  photoFiles:  File[];                      // same as d.photoFiles, passed for clarity
  addPhotos:   (files: File[]) => void;     // from PostPropertyForm — manages both arrays
  removePhoto: (index: number) => void;     // from PostPropertyForm — revokes blob URL
}

export const Step4 = ({ d, s, plan, addPhotos, removePhoto }: Step4Props) => {
  const photoRef = useRef<HTMLInputElement>(null);
  const maxP     = plan === "free" ? 5 : 25;

  // d.photos holds the preview URLs (blob: for new picks, server URLs for loaded drafts).
  // d.photoFiles holds the actual File objects (empty when loaded from server).
  const photos    = d.photos    || [];
  const fileCount = d.photoFiles?.length ?? 0;

  // Quality label based on how many files are ready to upload
  const quality =
    photos.length > 3 ? "Good" :
    photos.length > 0 ? "Fair" : "None";

  // ── File picker handler ──────────────────────────────────────────────────
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const candidates = Array.from(fileList);

    // Size check
    const tooBig = candidates.filter(f => f.size > 10 * 1024 * 1024);
    if (tooBig.length > 0) {
      alert(`${tooBig.length} file(s) exceed 10 MB and were skipped.`);
    }

    const ok = candidates.filter(f => f.size <= 10 * 1024 * 1024);

    if (photos.length + ok.length > maxP) {
      alert(`Max ${maxP} photos allowed on your current plan.`);
      return;
    }

    // addPhotos is defined in PostPropertyForm — it updates BOTH photoFiles and photos
    addPhotos(ok);

    // Reset the input so the same file can be re-selected if removed
    if (photoRef.current) photoRef.current.value = "";
  };

  return (
    <div className="fade-step">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-blue-400 mb-2">Step 4 of 5</p>
        <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl font-bold text-[#0B3C8C]">
          Photos & Media
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Properties with photos get{" "}
          <span className="font-bold text-blue-600">5× more enquiries</span>
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          ["📸", "Photos",  `${photos.length}/${maxP}`],
          ["🎥", "Video",   d.virtualTour ? "Added" : "0"],
          ["✨", "Quality", quality],
        ].map(([icon, l, v]) => (
          <div key={String(l)} className="bg-white border-2 border-blue-100 rounded-2xl p-3 text-center">
            <p className="text-xl mb-0.5">{icon}</p>
            <p className="text-[10px] font-semibold text-slate-500">{l}</p>
            <p className="text-sm font-black text-[#0B3C8C]">{v}</p>
          </div>
        ))}
      </div>

      {/* Upload limit warning */}
      {photos.length >= maxP && (
        <div className="mb-4 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p className="text-xs font-bold text-amber-700">
            Photo limit reached ({maxP}/{maxP}).{" "}
            {plan === "free" && (
              <span className="text-[#1D4ED8] underline cursor-pointer">
                Upgrade to add up to 25 photos.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Upload zone */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={`block border-2 border-dashed rounded-3xl p-8 text-center mb-4 transition-all
          ${photos.length >= maxP
            ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
            : "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 cursor-pointer hover:from-blue-100 hover:border-blue-400 active:scale-[0.99]"
          }`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-blue-500"><Ico.Upload /></span>
        </div>
        <p className="text-sm font-bold text-[#0B3C8C]">Drag & drop or tap to upload</p>
        <p className="text-xs text-slate-500 mt-1">
          JPG, PNG up to 10 MB · Max {maxP} photos
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-xs font-bold rounded-xl pointer-events-none">
          <Ico.Upload /> Choose Photos
        </div>
        <input
          ref={photoRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          disabled={photos.length >= maxP}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {/* Server-loaded photos notice (when photoFiles is empty but photos has server URLs) */}
      {photos.length > 0 && fileCount === 0 && (
        <div className="mb-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-base flex-shrink-0">ℹ️</span>
          <p className="text-xs text-blue-700 font-semibold">
            These photos are already saved. Select new photos above to replace or add more.
          </p>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {photos.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-100 group shadow-sm"
            >
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />

              {/* Remove button — calls removePhoto which revokes blob URL */}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity shadow-md"
                aria-label={`Remove photo ${i + 1}`}
              >
                ✕
              </button>

              {/* Badges */}
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

      {/* Media extra buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-blue-100 bg-white text-[#0B3C8C] text-xs font-bold hover:border-blue-300 transition-all cursor-pointer font-[inherit] active:scale-95"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Ico.Video /> Upload Video
        </button>

        <button
          type="button"
          onClick={() => s("virtualTour", !d.virtualTour)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer font-[inherit] active:scale-95
            ${d.virtualTour
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : "border-blue-100 bg-white text-[#0B3C8C] hover:border-blue-300"
            }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Ico.Eye /> {d.virtualTour ? "Virtual Tour ✓" : "Virtual Tour"}
        </button>
      </div>
    </div>
  );
};