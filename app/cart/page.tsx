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
      <main className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <section className="flex-1 py-32 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 text-sm">Browse our products and find what you need.</p>
            <Link href="/products">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-3">
                <ArrowLeft className="h-3.5 w-3.5" />
                Continue Shopping
              </Link>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-sm text-muted-foreground mt-1">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.variant.id} className="relative rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-l-xl" />
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(item.variant.product?.image || item.variant.product?.image_url) ? (
                        <Image src={item.variant.product?.image || item.variant.product?.image_url || ""} alt={item.variant.product?.name || ""} width={64} height={64} className="object-contain" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{item.variant.product?.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                    </div>

                    <div className="flex items-center rounded-lg border border-border">
                      <button onClick={() => updateQuantity(item.variant.id, item.quantity - 1)} className="p-2 hover:bg-muted/50 transition-colors rounded-l-lg">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} className="p-2 hover:bg-muted/50 transition-colors rounded-r-lg">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right w-20">
                      <p className="font-bold text-sm">{"£"}{(item.variant.price * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-muted-foreground">{"£"}{item.variant.price} each</p>
                      )}
                    </div>

                    <button onClick={() => removeItem(item.variant.id)} className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-red-400 transition-colors mt-2">
                Clear all items
              </button>

              {/* Cross-sell */}
              {crossSellProducts.length > 0 && (
                <div className="mt-6 rounded-xl border border-border/40 bg-card/30 p-4">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary/60" />
                    Add to your order
                  </h3>
                  <div className="space-y-2">
                    {crossSellProducts.map((product) => {
                      const minPrice = Math.min(...product.variants.map(v => v.priceInPence))
                      return (
                        <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/20 transition-all">
                          <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <Image src={product.image} alt={product.name} width={40} height={40} className="object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{product.name}</p>
                            <p className="text-xs text-primary font-bold">from {formatPrice(minPrice)}</p>
                          </div>
                          <button onClick={() => handleAddCrossSell(product)} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-colors shrink-0">
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
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm sticky top-24 overflow-hidden">
                <div className="p-6">
                  <h2 className="font-bold text-lg mb-5">Order Summary</h2>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                      <span>{"£"}{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span className="text-green-400 font-medium">Free</span>
                    </div>
                    {volumeDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Bundle discount ({(volumeDiscount * 100).toFixed(0)}%)</span>
                        <span className="text-emerald-400">-{"£"}{volumeDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-border mb-5" />

                  <div className="flex justify-between font-bold text-xl mb-6">
                    <span>Total</span>
                    <span>{"£"}{finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Checkout button */}
                  <Button
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                    size="lg"
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>

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
                <div className="border-t border-border/50 p-4 bg-muted/10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Zap className="h-3 w-3 text-primary flex-shrink-0" />
                      Instant Delivery
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <MessageCircle className="h-3 w-3 text-primary flex-shrink-0" />
                      24/7 Support
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Shield className="h-3 w-3 text-primary flex-shrink-0" />
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
