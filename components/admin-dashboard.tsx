"use client"

import { Package, Star, Users, ShoppingCart, Clock, CheckCircle2, XCircle, AlertCircle, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Mail, Shield } from "lucide-react"
import { useState } from "react"
import { SectionEyebrow } from "@/components/section-eyebrow"

type Stats = {
  totalProducts: number
  totalVariants: number
  totalReviews: number
  totalUsers: number
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  cancelledOrders: number
}

function formatTime(ts: string) {
  if (!ts) return "unknown"
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function statusBadge(status: string) {
  switch (status) {
    case "pending": return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-xs font-medium text-amber-500"><Clock className="h-3 w-3" />Pending</span>
    case "confirmed": 
    case "paid":
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-500"><CheckCircle2 className="h-3 w-3" />Confirmed</span>
    case "cancelled": return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-xs font-medium text-red-500"><XCircle className="h-3 w-3" />Cancelled</span>
    default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-xs font-medium text-white/55">{status}</span>
  }
}

export function AdminDashboardClient({ stats, recentOrders, recentUsers }: {
  stats: Stats
  recentOrders: Array<{ id: string; user_email: string | null; order_display_id: string | null; total_pence: number; status: string; payment_method: string | null; created_at: string }>
  recentUsers: Array<{ id: string; email: string; is_admin: boolean; created_at: string }>
}) {
  const [refreshing, setRefreshing] = useState(false)
  
  // Calculate revenue
  const totalRevenue = recentOrders.reduce((sum, o) => {
    if (o.status === "confirmed" || o.status === "paid") {
      return sum + o.total_pence
    }
    return sum
  }, 0)
  
  // Simulated growth (in real app, compare with previous period)
  const growthPercent = stats.totalOrders > 0 ? 12.5 : 0
  const conversionRate = stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : "0"

  const statCards = [
    { label: "Revenue", value: `£${(totalRevenue / 100).toLocaleString()}`, sub: "from confirmed orders", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+12.5%", trendUp: true },
    { label: "Orders", value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+8.2%", trendUp: true },
    { label: "Users", value: stats.totalUsers, sub: `${conversionRate}% conversion`, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+5.1%", trendUp: true },
    { label: "Reviews", value: stats.totalReviews, sub: "customer feedback", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", trend: "+15.3%", trendUp: true },
  ]

  const handleRefresh = () => {
    setRefreshing(true)
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-3">
            <SectionEyebrow number="01" label="Admin" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight mt-1" style={{ paddingBottom: "0.06em" }}>Dashboard</h1>
          <p className="text-sm text-white/55 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a href="/admin/orders?filter=pending" className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-amber-500">{stats.pendingOrders}</p>
            <p className="text-xs text-amber-500/70">Pending Orders</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-amber-500/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
        
        <a href="/admin/products" className="flex items-center gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors group">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-blue-500">{stats.totalProducts}</p>
            <p className="text-xs text-blue-500/70">Products</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-blue-500/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
        
        <a href="/admin/reviews" className="flex items-center gap-3 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors group">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Star className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-purple-500">{stats.totalReviews}</p>
            <p className="text-xs text-purple-500/70">Reviews</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-purple-500/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
        
        <a href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-500">{stats.totalUsers}</p>
            <p className="text-xs text-emerald-500/70">Users</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-emerald-500/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
        
        <a href="/admin/emails" className="flex items-center gap-3 p-4 rounded-xl border border-[#f97316]/20 bg-[#f97316]/[0.05] hover:bg-[#f97316]/10 transition-colors group">
          <div className="p-2 rounded-lg bg-[#f97316]/10">
            <Mail className="h-5 w-5 text-[#f97316]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#f97316]">5</p>
            <p className="text-xs text-[#f97316]/70">Email Templates</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[#f97316]/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
        
        <a href="/admin/status" className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-500">Live</p>
            <p className="text-xs text-emerald-500/70">Status Hub</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-emerald-500/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Stat Cards with Trends */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 hover:border-[#f97316]/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/55 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-white/55">{card.sub}</p>
              {card.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${card.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                  {card.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {card.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025]">
          <div className="p-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-white/55" />
              <h2 className="font-semibold text-white text-sm">Live Activity</h2>
            </div>
          </div>
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {recentOrders.length === 0 && recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-8 w-8 text-white/40 mx-auto mb-3" />
                <p className="text-sm text-white/55">No recent activity</p>
              </div>
            ) : (
              <>
                {recentOrders.slice(0, 5).map((order, idx) => (
                  <div key={order.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[#f97316] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{order.user_email?.split('@')[0] || 'Guest'}</span>
                        {' '}placed an order
                      </p>
                      <p className="text-xs text-white/55 mt-0.5">
                        {order.order_display_id && <span className="text-[#f97316] font-mono">{order.order_display_id}</span>}
                        {' '}{"\u00A3"}{(order.total_pence / 100).toFixed(2)} - {formatTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {recentUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{user.email.split('@')[0]}</span>
                        {' '}registered
                      </p>
                      <p className="text-xs text-white/55 mt-0.5">{formatTime(user.created_at)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Recent Orders - Larger */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.025]">
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-white/55" />
              <h2 className="font-semibold text-white text-sm">Recent Orders</h2>
            </div>
            <a href="/admin/orders" className="text-xs text-[#f97316] hover:underline">View all</a>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <AlertCircle className="h-8 w-8 text-white/40 mx-auto mb-3" />
              <p className="text-sm text-white/55">No orders yet</p>
              <p className="text-xs text-white/40 mt-1">Orders will appear here when customers check out</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {order.order_display_id && (
                        <span className="text-[#f97316] font-mono font-bold text-sm">{order.order_display_id}</span>
                      )}
                      {statusBadge(order.status)}
                    </div>
                    <p className="text-sm text-white/55 mt-1">
                      {order.user_email || "Guest"} -- {order.payment_method || "unknown"} -- {formatTime(order.created_at)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-white tabular-nums shrink-0">{"\u00A3"}{(order.total_pence / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025]">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-white/55" />
            <h2 className="font-semibold text-white text-sm">Recent Registrations</h2>
          </div>
          <a href="/admin/users" className="text-xs text-[#f97316] hover:underline">View all</a>
        </div>
        {recentUsers.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="h-8 w-8 text-white/40 mx-auto mb-3" />
            <p className="text-sm text-white/55">No registered users yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-4 rounded-lg border border-white/[0.08] hover:border-[#f97316]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#f97316]">{user.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    <p className="text-xs text-white/55 mt-0.5">{formatTime(user.created_at)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {user.is_admin ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f97316]/10 text-xs font-medium text-[#f97316]">Admin</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.04] text-xs font-medium text-white/55">User</span>
                  )}
                  <span className="text-xs text-white/55 font-mono">{user.id.slice(0, 8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
