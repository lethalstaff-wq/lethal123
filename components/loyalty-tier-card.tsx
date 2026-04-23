"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Zap, Flame, Crown } from "lucide-react"

const TIERS = [
  { key: "rookie",   label: "Rookie",   icon: Shield, min: 0,    max: 250,  color: "#94a3b8", glow: "rgba(148,163,184,0.5)" },
  { key: "pro",      label: "Pro",      icon: Zap,    min: 250,  max: 750,  color: "#38bdf8", glow: "rgba(56,189,248,0.5)" },
  { key: "veteran",  label: "Veteran",  icon: Flame,  min: 750,  max: 1800, color: "#f97316", glow: "rgba(249,115,22,0.55)" },
  { key: "elite",    label: "Elite",    icon: Crown,  min: 1800, max: 4000, color: "#fbbf24", glow: "rgba(251,191,36,0.55)" },
] as const

interface LoyaltyTierCardProps {
  /** Total XP earned. If omitted, mock mid-Veteran tier. */
  xp?: number
}

export function LoyaltyTierCard({ xp = 1240 }: LoyaltyTierCardProps) {
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

  const currentTier = TIERS.findLast((t) => displayXp >= t.min) ?? TIERS[0]
  const nextTier = TIERS[Math.min(TIERS.indexOf(currentTier) + 1, TIERS.length - 1)]
  const isMaxTier = currentTier === TIERS[TIERS.length - 1]
  const tierRange = currentTier.max - currentTier.min
  const intoTier = Math.min(displayXp - currentTier.min, tierRange)
  const tierProgressPct = Math.max(0, Math.min(100, (intoTier / tierRange) * 100))
  const xpToNext = isMaxTier ? 0 : Math.max(0, nextTier.min - displayXp)

  const CurrentIcon = currentTier.icon

  return (
    <div
      ref={ref}
      className="relative rounded-2xl border border-white/[0.06] bg-white/[0.012] backdrop-blur-sm overflow-hidden p-6 sm:p-8"
    >
      {/* Radial tier glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{ background: `radial-gradient(ellipse 80% 60% at 20% 30%, ${currentTier.glow.replace("0.5", "0.14").replace("0.55", "0.16")}, transparent 65%)`, filter: "blur(20px)" }}
      />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${currentTier.color}, transparent)` }} />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{
                background: `linear-gradient(135deg, ${currentTier.color}20, transparent)`,
                borderColor: `${currentTier.color}40`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px ${currentTier.glow.replace("0.5", "0.25").replace("0.55", "0.28")}`,
              }}
            >
              <CurrentIcon className="h-5 w-5" style={{ color: currentTier.color, filter: `drop-shadow(0 0 8px ${currentTier.glow})` }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Loyalty tier</p>
              <p className="font-display text-[22px] font-bold tracking-tight" style={{ color: currentTier.color }}>{currentTier.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Lifetime XP</p>
            <p className="font-display text-[26px] font-black tracking-[-0.02em] tabular-nums" style={{
              background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.78))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{displayXp.toLocaleString()}</p>
          </div>
        </div>

        {/* Tier ladder */}
        <div className="relative mb-3">
          <div className="flex items-end justify-between relative">
            {TIERS.map((t) => {
              const reached = displayXp >= t.min
              const isCurrent = t.key === currentTier.key
              const TierIcon = t.icon
              return (
                <div key={t.key} className="flex flex-col items-center relative z-[2]">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500"
                    style={{
                      background: reached ? `linear-gradient(135deg, ${t.color}25, ${t.color}10)` : "rgba(255,255,255,0.03)",
                      borderColor: reached ? `${t.color}55` : "rgba(255,255,255,0.08)",
                      boxShadow: isCurrent ? `0 0 18px ${t.glow.replace("0.5", "0.35").replace("0.55", "0.4")}, inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
                    }}
                  >
                    <TierIcon className="h-3.5 w-3.5" style={{ color: reached ? t.color : "rgba(255,255,255,0.3)" }} />
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.12em] mt-2 ${isCurrent ? "" : reached ? "text-white/60" : "text-white/30"}`} style={isCurrent ? { color: t.color } : undefined}>
                    {t.label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Connecting line w/ progress fill */}
          <div className="absolute left-4 right-4 top-4 h-px bg-white/[0.06] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-[width] duration-[1400ms] ease-out"
              style={{
                width: `${((TIERS.findIndex((t) => t.key === currentTier.key) + tierProgressPct / 100) / (TIERS.length - 1)) * 100}%`,
                background: `linear-gradient(90deg, ${TIERS[0].color}99, ${currentTier.color})`,
                boxShadow: `0 0 8px ${currentTier.glow.replace("0.5", "0.6").replace("0.55", "0.6")}`,
              }}
            />
          </div>
        </div>

        {/* Progress into current tier */}
        <div className="mt-6">
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
                  <span className="tabular-nums">{xpToNext.toLocaleString()}</span> XP to <span style={{ color: nextTier.color }}>{nextTier.label}</span>
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
            {/* Shimmer running along filled portion */}
            {tierProgressPct > 0 && (
              <div
                className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
                style={{ width: `${tierProgressPct}%` }}
              >
                <span
                  className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  style={{ animation: "loyaltyShine 2.4s ease-in-out infinite" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loyaltyShine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  )
}
