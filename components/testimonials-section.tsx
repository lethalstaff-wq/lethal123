"use client"

import { memo } from "react"
import { Star, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTotalReviewCount } from "@/lib/review-counts"

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
]

// Pick a per-name gradient so avatar colors look chosen, not random
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
    <div className="spotlight-card flex-shrink-0 w-[280px] sm:w-[340px] rounded-2xl p-6 bg-white/[0.015] border border-white/[0.06] hover:border-[#f97316]/30 hover:bg-white/[0.03] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(249, 115, 22, 0.14)] transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 gold-star" style={{ animationDelay: `${j * 0.15}s` }} />)}
      </div>
      <p className="text-[13px] text-white/55 leading-[1.8] mb-5">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
        <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 0 12px ${grad[0]}30` }}>
          {t.name[0].toUpperCase()}
          {/* Discord-like online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-white">{t.name}</p>
          <p className="text-[10px] text-[#f97316]/70 font-medium uppercase tracking-wider">{t.role}</p>
        </div>
      </div>
    </div>
  )
})

function MarqueeRow({ items, reverse }: { items: typeof testimonials; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}>
      <div className={`flex gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {items.map((t, i) => <ReviewCard key={`a-${i}`} t={t} />)}
        {items.map((t, i) => <ReviewCard key={`b-${i}`} t={t} />)}
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const total = getTotalReviewCount()
  return (
    <section id="reviews" className="py-24 overflow-hidden relative z-10">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 mb-14">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
            <MessageSquare className="h-3.5 w-3.5 text-white/30" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Customer Reviews</span>
          </div>
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

      <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">
        <MarqueeRow items={testimonials.slice(0, 5)} />
        <MarqueeRow items={testimonials.slice(5, 10)} reverse />
      </div>
    </section>
  )
}
