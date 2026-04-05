"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingBag, CheckCircle2 } from "lucide-react"

const BUYER_NAMES = [
  "James", "Alex", "Ryan", "Daniel", "Tom", "Chris", "Mike", "Nick",
  "Sam", "Jake", "Max", "Liam", "Noah", "Ethan", "Lucas", "Ben",
  "Jack", "Leo", "Kai", "Finn", "Josh", "Kyle", "Drew", "Cole",
  "Matt", "Zach", "Will", "Owen", "Luke", "Adam", "Ian", "Jay",
]

const LOCATIONS = [
  "UK", "US", "DE", "FR", "NL", "SE", "NO", "AU",
  "CA", "PL", "ES", "IT", "DK", "FI", "BE", "AT",
]

const PRODUCTS = [
  { name: "Perm Spoofer", price: "£35" },
  { name: "Temp Spoofer", price: "£20" },
  { name: "Fortnite External", price: "£10" },
  { name: "Blurred DMA", price: "£22" },
  { name: "Streck DMA", price: "£8" },
  { name: "DMA Basic Bundle", price: "£425" },
  { name: "DMA Advanced Bundle", price: "£675" },
  { name: "Custom DMA Firmware", price: "£20" },
]

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

export function SocialProofToast() {
  const [visible, setVisible] = useState(false)
  const [notification, setNotification] = useState({ name: "", location: "", product: "", time: "" })

  const showNotification = useCallback(() => {
    const now = Date.now()
    const seed = Math.floor(now / 30000) // changes every 30s
    const name = seededPick(BUYER_NAMES, seed)
    const location = seededPick(LOCATIONS, seed * 7 + 3)
    const product = seededPick(PRODUCTS, seed * 13 + 7)
    const minutes = 1 + (seed % 12)

    setNotification({
      name: `${name} from ${location}`,
      location,
      product: product.name,
      time: `${minutes} min ago`,
    })
    setVisible(true)

    const hideTimer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(hideTimer)
  }, [])

  useEffect(() => {
    // First show after 8-15 seconds
    const initialDelay = 8000 + Math.random() * 7000
    const firstTimer = setTimeout(showNotification, initialDelay)

    // Then every 25-45 seconds
    const interval = setInterval(() => {
      showNotification()
    }, 25000 + Math.random() * 20000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [showNotification])

  return (
    <div
      className={`fixed bottom-24 left-5 z-[70] max-w-[320px] transition-all duration-500 ${
        visible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card/95 border border-border/50 backdrop-blur-md shadow-xl shadow-black/20">
        <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
          <ShoppingBag className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground leading-tight">
            {notification.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            purchased <span className="text-[#EF6F29] font-medium">{notification.product}</span>
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground">{notification.time}</span>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/20 hover:text-white/50 text-xs mt-0.5 shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  )
}
