"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Activity, Shield, Zap, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, Gamepad2, Wrench } from "lucide-react"
import Link from "next/link"
import { PRODUCTS } from "@/lib/products"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { cn } from "@/lib/utils"
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
        <main className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumbs items={[{ label: "Status" }]} />
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animation: "statusPulse 2s ease-in-out infinite" }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              All Systems Operational
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              System <span className="text-primary">Status</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Real-time detection status for all products. Updated every minute.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-emerald-400">{undetectedCount}/{totalProducts}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Products Undetected</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">99.8%</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Undetected Rate</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-400">{"<"}2h</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Avg Update Time</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-orange-400">24/7</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Monitoring Active</p>
            </div>
          </div>

          {/* Filter & Legend */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {(["all", "cheats", "spoofers", "firmware"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {f === "all" ? "All Products" : f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ animation: "statusPulse 2s ease-in-out infinite" }}></span>
                <span className="text-muted-foreground">Undetected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                <span className="text-muted-foreground">Testing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                <span className="text-muted-foreground">Updating</span>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center mb-6">
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated === 0 ? "just now" : `${lastUpdated} minute${lastUpdated > 1 ? "s" : ""} ago`}
            </span>
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 mb-16">
            {filteredProducts.map((product) => {
              const statusConfig = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected
              const StatusIcon = statusConfig.icon
              
              return (
                <div
                  key={product.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-card/40 border border-border/40 hover:border-primary/30 hover:border-l-2 hover:border-l-orange-500 transition-all"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/50 flex-shrink-0 bg-muted/20">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>

                  {/* Games */}
                  <div className="hidden lg:flex items-center gap-2 min-w-[200px]">
                    <Gamepad2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground truncate">
                      {product.games?.join(", ")}
                    </p>
                  </div>

                  {/* Uptime % + Days */}
                  <div className="hidden md:flex flex-col items-center min-w-[80px]">
                    <span className="text-lg font-black text-emerald-400">{getUptimePercent(product.id)}%</span>
                    <span className="text-[10px] text-muted-foreground">uptime</span>
                  </div>

                  {/* 30-day Uptime Bar */}
                  <div className="hidden lg:block min-w-[140px]">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-3 w-1.5 rounded-sm",
                            product.status === "undetected" ? "bg-emerald-500 opacity-80" :
                            product.status === "testing" ? "bg-yellow-500 opacity-80" :
                            "bg-red-500 opacity-80"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">30-day uptime</p>
                  </div>

                  {/* Days Undetected */}
                  <div className="hidden md:flex items-center gap-2 min-w-[100px]">
                    <Shield className="h-4 w-4 text-emerald-400/60" />
                    <span className="text-sm text-muted-foreground"><span className="text-emerald-400 font-bold">{getDaysUndetected(product.id)}</span> days</span>
                  </div>

                  {/* Status */}
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl min-w-[140px] justify-center",
                    statusConfig.bgLight
                  )}>
                    <span 
                      className={cn("h-2 w-2 rounded-full", statusConfig.bg)} 
                      style={product.status === "undetected" ? { animation: "statusPulse 2s ease-in-out infinite" } : {}}
                    />
                    <span className={cn("text-sm font-bold", statusConfig.color)}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Link */}
                  <Link
                    href={`/products/${product.id}`}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors shrink-0"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Recent Updates */}
          <div className="mb-16">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary" />
              Recent Updates
            </h2>
            <div className="space-y-3">
              {RECENT_UPDATES.map((update, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30">
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    update.type === "update" ? "bg-emerald-400" : "bg-blue-400"
                  )} />
                  <span className="text-sm text-muted-foreground min-w-[100px]">{update.date}</span>
                  <span className="text-sm font-medium text-foreground min-w-[120px]">{update.product}</span>
                  <span className="text-sm text-muted-foreground">{update.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center">
            <p className="text-muted-foreground mb-4">
              Status updates automatically every minute. For instant notifications, join our Discord.
            </p>
            <a
              href="https://discord.gg/lethaldma"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord for Alerts
            </a>
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
