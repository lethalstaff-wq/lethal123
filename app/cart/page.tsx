"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Zap, MessageCircle, Shield, ArrowLeft, Bitcoin, Sparkles, Flame, Heart, Ticket } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DiscordCheckoutModal } from "@/components/discord-checkout-modal"
import { PRODUCTS, formatPrice } from "@/lib/products"
import { getWishlist } from "@/lib/wishlist"
import { toast } from "sonner"
import { GlossyButton, GlossyLink } from "@/components/ui/glossy-button"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart, addItem } = useCart()
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const router = useRouter()

  // Read wishlist count for the empty-cart nudge. Runs only on mount and when
  // the wishlist changes (via the shared custom event dispatched by toggleWishlist).
  useEffect(() => {
    setWishlistCount(getWishlist().length)
    const handler = () => setWishlistCount(getWishlist().length)
    window.addEventListener("wishlist-update", handler)
    return () => window.removeEventListener("wishlist-update", handler)
  }, [])

  // Popular-right-now tiles for the empty state — surface the three products
  // marked popular first, then fill with highest-badge products if needed.
  const popularEmptyState = [
    ...PRODUCTS.filter((p) => p.popular),
    ...PRODUCTS.filter((p) => !p.popular && p.badge === "In Stock"),
  ].slice(0, 3)

  // Cross-sell: find products NOT in cart
  const cartProductIds = new Set(items.map(i => i.variant.product_id || i.variant.product?.id))
  const crossSellRules: Record<string, string[]> = {
    "fortnite-external": ["perm-spoofer", "temp-spoofer"],
    "blurred": ["custom-dma-firmware", "perm-spoofer"],
    "streck": ["custom-dma-firmware", "perm-spoofer"],
    "perm-spoofer": ["fortnite-external", "blurred"],
    "temp-spoofer": ["perm-spoofer", "fortnite-external"],
    "custom-dma-firmware": ["blurred", "streck"],
  }
  const crossSellIds = new Set<string>()
  cartProductIds.forEach(id => {
    if (id && crossSellRules[id]) {
      crossSellRules[id].forEach(rid => { if (!cartProductIds.has(rid)) crossSellIds.add(rid) })
    }
  })
  const crossSellProducts = Array.from(crossSellIds).slice(0, 3).map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean) as typeof PRODUCTS

  // Volume discount
  const uniqueProducts = new Set(items.map(i => i.variant.product_id || i.variant.product?.id)).size
  const volumeDiscount = uniqueProducts >= 3 ? 0.15 : uniqueProducts >= 2 ? 0.10 : 0
  const volumeDiscountAmount = total * volumeDiscount
  const finalTotal = total - volumeDiscountAmount

  const handleAddCrossSell = (product: typeof PRODUCTS[number]) => {
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

  const productList = items
    .map((item) => `${item.variant.product?.name} - ${item.variant.name} x${item.quantity}`)
    .join(", ")

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <section className="flex-1 py-32 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-2xl">
            {/* Icon + heading + primary CTA */}
            <div className="text-center">
              <div className="relative inline-flex mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#f97316]/[0.08] to-white/[0.02] border border-white/[0.06] flex items-center justify-center backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(249,115,22,0.1)]">
                  <ShoppingBag className="h-10 w-10 text-white/70 animate-wiggle" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-black flex items-center justify-center text-[9px] font-black text-white animate-pulse">0</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-white tracking-tight">Your cart is empty</h1>
              <p className="text-white/55 mb-7 text-[15px] max-w-sm mx-auto leading-relaxed">
                Pick a product to secure your setup. Delivery lands in seconds after checkout.
              </p>
              <GlossyLink
                href="/products"
                data-cursor="cta"
                data-cursor-label="Shop"
                size="lg"
                className="cursor-cta press-spring"
                rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/glossy:translate-x-1" />}
              >
                Browse Products
              </GlossyLink>
            </div>

            {/* Wishlist nudge — only if user has saved items */}
            {wishlistCount > 0 && (
              <Link
                href="/wishlist"
                className="group mt-8 flex items-center justify-between gap-3 rounded-xl border border-[#f97316]/15 bg-[#f97316]/[0.04] px-4 py-3 hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.07] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 text-[#f97316] fill-[#f97316]/30" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">
                      You have {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
                    </p>
                    <p className="text-[11px] text-white/50">Move them straight to your cart.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#f97316] group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            )}

            {/* Popular right now — 3 mini product tiles linking to PDPs */}
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-3 px-0.5">
                <Flame className="h-3.5 w-3.5 text-[#f97316]" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-bold">Popular right now</span>
                <span className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent ml-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {popularEmptyState.map((product) => {
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

            {/* Discount teaser pill */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] text-[11px]">
                <Ticket className="h-3 w-3 text-emerald-400" />
                <span className="text-white/70">First order?</span>
                <span className="font-mono font-bold text-emerald-400 tracking-wider">WELCOME10</span>
                <span className="text-white/45">— 10% off at checkout</span>
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

      <section className="flex-1 pt-32 pb-28 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-[#f97316] transition-colors mb-4 font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              Continue Shopping
            </Link>
            <div className="mb-3">
              <SectionEyebrow number="01" label="Cart" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1] mt-2" style={{ paddingBottom: "0.08em" }}>
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Shopping </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Cart</span>
            </h1>
            <p className="text-[14px] text-white/55 mt-2">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.variant.id} className="spotlight-card relative rounded-2xl border border-white/[0.06] bg-white/[0.018] backdrop-blur-sm p-4 hover:border-[#f97316]/40 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.4),0_0_30px_rgba(249,115,22,0.12)] transition-all overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ background: "linear-gradient(to bottom, #f97316, rgba(249, 115, 22, 0.72), transparent)" }} />
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(item.variant.product?.image || item.variant.product?.image_url) ? (
                        <Image src={item.variant.product?.image || item.variant.product?.image_url || ""} alt={item.variant.product?.name || ""} width={64} height={64} className="object-contain" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-white/45" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-white/90">{item.variant.product?.name}</h3>
                      <p className="text-xs text-white/40">{item.variant.name}</p>
                    </div>

                    <div className="flex items-center rounded-lg border border-white/[0.06]">
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="p-2 hover:bg-white/[0.04] transition-colors rounded-l-lg text-white/60 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-white/90">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                        aria-label="Increase quantity"
                        className="p-2 hover:bg-white/[0.04] transition-colors rounded-r-lg text-white/60 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right w-20">
                      <p className="font-bold text-sm text-white/90">{"£"}{(item.variant.price * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-white/30">{"£"}{item.variant.price} each</p>
                      )}
                    </div>

                    <button aria-label="Remove item" onClick={() => removeItem(item.variant.id)} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button aria-label="Clear cart" onClick={clearCart} className="inline-flex items-center gap-1.5 text-[12px] text-white/35 hover:text-red-400 transition-colors mt-3 font-medium">
                <Trash2 className="h-3 w-3" /> Clear all items
              </button>

              {/* Cross-sell */}
              {crossSellProducts.length > 0 && (
                <div className="mt-6 rounded-2xl border border-white/[0.04] bg-white/[0.012] p-4">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white/90">
                    <Sparkles className="h-4 w-4 text-[#f97316]/60" />
                    Add to your order
                  </h3>
                  <div className="space-y-2">
                    {crossSellProducts.map((product) => {
                      const minPrice = Math.min(...product.variants.map(v => v.priceInPence))
                      return (
                        <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] hover:border-[#f97316]/20 transition-all">
                          <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <Image src={product.image} alt={product.name} width={40} height={40} className="object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate text-white/90">{product.name}</p>
                            <p className="text-xs text-[#f97316] font-bold">from {formatPrice(minPrice)}</p>
                          </div>
                          <button onClick={() => handleAddCrossSell(product)} data-cursor="cta" data-cursor-label="Add" className="cursor-cta press-spring px-3 py-1.5 rounded-lg bg-[#f97316]/10 text-[#f97316] text-[11px] font-bold hover:bg-[#f97316]/20 hover:shadow-[0_0_14px_rgba(249,115,22,0.35)] transition-all shrink-0">
                            + Add
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div>
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] backdrop-blur-sm sticky top-24 overflow-hidden">
                <div className="p-6">
                  <h2 className="font-bold text-lg mb-5 text-white/90">Order Summary</h2>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Subtotal ({items.length} items)</span>
                      <span className="text-white/90">{"£"}{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Processing Fee</span>
                      <span className="text-green-400 font-medium">Free</span>
                    </div>
                    {volumeDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Bundle discount ({(volumeDiscount * 100).toFixed(0)}%)</span>
                        <span className="text-emerald-400">-{"£"}{volumeDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/[0.06] mb-5" />

                  <div className="flex justify-between font-bold text-xl mb-6 text-white/90">
                    <span>Total</span>
                    <span>{"£"}{finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Checkout button */}
                  <GlossyButton
                    onClick={() => router.push("/checkout")}
                    data-cursor="cta"
                    data-cursor-label="Checkout"
                    shape="block"
                    size="lg"
                    full
                    className="cursor-cta press-spring"
                    rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/glossy:translate-x-1" />}
                  >
                    Proceed to Checkout
                  </GlossyButton>

                  {/* Accepted methods */}
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400">BTC</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400">ETH</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">USDT</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-400/10 text-gray-300">LTC</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">PayPal</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5865F2]/10 text-[#5865F2]">Discord</span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="border-t border-white/[0.04] p-4 bg-white/[0.008]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <Zap className="h-3 w-3 text-[#f97316] flex-shrink-0" />
                      Instant Delivery
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <Shield className="h-3 w-3 text-[#f97316] flex-shrink-0" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <MessageCircle className="h-3 w-3 text-[#f97316] flex-shrink-0" />
                      24/7 Support
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <Shield className="h-3 w-3 text-[#f97316] flex-shrink-0" />
                      99.8% Undetected
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile bottom-sheet checkout bar — only visible on small screens */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-[60] pointer-events-none">
        <div className="mx-3 mb-3 pointer-events-auto rounded-2xl border border-white/[0.08] bg-black/85 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5),0_0_24px_rgba(249,115,22,0.14)] overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" />
          <div className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/40 font-bold">Total</p>
              <p className="font-display text-[22px] font-black tracking-tight text-white tabular-nums leading-none mt-0.5">£{finalTotal.toFixed(2)}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{items.length} {items.length === 1 ? "item" : "items"}</p>
            </div>
            <GlossyButton
              onClick={() => router.push("/checkout")}
              data-cursor="cta"
              data-cursor-label="Checkout"
              shape="block"
              size="md"
              className="cursor-cta press-spring"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Checkout
            </GlossyButton>
          </div>
        </div>
      </div>

      <Footer />

      <DiscordCheckoutModal
        isOpen={showDiscordModal}
        onClose={() => setShowDiscordModal(false)}
        productName={`Cart (${items.length} items)`}
        variantName={productList}
        price={total}
      />
    </main>
  )
}
