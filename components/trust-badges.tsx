"use client"

import { Shield, Users, Clock, Zap, Award, Lock } from "lucide-react"

const BADGES = [
  {
    icon: Shield,
    value: "100%",
    label: "Secure Payments",
    color: "text-emerald-500"
  },
  {
    icon: Users,
    value: "10,000+",
    label: "Happy Customers",
    color: "text-blue-500"
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Support Available",
    color: "text-purple-500"
  },
  {
    icon: Zap,
    value: "Instant",
    label: "Delivery",
    color: "text-amber-500"
  },
  {
    icon: Award,
    value: "5 Years",
    label: "Experience",
    color: "text-primary"
  },
  {
    icon: Lock,
    value: "SSL",
    label: "Encrypted",
    color: "text-cyan-500"
  }
]

export function TrustBadges() {
  return (
    <section className="py-12 border-y border-border/30 bg-muted/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {BADGES.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div key={index} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <Icon className={`h-5 w-5 ${badge.color}`} />
                </div>
                <div>
                  <p className="font-black text-foreground text-lg leading-none">{badge.value}</p>
                  <p className="text-xs text-muted-foreground">{badge.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
