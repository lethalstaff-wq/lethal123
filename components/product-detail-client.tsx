"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import {
  ShoppingCart, Zap, Star, Shield, Minus, Plus, Check,
  CheckCircle2, MessageCircle, Lock, Clock, Globe, ThumbsUp, ArrowRight,
  ShieldCheck, Sparkles, Wrench, Flame
} from "lucide-react"
import { getProductReviewCount } from "@/lib/review-counts"
import { getProductMeta, type ChangelogEntry } from "@/lib/product-meta"
import { DiscordCheckoutModal } from "@/components/discord-checkout-modal"
import { BitcoinIcon, EthereumIcon, LitecoinIcon, PayPalIcon } from "@/components/crypto-icons"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function maskEmail(email: string) {
  if (!email) return "***@***.com"
  const [local, domain] = email.split("@")
  const masked = local.length <= 3 ? local[0] + "***" : local.substring(0, 3) + "***"
  return `${masked}@${domain}`
}

function formatChangelogDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const CHANGELOG_STYLES: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle2 }> = {
  feature:  { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Feature",  icon: Sparkles },
  update:   { bg: "bg-blue-500/10",    text: "text-blue-400",    label: "Update",   icon: Wrench },
  fix:      { bg: "bg-amber-500/10",   text: "text-amber-400",   label: "Fix",      icon: CheckCircle2 },
  security: { bg: "bg-purple-500/10",  text: "text-purple-400",  label: "Security", icon: Shield },
}

function ChangelogRow({ entry }: { entry: ChangelogEntry }) {
  const style = CHANGELOG_STYLES[entry.type] ?? CHANGELOG_STYLES.update
  const Icon = style.icon
  return (
    <div className="group flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-4 hover:border-[#f97316]/25 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-300">
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.08] ${style.bg}`}>
        <Icon className={`h-[18px] w-[18px] ${style.text}`} style={{ filter: `drop-shadow(0 0 6px currentColor)` }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-white/[0.08] ${style.bg} ${style.text}`}>{style.label}</span>
          <span className="text-[11px] text-white/55 font-medium">{formatChangelogDate(entry.date)}</span>
        </div>
        <p className="font-display text-[14px] font-bold text-white tracking-tight">{entry.title}</p>
        {entry.description && (
          <p className="text-[12.5px] text-white/65 leading-relaxed mt-1">{entry.description}</p>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return "recently"
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days === 1) return "1 day ago"
  if (days < 30) return `${days} days ago`
  if (days < 60) return "1 month ago"
  return `${Math.floor(days / 30)} months ago`
}


interface Variant {
  id: string
  name: string
  price: number
  sellAuthVariant?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  features?: string[]
  category: string
  image: string
  stock: number
  sellAuthProductId?: string
  variants: Variant[]
}

export function ProductDetailClient({ product }: { product: Product }) {
  const searchParams = useSearchParams()
  const variantParam = searchParams.get("variant")

  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (variantParam) {
      const found = product.variants.find(v => v.id === variantParam)
      if (found) return found
    }
    return product.variants[0]
  })
  const [quantity, setQuantity] = useState(1)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [viewingNow, setViewingNow] = useState(0)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const { addItem } = useCart()
  const router = useRouter()

  // Fetch product-specific reviews
  const { data: reviewData } = useSWR<{ reviews: Array<{ id: number; text: string; rating: number; username: string; email: string; helpful: number; team_response: string | null; created_at: string }>; totalCount: number }>(
    `/api/reviews?product=${product.id}`, fetcher
  )
  const productReviews = useMemo(() => {
    if (!reviewData?.reviews) return []
    return reviewData.reviews
      .filter(r => r.rating >= 4 && r.text && r.text.length > 20)
      .slice(0, 4)
  }, [reviewData])
  const reviewCount = reviewData?.totalCount || getProductReviewCount(product.slug)

  const [lastPurchased] = useState(() => {
    const seed = product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    return 2 + (seed % 25) + Math.floor(new Date().getMinutes() / 3)
  })

  useEffect(() => {
    const seed = product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    const gen = () => 3 + ((seed + Math.floor(Date.now() / 30000)) % 10)
    setViewingNow(gen())
    const interval = setInterval(() => setViewingNow(gen()), 30000)
    return () => clearInterval(interval)
  }, [product.id])

  useEffect(() => {
    const handleScroll = () => {
      const buyBtn = document.getElementById("buy-now-btn")
      if (buyBtn) {
        const rect = buyBtn.getBoundingClientRect()
        setShowStickyBar(rect.bottom < 0)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select an option first")
      return
    }
    toast.success(`${product.name} added to cart`)
    addItem(
      {
        id: selectedVariant.id,
        name: selectedVariant.name,
        price: selectedVariant.price,
        product_id: product.id,
        is_lifetime: selectedVariant.name.toLowerCase().includes("lifetime"),
        duration_days: null,
        created_at: "",
        sellAuthVariant: selectedVariant.sellAuthVariant,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          category: product.category,
          image_url: product.image,
          image: product.image,
          created_at: "",
          updated_at: "",
          sellAuthProductId: product.sellAuthProductId,
        },
      },
      quantity,
    )
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push("/checkout")
  }

  const total = selectedVariant.price * quantity
  const meta = getProductMeta(product.id)
  const effectiveStock = meta.weeklySlots ? Math.min(product.stock, meta.weeklySlots) : product.stock
  const isLowStock = effectiveStock <= 5
  const isMediumStock = effectiveStock > 5 && effectiveStock <= 10

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

        {/* ═══ LEFT: Image ═══ */}
        <div>
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-card/80 to-secondary/20 border border-white/[0.06] overflow-hidden group">
            <Badge className="absolute top-4 left-4 z-10 bg-emerald-500/15 text-emerald-400 border-emerald-500/20 backdrop-blur-sm">
              <Zap className="h-3 w-3 mr-1" />
              Instant Delivery
            </Badge>
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={500}
                priority
                className="object-contain max-h-[420px] w-auto group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Trust badges under image */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
            {[
              { icon: Shield, title: "Secure", desc: "256-bit encrypted" },
              { icon: Zap, title: "Instant", desc: "Delivered in seconds" },
              { icon: Globe, title: "Worldwide", desc: "73+ countries" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md p-3 sm:p-4 text-center hover:border-[#f97316]/30 hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all duration-300">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-white/65 group-hover:text-[#f97316] transition-colors" />
                <p className="font-display font-bold text-[12px] sm:text-[13px] text-white tracking-tight">{title}</p>
                <p className="text-[10px] sm:text-[11px] text-white/55 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ RIGHT: Info ═══ */}
        <div className="flex flex-col">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight lowercase mb-3 text-white">
            {(() => {
              const words = product.name.split(" ")
              if (words.length < 2) return product.name
              return <>{words.slice(0, -1).join(" ")}{" "}<span className="text-[#f97316]">{words[words.length - 1]}</span></>
            })()}
          </h1>

          {/* Description */}
          {product.longDescription && (
            <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-lg">
              {product.longDescription}
            </p>
          )}

          {/* Rating */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.5))" }} />
              <span className="font-display font-bold text-[13px] sm:text-sm text-amber-400 tabular-nums">5.0</span>
            </div>
            <span className="text-[12px] sm:text-[13px] text-white/65"><span className="text-white font-bold tabular-nums">{reviewCount}</span> Verified Reviews</span>
            <span className="hidden sm:inline text-white/30">·</span>
            <div className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[12px] sm:text-[13px] text-white/65"><span className="text-red-400 font-bold tabular-nums">{viewingNow}</span> viewing now</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6 sm:mb-8">
            <span className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">{"£"}{selectedVariant.price}</span>
          </div>

          {/* Variant Selection */}
          {product.variants.length > 1 && (
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/65 mb-3">Select Option</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedVariant.id === variant.id
                        ? "border-[#f97316] bg-[#f97316]/[0.06] shadow-lg shadow-primary/5"
                        : "border-white/[0.06] hover:border-[#f97316]/40 bg-white/[0.02]"
                    }`}
                  >
                    {selectedVariant.id === variant.id && (
                      <Check className="absolute top-3.5 right-3.5 h-4 w-4 text-[#f97316]" />
                    )}
                    <p className="font-semibold text-sm">{variant.name}</p>
                    <p className="text-white/55 text-sm mt-0.5">{"£"}{variant.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          <div className="flex items-center gap-5 mb-6">
            <div className="flex items-center border border-white/[0.10] rounded-xl overflow-hidden bg-white/[0.025] backdrop-blur-md">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-[#f97316]/10 hover:text-[#f97316] transition-colors text-white/65"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-display font-bold text-[15px] text-white tabular-nums">{quantity}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-[#f97316]/10 hover:text-[#f97316] transition-colors text-white/65"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLowStock ? "bg-red-400" : isMediumStock ? "bg-amber-400" : "bg-emerald-400"}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLowStock ? "bg-red-500" : isMediumStock ? "bg-amber-500" : "bg-emerald-500"}`} />
              </span>
              <span className={`font-medium ${isLowStock ? "text-red-400" : isMediumStock ? "text-amber-400" : "text-emerald-400"}`}>
                {isLowStock
                  ? `Only ${effectiveStock} left — selling fast`
                  : isMediumStock
                  ? `${effectiveStock} left this week`
                  : `${effectiveStock} in stock`}
              </span>
            </div>
          </div>
          {meta.weeklySlots && isLowStock && (
            <div className="flex items-center gap-2 -mt-3 mb-5 px-3 py-2 rounded-lg bg-red-500/[0.06] border border-red-500/15">
              <Flame className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="text-[12px] text-red-300/90">
                Weekly slot cap — {meta.weeklySlots} per week to keep detection risk low
              </span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-2.5 sm:space-y-3 mb-6">
            <Button
              id="buy-now-btn"
              onClick={handleBuyNow}
              size="lg"
              className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold gap-2 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] hover:brightness-110 hover:scale-[1.01] text-white border-0 shadow-[0_8px_24px_rgba(249,115,22,0.35),inset_0_1px_0_rgba(255,255,255,0.10)] transition-all"
            >
              <Zap className="h-4 w-4" />
              Buy Now — {"£"}{total.toFixed(2)}
            </Button>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="h-11 sm:h-12 text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 rounded-xl border-white/[0.10] bg-white/[0.025] backdrop-blur-md hover:border-[#f97316]/40 hover:bg-[#f97316]/[0.06] hover:text-[#f97316] transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                onClick={() => setShowDiscordModal(true)}
                variant="outline"
                size="lg"
                className="h-11 sm:h-12 text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 rounded-xl border-[#5865F2]/35 bg-[#5865F2]/[0.06] text-[#5865F2] hover:bg-[#5865F2]/15 hover:border-[#5865F2]/55 hover:text-white transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Discord Order
              </Button>
            </div>
          </div>

          {/* Last purchased */}
          <p className="text-center text-[11px] text-white/55 mt-3 flex items-center justify-center gap-1.5 font-medium">
            <span className="relative flex items-center justify-center">
              <span className="absolute w-2 h-2 rounded-full bg-emerald-400/40 animate-ping" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            Last purchased <span className="text-white font-bold tabular-nums">{lastPurchased}</span> minutes ago
          </p>

        </div>
      </div>

      {/* ═══ FEATURES — clean section, no heavy panel ═══ */}
      {product.features && product.features.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-[#f97316]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">What&apos;s included</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6 tracking-tight">
            Everything you get in the <span className="text-[#f97316]">box</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {product.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2.5 group">
                <Check className="h-4 w-4 text-[#f97316] shrink-0 group-hover:scale-110 transition-transform" style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.5))" }} />
                <span className="text-[14px] text-white/75 group-hover:text-white transition-colors">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Proof of Work — premium glass cards with corner glow + animated stat numbers ═══ */}
      <div className="mt-14 pt-10 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Undetected */}
          <div className="group relative rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.06] to-white/[0.02] backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_36px_rgba(16,185,129,0.18)] transition-all duration-300 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))" }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">{meta.undetectedSinceDays ? "Undetected" : "Proven Safe"}</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="font-display text-4xl font-black text-white tracking-tight">{meta.undetectedSinceDays || "100%"}</span>
                {meta.undetectedSinceDays && <span className="text-[13px] text-white/65 font-medium">days</span>}
              </div>
              <p className="text-[12px] text-white/65 leading-relaxed">{meta.undetectedSinceDays ? "Zero detections across EAC, BattlEye, Vanguard, FaceIt, Ricochet." : "Thousands of verified clean sessions."}</p>
            </div>
          </div>

          {/* Patch Response */}
          <div className="group relative rounded-2xl border border-[#f97316]/25 bg-gradient-to-br from-[#f97316]/[0.06] to-white/[0.02] backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_36px_rgba(249,115,22,0.18)] transition-all duration-300 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#f97316]/15 border border-[#f97316]/30 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.55))" }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f97316]">{meta.lastPatchResponseHours ? "Patch Response" : "Instant Delivery"}</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="font-display text-4xl font-black text-white tracking-tight">{meta.lastPatchResponseHours ? `<${meta.lastPatchResponseHours}h` : "<1m"}</span>
              </div>
              <p className="text-[12px] text-white/65 leading-relaxed">{meta.lastPatchResponseHours ? "Average downtime after a game patch. You're back online fast." : "License key arrives in seconds."}</p>
            </div>
          </div>

          {/* Support */}
          <div className="group relative rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/[0.06] to-white/[0.02] backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_36px_rgba(59,130,246,0.18)] transition-all duration-300 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-400" style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.5))" }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">Support</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="font-display text-4xl font-black text-white tracking-tight">24/7</span>
              </div>
              <p className="text-[12px] text-white/65 leading-relaxed">Dedicated Discord team for setup and troubleshooting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Recent Updates / Per-product Changelog ═══ */}
      {meta.changelog && meta.changelog.length > 0 && (
        <div className="mt-12 pt-10 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316]/25 to-[#ea580c]/15 border border-[#f97316]/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(249,115,22,0.18)]">
                <Sparkles className="h-[18px] w-[18px] text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.55))" }} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">Recent Updates</h2>
                <p className="text-[12px] text-white/65 mt-0.5">What shipped lately for {product.name}</p>
              </div>
            </div>
            <Link href="/changelog" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.10] text-[12px] text-white/65 font-bold hover:border-[#f97316]/35 hover:text-[#f97316] hover:bg-[#f97316]/[0.06] transition-all">
              Full changelog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {meta.changelog.slice(0, 5).map((entry, i) => (
              <ChangelogRow key={i} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ What Buyers Say — premium review cards ═══ */}
      {productReviews.length > 0 && (
        <div className="mt-12 pt-10 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/15 border border-amber-500/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(245,158,11,0.18)]">
                <Star className="h-[18px] w-[18px] text-amber-400 fill-amber-400" style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.55))" }} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">What Buyers Say</h2>
                <p className="text-[12px] text-white/65 mt-0.5"><span className="text-white font-bold tabular-nums">{reviewCount}</span> verified reviews</p>
              </div>
            </div>
            <Link href={`/reviews`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.10] text-[12px] text-white/65 font-bold hover:border-[#f97316]/35 hover:text-[#f97316] hover:bg-[#f97316]/[0.06] transition-all">
              See all reviews <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productReviews.map((review) => (
              <div key={review.id} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-5 hover:border-[#f97316]/25 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(249,115,22,0.08)] transition-all duration-300 relative overflow-hidden">
                {/* Big quote mark */}
                <div className="absolute top-2 right-4 text-[80px] font-serif leading-none select-none pointer-events-none text-[#f97316]/[0.06] group-hover:text-[#f97316]/[0.10] transition-colors">&ldquo;</div>

                {/* Stars + Verified */}
                <div className="flex items-center gap-2 mb-3 relative z-[1]">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "gold-star" : "fill-white/[0.10] text-white/[0.10]"}`} style={i < review.rating ? { animationDelay: `${i * 0.12}s` } : {}} />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 ml-auto">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                </div>

                {/* Text */}
                <p className="text-[14px] text-white/85 leading-[1.7] mb-3 relative z-[1]">{review.text}</p>

                {/* Team response */}
                {review.team_response && (
                  <div className="mb-3 rounded-xl bg-gradient-to-br from-[#f97316]/[0.08] to-white/[0.02] border border-[#f97316]/20 p-3 relative z-[1]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f97316] mb-1.5">Lethal Team Response</p>
                    <p className="text-[12px] text-white/75 leading-relaxed">{review.team_response}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] relative z-[1]">
                  <span className="text-[11px] text-white/55 font-mono">{maskEmail(review.email)}</span>
                  <div className="flex items-center gap-3">
                    {review.helpful > 0 && (
                      <span className="text-[10px] text-white/55 font-semibold flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-[#f97316]" /> {review.helpful}
                      </span>
                    )}
                    <span className="text-[10px] text-white/55 font-medium">{formatTimeAgo(review.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Add to Cart bar (mobile) */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-black/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <p className="text-sm font-bold">{product.name}</p>
              <p className="text-lg font-black text-[#f97316]">{"£"}{selectedVariant.price}</p>
            </div>
            <button onClick={handleBuyNow} className="px-6 py-3 rounded-xl bg-[#f97316] text-white font-bold text-sm">
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* Discord Checkout Modal */}
      <DiscordCheckoutModal
        isOpen={showDiscordModal}
        onClose={() => setShowDiscordModal(false)}
        productName={product.name}
        variantName={selectedVariant.name}
        price={selectedVariant.price * quantity}
      />
    </>
  )
}
