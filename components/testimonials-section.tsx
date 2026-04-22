"use client"

import { memo } from "react"
import { Star, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTotalReviewCount } from "@/lib/review-counts"
import { SectionEyebrow } from "@/components/section-eyebrow"

const testimonials = [
  { quote: "Zero detections in 3 months. Support helped me config everything in 10 min on discord.", name: "zk", role: "FN Ranked" },
  { quote: "Best aimbot ive ever used. 3 months straight zero detections. Actually goated team.", name: "vex", role: "Valorant" },
  { quote: "Perm spoofer saved my main after hwid ban. Fixed everything in 5 min. Worth every penny.", name: "rxn", role: "Warzone" },
  { quote: "DMA elite bundle setup took 20 min with discord support. Everything works out the box.", name: "ty1er", role: "FN Competitive" },
  { quote: "Temp spoofer for a month, not a single issue. Instant delivery. Way cheaper than others.", name: "drix", role: "CoD" },
  { quote: "Switched from another provider. Night and day difference. Blurred DMA is so smooth.", name: "kev", role: "PUBG" },
  { quote: "Support team helped me at 3am on a sunday. Thats the kind of service that keeps me coming back.", name: "dxn", role: "R6 Siege" },
  { quote: "Custom firmware is 100% worth it. Running eac bypass for 6 weeks without a single issue.", name: "mikez", role: "Rust" },
  { quote: "Was scared to buy but this actually works perfectly. Playing on main for 2 months no problems.", name: "jx", role: "Fortnite" },
  { quote: "Streck for a budget setup performs way above what I expected for the price. Great entry option.", name: "chrxs", role: "CS2" },
  { quote: "Bought the elite bundle after getting tired of cheap ones. Never going back. Worth it.", name: "neo", role: "Valorant" },
  { quote: "ESP is clean as hell. No flicker, no lag, just works. Other providers are a joke compared.", name: "fxz", role: "Apex" },
  { quote: "Setup was easier than I thought. Discord guy walked me through everything step by step.", name: "skyy", role: "Fortnite" },
  { quote: "Been using perm spoofer for 8 months. Zero problems. Got banned everywhere before this.", name: "rav", role: "COD MW3" },
  { quote: "DMA build is a beast. Finally can play faceit again without worrying about anything.", name: "mxt", role: "CS2" },
  { quote: "Bought on sale, got a free month extension. Small thing but it actually meant a lot.", name: "zyr", role: "Warzone" },
  { quote: "Update dropped 2h after the new patch. These guys don't sleep. 10/10 speed.", name: "lun", role: "R6" },
  { quote: "Aimbot smoothness is something else. Looks human even at 100% strength. Love it.", name: "bixy", role: "Valorant" },
  { quote: "Switched my squad to this. All 4 of us undetected for 5 months now. Insane.", name: "qnx", role: "Fortnite" },
  { quote: "Temp spoofer is perfect for my use case. Cheap, fast, does exactly what I need.", name: "ezr", role: "Apex" },
  { quote: "Had one issue on setup, refunded within 10 minutes when they couldnt fix fast enough.", name: "mia", role: "CS2" },
  { quote: "Streck is underrated. Running it on 4 accounts, never had a single ban.", name: "vok", role: "COD" },
  { quote: "Honestly thought these sites were scams. Proven wrong. Best purchase this year.", name: "raxo", role: "Valorant" },
  { quote: "Custom firmware works on my weird mobo setup. Their devs even helped me debug. Wild support.", name: "ash", role: "Warzone" },
  { quote: "Lifetime license pays for itself in 3 months vs monthly fees elsewhere. Math checks out.", name: "knr", role: "Fortnite" },
  { quote: "Played ranked 500+ hours with this. Never queue dodged, never flagged. Clean as.", name: "dri", role: "R6" },
  { quote: "ESP through walls is crazy accurate. Item pings, player distances, everything you need.", name: "hxt", role: "PUBG" },
  { quote: "Got my hwid reset in 24h after a ban elsewhere. Back in-game same day.", name: "viq", role: "Valorant" },
  { quote: "The blurred DMA setup guide on their site is better than most tutorials. Clear, detailed.", name: "pmz", role: "CS2" },
  { quote: "Bought on friday evening, got access in 8 minutes. Actual instant delivery for once.", name: "eno", role: "Apex" },
  { quote: "Been in the scene 6 years. This is easily top 2 providers right now. Maybe top 1.", name: "ywn", role: "Fortnite" },
  { quote: "Customer since day 1. They only got better. Features I never even asked for keep dropping.", name: "trx", role: "COD" },
  { quote: "Lost my discord token last week. They re-issued in 5 min. Zero questions asked.", name: "flx", role: "Valorant" },
  { quote: "Streaming friendly overlays are a game changer. Recording demos without showing anything.", name: "orb", role: "R6" },
  { quote: "Price is fair for what you get. Tried cheaper. Got banned in a week. Came back here.", name: "zan", role: "Warzone" },
]

const AVATAR_GRADIENTS = [
  ["#f97316", "#7c2d12"],
  ["#3b82f6", "#1e3a5f"],
  ["#8b5cf6", "#4a0080"],
  ["#22c55e", "#0a3d2c"],
  ["#ec4899", "#7c2d4f"],
  ["#fbbf24", "#7c5800"],
  ["#06b6d4", "#0a3d4d"],
] as const

const ReviewCard = memo(function ReviewCard({ t }: { t: typeof testimonials[number] }) {
  const grad = AVATAR_GRADIENTS[(t.name.charCodeAt(0) + t.name.length) % AVATAR_GRADIENTS.length]
  return (
    <div className="spotlight-card w-full rounded-2xl p-5 bg-white/[0.015] border border-white/[0.06] hover:border-[#f97316]/30 hover:bg-white/[0.03] transition-colors duration-300">
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-[#f97316] text-[#f97316]" />)}
      </div>
      <p className="text-[13px] text-white/60 leading-[1.7] mb-4">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-3 border-t border-white/[0.05]">
        <div
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
          style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 0 10px ${grad[0]}30` }}
        >
          {t.name[0].toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-white">{t.name}</p>
          <p className="text-[9px] text-[#f97316]/70 font-medium uppercase tracking-[0.12em]">{t.role}</p>
        </div>
      </div>
    </div>
  )
})

function VerticalColumn({ items, reverse, speed = 40 }: { items: typeof testimonials; reverse?: boolean; speed?: number }) {
  return (
    <div className="group relative overflow-hidden h-[680px]">
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `${reverse ? "scrollUp" : "scrollDown"} ${speed}s linear infinite`,
          animationPlayState: "running",
        }}
      >
        {items.map((t, i) => <ReviewCard key={`a-${i}`} t={t} />)}
        {items.map((t, i) => <ReviewCard key={`b-${i}`} t={t} />)}
      </div>
      <style jsx>{`
        .group:hover > div:first-child {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

export function TestimonialsSection() {
  const total = getTotalReviewCount()
  // Split testimonials into 3 groups
  const col1 = testimonials.filter((_, i) => i % 3 === 0)
  const col2 = testimonials.filter((_, i) => i % 3 === 1)
  const col3 = testimonials.filter((_, i) => i % 3 === 2)

  return (
    <section id="reviews" className="py-32 lg:py-40 overflow-hidden relative z-10">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 mb-14">
        <div className="text-center">
          <SectionEyebrow number="05" label="Customer Reviews" />
          <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>What our </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>customers</span>
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> say</span>
          </h2>
          <p className="text-white/55 text-[16px] max-w-lg mx-auto mb-6">Trusted by hundreds of competitive gamers worldwide.</p>
          <Link href="/reviews" data-cursor="cta" data-cursor-label="All" className="cursor-cta press-spring inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[13px] font-bold text-white/65 hover:text-[#f97316] hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.06] transition-all">
            <Star className="h-3.5 w-3.5" /> Read all {total} reviews <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div
        className="relative max-w-[1400px] mx-auto px-6 sm:px-10"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VerticalColumn items={col1} speed={50} />
          <VerticalColumn items={col2} reverse speed={60} />
          <VerticalColumn items={col3} speed={55} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </section>
  )
}
