"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    const config = statusConfig[status] || { color: "text-muted-foreground", bg: "bg-muted", label: status }
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
        <div className="relative rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-orange-500/20 border border-primary/20 p-6 md:p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.1),transparent_70%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {username}</h1>
              <p className="text-muted-foreground">
                Member since {memberSince} <span className="mx-2">•</span>
                <span className={`${memberTier.color} font-medium`}>{memberTier.name} member</span>
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{activeLicenses.length}</div>
              <p className="text-xs text-muted-foreground">Active Licenses</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">£{totalSpent.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${memberTier.bg}`}>
                <span className={`text-lg font-bold ${memberTier.color}`}>{memberTier.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Member Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
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
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No orders yet</p>
                      <p className="text-sm mb-6">Your purchases will appear here once you make your first order.</p>
                      <Link href="/products">
                        <Button className="bg-primary hover:bg-primary/90">Browse Products</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border/50"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="font-medium truncate">{getOrderProductName(order)}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">{order.display_id || `LS-${order.id.slice(0, 8).toUpperCase()}`}</span>
                              <span>•</span>
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            <span className="font-bold text-lg">£{getOrderAmount(order)}</span>
                            <Link href={`/track?order_id=${order.display_id || order.id}`}>
                              <Button variant="outline" size="sm" className="gap-1">
                                Track <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Licenses Tab */}
            {activeTab === "licenses" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Active Licenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeLicenses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Key className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No active licenses</p>
                      <p className="text-sm">Purchase a product to receive your license key.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeLicenses.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 rounded-xl bg-muted/30 border border-border/50"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <p className="font-medium">{getOrderProductName(order)}</p>
                              <p className="text-xs text-muted-foreground">
                                Purchased {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                              Active
                            </span>
                          </div>
                          
                          {order.license_key ? (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/30">
                              <code className="flex-1 font-mono text-sm">
                                {showKeys[order.id] ? order.license_key : maskKey(order.license_key)}
                              </code>
                              <button
                                onClick={() => toggleKeyVisibility(order.id)}
                                className="p-1.5 rounded hover:bg-muted transition-colors"
                              >
                                {showKeys[order.id] ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(order.license_key!, order.id)}
                                className="p-1.5 rounded hover:bg-muted transition-colors"
                              >
                                {copiedKey === order.id ? (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">License key pending delivery</p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Link href={`/download/${order.display_id || order.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full gap-2">
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Access
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Referrals Tab */}
            {activeTab === "referrals" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    My Referral Link
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Earn 10% commission on every purchase made through your referral link.
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <code className="flex-1 font-mono text-sm text-primary">{referralLink}</code>
                    <button
                      onClick={() => copyToClipboard(`https://${referralLink}`, "referral")}
                      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      {copiedKey === "referral" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Earnings</span>
                      <span className="text-lg font-bold text-primary">£0.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Referrals</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user.email} disabled className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discord Username</label>
                    <Input placeholder="Enter your Discord username" className="bg-muted/30" />
                    <p className="text-xs text-muted-foreground">Link your Discord for faster support</p>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <Lock className="h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                  
                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-red-500/20">
                    <h4 className="text-sm font-medium text-red-500 mb-3">Danger Zone</h4>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                        Delete Account
                      </Button>
                      <Button variant="outline" size="sm">
                        Export My Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Member Since</label>
                  <p className="font-medium">{memberSince}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${memberTier.bg}`}>
                    <span className={`font-medium ${memberTier.color}`}>{memberTier.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full bg-transparent justify-start gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Browse Products
                  </Button>
                </Link>
                <Link href="/cart" className="block">
                  <Button variant="outline" className="w-full bg-transparent justify-start gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    View Cart
                  </Button>
                </Link>
                <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full bg-transparent justify-start gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Discord Support
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl bg-card border border-border shadow-xl">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            
            {passwordSuccess ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Check className="h-5 w-5" />
                Password changed successfully!
              </div>
            ) : (
              <>
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm mb-4">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Current Password</label>
                    <Input 
                      type="password" 
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">New Password</label>
                    <Input 
                      type="password"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input 
                      type="password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
