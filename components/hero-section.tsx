"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Clock, ChevronDown } from "lucide-react"
import Link from "next/link"
import { AnimatedCounter } from "@/components/animated-counter"

// Плавный набор заказов: 0 в начале дня, растет на 2-3 в час, максимум 25-49
function getOrdersToday(): number {
  const now = new Date()
  const day = now.getUTCDate()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()
  
  // Seed на основе даты для консистентности
  const daySeed = (year * 366 + month * 31 + day) % 100
  
  // 2-3 заказа в час
  const ordersPerHour = 2 + (daySeed % 2)
  
  // Вычисляем часы с начала дня + частичный час
  const hoursPassed = hour + (minute / 60)
  
  // Базовое количество заказов
  let orders = Math.floor(hoursPassed * ordersPerHour)
  
  // Максимум 12-17 в зависимости от дня
  const maxOrders = 12 + (daySeed % 6)
  
  return Math.min(orders, maxOrders)
}

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
        style={{ background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(249,115,22,0.15), transparent 60%)` }}
      />
      {/* Animated grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)`,
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
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold px-8 h-13 rounded-xl shadow-lg shadow-primary/25 btn-glow"
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
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 h-13 rounded-xl"
            asChild
          >
            <Link href="/reviews">847+ Reviews</Link>
          </Button>
        </div>

        {/* Trust chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in-up animate-delay-400">
          {[
            { icon: Shield, label: "99.8% Undetected", color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" },
            { icon: Zap, label: "Instant Delivery", color: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" },
            { icon: Clock, label: "24/7 Discord Support", color: "text-blue-400 border-blue-400/20 bg-blue-400/5" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium ${item.color}`}>
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </div>
          ))}
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
