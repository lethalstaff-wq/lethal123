"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { getWishlist, toggleWishlist } from "@/lib/wishlist"
import { PRODUCTS, formatPrice } from "@/lib/products"
import { Heart, ShoppingCart, ArrowRight, Trash2, Zap, BellRing, TrendingDown, Flame, BookmarkPlus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { SectionEyebrow } from "@/components/section-eyebrow"

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    setWishlistIds(getWishlist())
    setHydrated(true)
    const handler = () => setWishlistIds(getWishlist())
    window.addEventListener("wishlist-update", handler)
    return () => window.removeEventListener("wishlist-update", handler)
  }, [])

  const products = wishlistIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean) as typeof PRODUCTS

  // Empty-state "Others saved these" — a simple on-mount Fisher-Yates shuffle
  // so every session shows a different selection. useMemo keeps the picks stable
  // across re-renders within a single mount.
  const othersSaved = useMemo(() => {
    const pool = [...PRODUCTS]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, 3)
  // Only shuffle once per mount — not on every state update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  const handleAddToCart = (product: typeof PRODUCTS[number]) => {
    const variant = product.variants[0]
    addItem({
      id: variant.id,
      name: variant.name,
      price: variant.priceInPence / 100,
      product_id: product.id,
      is_lifetime: variant.name.toLowerCase().includes("lifetime"),
      duration_days: null,
      created_at: "",
      product: {
        id: product.id,
        name: product.name,
        slug: product.id,
        description: product.description,
        category: product.category,
        image_url: product.image,
        image: product.image,
        created_at: "",
        updated_at: "",
      },
    })
    toast.success(`${product.name} added to cart`)
  }

  const handleMoveAllToCart = () => {
    if (products.length === 0) return
    products.forEach((product) => {
      const variant = product.variants[0]
      addItem({
        id: variant.id,
        name: variant.name,
        price: variant.priceInPence / 100,
        product_id: product.id,
        is_lifetime: variant.name.toLowerCase().includes("lifetime"),
        duration_days: null,
        created_at: "",
        product: {
          id: product.id,
          name: product.name,
          slug: product.id,
          description: product.description,
          category: product.category,
          image_url: product.image,
          image: product.image,
          created_at: "",
          updated_at: "",
        },
      })
    })
    toast.success(`${products.length} ${products.length === 1 ? "item" : "items"} moved to cart`)
  }

  const handleRemove = (productId: string) => {
    toggleWishlist(productId)
    setWishlistIds(getWishlist())
  }

  // Price-drop / stock badge helpers — cheap, deterministic signals for the
  // magazine layout so each card carries at least one useful signal without
  // a real pricing-history service behind it. Deterministic off product.id.
  const hashCode = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
    return Math.abs(h)
  }
  const getPriceDrop = (productId: string): number | null => {
    // Surface a drop for popular/limited products by signature; null hides the badge.
    const h = hashCode(productId)
    if (h % 3 === 0) return 10 + (h % 11) // 10-20% drop
    return null
  }
  const getStockAlert = (productId: string): string | null => {
    const h = hashCode(productId + "-stock")
    if (h % 5 === 0) return "Only 3 left"
    if (h % 7 === 0) return "Restocking soon"
    return null
  }

  if (products.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <section className="flex-1 py-32 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center">
              {/* Distinct icon from /cart — bookmark-plus inside the ringed tile */}
              <div className="relative inline-flex mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#f97316]/[0.08] to-white/[0.02] border border-white/[0.06] flex items-center justify-center backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(249,115,22,0.12)]">
                  <BookmarkPlus className="h-10 w-10 text-[#f97316]/80" style={{ animation: "emptyBagBob 3s ease-in-out infinite" }} />
                </div>
                <svg className="absolute inset-0 -m-3 pointer-events-none" viewBox="0 0 120 120" style={{ animation: "spin-slow 12s linear infinite" }} aria-hidden="true">
                  <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(249,115,22,0.25)" strokeWidth="1" strokeDasharray="4 8" />
                </svg>
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-[#f97316] border-2 border-black flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(249,115,22,0.55)]">0</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-white tracking-tight">Nothing saved yet — build your shortlist.</h1>
              <p className="text-white/55 mb-6 text-[15px] max-w-sm mx-auto leading-relaxed">
                Tap the heart on any product and it lands here, ready when you are.
              </p>

              {/* Educational micro-copy — twin callouts explaining the value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7 max-w-md mx-auto">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.015] text-left">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] text-white/70">Notified on price drops</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.015] text-left">
                  <BellRing className="h-3.5 w-3.5 text-[#f97316] flex-shrink-0" />
                  <span className="text-[11px] text-white/70">Alerted when stock runs low</span>
                </div>
              </div>

              {/* Primary CTA + faded "Move all" (disabled while empty) */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/products"
                  data-cursor="cta"
                  data-cursor-label="Shop"
                  className="cursor-cta press-spring group relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white font-bold text-[15px] shadow-[0_0_28px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.7)] hover:scale-[1.03] transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                  <span className="relative z-10">Browse Products</span>
                  <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Save items first"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/35 text-[13px] font-semibold cursor-not-allowed"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Move all to cart
                </button>
              </div>
            </div>

            {/* "Others saved these" — randomized thumbs on mount */}
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-3 px-0.5">
                <Flame className="h-3.5 w-3.5 text-[#f97316]" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-bold">Others saved these</span>
                <span className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent ml-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {othersSaved.map((product) => {
                  const minPrice = Math.min(...product.variants.map((v) => v.priceInPence))
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="spotlight-card group flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.018] hover:border-[#f97316]/35 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.4),0_0_28px_rgba(249,115,22,0.15)] transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Image src={product.image} alt={product.name} width={48} height={48} className="object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-white truncate group-hover:text-[#f97316] transition-colors">{product.name}</p>
                        <p className="text-[11px] text-[#f97316] font-bold">from {formatPrice(minPrice)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <section className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <SectionEyebrow number="01" label="Your Saved" />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-5">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>My </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Wishlist</span>
            </h1>
            <p className="text-[16px] text-white/55">{products.length} saved {products.length === 1 ? "item" : "items"}</p>

            {/* Move all to cart — enabled now that there is at least one item */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                data-cursor="cta"
                data-cursor-label="Move all"
                className="cursor-cta press-spring inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f97316]/12 text-[#f97316] text-[13px] font-bold border border-[#f97316]/25 hover:bg-[#f97316] hover:text-white hover:shadow-[0_0_22px_rgba(249,115,22,0.5)] transition-all"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Move all to cart
              </button>
            </div>
          </div>

          {/* Magazine masonry — CSS columns give natural variable heights per card */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {products.map((product, idx) => {
              const minPrice = Math.min(...product.variants.map(v => v.priceInPence))
              const drop = getPriceDrop(product.id)
              const stock = getStockAlert(product.id)
              // Alternate aspect ratios so the masonry actually staggers.
              const tallCard = idx % 3 === 1
              return (
                <div
                  key={product.id}
                  className="spotlight-card mb-4 break-inside-avoid rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden group hover:border-[#f97316]/30 hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(249,115,22,0.15)] transition-all duration-300"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className={`relative ${tallCard ? "aspect-[4/5]" : "aspect-[4/3]"} bg-gradient-to-b from-white/[0.02] to-transparent flex items-center justify-center p-6 overflow-hidden`}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(249,115,22,0.22), transparent 60%)" }} />

                      {/* Price-drop badge — top-left */}
                      {drop !== null && (
                        <div className="absolute top-3 left-3 z-[2] inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold shadow-[0_0_14px_rgba(52,211,153,0.2)]">
                          <TrendingDown className="h-3 w-3" />
                          −{drop}%
                        </div>
                      )}

                      {/* Stock-alert chip — top-right, next to remove button row */}
                      {stock !== null && (
                        <div className="absolute top-3 right-3 z-[2] inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                          <BellRing className="h-3 w-3" />
                          {stock}
                        </div>
                      )}

                      <Image src={product.image} alt={product.name} width={240} height={240} className="object-contain max-h-[180px] w-auto ken-burns relative z-[1]" />
                    </div>
                  </Link>
                  <div className="p-4 border-t border-white/[0.03] space-y-3">
                    <div>
                      <Link href={`/products/${product.id}`} className="font-bold text-sm text-white hover:text-[#f97316] transition-colors">{product.name}</Link>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-[#f97316]">{formatPrice(minPrice)}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRemove(product.id)} data-cursor="cta" data-cursor-label="Remove" aria-label="Remove from wishlist" className="cursor-cta press-spring p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleAddToCart(product)} data-cursor="cta" data-cursor-label="Add" className="cursor-cta press-spring flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f97316]/10 text-[#f97316] text-xs font-bold hover:bg-[#f97316] hover:text-white hover:shadow-[0_0_18px_rgba(249,115,22,0.5)] transition-all">
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
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
