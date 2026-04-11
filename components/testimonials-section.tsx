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

const ReviewCard = memo(function ReviewCard({ t }: { t: typeof testimonials[number] }) {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[340px] rounded-xl p-6 bg-white/[0.012] border border-white/[0.04] hover:border-white/[0.07] transition-all">
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-[#fbbf24] text-[#fbbf24]" />)}
      </div>
      <p className="text-[13px] text-white/40 leading-[1.8] mb-5">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.03]">
        <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-[10px] font-bold text-white/25">
          {t.name[0].toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white/60">{t.name}</p>
          <p className="text-[10px] text-white/15">{t.role}</p>
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4 text-white">
            What our <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>customers</span> say
          </h2>
          <p className="text-white/35 text-[15px] max-w-lg mx-auto mb-6">Trusted by hundreds of competitive gamers worldwide.</p>
          <Link href="/reviews" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[13px] font-semibold text-white/40 hover:text-white/70 hover:border-white/[0.1] transition-all">
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
