"use client"

import { ShoppingCart, CreditCard, Zap } from "lucide-react"

const steps = [
  { icon: ShoppingCart, title: "Choose", desc: "Pick your product from DMA cheats, spoofers, or hardware bundles.", num: "1", color: "#3b82f6" },
  { icon: CreditCard, title: "Pay", desc: "Crypto or PayPal. Encrypted, private, instant confirmation.", num: "2", color: "#f97316" },
  { icon: Zap, title: "Play", desc: "License key delivered in seconds. Full setup support on Discord.", num: "3", color: "#22c55e" },
]

export function ProcessSection() {
  return (
    <section className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-3 text-white">
            How it <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>works</span>
          </h2>
          <p className="text-white/30 text-[15px]">Checkout to gameplay in under 4 minutes.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 group relative">
              <div className="h-full rounded-2xl p-6 sm:p-7 bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 relative overflow-hidden">
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}25, transparent)` }} />

                {/* Number + Icon row */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[48px] font-black leading-none tracking-tighter" style={{ color: `${s.color}08` }}>{s.num}</span>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `${s.color}08`, borderColor: `${s.color}12` }}>
                    <s.icon className="h-5 w-5" style={{ color: `${s.color}50` }} />
                  </div>
                </div>

                <h4 className="font-bold text-[18px] mb-2 text-white/90">{s.title}</h4>
                <p className="text-[13px] text-white/30 leading-relaxed">{s.desc}</p>
              </div>

              {/* Arrow connector */}
              {i < 2 && <div className="hidden sm:flex absolute -right-[10px] top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-black border border-white/[0.06] items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4h6M5 2l2 2-2 2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" /></svg>
              </div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
