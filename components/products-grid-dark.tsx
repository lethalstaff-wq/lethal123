"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Tag, Zap } from "lucide-react"
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
      {/* Category Filter — premium pill */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 p-1 rounded-full backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
                  : "text-white/55 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
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
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 backdrop-blur-xl ${
                  isPremium
                    ? "border border-[#f97316]/35 bg-gradient-to-b from-[#f97316]/[0.06] to-white/[0.025] shadow-[0_8px_32px_rgba(249,115,22,0.10)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_50px_rgba(249,115,22,0.18)] hover:border-[#f97316]/60"
                    : "border border-white/[0.07] bg-white/[0.025] hover:border-[#f97316]/30 hover:bg-white/[0.04] hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(249,115,22,0.10)]"
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
                <div className="relative aspect-[4/3] bg-gradient-to-b from-black/40 via-transparent to-transparent flex items-center justify-center p-8 overflow-hidden">
                  {/* Orange glow behind image on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(249,115,22,0.18), transparent 65%)" }} />
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={280}
                    height={280}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain max-h-[180px] w-auto transition-all duration-500 group-hover:scale-110 drop-shadow-2xl relative z-[1]"
                  />
                </div>

                {/* Info Section */}
                <div className="border-t border-white/[0.06] p-5 space-y-3.5">
                  {/* Tags */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                      <Zap className="h-3 w-3" /> Instant Delivery
                    </span>
                    {variantCount > 1 && (
                      <>
                        <span className="text-[10px] text-white/30">·</span>
                        <span className="text-[10px] text-white/55 font-medium">{variantCount} options</span>
                      </>
                    )}
                  </div>

                  {/* Title & description */}
                  <div>
                    <h3 className="font-display font-bold text-[17px] text-white group-hover:text-[#f97316] transition-colors duration-200 text-balance tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-[12px] text-white/55 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-end justify-between pt-1">
                    <div>
                      <p className="text-[10px] text-white/45 uppercase tracking-[0.15em] mb-0.5 font-medium">From</p>
                      <p className="font-display text-2xl font-black tracking-tight text-white">{formatPrice(lowestPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-white/45 group-hover:text-[#f97316] transition-all duration-300">
                      <span className="hidden sm:inline">View Details</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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
