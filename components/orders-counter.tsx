"use client"

import { useState, useEffect } from "react"
import { ShoppingBag } from "lucide-react"
import { getOrdersToday } from "@/lib/review-counts"

export function OrdersCounter() {
  const [orders, setOrders] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOrders(getOrdersToday())

    // Recalculate every 20-40 minutes
    const interval = setInterval(() => {
      setOrders(getOrdersToday())
    }, (20 + Math.random() * 20) * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/15 border border-primary/30 text-primary">
      <ShoppingBag className="h-3.5 w-3.5" />
      <span className="animate-pulse">{orders} orders today</span>
    </div>
  )
}
