"use client"

import { Button } from "@/components/ui/button"
import { Check, Crown, ArrowRight, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"

const bundles = [
  {
    id: "dma-basic",
    name: "DMA Basic Bundle",
    price: 425,
    features: ["Captain DMA 100T-7th", "EAC/BE Emulated", "Mini DP Fuser V2", "Blurred (30 Days)", "Macku (Free)"],
    description: "Reliable foundation for everyday use.",
    highlighted: false,
  },
  {
    id: "dma-advanced",
    name: "DMA Advanced Bundle",
    price: 675,
    features: [
      "Captain DMA 100T-7th",
      "Dichen D60 Fuser",
      "Teensy (Firmware Included)",
      "EAC/BE Emulated Slotted",
      "Blurred DMA (Quarterly)",
    ],
    description: "Balanced config for semi-pro gamers.",
    highlighted: true,
  },
  {
    id: "dma-elite",
    name: "DMA Elite Bundle",
    price: 1500,
    features: [
      "Captain DMA 100T-7th",
      "Dichen DC500 Fuser",
      "Teensy (Firmware Included)",
      "Blurred Lifetime DMA Cheat",
      "EAC/BE, FaceIt, VGK Emulated",
    ],
    description: "Maximum performance. Lifetime access.",
    highlighted: false,
  },
]

function AnimatedPrice({ price, visible }: { price: number; visible: boolean }) {
  const [displayed, setDisplayed] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!visible || hasAnimated.current) return
    hasAnimated.current = true
    const duration = 1200
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * price))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, price])

  return <span>£{displayed}</span>
}

export function PricingSection() {
  const { addItem } = useCart()
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const handleAddToCart = (bundle: (typeof bundles)[0]) => {
    addItem(
      {
        id: bundle.id,
        name: bundle.name,
        price: bundle.price,
        product_id: bundle.id,
        is_lifetime: bundle.name.toLowerCase().includes("lifetime"),
        duration_days: null,
        created_at: "",
        product: {
          id: bundle.id,
          name: bundle.name,
          slug: bundle.id,
          description: bundle.description,
          image_url: "/images/products/dma-firmware.png",
          image: "/images/products/dma-firmware.png",
          category: "bundle",
          created_at: "",
          updated_at: "",
        },
      },
      1
    )
    toast.success(`${bundle.name} added to cart`)
    router.push("/cart")
  }

  return (
    <section ref={sectionRef} id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative pricing-noise">
      {/* Background blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#EF6F29]/8 rounded-full blur-[140px] top-0 -left-[200px]" />
        <div className="absolute w-[400px] h-[400px] bg-[#FFB347]/8 rounded-full blur-[140px] bottom-0 -right-[150px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EF6F29]/10 border border-[#EF6F29]/20 text-[#EF6F29] text-sm font-medium mb-6">
            <Crown className="h-4 w-4" />
            <span>Complete Bundles</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Choose your <span className="gradient-text">package</span>
          </h2>
          <p className="text-[#999] text-lg max-w-xl mx-auto">
            Complete DMA setups with premium hardware and cheats. All prices in GBP.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {bundles.map((bundle, index) => (
            <div
              key={bundle.id}
              className={`pricing-card relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
                isVisible ? "pricing-card-enter" : "opacity-0"
              } ${
                bundle.highlighted
                  ? "gradient-border-popular popular-glow md:scale-[1.04] bg-[#1a1a1a]"
                  : "bg-[#1a1a1a] border border-[rgba(239,111,41,0.15)] hover:border-[rgba(239,111,41,0.4)] hover:shadow-[0_0_30px_rgba(239,111,41,0.08)]"
              }`}
              style={{ animationDelay: isVisible ? `${0.1 + index * 0.15}s` : undefined }}
            >
              {/* Top accent bar */}
              {bundle.highlighted && (
                <div className="h-1 bg-gradient-to-r from-[#EF6F29] via-[#FFB347] to-[#EF6F29]" />
              )}

              {/* Popular badge */}
              {bundle.highlighted && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[#EF6F29] to-[#FF8C42] text-white px-6 py-2 rounded-b-xl text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-[#EF6F29]/30 uppercase">
                    <Crown className="h-3.5 w-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
                {/* Name + Description */}
                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-bold text-white mb-1">{bundle.name}</h3>
                  <p className="text-sm text-[#666]">{bundle.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[3rem] font-extrabold text-white leading-none">
                      <AnimatedPrice price={bundle.price} visible={isVisible} />
                    </span>
                  </div>
                  <span className="text-sm text-[#666] mt-1 block">one-time payment</span>
                </div>

                <div className="h-px bg-white/[0.06] mb-6" />

                {/* Features */}
                <ul className="space-y-3.5 mb-8 flex-1">
                  {bundle.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="check-icon mt-0.5 flex-shrink-0 rounded-full p-1 bg-[#EF6F29]/10">
                        <Check className="h-3.5 w-3.5 text-[#EF6F29]" />
                      </div>
                      <span className="text-sm text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {bundle.highlighted ? (
                  <Button
                    onClick={() => handleAddToCart(bundle)}
                    size="lg"
                    className="w-full h-13 gap-2 font-bold rounded-xl bg-gradient-to-r from-[#EF6F29] to-[#FF8C42] text-white shadow-lg shadow-[#EF6F29]/25 hover:shadow-xl hover:shadow-[#EF6F29]/35 hover:brightness-110 transition-all duration-300 btn-glow"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <button
                    onClick={() => handleAddToCart(bundle)}
                    className="w-full h-13 gap-2 font-bold rounded-xl btn-ghost-orange flex items-center justify-center text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#666] mb-2">
            All bundles include discreet shipping and lifetime Discord support.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-[#EF6F29] font-medium hover:underline"
          >
            View all individual products
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
