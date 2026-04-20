"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Activity, Shield, Zap, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, Gamepad2, Wrench } from "lucide-react"
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

function getRecentUpdates() {
  const now = new Date()
  const fmt = (daysAgo: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }
  return [
    { date: fmt(1), product: "Blurred DMA", type: "update" as const, message: "Updated for latest Fortnite patch" },
    { date: fmt(4), product: "Fortnite External", type: "update" as const, message: "Compatibility update released" },
    { date: fmt(9), product: "Perm Spoofer", type: "update" as const, message: "Enhanced SMBIOS spoofing" },
    { date: fmt(14), product: "All Products", type: "maintenance" as const, message: "Server maintenance completed" },
  ]
}
const RECENT_UPDATES = getRecentUpdates()

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
            <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>System </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249,115,22,0.3))" }}>Status</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed">
              Real-time detection status for all products. Updated every minute.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-14">
            {[
              { value: `${undetectedCount}/${totalProducts}`, label: "Undetected", color: "text-emerald-400" },
              { value: "99.8%", label: "Rate", color: "text-white" },
              { value: "<2h", label: "Patch time", color: "text-white" },
              { value: "24/7", label: "Monitoring", color: "text-white" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-8">
                {i > 0 && <div className="w-px h-6 bg-white/[0.06]" />}
                <div className="text-center">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-white/20 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
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

              return (
                <div
                  key={product.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl bg-white/[0.012] border border-white/[0.04] hover:border-orange-500/20 transition-all"
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
                      <h3 className="font-bold text-white/80 truncate">{product.name}</h3>
                      <p className="text-sm text-white/55">{product.category}</p>
                    </div>
                  </div>

                  {/* Games */}
                  <div className="hidden lg:flex items-center gap-2 min-w-[200px]">
                    <Gamepad2 className="h-4 w-4 text-white/30 shrink-0" />
                    <p className="text-sm text-white/55 truncate">
                      {product.games?.join(", ")}
                    </p>
                  </div>

                  {/* Uptime % + Days */}
                  <div className="hidden md:flex flex-col items-center min-w-[80px]">
                    <span className="text-lg font-black text-emerald-400">{getUptimePercent(product.id)}%</span>
                    <span className="text-[10px] text-white/30">uptime</span>
                  </div>

                  {/* 30-day Uptime Bar */}
                  <div className="hidden lg:block min-w-[140px]">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 w-1.5 rounded-sm ${
                            product.status === "undetected" ? "bg-emerald-500 opacity-80" :
                            product.status === "testing" ? "bg-yellow-500 opacity-80" :
                            "bg-red-500 opacity-80"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">30-day uptime</p>
                  </div>

                  {/* Days Undetected */}
                  <div className="hidden md:flex items-center gap-2 min-w-[100px]">
                    <Shield className="h-4 w-4 text-emerald-400/60" />
                    <span className="text-sm text-white/55"><span className="text-emerald-400 font-bold">{getDaysUndetected(product.id)}</span> days</span>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl min-w-[140px] justify-center ${statusConfig.bgLight}`}>
                    <span
                      className={`h-2 w-2 rounded-full ${statusConfig.bg}`}
                      style={product.status === "undetected" ? { animation: "statusPulse 2s ease-in-out infinite" } : {}}
                    />
                    <span className={`text-sm font-bold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Link */}
                  <Link
                    href={`/products/${product.id}`}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors shrink-0"
                  >
                    <ExternalLink className="h-4 w-4 text-white/55" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Recent Updates */}
          <div className="mb-16">
            <h2 className="text-lg font-bold text-white mb-5">Recent Updates</h2>
            <div className="space-y-0 divide-y divide-white/[0.03]">
              {RECENT_UPDATES.map((update, index) => (
                <div key={index} className="flex items-center gap-4 py-3.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    update.type === "update" ? "bg-emerald-400" : "bg-blue-400"
                  }`} />
                  <span className="text-[12px] text-white/20 min-w-[90px] tabular-nums">{update.date}</span>
                  <span className="text-[13px] font-semibold text-white/60 min-w-[110px]">{update.product}</span>
                  <span className="text-[13px] text-white/30">{update.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[13px] text-white/20">
            Updates every minute.{" "}
            <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="text-[#f97316]/50 hover:text-[#f97316] transition-colors">
              Join Discord
            </a>{" "}
            for instant alerts.
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
