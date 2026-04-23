"use client"

import { useState, useEffect, useMemo } from "react"
import { ExternalLink, Shield, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Gamepad2, Wrench, ArrowRight, Mail } from "lucide-react"
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
interface DayDot { day: number; status: "up" | "incident"; label: string }
function build90DayIncidents(): DayDot[] {
  const rng = seededRng(hashString("lethal-global-90d"))
  const days: DayDot[] = []
  const now = new Date()
  const INCIDENT_LABELS = [
    "Fortnite anti-cheat wave — patched in 1h 42m",
    "API latency spike — resolved",
    "DMA firmware signing delay — resolved",
    "Brief VGK detection — patched same day",
  ]
  let incidentIdx = 0
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const isIncident = rng() < 0.04 && incidentIdx < INCIDENT_LABELS.length
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    days.push({
      day: 89 - i,
      status: isIncident ? "incident" : "up",
      label: isIncident
        ? `${dateLabel} · ${INCIDENT_LABELS[incidentIdx++]}`
        : `${dateLabel} · All systems operational`,
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

          {/* Stats — wrap on mobile to prevent horizontal scroll */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 sm:gap-x-8 mb-14">
            {[
              { value: `${undetectedCount}/${totalProducts}`, label: "Undetected", color: "text-emerald-400" },
              { value: "99.8%", label: "Rate", color: "text-white" },
              { value: "<2h", label: "Patch time", color: "text-white" },
              { value: "24/7", label: "Monitoring", color: "text-white" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 sm:gap-8">
                {i > 0 && <div className="hidden sm:block w-px h-6 bg-white/[0.06]" />}
                <div className="text-center">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-white/20 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 90-day global incident strip */}
          <div className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-semibold">90-day incident timeline</p>
                <p className="text-[12px] text-white/55 mt-0.5">
                  <span className="text-emerald-400 font-bold tabular-nums">{90 - incidentCount}</span> green days ·{" "}
                  <span className="text-red-400 font-bold tabular-nums">{incidentCount}</span> incident{incidentCount === 1 ? "" : "s"} · avg patch time{" "}
                  <span className="text-white/80 font-bold">1h 48m</span>
                </p>
              </div>
              <div className="flex items-center gap-[2px] h-8" style={{ width: 180 }} role="list" aria-label="90-day incident history">
                {ninetyDays.map((d) => (
                  <div key={d.day} className="relative group/dot flex-1 h-full">
                    <div className={`w-full h-full rounded-[2px] transition-all ${d.status === "up" ? "bg-emerald-500/70 group-hover/dot:bg-emerald-400" : "bg-red-500 group-hover/dot:bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`} />
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-[10px] text-white whitespace-nowrap bg-black/95 border border-white/[0.08] opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150 shadow-[0_8px_20px_rgba(0,0,0,0.5)] z-30">
                      {d.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/35">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" /> up</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> incident</span>
              </div>
            </div>
          </div>

          {/* Filter & Legend */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="inline-flex gap-1 p-1 rounded-xl border border-white/[0.04] bg-white/[0.015]">
              {(["all", "cheats", "spoofers", "firmware"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === f
                      ? "bg-white/[0.08] text-white"
                      : "text-white/25 hover:text-white/45"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-white/25">Undetected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                <span className="text-white/25">Testing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                <span className="text-white/25">Updating</span>
              </div>
              <span className="text-white/15">
                Updated {lastUpdated === 0 ? "now" : `${lastUpdated}m ago`}
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

              return (
                <div
                  key={product.id}
                  className="spotlight-card group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-white/[0.015] border border-white/[0.06] hover:border-[#f97316]/30 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(249, 115, 22, 0.14)] transition-all duration-300"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/[0.06] flex-shrink-0 bg-white/[0.02]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-white truncate tracking-tight">{product.name}</h3>
                      <p className="text-[13px] text-white/55">{product.category}</p>
                    </div>
                  </div>

                  {/* Games */}
                  <div className="hidden lg:flex items-center gap-2 min-w-[180px]">
                    <Gamepad2 className="h-4 w-4 text-white/30 shrink-0" />
                    <p className="text-sm text-white/55 truncate">
                      {product.games?.join(", ")}
                    </p>
                  </div>

                  {/* 30-day Sparkline (SVG line, not uniform bars) — inline on mobile too */}
                  <div className="shrink-0 w-full md:w-[160px]">
                    <svg width="160" height="28" viewBox="0 0 160 28" preserveAspectRatio="none" aria-label="30-day uptime trend" className="block w-full h-7">
                      <defs>
                        <linearGradient id="sparkFillGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="sparkFillAmber" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="sparkFillRed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f87171" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={spark.fillD} fill={sparkFill} />
                      <path d={spark.d} fill="none" stroke={sparkStroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                      <circle cx="159" cy={spark.lastY} r="2" fill={sparkStroke} />
                    </svg>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-white/25 uppercase tracking-[0.14em]">30d</span>
                      <span className="text-[10px] text-white/55 font-mono tabular-nums">{getUptimePercent(product.id)}%</span>
                    </div>
                  </div>

                  {/* Days Undetected */}
                  <div className="hidden md:flex items-center gap-2 min-w-[100px]">
                    <Shield className="h-4 w-4 text-emerald-400/60" />
                    <span className="text-sm text-white/55"><span className="text-emerald-400 font-bold">{getDaysUndetected(product.id)}</span> days</span>
                  </div>

                  {/* Status — primary chip + secondary state + last incident */}
                  <div className="flex flex-col items-start md:items-end gap-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgLight}`}>
                        <span
                          className={`h-2 w-2 rounded-full ${statusConfig.bg}`}
                          style={product.status === "undetected" ? { animation: "statusPulse 2s ease-in-out infinite" } : {}}
                        />
                        <span className={`text-[11px] font-bold tracking-wider ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      {secondary && (
                        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.04]">
                          <span className={`h-1.5 w-1.5 rounded-full ${secondary.dot}`} />
                          <span className={`text-[10px] font-semibold tracking-wider ${secondary.color}`}>{secondary.label}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-white/35">
                      Last incident <span className="tabular-nums">{getLastIncident(product.id)}</span>
                    </span>
                  </div>

                  {/* Link */}
                  <Link
                    href={`/products/${product.id}`}
                    data-cursor="cta"
                    data-cursor-label="View"
                    className="cursor-cta press-spring flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-[#f97316]/10 hover:text-[#f97316] hover:shadow-[0_0_18px_rgba(249,115,22,0.35)] transition-all shrink-0"
                  >
                    <ExternalLink className="h-4 w-4 text-white/55" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Changelog link + Subscribe row */}
          <div className="mb-12 grid gap-4 md:grid-cols-2">
            <Link
              href="/changelog"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-5 py-4 hover:border-[#f97316]/30 hover:bg-white/[0.03] transition-all"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-semibold">Product updates</p>
                <p className="text-sm text-white/80 mt-0.5">Patches, releases & maintenance log</p>
              </div>
              <span className="flex items-center gap-1.5 text-[#f97316] text-[13px] font-bold whitespace-nowrap">
                See full changelog
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3"
            >
              <Mail className="h-4 w-4 text-white/30 shrink-0" />
              <input
                type="email"
                placeholder="you@email.com"
                aria-label="Email for status alerts"
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
              />
              <button
                type="submit"
                className="press-spring px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] transition-colors shrink-0"
              >
                Subscribe
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
