"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Star, Tag, Zap } from "lucide-react"
import { type Product, formatPrice } from "@/lib/products"

const categories = [
  { id: "all", name: "All Products" },
  { id: "bundle", name: "Bundles" },
  { id: "cheat", name: "Cheats" },
  { id: "spoofer", name: "Spoofers" },
  { id: "firmware", name: "Firmware" },
]

export function ProductsGridDark({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredProducts = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const lowestPrice = Math.min(...product.variants.map((v) => v.priceInPence))
          const variantCount = product.variants.length
          const isBundle = product.category === "bundle"
          const isPremium = product.badge === "Premium" || product.badge === "Best Value"

          return (
            <Link key={product.id} href={`/products/${product.id}`} className="group block">
              <div
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
                  isPremium
                    ? "border-2 border-primary/40 bg-gradient-to-b from-primary/5 to-card shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/60"
                    : "border border-border/50 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                }`}
              >
                {/* Top badges row */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-start justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {product.popular && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-md shadow-primary/30">
                        <Sparkles className="h-2.5 w-2.5" />
                        Popular
                      </span>
                    )}
                    {isBundle && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                        <Tag className="h-2.5 w-2.5" />
                        Bundle
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      product.badge === "Best Value"
                        ? "bg-primary/15 text-primary border border-primary/25"
                        : product.badge === "Premium"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                          : "bg-green-500/15 text-green-400 border border-green-500/25"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.badge === "Best Value"
                          ? "bg-primary"
                          : product.badge === "Premium"
                            ? "bg-amber-400"
                            : "bg-green-400 animate-pulse"
                      }`}
                    />
                    {product.badge || "In Stock"}
                  </span>
                </div>

                {/* Image Area */}
                <div className="relative aspect-[4/3] bg-gradient-to-b from-background/80 via-background/40 to-transparent flex items-center justify-center p-8 overflow-hidden">
                  {/* Subtle glow behind image on hover */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/3 transition-colors duration-500" />
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={280}
                    height={280}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain max-h-[180px] w-auto transition-all duration-500 group-hover:scale-110 drop-shadow-lg"
                  />
                </div>

                {/* Info Section */}
                <div className="border-t border-border/40 p-5 space-y-3.5">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">4.9</span>
                    <span className="text-[10px] text-muted-foreground/50">|</span>
                    <span className="text-[10px] text-muted-foreground">{variantCount} option{variantCount > 1 ? "s" : ""}</span>
                  </div>

                  {/* Title & description */}
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors duration-200 text-balance">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-end justify-between pt-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Starting at</p>
                      <p className="text-2xl font-bold tracking-tight text-foreground">{formatPrice(lowestPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">View</span>
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
