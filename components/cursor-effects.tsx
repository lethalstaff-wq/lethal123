"use client"

import { useEffect, useState, useCallback } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  color: string
}

export function CursorEffects() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMoving, setIsMoving] = useState(false)

  const createParticle = useCallback((x: number, y: number) => {
    const colors = ["#EF6F29", "#FFB347", "#fdba74", "#fff7ed"]
    return {
      id: Date.now() + Math.random(),
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      size: Math.random() * 6 + 2,
      opacity: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let lastX = 0
    let lastY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const distance = Math.sqrt(dx * dx + dy * dy)

      setMousePos({ x: e.clientX, y: e.clientY })
      setIsMoving(true)

      // Only create particles if mouse moved enough
      if (distance > 8) {
        lastX = e.clientX
        lastY = e.clientY
        setParticles((prev) => {
          const newParticles = [...prev, createParticle(e.clientX, e.clientY)]
          // Keep only last 20 particles
          return newParticles.slice(-20)
        })
      }

      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsMoving(false), 100)
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timeoutId)
    }
  }, [createParticle])

  // Fade out particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, opacity: p.opacity - 0.05 }))
          .filter((p) => p.opacity > 0)
      )
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed z-[9999] hidden lg:block"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="rounded-full transition-all duration-150 ease-out"
          style={{
            width: isMoving ? 40 : 20,
            height: isMoving ? 40 : 20,
            background: `radial-gradient(circle, rgba(239, 111, 41, ${isMoving ? 0.4 : 0.2}) 0%, transparent 70%)`,
            filter: "blur(2px)",
          }}
        />
      </div>

      {/* Particle trail */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="pointer-events-none fixed z-[9998] rounded-full hidden lg:block"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: "translate(-50%, -50%)",
            transition: "opacity 0.1s ease-out",
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </>
  )
}
