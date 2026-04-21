"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

const faqs = [
  { q: "Is it safe to use?", a: "Yes. All products tested daily against latest anti-cheat updates. 99.8% undetected rate. If detection occurs, we patch within 24 hours and extend subscriptions." },
  { q: "What payment methods?", a: "Bitcoin, Ethereum, Litecoin, USDT, and PayPal (Friends & Family). Crypto payments process instantly." },
  { q: "How fast is delivery?", a: "Digital products delivered instantly. DMA hardware ships within 24 hours with full tracking." },
  { q: "What DMA cards supported?", a: "All major cards — 75T, 100T, M.2, ZDMA. Compatible with most Intel and AMD motherboards." },
  { q: "Spoofer work after HWID ban?", a: "Yes — changes hardware IDs at kernel level. Play on new account even after hardware ban." },
  { q: "What if it doesn't work?", a: "24/7 Discord support. If we can't get it working, full refund within 24 hours." },
  { q: "Do you offer refunds?", a: "Yes. Full refund if product doesn't work. Partial refunds for unused subscription time." },
  { q: "How do I set everything up?", a: "Step-by-step guides included. Video tutorials for DMA. Screen share setup help on Discord." },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[760px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">FAQ</span>
          </div>
          <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Common </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden border transition-all duration-300 ${open === i ? "border-[#f97316]/30 bg-gradient-to-br from-[#f97316]/[0.06] to-white/[0.015] shadow-[0_18px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(249, 115, 22, 0.14)]" : "border-white/[0.06] bg-white/[0.015] hover:border-[#f97316]/20 hover:bg-white/[0.03] hover:-translate-y-0.5"}`}>
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex items-center gap-4 w-full p-5 text-left cursor-pointer">
                <span className={`text-[12px] font-bold tabular-nums shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${open === i ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249, 115, 22, 0.58)]" : "bg-white/[0.04] border border-white/[0.06] text-white/45"}`}>
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <span className={`text-[15px] font-semibold flex-1 pr-4 transition-colors tracking-tight ${open === i ? "text-white" : "text-white/75"}`}>{f.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${open === i ? "bg-[#f97316]/20 border border-[#f97316]/40 rotate-45" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                  <Plus className={`h-3.5 w-3.5 transition-colors ${open === i ? "text-[#f97316]" : "text-white/55"}`} />
                </div>
              </button>
              <div className="grid transition-all duration-500" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                <div className="overflow-hidden"><div className="px-5 pb-5 pl-[5rem]">
                  <div className="h-px bg-gradient-to-r from-[#f97316]/30 via-white/[0.05] to-transparent mb-4" />
                  <p className="text-[14px] text-white/65 leading-[1.85]">{f.a}</p>
                </div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
