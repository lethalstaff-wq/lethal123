"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getTotalReviewCount, getOrdersToday } from "@/lib/review-counts"
import { FALLBACK_STATS } from "@/lib/fallback-stats"
import { Magnetic } from "@/components/magnetic-button"

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

// Per-character mask reveal — each char is an inline-block sliding up from Y 110%
// inside an overflow-hidden line wrapper. Gradient styles applied per-char so
// -webkit-text-fill-color:transparent + background-clip:text still render text.
function CharReveal({ text, delayBase = 0, className = "", styleOverride }: { text: string; delayBase?: number; className?: string; styleOverride?: React.CSSProperties }) {
  const reduced = useReducedMotion()
  if (reduced) {
    return <span className={className} style={styleOverride}>{text}</span>
  }
  return (
    <span className={`char-reveal-line ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="char-reveal-char"
          style={{
            ...styleOverride,
            ["--char-delay" as unknown as string]: `${delayBase + i * 30}ms`,
            whiteSpace: ch === " " ? "pre" : undefined,
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

export function HeroSection() {
  const ordersRaw = getOrdersToday()
  const ordersToday = ordersRaw > 0 ? ordersRaw : FALLBACK_STATS.ordersToday
  const totalReviews = getTotalReviewCount() || FALLBACK_STATS.reviewsCount
  const [ready, setReady] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  // Orbs drift against scroll; headline shifts down slightly to feel heavy
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.7, 0])
  const subOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero accent: extra orange glow behind H1 (layered on top of global bg) */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={reduced ? undefined : { y: orbY }}
      >
        <div
          className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full opacity-70"
          style={{
            background: "radial-gradient(ellipse, rgba(249, 115, 22, 0.22) 0%, transparent 62%)",
            filter: "blur(120px)",
            animation: "heroOrb1 44s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 60%)",
            filter: "blur(140px)",
            animation: "heroOrb2 62s ease-in-out infinite reverse",
            willChange: "transform",
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-32 lg:py-36 text-center"
        style={reduced ? undefined : { y: headlineY, opacity: headlineOpacity }}
      >
        {/* Live status pill */}
        <div className={`mb-6 transition-all duration-700 ${ready ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-2.5 h-2.5 rounded-full bg-green-400/40 animate-ping" />
              <div className="relative w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              <span className="text-white tabular-nums"><Counter value={ordersToday} /></span>
              <span className="text-white/50 ml-1.5">orders today</span>
              <span className="mx-2 text-white/15">·</span>
              <span className="text-emerald-300/80 tabular-nums"><Counter value={FALLBACK_STATS.discordOnline} /></span>
              <span className="text-white/50 ml-1.5">online now</span>
            </span>
          </div>
        </div>

        {/* Scan line divider */}
        <div className={`relative h-px w-48 mx-auto mb-8 bg-white/[0.04] overflow-hidden transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "100ms" }}>
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
        </div>

        {/* Headline — per-character mask reveal */}
        <h1 className="font-display text-[clamp(3rem,8vw,7.5rem)] font-bold tracking-[-0.045em] leading-[0.92] mb-8">
          <CharReveal
            text="Dominate With"
            delayBase={180}
            className="block mb-1"
            styleOverride={{
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,195,0.85) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          />
          <CharReveal
            text="Confidence"
            delayBase={560}
            className="block"
            styleOverride={{
              background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 60px rgba(249, 115, 22, 0.51))",
            }}
          />
        </h1>

        {/* Subheadline */}
        <motion.p
          className={`text-[17px] sm:text-[19px] text-white/55 leading-[1.7] mb-12 max-w-[640px] mx-auto transition-all duration-1000 ${
            ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={reduced ? { transitionDelay: "1350ms" } : { transitionDelay: "1350ms", opacity: subOpacity }}
        >
          Kernel-level spoofers, external cheats, and custom DMA firmware.
          <span className="text-white/90"> Undetected.</span>
          <span className="text-white/90"> Instant delivery.</span>
          <span className="text-white/90"> 24/7 support.</span>
        </motion.p>

        {/* CTAs */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 mb-14 flex-wrap transition-all duration-1000 ${
            ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "1550ms" }}
        >
          <Magnetic strength={0.22}>
            <Link
              href="/products"
              data-cursor="cta"
              className="cursor-cta group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white font-bold text-[15px] shadow-[0_0_40px_rgba(249,115,22,0.41)] hover:shadow-[0_0_80px_rgba(249,115,22,0.75)] hover:scale-[1.03] transition-all duration-300 press-spring"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 pointer-events-none" />
              <span className="relative z-10">Browse Products</span>
              <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Magnetic>

          <Magnetic strength={0.15}>
            <Link
              href="/reviews"
              data-cursor="cta"
              className="cursor-cta group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl border border-white/[0.12] bg-white/[0.02] text-white/85 font-semibold text-[15px] backdrop-blur-sm hover:bg-white/[0.04] hover:border-[#f97316]/40 hover:text-white transition-all duration-300 press-spring"
            >
              <span>View Reviews</span>
              <span className="text-[#f97316]">&bull;</span>
              <span className="text-[#f97316] font-bold tabular-nums">
                <Counter value={totalReviews} />
              </span>
            </Link>
          </Magnetic>
        </div>

        {/* Crypto bar — branded icons */}
        <div
          className={`flex items-center justify-center gap-3 text-sm transition-all duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "1750ms" }}
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
                className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] hover:border-[#f97316]/40 hover:scale-110 hover:shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all"
              >
                <Image src={c.src} alt={c.l} width={22} height={22} className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => {
          const target = document.getElementById("products")
          if (target && typeof window !== "undefined" && (window as unknown as { __lenis?: { scrollTo: (el: Element, opts?: unknown) => void } }).__lenis) {
            ;(window as unknown as { __lenis: { scrollTo: (el: Element, opts?: unknown) => void } }).__lenis.scrollTo(target, { offset: -80 })
          } else {
            target?.scrollIntoView({ behavior: "smooth" })
          }
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group z-10"
        aria-label="Scroll to products"
        style={reduced ? undefined : { opacity: scrollIndicatorOpacity }}
      >
        <div className="w-[22px] h-[34px] border-2 border-white/20 rounded-full flex justify-center py-1.5 group-hover:border-[#f97316]/50 transition-colors">
          <span className="w-[3px] h-[6px] bg-white/40 rounded-full group-hover:bg-[#f97316] transition-colors" style={{ animation: "scrollDot 1.8s ease-in-out infinite" }} />
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors">Scroll</span>
      </motion.button>

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
