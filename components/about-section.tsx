"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductReviewCount } from "@/lib/review-counts"

const featuredProducts = [
  {
    name: "Perm Spoofer",
    image: "/images/products/perm-spoofer.png",
    price: 35,
    slug: "perm-spoofer",
    tag: "Best Seller",
  },
  {
    name: "Blurred DMA",
    image: "/images/products/blurred-dma.png",
    price: 22,
    slug: "blurred",
    tag: "Popular",
  },
  {
    name: "DMA Elite Bundle",
    image: "/images/products/dma-firmware.png",
    price: 1500,
    slug: "dma-elite",
    tag: "Premium",
  },
]

export function AboutSection() {
  return (
    <section id="products" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -top-40 -left-40" />
        <div className="absolute w-[300px] h-[300px] bg-accent/10 rounded-full blur-[120px] bottom-20 right-20" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Top Sellers</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Featured <span className="gradient-text">Products</span>
            </h2>
          </div>
          <Link href="/products">
            <Button variant="outline" size="lg" className="gap-2 group border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl">
              View All Products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product, index) => (
            <Link key={index} href={`/products/${product.slug}`} className="group">
              <div className="relative rounded-2xl glass overflow-hidden card-hover hover:border-primary/40 card-glow-border hover:shadow-2xl hover:shadow-primary/10">
                {/* Tag */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground shadow-lg">
                    {product.tag}
                  </span>
                </div>

                {/* Image */}
                <div className="relative h-56 bg-gradient-to-b from-muted/20 to-transparent flex items-center justify-center p-8 shine-effect">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={320}
                    height={200}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain max-h-44 w-auto group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="p-6 border-t border-border/50">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">{getProductReviewCount(product.slug)} reviews</span>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">From</p>
                      <p className="text-2xl font-bold mt-0.5">£{product.price}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
