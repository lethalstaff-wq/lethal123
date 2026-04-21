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
  Zap,
  Download,
  MessageCircle,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

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

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; bg: string }> = {
  pending: { label: "Pending Payment", color: "text-amber-500", icon: Clock, bg: "bg-amber-500/10" },
  processing: { label: "Processing", color: "text-blue-500", icon: Loader2, bg: "bg-blue-500/10" },
  completed: { label: "Completed", color: "text-emerald-500", icon: CheckCircle2, bg: "bg-emerald-500/10" },
  cancelled: { label: "Cancelled", color: "text-red-500", icon: XCircle, bg: "bg-red-500/10" },
  refunded: { label: "Refunded", color: "text-purple-500", icon: XCircle, bg: "bg-purple-500/10" },
}

const STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "processing", label: "Payment Verified" },
  { key: "completed", label: "Delivered" },
]

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<"order_id" | "email">("order_id")
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return

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

  const inputClass =
    "w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition-all focus:border-[#f97316]/30 focus:bg-white/[0.04]"

  // Order results view — with navbar
  if (orders && orders.length > 0) {
    return (
      <main className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <section className="flex-1 pt-28 pb-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/track" className="inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/50 transition-colors mb-8">
              <Search className="h-3.5 w-3.5" />
              New Search
            </Link>

            <div className="space-y-6">
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const StatusIcon = statusConfig.icon

                return (
                  <div key={order.id} className="rounded-2xl border border-white/[0.04] bg-white/[0.012] overflow-hidden">
                    <div className="p-6 border-b border-white/[0.03]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-white/40 uppercase tracking-wider">Order</span>
                            <span className="font-mono font-black text-lg text-white">{order.display_id}</span>
                          </div>
                          <p className="text-sm text-white/40">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg}`}>
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color} ${order.status === "processing" ? "animate-spin" : ""}`} />
                          <span className={`text-sm font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                        </div>
                      </div>
                    </div>

                    {order.status !== "cancelled" && order.status !== "refunded" && (
                      <div className="p-6 border-b border-white/[0.03] bg-white/[0.005]">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/[0.06]" />
                          <div className="absolute top-5 left-0 h-0.5 bg-[#f97316] transition-all duration-500" style={{
                            width: order.status === "completed" ? "100%" : order.status === "processing" ? "50%" : "0%"
                          }} />
                          {STEPS.map((step, index) => {
                            const stepStatus = getStepStatus(order, step.key)
                            return (
                              <div key={step.key} className="relative flex flex-col items-center z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                  stepStatus === "complete" ? "bg-emerald-500 border-emerald-500 text-white" :
                                  stepStatus === "current" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" :
                                  "bg-white/[0.03] border-white/[0.10] text-white/55"
                                }`}>
                                  {stepStatus === "complete" ? <CheckCircle2 className="h-5 w-5" /> :
                                   stepStatus === "current" ? <Loader2 className="h-5 w-5 animate-spin" /> :
                                   <span className="text-sm font-bold">{index + 1}</span>}
                                </div>
                                <span className={`text-xs font-bold mt-2 ${
                                  stepStatus === "complete" ? "text-emerald-400" :
                                  stepStatus === "current" ? "text-yellow-400" : "text-white/30"
                                }`}>{step.label}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="p-6 border-b border-white/[0.03]">
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm text-white/80">{item.name}</p>
                              <p className="text-xs text-white/30">{item.variant} x{item.quantity}</p>
                            </div>
                            <p className="font-semibold text-sm text-white/60">&pound;{(item.price / 100).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border-b border-white/[0.03] flex items-center justify-between text-sm">
                      <span className="text-white/30">Payment: <span className="text-white/60 capitalize">{order.payment_method}</span></span>
                      <span className="text-white/30">Total: <span className="font-bold text-white">&pound;{(order.total / 100).toFixed(2)}</span></span>
                    </div>

                    {order.status === "completed" && (
                      <div className="p-6 bg-emerald-500/5">
                        <div className="space-y-3">
                          {order.license_key && (
                            <div>
                              <div className="flex-1 p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
                                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">License Key (masked)</p>
                                <p className="font-mono text-sm font-bold text-white/80 break-all">{order.license_key}</p>
                              </div>
                              <p className="text-[11px] text-white/40 mt-2">
                                Full key was emailed to you and is available in the Download Center below or in your <Link href="/profile" className="text-[#f97316]/80 hover:text-[#f97316]">profile</Link>.
                              </p>
                            </div>
                          )}
                          <Link href={`/download/${order.display_id}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all">
                            <Download className="h-4 w-4" />
                            Go to Download Center
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-4 flex items-center justify-between text-[12px] text-white/45">
                      <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Secure</span>
                      <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="text-[#f97316]/50 hover:text-[#f97316] transition-colors">Need help?</a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  // No results
  if (orders && orders.length === 0) {
    return (
      <main className="flex h-screen bg-transparent items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Orders Found</h3>
          <p className="text-sm text-white/30 mb-6 max-w-sm">Check your order ID or email and try again.</p>
          <button onClick={() => setOrders(null)} className="text-[#f97316]/60 hover:text-[#f97316] text-sm transition-colors">Try again</button>
        </div>
      </main>
    )
  }

  // Main: fullscreen split — no navbar
  return (
    <main className="flex h-screen bg-transparent overflow-hidden relative">
      {/* Top minimal bar: back + online */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/45 hover:text-white/50 transition-colors text-[13px] group"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <Link href="/status" className="flex items-center gap-1.5 text-[12px] text-white/45 hover:text-white/40 transition-colors">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="hidden sm:inline">Online</span>
        </Link>
      </div>

      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 xl:p-16 relative overflow-hidden border-r border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/[0.03] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f97316]/[0.02] rounded-full blur-[120px]" />

        <Link href="/" className="relative inline-flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="Lethal Solutions" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-white font-bold text-lg">Lethal Solutions</span>
        </Link>

        <div className="relative">
          <p className="text-[13px] font-medium text-[#f97316]/60 tracking-wide uppercase mb-4">
            Order Tracking
          </p>
          <h1 className="font-display text-[44px] xl:text-[64px] font-bold leading-[0.95] tracking-[-0.04em]">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Track your</span>
            <br />
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>order.</span>
          </h1>
          <p className="mt-6 text-[15px] text-white/55 leading-relaxed max-w-[340px]">
            Enter your order ID or email to check status, view license keys, and access downloads.
          </p>
        </div>

        <div className="relative flex items-center gap-6 ml-4 xl:ml-8">
          {[
            { value: "Instant", label: "Delivery" },
            { value: "Secure", label: "Encrypted" },
            { value: "24/7", label: "Support" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              {i > 0 && <div className="w-px h-8 bg-white/[0.06]" />}
              <div>
                <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-white/55 mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="Lethal Solutions" width={32} height={32} className="h-8 w-8 object-contain" />
              <span className="text-white font-bold text-lg">Lethal Solutions</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">
              Find your <span className="bg-gradient-to-r from-[#f97316] to-[#ea580c] bg-clip-text text-transparent">order</span>
            </h2>
            <p className="mt-1.5 text-[13px] text-white/55">
              Search by order ID or email address.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <button
              onClick={() => setSearchType("order_id")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                searchType === "order_id" ? "bg-white/[0.08] text-white" : "text-white/55 hover:text-white/40"
              }`}
            >
              Order ID
            </button>
            <button
              onClick={() => setSearchType("email")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                searchType === "email" ? "bg-white/[0.08] text-white" : "text-white/55 hover:text-white/40"
              }`}
            >
              Email
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/35">
                {searchType === "order_id" ? "Order ID" : "Email Address"}
              </label>
              <input
                type={searchType === "email" ? "email" : "text"}
                placeholder={searchType === "order_id" ? "e.g. LS-ABC123XY" : "you@example.com"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !searchValue.trim()}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(249, 115, 22, 0.29)] transition-all hover:shadow-[0_8px_24px_rgba(249, 115, 22, 0.43)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  Track Order
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-white/45">
            Order ID was sent to your email after checkout.{" "}
            <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-white/40 transition-colors">
              Need help?
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
