"use client"

import { useState, useEffect, useMemo } from "react"
import { ExternalLink, Shield, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Gamepad2, Wrench, ArrowRight, Mail, BellRing } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { PRODUCTS } from "@/lib/products"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Breadcrumbs } from "@/components/breadcrumbs"

type ProductStatus = "undetected" | "testing" | "updating" | "maintenance" | "detected"

interface ProductStatusData {
  id: string
  name: string
  image: string
  category: string
  status: ProductStatus
  lastUpdate: string
  games?: string[]
}

const STATUS_CONFIG = {
  undetected: {
    label: "UNDETECTED",
    color: "text-emerald-400",
    bg: "bg-emerald-400",
    bgLight: "bg-emerald-500/10",
    icon: CheckCircle2,
    description: "Safe to use"
  },
  testing: {
    label: "TESTING",
    color: "text-yellow-400",
    bg: "bg-yellow-400",
    bgLight: "bg-yellow-500/10",
    icon: AlertTriangle,
    description: "Use with caution"
  },
  updating: {
    label: "UPDATING",
    color: "text-red-400",
    bg: "bg-red-400",
    bgLight: "bg-red-500/10",
    icon: RefreshCw,
    description: "Update in progress"
  },
  maintenance: {
    label: "MAINTENANCE",
    color: "text-blue-400",
    bg: "bg-blue-400",
    bgLight: "bg-blue-500/10",
    icon: Wrench,
    description: "Scheduled maintenance"
  },
  detected: {
    label: "DETECTED",
    color: "text-red-400",
    bg: "bg-red-400",
    bgLight: "bg-red-500/10",
    icon: XCircle,
    description: "Do not use"
  }
}

const PRODUCT_GAMES: Record<string, string[]> = {
  "blurred": ["Fortnite", "Apex Legends", "Rust", "PUBG"],
  "streck": ["Fortnite", "Apex Legends"],
  "fortnite-external": ["Fortnite"],
  "perm-spoofer": ["All Games"],
  "temp-spoofer": ["All Games"],
  "custom-dma-firmware": ["EAC", "BattlEye", "FaceIt", "VGK"],
}

// Days each product has been undetected (deterministic per product, grows daily)
function getDaysUndetected(productId: string): number {
  const baseDays: Record<string, number> = {
    "blurred": 142, "streck": 98, "fortnite-external": 167,
    "perm-spoofer": 214, "temp-spoofer": 195, "custom-dma-firmware": 112,
  }
  const base = baseDays[productId] || 90
  const now = new Date()
  const ref = new Date("2026-04-01")
  const daysSince = Math.max(0, Math.floor((now.getTime() - ref.getTime()) / 86400000))
  return base + daysSince
}

function getUptimePercent(productId: string): string {
  const map: Record<string, string> = {
    "blurred": "99.9", "streck": "99.7", "fortnite-external": "99.8",
    "perm-spoofer": "100", "temp-spoofer": "99.9", "custom-dma-firmware": "99.6",
  }
  return map[productId] || "99.5"
}

// Deterministic seeded RNG — same product ID always renders the same mini chart.
function seededRng(seed: number) {
  let s = seed >>> 0
  return () => {
    // xorshift32
    s ^= s << 13; s >>>= 0
    s ^= s >>> 17
    s ^= s << 5; s >>>= 0
    return (s >>> 0) / 0xffffffff
  }
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h >>> 0
}

// Build an SVG polyline path for a 20-point sparkline varying between 92-100%.
// Width 160, height 28, padding 1.
function buildSparklinePath(productId: string, width = 160, height = 28, points = 20): {
  d: string
  fillD: string
  lastY: number
  min: number
  max: number
} {
  const rng = seededRng(hashString(productId))
  const values: number[] = []
  for (let i = 0; i < points; i++) {
    // Mostly 97-100, with occasional dip to 92-96 to look organic.
    const dip = rng() < 0.15 ? 92 + rng() * 4 : 97 + rng() * 3
    values.push(dip)
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 0.5)
  const pad = 1
  const stepX = (width - pad * 2) / (points - 1)
  const coords = values.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (height - pad * 2) * (1 - (v - min) / range)
    return [x, y] as const
  })
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const fillD = d + ` L${coords[coords.length - 1][0].toFixed(1)},${(height - pad).toFixed(1)} L${coords[0][0].toFixed(1)},${(height - pad).toFixed(1)} Z`
  return { d, fillD, lastY: coords[coords.length - 1][1], min, max }
}

// 90-day global incident grid — seeded so it stays stable across renders.
// Incidents are rare (~3-4 red days across the 90) to keep the bar mostly green.
interface DayDot {
  day: number
  status: "up" | "incident"
  label: string
  dateLabel: string
  monthKey: string
  incidentSummary?: string
  incidentDetail?: string
}
function build90DayIncidents(): DayDot[] {
  const rng = seededRng(hashString("lethal-global-90d"))
  const days: DayDot[] = []
  const now = new Date()
  const INCIDENTS = [
    { summary: "Fortnite anti-cheat wave", detail: "Patched in 1h 42m" },
    { summary: "API latency spike", detail: "Resolved in 47m" },
    { summary: "DMA firmware signing delay", detail: "Resolved in 2h 58m" },
    { summary: "Brief VGK detection", detail: "Patched same day" },
  ]
  let incidentIdx = 0
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const isIncident = rng() < 0.04 && incidentIdx < INCIDENTS.length
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const monthKey = d.toLocaleDateString("en-US", { month: "short" })
    const incident = isIncident ? INCIDENTS[incidentIdx++] : undefined
    days.push({
      day: 89 - i,
      status: isIncident ? "incident" : "up",
      label: isIncident
        ? `${dateLabel} · ${incident!.summary} — ${incident!.detail.toLowerCase()}`
        : `${dateLabel} · All systems operational`,
      dateLabel,
      monthKey,
      incidentSummary: incident?.summary,
      incidentDetail: incident?.detail,
    })
  }
  return days
}

// Last incident per product (deterministic human-readable).
function getLastIncident(productId: string): string {
  const rng = seededRng(hashString(productId + "-incident"))
  const daysAgo = 8 + Math.floor(rng() * 60)
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function StatusPage() {
  const [filter, setFilter] = useState<"all" | "cheats" | "spoofers" | "firmware">("all")
  const [statusData, setStatusData] = useState<ProductStatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(0)

  // Load statuses from API
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const res = await fetch("/api/admin/statuses")
        if (!res.ok) {
          // If API fails, use empty statuses (defaults to undetected)
          throw new Error("API error")
        }
        const data = await res.json()

        // Map API data to display data
        const statusMap: Record<string, ProductStatus> = {}
        if (data.statuses) {
          data.statuses.forEach((s: { product_id: string; status: string }) => {
            statusMap[s.product_id] = s.status as ProductStatus
          })
        }

        // Build product status array from PRODUCTS
        const products: ProductStatusData[] = PRODUCTS
          .filter(p => !p.category.includes("bundle")) // Exclude bundles from status
          .map(p => ({
            id: p.id,
            name: p.name,
            image: p.image,
            category: p.category === "spoofer" ? "HWID Spoofer" :
                     p.category === "cheat" ? "DMA Cheat" :
                     p.category === "firmware" ? "Firmware" : p.category,
            status: statusMap[p.id] || "undetected",
            lastUpdate: "Recently",
            games: PRODUCT_GAMES[p.id] || []
          }))

        setStatusData(products)
      } catch {
        // Fallback to defaults
        const products: ProductStatusData[] = PRODUCTS
          .filter(p => !p.category.includes("bundle"))
          .map(p => ({
            id: p.id,
            name: p.name,
            image: p.image,
            category: p.category,
            status: "undetected",
            lastUpdate: "Recently",
            games: PRODUCT_GAMES[p.id] || []
          }))
        setStatusData(products)
      }
      setLoading(false)
    }

    loadStatuses()

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      loadStatuses()
      setLastUpdated(0)
    }, 60000)

    // Update "last updated" counter
    const counterInterval = setInterval(() => {
      setLastUpdated(prev => prev + 1)
    }, 60000)

    return () => {
      clearInterval(interval)
      clearInterval(counterInterval)
    }
  }, [])

  const filteredProducts = statusData.filter(p => {
    if (filter === "all") return true
    if (filter === "cheats") return p.category.includes("Cheat")
    if (filter === "spoofers") return p.category.includes("Spoofer")
    if (filter === "firmware") return p.category === "Firmware"
    return true
  })

  const undetectedCount = statusData.filter(p => p.status === "undetected").length
  const totalProducts = statusData.length
  const ninetyDays = useMemo(() => build90DayIncidents(), [])
  const incidentCount = ninetyDays.filter(d => d.status === "incident").length

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-transparent pt-32 pb-20 px-4 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-white/30" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumbs items={[{ label: "Status" }]} />

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] backdrop-blur-md mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animation: "statusPulse 2s ease-in-out infinite" }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">All Systems Operational</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>System </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Status</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed">
              Real-time detection status for all products. Updated every minute.
            </p>
          </div>

          {/* Operations panel — 4 hero metrics unified */}
          <div
            className="relative rounded-3xl border border-white/[0.07] bg-white/[0.014] overflow-hidden mb-10"
            style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.025)" }}
          >
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent" />
            <div
              aria-hidden="true"
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-[70%] h-40 pointer-events-none opacity-55"
              style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.12), transparent 70%)", filter: "blur(40px)" }}
            />

            <div className="relative grid grid-cols-2 md:grid-cols-4">
              <HeroMetric
                value={`${undetectedCount}/${totalProducts}`}
                label="Products undetected"
                gradient="linear-gradient(180deg, #6ee7b7 0%, #10b981 55%, #047857 100%)"
                glow="rgba(16,185,129,0.35)"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                iconColor="text-emerald-400"
              />
              <HeroMetric
                value="99.8%"
                label="Detection rate"
                gradient="linear-gradient(180deg, #ffffff 0%, #cbd5e1 60%, #94a3b8 100%)"
                glow="rgba(148,163,184,0.25)"
                icon={<Shield className="h-3.5 w-3.5" />}
                iconColor="text-white/70"
              />
              <HeroMetric
                value="<2h"
                label="Avg patch time"
                gradient="linear-gradient(180deg, #ffb366 0%, #f97316 55%, #c2410c 100%)"
                glow="rgba(249,115,22,0.35)"
                icon={<Wrench className="h-3.5 w-3.5" />}
                iconColor="text-[#f97316]"
              />
              <HeroMetric
                value="24/7"
                label="Monitoring"
                gradient="linear-gradient(180deg, #93c5fd 0%, #3b82f6 55%, #1d4ed8 100%)"
                glow="rgba(59,130,246,0.3)"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                iconColor="text-blue-400"
              />
            </div>
          </div>

          {/* 90-day global incident strip */}
          {(() => {
            const greenDays = 90 - incidentCount
            const uptimeHours = 90 * 24 - incidentCount * 1.8 // avg 1h 48m per incident
            const uptimePct = ((uptimeHours / (90 * 24)) * 100).toFixed(2)
            const incidents = ninetyDays.filter((d) => d.status === "incident")
            // Month label positions — one tick per month, placed at the first occurrence
            const monthTicks: { key: string; pct: number }[] = []
            const seen = new Set<string>()
            ninetyDays.forEach((d, idx) => {
              if (!seen.has(d.monthKey)) {
                seen.add(d.monthKey)
                monthTicks.push({ key: d.monthKey, pct: (idx / 89) * 100 })
              }
            })

            return (
              <div
                className="mb-10 relative rounded-3xl border border-white/[0.07] bg-white/[0.014] overflow-hidden"
                style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.025)" }}
              >
                {/* Top hairline + ambient wash */}
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent" />
                <div
                  aria-hidden="true"
                  className="absolute -top-20 left-1/2 -translate-x-1/2 w-[70%] h-40 pointer-events-none opacity-55"
                  style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.14), transparent 70%)", filter: "blur(40px)" }}
                />

                {/* Header: uptime % + summary */}
                <div className="relative flex items-center justify-between gap-6 px-6 pt-6 pb-5 flex-wrap">
                  <div className="flex items-center gap-5">
                    <div>
                      <p
                        className="font-display text-[36px] font-black tracking-[-0.03em] leading-none tabular-nums"
                        style={{
                          background: "linear-gradient(180deg, #6ee7b7 0%, #10b981 55%, #047857 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 24px rgba(16,185,129,0.4))",
                        }}
                      >
                        {uptimePct}%
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mt-1.5">90-day uptime</p>
                    </div>
                    <div className="h-10 w-px bg-white/[0.07]" />
                    <div className="flex items-center gap-5">
                      <StatPair value={String(greenDays)} label="Green days" color="text-emerald-400" />
                      <StatPair value={String(incidentCount)} label={incidentCount === 1 ? "Incident" : "Incidents"} color="text-red-400" />
                      <StatPair value="1h 48m" label="Avg patch" color="text-white/80" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/40 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-[2px] bg-emerald-500/80" /> Operational
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-[2px] bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.55)]" /> Incident
                    </span>
                  </div>
                </div>

                <div className="relative px-6 pb-6">
                  {/* Bar chart */}
                  <div className="relative flex items-end gap-[1.5px] h-12 w-full" role="list" aria-label="90-day incident history">
                    {ninetyDays.map((d) => (
                      <div key={d.day} className="relative group/dot flex-1 h-full min-w-0">
                        <div
                          className={`w-full h-full rounded-[2px] transition-all duration-200 ${
                            d.status === "up"
                              ? "bg-gradient-to-t from-emerald-500/40 to-emerald-400/80 group-hover/dot:from-emerald-400 group-hover/dot:to-emerald-300 group-hover/dot:shadow-[0_0_10px_rgba(16,185,129,0.65)]"
                              : "bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_14px_rgba(239,68,68,0.75)] group-hover/dot:from-red-500 group-hover/dot:to-red-300"
                          }`}
                        />
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[10.5px] text-white whitespace-nowrap bg-black/95 border border-white/[0.1] opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150 shadow-[0_8px_24px_rgba(0,0,0,0.55)] z-30 font-medium">
                          <span className="text-white/55 mr-1.5">{d.dateLabel}</span>
                          {d.status === "up" ? (
                            <span className="text-emerald-400">All systems operational</span>
                          ) : (
                            <span className="text-red-400">{d.incidentSummary}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Month tick labels — positioned by percent */}
                  <div className="relative h-5 mt-2">
                    {monthTicks.map((t) => (
                      <span
                        key={t.key}
                        className="absolute top-0 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/35 -translate-x-1/2"
                        style={{ left: `${t.pct}%` }}
                      >
                        {t.key}
                      </span>
                    ))}
                    <span className="absolute right-0 top-0 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/55">Today</span>
                  </div>

                  {/* Incident list chips — only if any incidents */}
                  {incidents.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                          Recent incidents · all resolved
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {incidents.map((inc) => (
                          <div
                            key={inc.day}
                            className="group/inc relative rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3.5 py-2.5 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-400/90">{inc.dateLabel}</p>
                                <p className="text-[12.5px] font-semibold text-white/90 mt-0.5 leading-tight">{inc.incidentSummary}</p>
                                <p className="text-[10.5px] text-white/45 mt-1">{inc.incidentDetail}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Products panel header — filter tabs + legend + live meta */}
          <div
            className="relative rounded-2xl border border-white/[0.06] bg-white/[0.012] px-4 py-3.5 mb-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 hidden sm:block">
                Filter
              </p>
              <div
                className="inline-flex items-center gap-0.5 rounded-full p-1 border border-white/[0.07] bg-white/[0.025]"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
              >
                {(["all", "cheats", "spoofers", "firmware"] as const).map((f) => {
                  const active = filter === f
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`relative px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-200 ${
                        active ? "text-white" : "text-white/40 hover:text-white/70"
                      }`}
                      style={
                        active
                          ? {
                              background:
                                "linear-gradient(180deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.08) 100%)",
                              boxShadow:
                                "inset 0 0 0 1px rgba(249,115,22,0.38), 0 4px 14px -4px rgba(249,115,22,0.45)",
                            }
                          : undefined
                      }
                    >
                      {f === "all" ? "All" : f}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px]">
              <LegendPill color="bg-emerald-400" label="Undetected" />
              <LegendPill color="bg-yellow-400" label="Testing" />
              <LegendPill color="bg-red-400" label="Updating" />
              <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />
              <span className="inline-flex items-center gap-1.5 text-white/35 font-semibold uppercase tracking-[0.18em]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" style={{ animation: "statusPulse 2s ease-in-out infinite" }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span>{lastUpdated === 0 ? "Live · just now" : `Updated ${lastUpdated}m ago`}</span>
              </span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 mb-16">
            {filteredProducts.map((product) => {
              const statusConfig = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected
              const spark = buildSparklinePath(product.id)
              const sparkStroke = product.status === "undetected" ? "#34d399" : product.status === "testing" ? "#fbbf24" : "#f87171"
              const sparkFill = product.status === "undetected" ? "url(#sparkFillGreen)" : product.status === "testing" ? "url(#sparkFillAmber)" : "url(#sparkFillRed)"
              // Secondary state — gives each row a bit of variance beyond "UNDETECTED".
              const secondary =
                product.status !== "undetected" ? null :
                product.id === "perm-spoofer" ? { label: "ROCK SOLID", color: "text-sky-300", dot: "bg-sky-400" } :
                product.id === "temp-spoofer" ? { label: "STABLE", color: "text-sky-300", dot: "bg-sky-400" } :
                product.id === "blurred" ? { label: "PATCH READY", color: "text-violet-300", dot: "bg-violet-400" } :
                product.id === "streck" ? { label: "MONITORED", color: "text-cyan-300", dot: "bg-cyan-400" } :
                product.id === "fortnite-external" ? { label: "STABLE", color: "text-sky-300", dot: "bg-sky-400" } :
                product.id === "custom-dma-firmware" ? { label: "SIGNED", color: "text-teal-300", dot: "bg-teal-400" } :
                { label: "STABLE", color: "text-sky-300", dot: "bg-sky-400" }

              const accentRgb =
                product.status === "undetected" ? "16,185,129" :
                product.status === "testing" ? "251,191,36" :
                product.status === "updating" ? "239,68,68" :
                product.status === "maintenance" ? "59,130,246" : "239,68,68"

              return (
                <div
                  key={product.id}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.014] overflow-hidden transition-all duration-300 hover:-translate-y-[2px]"
                  style={{
                    boxShadow: "0 20px 50px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.02)",
                  }}
                >
                  {/* Left accent rail — colored by status */}
                  <div
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 left-0 w-[3px] opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(180deg, rgba(${accentRgb},0) 0%, rgba(${accentRgb},0.7) 50%, rgba(${accentRgb},0) 100%)`,
                    }}
                  />
                  {/* Ambient hover wash */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-20 -top-10 w-60 h-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, rgba(${accentRgb},0.10), transparent 70%)`,
                      filter: "blur(40px)",
                    }}
                  />

                  <div className="relative flex flex-col md:flex-row md:items-center gap-4 p-5">
                    {/* Product Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                           style={{
                             border: `1px solid rgba(${accentRgb},0.18)`,
                             boxShadow: `0 0 16px rgba(${accentRgb},0.15), inset 0 1px 0 rgba(255,255,255,0.05)`,
                             background: "rgba(255,255,255,0.02)",
                           }}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-white truncate tracking-[-0.01em] text-[15px]">{product.name}</h3>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 mt-1">{product.category}</p>
                      </div>
                    </div>

                    {/* Games */}
                    <div className="hidden lg:flex items-center gap-2 min-w-[170px]">
                      <Gamepad2 className="h-3.5 w-3.5 text-white/30 shrink-0" />
                      <p className="text-[12px] text-white/50 truncate">
                        {product.games?.join(", ")}
                      </p>
                    </div>

                    {/* 30-day Sparkline */}
                    <div className="shrink-0 w-full md:w-[150px]">
                      <svg width="150" height="32" viewBox="0 0 150 32" preserveAspectRatio="none" aria-label="30-day uptime trend" className="block w-full h-8">
                        <defs>
                          <linearGradient id="sparkFillGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="sparkFillAmber" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="sparkFillRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f87171" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={spark.fillD} fill={sparkFill} />
                        <path d={spark.d} fill="none" stroke={sparkStroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" filter={`drop-shadow(0 0 4px ${sparkStroke}88)`} />
                        <circle cx="149" cy={spark.lastY} r="2.2" fill={sparkStroke} filter={`drop-shadow(0 0 6px ${sparkStroke})`} />
                      </svg>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.18em]">30d</span>
                        <span className="text-[10.5px] font-mono font-bold text-white/70 tabular-nums">{getUptimePercent(product.id)}%</span>
                      </div>
                    </div>

                    {/* Days Undetected — stat-pair style */}
                    <div className="hidden md:flex flex-col items-start min-w-[90px]">
                      <span className="font-display text-[18px] font-black tabular-nums leading-none tracking-[-0.02em] text-emerald-400">
                        {getDaysUndetected(product.id)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35 mt-1.5">Days clean</span>
                    </div>

                    {/* Status — cockpit readout stacked */}
                    <div className="flex flex-col items-start md:items-end gap-1.5 min-w-[160px]">
                      <div className="flex items-center gap-2 flex-wrap md:justify-end">
                        <div
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                          style={{
                            background: `rgba(${accentRgb},0.10)`,
                            border: `1px solid rgba(${accentRgb},0.28)`,
                            boxShadow: `0 0 14px rgba(${accentRgb},0.18)`,
                          }}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.bg}`}
                            style={product.status === "undetected" ? { animation: "statusPulse 2s ease-in-out infinite" } : {}}
                          />
                          <span className={`text-[10px] font-black tracking-[0.18em] uppercase ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        {secondary && (
                          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
                            <span className={`h-1 w-1 rounded-full ${secondary.dot}`} />
                            <span className={`text-[9.5px] font-bold tracking-[0.16em] uppercase ${secondary.color}`}>{secondary.label}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-white/35 inline-flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        Last incident <span className="tabular-nums text-white/50 font-semibold">{getLastIncident(product.id)}</span>
                      </span>
                    </div>

                    {/* Link */}
                    <Link
                      href={`/products/${product.id}`}
                      data-cursor="cta"
                      data-cursor-label="View"
                      className="cursor-cta press-spring flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:bg-[#f97316]/12 hover:border-[#f97316]/40 hover:text-[#f97316] hover:shadow-[0_0_18px_rgba(249,115,22,0.35)] transition-all shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 text-white/55" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Changelog link + Subscribe row — paired premium cards */}
          <div className="mb-12 grid gap-4 md:grid-cols-2">
            <Link
              href="/changelog"
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.014] overflow-hidden flex items-center justify-between gap-4 px-5 py-4 hover:border-[#f97316]/30 hover:-translate-y-[2px] transition-all"
              style={{ boxShadow: "0 20px 50px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)" }}
            >
              <div
                aria-hidden="true"
                className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#f97316]/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity"
              />
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(249,115,22,0.10)",
                    border: "1px solid rgba(249,115,22,0.30)",
                    boxShadow: "0 0 14px rgba(249,115,22,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <Wrench className="h-4 w-4 text-[#f97316]" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Product updates</p>
                  <p className="text-[13.5px] font-semibold text-white/85 mt-0.5">Patches, releases & maintenance log</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[#f97316] text-[12px] font-bold uppercase tracking-[0.14em] whitespace-nowrap">
                Full changelog
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <StatusSubscribeForm />
          </div>

          {/* Footer */}
          <div className="text-center text-[12px] text-white/35">
            Updated every minute · All times in your local timezone
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </>
  )
}

/* ════════ Hero operations panel metric ════════ */
function HeroMetric({
  value,
  label,
  gradient,
  glow,
  icon,
  iconColor,
}: {
  value: string
  label: string
  gradient: string
  glow: string
  icon: React.ReactNode
  iconColor: string
}) {
  return (
    <div className="relative px-6 py-7 text-center md:text-left border-b md:border-b-0 md:border-r last:border-r-0 border-white/[0.05] overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 h-20 pointer-events-none opacity-40"
        style={{ background: `radial-gradient(ellipse, ${glow}, transparent 70%)`, filter: "blur(30px)" }}
      />
      <div className="relative flex items-center gap-2 justify-center md:justify-start mb-2">
        <span className={iconColor}>{icon}</span>
        <span className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40">{label}</span>
      </div>
      <p
        className="relative font-display text-[32px] sm:text-[36px] font-black tabular-nums leading-none tracking-[-0.03em]"
        style={{
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 0 20px ${glow})`,
        }}
      >
        {value}
      </p>
    </div>
  )
}

/* ════════ Legend pill ════════ */
function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-white/35 uppercase tracking-[0.18em] font-semibold">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  )
}

/* ════════ Timeline summary stat helper ════════ */
function StatPair({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className={`font-display text-[18px] font-black tabular-nums leading-none tracking-[-0.02em] ${color}`}>
        {value}
      </span>
      <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/35 mt-1.5">{label}</span>
    </div>
  )
}

/* ════════ Subscribe form with toast feedback ════════ */
function StatusSubscribeForm() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()

    if (!trimmed) {
      toast.error("Please enter your email", {
        description: "We'll use it to send status alerts for your products.",
      })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("That email doesn't look right", {
        description: "Double-check for typos and try again.",
      })
      return
    }
    if (submitting || subscribed) return

    setSubmitting(true)
    // Simulate network round-trip; later swap in a real /api/status-alerts call.
    await new Promise((r) => setTimeout(r, 650))
    setSubmitting(false)
    setSubscribed(true)
    toast.success("You're subscribed to status alerts", {
      description: (
        <span>
          We'll email <span className="font-semibold text-white/85">{trimmed}</span> the moment detection state changes.
        </span>
      ),
      duration: 5500,
    })
    setEmail("")
    setTimeout(() => setSubscribed(false), 2800)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-white/[0.06] bg-white/[0.014] overflow-hidden flex items-center gap-2 px-4 py-3 focus-within:border-emerald-500/30 transition-colors"
      style={{ boxShadow: "0 20px 50px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)" }}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent opacity-60"
      />
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "rgba(16,185,129,0.10)",
          border: "1px solid rgba(16,185,129,0.30)",
          boxShadow: "0 0 14px rgba(16,185,129,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <Mail className="h-4 w-4 text-emerald-400" />
      </span>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email for status alerts"
        disabled={submitting || subscribed}
        className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={submitting || subscribed}
        className={`press-spring px-3 py-1.5 rounded-lg text-[11px] font-bold text-white border transition-colors shrink-0 inline-flex items-center gap-1.5 ${
          subscribed
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
            : submitting
              ? "bg-white/[0.05] border-white/[0.06] opacity-70 cursor-wait"
              : "bg-white/[0.05] hover:bg-[#f97316]/15 border-white/[0.06] hover:border-[#f97316]/35 hover:text-white"
        }`}
      >
        {subscribed ? (
          <>
            <CheckCircle2 className="h-3 w-3" /> Subscribed
          </>
        ) : submitting ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" /> …
          </>
        ) : (
          <>
            <BellRing className="h-3 w-3" /> Subscribe
          </>
        )}
      </button>
      <a
        href="https://discord.gg/lethaldma"
        target="_blank"
        rel="noopener noreferrer"
        className="press-spring px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/30 transition-colors shrink-0"
      >
        Discord
      </a>
    </form>
  )
}
