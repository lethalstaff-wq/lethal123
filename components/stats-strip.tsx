"use client"

import { useEffect, useRef, useState } from "react"

type Stat = { value: number; suffix?: string; prefix?: string; label: string; decimals?: number }

// Reviews metric intentionally omitted — hero already surfaces it.
const stats: Stat[] = [
  { value: 8700, suffix: "+", label: "Players" },
  { value: 99.8, suffix: "%", label: "Undetection", decimals: 1 },
  { value: 487, suffix: "d", label: "Clean streak" },
  { value: 2, prefix: "<", suffix: "h", label: "Patch time" },
]

function Counter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setCount(value); return
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1600, 1)
          const eased = 1 - Math.pow(1 - p, 4)
          setCount(decimals > 0 ? parseFloat((eased * value).toFixed(decimals)) : Math.round(eased * value))
          if (p < 1) requestAnimationFrame(tick)
          else setCount(value)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.25 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value, decimals])

  const display = decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()
  return <span ref={ref} className="tabular-nums">{prefix}{display}{suffix}</span>
}

export function StatsStrip() {
  return (
    <section className="relative z-10 py-10 px-6 sm:px-10">
      <style>{`
        .stat-value {
          background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,195,0.78) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: background 0.35s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .stat-item:hover .stat-value {
          background: linear-gradient(180deg, #ffb366 0%, #f97316 55%, #c2410c 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }
      `}</style>
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-6 sm:gap-10">
              <div className="group/stat stat-item flex flex-col items-center text-center cursor-default">
                <span className="stat-value font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-none transition-transform duration-500 group-hover/stat:scale-[1.08]">
                  <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mt-1.5 transition-colors duration-300 group-hover/stat:text-[#f97316]/80">{s.label}</span>
              </div>
              {i < stats.length - 1 && <span className="h-6 w-px bg-white/[0.06]" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
