// Server Component — unified premium background across every page.
// Pure black + drifting orange orbs (top-left, bottom-right) + dot grid + fine grain.
export function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Pure black base */}
      <div className="absolute inset-0 bg-black" />

      {/* Top-left drifting orange orb — boosted saturation for non-HDR monitors */}
      <div
        className="absolute -top-[220px] -left-[180px] w-[820px] h-[820px] rounded-full opacity-90 gb-orb-1"
        style={{
          background: "radial-gradient(circle, rgba(255, 94, 14, 0.46) 0%, transparent 62%)",
          filter: "blur(140px)",
        }}
      />

      {/* Bottom-right drifting orb — hotter orange */}
      <div
        className="absolute -bottom-[220px] -right-[180px] w-[780px] h-[780px] rounded-full opacity-85 gb-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(255, 77, 10, 0.38) 0%, transparent 62%)",
          filter: "blur(150px)",
        }}
      />

      {/* Center subtle amber accent — adds warmth */}
      <div
        className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-50 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 65%)",
          filter: "blur(160px)",
        }}
      />

      {/* Dot grid with radial mask — universal texture layer */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 95% 85% at 50% 50%, black 0%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 85% at 50% 50%, black 0%, transparent 90%)",
        }}
      />

      {/* Fine SVG grain for film feel */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.022] pointer-events-none mix-blend-overlay"
        aria-hidden="true"
      >
        <filter id="gb-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#gb-noise)" />
      </svg>

      {/* Top-edge vignette (darken so navbar has contrast) */}
      <div
        className="absolute inset-x-0 top-0 h-[220px] pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5), transparent)" }}
      />
    </div>
  )
}
