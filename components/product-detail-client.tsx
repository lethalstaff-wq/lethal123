"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import {
  ShoppingCart, Zap, Star, Shield, Minus, Plus, Check,
  CheckCircle2, MessageCircle, Lock, Clock, Globe
} from "lucide-react"
import { DiscordCheckoutModal } from "@/components/discord-checkout-modal"
import { BitcoinIcon, EthereumIcon, LitecoinIcon, PayPalIcon } from "@/components/crypto-icons"
import { toast } from "sonner"

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
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const { addItem } = useCart()
  const router = useRouter()

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
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-card/80 to-secondary/20 border border-border/40 overflow-hidden group">
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
            <div className="rounded-xl border border-border/40 bg-card/40 p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold text-sm">Secure</p>
              <p className="text-xs text-muted-foreground">Encrypted</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/40 p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold text-sm">Instant</p>
              <p className="text-xs text-muted-foreground">Delivery</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/40 p-4 text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold text-sm">Global</p>
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Info ═══ */}
        <div className="flex flex-col">

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight lowercase mb-3 text-foreground">
            {product.name}
          </h1>

          {/* Description */}
          {product.longDescription && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-lg">
              {product.longDescription}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm text-yellow-400">5.0</span>
            </div>
            <span className="text-sm text-muted-foreground">312 Verified Reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-black">{"£"}{selectedVariant.price}</span>
          </div>

          {/* Variant Selection */}
          {product.variants.length > 1 && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Select Option</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedVariant.id === variant.id
                        ? "border-primary bg-primary/[0.06] shadow-lg shadow-primary/5"
                        : "border-border/50 hover:border-primary/40 bg-card/30"
                    }`}
                  >
                    {selectedVariant.id === variant.id && (
                      <Check className="absolute top-3.5 right-3.5 h-4 w-4 text-primary" />
                    )}
                    <p className="font-semibold text-sm">{variant.name}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{"£"}{variant.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          <div className="flex items-center gap-5 mb-6">
            <div className="flex items-center border border-border/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-white/[0.04] transition-colors text-muted-foreground hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-bold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-white/[0.04] transition-colors text-muted-foreground hover:text-foreground"
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
                className="h-12 font-semibold gap-2 rounded-xl border-border/50 hover:border-primary/40 hover:bg-primary/5"
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

        </div>
      </div>

      {/* ═══ FEATURES — Full width below ═══ */}
      {product.features && product.features.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold">What&apos;s Included</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Trust Section ═══ */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Undetected Since Day 1", desc: "Zero detections across all anti-cheat engines. We update within 2 hours of every game patch." },
          { icon: Zap, title: "Instant Digital Delivery", desc: "License key and download link arrive in seconds. No waiting, no manual verification." },
          { icon: Clock, title: "Priority Discord Support", desc: "Dedicated team available 24/7. Setup help, config optimization, troubleshooting." },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl border border-border/30 bg-card/30 p-6 hover:border-primary/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

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
