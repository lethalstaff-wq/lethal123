"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, Copy, Check, Zap, ShoppingBag } from "lucide-react"
import Link from "next/link"

const POPUP_STORAGE_KEY = "lethal_fortune_wheel_v3"
const COUPON_STORAGE_KEY = "lethal_won_coupon_v3"

const WHEEL_SEGMENTS = [
  { label: "5%",  code: "LETHAL5",  discount: 5,  type: "dark" as const },
  { label: "10%", code: "SPIN10",   discount: 10, type: "orange" as const },
  { label: "15%", code: "LUCKY15",  discount: 15, type: "dark" as const },
  { label: "7%",  code: "WIN7",     discount: 7,  type: "gold" as const },
  { label: "20%", code: "MEGA20",   discount: 20, type: "dark" as const },
  { label: "12%", code: "SAVE12",   discount: 12, type: "orange" as const },
  { label: "8%",  code: "DEAL8",    discount: 8,  type: "dark" as const },
  { label: "25%", code: "JACKPOT",  discount: 25, type: "gold" as const },
]

const SEGMENT_COLORS = {
  dark: { fill: "#151517", text: "#EF6F29" },
  orange: { fill: "#EF6F29", text: "#ffffff" },
  gold: { fill: "#FFB347", text: "#0a0a0a" },
}

// Weights: 5% and 7% are common, 25% is very rare
const WEIGHTS = [22, 20, 12, 18, 5, 12, 8, 3]

export function FortuneWheelPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [wonSegment, setWonSegment] = useState<typeof WHEEL_SEGMENTS[0] | null>(null)
  const [copied, setCopied] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [countUp, setCountUp] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dismissed = localStorage.getItem(POPUP_STORAGE_KEY)
    const wonCoupon = localStorage.getItem(COUPON_STORAGE_KEY)

    if (dismissed || wonCoupon) {
      if (wonCoupon) {
        const segment = WHEEL_SEGMENTS.find(s => s.code === wonCoupon)
        if (segment) { setWonSegment(segment); setHasSpun(true) }
      }
      return
    }

    const timer = setTimeout(() => setIsOpen(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  const spinWheel = useCallback(() => {
    if (isSpinning || hasSpun) return
    setIsSpinning(true)

    const totalWeight = WEIGHTS.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight
    let winnerIndex = 0
    for (let i = 0; i < WEIGHTS.length; i++) {
      random -= WEIGHTS[i]
      if (random <= 0) { winnerIndex = i; break }
    }

    const segmentAngle = 360 / WHEEL_SEGMENTS.length
    const targetAngle = 360 - (winnerIndex * segmentAngle) - (segmentAngle / 2)
    const spins = 6
    const finalRotation = spins * 360 + targetAngle + (Math.random() * 20 - 10)
    setRotation(finalRotation)

    setTimeout(() => {
      setIsSpinning(false)
      setHasSpun(true)
      const winner = WHEEL_SEGMENTS[winnerIndex]
      setWonSegment(winner)
      setShowConfetti(true)
      localStorage.setItem(COUPON_STORAGE_KEY, winner.code)
      localStorage.setItem(POPUP_STORAGE_KEY, "1")

      // Count up animation
      const duration = 500
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        setCountUp(Math.round(progress * winner.discount))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)

      // Vibrate on mobile
      if (navigator.vibrate) navigator.vibrate(200)

      setTimeout(() => setShowConfetti(false), 3000)
    }, 5500)
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

  const segCount = WHEEL_SEGMENTS.length
  const segAngle = 360 / segCount

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={hasSpun ? handleClose : undefined} />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EF6F29]/15 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: "3s" }} />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[101]">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${50 + (Math.random() - 0.5) * 60}%`,
                top: "50%",
                backgroundColor: ["#EF6F29", "#FFB347", "#ffffff", "#CC5500"][i % 4],
                animation: `confetti-fall ${1.5 + Math.random() * 1.5}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-md rounded-3xl border border-[#EF6F29]/20 bg-[#0c0c0e] shadow-2xl shadow-[#EF6F29]/10 overflow-hidden animate-fade-in-up">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EF6F29]/10 border border-[#EF6F29]/20 mb-5">
            <Zap className="h-4 w-4 text-[#EF6F29]" />
            <span className="text-sm font-bold text-[#EF6F29]">Limited Offer</span>
          </div>

          <h2 className="text-2xl font-black mb-1">
            Spin to <span className="text-[#EF6F29]">Win</span>
          </h2>
          <p className="text-white/40 text-sm mb-6">
            {hasSpun ? "Congratulations! Here's your discount:" : "Every spin wins a discount!"}
          </p>

          {!hasSpun ? (
            <>
              {/* Wheel container */}
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto mb-6">
                {/* Outer glow ring */}
                <div className="absolute inset-[-8px] rounded-full border-2 border-[#EF6F29]/20 shadow-[0_0_60px_rgba(239,111,41,0.2)]" />

                {/* LED dots around the wheel */}
                <div className="absolute inset-[-12px]">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * 360
                    const rad = (angle * Math.PI) / 180
                    const r = 50
                    const x = 50 + r * Math.cos(rad)
                    const y = 50 + r * Math.sin(rad)
                    return (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                          backgroundColor: isSpinning ? (i % 2 === 0 ? "#EF6F29" : "#FFB347") : "#EF6F29",
                          opacity: isSpinning ? (i % 3 === 0 ? 1 : 0.3) : 0.5,
                          animation: isSpinning ? `led-blink 0.15s ease-in-out infinite ${i * 0.03}s` : "none",
                        }}
                      />
                    )
                  })}
                </div>

                {/* Pointer */}
                <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-10">
                  <svg width="24" height="28" viewBox="0 0 24 28" className={hasSpun ? "" : ""}>
                    <defs>
                      <linearGradient id="ptr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF6F29" />
                        <stop offset="100%" stopColor="#CC5500" />
                      </linearGradient>
                      <filter id="ptrshadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                      </filter>
                    </defs>
                    <path d="M12 28 L2 4 Q0 0 4 0 L20 0 Q24 0 22 4 Z" fill="url(#ptr)" filter="url(#ptrshadow)" />
                  </svg>
                </div>

                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className="w-full h-full rounded-full overflow-hidden border-4 border-[#1a1a1a]"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? "5.5s" : "0s",
                    transitionTimingFunction: "cubic-bezier(0.15, 0.85, 0.25, 1)",
                    boxShadow: "0 0 40px rgba(239,111,41,0.15), inset 0 0 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {WHEEL_SEGMENTS.map((segment, i) => {
                      const startAngle = i * segAngle - 90
                      const endAngle = startAngle + segAngle
                      const startRad = (startAngle * Math.PI) / 180
                      const endRad = (endAngle * Math.PI) / 180
                      const x1 = 50 + 50 * Math.cos(startRad)
                      const y1 = 50 + 50 * Math.sin(startRad)
                      const x2 = 50 + 50 * Math.cos(endRad)
                      const y2 = 50 + 50 * Math.sin(endRad)
                      const midAngle = startAngle + segAngle / 2
                      const midRad = (midAngle * Math.PI) / 180
                      const textX = 50 + 33 * Math.cos(midRad)
                      const textY = 50 + 33 * Math.sin(midRad)
                      const colors = SEGMENT_COLORS[segment.type]

                      return (
                        <g key={i}>
                          <path
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                            fill={colors.fill}
                            stroke="#FFB347"
                            strokeWidth="0.3"
                            strokeOpacity="0.4"
                          />
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="7"
                            fontWeight="900"
                            fill={colors.text}
                            transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" } as React.CSSProperties}
                          >
                            {segment.label}
                          </text>
                          {segment.discount >= 20 && (
                            <text
                              x={50 + 42 * Math.cos(midRad)}
                              y={50 + 42 * Math.sin(midRad)}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="5"
                              transform={`rotate(${midAngle + 90}, ${50 + 42 * Math.cos(midRad)}, ${50 + 42 * Math.sin(midRad)})`}
                            >
                              ⚡
                            </text>
                          )}
                        </g>
                      )
                    })}
                    {/* Center */}
                    <circle cx="50" cy="50" r="12" fill="url(#centerGrad)" stroke="#FFB347" strokeWidth="1" />
                    <defs>
                      <linearGradient id="centerGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#EF6F29" />
                        <stop offset="100%" stopColor="#FFB347" />
                      </linearGradient>
                    </defs>
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="5" fontWeight="900" fill="#fff">SPIN</text>
                  </svg>
                </div>
              </div>

              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="w-full py-4 bg-gradient-to-r from-[#EF6F29] to-[#FF8C42] hover:brightness-110 disabled:opacity-60 text-white font-black text-base rounded-xl transition-all shadow-lg shadow-[#EF6F29]/25 hover:shadow-xl hover:shadow-[#EF6F29]/35 active:scale-[0.98]"
              >
                {isSpinning ? "Spinning..." : "SPIN THE WHEEL"}
              </button>
            </>
          ) : wonSegment && (
            <>
              {/* Win display */}
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#EF6F29] to-[#FFB347] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#EF6F29]/30">
                <span className="text-4xl font-black text-white">{countUp}%</span>
              </div>

              <p className="text-white/40 text-sm mb-4">Your exclusive discount code:</p>

              {/* Code with shimmer */}
              <div
                onClick={handleCopy}
                className="relative mx-auto max-w-xs rounded-xl border border-dashed border-[#EF6F29]/50 bg-[#EF6F29]/5 px-6 py-4 cursor-pointer hover:border-[#EF6F29] transition-all my-6 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#EF6F29]/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  <span className="font-mono text-xl font-black text-[#EF6F29]">{wonSegment.code}</span>
                  {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-white/40" />}
                </div>
                <p className="relative text-xs text-white/30 mt-1">{copied ? "Copied!" : "Click to copy"}</p>
              </div>

              <Link href="/products" onClick={handleClose}>
                <button className="w-full py-4 bg-gradient-to-r from-[#EF6F29] to-[#FF8C42] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#EF6F29]/25 hover:shadow-xl hover:shadow-[#EF6F29]/35 flex items-center justify-center gap-2 btn-glow">
                  <ShoppingBag className="h-4 w-4" />
                  Start Shopping
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes led-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes confetti-fall {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          20% { transform: translate(calc(-50% + ${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 60}px), calc(-50% - ${40 + Math.random() * 80}px)) scale(1.2); opacity: 1; }
          100% { transform: translate(calc(-50% + ${Math.random() > 0.5 ? '' : '-'}${40 + Math.random() * 100}px), calc(-50% + ${100 + Math.random() * 200}px)) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
