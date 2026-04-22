"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { Trophy, Zap, Shield } from "lucide-react"

type IconKey = "trophy" | "zap" | "shield"
type Metric = { label: string; value: string; icon: IconKey }

const ICON_MAP = { trophy: Trophy, zap: Zap, shield: Shield } as const

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!inView) return
    const numMatch = value.match(/(-?\+?\d+)/)
    if (!numMatch) { setDisplay(value); return }
    const target = parseInt(numMatch[1], 10)
    if (Number.isNaN(target) || Math.abs(target) < 2) { setDisplay(value); return }
    const sign = numMatch[1].startsWith("+") ? "+" : numMatch[1].startsWith("-") ? "-" : ""
    const absTarget = Math.abs(target)
    const prefix = value.slice(0, numMatch.index)
    const suffix = value.slice((numMatch.index ?? 0) + numMatch[1].length)
    const start = performance.now()
    const duration = 1600
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      setDisplay(`${prefix}${sign}${Math.round(absTarget * eased)}${suffix}`)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return <span ref={ref} className="tabular-nums">{display}</span>
}

export function StoryMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((m) => {
        const Icon = ICON_MAP[m.icon]
        return (
          <div
            key={m.label}
            className="relative rounded-xl border border-white/[0.06] bg-white/[0.012] p-5 hover:border-[#f97316]/30 hover:bg-white/[0.025] transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-3.5 w-3.5 text-[#f97316]/80" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{m.label}</span>
            </div>
            <p
              className="font-display font-black text-white tracking-[-0.02em]"
              style={{ fontSize: "clamp(28px, 3.2vw, 40px)", lineHeight: 1 }}
            >
              <AnimatedValue value={m.value} />
            </p>
          </div>
        )
      })}
    </div>
  )
}
