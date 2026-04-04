"use client"

import { ShoppingCart, CreditCard, Zap } from "lucide-react"

const steps = [
  {
    icon: ShoppingCart,
    title: "Browse & Select",
    description: "Explore our range of DMA hardware, premium cheats, and HWID spoofers.",
    number: "01",
  },
  {
    icon: CreditCard,
    title: "Place Your Order",
    description: "Open a ticket on our Discord server. Our team processes orders securely and quickly.",
    number: "02",
  },
  {
    icon: Zap,
    title: "Setup & Play",
    description: "Instant delivery for digital products with full setup support. Hardware ships in 24h.",
    number: "03",
  },
]

export function ProcessSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            How it <span className="text-primary">works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps to get started with Lethal Solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, index) => (
            <div key={step.number} className="group relative">
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                {/* Number */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {step.number}
                  </div>
                  <step.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Connector arrow on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3.5 -translate-y-1/2 z-10 text-border">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2L8 6L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
