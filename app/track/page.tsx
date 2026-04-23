"use client"

import { useState } from "react"
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Shield,
  Download,
  Copy,
  Check,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Magnetic } from "@/components/magnetic-button"
import { GlossyButton } from "@/components/ui/glossy-button"

type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded"

interface OrderItem {
  name: string
  variant: string
  quantity: number
  price: number
}

interface Order {
  id: string
  display_id: string
  status: OrderStatus
  created_at: string
  updated_at: string
  email: string
  discord: string | null
  payment_method: string
  total: number
  items: OrderItem[]
  license_key?: string
  download_url?: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; bg: string; ring: string }> = {
  pending: { label: "Awaiting Payment", color: "text-amber-400", icon: Clock, bg: "bg-amber-500/10", ring: "ring-amber-500/30" },
  processing: { label: "Processing", color: "text-sky-400", icon: Loader2, bg: "bg-sky-500/10", ring: "ring-sky-500/30" },
  completed: { label: "Delivered", color: "text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-400", icon: XCircle, bg: "bg-red-500/10", ring: "ring-red-500/30" },
  refunded: { label: "Refunded", color: "text-purple-400", icon: XCircle, bg: "bg-purple-500/10", ring: "ring-purple-500/30" },
}

const STEPS = [
  { key: "pending", label: "Order Placed", sub: "We received it" },
  { key: "processing", label: "Payment Verified", sub: "Building your setup" },
  { key: "completed", label: "Delivered", sub: "License issued" },
]

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        })
      }}
      data-cursor="cta"
      data-cursor-label={copied ? "Got it" : "Copy"}
      className="cursor-cta group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-white/70 hover:bg-[#f97316]/10 hover:border-[#f97316]/30 hover:text-[#f97316] transition-all press-spring"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      <span className={copied ? "text-emerald-400" : ""}>{copied ? "Copied" : "Copy"}</span>
    </button>
  )
}

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<"order_id" | "email">("order_id")
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [shakeKey, setShakeKey] = useState(0)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) {
      setShakeKey((k) => k + 1)
      return
    }

    setLoading(true)
    setError(null)
    setOrders(null)

    try {
      const params = new URLSearchParams()
      if (searchType === "order_id") {
        params.set("order_id", searchValue.trim())
      } else {
        params.set("email", searchValue.trim())
      }

      const res = await fetch(`/api/orders/track?${params}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Order not found")
      }

      setOrders(data.orders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find order")
      setShakeKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (order: Order, stepKey: string) => {
    const statusOrder = ["pending", "processing", "completed"]
    const currentIndex = statusOrder.indexOf(order.status)
    const stepIndex = statusOrder.indexOf(stepKey)

    if (order.status === "cancelled" || order.status === "refunded") {
      return stepIndex === 0 ? "complete" : "cancelled"
    }

    if (stepIndex < currentIndex) return "complete"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Results view
  if (orders && orders.length > 0) {
    return (
      <main className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <section className="flex-1 pt-28 pb-24 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/track" data-cursor="cta" data-cursor-label="Back" className="cursor-cta press-spring group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-[12.5px] font-semibold text-white/70 hover:text-[#f97316] hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.06] transition-all mb-10">
              <ArrowRight className="h-3.5 w-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              New search
            </Link>

            <div className="space-y-6">
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const StatusIcon = statusConfig.icon
                const progressPct = order.status === "completed" ? 100 : order.status === "processing" ? 50 : 0

                return (
                  <div key={order.id} className="spotlight-card relative rounded-2xl border border-white/[0.06] bg-white/[0.018] overflow-hidden backdrop-blur-sm shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                    {/* Top gradient line */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent z-[3]" />

                    {/* Header */}
                    <div className="relative p-6 sm:p-7 border-b border-white/[0.05] z-[3]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 mb-2">
                            <span className="text-[10px] text-white/45 uppercase tracking-[0.2em] font-semibold">Order</span>
                            <span className="font-mono font-black text-xl text-white tracking-tight">{order.display_id}</span>
                            <CopyButton value={order.display_id} />
                          </div>
                          <p className="text-[13px] text-white/50">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ring-1 ${statusConfig.ring}`}>
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color} ${order.status === "processing" ? "animate-spin" : ""}`} />
                          <span className={`text-[13px] font-bold ${statusConfig.color} tracking-tight`}>{statusConfig.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {order.status !== "cancelled" && order.status !== "refunded" && (
                      <div className="relative p-6 sm:p-8 border-b border-white/[0.05] bg-white/[0.006] z-[3]">
                        <div className="relative">
                          <div className="absolute top-5 left-[22px] right-[22px] h-[2px] bg-white/[0.06] rounded-full" />
                          <div
                            className="absolute top-5 left-[22px] h-[2px] bg-gradient-to-r from-[#f97316] via-[#fbbf24] to-[#f97316] rounded-full overflow-hidden"
                            style={{ width: `calc((100% - 44px) * ${progressPct / 100})`, transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)" }}
                          >
                            {order.status === "processing" && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: "trackShimmer 1.8s ease-in-out infinite" }} />
                            )}
                          </div>

                          <div className="flex items-start justify-between relative z-[2]">
                            {STEPS.map((step, index) => {
                              const stepStatus = getStepStatus(order, step.key)
                              const isComplete = stepStatus === "complete"
                              const isCurrent = stepStatus === "current"
                              return (
                                <div key={step.key} className="flex flex-col items-center text-center max-w-[120px]">
                                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                    isComplete ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]" :
                                    isCurrent ? "bg-[#f97316]/15 border-[#f97316] text-[#f97316] shadow-[0_0_24px_rgba(249,115,22,0.4)]" :
                                    "bg-white/[0.03] border-white/[0.10] text-white/50"
                                  }`}>
                                    {isCurrent && (
                                      <span className="absolute inset-[-6px] rounded-full border border-[#f97316]/40" style={{ animation: "trackPulse 2s ease-in-out infinite" }} />
                                    )}
                                    {isComplete ? (
                                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                        <path className="svg-check-path" d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : isCurrent ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <span className="text-sm font-bold">{index + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-[12px] font-bold mt-2.5 tracking-tight ${
                                    isComplete ? "text-emerald-400" :
                                    isCurrent ? "text-[#f97316]" : "text-white/35"
                                  }`}>{step.label}</span>
                                  <span className="text-[10px] text-white/30 mt-0.5">{step.sub}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="relative p-6 sm:p-7 border-b border-white/[0.05] z-[3]">
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold mb-4">Items</p>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.018] border border-white/[0.04] hover:border-[#f97316]/20 hover:bg-white/[0.028] transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-[#f97316]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[14px] text-white/85 truncate">{item.name}</p>
                                <p className="text-[11px] text-white/40">{item.variant} × {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-bold text-[14px] text-white/75 tabular-nums shrink-0">£{(item.price / 100).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="relative p-6 sm:p-7 border-b border-white/[0.05] z-[3] flex items-center justify-between">
                      <span className="text-[12px] text-white/45">Payment: <span className="text-white/75 capitalize font-medium">{order.payment_method}</span></span>
                      <span className="text-[12px] text-white/45">Total: <span className="font-bold text-white text-[15px] tabular-nums">£{(order.total / 100).toFixed(2)}</span></span>
                    </div>

                    {/* License + download — Completed */}
                    {order.status === "completed" && (
                      <div className="relative p-6 sm:p-7 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-transparent z-[3]">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                          <p className="text-[10px] text-emerald-400/90 uppercase tracking-[0.2em] font-bold">Your Delivery</p>
                        </div>
                        <div className="space-y-3">
                          {order.license_key && (
                            <div>
                              <div className="flex-1 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-emerald-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[10px] text-emerald-400/80 uppercase tracking-[0.2em] font-bold">License Key (masked)</p>
                                  <CopyButton value={order.license_key} />
                                </div>
                                <p className="font-mono text-[13px] font-bold text-emerald-200/90 break-all tracking-widest">{order.license_key}</p>
                              </div>
                              <p className="text-[11px] text-white/40 mt-2">
                                Full key was emailed to you, and is available in the Download Center or in your <Link href="/profile" className="text-[#f97316]/80 hover:text-[#f97316] underline underline-offset-2">profile</Link>.
                              </p>
                            </div>
                          )}
                          <Magnetic strength={0.12}>
                            <Link
                              href={`/download/${order.display_id}`}
                              data-cursor="cta"
                              data-cursor-label="Download"
                              className="cursor-cta press-spring flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:brightness-110 text-white font-bold text-[14px] shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all"
                            >
                              <Download className="h-4 w-4" />
                              Go to Download Center
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Magnetic>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="relative px-6 py-4 flex items-center justify-between text-[12px] text-white/45 z-[3] bg-white/[0.008]">
                      <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Encrypted & Secure</span>
                      <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" data-cursor="cta" data-cursor-label="Discord" className="cursor-cta text-[#f97316]/60 hover:text-[#f97316] transition-colors font-semibold">Need help? →</a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
        <Footer />

        <style jsx global>{`
          @keyframes trackShimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
          @keyframes trackPulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.12); opacity: 1; }
          }
        `}</style>
      </main>
    )
  }

  // No results
  if (orders && orders.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md relative">
          <div className="relative inline-flex mb-6">
            <Package className="h-16 w-16 text-white/15" style={{ animation: "noOrderBob 3s ease-in-out infinite" }} />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500/80 border-2 border-black animate-pulse" />
          </div>
          <h3 className="font-display text-3xl font-bold text-white mb-3 tracking-tight">No orders found</h3>
          <p className="text-[14px] text-white/50 mb-8">Double-check your order ID or email. If you just paid, it can take up to 60 seconds to appear.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setOrders(null)} data-cursor="cta" data-cursor-label="Again" className="cursor-cta press-spring px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[13px] font-bold text-white/70 hover:bg-[#f97316]/10 hover:border-[#f97316]/35 hover:text-[#f97316] transition-all">
              Try again
            </button>
            <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" data-cursor="cta" data-cursor-label="Discord" className="cursor-cta press-spring px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-[13px] font-bold text-white shadow-[0_0_24px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] transition-all">
              Ask on Discord
            </a>
          </div>

          <style jsx>{`
            @keyframes noOrderBob {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(2deg); }
            }
          `}</style>
          </div>
        </div>
      </main>
    )
  }

  // Main form — premium split
  return (
    <main className="flex min-h-screen lg:h-screen flex-col lg:flex-row bg-transparent lg:overflow-hidden relative">
      {/* Top minimal bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          data-cursor="cta"
          data-cursor-label="Back"
          className="cursor-cta press-spring group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-[12.5px] font-semibold text-white/70 hover:text-[#f97316] hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.06] transition-all"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </Link>

        <Link href="/status" data-cursor="cta" data-cursor-label="Status" className="cursor-cta flex items-center gap-1.5 text-[12px] text-white/55 hover:text-white transition-colors">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="hidden sm:inline">All systems online</span>
        </Link>
      </div>

      {/* Left — branding (desktop column, mobile stacked hero) */}
      <div className="flex flex-col justify-between lg:w-[45%] pt-24 pb-10 px-6 lg:p-12 xl:p-16 relative overflow-hidden lg:border-r border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/[0.045] via-transparent to-transparent pointer-events-none" />
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-[#f97316]/[0.03] rounded-full blur-[140px]" style={{ animation: "trackOrb 18s ease-in-out infinite" }} />
        <div className="hidden lg:block absolute top-[18%] right-[5%] w-[300px] h-[300px] bg-amber-400/[0.04] rounded-full blur-[120px]" style={{ animation: "trackOrb 14s ease-in-out infinite reverse" }} />

        <Link href="/" data-cursor="cta" data-cursor-label="Home" className="cursor-cta relative inline-flex items-center gap-2.5 self-start">
          <Image src="/images/logo.png" alt="Lethal Solutions" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-white font-bold text-lg tracking-tight">Lethal Solutions</span>
        </Link>

        <div className="relative mt-10 lg:mt-0">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
            <p className="text-[11px] font-bold text-[#f97316]/85 tracking-[0.25em] uppercase">Order Tracking</p>
          </div>
          <h1 className="font-display text-[40px] sm:text-[52px] lg:text-[44px] xl:text-[72px] font-bold leading-[0.92] tracking-[-0.045em]">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Track your</span>
            <br />
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.46))" }}>order.</span>
          </h1>
          <p className="mt-6 lg:mt-7 text-[14px] lg:text-[15px] text-white/55 leading-relaxed max-w-[400px]">
            Enter your order ID or email to check status, view license keys, and access your downloads in seconds.
          </p>
        </div>

        {/* Stats + timeline preview + ticker (desktop only) */}
        <div className="hidden lg:flex relative flex-col gap-8 mt-10">
          <div className="flex items-center gap-6">
            {[
              { value: "Instant", label: "Delivery" },
              { value: "256-bit", label: "Encryption" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6">
                {i > 0 && <div className="w-px h-10 bg-white/[0.08]" />}
                <div>
                  <p className="text-2xl font-display font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-[0.18em] font-bold">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline preview — greyed until searched */}
          <div className="relative rounded-2xl border border-white/[0.05] bg-white/[0.015] p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Journey preview</p>
            <div className="flex items-center justify-between gap-2">
              {[
                { key: "ordered", label: "Ordered" },
                { key: "paid", label: "Paid" },
                { key: "license", label: "License" },
                { key: "active", label: "Active" },
              ].map((step, i) => (
                <div key={step.key} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-7 h-7 rounded-full border border-white/[0.1] bg-white/[0.02] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/25" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-white/35 tracking-tight">{step.label}</span>
                  </div>
                  {i < 3 && <div className="flex-1 h-px bg-white/[0.06] -mt-5" />}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/35 leading-relaxed">
              Each step lights up as we look up your order.
            </p>
          </div>

          {/* Live ticker */}
          <div className="relative rounded-xl border border-white/[0.05] bg-white/[0.012] px-4 py-2.5 overflow-hidden">
            <div className="flex items-center gap-3 text-[11.5px] leading-tight">
              <span className="shrink-0 inline-flex items-center gap-1.5 font-bold text-emerald-400/90 tracking-[0.15em] uppercase text-[10px]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Live
              </span>
              <div className="relative h-5 flex-1 overflow-hidden">
                <div className="absolute inset-0" style={{ animation: "trackTicker 15s cubic-bezier(0.22,1,0.36,1) infinite" }}>
                  <div className="h-5 flex items-center text-white/60"><span className="font-mono text-[#f97316]/80 mr-2">01</span>Perm Spoofer delivered to UK <span className="text-white/30 ml-2">· 12s ago</span></div>
                  <div className="h-5 flex items-center text-white/60"><span className="font-mono text-[#f97316]/80 mr-2">02</span>License activated for DE customer <span className="text-white/30 ml-2">· 34s ago</span></div>
                  <div className="h-5 flex items-center text-white/60"><span className="font-mono text-[#f97316]/80 mr-2">03</span>Custom firmware dispatched to US <span className="text-white/30 ml-2">· 58s ago</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:p-12 relative">
        <div className="w-full max-w-[440px] relative">
          <div className="mb-7">
            <h2 className="font-display text-[28px] sm:text-3xl font-bold text-white tracking-tight">
              Find your <span style={{ background: "linear-gradient(135deg, #fbbf24, #f97316, #ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>order</span>
            </h2>
            <p className="mt-2 text-[13px] text-white/55 leading-relaxed">Search by order ID or email address to see live status.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            {[
              { key: "order_id", label: "Order ID" },
              { key: "email", label: "Email" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSearchType(tab.key as "order_id" | "email")}
                data-cursor="cta"
                data-cursor-label={tab.label}
                className={`cursor-cta flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                  searchType === tab.key
                    ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249,115,22,0.5)]"
                    : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div key={shakeKey} className={shakeKey > 0 ? "animate-shake" : ""}>
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] mb-2 block">
                {searchType === "order_id" ? "Order ID" : "Email Address"}
              </label>
              <div className="relative group">
                <input
                  type={searchType === "email" ? "email" : "text"}
                  placeholder={searchType === "order_id" ? "e.g. LS-ABC123XY" : "you@example.com"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="focus-ring-premium w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none transition-all focus:bg-white/[0.05]"
                  autoComplete="off"
                />
                <Search className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 group-focus-within:text-[#f97316] transition-colors" />
              </div>
            </div>

            {error && (
              <div key={`err-${shakeKey}`} className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-3 text-[13px] text-red-300 flex items-start gap-2 animate-shake">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Magnetic strength={0.1} className="block w-full">
                <GlossyButton
                  type="submit"
                  shape="block"
                  size="xl"
                  full
                  disabled={loading || !searchValue.trim()}
                  data-cursor="cta"
                  data-cursor-label={loading ? "Search" : "Track"}
                  className="cursor-cta press-spring"
                  rightIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover/glossy:translate-x-0.5" />}
                >
                  {loading ? "Tracking…" : "Track Order"}
                </GlossyButton>
              </Magnetic>

              {/* Secondary helper — "Need the order ID?" */}
              <p className="text-center text-[12px] text-white/55 leading-relaxed">
                Need the order ID?{" "}
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <ArrowRight className="h-3 w-3 text-[#f97316]/70" />
                  Check your email
                </span>
                <span className="mx-1.5 text-white/25">/</span>
                <a
                  href="https://discord.gg/lethaldma"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="cta"
                  data-cursor-label="Discord"
                  className="cursor-cta text-[#f97316]/80 hover:text-[#f97316] underline underline-offset-2 transition-colors font-semibold"
                >
                  Ask on Discord
                </a>
              </p>
            </div>
          </form>
        </div>

        <style jsx global>{`
          @keyframes trackOrb {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-45%, -55%) scale(1.08); }
          }
          @keyframes trackTicker {
            0%, 28% { transform: translateY(0); }
            33%, 61% { transform: translateY(-20px); }
            66%, 94% { transform: translateY(-40px); }
            100% { transform: translateY(-60px); }
          }
        `}</style>
      </div>
    </main>
  )
}
