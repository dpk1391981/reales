export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B3C8C] via-[#1E40AF] to-[#3B82F6]">
      <div className="text-center">

        {/* Soft Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
        </div>

        <h2 className="text-white text-2xl font-semibold tracking-wide">
          Think4BuySale
        </h2>

        <p className="text-white/80 text-xs tracking-[0.3em] uppercase mt-2">
          Finding Your Perfect Property
        </p>
      </div>
    </div>
  );
}