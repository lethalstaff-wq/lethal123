"use client"

import {
  Check, Shield, Zap, Headphones, Truck, Infinity as InfinityIcon, Cpu,
  Fingerprint, RotateCcw, Activity, LineChart, type LucideIcon,
} from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"

type Feature = { Icon: LucideIcon; label: string; value: string }

const FEATURES: Feature[] = [
  { Icon: Shield,       label: "Undetection level",    value: "Kernel-level, signed" },
  { Icon: Zap,          label: "Patch response",       value: "Under 2 hours" },
  { Icon: Headphones,   label: "Live support",         value: "24/7 · <5 min reply" },
  { Icon: Truck,        label: "Delivery",             value: "Instant dashboard" },
  { Icon: InfinityIcon, label: "License model",        value: "Lifetime available" },
  { Icon: Cpu,          label: "DMA firmware",         value: "Custom per-customer" },
  { Icon: Fingerprint,  label: "HWID spoof depth",     value: "Kernel-level rewrite" },
  { Icon: RotateCcw,    label: "Refund policy",        value: "No-questions · 24h" },
  { Icon: Activity,     label: "Anti-cheat testing",   value: "Weekly stress tests" },
  { Icon: LineChart,    label: "Uptime transparency",  value: "Public /status page" },
]

export function ComparisonTable() {
  return (
    <section className="py-32 lg:py-40 px-6 sm:px-10 relative z-10 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 45% at 50% 30%, rgba(249,115,22,0.08), transparent 65%)" }}
      />

      <div className="relative max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <SectionEyebrow number="02" label="Why Lethal" />
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.98] mb-5 mt-2" style={{ paddingBottom: "0.1em" }}>
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lethal </span>
            <span className="text-white/35">vs</span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>
              {" "}cheap providers.
            </span>
          </h2>
          <p className="text-white/50 text-[15.5px] max-w-[540px] mx-auto leading-relaxed">
            The 10 things that actually matter. Every one delivered, audit-proof.
          </p>
        </div>

        {/* Manifesto — no big outer card, content sits on section background */}
        <div className="relative max-w-[1100px] mx-auto">
          {/* Manifesto pill */}
          <div className="text-center mb-10">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.22em]"
              style={{
                background: "rgba(249,115,22,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.4)",
                color: "#f97316",
              }}
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-[#f97316]/40 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-[#f97316]" />
              </span>
              Manifesto
            </span>
          </div>

          {/* 2-col glass feature rows — each keeps its border, hover lifts forward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className="group/item relative flex items-start gap-4 px-5 py-5 rounded-2xl cursor-default overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-[#f97316]/25"
                style={{
                  background: "rgba(255,255,255,0.012)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                {/* Hover-only ambient orange glow */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 70% 120% at 0% 50%, rgba(249,115,22,0.09), transparent 70%)",
                  }}
                />

                {/* Number */}
                <span
                  className="relative shrink-0 font-display text-[30px] font-black tabular-nums leading-none tracking-[-0.05em] w-10 transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Content */}
                <div className="relative flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <f.Icon
                      className="h-3.5 w-3.5 text-[#f97316] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:scale-110"
                      strokeWidth={2}
                    />
                    <span className="font-display text-[15px] font-bold tracking-tight text-white">
                      {f.label}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-white/55 leading-[1.55] group-hover/item:text-white/70 transition-colors duration-300">
                    {f.value}
                  </p>
                </div>

                {/* Verified check */}
                <span
                  className="relative shrink-0 mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:bg-emerald-500/20 group-hover/item:scale-110"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.3)" }}
                >
                  <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
                </span>
              </div>
            ))}
          </div>

          {/* Bottom callout */}
          <div className="mt-12 text-center">
            <p className="text-[12px] text-white/45 uppercase tracking-[0.22em] font-bold">
              10/10 · No compromises · Audit-proof
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
