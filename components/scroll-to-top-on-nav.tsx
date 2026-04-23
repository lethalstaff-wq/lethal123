"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Reset scroll to top on every route change. Next App Router preserves scroll
 * by default; combined with Lenis smooth-scroll it can land mid-page when
 * navigating into a new product. This forces top-of-page on path change.
 */
export function ScrollToTopOnNav() {
  const pathname = usePathname()

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (to: number, opts?: unknown) => void } }).__lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
    }
  }, [pathname])

  return null
}
