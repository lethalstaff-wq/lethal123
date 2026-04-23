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
    color: "text-[#f97316]"
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
    <section className="py-12 border-y border-white/[0.06] bg-white/[0.015]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {BADGES.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div key={index} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-[#f97316]/30 transition-colors">
                  <Icon className={`h-5 w-5 ${badge.color}`} />
                </div>
                <div>
                  <p className="font-black text-white text-lg leading-none">{badge.value}</p>
                  <p className="text-xs text-white/55">{badge.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
