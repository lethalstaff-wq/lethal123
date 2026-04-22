"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { type Product, formatPrice } from "@/lib/products"

const categories = [
  { id: "all", name: "All" },
  { id: "bundle", name: "Bundles" },
  { id: "cheat", name: "Cheats" },
  { id: "spoofer", name: "Spoofers" },
  { id: "firmware", name: "Firmware" },
]

const CATEGORY_LABEL: Record<Product["category"], string> = {
  bundle: "Bundle",
  cheat: "DMA Cheat",
  spoofer: "Spoofer",
  firmware: "Firmware",
}

function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const lowestPrice = Math.min(...product.variants.map((v) => v.priceInPence))
  const variantCount = product.variants.length
  // "Premium" flag drives the single accent card — ONE emphasis per page, not per row.
  // Popular is represented by a quiet eyebrow dot, not a second orange halo.
  const isFeatured = product.badge === "Best Value"
  const isPopular = product.popular === true
  // De-dup: product.popular + badge:"Popular" render one chip, not two.
  const topBadge = product.badge && product.badge !== "In Stock" ? product.badge : null
  const categoryLabel = CATEGORY_LABEL[product.category]

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
        className={`spotlight-card relative rounded-2xl overflow-hidden hover:-translate-y-1 will-change-transform ${
          isFeatured
            ? "border border-[#f97316]/25 bg-white/[0.015] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-[#f97316]/55 hover:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.6),0_0_0_1px_rgba(249,115,22,0.18),0_12px_36px_-8px_rgba(249,115,22,0.28)]"
            : "border border-white/[0.06] bg-white/[0.015] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.12] hover:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)]"
        }`}
        style={{ transition: "border-color 180ms ease-out, box-shadow 240ms cubic-bezier(0.22,1,0.36,1), transform 240ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* Featured accent stripe — ONE premium signal, editorial not neon */}
        {isFeatured && (
          <span
            aria-hidden
            className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent z-[6]"
          />
        )}

        {/* Shine — dimmer so it doesn't compete with spotlight + accent */}
        <div className="absolute top-[-60%] left-[-80%] w-[50%] h-[220%] bg-gradient-to-r from-transparent via-white/[0.025] to-transparent rotate-[25deg] group-hover:left-[130%] transition-[left] duration-700 pointer-events-none z-[4]" />

        {/* Top-right badge only — single chip, no stacking. */}
        {topBadge && (
          <div className="absolute top-3.5 right-3.5 z-[5]">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur-sm ${
                topBadge === "Best Value"
                  ? "bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30"
                  : topBadge === "Premium"
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                    : "bg-white/[0.06] text-white/70 border border-white/[0.08]"
              }`}
            >
              {topBadge === "Popular" && <Sparkles className="h-2.5 w-2.5" strokeWidth={2.25} />}
              {topBadge}
            </span>
          </div>
        )}

        {/* Image Area — tighter padding so hero image fills more of the frame */}
        <div className="relative aspect-[4/3] bg-gradient-to-b from-black/40 via-transparent to-transparent flex items-center justify-center p-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[2]"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.22), transparent 60%)" }}
          />
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={280}
            height={280}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain max-h-[210px] w-auto ken-burns drop-shadow-2xl relative z-[3]"
          />
          {/* Inset rim light — top edge only, the premium "dark card that looks expensive" move */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.04] z-[3]" />
        </div>

        {/* Info — tighter, clearer hierarchy */}
        <div className="border-t border-white/[0.06] p-5 space-y-3 relative z-[3]">
          {/* Meta row: category + options count + popular signal */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] text-white/55 font-semibold uppercase tracking-[0.14em] truncate">
                {categoryLabel}
              </span>
              {variantCount > 1 && (
                <>
                  <span className="text-[10px] text-white/20" aria-hidden>·</span>
                  <span className="text-[10px] text-white/45 font-medium tabular-nums whitespace-nowrap">
                    {variantCount} options
                  </span>
                </>
              )}
            </div>
            {isPopular && !topBadge && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#f97316] font-bold uppercase tracking-[0.12em] whitespace-nowrap">
                <Sparkles className="h-2.5 w-2.5" strokeWidth={2.25} />
                Popular
              </span>
            )}
            {isPopular && topBadge && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-[0.12em] whitespace-nowrap">
                <Zap className="h-2.5 w-2.5" strokeWidth={2.25} />
                Instant
              </span>
            )}
            {!isPopular && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-[0.12em] whitespace-nowrap">
                <Zap className="h-2.5 w-2.5" strokeWidth={2.25} />
                Instant
              </span>
            )}
          </div>

          <div>
            <h3 className="font-display font-bold text-[18px] text-white group-hover:text-[#f97316] transition-colors duration-[180ms] ease-out text-balance tracking-[-0.01em] leading-[1.2]">
              {product.name}
            </h3>
            <p className="text-[13px] text-white/55 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>

          {/* Price + CTA — baseline-aligned, tabular price, stronger view chip */}
          <div className="flex items-end justify-between gap-4 pt-2">
            <div className="min-w-0">
              <p className="text-[10px] text-white/45 uppercase tracking-[0.18em] mb-1 font-medium">From</p>
              <p className="font-display text-[26px] leading-none font-black tracking-[-0.01em] text-white tabular-nums">
                {formatPrice(lowestPrice)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/55 group-hover:text-[#f97316] transition-colors duration-[180ms] ease-out">
              View
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" strokeWidth={2} />
            </span>
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
      {/* Filter row — pills left, counter right (desktop); stacked on mobile */}
      <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="inline-flex items-center gap-1 p-1 rounded-full backdrop-blur-xl bg-white/[0.04] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] whitespace-nowrap">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  data-cursor="cta"
                  data-cursor-label={cat.name}
                  className={`cursor-cta relative px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-[-0.005em] transition-colors duration-[180ms] ease-out ${
                    isActive ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="products-filter-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.45)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-[2]">{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Counter — tabular, quiet, aligns with filter baseline */}
        <p className="text-[11px] text-white/40 tabular-nums uppercase tracking-[0.18em] font-medium whitespace-nowrap">
          <span className="text-white/85 font-bold">{filteredProducts.length}</span>
          <span className="ml-1.5">product{filteredProducts.length === 1 ? "" : "s"}</span>
        </p>
      </div>

      {/* Grid — gap-8 (32px) is the editorial rhythm for 3-col on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-32 flex flex-col items-center">
          {/* Geometric empty-state primitive — dashed circle per POLISH §10 */}
          <svg
            width="88"
            height="88"
            viewBox="0 0 88 88"
            fill="none"
            aria-hidden
            className="mb-6 opacity-60"
          >
            <circle
              cx="44"
              cy="44"
              r="38"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <circle
              cx="44"
              cy="44"
              r="18"
              stroke="rgba(249,115,22,0.28)"
              strokeWidth="1"
            />
          </svg>
          <p className="font-display text-2xl font-bold text-white/85 mb-2 tracking-[-0.01em]">Nothing in this slot.</p>
          <p className="text-[14px] text-white/50 max-w-xs leading-relaxed">
            Switch category, or check the full catalog.
          </p>
          <button
            onClick={() => setActiveCategory("all")}
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#f97316] hover:text-[#ff8a3a] transition-colors duration-[180ms] ease-out"
          >
            Show all
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  )
}
