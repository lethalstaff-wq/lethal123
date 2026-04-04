"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { PRODUCTS } from "@/lib/products"

const STORAGE_KEY = "recently_viewed"
const MAX_ITEMS = 6

export function trackProductView(productId: string) {
  if (typeof window === "undefined") return
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[]
    const filtered = stored.filter((id) => id !== productId)
    filtered.unshift(productId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS + 1)))
  } catch { /* ignore */ }
}

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [productIds, setProductIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[]
      // Exclude current product
      setProductIds(stored.filter((id) => id !== currentProductId).slice(0, 4))
    } catch { /* ignore */ }
  }, [currentProductId])

  const products = productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as typeof PRODUCTS

  if (products.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-border/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Recently Viewed
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group rounded-xl border border-border/40 bg-card/40 p-4 hover:border-primary/30 hover:bg-card/60 transition-all"
          >
            <div className="relative h-24 mb-3 flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                width={100}
                height={80}
                className="object-contain max-h-20 w-auto group-hover:scale-105 transition-transform"
              />
            </div>
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From £{(Math.min(...product.variants.map((v) => v.priceInPence)) / 100).toFixed(0)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
