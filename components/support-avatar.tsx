"use client"

import { useState } from "react"
import Image from "next/image"

export type SupportPersona = "ujuk" | "vsx"

const PERSONA_META: Record<SupportPersona, { initial: string; label: string }> = {
  ujuk: { initial: "U", label: "ujuk" },
  vsx: { initial: "V", label: "vsx" },
}

/** Avatar for the support team. Renders /support/{persona}.png when available,
 *  falls back to a circular gradient badge with the persona initial. Shared
 *  between review cards, admin dashboard, and any future "who responded" UI. */
export function SupportAvatar({
  persona,
  size = 24,
  className = "",
}: {
  persona: SupportPersona
  size?: number
  className?: string
}) {
  const [errored, setErrored] = useState(false)
  const { initial } = PERSONA_META[persona]

  const fallback = (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full font-bold text-white/90 shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.floor(size * 0.42)),
        background: "linear-gradient(135deg, #ff7a1a 0%, #1a0f08 95%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {initial}
    </span>
  )

  if (errored) return fallback

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/support/${persona}.jpg`}
        alt={`${persona} support avatar`}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        className="h-full w-full object-cover"
        unoptimized
      />
    </span>
  )
}

export function supportPersonaLabel(persona: SupportPersona) {
  return PERSONA_META[persona].label
}
