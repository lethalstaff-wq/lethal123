"use client"

import { forwardRef } from "react"
import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Site-wide primary CTA — matches the active navbar pill + Customer Login
 * button. Glossy 3-stop orange gradient with inset highlight, dark bottom edge,
 * hairline ring, double outer glow, and a translucent top sheen overlay.
 *
 * Use this for every "big orange action button" on the site: Buy Now, Sign In,
 * Create Account, Proceed to Checkout, Browse Products, Submit, etc.
 *
 * Sizing via `size` prop so every instance shares proportions:
 *   sm → h-8  (nav / chip-sized CTAs)
 *   md → h-10 (default — most page CTAs)
 *   lg → h-12 (hero / pricing)
 *   xl → h-14 (hero primary on landing pages)
 *
 * Variants:
 *   solid    → fills with gradient (default)
 *   sticky   → thinner chrome, for mobile sticky bars
 *
 * It renders a raw <button> so it plays with <form> submit / onClick. Wrap in
 * <Link> or a <form> parent to navigate/submit.
 */
type Size = "sm" | "md" | "lg" | "xl"

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-4 text-[12px] gap-1.5",
  md: "h-10 px-5 text-[13px] gap-2",
  lg: "h-12 px-7 text-[14px] gap-2",
  xl: "h-14 px-8 text-[15px] gap-2.5",
}

type Shape = "pill" | "block"

const SHAPE_CLASSES: Record<Shape, string> = {
  pill: "rounded-full",
  block: "rounded-xl",
}

const SHEEN_SHAPE_CLASSES: Record<Shape, string> = {
  pill: "rounded-t-full",
  block: "rounded-t-xl",
}

type SharedProps = {
  size?: Size
  /** Pill (rounded-full, default) or block (rounded-xl) for form submits. */
  shape?: Shape
  /** If true, button fills 100% of the parent width (good for card CTAs). */
  full?: boolean
  /** Optional left icon */
  leftIcon?: ReactNode
  /** Optional right icon */
  rightIcon?: ReactNode
  children: ReactNode
  className?: string
}

const SHARED_STYLE = {
  background: "linear-gradient(180deg, #fb923c 0%, #f97316 52%, #ea580c 100%)",
  boxShadow: [
    "inset 0 1px 0 rgba(255,255,255,0.32)",
    "inset 0 -1px 0 rgba(0,0,0,0.22)",
    "inset 0 0 0 0.5px rgba(255,255,255,0.22)",
    "0 2px 6px -1px rgba(249,115,22,0.45)",
    "0 8px 24px -6px rgba(249,115,22,0.6)",
  ].join(", "),
  textShadow: "0 1px 2px rgba(90,30,0,0.35)",
} as const

function GlossyContent({ shape, leftIcon, children, rightIcon }: { shape: Shape; leftIcon?: ReactNode; children: ReactNode; rightIcon?: ReactNode }) {
  return (
    <>
      {/* Glossy top sheen */}
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-1/2 pointer-events-none", SHEEN_SHAPE_CLASSES[shape])}
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Hover glow amplifier */}
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 opacity-0 group-hover/glossy:opacity-100 transition-opacity duration-300 pointer-events-none", SHAPE_CLASSES[shape])}
        style={{
          boxShadow: "0 4px 12px -2px rgba(249,115,22,0.6), 0 12px 32px -6px rgba(249,115,22,0.7)",
        }}
      />
      {leftIcon && <span className="relative z-[1] inline-flex">{leftIcon}</span>}
      <span className="relative z-[1]">{children}</span>
      {rightIcon && <span className="relative z-[1] inline-flex">{rightIcon}</span>}
    </>
  )
}

const BASE_CLASSES =
  "group/glossy relative inline-flex items-center justify-center overflow-hidden font-bold text-white border-0 select-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300"

export type GlossyButtonProps = SharedProps & ComponentPropsWithoutRef<"button">

export const GlossyButton = forwardRef<HTMLButtonElement, GlossyButtonProps>(
  ({ size = "md", shape = "pill", full = false, leftIcon, rightIcon, children, className, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          BASE_CLASSES,
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          SIZE_CLASSES[size],
          SHAPE_CLASSES[shape],
          full && "w-full",
          className,
        )}
        style={SHARED_STYLE}
        {...rest}
      >
        <GlossyContent shape={shape} leftIcon={leftIcon} rightIcon={rightIcon}>
          {children}
        </GlossyContent>
      </button>
    )
  },
)
GlossyButton.displayName = "GlossyButton"

/** Link-rendering variant — same chrome, works with Next's client navigation. */
export type GlossyLinkProps = SharedProps & ComponentPropsWithoutRef<typeof Link>

export const GlossyLink = forwardRef<HTMLAnchorElement, GlossyLinkProps>(
  ({ size = "md", shape = "pill", full = false, leftIcon, rightIcon, children, className, ...rest }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          BASE_CLASSES,
          SIZE_CLASSES[size],
          SHAPE_CLASSES[shape],
          full && "w-full",
          className,
        )}
        style={SHARED_STYLE}
        {...rest}
      >
        <GlossyContent shape={shape} leftIcon={leftIcon} rightIcon={rightIcon}>
          {children}
        </GlossyContent>
      </Link>
    )
  },
)
GlossyLink.displayName = "GlossyLink"
