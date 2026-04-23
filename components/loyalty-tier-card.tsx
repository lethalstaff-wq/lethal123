"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Zap, Flame, Crown, Check, type LucideIcon } from "lucide-react"

type Tier = {
  key: string
  label: string
  icon: LucideIcon
  min: number
  max: number
  color: string
  glow: string
}

const TIERS: readonly Tier[] = [
  { key: "rookie",  label: "Rookie",  icon: Shield, min: 0,    max: 250,  color: "#94a3b8", glow: "rgba(148,163,184,0.55)" },
  { key: "pro",     label: "Pro",     icon: Zap,    min: 250,  max: 750,  color: "#38bdf8", glow: "rgba(56,189,248,0.55)" },
  { key: "veteran", label: "Veteran", icon: Flame,  min: 750,  max: 1800, color: "#f97316", glow: "rgba(249,115,22,0.6)"   },
  { key: "elite",   label: "Elite",   icon: Crown,  min: 1800, max: 4000, color: "#fbbf24", glow: "rgba(251,191,36,0.6)"   },
] as const

interface Props { xp?: number }

export function LoyaltyTierCard({ xp = 1240 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [displayXp, setDisplayXp] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplayXp(xp); setStarted(true); return
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true)
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1600, 1)
          const eased = 1 - Math.pow(1 - p, 4)
          setDisplayXp(Math.round(eased * xp))
          if (p < 1) requestAnimationFrame(tick)
          else setDisplayXp(xp)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [xp, started])

  const currentIdx = (() => {
    let i = 0
    for (let j = 0; j < TIERS.length; j++) if (displayXp >= TIERS[j].min) i = j
    return i
  })()
  const currentTier = TIERS[currentIdx]
  const nextTier = TIERS[Math.min(currentIdx + 1, TIERS.length - 1)]
  const isMaxTier = currentIdx === TIERS.length - 1
  const tierRange = currentTier.max - currentTier.min
  const intoTier = Math.min(displayXp - currentTier.min, tierRange)
  const tierProgressPct = Math.max(0, Math.min(100, (intoTier / tierRange) * 100))
  const xpToNext = isMaxTier ? 0 : Math.max(0, nextTier.min - displayXp)

  return (
    <div
      ref={ref}
      className="relative rounded-2xl border border-white/[0.06] bg-white/[0.012] overflow-hidden p-6 sm:p-8"
      style={{ boxShadow: "0 30px 80px -30px rgba(0,0,0,0.75)" }}
    >
      {/* Tier glow wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 30%, ${currentTier.glow.replace("0.55", "0.10").replace("0.6", "0.12")}, transparent 65%)`,
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${currentTier.color}, transparent)` }}
      />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Loyalty tier</p>
            <p className="font-display text-[26px] font-bold tracking-[-0.02em] leading-none" style={{ color: currentTier.color }}>
              {currentTier.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Lifetime XP</p>
            <p
              className="font-display text-[28px] font-black tracking-[-0.025em] tabular-nums leading-none"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.78))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {displayXp.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tier bubbles row (apply-timeline style, small scale) */}
        <div className="relative">
          <div className="grid grid-cols-4 gap-4 relative">
            {TIERS.map((t, i) => {
              const reached = i <= currentIdx
              const isCurrent = i === currentIdx
              const complete = i < currentIdx
              const TierIcon = t.icon
              return (
                <div key={t.key} className="relative flex flex-col items-center">
                  {/* Progress connector to next tier */}
                  {i < TIERS.length - 1 && (
                    <>
                      <div className="absolute top-[34px] left-[calc(50%+38px)] right-[calc(-50%+38px)] h-px overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-white/[0.05]" />
                        <div
                          className="absolute inset-y-0 left-0 transition-[width] duration-[1400ms] ease-out"
                          style={{
                            width:
                              i < currentIdx
                                ? "100%"
                                : i === currentIdx
                                  ? `${tierProgressPct}%`
                                  : "0%",
                            background: `linear-gradient(90deg, ${currentTier.color}aa, ${currentTier.color})`,
                            boxShadow: i <= currentIdx ? `0 0 6px ${currentTier.glow}` : "none",
                          }}
                        />
                        {/* Traveling particle while on the in-progress segment */}
                        {isCurrent && !isMaxTier && tierProgressPct > 0 && tierProgressPct < 100 && (
                          <div
                            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            style={{ animation: "tierShine 2.6s ease-in-out infinite" }}
                          />
                        )}
                      </div>
                    </>
                  )}

                  {/* Bubble — smaller glass version of apply timeline */}
                  <div
                    className="relative z-[2] w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${t.color}30, rgba(0,0,0,0.95) 70%)`,
                      boxShadow: reached
                        ? `inset 0 0 0 1px ${t.color}55, 0 0 ${isCurrent ? 36 : 18}px ${t.glow.replace("0.55", isCurrent ? "0.4" : "0.2").replace("0.6", isCurrent ? "0.42" : "0.22")}`
                        : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                      opacity: reached ? 1 : 0.5,
                      transform: isCurrent ? "scale(1.08)" : "scale(1)",
                      filter: reached ? "none" : "grayscale(0.8)",
                    }}
                  >
                    {/* Ripples on current tier */}
                    {isCurrent && (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            border: `1.5px solid ${t.color}80`,
                            animation: "tierRipple 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                          }}
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            border: `1px solid ${t.color}55`,
                            animation: "tierRipple 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                            animationDelay: "0.75s",
                          }}
                        />
                      </>
                    )}
                    {/* Dashed ring on reached tiers */}
                    {reached && (
                      <div
                        className="absolute inset-[-6px] rounded-full border border-dashed pointer-events-none"
                        style={{
                          borderColor: `${t.color}30`,
                          animation: `tierRotate ${isCurrent ? 14 : 22}s linear infinite`,
                        }}
                      />
                    )}
                    <TierIcon
                      className="relative h-[18px] w-[18px]"
                      strokeWidth={1.9}
                      style={{
                        color: reached ? t.color : "rgba(255,255,255,0.3)",
                        filter: reached ? `drop-shadow(0 0 ${isCurrent ? 12 : 8}px ${t.glow})` : "none",
                      }}
                    />
                    {/* Complete check */}
                    {complete && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-[2.5px] ring-black flex items-center justify-center"
                        style={{ boxShadow: "0 4px 12px -2px rgba(34,197,94,0.6)" }}
                      >
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.2} />
                      </span>
                    )}
                  </div>

                  <span
                    className="mt-3 text-[9.5px] font-bold uppercase tracking-[0.22em] transition-colors duration-500"
                    style={{ color: isCurrent ? t.color : reached ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)" }}
                  >
                    {t.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress into current tier */}
        <div className="mt-9">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-2">
            <span className="text-white/45">
              <span style={{ color: currentTier.color }} className="tabular-nums">{intoTier.toLocaleString()}</span>
              <span className="text-white/30"> / {tierRange.toLocaleString()} XP in tier</span>
            </span>
            <span className="text-white/45">
              {isMaxTier ? (
                <span className="text-[#fbbf24]">MAX TIER</span>
              ) : (
                <>
                  <span className="tabular-nums">{xpToNext.toLocaleString()}</span> XP to{" "}
                  <span style={{ color: nextTier.color }}>{nextTier.label}</span>
                </>
              )}
            </span>
          </div>
          <div className="relative h-[6px] rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-[1400ms] ease-out"
              style={{
                width: `${tierProgressPct}%`,
                background: `linear-gradient(90deg, ${currentTier.color}aa, ${currentTier.color})`,
                boxShadow: `0 0 10px ${currentTier.glow}`,
              }}
            />
            {tierProgressPct > 0 && (
              <div
                className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
                style={{ width: `${tierProgressPct}%` }}
              >
                <span
                  className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  style={{ animation: "tierShine 2.6s ease-in-out infinite" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes tierShine {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        @keyframes tierRipple {
          0%   { transform: scale(1);    opacity: 0.85; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes tierRotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
