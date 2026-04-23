"use client"

import { ShoppingCart, Lock, Gamepad2 } from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"

const steps = [
  { icon: ShoppingCart, title: "Choose", desc: "Pick your product — DMA cheats, spoofers, or full hardware bundles.", num: "01" },
  { icon: Lock,         title: "Pay",    desc: "Crypto or PayPal. Encrypted, private, instant confirmation." , num: "02" },
  { icon: Gamepad2,     title: "Play",   desc: "License key in seconds. Full setup support on Discord 24/7."  , num: "03" },
]

export function ProcessSection() {
  return (
    <section className="py-32 lg:py-40 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <SectionEyebrow number="03" label="Workflow" />
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.1] mb-4 text-white">
            How it <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>works</span>
          </h2>
          <p className="text-white/45 text-[15px]">Checkout to gameplay in under 4 minutes.</p>
        </div>

        {/* Connector line — runs between consecutive badge centers */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {steps.map((s, i) => (
              <div key={i} className="group relative">
                {/* Connector segment to next badge (renders to right of all badges except last) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[60px] left-[calc(50%+62px)] right-[calc(-50%+62px)] h-px pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[#f97316]/15" />
                    <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#f97316] to-transparent" style={{ animation: "procFlow 3s ease-in-out infinite", animationDelay: `${i * 0.6}s` }} />
                  </div>
                )}

                {/* Step number badge — big circular gradient */}
                <div className="relative z-[2] flex flex-col items-center mb-6">
                  <div className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center"
                       style={{ background: "radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.32), rgba(0,0,0,0.95) 70%)", boxShadow: "inset 0 0 0 1px rgba(249, 115, 22, 0.43), 0 0 60px rgba(249, 115, 22, 0.2)" }}>
                    {/* Pulsing ring */}
                    <div className="absolute inset-[-6px] rounded-full border border-[#f97316]/20 group-hover:border-[#f97316]/50 transition-all" style={{ animation: "stepPulse 2.6s ease-in-out infinite" }} />
                    {/* Outer rotating dashes */}
                    <div className="absolute inset-[-12px] rounded-full border border-dashed border-[#f97316]/15 group-hover:border-[#f97316]/30 transition-all" style={{ animation: "stepRotate 18s linear infinite" }} />
                    {/* Inner icon */}
                    <s.icon className="h-9 w-9 text-[#f97316] group-hover:scale-110 transition-transform duration-300" style={{ filter: "drop-shadow(0 0 16px rgba(249, 115, 22, 0.85))" }} />
                    {/* Step number bottom-right */}
                    <span className="absolute -bottom-1 -right-1 px-2.5 py-1 rounded-full bg-black border border-[#f97316]/40 text-[10px] font-black text-[#f97316] tracking-[0.1em] tabular-nums shadow-[0_4px_12px_rgba(249, 115, 22, 0.36)]">{s.num}</span>
                  </div>
                </div>

                {/* Card */}
                <div className="spotlight-card rounded-2xl p-6 bg-white/[0.015] border border-white/[0.06] hover:border-[#f97316]/35 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(249,115,22,0.16)] transition-all duration-300 text-center hover:bg-white/[0.03]">
                  <h4 className="font-display font-bold text-[20px] mb-2 text-white tracking-tight">{s.title}</h4>
                  <p className="text-[13px] text-white/55 leading-relaxed">{s.desc}</p>
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
        @keyframes stepRotate {
          to { transform: rotate(360deg); }
        }
        @keyframes procFlow {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  )
}
