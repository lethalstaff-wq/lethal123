"use client"

import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductReviewCount } from "@/lib/review-counts"

const products = [
  { name: "Perm Spoofer", image: "/images/products/perm-spoofer.png", price: 35, slug: "perm-spoofer", tag: "Best Seller" },
  { name: "Blurred DMA", image: "/images/products/blurred-dma.png", price: 22, slug: "blurred", tag: "Popular" },
  { name: "DMA Elite Bundle", image: "/images/products/dma-firmware.png", price: 1500, slug: "dma-elite", tag: "Premium" },
]

export function AboutSection() {
  return (
    <section id="products" className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Top Sellers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4">
            Featured <span className="about-text-orange">Products</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="about-card about-shine group block relative overflow-hidden rounded-xl">
              {/* Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#f97316]/10 border border-[#f97316]/15 text-[#f97316]/80">{p.tag}</span>
              </div>

              {/* Image */}
              <div className="relative h-52 overflow-hidden bg-white/[0.01]">
                <Image src={p.image} alt={p.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-5 border-t border-white/[0.04]">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-[#fbbf24] text-[#fbbf24]" />)}
                  <span className="text-[11px] text-white/25 ml-1">({getProductReviewCount(p.slug)})</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-bold text-[16px] text-white/85 group-hover:text-white transition-colors">{p.name}</h3>
                    <p className="text-[10px] text-white/20 mt-1">From</p>
                  </div>
                  <span className="text-xl font-bold text-[#f97316]">£{p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/products" className="about-ghost px-6 py-3 rounded-xl text-[13px] font-semibold inline-flex items-center gap-2 group">
            View All Products <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .about-text-orange { background: linear-gradient(135deg, #f97316, #fb923c, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .about-card { background: rgba(255,255,255,0.012); border: 1px solid rgba(255,255,255,0.04); transition: all 0.3s ease; }
        .about-card:hover { background: rgba(255,255,255,0.025); border-color: rgba(255,255,255,0.08); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .about-shine { position: relative; overflow: hidden; }
        .about-shine::after { content: ""; position: absolute; top: -50%; left: -80%; width: 50%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent); transform: rotate(25deg); transition: left 0.7s ease; pointer-events: none; z-index: 5; }
        .about-shine:hover::after { left: 130%; }
        .about-ghost { border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.015); color: rgba(255,255,255,0.4); transition: all 0.2s ease; }
        .about-ghost:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.7); }
      `}</style>
    </section>
  )
}
