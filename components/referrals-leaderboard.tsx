"use client"

import { useEffect, useRef, useState } from "react"
import { Trophy, Medal, Award } from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"

type Row = { rank: number; name: string; country: string; refs: number; earned: number }

const LEADERBOARD: Row[] = [
  { rank: 1,  name: "zk",      country: "🇬🇧", refs: 142, earned: 1420 },
  { rank: 2,  name: "vex_",    country: "🇺🇸", refs: 98,  earned: 980 },
  { rank: 3,  name: "raxo",    country: "🇩🇪", refs: 87,  earned: 870 },
  { rank: 4,  name: "rxn",     country: "🇦🇺", refs: 64,  earned: 640 },
  { rank: 5,  name: "ty1er",   country: "🇨🇦", refs: 58,  earned: 580 },
  { rank: 6,  name: "bixy",    country: "🇫🇷", refs: 49,  earned: 490 },
  { rank: 7,  name: "neo_",    country: "🇵🇱", refs: 42,  earned: 420 },
  { rank: 8,  name: "mikez",   country: "🇳🇱", refs: 38,  earned: 380 },
  { rank: 9,  name: "dxn",     country: "🇸🇪", refs: 31,  earned: 310 },
  { rank: 10, name: "chrxs",   country: "🇪🇸", refs: 27,  earned: 270 },
]

function medal(rank: number) {
  if (rank === 1) return { icon: Trophy, color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.45)" }
  if (rank === 2) return { icon: Medal, color: "#cbd5e1", bg: "rgba(203,213,225,0.10)", border: "rgba(203,213,225,0.35)" }
  if (rank === 3) return { icon: Award, color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.40)" }
  return null
}

export function ReferralsLeaderboard() {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const safety = window.setTimeout(() => setShown(true), 800)
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        window.clearTimeout(safety)
        setShown(true)
        obs.disconnect()
      }
    }, { threshold: 0, rootMargin: "200px 0px 200px 0px" })
    obs.observe(el)
    return () => {
      window.clearTimeout(safety)
      obs.disconnect()
    }
  }, [])

  return (
    <section ref={ref} className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-12">
          <SectionEyebrow label="Top Referrers" />
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.1] mb-4">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>This month's </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249, 115, 22, 0.4))" }}>leaderboard</span>
          </h2>
          <p className="text-white/55 text-[15px] max-w-lg mx-auto">
            Top 10 referrers this month. Earnings paid out in store credit or crypto on request.
          </p>
        </div>

        {(() => {
          const maxEarned = Math.max(...LEADERBOARD.map((r) => r.earned))
          return (
            <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.012] backdrop-blur-sm">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-[80px_1fr_140px_220px] items-center px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Referrals</span>
                <span className="text-right">Earned</span>
              </div>
              {LEADERBOARD.map((row, i) => {
                const m = medal(row.rank)
                const isTop3 = row.rank <= 3
                const pct = Math.max(6, Math.round((row.earned / maxEarned) * 100))
                return (
                  <div
                    key={row.rank}
                    className={`grid sm:grid-cols-[80px_1fr_140px_220px] grid-cols-[60px_1fr_auto] items-center px-5 py-4 transition-all duration-500 hover:bg-white/[0.02] ${
                      i !== LEADERBOARD.length - 1 ? "border-b border-white/[0.04]" : ""
                    } ${isTop3 ? "relative" : ""}`}
                    style={{
                      opacity: shown ? 1 : 0,
                      transform: shown ? "translateY(0)" : "translateY(14px)",
                      transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s, background-color 0.3s ease`,
                    }}
                  >
                    {/* Rank + medal */}
                    <div className="flex items-center gap-2">
                      {m ? (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border"
                          style={{ background: m.bg, borderColor: m.border, boxShadow: `0 0 16px ${m.bg}` }}
                        >
                          <m.icon className="h-4 w-4" style={{ color: m.color, filter: `drop-shadow(0 0 6px ${m.color}80)` }} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] text-[12px] font-bold text-white/50 tabular-nums">
                          {row.rank}
                        </span>
                      )}
                    </div>

                    {/* Player */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]"
                        style={{ background: `linear-gradient(135deg, hsl(${(row.name.charCodeAt(0) * 17) % 360}, 65%, 52%), hsl(${(row.name.charCodeAt(0) * 17 + 40) % 360}, 55%, 32%))` }}
                      >
                        {row.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-[14px] text-white tracking-tight truncate">{row.name}</p>
                        <p className="text-[11px] text-white/45">{row.country}</p>
                      </div>
                    </div>

                    {/* Referrals */}
                    <div className="text-right sm:block hidden">
                      <span className="tabular-nums font-display font-bold text-[18px] text-white/85">{row.refs}</span>
                      <span className="text-[11px] text-white/35 ml-1">refs</span>
                    </div>

                    {/* Earned — with inline relative bar */}
                    <div className="text-right flex items-center justify-end gap-3 min-w-0">
                      {/* Bar, hidden on mobile to keep things clean */}
                      <div className="hidden sm:block flex-1 max-w-[120px] h-[6px] rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                          style={{
                            width: shown ? `${pct}%` : "0%",
                            background: isTop3
                              ? "linear-gradient(90deg, rgba(251,191,36,0.6), rgba(249,115,22,1))"
                              : "linear-gradient(90deg, rgba(249,115,22,0.3), rgba(249,115,22,0.55))",
                            boxShadow: isTop3 ? "0 0 10px rgba(249,115,22,0.55)" : "none",
                          }}
                        />
                      </div>
                      <span className="tabular-nums font-display font-black text-[18px] shrink-0 min-w-[72px] text-right" style={{ color: isTop3 ? "#f97316" : "rgba(255,255,255,0.85)" }}>
                        £{row.earned}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

        <p className="text-center text-[11px] text-white/30 mt-5 uppercase tracking-[0.18em]">
          Rankings reset on the 1st of every month. £10 per conversion.
        </p>
      </div>
    </section>
  )
}
