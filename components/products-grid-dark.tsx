"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Tag, Zap } from "lucide-react"
import { type Product, formatPrice } from "@/lib/products"

const categories = [
  { id: "all", name: "All Products" },
  { id: "bundle", name: "Bundles" },
  { id: "cheat", name: "Cheats" },
  { id: "spoofer", name: "Spoofers" },
  { id: "firmware", name: "Firmware" },
]

function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const lowestPrice = Math.min(...product.variants.map((v) => v.priceInPence))
  const variantCount = product.variants.length
  const isBundle = product.category === "bundle"
  const isPremium = product.badge === "Premium" || product.badge === "Best Value"

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`)
    el.style.setProperty("--my", `${e.clientY - rect.top}px`)
  }

  return (
    <Link href={`/products/${product.id}`} data-cursor="cta" data-cursor-label="View" className="cursor-cta group block">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        className={`spotlight-card relative rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300 ${
          isPremium
            ? "border border-[#f97316]/40 bg-gradient-to-b from-[#f97316]/[0.07] to-white/[0.015] shadow-[0_8px_32px_rgba(249,115,22,0.16)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.55),0_0_70px_rgba(249,115,22,0.3)] hover:border-[#f97316]/70"
            : "border border-white/[0.06] bg-white/[0.015] hover:border-[#f97316]/35 hover:bg-white/[0.03] hover:shadow-[0_28px_60px_rgba(0,0,0,0.5),0_0_50px_rgba(249,115,22,0.16)]"
        }`}
        style={{ transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* Shine */}
        <div className="absolute top-[-60%] left-[-80%] w-[50%] h-[220%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent rotate-[25deg] group-hover:left-[130%] transition-[left] duration-700 pointer-events-none z-[4]" />

        {/* Top badges row */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-[5] flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {product.popular && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f97316] text-white shadow-md shadow-[#f97316]/40">
                <Sparkles className="h-2.5 w-2.5" />
                Popular
              </span>
            )}
            {isBundle && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 backdrop-blur-sm">
                <Tag className="h-2.5 w-2.5" />
                Bundle
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
              product.badge === "Best Value"
                ? "bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30"
                : product.badge === "Premium"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  : "bg-green-500/15 text-green-400 border border-green-500/25"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.badge === "Best Value"
                  ? "bg-[#f97316] shadow-[0_0_8px_#f97316]"
                  : product.badge === "Premium"
                    ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                    : "bg-green-400 animate-pulse shadow-[0_0_8px_#22c55e]"
              }`}
            />
            {product.badge || "In Stock"}
          </span>
        </div>

        {/* Image Area */}
        <div className="relative aspect-[4/3] bg-gradient-to-b from-black/40 via-transparent to-transparent flex items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[2]" style={{ background: "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.28), transparent 60%)" }} />
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={280}
            height={280}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain max-h-[180px] w-auto ken-burns drop-shadow-2xl relative z-[3]"
          />
        </div>

        {/* Info */}
        <div className="border-t border-white/[0.06] p-5 space-y-3.5 relative z-[3]">
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

          <div>
            <h3 className="font-display font-bold text-[17px] text-white group-hover:text-[#f97316] transition-colors duration-200 text-balance tracking-tight">
              {product.name}
            </h3>
            <p className="text-[12px] text-white/55 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-[10px] text-white/45 uppercase tracking-[0.15em] mb-0.5 font-medium">From</p>
              <p className="font-display text-2xl font-black tracking-tight text-white">{formatPrice(lowestPrice)}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-white/45 group-hover:text-[#f97316] transition-all duration-300">
              <span className="hidden sm:inline">View</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ProductsGridDark({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredProducts = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Category Filter with layoutId morph */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-1 p-1 rounded-full backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-cursor="cta"
                data-cursor-label={cat.name}
                className={`cursor-cta relative px-5 py-2 rounded-full text-[13px] font-semibold transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="products-filter-active"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.58)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-[2]">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Counter */}
      <div className="text-center mb-8">
        <p className="text-[12px] text-white/45 tabular-nums">
          Showing <span className="text-white font-bold">{filteredProducts.length}</span>{" "}
          product{filteredProducts.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-24">
          <p className="font-display text-2xl font-bold text-white/80 mb-2">Nothing here yet</p>
          <p className="text-sm text-white/50">Check back soon or pick another category.</p>
        </div>
      )}
    </div>
  )
}
