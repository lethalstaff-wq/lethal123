"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Zap, MessageCircle, Shield, ArrowLeft, Bitcoin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DiscordCheckoutModal } from "@/components/discord-checkout-modal"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const router = useRouter()

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
                  </div>

                  <div className="h-px bg-border mb-5" />

                  <div className="flex justify-between font-bold text-xl mb-6">
                    <span>Total</span>
                    <span>{"£"}{total.toFixed(2)}</span>
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
