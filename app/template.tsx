"use client"

import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

/**
 * App Router template — re-mounts on every route change, which lets Framer
 * Motion run an entrance animation per-route. Keeps layout.tsx shell persistent
 * while children fade/slide in smoothly. Respects reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  )
}
