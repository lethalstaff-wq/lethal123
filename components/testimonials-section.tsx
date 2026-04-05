"use client"

import { memo } from "react"
import { Star, Quote, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTotalReviewCount } from "@/lib/review-counts"

const testimonials = [
  {
    quote: "bro the esp is actually insane. doesnt drop my fps AT ALL and looks clean on stream. been running ranked for 3 weeks now, nobody suspects anything lmao",
    name: "zk",
    role: "FN Ranked",
    rating: 5,
  },
  {
    quote: "best aimbot ive ever used ngl. 3 months straight zero detections. support helped me config everything in like 10 min on discord, actually goated team",
    name: "vex",
    role: "Valorant",
    rating: 5,
  },
  {
    quote: "perm spoofer literally saved my main after hwid ban. thought my pc was cooked but nah this fixed everything in 5 min. worth every penny fr fr",
    name: "rxn",
    role: "Warzone",
    rating: 5,
  },
  {
    quote: "got the dma elite bundle and bro... setup took 20 min with discord support. everything works out the box. this is premium quality no cap",
    name: "ty1er",
    role: "FN Competitive",
    rating: 5,
  },
  {
    quote: "temp spoofer for a month, not a single issue. instant delivery too i got the key in like 10 seconds. way cheaper than other providers and actually works",
    name: "drix",
    role: "CoD",
    rating: 5,
  },
  {
    quote: "switched from another provider and its night and day difference. blurred dma is so smooth and they push firmware updates fast after every game patch",
    name: "kev",
    role: "PUBG",
    rating: 5,
  },
  {
    quote: "support team helped me at 3am on a sunday bro. thats the kind of service that keeps me coming back. also the cheat itself is insane, zero fps drops",
    name: "dxn",
    role: "R6 Siege",
    rating: 5,
  },
  {
    quote: "custom firmware is 100% worth it. running eac bypass for 6 weeks now without a single issue. genuinely the best dma provider ive tried and ive tried like 4",
    name: "mikez",
    role: "Rust",
    rating: 5,
  },
  {
    quote: "was scared to buy ngl but this actually works perfectly?? perm spoofer + fn external combo is unbeatable. playing on main for 2 months no problems",
    name: "jx",
    role: "Fortnite",
    rating: 5,
  },
  {
    quote: "ordered the streck for a budget setup and it performs way above what i expected for the price. great entry option if ur new to dma. support walked me thru everything",
    name: "chrxs",
    role: "CS2",
    rating: 5,
  },
]

const ReviewCard = memo(function ReviewCard({ testimonial }: { testimonial: (typeof testimonials)[number] }) {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[360px] rounded-2xl glass p-6 flex flex-col hover:border-primary/40 transition-all card-glow-border">
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
        ))}
      </div>
      
      {/* Quote */}
      <Quote className="h-6 w-6 mb-2 text-primary/30" />
      <p className="text-sm leading-relaxed text-foreground/90 mb-6 flex-1">{testimonial.quote}</p>
      
      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
          {testimonial.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{testimonial.name}</p>
          <p className="text-muted-foreground text-xs">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
})

function MarqueeRow({ items, reverse }: { items: (typeof testimonials)[number][]; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div className={`flex gap-6 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {items.map((t, i) => (
          <ReviewCard key={`a-${i}`} testimonial={t} />
        ))}
        {items.map((t, i) => (
          <ReviewCard key={`b-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const row1 = testimonials.slice(0, 5)
  const row2 = testimonials.slice(5, 10)

  return (
    <section id="reviews" className="py-24 overflow-hidden relative grid-bg">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] top-1/4 -left-40" />
        <div className="absolute w-[300px] h-[300px] bg-accent/10 rounded-full blur-[120px] bottom-0 right-20" />
      </div>

      {/* Header */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-14 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <MessageSquare className="h-4 w-4" />
            <span>Customer Reviews</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            What our <span className="gradient-text">customers</span> say
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-6">
            Trusted by hundreds of competitive gamers worldwide.
          </p>
          <Link href="/reviews">
            <Button variant="outline" size="lg" className="border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl gap-2">
              <Star className="h-4 w-4" />
              Read all {getTotalReviewCount()} reviews
            </Button>
          </Link>
        </div>
      </div>

      {/* Marquee */}
      <div className="flex flex-col gap-6 max-w-[1600px] mx-auto relative z-10">
        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </div>
    </section>
  )
}
