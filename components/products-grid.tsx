"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Zap } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { ProductVariant, Product } from "@/lib/types"

// Product data based on user's SellAuth
const products = [
  {
    id: "1",
    name: "Custom DMA Firmware",
    slug: "custom-dma-firmware",
    description: "Built for precision. Designed to endure.",
    category: "firmware",
    variants: [
      { id: "1-1", name: "EAC/BE Emulated", price: 200, is_lifetime: false },
      { id: "1-2", name: "Slotted Edition", price: 450, is_lifetime: false },
      { id: "1-3", name: "FaceIt/VGK", price: 975, is_lifetime: false },
    ],
  },
  {
    id: "2",
    name: "Perm Spoofer",
    slug: "perm-spoofer",
    description: "Built for precision. Trusted for performance.",
    category: "spoofer",
    variants: [
      { id: "2-1", name: "One-Time License", price: 35, is_lifetime: false },
      { id: "2-2", name: "Lifetime License", price: 120, is_lifetime: true },
    ],
  },
  {
    id: "3",
    name: "Temp Spoofer",
    slug: "temp-spoofer",
    description: "Built for consistency. Trusted for control.",
    category: "spoofer",
    variants: [
      { id: "3-1", name: "15-Day License", price: 20, duration_days: 15, is_lifetime: false },
      { id: "3-2", name: "30-Day License", price: 40, duration_days: 30, is_lifetime: false },
      { id: "3-3", name: "180-Day License", price: 150, duration_days: 180, is_lifetime: false },
      { id: "3-4", name: "Lifetime License", price: 500, is_lifetime: true },
    ],
  },
  {
    id: "4",
    name: "Blurred DMA Cheat",
    slug: "blurred",
    description: "Premium DMA cheat with advanced features.",
    category: "cheat",
    variants: [
      { id: "4-1", name: "Weekly", price: 22, duration_days: 7, is_lifetime: false },
      { id: "4-2", name: "Monthly", price: 35, duration_days: 30, is_lifetime: false },
      { id: "4-3", name: "Quarterly", price: 85, duration_days: 90, is_lifetime: false },
      { id: "4-4", name: "Lifetime", price: 385, is_lifetime: true },
    ],
  },
  {
    id: "5",
    name: "Streck DMA Cheat",
    slug: "streck",
    description: "Reliable DMA cheat solution.",
    category: "cheat",
    variants: [
      { id: "5-1", name: "7 Days", price: 8, duration_days: 7, is_lifetime: false },
      { id: "5-2", name: "30 Days", price: 15, duration_days: 30, is_lifetime: false },
      { id: "5-3", name: "90 Days", price: 40, duration_days: 90, is_lifetime: false },
      { id: "5-4", name: "Lifetime", price: 150, is_lifetime: true },
    ],
  },
  {
    id: "6",
    name: "Fortnite External",
    slug: "fortnite-external",
    description: "Clean UI. Fast setup. Tournament-ready.",
    category: "cheat",
    variants: [
      { id: "6-1", name: "1 Day", price: 6, duration_days: 1, is_lifetime: false },
      { id: "6-2", name: "3 Days", price: 13, duration_days: 3, is_lifetime: false },
      { id: "6-3", name: "7 Days", price: 25, duration_days: 7, is_lifetime: false },
      { id: "6-4", name: "30 Days", price: 60, duration_days: 30, is_lifetime: false },
      { id: "6-5", name: "Lifetime", price: 130, is_lifetime: true },
    ],
  },
  {
    id: "7",
    name: "DMA Basic Bundle",
    slug: "dma-basic",
    description:
      "Reliable foundation for everyday use. Includes: Captain DMA 100T-7th, EAC/BE Emulated, Mini DP Fuser V2, Blurred (30 Days), Macku (Free)",
    category: "bundle",
    originalPrice: 778,
    variants: [{ id: "7-1", name: "Full Bundle", price: 425, is_lifetime: false }],
  },
  {
    id: "8",
    name: "DMA Advanced Bundle",
    slug: "dma-advanced",
    description:
      "Balanced configuration for creators and semi-pro users. Includes: Captain DMA 100T-7th, Dichen D60 Fuser, Teensy (Firmware Included), EAC/BE Emulated Slotted, Blurred DMA (Quarterly)",
    category: "bundle",
    originalPrice: 1219,
    variants: [{ id: "8-1", name: "Full Bundle", price: 675, is_lifetime: false }],
  },
  {
    id: "9",
    name: "DMA Elite Bundle",
    slug: "dma-elite",
    description:
      "Maximum performance — full emulation & lifetime access. Includes: Captain DMA 100T-7th, Dichen DC500 Fuser, Teensy (Firmware Included), Blurred Lifetime DMA Cheat, EAC/BE, FaceIt, VGK Emulated",
    category: "bundle",
    originalPrice: 2884,
    variants: [{ id: "9-1", name: "Full Bundle", price: 1500, is_lifetime: false }],
  },
]

type ProductWithVariants = (typeof products)[number]

const categories = [
  { id: "all", name: "All Products" },
  { id: "bundle", name: "Bundles" },
  { id: "cheat", name: "Cheats" },
  { id: "spoofer", name: "Spoofers" },
  { id: "firmware", name: "Firmware" },
]

export function ProductsGrid() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const { addItem } = useCart()

  const filteredProducts = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  const handleAddToCart = (product: ProductWithVariants) => {
    const variantId = selectedVariants[product.id] || product.variants[0].id
    const variant = product.variants.find((v) => v.id === variantId) || product.variants[0]

    addItem({
      ...variant,
      product_id: product.id,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        image_url: null,
        created_at: "",
        updated_at: "",
      },
      created_at: "",
    } as ProductVariant & { product: Product })
  }

  const getSelectedVariant = (product: ProductWithVariants) => {
    const variantId = selectedVariants[product.id]
    return product.variants.find((v) => v.id === variantId) || product.variants[0]
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="rounded-full"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const selectedVariant = getSelectedVariant(product)
          const isBundle = product.category === "bundle"

          return (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden"
            >
              {isBundle && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                  Save ${(product as any).originalPrice - selectedVariant.price}
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  {selectedVariant.is_lifetime && (
                    <Badge variant="secondary" className="shrink-0">
                      <Zap className="h-3 w-3 mr-1" />
                      Lifetime
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Variant Selection */}
                {product.variants.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Option</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [product.id]: variant.id }))}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                            selectedVariant.id === variant.id
                              ? "border-primary bg-primary/10 text-primary font-medium"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price & Add to Cart */}
                <div className="flex items-end justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold">${selectedVariant.price}</p>
                    {isBundle && (product as any).originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">${(product as any).originalPrice}</p>
                    )}
                  </div>
                  <Button onClick={() => handleAddToCart(product)} className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
