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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToProducts = () => {
    const el = document.getElementById("products")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
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
          <span className="text-primary">confidence</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto animate-fade-in-up animate-delay-200">
          Premium cheats and spoofers designed for competitive gamers. 
          Stay undetected, stay ahead.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animate-delay-300">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 rounded-xl shadow-lg shadow-primary/25 btn-glow"
            asChild
          >
            <Link href="/products">
              View Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 h-12 rounded-xl"
            asChild
          >
            <Link href="/reviews">Read Reviews</Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mb-10 animate-fade-in-up animate-delay-400">
          {[
            { icon: Shield, label: "Undetected" },
            { icon: Zap, label: "Instant Delivery" },
            { icon: Clock, label: "24/7 Support" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white/40">
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Payment methods - text only */}
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
