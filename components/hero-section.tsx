"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getTotalReviewCount, getOrdersToday } from "@/lib/review-counts"
import { FALLBACK_STATS } from "@/lib/fallback-stats"

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(value)
  const [animating, setAnimating] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done.current) {
          done.current = true
          setAnimating(true)
          setCount(0)
          const t0 = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - t0) / 1800, 1)
            setCount(Math.round((1 - Math.pow(1 - p, 4)) * value))
            if (p < 1) requestAnimationFrame(tick)
            else setCount(value)
          }
          requestAnimationFrame(tick)
          obs.disconnect()
        }
      },
      { threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  return <span ref={ref} className="tabular-nums">{animating ? count : value}</span>
}

export function HeroSection() {
  const ordersRaw = getOrdersToday()
  const ordersToday = ordersRaw > 0 ? ordersRaw : FALLBACK_STATS.ordersToday
  const totalReviews = getTotalReviewCount() || FALLBACK_STATS.reviewsCount
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Layered background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Mesh gradient orbs — subtle on pure black */}
        <div
          className="absolute top-[-120px] left-[12%] w-[780px] h-[780px] rounded-full opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 60%)",
            filter: "blur(140px)",
            animation: "heroOrb1 42s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        <div
          className="absolute bottom-[-100px] right-[8%] w-[680px] h-[680px] rounded-full opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(234,88,12,0.10) 0%, transparent 60%)",
            filter: "blur(150px)",
            animation: "heroOrb2 58s ease-in-out infinite reverse",
            willChange: "transform",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 45%, black, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 45%, black, transparent 90%)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Film grain — subtle on black */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none mix-blend-overlay" aria-hidden="true">
          <filter id="hero-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-noise)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-24 lg:py-28 text-center">
        {/* Live status pill */}
        <div className={`mb-6 transition-all duration-700 ${ready ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md">
            <span className="relative flex items-center justify-center">
              <span className="absolute w-3 h-3 rounded-full bg-emerald-400/40 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[12px] text-white/75 font-medium">
              <Counter value={FALLBACK_STATS.discordOnline} /> online right now
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-[12px] text-white/60">
              <Counter value={ordersToday} /> <span className="text-[#f97316]">orders today</span>
            </span>
          </div>
        </div>

        {/* Scan line divider */}
        <div className={`relative h-px w-48 mx-auto mb-8 bg-white/[0.04] overflow-hidden transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "100ms" }}>
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
        </div>

        {/* Headline */}
        <h1
          className={`font-display text-[clamp(3rem,8vw,7.5rem)] font-bold tracking-[-0.045em] leading-[0.92] mb-8 transition-all duration-1000 ${
            ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <span
            className="block"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,195,0.85) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dominate With
          </span>
          <span
            className="block"
            style={{
              background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 60px rgba(249,115,22,0.35))",
            }}
          >
            Confidence
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className={`text-[17px] sm:text-[19px] text-white/55 leading-[1.7] mb-12 max-w-[640px] mx-auto transition-all duration-1000 ${
            ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "450ms" }}
        >
          Kernel-level spoofers, external cheats, and custom DMA firmware.
          <span className="text-white/90"> Undetected.</span>
          <span className="text-white/90"> Instant delivery.</span>
          <span className="text-white/90"> 24/7 support.</span>
        </p>

        {/* CTAs */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 mb-14 flex-wrap transition-all duration-1000 ${
            ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          <Link
            href="/products"
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white font-bold text-[15px] shadow-[0_0_40px_rgba(249,115,22,0.28)] hover:shadow-[0_0_60px_rgba(249,115,22,0.48)] hover:scale-[1.02] transition-all duration-300"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
            <span className="relative z-10">Browse Products</span>
            <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <Link
            href="/reviews"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl border border-white/[0.12] bg-white/[0.02] text-white/85 font-semibold text-[15px] backdrop-blur-sm hover:bg-white/[0.04] hover:border-[#f97316]/40 hover:text-white transition-all duration-300"
          >
            <span>View Reviews</span>
            <span className="text-[#f97316]">&bull;</span>
            <span className="text-[#f97316] font-bold tabular-nums">
              <Counter value={totalReviews} />
            </span>
          </Link>
        </div>

        {/* Crypto bar — branded icons */}
        <div
          className={`flex items-center justify-center gap-3 text-sm transition-all duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Accepted</span>
          <div className="flex items-center gap-2.5">
            {[
              { src: "/images/icons/bitcoin.svg", l: "Bitcoin" },
              { src: "/images/icons/ethereum.svg", l: "Ethereum" },
              { src: "/images/icons/litecoin.svg", l: "Litecoin" },
              { src: "/images/icons/tether.svg", l: "Tether" },
              { src: "/images/icons/paypal.svg", l: "PayPal" },
            ].map((c) => (
              <div
                key={c.l}
                title={c.l}
                className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.15] hover:scale-110 transition-all"
              >
                <Image src={c.src} alt={c.l} width={22} height={22} className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group z-10"
        aria-label="Scroll to products"
      >
        <div className="w-[22px] h-[34px] border-2 border-white/20 rounded-full flex justify-center py-1.5 group-hover:border-[#f97316]/50 transition-colors">
          <span className="w-[3px] h-[6px] bg-white/40 rounded-full group-hover:bg-[#f97316] transition-colors" style={{ animation: "scrollDot 1.8s ease-in-out infinite" }} />
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors">Scroll</span>
      </button>

      {/* Local styles */}
      <style jsx>{`
        @keyframes heroOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.08); }
          66% { transform: translate(-30px, 30px) scale(0.94); }
        }
        @keyframes heroOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.06); }
        }
        @keyframes heroOrb3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.1); }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          60% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
        @keyframes heroScan {
          0%, 100% { transform: translateX(-120%); }
          50% { transform: translateX(220%); }
        }
      `}</style>
    </section>
  )
}
