"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight,
  Mail,
  Hash,
  Shield,
  Zap,
  Download,
  MessageCircle,
  Copy,
  Check,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  const [copied, setCopied] = useState(false)

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Order Tracking</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your order ID or email to check the status of your purchase
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-xl">
              {/* Search Type Tabs */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-muted/30 mb-6">
                <button
                  onClick={() => setSearchType("order_id")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                    searchType === "order_id"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Hash className="h-4 w-4" />
                  Order ID
                </button>
                <button
                  onClick={() => setSearchType("email")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                    searchType === "email"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
              </div>

              {/* Search Input */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Input
                    type={searchType === "email" ? "email" : "text"}
                    placeholder={searchType === "order_id" ? "e.g. LS-ABC123XY" : "your@email.com"}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-14 pl-5 pr-14 rounded-2xl border-border/50 bg-background/60 text-base"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !searchValue.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-xl"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}
              </form>

              {/* Help text */}
              <p className="text-xs text-muted-foreground/60 text-center mt-4">
                Your order ID was sent to your email after checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Results */}
      {orders && orders.length > 0 && (
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl"
                  >
                    {/* Order Header */}
                    <div className="p-6 border-b border-border/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Order</span>
                            <span className="font-mono font-black text-lg text-foreground">{order.display_id}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                          statusConfig.bg
                        )}>
                          <StatusIcon className={cn("h-4 w-4", statusConfig.color, order.status === "processing" && "animate-spin")} />
                          <span className={cn("text-sm font-bold", statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    {order.status !== "cancelled" && order.status !== "refunded" && (
                      <div className="p-6 border-b border-border/30 bg-muted/5">
                        <div className="flex items-center justify-between relative">
                          {/* Progress Line */}
                          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/30" />
                          <div 
                            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                            style={{ 
                              width: order.status === "completed" ? "100%" : 
                                     order.status === "processing" ? "50%" : "0%" 
                            }}
                          />

                          {STEPS.map((step, index) => {
                            const stepStatus = getStepStatus(order, step.key)
                            return (
                              <div key={step.key} className="relative flex flex-col items-center z-10">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                  stepStatus === "complete" ? "bg-primary border-primary text-primary-foreground" :
                                  stepStatus === "current" ? "bg-primary/20 border-primary text-primary" :
                                  "bg-background border-border/50 text-muted-foreground/50"
                                )}>
                                  {stepStatus === "complete" ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : stepStatus === "current" ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                  )}
                                </div>
                                <span className={cn(
                                  "text-xs font-bold mt-2 text-center",
                                  stepStatus === "complete" || stepStatus === "current" ? "text-foreground" : "text-muted-foreground/50"
                                )}>
                                  {step.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="p-6 border-b border-border/30">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Items</h3>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.variant} x{item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-bold text-foreground">£{(item.price / 100).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="p-6 border-b border-border/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/10">
                          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">Payment</p>
                          <p className="font-bold text-foreground capitalize">{order.payment_method}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/10">
                          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">Total</p>
                          <p className="font-bold text-foreground">£{(order.total / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* License & Download (if completed) */}
                    {order.status === "completed" && (
                      <div className="p-6 bg-emerald-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-500">Order Complete!</p>
                            <p className="text-xs text-muted-foreground">Your license is ready</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.license_key && (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 p-4 rounded-xl bg-background/60 border border-border/50">
                                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">License Key</p>
                                <p className="font-mono font-bold text-foreground break-all">{order.license_key}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(order.license_key!)}
                                className="shrink-0 h-12 w-12"
                              >
                                {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                              </Button>
                            </div>
                          )}

                          <Link
                            href={`/download/${order.display_id}`}
                            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all group"
                          >
                            <Download className="h-5 w-5" />
                            Go to Download Center
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Help Footer */}
                    <div className="p-6 bg-muted/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>Secure Transaction</span>
                        </div>
                        <Link
                          href="https://discord.gg/lethaldma"
                          target="_blank"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Need help?
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {orders && orders.length === 0 && (
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Orders Found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any orders matching your search. Please check your order ID or email and try again.
              </p>
              <Link href="/products">
                <Button className="gap-2">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
