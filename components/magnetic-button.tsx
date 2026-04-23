"use client"

import { useRef, useEffect, type ReactNode } from "react"

interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

/**
 * Wraps any child with a magnetic hover effect — cursor subtly pulls the element
 * toward itself on desktop. No effect on touch or reduced-motion.
 */
export function Magnetic({ children, className = "", strength = 0.2 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    if (!window.matchMedia?.("(hover: hover)").matches) return
    const el = ref.current
    if (!el) return

    let rafId = 0
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      target.x = (e.clientX - cx) * strength
      target.y = (e.clientY - cy) * strength
    }
    const handleLeave = () => {
      target.x = 0
      target.y = 0
    }

    const tick = () => {
      current.x += (target.x - current.x) * 0.15
      current.y += (target.y - current.y) * 0.15
      if (el) {
        el.style.transform = `translate(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    el.addEventListener("mousemove", handleMove)
    el.addEventListener("mouseleave", handleLeave)
    rafId = requestAnimationFrame(tick)

    return () => {
      el.removeEventListener("mousemove", handleMove)
      el.removeEventListener("mouseleave", handleLeave)
      cancelAnimationFrame(rafId)
      if (el) el.style.transform = ""
    }
  }, [strength])

  return (
    <span ref={ref} className={`inline-block will-change-transform transition-transform duration-300 ease-out ${className}`}>
      {children}
    </span>
  )
}
