"use client"

import { forwardRef, useCallback, useRef, type HTMLAttributes, type ReactNode } from "react"

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Optional tilt in degrees max (default 4). 0 disables tilt. */
  tilt?: number
  /** Disable spotlight glow */
  noSpotlight?: boolean
  as?: "div" | "article" | "section" | "li"
}

/**
 * Cursor-tracked spotlight card:
 *  - Sets CSS vars --mx / --my so the .spotlight-card::before gradient follows the cursor
 *  - Optional 3D micro-tilt via rotateX / rotateY (default ±4deg), resets on leave
 *  - No effect on touch / reduced-motion (CSS media query on .spotlight-card::before)
 *  - Render as any block element via `as` prop
 */
export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(function SpotlightCard(
  { children, tilt = 4, noSpotlight = false, className = "", as: _As = "div", ...rest },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null)
  const Comp = _As as "div"

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      innerRef.current = el
      if (typeof ref === "function") ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
    },
    [ref],
  )

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = innerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty("--mx", `${x}px`)
      el.style.setProperty("--my", `${y}px`)
      if (tilt > 0) {
        const px = (x / rect.width - 0.5) * 2 // -1..1
        const py = (y / rect.height - 0.5) * 2
        el.style.setProperty("--rx", `${(-py * tilt).toFixed(2)}deg`)
        el.style.setProperty("--ry", `${(px * tilt).toFixed(2)}deg`)
      }
    },
    [tilt],
  )

  const handleLeave = useCallback(() => {
    const el = innerRef.current
    if (!el) return
    if (tilt > 0) {
      el.style.setProperty("--rx", "0deg")
      el.style.setProperty("--ry", "0deg")
    }
  }, [tilt])

  return (
    <Comp
      ref={setRefs as never}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`${noSpotlight ? "" : "spotlight-card"} ${tilt > 0 ? "tilt-3d" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Comp>
  )
})
