"use client"

import { Shield, Zap, Cpu, RefreshCw, Headphones, Globe } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"

const features = [
  {
    icon: Shield,
    title: "Kernel-Level Dominance",
    description: "We operate at the system's deepest level. While others get detected, we stay invisible. Pure, undetected power.",
    stat: "99.8%",
    statLabel: "undetected",
  },
  {
    icon: Zap,
    title: "Zero-Hour Response",
    description: "Game updated? We're already on it. Average patch time is < 2 hours. We keep your win streak alive.",
    stat: "<2h",
    statLabel: "patch time",
  },
  {
    icon: Cpu,
    title: "Ghost Technology",
    description: "Every build is unique. Your software has its own digital signature, making signature-based bans impossible.",
    stat: "1k+",
    statLabel: "unique builds",
  },
  {
    icon: RefreshCw,
    title: "Live Protection",
    description: "Real-time threat detection and automatic updates ensure you're always ahead of detection systems.",
    stat: "24/7",
    statLabel: "monitoring",
  },
  {
    icon: Headphones,
    title: "Elite Support",
    description: "Dedicated team on Discord ready to handle anything. We don't sleep, you don't get detected.",
    stat: "<15min",
    statLabel: "response time",
  },
  {
    icon: Globe,
    title: "Worldwide Network",
    description: "Infrastructure on 6 continents. Discreet worldwide operations with full OPSEC.",
    stat: "30+",
    statLabel: "countries",
  },
]

export function ServicesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative grid-bg">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] -top-[200px] -left-[200px]" />
        <div className="absolute w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px] bottom-0 right-0" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Why choose <span className="gradient-text">Lethal</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Superior technology. Relentless execution. Absolute dominance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl glass hover:border-primary/40 transition-all card-hover card-glow-border"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary" style={{ textShadow: "0 0 20px rgba(239,111,41,0.3)" }}>
                    <AnimatedCounter value={feature.stat} />
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{feature.statLabel}</div>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
