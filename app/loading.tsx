export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      {/* Ambient orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 60%)",
          filter: "blur(120px)",
          animation: "loadingOrb 5s ease-in-out infinite",
        }}
      />
      <div className="relative flex flex-col items-center gap-5 z-10">
        {/* Dual concentric ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#f97316]/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f97316] border-r-[#f97316]/30 animate-spin" style={{ animationDuration: "1.1s" }} />
          <div className="absolute inset-[6px] rounded-full border border-[#fbbf24]/20" style={{ animation: "loadingCounterSpin 1.4s linear infinite" }} />
          {/* Core dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] shadow-[0_0_12px_#f97316]" />
          </div>
        </div>
        <span className="text-[11px] text-white/60 font-semibold tracking-[0.32em] uppercase">Loading</span>
      </div>
      <style>{`
        @keyframes loadingOrb {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
        @keyframes loadingCounterSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}
