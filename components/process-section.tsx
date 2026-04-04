"use client"

import { ShoppingCart, CreditCard, Zap, Clock } from "lucide-react"

const steps = [
  {
    icon: ShoppingCart,
    title: "Choose Your Edge",
    description: "Pick from DMA cheats, external software, HWID spoofers, or complete hardware bundles.",
    number: "01",
    time: "2 min",
    color: "text-blue-400 bg-blue-400/10",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Pay with crypto or PayPal. All transactions are encrypted and your identity stays private.",
    number: "02",
    time: "1 min",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Zap,
    title: "Play Instantly",
    description: "License key and download delivered to your email in seconds. Full setup support on Discord.",
    number: "03",
    time: "30 sec",
    color: "text-emerald-400 bg-emerald-400/10",
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
            From checkout to gameplay in under 4 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

          {steps.map((step, index) => (
            <div key={step.number} className="group relative z-10">
              <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-7 hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 h-full">
                {/* Number + time */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform duration-300`}>
                    {step.number}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground">{step.time}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
