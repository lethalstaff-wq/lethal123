"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Server, Zap, Activity, PanelsTopLeft } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING TECH STACK — 3D Isometric Card Stack
   Three layers: Infrastructure (cyan), Backend/API (purple), UI (white)
   Mouse-tracking tilt, smooth float animation, progressive blur.
   ═══════════════════════════════════════════════════════════════════════ */

// ── Config ──
const PERSPECTIVE  = 2000
const ROT_X        = 28
const ROT_Y        = 22
const MOUSE_RANGE  = 8  // max tilt degrees from mouse
const FLOAT_PX     = 5  // float amplitude in px
const FLOAT_SEC    = 6  // float cycle in seconds

// ── Z layers ──
const Z_INFRA = 0
const Z_API   = 86
const Z_UI    = 172

// ── Colors ──
const C = {
  cyan:     "#00d2ff",
  purple:   "#7b3fe4",
  purpleL:  "#a855f7",
  green:    "#22c55e",
  gray:     "#9ca3af",
}

/* ═══════════════════════════════════════════════════════════════════════
   Float Wrapper — handles the up/down animation per layer
   ═══════════════════════════════════════════════════════════════════════ */
function FloatLayer({
  z,
  delay,
  children,
}: {
  z: number
  delay: number
  children: React.ReactNode
}) {
  return (
    <div
      className="absolute inset-0"
      style={{ transformStyle: "preserve-3d", transform: `translateZ(${z}px)` }}
    >
      <div
        className="ts-float h-full"
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   INFRASTRUCTURE LAYER (Back — Cyan themed)
   ═══════════════════════════════════════════════════════════════════════ */
function InfraLayer() {
  return (
    <div
      className="h-full rounded-[18px] flex flex-col overflow-hidden relative"
      style={{
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid rgba(0,210,255,0.3)`,
        boxShadow: `0 0 30px rgba(0,210,255,0.1)`,
        padding: 22,
      }}
    >
      {/* dot-grid */}
      <div
        className="absolute inset-0 rounded-[18px] pointer-events-none"
        style={{
          opacity: 0.3,
          backgroundImage: `radial-gradient(circle, rgba(0,210,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* header */}
      <div
        className="flex items-center gap-2.5 pb-4 mb-4 relative"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Server className="w-5 h-5" style={{ color: `rgba(0,210,255,0.92)` }} />
        <span
          className="font-mono text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: `rgba(0,210,255,0.92)` }}
        >
          Infrastructure
        </span>
      </div>

      {/* badge + bars */}
      <div className="flex items-center gap-3.5 mt-auto relative">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `rgba(0,210,255,0.1)`, border: `1px solid rgba(0,210,255,0.4)` }}
        >
          <Server className="w-6 h-6" style={{ color: `rgba(0,210,255,0.92)` }} />
        </div>
        <div className="flex-1 grid gap-2.5">
          {/* bar 75% */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: `rgba(0,210,255,0.2)` }}>
            <div
              className="h-full rounded-full"
              style={{
                width: "75%",
                background: `rgba(0,210,255,0.92)`,
                boxShadow: `0 0 10px rgba(0,210,255,0.9)`,
              }}
            />
          </div>
          {/* bar 50% */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: `rgba(0,210,255,0.2)` }}>
            <div
              className="h-full rounded-full"
              style={{ width: "50%", background: `rgba(0,210,255,0.5)` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   API LAYER (Middle — Purple themed)
   ═══════════════════════════════════════════════════════════════════════ */
function ApiLayer() {
  return (
    <div
      className="h-full rounded-[18px] flex flex-col overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid rgba(123,63,228,0.4)`,
        boxShadow: `0 0 40px rgba(123,63,228,0.15)`,
        padding: 22,
      }}
    >
      {/* header */}
      <div
        className="flex items-center gap-2.5 pb-4 mb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Zap className="w-5 h-5" style={{ color: `rgba(123,63,228,0.92)` }} />
        <span
          className="font-mono text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: `rgba(123,63,228,0.92)` }}
        >
          Backend / API
        </span>
      </div>

      {/* endpoint rows */}
      <div className="flex-1 grid gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl"
            style={{
              background: `rgba(123,63,228,0.05)`,
              border: `1px solid rgba(123,63,228,0.1)`,
              padding: 10,
            }}
          >
            <Zap className="w-4 h-4 shrink-0" style={{ color: `rgba(123,63,228,0.75)` }} />
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden relative"
              style={{ background: `rgba(123,63,228,0.2)` }}
            >
              <div
                className="absolute inset-y-0 w-[33%] rounded-full ts-pulse"
                style={{
                  background: `rgba(123,63,228,0.92)`,
                  boxShadow: `0 0 10px rgba(123,63,228,0.9)`,
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   UI LAYER (Front — White/Green themed)
   ═══════════════════════════════════════════════════════════════════════ */
const BARS = [40, 70, 45, 90, 65, 85, 50]

function UiLayer() {
  return (
    <div
      className="h-full rounded-[18px] flex flex-col overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid rgba(255,255,255,0.2)`,
        boxShadow: `0 18px 70px rgba(0,0,0,0.55)`,
      }}
    >
      {/* macOS chrome */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          height: 32,
          padding: "0 14px",
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.85)" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.85)" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.85)" }} />
        <span className="ml-auto font-mono text-[10px]" style={{ color: "rgba(156,163,175,0.95)" }}>
          app.lethal.dev
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-col gap-3.5 p-[22px]">
        {/* icons row */}
        <div className="flex items-center justify-between">
          <PanelsTopLeft className="w-[22px] h-[22px]" style={{ color: "rgba(255,255,255,0.92)" }} />
          <Activity className="w-[18px] h-[18px]" style={{ color: "rgba(34,197,94,0.92)" }} />
        </div>

        {/* metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Users" value="12.4k" />
          <Metric label="Uptime" value="99.9%" green />
        </div>

        {/* chart */}
        <div
          className="flex-1 rounded-[14px] flex items-end gap-1.5 mt-auto"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 12,
            minHeight: 82,
          }}
        >
          {BARS.map((h, i) => (
            <div
              key={i}
              className="flex-1 overflow-hidden"
              style={{
                height: `${h}%`,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "4px 4px 2px 2px",
              }}
            >
              <div
                className="w-full h-full"
                style={{ background: "linear-gradient(transparent, rgba(255,255,255,0.4))" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div
      className="rounded-[14px] flex flex-col justify-between"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        height: 70,
        padding: 12,
      }}
    >
      <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.06em", color: "rgba(156,163,175,0.95)" }}>
        {label}
      </span>
      <span className="tabular-nums" style={{ fontSize: 18, fontWeight: 750, color: green ? "rgba(34,197,94,0.92)" : "rgba(255,255,255,0.92)" }}>
        {value}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════ */
export function FloatingTechStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef     = useRef<HTMLDivElement>(null)
  const frameRef     = useRef(0)
  const hover        = useRef(false)
  const mouseNorm    = useRef({ x: 0, y: 0 })
  const rot          = useRef({ x: ROT_X, y: ROT_Y })
  const target       = useRef({ x: ROT_X, y: ROT_Y })

  /* mouse handlers */
  const onMove = useCallback((e: React.MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect()
    if (!r) return
    mouseNorm.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    }
  }, [])

  const onEnter = useCallback(() => { hover.current = true }, [])
  const onLeave = useCallback(() => {
    hover.current = false
    mouseNorm.current = { x: 0, y: 0 }
  }, [])

  /* animation loop — lerp rotation toward target */
  useEffect(() => {
    const tick = () => {
      const h = hover.current
      target.current.x = ROT_X + (h ? mouseNorm.current.y * -MOUSE_RANGE : 0)
      target.current.y = ROT_Y + (h ? mouseNorm.current.x * MOUSE_RANGE : 0)

      rot.current.x += (target.current.x - rot.current.x) * 0.07
      rot.current.y += (target.current.y - rot.current.y) * 0.07

      if (sceneRef.current) {
        sceneRef.current.style.transform =
          `rotateX(${rot.current.x.toFixed(2)}deg) rotateY(${rot.current.y.toFixed(2)}deg)`
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ perspective: PERSPECTIVE, width: "100%", maxWidth: 600, aspectRatio: "1", margin: "0 auto" }}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "75%", height: "75%",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          filter: "blur(100px)",
          background: "rgba(123,63,228,0.2)",
        }}
      />

      {/* 3D scene */}
      <div
        ref={sceneRef}
        className="relative"
        style={{
          width: "clamp(300px, 55vw, 400px)",
          height: "clamp(300px, 55vw, 400px)",
          transformStyle: "preserve-3d",
          transform: `rotateX(${ROT_X}deg) rotateY(${ROT_Y}deg)`,
        }}
      >
        <FloatLayer z={Z_INFRA} delay={1}><InfraLayer /></FloatLayer>
        <FloatLayer z={Z_API}   delay={0.5}><ApiLayer /></FloatLayer>
        <FloatLayer z={Z_UI}    delay={0}><UiLayer /></FloatLayer>
      </div>

      {/* keyframes */}
      <style jsx global>{`
        .ts-float {
          animation: tsFloat ${FLOAT_SEC}s ease-in-out infinite;
        }
        @keyframes tsFloat {
          0%, 100% { transform: translateY(${FLOAT_PX}px); }
          50%      { transform: translateY(-${FLOAT_PX}px); }
        }
        .ts-pulse {
          animation: tsPulse 2.8s linear infinite;
        }
        @keyframes tsPulse {
          0%   { left: -33%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
