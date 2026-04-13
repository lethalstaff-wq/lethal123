"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Zap, MessageCircle, Shield, ArrowLeft, Bitcoin, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DiscordCheckoutModal } from "@/components/discord-checkout-modal"
import { PRODUCTS, formatPrice } from "@/lib/products"
import { toast } from "sonner"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart, addItem } = useCart()
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const router = useRouter()

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
      <main className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <section className="flex-1 py-32 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-white/20" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-white/90">Your cart is empty</h1>
            <p className="text-white/40 mb-8 text-sm">Browse our products and find what you need.</p>
            <Link href="/products">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />

      <section className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#f97316] transition-colors mb-3">
                <ArrowLeft className="h-3.5 w-3.5" />
                Continue Shopping
              </Link>
              <h1 className="text-3xl font-bold text-white/90">Shopping <span className="text-[#f97316]">Cart</span></h1>
              <p className="text-sm text-white/40 mt-1">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.variant.id} className="relative rounded-2xl border border-white/[0.04] bg-white/[0.012] backdrop-blur-sm p-4 hover:border-[#f97316]/30 hover:shadow-lg hover:shadow-[#f97316]/5 transition-all overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ background: "linear-gradient(to bottom, #f97316, rgba(249,115,22,0.5), transparent)" }} />
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(item.variant.product?.image || item.variant.product?.image_url) ? (
                        <Image src={item.variant.product?.image || item.variant.product?.image_url || ""} alt={item.variant.product?.name || ""} width={64} height={64} className="object-contain" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-white/20" />
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

                    <button onClick={() => removeItem(item.variant.id)} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="text-xs text-white/30 hover:text-red-400 transition-colors mt-2">
                Clear all items
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
                          <button onClick={() => handleAddCrossSell(product)} className="px-3 py-1.5 rounded-lg bg-[#f97316]/10 text-[#f97316] text-[11px] font-bold hover:bg-[#f97316]/20 transition-colors shrink-0">
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
                  <button
                    className="w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </button>

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
