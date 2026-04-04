"use client"

import { useState, useTransition } from "react"
import { updateOrderStatus, deleteOrder } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search, Clock, CheckCircle2, XCircle, Trash2, Loader2,
  AlertCircle, ChevronDown, ChevronUp, ShoppingCart, CreditCard
} from "lucide-react"
import { useRouter } from "next/navigation"

type OrderItem = {
  id: string
  quantity: number
  price_pence: number
  product_variants: {
    name: string
    price_in_pence: number
    products: { name: string }
  }
}

type Order = {
  id: string
  user_id: string | null
  user_email: string | null
  order_display_id: string | null
  total_pence: number
  status: string
  payment_method: string | null
  discord_username: string | null
  coupon_code: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

function formatDate(ts: string) {
  if (!ts) return "-"
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function statusIcon(status: string) {
  switch (status) {
    case "pending": return <Clock className="h-4 w-4 text-amber-500" />
    case "confirmed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />
    default: return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[status] || "bg-muted text-muted-foreground border-border"}`}>
      {statusIcon(status)}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)
  const router = useRouter()

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchesSearch = !search ||
      (o.user_email || "").toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.order_display_id || "").toLowerCase().includes(q) ||
      (o.discord_username || "").toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = orders.filter(o => o.status === "pending").length
  const confirmedCount = orders.filter(o => o.status === "confirmed").length
  const cancelledCount = orders.filter(o => o.status === "cancelled").length

  function handleStatus(id: string, status: string) {
    setActionId(id)
    startTransition(async () => {
      await updateOrderStatus(id, status)
      setActionId(null)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this order permanently?")) return
    setActionId(id)
    startTransition(async () => {
      await deleteOrder(id)
      setActionId(null)
      router.refresh()
    })
  }

  const statusFilters = [
    { value: "all", label: "All", count: orders.length },
    { value: "pending", label: "Pending", count: pendingCount },
    { value: "confirmed", label: "Confirmed", count: confirmedCount },
    { value: "cancelled", label: "Cancelled", count: cancelledCount },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders, {pendingCount} awaiting action</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="pl-9 bg-card h-8 text-xs" />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search || statusFilter !== "all" ? "No orders match your filters" : "No orders yet"}</p>
          </div>
        ) : filtered.map((order) => {
          const isExpanded = expandedId === order.id
          const isLoading = isPending && actionId === order.id

          return (
            <div key={order.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Order Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {statusIcon(order.status)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{order.user_email || "Guest"}</p>
                      {order.discord_username && (
                        <span className="text-xs text-muted-foreground">({order.discord_username})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-primary font-mono font-bold">{order.order_display_id || `#${order.id.slice(0, 8)}`}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    {order.payment_method}
                  </div>
                  {statusBadge(order.status)}
                  <p className="text-sm font-bold text-foreground tabular-nums min-w-[60px] text-right">{"\u00A3"}{(order.total_pence / 100).toFixed(2)}</p>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border">
                  {/* Order Items */}
                  <div className="p-4 bg-muted/10">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Order Items</p>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{item.product_variants?.products?.name}</span>
                            <span className="text-xs text-muted-foreground">({item.product_variants?.name})</span>
                            {item.quantity > 1 && <span className="text-xs text-muted-foreground">x{item.quantity}</span>}
                          </div>
                          <span className="text-sm font-medium text-foreground">{"\u00A3"}{(item.price_pence / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">User ID:</span>
                        <p className="text-foreground font-mono mt-0.5">{order.user_id ? `${order.user_id.slice(0, 16)}...` : "Guest"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment:</span>
                        <p className="text-foreground mt-0.5">{order.payment_method}</p>
                      </div>
                      {order.coupon_code && (
                        <div>
                          <span className="text-muted-foreground">Coupon:</span>
                          <p className="text-foreground font-mono mt-0.5">{order.coupon_code}</p>
                        </div>
                      )}
                      {order.discord_username && (
                        <div>
                          <span className="text-muted-foreground">Discord:</span>
                          <p className="text-foreground mt-0.5">{order.discord_username}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex items-center gap-2 border-t border-border bg-muted/5">
                    {order.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleStatus(order.id, "confirmed") }}
                          disabled={isLoading}
                          className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                          Confirm Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleStatus(order.id, "cancelled") }}
                          disabled={isLoading}
                          className="h-8 gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          Cancel Order
                        </Button>
                      </>
                    )}
                    {order.status === "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleStatus(order.id, "pending") }}
                        disabled={isLoading}
                        className="h-8 gap-1.5"
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                        Reopen as Pending
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleStatus(order.id, "pending") }}
                        disabled={isLoading}
                        className="h-8 gap-1.5"
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                        Revert to Pending
                      </Button>
                    )}
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDelete(order.id) }}
                      disabled={isLoading}
                      className="h-8 gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
