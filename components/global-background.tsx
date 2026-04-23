// Server Component — unified premium background across every page.
// Pure black + drifting orange orbs (top-left, bottom-right) + dot grid + fine grain.
// Adds a slow 30-second gradient shift overlay so pages never feel identical.
export function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Pure black base */}
      <div className="absolute inset-0 bg-black" />

      {/* Top-left drifting orange orb — tighter radius, keeps saturated color
          but covers less of the viewport so low-saturation monitors don't
          wash the whole background into muddy teal-orange. */}
      <div
        className="absolute -top-[260px] -left-[220px] w-[680px] h-[680px] rounded-full opacity-70 gb-orb-1"
        style={{
          background: "radial-gradient(circle, rgba(255, 94, 14, 0.42) 0%, transparent 58%)",
          filter: "blur(140px)",
        }}
      />

      {/* Bottom-right drifting orb */}
      <div
        className="absolute -bottom-[260px] -right-[220px] w-[640px] h-[640px] rounded-full opacity-60 gb-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(255, 77, 10, 0.34) 0%, transparent 58%)",
          filter: "blur(150px)",
        }}
      />

      {/* Center subtle amber accent — tamed from 0.12 → 0.07 to stop
          mid-screen turquoise bleed on non-HDR panels. */}
      <div
        className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full opacity-35 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.07) 0%, transparent 65%)",
          filter: "blur(160px)",
        }}
      />

      {/* Slow breathing gradient — dimmed from 0.60 → 0.35 opacity */}
      <div className="absolute inset-0 gb-breath opacity-35" aria-hidden="true" />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gbBreath {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gb-breath {
          background: radial-gradient(ellipse 120% 80% at 0% 30%, rgba(249,115,22,0.05) 0%, transparent 55%),
                      radial-gradient(ellipse 100% 80% at 100% 70%, rgba(251,191,36,0.03) 0%, transparent 55%);
          background-size: 200% 200%;
          animation: gbBreath 30s ease-in-out infinite;
          will-change: background-position;
        }
        @media (prefers-reduced-motion: reduce) {
          .gb-breath { animation: none; }
        }
      `}} />

      {/* Midtone darkener — semi-transparent black layer with a vignette mask.
          Pushes the mid area back toward black so orange orbs read as accents
          instead of covering the full screen. Strongest in center, fades out
          toward edges where the orbs live. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0.45), transparent 80%)",
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
