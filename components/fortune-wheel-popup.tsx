"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, Copy, Check, ShoppingBag } from "lucide-react"
import Link from "next/link"

const POPUP_STORAGE_KEY = "lethal_fortune_wheel_easter"
const COUPON_STORAGE_KEY = "lethal_won_coupon_easter"

const WHEEL_SEGMENTS = [
  { label: "5%",  code: "EASTER5",  discount: 5,  color: "#8B5CF6", textColor: "#fff" },
  { label: "10%", code: "BUNNY10",  discount: 10, color: "#F472B6", textColor: "#fff" },
  { label: "15%", code: "EGG15",    discount: 15, color: "#34D399", textColor: "#fff" },
  { label: "7%",  code: "SPRING7",  discount: 7,  color: "#FBBF24", textColor: "#1a1a1a" },
  { label: "20%", code: "EASTER20", discount: 20, color: "#60A5FA", textColor: "#fff" },
  { label: "12%", code: "HUNT12",   discount: 12, color: "#FB923C", textColor: "#fff" },
  { label: "8%",  code: "RABBIT8",  discount: 8,  color: "#A78BFA", textColor: "#fff" },
  { label: "25%", code: "GOLDEN25", discount: 25, color: "#FCD34D", textColor: "#1a1a1a" },
]

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
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartAngle, setDragStartAngle] = useState(0)
  const [dragRotation, setDragRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

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

  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - centerRef.current.x
    const dy = clientY - centerRef.current.y
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }, [])

  const doSpin = useCallback(() => {
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

      const duration = 500
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        setCountUp(Math.round(progress * winner.discount))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)

      if (navigator.vibrate) navigator.vibrate(200)
      setTimeout(() => setShowConfetti(false), 3000)
    }, 5500)
  }, [isSpinning, hasSpun])

  // Drag-to-spin handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isSpinning || hasSpun) return
    const rect = wheelRef.current?.getBoundingClientRect()
    if (!rect) return
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    setIsDragging(true)
    setDragStartAngle(getAngleFromEvent(e.clientX, e.clientY))
    setDragRotation(0)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [isSpinning, hasSpun, getAngleFromEvent])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const currentAngle = getAngleFromEvent(e.clientX, e.clientY)
    const delta = currentAngle - dragStartAngle
    setDragRotation(delta)
  }, [isDragging, dragStartAngle, getAngleFromEvent])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (Math.abs(dragRotation) > 30) {
      doSpin()
    }
    setDragRotation(0)
  }, [isDragging, dragRotation, doSpin])

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

      {/* Easter glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: "3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: "4s" }} />

      {/* Confetti — easter eggs */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[101]">
          {Array.from({ length: 40 }).map((_, i) => {
            const dx = (Math.random() - 0.5) * 200
            const dy = 100 + Math.random() * 200
            return (
              <div
                key={i}
                className="absolute text-sm animate-[confettiFall_2s_ease-out_forwards]"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 40}%`,
                  top: "50%",
                  animationDelay: `${Math.random() * 0.4}s`,
                  animationDuration: `${1.5 + Math.random() * 1.5}s`,
                  // @ts-expect-error CSS custom properties
                  "--dx": `${dx}px`,
                  "--fall": `${dy}px`,
                }}
              >
                {["🥚", "🐰", "🌸", "🐣", "✨", "🎀"][i % 6]}
              </div>
            )
          })}
        </div>
      )}

      <div className="relative w-full max-w-md rounded-3xl border border-purple-500/20 bg-[#0c0c0e] shadow-2xl shadow-purple-500/10 overflow-hidden animate-fade-in-up">
        <button onClick={handleClose} className="absolute top-4 right-4 z-20 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-8 text-center">
          {/* Easter badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
            <span className="text-base">🐰</span>
            <span className="text-sm font-bold text-purple-400">Easter Sale</span>
            <span className="text-base">🥚</span>
          </div>

          <h2 className="text-2xl font-black mb-1">
            Spin the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">Easter Egg</span>
          </h2>
          <p className="text-white/40 text-sm mb-6">
            {hasSpun ? "Happy Easter! Here's your discount:" : "Every spin wins a discount! 🐣"}
          </p>

          {!hasSpun ? (
            <>
              {/* Wheel */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto mb-6">
                {/* Outer glow ring */}
                <div className="absolute inset-[-8px] rounded-full border-2 border-purple-500/20 shadow-[0_0_60px_rgba(168,85,247,0.15)]" />

                {/* LED dots — pastel easter colors */}
                <div className="absolute inset-[-12px]">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * 360
                    const rad = (angle * Math.PI) / 180
                    const r = 50
                    const x = 50 + r * Math.cos(rad)
                    const y = 50 + r * Math.sin(rad)
                    const colors = ["#8B5CF6", "#F472B6", "#34D399", "#FBBF24", "#60A5FA", "#FB923C"]
                    return (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          left: `${x}%`, top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                          backgroundColor: colors[i % colors.length],
                          opacity: isSpinning ? 1 : 0.5,
                          animation: isSpinning ? `led-blink 0.15s ease-in-out infinite ${i * 0.03}s` : "none",
                        }}
                      />
                    )
                  })}
                </div>

                {/* Pointer */}
                <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-10">
                  <svg width="24" height="28" viewBox="0 0 24 28">
                    <defs>
                      <linearGradient id="easterPtr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A78BFA" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                      <filter id="easterPtrShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                      </filter>
                    </defs>
                    <path d="M12 28 L2 4 Q0 0 4 0 L20 0 Q24 0 22 4 Z" fill="url(#easterPtr)" filter="url(#easterPtrShadow)" />
                  </svg>
                </div>

                {/* Wheel SVG */}
                <div
                  ref={wheelRef}
                  className="w-full h-full rounded-full overflow-hidden border-4 border-[#1a1a1a] select-none touch-none"
                  style={{
                    transform: `rotate(${isSpinning ? rotation : dragRotation}deg)`,
                    transitionDuration: isSpinning ? "5.5s" : "0s",
                    transitionTimingFunction: "cubic-bezier(0.15, 0.85, 0.25, 1)",
                    boxShadow: "0 0 40px rgba(168,85,247,0.15), inset 0 0 20px rgba(0,0,0,0.5)",
                    cursor: isSpinning ? "not-allowed" : "grab",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
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

                      return (
                        <g key={i}>
                          <path
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                            fill={segment.color}
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="0.3"
                          />
                          <text
                            x={textX} y={textY}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize="7" fontWeight="900"
                            fill={segment.textColor}
                            transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" } as React.CSSProperties}
                          >
                            {segment.label}
                          </text>
                          {/* Easter egg icon on special segments */}
                          {segment.discount >= 20 && (
                            <text
                              x={50 + 42 * Math.cos(midRad)} y={50 + 42 * Math.sin(midRad)}
                              textAnchor="middle" dominantBaseline="middle" fontSize="5"
                              transform={`rotate(${midAngle + 90}, ${50 + 42 * Math.cos(midRad)}, ${50 + 42 * Math.sin(midRad)})`}
                            >
                              🥚
                            </text>
                          )}
                        </g>
                      )
                    })}
                    {/* Center */}
                    <circle cx="50" cy="50" r="13" fill="url(#easterCenter)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                    <defs>
                      <radialGradient id="easterCenter" cx="40%" cy="40%">
                        <stop offset="0%" stopColor="#C084FC" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </radialGradient>
                    </defs>
                    <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" fontSize="6">🐰</text>
                    <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fontWeight="900" fill="#fff">SPIN</text>
                  </svg>
                </div>

                {/* Drag hint */}
                {!isSpinning && (
                  <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/25 whitespace-nowrap">
                    Drag to spin or tap the button
                  </p>
                )}
              </div>

              <button
                onClick={doSpin}
                disabled={isSpinning}
                className="w-full py-4 mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 disabled:opacity-60 text-white font-black text-base rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 active:scale-[0.98]"
              >
                {isSpinning ? "🐰 Spinning..." : "🥚 SPIN THE EGG"}
              </button>
            </>
          ) : wonSegment && (
            <>
              {/* Win display */}
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <div className="absolute inset-1 rounded-[20px] bg-[#0c0c0e] flex items-center justify-center">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-400">{countUp}%</span>
                </div>
              </div>

              <p className="text-white/40 text-sm mb-2">🐣 Happy Easter! Your code:</p>

              {/* Code */}
              <div
                onClick={handleCopy}
                className="relative mx-auto max-w-xs rounded-xl border border-dashed border-purple-500/50 bg-purple-500/5 px-6 py-4 cursor-pointer hover:border-purple-400 transition-all my-6 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  <span className="font-mono text-xl font-black text-purple-400">{wonSegment.code}</span>
                  {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-white/40" />}
                </div>
                <p className="relative text-xs text-white/30 mt-1">{copied ? "Copied!" : "Click to copy"}</p>
              </div>

              <Link href="/products" onClick={handleClose}>
                <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 flex items-center justify-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Start Shopping 🐰
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes led-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) scale(0); opacity: 1; }
          15% { transform: translateX(calc(var(--dx, 30px) * 0.3)) translateY(-60px) scale(1.3); opacity: 1; }
          100% { transform: translateX(var(--dx, 30px)) translateY(var(--fall, 150px)) scale(0.6); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
