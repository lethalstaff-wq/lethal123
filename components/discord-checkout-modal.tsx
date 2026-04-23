"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, MessageCircle, Clock, Shield, Headphones } from "lucide-react"

interface DiscordCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  variantName?: string
  price?: number
}

export function DiscordCheckoutModal({ isOpen, onClose, productName, variantName, price }: DiscordCheckoutModalProps) {
  const [countdown, setCountdown] = useState(5)
  const [autoRedirect, setAutoRedirect] = useState(true)

  const discordLink = "https://discord.gg/lethaldma"

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5)
      setAutoRedirect(true)
      return
    }

    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (autoRedirect && countdown === 0) {
      window.open(discordLink, "_blank")
    }
  }, [isOpen, countdown, autoRedirect])

  if (!isOpen) return null

  const handleOpenDiscord = () => {
    window.open(discordLink, "_blank")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <Card className="relative w-full max-w-md border-white/[0.08] bg-gradient-to-b from-white/[0.025] to-transparent shadow-2xl animate-in fade-in zoom-in duration-300">
        <button aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/55 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="p-8 text-center space-y-6">
          {/* Discord Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-[#5865F2]/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-[#5865F2] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
            <p className="text-white/55">
              We're currently processing orders through Discord for the best support experience.
            </p>
          </div>

          {/* Product Info */}
          {productName && (
            <div className="bg-white/[0.04] rounded-xl p-4 text-left space-y-2">
              <p className="text-sm text-white/55">Your selection:</p>
              <p className="font-semibold">{productName}</p>
              {variantName && <p className="text-sm text-white/55">{variantName}</p>}
              {price && <p className="text-lg font-bold text-[#f97316]">£{price.toFixed(2)}</p>}
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Clock className="h-5 w-5 mx-auto text-[#f97316]" />
              <p className="text-xs text-white/55">Fast Response</p>
            </div>
            <div className="space-y-1">
              <Shield className="h-5 w-5 mx-auto text-[#f97316]" />
              <p className="text-xs text-white/55">Secure Payment</p>
            </div>
            <div className="space-y-1">
              <Headphones className="h-5 w-5 mx-auto text-[#f97316]" />
              <p className="text-xs text-white/55">24/7 Support</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#f97316]/10 border border-[#f97316]/20 rounded-xl p-4 text-left">
            <p className="text-sm font-medium text-[#f97316] mb-2">How to order:</p>
            <ol className="text-sm text-white/55 space-y-1">
              <li>1. Join our Discord server</li>
              <li>
                2. Go to <span className="text-[#f97316] font-medium">#🎫・contact-us</span> channel
              </li>
              <li>3. Create a ticket and tell us what you want</li>
              <li>4. Receive payment instructions</li>
            </ol>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleOpenDiscord}
              size="lg"
              className="w-full gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <MessageCircle className="h-5 w-5" />
              Open Discord
              {autoRedirect && countdown > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">{countdown}s</span>
              )}
            </Button>

            <button
              onClick={() => setAutoRedirect(false)}
              className="text-xs text-white/55 hover:text-white transition-colors"
            >
              {autoRedirect ? "Cancel auto-redirect" : "Auto-redirect cancelled"}
            </button>
          </div>

          <p className="text-xs text-white/55">
            Need help? Contact us at{" "}
            <a href="mailto:support@lethalsolutions.me" className="text-[#f97316] hover:underline">
              support@lethalsolutions.me
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
