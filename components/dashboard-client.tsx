"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Package, ShoppingBag, User, Key, ExternalLink, Copy, Download,
  Eye, EyeOff, Lock, Gift, Settings, ChevronRight, Check, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import { createClient } from "@/lib/supabase/client"

type OrderItem = {
  product_variant_id: string
  price_pence: number
  quantity: number
  variant?: { name: string } | null
}

type Order = {
  id: string
  display_id?: string
  order_display_id?: string
  product_name?: string
  status: string
  created_at: string
  total?: number
  total_pence?: number
  license_key?: string
  items?: OrderItem[]
}

type Props = {
  user: { id: string; email: string; created_at: string }
  orders: Order[]
  totalSpent: number
  activeLicenses: Order[]
  memberTier: { name: string; color: string; bg: string }
  username: string
  memberSince: string
}

type TabType = "orders" | "licenses" | "referrals" | "settings"

export function DashboardClient({ user, orders, totalSpent, activeLicenses, memberTier, username, memberSince }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("orders")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskKey = (key: string) => {
    if (!key) return "LS-XXXX-****-****"
    const parts = key.split("-")
    if (parts.length >= 3) {
      return `${parts[0]}-${parts[1]}-****-****`
    }
    return key.slice(0, 8) + "****"
  }

  const getOrderProductName = (order: Order) => {
    if (order.items && order.items.length > 0) {
      // Get name from nested variant object
      const firstItem = order.items[0]
      if (firstItem.variant?.name) {
        return firstItem.variant.name
      }
      // Fallback to product_variant_id if no variant name
      return firstItem.product_variant_id || "Product"
    }
    return order.product_name || order.order_display_id || order.display_id || "Order"
  }

  const getOrderAmount = (order: Order) => {
    if (order.total_pence) return (order.total_pence / 100).toFixed(2)
    if (order.total) return order.total.toFixed(2)
    return "0.00"
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
      pending: { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Pending" },
      processing: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Processing" },
      completed: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Completed" },
      confirmed: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Confirmed" },
      paid: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Paid" },
      approved: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Approved" },
      cancelled: { color: "text-red-500", bg: "bg-red-500/10", label: "Cancelled" },
    }
    const config = statusConfig[status] || { color: "text-white/40", bg: "bg-white/[0.04]", label: status }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess(false)

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("Passwords do not match")
      return
    }
    if (passwordForm.new.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setPasswordForm({ current: "", new: "", confirm: "" })
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2000)
    }
    setIsChangingPassword(false)
  }

  const referralLink = `lethalsolutions.me/r/${user.id.slice(0, 8)}`

  const tabs: { id: TabType; label: string; icon: typeof ShoppingBag }[] = [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "licenses", label: "Licenses", icon: Key },
    { id: "referrals", label: "Referrals", icon: Gift },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#f97316]/20 via-[#f97316]/10 to-[#ea580c]/20 border border-[#f97316]/20 p-6 md:p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.1),transparent_70%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#f97316]/20 border-2 border-[#f97316] flex items-center justify-center text-2xl font-bold text-[#f97316]">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Welcome back, {username}</h1>
              <p className="text-white/40">
                Member since {memberSince} <span className="mx-2">&bull;</span>
                <span className={`${memberTier.color} font-medium`}>{memberTier.name} member</span>
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-4 text-center">
            <div className="text-2xl font-bold text-[#f97316]">{orders.length}</div>
            <p className="text-xs text-white/40">Total Orders</p>
          </div>
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{activeLicenses.length}</div>
            <p className="text-xs text-white/40">Active Licenses</p>
          </div>
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">&pound;{totalSpent.toFixed(0)}</div>
            <p className="text-xs text-white/40">Total Spent</p>
          </div>
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-4 text-center">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${memberTier.bg}`}>
              <span className={`text-lg font-bold ${memberTier.color}`}>{memberTier.name}</span>
            </div>
            <p className="text-xs text-white/40 mt-1">Member Status</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white/[0.06] text-white"
                  : "text-white/40 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012]">
                <div className="p-6 border-b border-white/[0.04]">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-[#f97316]" />
                    Recent Orders
                  </h2>
                </div>
                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-white/20" />
                      <p className="text-lg font-medium mb-2 text-white">No orders yet</p>
                      <p className="text-sm mb-6 text-white/40">Your purchases will appear here once you make your first order.</p>
                      <Link href="/products">
                        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity">Browse Products</button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="font-medium truncate text-white">{getOrderProductName(order)}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
                              <span className="font-mono">{order.display_id || `LS-${order.id.slice(0, 8).toUpperCase()}`}</span>
                              <span>&bull;</span>
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            <span className="font-bold text-lg text-white">&pound;{getOrderAmount(order)}</span>
                            <Link href={`/track?order_id=${order.display_id || order.id}`}>
                              <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm">
                                Track <ChevronRight className="h-3 w-3" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Licenses Tab */}
            {activeTab === "licenses" && (
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012]">
                <div className="p-6 border-b border-white/[0.04]">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-[#f97316]" />
                    Active Licenses
                  </h2>
                </div>
                <div className="p-6">
                  {activeLicenses.length === 0 ? (
                    <div className="text-center py-12">
                      <Key className="h-16 w-16 mx-auto mb-4 text-white/20" />
                      <p className="text-lg font-medium mb-2 text-white">No active licenses</p>
                      <p className="text-sm text-white/40">Purchase a product to receive your license key.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeLicenses.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <p className="font-medium text-white">{getOrderProductName(order)}</p>
                              <p className="text-xs text-white/40">
                                Purchased {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                              Active
                            </span>
                          </div>

                          {order.license_key ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                              <code className="flex-1 font-mono text-sm text-white">
                                {showKeys[order.id] ? order.license_key : maskKey(order.license_key)}
                              </code>
                              <button
                                onClick={() => toggleKeyVisibility(order.id)}
                                className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                              >
                                {showKeys[order.id] ? (
                                  <EyeOff className="h-4 w-4 text-white/40" />
                                ) : (
                                  <Eye className="h-4 w-4 text-white/40" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(order.license_key!, order.id)}
                                className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                              >
                                {copiedKey === order.id ? (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-white/40" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-white/40 italic">License key pending delivery</p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Link href={`/download/${order.display_id || order.id}`} className="flex-1">
                              <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm">
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </Link>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm">
                              <ExternalLink className="h-4 w-4" />
                              Access
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === "referrals" && (
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012]">
                <div className="p-6 border-b border-white/[0.04]">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Gift className="h-5 w-5 text-[#f97316]" />
                    My Referral Link
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-white/40 mb-4">
                    Earn 10% commission on every purchase made through your referral link.
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <code className="flex-1 font-mono text-sm text-[#f97316]">{referralLink}</code>
                    <button
                      onClick={() => copyToClipboard(`https://${referralLink}`, "referral")}
                      className="p-2 rounded-lg bg-[#f97316]/10 hover:bg-[#f97316]/20 transition-colors"
                    >
                      {copiedKey === "referral" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#f97316]" />
                      )}
                    </button>
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-[#f97316]/5 border border-[#f97316]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/40">Total Earnings</span>
                      <span className="text-lg font-bold text-[#f97316]">&pound;0.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/40">Referrals</span>
                      <span className="font-medium text-white">0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012]">
                <div className="p-6 border-b border-white/[0.04]">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#f97316]" />
                    Account Settings
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/50">Email</label>
                    <Input value={user.email} disabled className="bg-white/[0.015] border border-white/[0.05] text-white rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/50">Discord Username</label>
                    <Input placeholder="Enter your Discord username" className="bg-white/[0.015] border border-white/[0.05] text-white rounded-xl placeholder:text-white/20" />
                    <p className="text-xs text-white/40">Link your Discord for faster support</p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.04]">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium"
                    >
                      <Lock className="h-4 w-4" />
                      Change Password
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-red-500/20">
                    <h4 className="text-sm font-medium text-red-500 mb-3">Danger Zone</h4>
                    <div className="flex gap-3">
                      <button className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all text-sm font-medium">
                        Delete Account
                      </button>
                      <button className="px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium">
                        Export My Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012]">
              <div className="p-6 border-b border-white/[0.04]">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-[#f97316]" />
                  Account
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/50">Email</label>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/50">Member Since</label>
                  <p className="font-medium text-white">{memberSince}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/50">Status</label>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${memberTier.bg}`}>
                    <span className={`font-medium ${memberTier.color}`}>{memberTier.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012]">
              <div className="p-6 border-b border-white/[0.04]">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#f97316]" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-2">
                <Link href="/products" className="block">
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium justify-start">
                    <ShoppingBag className="h-4 w-4" />
                    Browse Products
                  </button>
                </Link>
                <Link href="/cart" className="block">
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium justify-start">
                    <ShoppingBag className="h-4 w-4" />
                    View Cart
                  </button>
                </Link>
                <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="block">
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium justify-start">
                    <ExternalLink className="h-4 w-4" />
                    Discord Support
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl bg-black border border-white/[0.06] shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-white">Change Password</h3>

            {passwordSuccess ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Check className="h-5 w-5" />
                Password changed successfully!
              </div>
            ) : (
              <>
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm mb-4">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/50">Current Password</label>
                    <Input
                      type="password"
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                      className="mt-1 bg-white/[0.015] border border-white/[0.05] text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/50">New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                      className="mt-1 bg-white/[0.015] border border-white/[0.05] text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/50">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                      className="mt-1 bg-white/[0.015] border border-white/[0.05] text-white rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
