"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  User,
  Package,
  Download,
  Key,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  Shield,
  Gift
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Order {
  id: string
  display_id: string
  status: string
  total: number
  created_at: string
  items: Array<{ name: string; variant: string }>
  license_key?: string
}

interface Profile {
  id: string
  email: string
  discord_username: string | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "text-amber-500", icon: Clock },
  processing: { color: "text-blue-500", icon: Loader2 },
  completed: { color: "text-emerald-500", icon: CheckCircle2 },
  cancelled: { color: "text-red-500", icon: XCircle },
  refunded: { color: "text-purple-500", icon: XCircle },
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<"orders" | "licenses" | "settings">("orders")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [discord, setDiscord] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setDiscord(profileData.discord_username || "")
      }

      // Get orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          id,
          order_display_id,
          status,
          total_pence,
          created_at,
          order_items (
            product_variant_id
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (ordersData) {
        // Get variant details
        const variantIds = ordersData.flatMap(o => o.order_items.map((i: { product_variant_id: string }) => i.product_variant_id))
        const { data: variants } = await supabase
          .from("product_variants")
          .select("id, name, product:products(name)")
          .in("id", variantIds)

        const variantMap = new Map(variants?.map(v => [v.id, v]) || [])

        // Get licenses
        const { data: licenses } = await supabase
          .from("licenses")
          .select("order_id, license_key")
          .in("order_id", ordersData.map(o => o.id))

        const licenseMap = new Map(licenses?.map(l => [l.order_id, l.license_key]) || [])

        setOrders(ordersData.map(o => ({
          id: o.id,
          display_id: o.order_display_id,
          status: o.status,
          total: o.total_pence,
          created_at: o.created_at,
          license_key: licenseMap.get(o.id),
          items: o.order_items.map((item: { product_variant_id: string }) => {
            const variant = variantMap.get(item.product_variant_id)
            return {
              name: (variant?.product as { name?: string })?.name || "Product",
              variant: variant?.name || "Standard"
            }
          })
        })))
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await supabase
      .from("profiles")
      .update({ discord_username: discord })
      .eq("id", profile.id)
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </main>
    )
  }

  if (!profile) return null

  const completedOrders = orders.filter(o => o.status === "completed")

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#f97316]/10 flex items-center justify-center">
                <User className="h-8 w-8 text-[#f97316]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{profile.email}</h1>
                <p className="text-sm text-white/40">Member since {formatDate(profile.created_at)}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.012]">
              <Package className="h-5 w-5 text-[#f97316] mb-2" />
              <p className="text-2xl font-black text-white">{orders.length}</p>
              <p className="text-xs text-white/40">Total Orders</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.012]">
              <Key className="h-5 w-5 text-emerald-500 mb-2" />
              <p className="text-2xl font-black text-white">{completedOrders.length}</p>
              <p className="text-xs text-white/40">Active Licenses</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.012]">
              <Gift className="h-5 w-5 text-purple-500 mb-2" />
              <p className="text-2xl font-black text-white">0</p>
              <p className="text-xs text-white/40">Referrals</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-6">
            {[
              { id: "orders", label: "Orders", icon: Package },
              { id: "licenses", label: "Licenses", icon: Key },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === tab.id
                      ? "bg-white/[0.06] text-white shadow-lg"
                      : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-white/[0.04] bg-white/[0.012]">
                  <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 mb-4">No orders yet</p>
                  <Link href="/products">
                    <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity">Browse Products</button>
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                  const StatusIcon = statusConfig.icon

                  return (
                    <div key={order.id} className="rounded-2xl border border-white/[0.04] bg-white/[0.012] overflow-hidden">
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-bold text-white">{order.display_id}</span>
                            <span className={cn("flex items-center gap-1 text-xs font-bold", statusConfig.color)}>
                              <StatusIcon className={cn("h-3 w-3", order.status === "processing" && "animate-spin")} />
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-white/40">
                            {order.items.map(i => `${i.name} (${i.variant})`).join(", ")}
                          </p>
                          <p className="text-xs text-white/30 mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">&pound;{(order.total / 100).toFixed(2)}</span>
                          {order.status === "completed" && (
                            <Link href="/downloads">
                              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Licenses Tab */}
          {activeTab === "licenses" && (
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-white/[0.04] bg-white/[0.012]">
                  <Key className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">No active licenses</p>
                </div>
              ) : (
                completedOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold text-white">{order.items[0]?.name}</p>
                        <p className="text-sm text-white/40">{order.items[0]?.variant}</p>
                      </div>
                      <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    </div>
                    {order.license_key && (
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 rounded-xl bg-white/[0.015] border border-white/[0.05] font-mono text-sm text-white break-all">
                          {order.license_key}
                        </code>
                        <button
                          onClick={() => copyKey(order.license_key!)}
                          className="shrink-0 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
                        >
                          {copiedKey === order.license_key ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6">
              <h2 className="font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#f97316]" />
                Account Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-xs text-white/50 font-bold uppercase mb-2 block">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                    <Mail className="h-5 w-5 text-white/40" />
                    <span className="text-white">{profile.email}</span>
                    <Shield className="h-4 w-4 text-emerald-500 ml-auto" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 font-bold uppercase mb-2 block">
                    Discord Username
                  </label>
                  <Input
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    placeholder="username#0000"
                    className="rounded-xl bg-white/[0.015] border border-white/[0.05] text-white placeholder:text-white/20"
                  />
                  <p className="text-xs text-white/40 mt-2">Used for support and notifications</p>
                </div>

                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>

              <hr className="my-8 border-white/[0.04]" />

              <div>
                <h3 className="font-bold text-white mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/downloads" className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                    <Download className="h-5 w-5 text-[#f97316]" />
                    <span className="font-medium text-white">Downloads</span>
                  </Link>
                  <Link href="/track" className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                    <Package className="h-5 w-5 text-[#f97316]" />
                    <span className="font-medium text-white">Track Order</span>
                  </Link>
                  <Link href="/referrals" className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                    <Gift className="h-5 w-5 text-purple-500" />
                    <span className="font-medium text-white">Referrals</span>
                  </Link>
                  <Link href="https://discord.gg/lethaldma" target="_blank" className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                    <ExternalLink className="h-5 w-5 text-[#5865F2]" />
                    <span className="font-medium text-white">Discord</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
