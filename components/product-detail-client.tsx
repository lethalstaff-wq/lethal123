"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { ShoppingCart, Zap, Star, Shield, Globe, Minus, Plus, Check, CreditCard, MessageCircle, CheckCircle2 } from "lucide-react"
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative">
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-card/60 to-secondary/20 border border-border/50 backdrop-blur-sm overflow-hidden">
            <Badge className="absolute top-4 left-4 z-10 bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Instant Delivery
            </Badge>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={500}
                className="object-contain max-h-[450px] w-auto"
              />
            </div>
          </div>

          {/* Trust cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-semibold text-sm">Secure</p>
                <p className="text-xs text-muted-foreground">Encrypted</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-semibold text-sm">Instant</p>
                <p className="text-xs text-muted-foreground">Delivery</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Globe className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-semibold text-sm">Global</p>
                <p className="text-xs text-muted-foreground">Support</p>
              </CardContent>
            </Card>
          </div>

          {/* Features list — below image */}
          {product.features && product.features.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">What&apos;s Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border/20 hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground/80 group-hover:text-foreground transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 lowercase">{product.name}</h1>

          {/* Long description */}
          {product.longDescription && (
            <p className="text-muted-foreground mb-4">{product.longDescription}</p>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">5.0</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Verified Reviews</span>
          </div>

          <p className="text-3xl font-bold mb-6">{"£"}{selectedVariant.price}</p>

          {/* Variant Selection */}
          {product.variants.length > 1 && (
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Select Option</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      selectedVariant.id === variant.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {selectedVariant.id === variant.id && (
                      <Check className="absolute top-3 right-3 h-5 w-5 text-primary" />
                    )}
                    <p className="font-semibold text-sm">{variant.name}</p>
                    <p className="text-muted-foreground">{"£"}{variant.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-muted transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400">{product.stock} in stock</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleBuyNow} size="lg" className="w-full h-14 text-base font-bold gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 btn-glow">
              <Zap className="h-5 w-5" />
              Buy Now — {"£"}{(selectedVariant.price * quantity).toFixed(2)}
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="flex-1 h-12 text-sm font-semibold gap-2 bg-transparent"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                onClick={() => setShowDiscordModal(true)}
                variant="outline"
                size="lg"
                className="flex-1 h-12 text-sm font-semibold gap-2 bg-[#5865F2]/10 border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/20"
              >
                <MessageCircle className="h-4 w-4" />
                Discord Order
              </Button>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mt-6 rounded-xl border border-border/30 bg-card/30 p-4">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Accepted Payments</p>
            <div className="flex items-center gap-4">
              {[
                { icon: BitcoinIcon, label: "Bitcoin" },
                { icon: EthereumIcon, label: "Ethereum" },
                { icon: LitecoinIcon, label: "Litecoin" },
                { icon: PayPalIcon, label: "PayPal" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default">
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Shield className="h-3.5 w-3.5" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
                <span>Instant Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Globe className="h-3.5 w-3.5" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
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
