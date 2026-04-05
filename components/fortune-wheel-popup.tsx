"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, Gift, Copy, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const POPUP_STORAGE_KEY = "lethal_fortune_wheel_v2"
const COUPON_STORAGE_KEY = "lethal_won_coupon_v2"

const WHEEL_SEGMENTS = [
  { label: "5%", code: "EASTER5", color: "#EF6F29", discount: 5 },
  { label: "10%", code: "BUNNY10", color: "#1c1c1f", discount: 10 },
  { label: "15%", code: "EGG15", color: "#FFB347", discount: 15 },
  { label: "7%", code: "SPRING7", color: "#1c1c1f", discount: 7 },
  { label: "20%", code: "EASTER20", color: "#EF6F29", discount: 20 },
  { label: "12%", code: "HUNT12", color: "#1c1c1f", discount: 12 },
  { label: "8%", code: "RABBIT8", color: "#FFB347", discount: 8 },
  { label: "25%", code: "GOLDEN25", color: "#1c1c1f", discount: 25 },
]

export function FortuneWheelPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [wonSegment, setWonSegment] = useState<typeof WHEEL_SEGMENTS[0] | null>(null)
  const [copied, setCopied] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dismissed = localStorage.getItem(POPUP_STORAGE_KEY)
    const wonCoupon = localStorage.getItem(COUPON_STORAGE_KEY)
    
    if (dismissed || wonCoupon) {
      if (wonCoupon) {
        const segment = WHEEL_SEGMENTS.find(s => s.code === wonCoupon)
        if (segment) {
          setWonSegment(segment)
          setHasSpun(true)
        }
      }
      return
    }

    const timer = setTimeout(() => setIsOpen(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  const spinWheel = useCallback(() => {
    if (isSpinning || hasSpun) return
    
    setIsSpinning(true)
    
    const weights = [20, 25, 15, 15, 5, 10, 8, 2]
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight
    let winnerIndex = 0
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        winnerIndex = i
        break
      }
    }
    
    const segmentAngle = 360 / WHEEL_SEGMENTS.length
    const targetAngle = 360 - (winnerIndex * segmentAngle) - (segmentAngle / 2)
    const spins = 5
    const finalRotation = spins * 360 + targetAngle + (Math.random() * 20 - 10)
    
    setRotation(finalRotation)
    
    setTimeout(() => {
      setIsSpinning(false)
      setHasSpun(true)
      setWonSegment(WHEEL_SEGMENTS[winnerIndex])
      localStorage.setItem(COUPON_STORAGE_KEY, WHEEL_SEGMENTS[winnerIndex].code)
      localStorage.setItem(POPUP_STORAGE_KEY, "1")
    }, 4000)
  }, [isSpinning, hasSpun])

  const handleCopy = useCallback(() => {
    if (!wonSegment) return
    navigator.clipboard.writeText(wonSegment.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [wonSegment])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(POPUP_STORAGE_KEY, "1")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={hasSpun ? handleClose : undefined} />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-primary/20 bg-card shadow-2xl shadow-primary/10 overflow-hidden animate-fade-in-up">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-lg">🐰</span>
            <span className="text-sm font-bold text-primary">Easter Sale</span>
            <span className="text-lg">🥚</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Easter <span className="text-primary">Giveaway!</span>
          </h2>
          <p className="text-white/50 text-sm mb-8">
            {hasSpun ? "Happy Easter! Here's your gift:" : "Spin the wheel for your Easter discount!"}
          </p>

          {!hasSpun ? (
            <>
              <div className="relative w-64 h-64 mx-auto mb-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-primary" />
                </div>
                
                <div 
                  ref={wheelRef}
                  className="w-full h-full rounded-full shadow-xl overflow-hidden"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? "4s" : "0s",
                    transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.3, 1)"
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {WHEEL_SEGMENTS.map((segment, i) => {
                      const angle = 360 / WHEEL_SEGMENTS.length
                      const startAngle = i * angle - 90
                      const endAngle = startAngle + angle
                      const startRad = (startAngle * Math.PI) / 180
                      const endRad = (endAngle * Math.PI) / 180
                      const x1 = 50 + 50 * Math.cos(startRad)
                      const y1 = 50 + 50 * Math.sin(startRad)
                      const x2 = 50 + 50 * Math.cos(endRad)
                      const y2 = 50 + 50 * Math.sin(endRad)
                      const midAngle = startAngle + angle / 2
                      const midRad = (midAngle * Math.PI) / 180
                      const textX = 50 + 33 * Math.cos(midRad)
                      const textY = 50 + 33 * Math.sin(midRad)
                      
                      return (
                        <g key={i}>
                          <path
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                            fill={segment.color}
                            stroke="#0a0a0b"
                            strokeWidth="0.5"
                          />
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[8px] font-bold"
                            fill={segment.color === "#1c1c1f" ? "#EF6F29" : "#ffffff"}
                            transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                          >
                            {segment.label}
                          </text>
                        </g>
                      )
                    })}
                    <circle cx="50" cy="50" r="10" fill="#0a0a0b" stroke="#EF6F29" strokeWidth="2" />
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-[5px] font-bold" fill="#EF6F29">SPIN</text>
                  </svg>
                </div>
              </div>

              <Button
                onClick={spinWheel}
                disabled={isSpinning}
                className="w-full py-5 bg-primary hover:bg-primary/90 font-bold rounded-xl"
              >
                {isSpinning ? "Spinning..." : "SPIN THE WHEEL"}
              </Button>
            </>
          ) : wonSegment && (
            <>
              <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center mx-auto mb-6">
                <Gift className="h-10 w-10 text-white" />
              </div>
              
              <div className="text-5xl font-bold text-primary mb-4">
                {wonSegment.discount}% OFF
              </div>
              
              <div
                onClick={handleCopy}
                className="mx-auto max-w-xs rounded-xl border border-dashed border-primary/50 bg-primary/5 px-6 py-4 cursor-pointer hover:border-primary transition-all my-6"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl font-bold">{wonSegment.code}</span>
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-white/40" />}
                </div>
                <p className="text-xs text-white/40 mt-1">{copied ? "Copied!" : "Click to copy"}</p>
              </div>

              <Button onClick={handleClose} className="w-full py-5 bg-primary hover:bg-primary/90 font-bold rounded-xl">
                Start Shopping
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
