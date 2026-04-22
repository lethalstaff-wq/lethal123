"use client"

import { Check, Crown, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { SectionEyebrow } from "@/components/section-eyebrow"

function AnimPrice({ value }: { value: number }) {
  const [count, setCount] = useState(value)
  const [animating, setAnimating] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        setAnimating(true)
        setCount(0)
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1500, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * value))
          if (p < 1) requestAnimationFrame(tick)
          else setCount(value)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])
  return <span ref={ref} className="tabular-nums">{animating ? count : value}</span>
}

const bundles = [
  { id: "dma-basic", name: "Basic", price: 425, features: ["Captain DMA 100T-7th", "EAC/BE Emulated", "Mini DP Fuser V2", "Blurred (30 Days)", "Macku (Free)"], description: "Reliable foundation for everyday use.", highlighted: false, premium: false },
  { id: "dma-advanced", name: "Advanced", price: 675, features: ["Captain DMA 100T-7th", "Dichen D60 Fuser", "Teensy (Firmware Included)", "EAC/BE Emulated Slotted", "Blurred DMA (Quarterly)"], description: "Balanced config for semi-pro gamers.", highlighted: true, premium: false },
  { id: "dma-elite", name: "Elite", price: 1500, features: ["Captain DMA 100T-7th", "Dichen DC500 Fuser", "Teensy (Firmware Included)", "Blurred Lifetime DMA Cheat", "EAC/BE, FaceIt, VGK Emulated"], description: "Maximum performance. Lifetime access.", highlighted: false, premium: true },
]

function BundleCard({ b, onAdd }: { b: typeof bundles[number]; onAdd: (b: typeof bundles[number]) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current; if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true); return
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true)
        setShown(true)
        obs.disconnect()
      }
    }, { threshold: 0.25 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty("--mx", `${x}px`)
    el.style.setProperty("--my", `${y}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`spotlight-card group rounded-2xl relative overflow-visible flex flex-col hover:-translate-y-1.5 ${
        b.premium
          ? "elite-card bg-white/[0.025] border border-white/[0.08] md:scale-[1.04] shadow-[0_0_60px_rgba(249,115,22,0.14)] hover:shadow-[0_0_120px_rgba(249,115,22,0.32)]"
          : b.highlighted
          ? "bg-white/[0.02] border-2 border-[#f97316]/25 shadow-[0_0_60px_rgba(249,115,22,0.08)] md:scale-[1.02] hover:shadow-[0_0_100px_rgba(249,115,22,0.18)]"
          : "bg-white/[0.012] border border-white/[0.04] hover:border-white/[0.08] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      }`}
      style={{
        transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        opacity: shown ? (visible ? 1 : 0) : 0,
      }}
    >
      {/* Animated conic border + shine — inside overflow-hidden wrapper so badges can stick out */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-[0]">
        {b.premium && (
          <div aria-hidden="true" className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-95 transition-opacity duration-500" style={{ background: "conic-gradient(from 0deg, transparent 0deg, #f97316 40deg, transparent 80deg, transparent 180deg, #fbbf24 220deg, transparent 260deg, transparent 360deg)", animation: "eliteRotate 8s linear infinite", mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", maskComposite: "exclude", WebkitMaskComposite: "xor", padding: "1.5px" }} />
        )}
        <div className="absolute top-[-50%] left-[-80%] w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent rotate-[25deg] group-hover:left-[130%] transition-[left] duration-700" />
      </div>
      {/* Top accent */}
      {b.highlighted && <div className="h-[2px] bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent relative z-[3]" />}

      {/* Popular badge — centered floating tab at top */}
      {b.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-[6]">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c] shadow-[0_8px_24px_rgba(249,115,22,0.45)] border border-[#fbbf24]/40">
            <Crown className="h-3 w-3 text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white">Popular</span>
          </div>
        </div>
      )}

      {/* Premium badge — centered floating tab at top (gold) */}
      {b.premium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-[6]">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full shadow-[0_8px_24px_rgba(251,191,36,0.45)] border border-[#fbbf24]/50" style={{ background: "linear-gradient(135deg, #fbbf24, #f97316)" }}>
            <Crown className="h-3 w-3 text-black" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black">Premium</span>
          </div>
        </div>
      )}

      <div className="p-8 sm:p-9 flex flex-col flex-1 relative z-[3]">
        {/* Name */}
        <div className="mb-6">
          <p className="text-[11px] text-white/55 uppercase tracking-[0.15em] mb-1">DMA Bundle</p>
          <h3 className="text-2xl font-bold text-white/90 tracking-tight">{b.name}</h3>
          <p className="text-[13px] text-white/55 mt-1">{b.description}</p>
        </div>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-baseline gap-1">
            <span className="text-[14px] text-white/65 font-bold self-start mt-3">£</span>
            <span className={`text-[52px] font-bold tracking-tight leading-none ${b.premium ? "" : "text-white/90"}`}
              style={b.premium ? { background: "linear-gradient(135deg, #fbbf24, #f97316, #c2410c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 30px rgba(249,115,22,0.45))" } : undefined}>
              <AnimPrice value={b.price} />
            </span>
          </div>
          <p className="text-[12px] text-white/55 mt-1">one-time payment</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.04] mb-7" />

        {/* Features with stagger — row highlight on hover */}
        <div className="space-y-2.5 mb-8 flex-1">
          {b.features.map((f, j) => (
            <div
              key={j}
              className={`group/row flex items-start gap-3 px-3 -mx-3 py-2 rounded-lg transition-colors duration-300 ${
                b.highlighted || b.premium ? "hover:bg-[#f97316]/[0.06]" : "hover:bg-white/[0.03]"
              }`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.45s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + j * 0.08}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + j * 0.08}s, background-color 0.3s ease`,
              }}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${
                  b.highlighted || b.premium
                    ? "bg-[#f97316]/12 group-hover/row:bg-[#f97316]/25 group-hover/row:shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                    : "bg-white/[0.03] group-hover/row:bg-white/[0.08]"
                }`}
              >
                <Check className={`h-3 w-3 ${b.highlighted || b.premium ? "text-[#f97316]" : "text-white/55"}`} />
              </div>
              <span className={`text-[14px] transition-colors ${b.highlighted || b.premium ? "text-white/70 group-hover/row:text-white" : "text-white/65 group-hover/row:text-white/85"}`}>{f}</span>
            </div>
          ))}
        </div>

        {/* Button with shine sweep — primary tier (Advanced = recommended) gets a larger button */}
        <button
          onClick={() => onAdd(b)}
          data-cursor="cta"
          data-cursor-label={b.premium ? "Elite" : b.highlighted ? "Get it" : "Add"}
          className={`cursor-cta press-spring group/btn w-full rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 relative z-[3] overflow-hidden ${
            b.highlighted ? "py-4 text-[16px]" : "py-3 text-[14px]"
          } ${
            b.highlighted || b.premium
              ? "text-white hover:brightness-110"
              : "border border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.06] hover:text-white"
          }`}
          style={b.premium ? { background: "linear-gradient(135deg, #fbbf24, #f97316, #ea580c)", boxShadow: "0 0 40px rgba(249, 115, 22, 0.51)" } : b.highlighted ? { background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 0 30px rgba(249, 115, 22, 0.32)" } : {}}
        >
          {/* Shine sweep */}
          <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
          <ShoppingCart className="relative z-10 h-4 w-4" />
          <span className="relative z-10">{b.premium ? "Claim Elite" : b.highlighted ? "Get Started" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  )
}

export function PricingSection() {
  const { addItem } = useCart()
  const router = useRouter()

  const handleAdd = (b: typeof bundles[number]) => {
    addItem({ id: b.id, name: `DMA ${b.name} Bundle`, price: b.price, product_id: b.id, is_lifetime: b.name === "Elite", duration_days: null, created_at: "", product: { id: b.id, name: `DMA ${b.name} Bundle`, slug: b.id, description: b.description, image_url: "/images/products/dma-firmware.png", image: "/images/products/dma-firmware.png", category: "bundle", created_at: "", updated_at: "" } } as any, 1)
    toast.success(`DMA ${b.name} Bundle added to cart`)
    router.push("/cart")
  }

  return (
    <section id="pricing" className="py-32 lg:py-40 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <SectionEyebrow number="04" label="DMA Bundles" />
          <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Choose your </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>package</span>
          </h2>
          <p className="text-white/55 text-[16px] max-w-md mx-auto">Complete setups with premium hardware. One purchase, everything included.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {bundles.map((b) => <BundleCard key={b.id} b={b} onAdd={handleAdd} />)}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[12px] text-white/55 mb-2">All bundles include discreet shipping and lifetime Discord support.</p>
          <Link href="/products" data-cursor="cta" data-cursor-label="All" className="cursor-cta inline-flex items-center gap-1.5 text-[13px] text-[#f97316]/55 hover:text-[#f97316] transition-colors">
            View all individual products →
          </Link>
        </div>
      </div>
      <style jsx>{`
        @keyframes eliteRotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
