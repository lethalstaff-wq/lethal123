"use client"

import { ShoppingCart, Lock, Gamepad2 } from "lucide-react"

const steps = [
  { icon: ShoppingCart, title: "Choose", desc: "Pick your product — DMA cheats, spoofers, or full hardware bundles.", num: "01" },
  { icon: Lock,         title: "Pay",    desc: "Crypto or PayPal. Encrypted, private, instant confirmation." , num: "02" },
  { icon: Gamepad2,     title: "Play",   desc: "License key in seconds. Full setup support on Discord 24/7."  , num: "03" },
]

export function ProcessSection() {
  return (
    <section className="py-28 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Workflow</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.1] mb-4 text-white">
            How it <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>works</span>
          </h2>
          <p className="text-white/45 text-[15px]">Checkout to gameplay in under 4 minutes.</p>
        </div>

        {/* Animated SVG connector line (desktop) */}
        <div className="relative">
          <svg className="absolute top-[60px] left-[16.66%] right-[16.66%] h-1 hidden md:block pointer-events-none" viewBox="0 0 100 1" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="proc-flow" x1="0%" y1="0" x2="100%" y2="0">
                <stop offset="0%" stopColor="rgba(249,115,22,0)" />
                <stop offset="50%" stopColor="rgba(249,115,22,0.6)" />
                <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="3.5s" repeatCount="indefinite" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="url(#proc-flow)" strokeWidth="1" />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {steps.map((s, i) => (
              <div key={i} className="group relative">
                {/* Step number badge — big circular gradient */}
                <div className="relative z-[2] flex flex-col items-center mb-6">
                  <div className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center"
                       style={{ background: "radial-gradient(circle at 30% 30%, rgba(249,115,22,0.18), rgba(0,0,0,0.9) 70%)", boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.25), 0 0 60px rgba(249,115,22,0.12)" }}>
                    {/* Pulsing ring */}
                    <div className="absolute inset-[-6px] rounded-full border border-[#f97316]/15 group-hover:border-[#f97316]/40 transition-all" style={{ animation: "stepPulse 2.6s ease-in-out infinite" }} />
                    {/* Inner icon */}
                    <s.icon className="h-9 w-9 text-[#f97316] group-hover:scale-110 transition-transform duration-300" style={{ filter: "drop-shadow(0 0 16px rgba(249,115,22,0.6))" }} />
                    {/* Step number bottom-right */}
                    <span className="absolute -bottom-1 -right-1 px-2.5 py-1 rounded-full bg-black border border-[#f97316]/30 text-[10px] font-black text-[#f97316] tracking-[0.1em]">{s.num}</span>
                  </div>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300 text-center hover:bg-white/[0.04]">
                  <h4 className="font-display font-bold text-[20px] mb-2 text-white tracking-tight">{s.title}</h4>
                  <p className="text-[13px] text-white/45 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes stepPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.06); opacity: 1; }
        }
      `}</style>
    </section>
  )
}
