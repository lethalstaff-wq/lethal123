"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, Shield, Zap, Clock, ChevronDown, Rocket } from "lucide-react"
import Link from "next/link"
import { getTotalReviewCount, getOrdersToday } from "@/lib/review-counts"

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(value)
  const [animating, setAnimating] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        setAnimating(true)
        setCount(0)
        const t0 = performance.now()
        const tick = (now: number) => { const p = Math.min((now - t0) / 1800, 1); setCount(Math.round((1 - Math.pow(1 - p, 4)) * value)); if (p < 1) requestAnimationFrame(tick); else setCount(value) }
        requestAnimationFrame(tick); obs.disconnect()
      }
    }, { threshold: 0 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])
  return <span ref={ref} className="tabular-nums">{animating ? count : value}</span>
}

export function HeroSection() {
  const ordersToday = getOrdersToday()
  const totalReviews = getTotalReviewCount()
  const [ready, setReady] = useState(false)

  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t) }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Noise texture — covers whole page */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      {/* Aurora */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[700px] h-[500px] -top-[150px] right-[-50px] rounded-full opacity-100" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06), transparent 70%)", filter: "blur(120px)", animation: "heroDrift1 20s ease-in-out infinite" }} />
        <div className="absolute w-[500px] h-[400px] bottom-[-100px] left-[-50px] rounded-full opacity-100" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03), transparent 70%)", filter: "blur(120px)", animation: "heroDrift2 25s ease-in-out infinite" }} />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 sm:px-10 py-32 lg:py-40 text-center">
        {/* Badge */}
        <div className={`mb-8 transition-all duration-700 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.15em]"><Counter value={ordersToday} /> orders today</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className={`text-[clamp(2.8rem,7vw,5.5rem)] font-bold tracking-[-0.04em] leading-[1.05] mb-8 transition-all duration-1000 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
          <span className="text-white">Dominate With</span><br />
          <span className="hero-text-orange" style={{ filter: "drop-shadow(0 0 50px rgba(249,115,22,0.2))" }}>Confidence</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-[17px] sm:text-[19px] text-white/40 leading-[1.7] mb-10 max-w-[600px] mx-auto transition-all duration-1000 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "400ms" }}>
          Kernel-level spoofers, external cheats, and custom DMA firmware. Undetected. Instant delivery. 24/7 support.
        </p>


        {/* CTA */}
        <div className={`flex items-center justify-center gap-4 mb-12 transition-all duration-1000 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "700ms" }}>
          <Link href="/products" className="hero-btn-primary px-10 py-4 rounded-xl text-[16px] font-bold text-white flex items-center gap-2.5 group">
            Browse Products <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/reviews" className="hero-btn-ghost px-8 py-4 rounded-xl text-[15px] font-semibold flex items-center gap-2">
            <Counter value={totalReviews} />+ Reviews
          </Link>
        </div>

        {/* Payment methods */}
        <div className={`flex items-center justify-center gap-2 mb-6 transition-all duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "850ms" }}>
          <span className="text-[10px] text-white/20 uppercase tracking-wider">Accepted:</span>
          {["BTC", "ETH", "LTC", "PayPal"].map((m, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-[11px] text-white/35 font-medium">{m}</span>
              {i < 3 && <span className="text-white/10">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll */}
      <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/15 hover:text-[#f97316]/40 transition-colors cursor-pointer">
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>

      <style jsx>{`
        .hero-text-orange { background: linear-gradient(135deg, #f97316, #fb923c, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-btn-primary { background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 0 25px rgba(249,115,22,0.22), 0 0 80px rgba(249,115,22,0.05); transition: all 0.25s ease; }
        .hero-btn-primary:hover { box-shadow: 0 0 35px rgba(249,115,22,0.4), 0 0 100px rgba(249,115,22,0.1); transform: translateY(-1px); filter: brightness(1.1); }
        .hero-btn-ghost { border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.015); color: rgba(255,255,255,0.4); transition: all 0.2s ease; }
        .hero-btn-ghost:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.7); }
        @keyframes heroDrift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-3%,4%) scale(1.05); } }
        @keyframes heroDrift2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(5%,-3%); } }
      `}</style>
    </section>
  )
}
