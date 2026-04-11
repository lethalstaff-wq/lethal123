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
  CheckCircle2, MessageCircle, Lock, Clock, Globe, ThumbsUp, ArrowRight
} from "lucide-react"
import { getProductReviewCount } from "@/lib/review-counts"
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

        {/* ═══ LEFT: Image ═══ */}
        <div>
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-card/80 to-secondary/20 border border-white/[0.06]/40 overflow-hidden group">
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
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-white/40" />
              <p className="font-semibold text-sm">Secure</p>
              <p className="text-xs text-white/40">Encrypted</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-white/40" />
              <p className="font-semibold text-sm">Instant</p>
              <p className="text-xs text-white/40">Delivery</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-white/40" />
              <p className="font-semibold text-sm">Global</p>
              <p className="text-xs text-white/40">Support</p>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Info ═══ */}
        <div className="flex flex-col">

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight lowercase mb-3 text-white">
            {(() => {
              const words = product.name.split(" ")
              if (words.length < 2) return product.name
              return <>{words.slice(0, -1).join(" ")}{" "}<span className="text-[#f97316]">{words[words.length - 1]}</span></>
            })()}
          </h1>

          {/* Description */}
          {product.longDescription && (
            <p className="text-white/40 text-sm leading-relaxed mb-5 max-w-lg">
              {product.longDescription}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm text-yellow-400">5.0</span>
            </div>
            <span className="text-sm text-white/40">{reviewCount} Verified Reviews</span>
            <span className="text-white/40/30">·</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-sm text-white/40">{viewingNow} viewing now</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-black">{"£"}{selectedVariant.price}</span>
          </div>

          {/* Variant Selection */}
          {product.variants.length > 1 && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Select Option</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedVariant.id === variant.id
                        ? "border-primary bg-primary/[0.06] shadow-lg shadow-primary/5"
                        : "border-white/[0.06]/50 hover:border-primary/40 bg-white/[0.02]/30"
                    }`}
                  >
                    {selectedVariant.id === variant.id && (
                      <Check className="absolute top-3.5 right-3.5 h-4 w-4 text-primary" />
                    )}
                    <p className="font-semibold text-sm">{variant.name}</p>
                    <p className="text-white/40 text-sm mt-0.5">{"£"}{variant.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          <div className="flex items-center gap-5 mb-6">
            <div className="flex items-center border border-white/[0.06]/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-white/[0.04] transition-colors text-white/40 hover:text-white"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-bold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-white/[0.04] transition-colors text-white/40 hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-medium">{product.stock} in stock</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              id="buy-now-btn"
              onClick={handleBuyNow}
              size="lg"
              className="w-full h-14 text-base font-bold gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Zap className="h-4 w-4" />
              Buy Now — {"£"}{total.toFixed(2)}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="h-12 font-semibold gap-2 rounded-xl border-white/[0.06]/50 hover:border-primary/40 hover:bg-primary/5"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                onClick={() => setShowDiscordModal(true)}
                variant="outline"
                size="lg"
                className="h-12 font-semibold gap-2 rounded-xl border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50"
              >
                <MessageCircle className="h-4 w-4" />
                Discord Order
              </Button>
            </div>
          </div>

          {/* Last purchased */}
          <p className="text-center text-[11px] text-white/25 mt-3 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            Last purchased {lastPurchased} minutes ago
          </p>

        </div>
      </div>

      {/* ═══ FEATURES — Full width below ═══ */}
      {product.features && product.features.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-bold text-white mb-5">What&apos;s Included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
            {product.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <Check className="h-3.5 w-3.5 text-[#f97316]/60 shrink-0" />
                <span className="text-[14px] text-white/50">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Trust Section ═══ */}
      <div className="mt-14 pt-10 border-t border-white/[0.04]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Undetected", desc: "Zero detections. Updated within 2h of every patch." },
            { icon: Zap, title: "Instant Delivery", desc: "License key arrives in seconds. No waiting." },
            { icon: Clock, title: "24/7 Support", desc: "Dedicated Discord team for setup and troubleshooting." },
          ].map((item, i) => (
            <div key={i}>
              <item.icon className="h-4 w-4 text-[#f97316]/50 mb-2.5" />
              <h3 className="font-semibold text-sm text-white/80 mb-1">{item.title}</h3>
              <p className="text-[13px] text-white/25 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ What Buyers Say ═══ */}
      {productReviews.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">What Buyers Say</h2>
                <p className="text-xs text-white/40">{reviewCount} verified reviews</p>
              </div>
            </div>
            <Link href={`/reviews`} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              See all reviews <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {productReviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/[0.06]/30 bg-white/[0.02]/30 p-5 hover:border-white/[0.06]/50 transition-colors">
                {/* Stars */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-medium text-emerald-500">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                  </span>
                </div>

                {/* Text */}
                <p className="text-sm text-white/85 leading-relaxed mb-3">{review.text}</p>

                {/* Team response */}
                {review.team_response && (
                  <div className="mb-3 rounded-lg bg-primary/[0.04] border border-primary/10 p-3">
                    <p className="text-[11px] font-semibold text-primary mb-1">Lethal Team</p>
                    <p className="text-xs text-white/60 leading-relaxed">{review.team_response}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]/20">
                  <span className="text-xs text-white/40 font-mono">{maskEmail(review.email)}</span>
                  <div className="flex items-center gap-3">
                    {review.helpful > 0 && (
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {review.helpful}
                      </span>
                    )}
                    <span className="text-[10px] text-white/40">{formatTimeAgo(review.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Add to Cart bar (mobile) */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-black/95 backdrop-blur-xl border-t border-white/[0.06]/30 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <p className="text-sm font-bold">{product.name}</p>
              <p className="text-lg font-black text-primary">{"£"}{selectedVariant.price}</p>
            </div>
            <button onClick={handleBuyNow} className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm">
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
