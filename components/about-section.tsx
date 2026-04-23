"use client"

import { useRef } from "react"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductReviewCount } from "@/lib/review-counts"
import { SectionEyebrow } from "@/components/section-eyebrow"

const products = [
  { name: "Perm Spoofer", image: "/images/products/perm-spoofer.png", price: 35, slug: "perm-spoofer", tag: "Best Seller" },
  { name: "Blurred DMA", image: "/images/products/blurred-dma.png", price: 22, slug: "blurred", tag: "Popular" },
  { name: "DMA Elite Bundle", image: "/images/products/dma-firmware.png", price: 1500, slug: "dma-elite", tag: "Premium" },
]

function ProductCard({ p }: { p: typeof products[number] }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty("--mx", `${x}px`)
    el.style.setProperty("--my", `${y}px`)

    // Subtle image tilt (6deg max) based on cursor offset
    const iw = imgWrapRef.current
    if (iw) {
      const nx = (x / rect.width) - 0.5
      const ny = (y / rect.height) - 0.5
      iw.style.setProperty("--rx", `${(-ny * 6).toFixed(2)}deg`)
      iw.style.setProperty("--ry", `${(nx * 6).toFixed(2)}deg`)
    }
  }

  const onLeave = () => {
    const iw = imgWrapRef.current
    if (iw) {
      iw.style.setProperty("--rx", "0deg")
      iw.style.setProperty("--ry", "0deg")
    }
  }

  return (
    <Link
      ref={ref}
      href={`/products/${p.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor="cta"
      data-cursor-label="View"
      className="spotlight-card about-card about-shine cursor-cta group block relative overflow-hidden rounded-2xl"
      style={{ perspective: "900px" }}
    >
      {/* Slash-cut tag */}
      <div className="absolute top-5 left-0 z-[3] px-4 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-black" style={{ background: "linear-gradient(135deg, #fbbf24, #f97316)", clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.43)" }}>
        {p.tag}
      </div>

      {/* Live stock indicator — top-right of card */}
      <div className="absolute top-5 right-5 z-[3] inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-emerald-500/25">
        <span className="relative flex items-center justify-center">
          <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-ping" />
          <span className="relative w-1 h-1 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300/85">In stock</span>
      </div>

      {/* Image with mousemove tilt — no solid bg, card glass shows through */}
      <div
        ref={imgWrapRef}
        className="relative h-52 overflow-hidden"
        style={{
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transformStyle: "preserve-3d",
          transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Soft orange radial behind product to replace the old flat black */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.10), transparent 70%)",
          }}
        />
        <Image
          src={p.image}
          alt={p.name}
          fill
          className="object-contain p-6 ken-burns relative z-[1]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Subtle bottom fade into the info panel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-5 border-t border-white/[0.04] relative z-[3]">
        <div className="flex items-center gap-1 mb-2.5">
          {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 gold-star" style={{ animationDelay: `${j * 0.12}s` }} />)}
          <span className="text-[11px] text-white/35 ml-1.5 font-medium">({getProductReviewCount(p.slug)})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-display font-bold text-[17px] text-white/90 group-hover:text-white transition-colors tracking-tight">{p.name}</h3>
            <p className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">From</p>
          </div>
          <span
            className="font-display text-2xl font-bold text-[#f97316] tracking-tight transition-all duration-500"
            style={{ filter: "drop-shadow(0 0 0 rgba(249,115,22,0))" }}
          >
            £{p.price}
          </span>
        </div>
        {/* Progress arrow — fills on hover */}
        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35 group-hover:text-[#f97316] transition-colors">
          <span className="relative h-px flex-1 bg-white/[0.06] overflow-hidden">
            <span className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-[#f97316] to-[#fbbf24] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{ transformOrigin: "left" }} />
          </span>
          <span>View</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <style jsx>{`
        .about-card:hover .text-\\[\\#f97316\\] { filter: drop-shadow(0 0 18px rgba(249,115,22,0.6)); }
      `}</style>
    </Link>
  )
}

export function AboutSection() {
  return (
    <section id="products" className="py-32 lg:py-40 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionEyebrow number="01" label="Top Sellers" />
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.1] mb-4">
            Featured <span className="about-text-orange">Products</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>

        <div className="text-center mt-10">
          <Link href="/products" data-cursor="cta" data-cursor-label="All" className="cursor-cta about-ghost px-6 py-3 rounded-xl text-[13px] font-semibold inline-flex items-center gap-2 group press-spring">
            View All Products <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .about-text-orange { background: linear-gradient(135deg, #f97316, #fb923c, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .about-card { background: rgba(255,255,255,0.022); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.06); transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.25s cubic-bezier(0.22,1,0.36,1); }
        .about-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(249, 115, 22, 0.55); transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 50px rgba(249, 115, 22, 0.2); }
        .about-shine::after { content: ""; position: absolute; top: -50%; left: -80%; width: 50%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent); transform: rotate(25deg); transition: left 0.7s ease; pointer-events: none; z-index: 4; }
        .about-shine:hover::after { left: 130%; }
        .about-ghost { border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.55); transition: all 0.2s ease; }
        .about-ghost:hover { border-color: rgba(249, 115, 22, 0.51); background: rgba(249, 115, 22, 0.09); color: #fff; }
      `}</style>
    </section>
  )
}
