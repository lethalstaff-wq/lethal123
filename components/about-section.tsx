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
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Top Sellers</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.1] mb-4">
            Featured <span className="about-text-orange">Products</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="about-card about-shine group block relative overflow-hidden rounded-2xl">
              {/* Slash-cut tag */}
              <div className="absolute top-5 left-0 z-10 px-4 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-black" style={{ background: "linear-gradient(135deg, #fbbf24, #f97316)", clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.43)" }}>
                {p.tag}
              </div>

              {/* Image */}
              <div className="relative h-52 overflow-hidden bg-black">
                <Image src={p.image} alt={p.name} fill className="object-contain p-6 group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                {/* Orange glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.17), transparent 60%)" }} />
              </div>

              {/* Info */}
              <div className="p-5 border-t border-white/[0.04]">
                <div className="flex items-center gap-1 mb-2.5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 gold-star" style={{ animationDelay: `${j * 0.12}s` }} />)}
                  <span className="text-[11px] text-white/35 ml-1.5 font-medium">({getProductReviewCount(p.slug)})</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-display font-bold text-[17px] text-white/90 group-hover:text-white transition-colors tracking-tight">{p.name}</h3>
                    <p className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">From</p>
                  </div>
                  <span className="font-display text-2xl font-bold text-[#f97316] tracking-tight">£{p.price}</span>
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
        .about-card { background: rgba(255,255,255,0.022); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s ease; }
        .about-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(249, 115, 22, 0.46); transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.5), 0 0 44px rgba(249, 115, 22, 0.17); }
        .about-shine { position: relative; overflow: hidden; }
        .about-shine::after { content: ""; position: absolute; top: -50%; left: -80%; width: 50%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent); transform: rotate(25deg); transition: left 0.7s ease; pointer-events: none; z-index: 5; }
        .about-shine:hover::after { left: 130%; }
        .about-ghost { border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.55); transition: all 0.2s ease; }
        .about-ghost:hover { border-color: rgba(249, 115, 22, 0.51); background: rgba(249, 115, 22, 0.09); color: #fff; }
      `}</style>
    </section>
  )
}
