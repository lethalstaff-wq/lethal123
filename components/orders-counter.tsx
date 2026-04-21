"use client"

import { useState, useEffect } from "react"
import { ShoppingBag } from "lucide-react"
import { getOrdersToday } from "@/lib/review-counts"
import { FALLBACK_STATS } from "@/lib/fallback-stats"

export function OrdersCounter() {
  const [orders, setOrders] = useState<number>(FALLBACK_STATS.ordersToday)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const v = getOrdersToday()
    setOrders(v > 0 ? v : FALLBACK_STATS.ordersToday)

    const interval = setInterval(() => {
      const v = getOrdersToday()
      setOrders(v > 0 ? v : FALLBACK_STATS.ordersToday)
    }, (20 + Math.random() * 20) * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f97316]/15 border border-[#f97316]/30 text-[#f97316]">
      <ShoppingBag className="h-3.5 w-3.5" />
      <span className="animate-pulse">{orders} orders today</span>
    </div>
  )
}
