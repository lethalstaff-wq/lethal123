"use client"

import { Check, X } from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"

const rows = [
  { label: "Kernel-level undetection", lethal: true, cheap: false },
  { label: "Under-2h patch response", lethal: true, cheap: false },
  { label: "Live Discord support 24/7", lethal: true, cheap: false },
  { label: "Instant digital delivery", lethal: true, cheap: "partial" },
  { label: "Lifetime license option", lethal: true, cheap: false },
  { label: "Custom DMA firmware", lethal: true, cheap: false },
  { label: "HWID spoof after hardware ban", lethal: true, cheap: "partial" },
  { label: "Refund if doesn't work", lethal: true, cheap: false },
  { label: "Weekly stress tests vs anti-cheat", lethal: true, cheap: false },
  { label: "Transparent uptime monitoring", lethal: true, cheap: false },
] as const

function Cell({ value }: { value: true | false | "partial" }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.10)]">
        <Check className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
      </span>
    )
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-bold">
        —
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/[0.06] border border-red-500/20">
      <X className="h-4 w-4 text-red-400/70" strokeWidth={2.5} />
    </span>
  )
}

export function ComparisonTable() {
  return (
    <section className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-12">
          <SectionEyebrow label="Why Lethal" />
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.1] mb-4">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lethal vs </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249, 115, 22, 0.4))" }}>cheap providers</span>
          </h2>
          <p className="text-white/55 text-[15px] max-w-lg mx-auto">
            What you actually get for £10-50 less elsewhere.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.012] backdrop-blur-sm">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto] items-center px-6 sm:px-8 py-4 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Feature</div>
            <div className="w-24 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/15 border border-[#f97316]/30 text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                Lethal
              </span>
            </div>
            <div className="w-24 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                Cheap
              </span>
            </div>
          </div>
          {/* Body rows */}
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`grid grid-cols-[1fr_auto_auto] items-center px-6 sm:px-8 py-4 transition-colors hover:bg-white/[0.02] ${
                i !== rows.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <div className="text-[14px] text-white/75 font-medium pr-6">{r.label}</div>
              <div className="w-24 flex justify-center"><Cell value={r.lethal} /></div>
              <div className="w-24 flex justify-center"><Cell value={r.cheap} /></div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-white/30 mt-5 uppercase tracking-[0.18em]">
          Data based on common features across £10-£30 providers.
        </p>
      </div>
    </section>
  )
}
