"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Package, Download, Key, Settings as SettingsIcon, Clock, CheckCircle2, XCircle,
  Copy, Check, Loader2, Crown, Gift, RefreshCw, ExternalLink, FileDown, Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LoyaltyCard } from "@/components/loyalty-card"
import { getLoyaltyStatus } from "@/lib/loyalty"
import { RenewalRemindersList } from "@/components/renewal-reminders-list"
import { ProfileSettings } from "@/components/profile-settings"

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
  display_name: string | null
  discord_username: string | null
  notify_order_updates: boolean
  notify_promotions: boolean
  notify_renewal_reminders: boolean
  notify_product_updates: boolean
  created_at: string
}

type TabId = "overview" | "orders" | "licenses" | "renewals" | "settings"

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  pending:    { color: "text-amber-400",   bg: "bg-amber-500/[0.1]",  icon: Clock,         label: "Pending" },
  processing: { color: "text-blue-400",    bg: "bg-blue-500/[0.1]",   icon: Loader2,       label: "Processing" },
  completed:  { color: "text-emerald-400", bg: "bg-emerald-500/[0.1]", icon: CheckCircle2, label: "Completed" },
  cancelled:  { color: "text-red-400",     bg: "bg-red-500/[0.1]",    icon: XCircle,       label: "Cancelled" },
  refunded:   { color: "text-purple-400",  bg: "bg-purple-500/[0.1]", icon: XCircle,       label: "Refunded" },
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email ?? user.email ?? "",
          display_name: profileData.display_name ?? null,
          discord_username: profileData.discord_username ?? null,
          notify_order_updates: profileData.notify_order_updates ?? true,
          notify_promotions: profileData.notify_promotions ?? true,
          notify_renewal_reminders: profileData.notify_renewal_reminders ?? true,
          notify_product_updates: profileData.notify_product_updates ?? false,
          created_at: profileData.created_at,
        })
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select(`id, order_display_id, status, total_pence, created_at, order_items ( product_variant_id )`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (ordersData) {
        const variantIds = ordersData.flatMap((o: { order_items: Array<{ product_variant_id: string }> }) =>
          o.order_items.map((i) => i.product_variant_id)
        )

        const { data: variants } = await supabase
          .from("product_variants")
          .select("id, name, product:products(name)")
          .in("id", variantIds)

        const variantMap = new Map(variants?.map((v: { id: string }) => [v.id, v]) || [])

        const { data: licenses } = await supabase
          .from("licenses")
          .select("order_id, license_key")
          .in("order_id", ordersData.map((o: { id: string }) => o.id))

        const licenseMap = new Map(licenses?.map((l: { order_id: string; license_key: string }) => [l.order_id, l.license_key]) || [])

        setOrders(
          ordersData.map((o: {
            id: string
            order_display_id: string
            status: string
            total_pence: number
            created_at: string
            order_items: Array<{ product_variant_id: string }>
          }) => ({
            id: o.id,
            display_id: o.order_display_id,
            status: o.status,
            total: o.total_pence,
            created_at: o.created_at,
            license_key: licenseMap.get(o.id),
            items: o.order_items.map((item) => {
              const variant = variantMap.get(item.product_variant_id) as { name?: string; product?: { name?: string } } | undefined
              return {
                name: variant?.product?.name || "Product",
                variant: variant?.name || "Standard",
              }
            }),
          }))
        )
      }

      setLoading(false)
    }
    load()
  }, [])

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </main>
    )
  }
  if (!profile) return null

  const completedOrders = orders.filter((o) => o.status === "completed")
  const totalSpentPence = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const loyalty = getLoyaltyStatus(totalSpentPence)
  const displayName = profile.display_name?.trim() || ""
  const initials = (displayName || profile.email).slice(0, 2).toUpperCase()

  const tabs: Array<{ id: TabId; label: string; icon: typeof Package; badge?: number }> = [
    { id: "overview", label: "Overview", icon: Crown },
    { id: "orders", label: "Orders", icon: Package, badge: orders.length },
    { id: "licenses", label: "Licenses", icon: Key, badge: completedOrders.length },
    { id: "renewals", label: "Renewals", icon: RefreshCw },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ]

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      <section className="pt-28 md:pt-32 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          {/* ═══ Hero ═══ */}
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border border-white/[0.10] mb-6 bg-gradient-to-br shadow-[0_24px_60px_rgba(0,0,0,0.4)]",
              loyalty.current.gradient
            )}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)" }} />
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div
                  className={cn(
                    "w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center font-display text-3xl md:text-4xl font-black text-white shrink-0",
                    "bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_8px_24px_rgba(249,115,22,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
                  )}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                      <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{displayName ? displayName : "My Profile"}</span>
                    </h1>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] border border-white/[0.15] bg-black/45 backdrop-blur-md",
                        loyalty.current.accent
                      )}
                    >
                      <Crown className="h-3 w-3" /> {loyalty.current.label}
                    </span>
                  </div>
                  <p className="text-[14px] text-white/75 truncate font-medium">{profile.email}</p>
                  <p className="text-[12px] text-white/55 mt-1">Member since {formatDate(profile.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white text-[13px] font-bold transition-all hover:scale-[1.03] hover:brightness-110 shadow-[0_4px_14px_rgba(249,115,22,0.32),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    Shop products
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <MiniStat icon={Package} value={orders.length} label="Total orders" />
                <MiniStat icon={Key} value={completedOrders.length} label="Active licenses" valueTone="text-emerald-400" />
                <MiniStat
                  icon={Gift}
                  value={`£${(totalSpentPence / 100).toFixed(0)}`}
                  label="Lifetime spend"
                />
                <MiniStat
                  icon={Crown}
                  value={`${loyalty.current.discountPercent}%`}
                  label={loyalty.next ? `To ${loyalty.next.label}: £${(loyalty.spentToNextPence / 100).toFixed(0)}` : "Max tier"}
                  valueTone={loyalty.current.accent}
                />
              </div>
            </div>
          </div>

          {/* ═══ Tabs ═══ */}
          <div className="flex gap-1 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md mb-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all shrink-0",
                    active
                      ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
                      : "text-white/55 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {typeof tab.badge === "number" && tab.badge > 0 && (
                    <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums", active ? "bg-black/25 text-white" : "bg-white/[0.10] text-white/85")}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ═══ Tab content ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <LoyaltyCard totalSpentPence={totalSpentPence} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickLink href="/track" icon={Package} label="Track an order" description="Live status of any order" />
                <QuickLink href="/referrals" icon={Gift} label="Refer friends" description="Earn credit for each sign-up" accent="text-purple-400" />
                <QuickLink href="https://discord.gg/lethaldma" icon={ExternalLink} label="Discord support" description="Get instant help from our team" external accent="text-[#5865F2]" />
                <QuickLink href="/guides" icon={Shield} label="Setup guides" description="Step-by-step DMA & spoofer setup" />
              </div>
              {orders.length > 0 && (
                <section className="rounded-2xl border border-white/[0.06] bg-white/[0.012] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Latest order</h3>
                    <button onClick={() => setActiveTab("orders")} className="text-xs text-[#f97316] hover:text-[#f97316]/80 transition-colors">
                      View all →
                    </button>
                  </div>
                  <OrderRow order={orders[0]} onDownload={() => setActiveTab("licenses")} />
                </section>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No orders yet"
                  description="Browse our DMA, cheats, and bundles to place your first order."
                  ctaLabel="Browse Products"
                  ctaHref="/products"
                />
              ) : (
                orders.map((order) => <OrderRow key={order.id} order={order} onDownload={() => setActiveTab("licenses")} />)
              )}
            </div>
          )}

          {activeTab === "licenses" && (
            <div className="space-y-3">
              {completedOrders.length === 0 ? (
                <EmptyState
                  icon={Key}
                  title="No active licenses"
                  description="Your license keys will appear here once your order is fulfilled."
                  ctaLabel="Browse Products"
                  ctaHref="/products"
                />
              ) : (
                completedOrders.map((order) => (
                  <LicenseCard
                    key={order.id}
                    order={order}
                    copiedKey={copiedKey}
                    onCopy={copyKey}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "renewals" && (
            <div>
              <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.012] p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <RefreshCw className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Renewal reminders</p>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      We'll email you 3 days before a time-limited license expires with a one-click renewal link. No auto-billing — you stay in control.
                    </p>
                  </div>
                </div>
              </div>
              <RenewalRemindersList />
            </div>
          )}

          {activeTab === "settings" && <ProfileSettings profile={profile} onLogout={handleLogout} />}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function MiniStat({
  icon: Icon,
  value,
  label,
  valueTone = "text-white",
}: {
  icon: typeof Package
  value: string | number
  label: string
  valueTone?: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-white/55 mb-1.5" />
      <p className={cn("text-xl md:text-2xl font-black", valueTone)}>{value}</p>
      <p className="text-[10.5px] text-white/55 truncate">{label}</p>
    </div>
  )
}

function QuickLink({
  href,
  icon: Icon,
  label,
  description,
  external,
  accent = "text-[#f97316]",
}: {
  href: string
  icon: typeof Package
  label: string
  description: string
  external?: boolean
  accent?: string
}) {
  const content = (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.012] hover:bg-white/[0.025] hover:border-white/[0.12] transition-all group">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.04]", accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-white/55 mt-0.5 truncate">{description}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-white/45 group-hover:text-white/55 transition-colors" />
    </div>
  )
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    <Link href={href}>{content}</Link>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: typeof Package
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.012]">
      <Icon className="h-12 w-12 text-white/45 mx-auto mb-4" />
      <p className="text-white/70 font-semibold mb-1">{title}</p>
      <p className="text-xs text-white/55 mb-5 max-w-sm mx-auto leading-relaxed">{description}</p>
      <Link href={ctaHref}>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          {ctaLabel}
        </button>
      </Link>
    </div>
  )
}

function OrderRow({ order, onDownload }: { order: Order; onDownload: () => void }) {
  const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.012] p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-mono font-bold text-white text-sm">{order.display_id}</span>
            <span className={cn("inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", statusConfig.color, statusConfig.bg)}>
              <StatusIcon className={cn("h-2.5 w-2.5", order.status === "processing" && "animate-spin")} />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-white/60 truncate">
            {order.items.map((i) => `${i.name} (${i.variant})`).join(", ")}
          </p>
          <p className="text-[11px] text-white/35 mt-1">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-white whitespace-nowrap">&pound;{(order.total / 100).toFixed(2)}</span>
          {order.status === "completed" ? (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download
            </button>
          ) : order.status === "pending" ? (
            <Link
              href={`/track?q=${order.display_id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors"
            >
              <Clock className="h-3.5 w-3.5" />
              Track
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function LicenseCard({
  order,
  copiedKey,
  onCopy,
}: {
  order: Order
  copiedKey: string | null
  onCopy: (k: string) => void
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
      <div className="flex flex-col md:flex-row md:items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10.5px] font-bold text-white/55">{order.display_id}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-[10.5px] font-bold text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5" /> Active
            </span>
          </div>
          <p className="font-bold text-white text-base">{order.items[0]?.name}</p>
          <p className="text-sm text-white/50">{order.items[0]?.variant}</p>
        </div>
        <Link
          href={`/download/${order.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-sm font-bold text-emerald-400 transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Open downloads
        </Link>
      </div>
      {order.license_key && (
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-sm text-white break-all">
            {order.license_key}
          </code>
          <button
            onClick={() => onCopy(order.license_key!)}
            className="shrink-0 p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Copy license key"
          >
            {copiedKey === order.license_key ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
