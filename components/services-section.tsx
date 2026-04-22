"use client"

import { useState, useEffect, useRef } from "react"
import { Shield, Zap, Cpu, RefreshCw, Headphones, Globe } from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"

function AnimNum({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(value)
  const [animating, setAnimating] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        setAnimating(true)
        setCount(0)
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1500, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setCount(decimals > 0 ? parseFloat((eased * value).toFixed(decimals)) : Math.round(eased * value))
          if (p < 1) requestAnimationFrame(tick)
          else setCount(value)
        }
        requestAnimationFrame(tick); obs.disconnect()
      }
    }, { threshold: 0 })
    obs.observe(el); return () => obs.disconnect()
  }, [value, decimals])
  const display = animating ? count : value
  return <span ref={ref} className="tabular-nums">{prefix}{decimals > 0 ? display.toFixed(decimals) : display}{suffix}</span>
}

const features = [
  { icon: Shield, title: "Kernel-Level Dominance", desc: "We operate at the system's deepest level. While others get detected, we stay invisible.", num: 99.8, prefix: "", suffix: "%", label: "undetected" },
  { icon: Zap, title: "Zero-Hour Response", desc: "Game updated? We're already on it. Average patch time under 2 hours.", num: 2, prefix: "<", suffix: "h", label: "patch time" },
  { icon: Cpu, title: "Ghost Technology", desc: "Every build is unique. Your software has its own signature, making detection impossible.", num: 2147, prefix: "", suffix: "+", label: "unique builds" },
  { icon: RefreshCw, title: "Live Protection", desc: "Real-time threat detection and automatic updates. Always ahead of anti-cheat.", num: 24, prefix: "", suffix: "/7", label: "monitoring" },
  { icon: Headphones, title: "Elite Support", desc: "Dedicated team on Discord. Screen share setup help. We don't sleep.", num: 5, prefix: "<", suffix: "m", label: "response" },
  { icon: Globe, title: "Worldwide Network", desc: "Infrastructure on 6 continents. Discreet worldwide operations.", num: 67, prefix: "", suffix: "+", label: "countries" },
]

function FeatureCard({ f, i }: { f: typeof features[number]; i: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty("--mx", `${x}px`)
    el.style.setProperty("--my", `${y}px`)
  }
  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      className="spotlight-card group p-7 rounded-2xl bg-white/[0.015] border border-white/[0.06] hover:border-[#f97316]/40 hover:bg-white/[0.03] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_50px_rgba(249,115,22,0.2)] transition-all duration-300"
    >
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 z-[3]" />
      {/* Shine */}
      <div className="absolute top-[-50%] left-[-80%] w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent rotate-[25deg] group-hover:left-[130%] transition-[left] duration-700 pointer-events-none z-[3]" />
      {/* Big faded number background */}
      <div className="absolute -top-3 -left-2 text-[120px] font-black leading-none pointer-events-none select-none opacity-[0.025] group-hover:opacity-[0.06] transition-opacity duration-500 font-display text-[#f97316] z-[2]">
        {(i + 1).toString().padStart(2, "0")}
      </div>

      <div className="relative z-[3]">
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/[0.06] bg-white/[0.02] group-hover:bg-gradient-to-br group-hover:from-[#f97316]/25 group-hover:to-[#ea580c]/15 group-hover:border-[#f97316]/35 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <f.icon className="h-[20px] w-[20px] text-white/55 group-hover:text-[#f97316] transition-all duration-500" />
          </div>
          <div className="text-right">
            <p className="font-display text-[28px] font-black tracking-[-0.02em] leading-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(200,200,210,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              <AnimNum value={f.num} prefix={f.prefix} suffix={f.suffix} decimals={f.num === 99.8 ? 1 : 0} />
            </p>
            <p className="text-[9px] text-[#f97316]/70 group-hover:text-[#f97316] uppercase tracking-[0.18em] mt-1.5 font-bold transition-colors">{f.label}</p>
          </div>
        </div>
        <h4 className="font-display font-bold text-[17px] mb-2 text-white tracking-tight">{f.title}</h4>
        <p className="text-[13px] text-white/55 leading-[1.65] group-hover:text-white/75 transition-colors">{f.desc}</p>
      </div>

      {/* Bottom accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[3]" />
    </div>
  )
}

export function ServicesSection() {
  return (
    <section id="features" className="py-32 lg:py-40 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <SectionEyebrow number="02" label="Why Choose Us" />
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.1] mb-4 text-white">
            Why choose <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lethal</span>
          </h2>
          <p className="text-white/45 text-[15px] max-w-lg mx-auto">Superior technology. Relentless execution.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
        </div>
      </div>
    </section>
  )
}
