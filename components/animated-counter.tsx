"use client"

import { useState, useEffect, useRef } from "react"

interface AnimatedCounterProps {
  value: string
  duration?: number
}

export function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(value)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Extract the numeric part and prefix/suffix
  const match = value.match(/^([<>]?)(\d+(?:\.\d+)?)(%|[a-z+]+)?$/i)
  const canAnimate = !!match && !!match[2]
  const prefix = match?.[1] || ""
  const numericPart = parseFloat(match?.[2] || "0")
  const suffix = match?.[3] || ""
  const isDecimal = value.includes(".")

  useEffect(() => {
    if (hasAnimated || !canAnimate) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateValue()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasAnimated, canAnimate]) // eslint-disable-line react-hooks/exhaustive-deps

  const animateValue = () => {
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = numericPart * eased

      if (isDecimal) {
        setDisplayed(`${prefix}${current.toFixed(1)}${suffix}`)
      } else {
        setDisplayed(`${prefix}${Math.floor(current)}${suffix}`)
      }

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setDisplayed(value)
      }
    }

    requestAnimationFrame(tick)
  }

  return <span ref={ref}>{displayed}</span>
}
