"use client"

import { Button } from "@/components/ui/button"
import { Check, Crown, ArrowRight, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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

export function PricingSection() {
  const { addItem } = useCart()
  const router = useRouter()

  const handleAddToCart = (bundle: typeof bundles[0]) => {
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
      1,
    )
    toast.success(`${bundle.name} added to cart`)
    router.push("/cart")
  }

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative grid-bg">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] top-0 -left-[200px]" />
        <div className="absolute w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] bottom-0 -right-[150px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Crown className="h-4 w-4" />
            <span>Complete Bundles</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Choose your <span className="gradient-text">package</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Complete DMA setups with premium hardware and cheats. All prices in GBP.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative flex flex-col rounded-2xl transition-all duration-300 card-hover overflow-hidden ${
                bundle.highlighted
                  ? "glass border-2 border-primary/50 scale-[1.02] neon-glow"
                  : "glass hover:border-primary/40"
              }`}
            >
              {/* Top accent */}
              {bundle.highlighted && (
                <div className="h-1 bg-gradient-to-r from-primary to-accent" />
              )}
              
              {/* Popular badge */}
              {bundle.highlighted && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-b-xl text-xs font-bold flex items-center gap-1.5">
                    <Crown className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
                {/* Name */}
                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-bold mb-1">{bundle.name}</h3>
                  <p className="text-sm text-muted-foreground">{bundle.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">£{bundle.price}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">one-time payment</span>
                </div>

                <div className="h-px bg-border/50 mb-6" />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {bundle.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0 rounded-full p-1 bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleAddToCart(bundle)}
                  size="lg"
                  className={`w-full h-12 gap-2 font-semibold rounded-xl ${
                    bundle.highlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            All bundles include discreet shipping and lifetime Discord support.
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            View all individual products
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
