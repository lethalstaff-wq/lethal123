"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Play, ArrowRight } from "lucide-react"
import { MEDIA_LIBRARY } from "@/lib/media-library"

interface Props {
  /** Optional product slug to filter related media; falls back to first few entries. */
  productSlug?: string
}

/**
 * Related media row on product pages. Thumbnails route users into /media?v=<slug>
 * so playback happens inside our own player instead of a modal.
 */
export function ReviewVideoLightbox({ productSlug: _productSlug }: Props) {
  // Library is intentionally flat now; just surface first 3 items.
  const items = useMemo(() => MEDIA_LIBRARY.slice(0, 3), [])

  return (
    <section className="py-16 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-bold mb-1">Watch</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-[-0.025em]">See it in action</h3>
          </div>
          <Link
            href="/media"
            data-cursor="cta"
            className="cursor-cta press-spring inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold text-white/70 border border-white/[0.08] bg-white/[0.02] hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.06] hover:text-[#f97316] transition-all"
          >
            Open full library
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((m) => (
            <Link
              key={m.slug}
              href={`/media?v=${m.slug}`}
              data-cursor="cta"
              data-cursor-label="Play"
              className="cursor-cta press-spring group relative aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-[#1a0a04] via-[#0a0604] to-[#0a0604] hover:border-[#f97316]/35 transition-all hover:-translate-y-0.5 block"
            >
              {/* Gradient backdrop */}
              <div
                className="absolute inset-0 opacity-55 group-hover:opacity-75 transition-opacity"
                style={{
                  background: `radial-gradient(ellipse at 30% 40%, ${m.accent?.[0] ?? "#f97316"}55, transparent 60%), radial-gradient(ellipse at 70% 80%, ${m.accent?.[1] ?? "#7c2d12"}44, transparent 60%)`,
                }}
              />
              <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 1px, transparent 1px 2px)" }} />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-14 h-14 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-[#f97316]/20 group-hover:border-[#f97316]/50 transition-all duration-300 shadow-[0_10px_28px_rgba(0,0,0,0.5)]">
                  <span className="absolute inset-0 rounded-full bg-[#f97316]/30 animate-ping opacity-40 group-hover:opacity-70" />
                  <Play className="relative h-5 w-5 text-white translate-x-0.5" fill="currentColor" />
                </div>
              </div>

              {/* Meta */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-white/70 bg-black/40 rounded px-1.5 py-0.5 border border-white/10">{m.duration}</span>
                </div>
                <p className="text-[13px] text-white font-bold leading-[1.35] line-clamp-2">{m.title}</p>
                <p className="text-[10px] text-white/45 mt-1">{m.views} views · {m.uploaded}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
