"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Clock, ChevronDown } from "lucide-react"
import Link from "next/link"
import { AnimatedCounter } from "@/components/animated-counter"
import { getTotalReviewCount, getOrdersToday } from "@/lib/review-counts"

export function HeroSection() {
  const ordersToday = getOrdersToday()
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 })
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const scrollToProducts = () => {
    const el = document.getElementById("products")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Mouse-following spotlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-500 hidden lg:block"
        style={{ background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(239,111,41,0.15), transparent 60%)` }}
      />
      {/* Animated grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(239,111,41,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(239,111,41,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }} />
      </div>
      {/* Parallax background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] -top-[200px] left-1/4"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute w-[300px] h-[300px] bg-accent/10 rounded-full blur-[120px] bottom-[10%] right-[10%]"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        />
      </div>
      <div className="container mx-auto text-center max-w-4xl relative z-10 py-32">

        {/* Badge */}
        <div className="flex justify-center gap-3 mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white/80"><AnimatedCounter value={String(ordersToday)} duration={2000} /> orders today</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up animate-delay-100">
          <span className="text-white">Dominate with</span>
          <br />
          <span className="text-primary relative inline-block">
            confidence
            <span className="absolute -inset-x-2 -inset-y-1 bg-primary/5 rounded-lg blur-xl animate-pulse-glow" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto animate-fade-in-up animate-delay-200">
          Kernel-level spoofers, external cheats, and custom DMA firmware — built for players who refuse to lose.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animate-delay-300">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold px-8 h-13 rounded-2xl shadow-lg shadow-primary/25 btn-glow"
            asChild
          >
            <Link href="/products">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 h-13 rounded-2xl"
            asChild
          >
            <Link href="/reviews">{getTotalReviewCount()}+ Reviews</Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mb-10 animate-fade-in-up animate-delay-400">
          {[
            { icon: Shield, label: "99.8% Undetected" },
            { icon: Zap, label: "Instant Delivery" },
            { icon: Clock, label: "24/7 Discord Support" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white/40">
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="flex items-center justify-center gap-2 animate-fade-in-up animate-delay-500">
          <span className="text-xs text-white/30 uppercase tracking-wider">Accepted:</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 font-medium">BTC</span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-white/50 font-medium">ETH</span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-white/50 font-medium">LTC</span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-white/50 font-medium">PayPal</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToProducts}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-primary transition-colors group cursor-pointer"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce group-hover:text-primary" />
      </button>
    </section>
  )
}
