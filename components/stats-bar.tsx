"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Shield, Zap, Headphones } from "lucide-react"

const STATS = [
  { icon: Users, value: 5000, suffix: "+", label: "Customers", color: "text-primary" },
  { icon: Shield, value: 99.8, suffix: "%", label: "Uptime", color: "text-emerald-400", decimals: 1 },
  { icon: Zap, value: 2, suffix: "h", prefix: "<", label: "Patch Time", color: "text-amber-400" },
  { icon: Headphones, value: 24, suffix: "/7", label: "Support", color: "text-blue-400" },
]

function AnimatedNumber({ value, suffix, prefix, decimals = 0, visible }: {
  value: number; suffix: string; prefix?: string; decimals?: number; visible: boolean
}) {
  const [display, setDisplay] = useState(value)
  const [animating, setAnimating] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!visible || hasAnimated.current) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    hasAnimated.current = true
    setAnimating(true)
    setDisplay(0)
    const duration = 1500
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) requestAnimationFrame(tick)
      else setDisplay(value)
    }
    requestAnimationFrame(tick)
  }, [visible, value])

  const shown = animating ? display : value
  const formatted = decimals > 0 ? shown.toFixed(decimals) : Math.round(shown).toLocaleString()
  return <>{prefix}{formatted}{suffix}</>
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color} opacity-60`} />
              </div>
              <p className={`text-2xl md:text-3xl font-black ${stat.color} tabular-nums`}>
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals}
                  visible={visible}
                />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
