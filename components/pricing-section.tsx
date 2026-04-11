"use client"

import { Check, Crown, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"

function AnimPrice({ value }: { value: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1500, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * value))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])
  return <span ref={ref} className="tabular-nums">{count}</span>
}

const bundles = [
  { id: "dma-basic", name: "Basic", price: 425, features: ["Captain DMA 100T-7th", "EAC/BE Emulated", "Mini DP Fuser V2", "Blurred (30 Days)", "Macku (Free)"], description: "Reliable foundation for everyday use.", highlighted: false },
  { id: "dma-advanced", name: "Advanced", price: 675, features: ["Captain DMA 100T-7th", "Dichen D60 Fuser", "Teensy (Firmware Included)", "EAC/BE Emulated Slotted", "Blurred DMA (Quarterly)"], description: "Balanced config for semi-pro gamers.", highlighted: true },
  { id: "dma-elite", name: "Elite", price: 1500, features: ["Captain DMA 100T-7th", "Dichen DC500 Fuser", "Teensy (Firmware Included)", "Blurred Lifetime DMA Cheat", "EAC/BE, FaceIt, VGK Emulated"], description: "Maximum performance. Lifetime access.", highlighted: false },
]

export function PricingSection() {
  const { addItem } = useCart()
  const router = useRouter()

  const handleAdd = (b: typeof bundles[number]) => {
    addItem({ id: b.id, name: `DMA ${b.name} Bundle`, price: b.price, product_id: b.id, is_lifetime: b.name === "Elite", duration_days: null, created_at: "", product: { id: b.id, name: `DMA ${b.name} Bundle`, slug: b.id, description: b.description, image_url: "/images/products/dma-firmware.png", image: "/images/products/dma-firmware.png", category: "bundle", created_at: "", updated_at: "" } } as any, 1)
    toast.success(`DMA ${b.name} Bundle added to cart`)
    router.push("/cart")
  }

  return (
    <section id="pricing" className="py-28 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
            <Crown className="h-3.5 w-3.5 text-white/20" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">DMA Bundles</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4 text-white">
            Choose your <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>package</span>
          </h2>
          <p className="text-white/30 text-[15px] max-w-md mx-auto">Complete setups with premium hardware. One purchase, everything included.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {bundles.map((b) => (
            <div key={b.id} className={`group rounded-2xl relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 ${
              b.highlighted
                ? "bg-white/[0.02] border-2 border-[#f97316]/20 shadow-[0_0_60px_rgba(249,115,22,0.04)] md:scale-[1.03] hover:shadow-[0_0_80px_rgba(249,115,22,0.06)]"
                : "bg-white/[0.012] border border-white/[0.04] hover:border-white/[0.08] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            }`}>
              {/* Shine sweep */}
              <div className="absolute top-[-50%] left-[-80%] w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.015] to-transparent rotate-[25deg] group-hover:left-[130%] transition-[left] duration-700 pointer-events-none z-10" />
              {/* Top accent */}
              {b.highlighted && <div className="h-[2px] bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent" />}

              {/* Popular badge */}
              {b.highlighted && (
                <div className="absolute top-5 right-5 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f97316]/10 border border-[#f97316]/20">
                    <Crown className="h-3 w-3 text-[#f97316]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#f97316]">Popular</span>
                  </div>
                </div>
              )}

              <div className="p-8 sm:p-9 flex flex-col flex-1">
                {/* Name */}
                <div className="mb-6">
                  <p className="text-[11px] text-white/20 uppercase tracking-[0.15em] mb-1">DMA Bundle</p>
                  <h3 className="text-2xl font-bold text-white/90">{b.name}</h3>
                  <p className="text-[13px] text-white/25 mt-1">{b.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] text-white/20 font-medium self-start mt-3">£</span>
                    <span className="text-[52px] font-bold text-white/90 tracking-tight leading-none"><AnimPrice value={b.price} /></span>
                  </div>
                  <p className="text-[12px] text-white/15 mt-1">one-time payment</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.04] mb-7" />

                {/* Features */}
                <div className="space-y-4 mb-8 flex-1">
                  {b.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${b.highlighted ? "bg-[#f97316]/10" : "bg-white/[0.03]"}`}>
                        <Check className={`h-3 w-3 ${b.highlighted ? "text-[#f97316]/70" : "text-white/25"}`} />
                      </div>
                      <span className="text-[14px] text-white/50">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button onClick={() => handleAdd(b)}
                  className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 ${
                    b.highlighted
                      ? "text-white"
                      : "border border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/70 hover:bg-white/[0.03]"
                  }`}
                  style={b.highlighted ? { background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 0 30px rgba(249,115,22,0.2)" } : {}}>
                  <ShoppingCart className="h-4 w-4" />
                  {b.highlighted ? "Get Started" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[12px] text-white/15 mb-2">All bundles include discreet shipping and lifetime Discord support.</p>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-[13px] text-[#f97316]/50 hover:text-[#f97316] transition-colors">
            View all individual products →
          </Link>
        </div>
      </div>
    </section>
  )
}
