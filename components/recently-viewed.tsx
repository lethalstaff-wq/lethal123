"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock } from "lucide-react"
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
      setProductIds(stored.filter((id) => id !== currentProductId).slice(0, 4))
    } catch { /* ignore */ }
  }, [currentProductId])

  const products = productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as typeof PRODUCTS

  if (products.length < 2) return null

  return (
    <section className="mt-16 pt-10 border-t border-white/[0.06]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316]/25 to-[#ea580c]/15 border border-[#f97316]/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(249,115,22,0.18)]">
            <Clock className="h-[18px] w-[18px] text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.55))" }} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-white">Recently viewed</h3>
            <p className="text-[12px] text-white/65 mt-0.5">Pick up where you left off</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((product) => {
          const fromPrice = Math.min(...product.variants.map((v) => v.priceInPence)) / 100
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 hover:border-[#f97316]/25 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(249,115,22,0.08)] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#f97316]/0 to-transparent group-hover:via-[#f97316]/50 transition-all duration-500" />
              <div className="relative h-20 mb-3 flex items-center justify-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={100}
                  height={80}
                  className="object-contain max-h-16 w-auto group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="font-display text-[13.5px] font-bold text-white truncate tracking-tight group-hover:text-[#f97316] transition-colors">
                {product.name}
              </p>
              <p className="text-[11px] text-white/55 mt-1">
                From <span className="text-white font-bold tabular-nums">£{fromPrice.toFixed(0)}</span>
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
