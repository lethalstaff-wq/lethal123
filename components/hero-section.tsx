"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getOrdersToday } from "@/lib/review-counts"
import { useReviewCount } from "@/hooks/use-review-count"
import { FALLBACK_STATS } from "@/lib/fallback-stats"
import { Magnetic } from "@/components/magnetic-button"
import { GlossyLink } from "@/components/ui/glossy-button"

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

// Per-character mask reveal via framer-motion. Animation only kicks in after
// client mount, so SSR doesn't paint the final state and cause a flash.
function CharReveal({ text, delayBase = 0, className = "", styleOverride }: { text: string; delayBase?: number; className?: string; styleOverride?: React.CSSProperties }) {
  const reduced = useReducedMotion()
  if (reduced) {
    return <span className={className} style={styleOverride}>{text}</span>
  }
  return (
    <span className={`char-reveal-line ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block will-change-transform"
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{
            delay: (delayBase + i * 30) / 1000,
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            ...styleOverride,
            whiteSpace: ch === " " ? "pre" : undefined,
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

export function HeroSection() {
  const ordersRaw = getOrdersToday()
  const ordersToday = ordersRaw > 0 ? ordersRaw : FALLBACK_STATS.ordersToday
  const totalReviews = useReviewCount()
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
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

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
        {/* Live status pill — visible on all viewports, adds premium-shop feel */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-2.5 h-2.5 rounded-full bg-green-400/40 animate-ping" />
              <div className="relative w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              <span className="text-white tabular-nums"><Counter value={ordersToday} /></span>
              <span className="text-white/50 ml-1.5">orders today</span>
            </span>
          </div>
        </motion.div>

        {/* Scan line divider */}
        <motion.div
          className="relative h-px w-48 mx-auto mb-8 bg-white/[0.04] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
        </motion.div>

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
          <span className="relative inline-flex items-baseline">
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
            {/* Terminal cursor blink — full cap-height, sits alongside the word */}
            <motion.span
              aria-hidden="true"
              className="inline-block ml-[0.06em] w-[0.08em] bg-[#f97316] rounded-[2px] self-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0, 0, 1] }}
              transition={{
                delay: 1.45,
                duration: 1.2,
                times: [0, 0.08, 0.5, 0.58, 0.92, 1],
                repeat: Infinity,
                repeatDelay: 0.2,
                ease: "linear",
              }}
              style={{
                height: "0.92em",
                boxShadow: "0 0 16px rgba(249,115,22,0.85), 0 0 28px rgba(249,115,22,0.45)",
              }}
            />
          </span>
          {/* Gradient underline under Confidence — fades in after reveal */}
          <motion.span
            aria-hidden="true"
            className="relative block mx-auto mt-2 h-[3px] rounded-full overflow-hidden"
            style={{ width: "clamp(220px, 34vw, 440px)" }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.4) 20%, #f97316 50%, rgba(249,115,22,0.4) 80%, transparent 100%)",
                boxShadow: "0 0 16px rgba(249,115,22,0.7), 0 0 32px rgba(249,115,22,0.4)",
              }}
            />
          </motion.span>
        </h1>

        {/* Subheadline */}
        <motion.p
          className="text-[17px] sm:text-[19px] text-white/55 leading-[1.7] mb-12 max-w-[640px] mx-auto"
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}
        >
          Kernel-level spoofers, external cheats, and custom DMA firmware.
          <span className="text-white/90"> Undetected.</span>
          <span className="text-white/90"> Instant delivery.</span>
          <span className="text-white/90"> 24/7 support.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex items-center justify-center gap-3 sm:gap-4 mb-14 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Magnetic strength={0.22}>
            <GlossyLink
              href="/products"
              data-cursor="cta"
              shape="block"
              size="xl"
              className="cursor-cta press-spring"
              rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/glossy:translate-x-1" />}
            >
              Browse Products
            </GlossyLink>
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
        </motion.div>

        {/* Crypto bar — branded icons (minimal inline row) */}
        <motion.div
          className="flex items-center justify-center gap-3 text-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.75, ease: [0.22, 1, 0.36, 1] }}
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
        </motion.div>
      </motion.div>

      {/* Scroll indicator — Ring */}
      <motion.button
        onClick={() => {
          const target = document.getElementById("products")
          if (target && typeof window !== "undefined" && (window as unknown as { __lenis?: { scrollTo: (el: Element, opts?: unknown) => void } }).__lenis) {
            ;(window as unknown as { __lenis: { scrollTo: (el: Element, opts?: unknown) => void } }).__lenis.scrollTo(target, { offset: -80 })
          } else {
            target?.scrollIntoView({ behavior: "smooth" })
          }
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 group flex flex-col items-center gap-3 z-10"
        aria-label="Scroll to products"
        style={reduced ? undefined : { opacity: scrollIndicatorOpacity }}
      >
        <span className="text-[9px] uppercase tracking-[0.45em] text-white/30 group-hover:text-[#f97316]/80 transition-colors">Scroll</span>
        <div className="relative w-11 h-11">
          {/* Static thin base ring */}
          <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full">
            <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </svg>
          {/* Rotating orange arc */}
          <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full" style={{ animation: "spin-slow 4s linear infinite" }}>
            <defs>
              <linearGradient id="ringArcGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                <stop offset="70%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill="none" stroke="url(#ringArcGrad)" strokeWidth="1.5" strokeDasharray="32 94" strokeLinecap="round" transform="rotate(-90 22 22)" />
          </svg>
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: "0 0 24px rgba(249,115,22,0.45)" }} />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute inset-0 m-auto text-[#f97316] group-hover:translate-y-0.5 transition-transform">
            <path d="M6 1V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
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
        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes chevronBounceSoft {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(4px); opacity: 1; }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes heroScan {
          0%, 100% { transform: translateX(-120%); }
          50% { transform: translateX(220%); }
        }
      `}</style>
    </section>
  )
}
