"use client"

import { useState, useEffect, useRef } from "react"
import { Shield, Zap, Cpu, RefreshCw, Headphones, Globe } from "lucide-react"

function AnimNum({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1500, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setCount(decimals > 0 ? parseFloat((eased * value).toFixed(decimals)) : Math.round(eased * value))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick); obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [value, decimals])
  return <span ref={ref} className="tabular-nums">{prefix}{decimals > 0 ? count.toFixed(decimals) : count}{suffix}</span>
}

const features = [
  { icon: Shield, title: "Kernel-Level Dominance", desc: "We operate at the system's deepest level. While others get detected, we stay invisible.", num: 99.8, prefix: "", suffix: "%", label: "undetected" },
  { icon: Zap, title: "Zero-Hour Response", desc: "Game updated? We're already on it. Average patch time under 2 hours.", num: 2, prefix: "<", suffix: "h", label: "patch time" },
  { icon: Cpu, title: "Ghost Technology", desc: "Every build is unique. Your software has its own signature, making detection impossible.", num: 1000, prefix: "", suffix: "+", label: "unique builds" },
  { icon: RefreshCw, title: "Live Protection", desc: "Real-time threat detection and automatic updates. Always ahead of anti-cheat.", num: 24, prefix: "", suffix: "/7", label: "monitoring" },
  { icon: Headphones, title: "Elite Support", desc: "Dedicated team on Discord. Screen share setup help. We don't sleep.", num: 15, prefix: "<", suffix: "m", label: "response" },
  { icon: Globe, title: "Worldwide Network", desc: "Infrastructure on 6 continents. Discreet worldwide operations.", num: 30, prefix: "", suffix: "+", label: "countries" },
]

export function ServicesSection() {
  return (
    <section id="features" className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4 text-white">
            Why choose <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lethal</span>
          </h2>
          <p className="text-white/35 text-[15px] max-w-lg mx-auto">Superior technology. Relentless execution.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-xl bg-white/[0.012] border border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.07] transition-all duration-300 relative overflow-hidden">
              {/* Shine */}
              <div className="absolute top-[-50%] left-[-80%] w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent rotate-[25deg] group-hover:left-[130%] transition-[left] duration-700 pointer-events-none z-10" />
              {/* Hover glow */}
              <div className="absolute top-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.04), transparent 70%)", transform: "translate(-30%, -30%)" }} />

              <div className="relative z-[2]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.04] bg-white/[0.02] group-hover:bg-[#f97316]/[0.04] group-hover:border-[#f97316]/15 transition-all duration-500">
                    <f.icon className="h-4 w-4 text-white/20 group-hover:text-[#f97316]/70 transition-colors duration-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-bold text-white/70"><AnimNum value={f.num} prefix={f.prefix} suffix={f.suffix} decimals={f.num === 99.8 ? 1 : 0} /></p>
                    <p className="text-[9px] text-white/15 uppercase tracking-wider">{f.label}</p>
                  </div>
                </div>
                <h4 className="font-bold text-[15px] mb-2 text-white/85 group-hover:text-white transition-colors">{f.title}</h4>
                <p className="text-[13px] text-white/30 leading-relaxed group-hover:text-white/40 transition-colors">{f.desc}</p>
              </div>

              {/* Bottom accent on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
