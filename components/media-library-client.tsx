"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Play, Eye, X, Share2, Check, Film, Clapperboard } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MEDIA_LIBRARY, findMediaBySlug, type MediaItem } from "@/lib/media-library"
import { MediaPlayer } from "@/components/media-player"

export function MediaLibrary() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialSlug = searchParams?.get("v")
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug && findMediaBySlug(initialSlug) ? initialSlug : null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const s = searchParams?.get("v")
    if (s && findMediaBySlug(s)) setActiveSlug(s)
    else if (!s) setActiveSlug(null)
  }, [searchParams])

  const openVideo = (slug: string) => {
    setActiveSlug(slug)
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.set("v", slug)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const closeVideo = () => {
    setActiveSlug(null)
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.delete("v")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!activeSlug) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeVideo() }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug])

  const copyLink = async () => {
    if (!activeSlug) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/media?v=${activeSlug}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* noop */ }
  }

  const active = findMediaBySlug(activeSlug)

  return (
    <>
      {/* Video grid / empty state */}
      <section className="pb-20 px-6 sm:px-10 relative z-10">
        <div className="max-w-[1280px] mx-auto">
          {MEDIA_LIBRARY.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {MEDIA_LIBRARY.map((m) => (
                <VideoCard key={m.slug} item={m} onOpen={() => openVideo(m.slug)} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      {/* Modal player */}
      {active && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" data-lenis-prevent>
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={closeVideo}
          />

          <div className="relative w-full max-w-5xl animate-in fade-in zoom-in-95 duration-200" data-lenis-prevent>
            {/* Close button */}
            <button
              onClick={closeVideo}
              aria-label="Close"
              className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-10 h-10 rounded-full bg-black/90 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-[#f97316]/50 hover:bg-[#f97316]/20 transition-all z-[3]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Player wrapper */}
            <MediaPlayer item={active} key={active.slug} />

            {/* Below-player meta */}
            <div className="mt-5 px-1">
              <h3 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.02em] text-white mb-2">{active.title}</h3>
              <div className="flex items-center gap-4 text-[12px] text-white/45 mb-3">
                <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {active.views} views</span>
                <span className="text-white/20">·</span>
                <span>{active.uploaded}</span>
              </div>
              <p className="text-[13.5px] text-white/60 leading-[1.7] max-w-3xl">{active.description}</p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={copyLink}
                  data-cursor="cta"
                  className={`cursor-cta press-spring inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all ${
                    copied
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                      : "bg-white/[0.04] border border-white/[0.08] text-white/70 hover:border-[#f97316]/35 hover:text-[#f97316]"
                  }`}
                >
                  {copied ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Share2 className="h-3.5 w-3.5" />}
                  {copied ? "Link copied" : "Share"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function VideoCard({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [previewReady, setPreviewReady] = useState(false)
  const [hovering, setHovering] = useState(false)

  // Hover-preview: 3-second loop of the first few seconds of the video, muted.
  // Starts when the pointer enters the card, resets on leave. Only runs on
  // devices that support hover and only when item.src is defined.
  const hasSrc = Boolean(item.src)

  const handleEnter = () => {
    setHovering(true)
    const v = videoRef.current
    if (!v || !hasSrc) return
    try {
      v.currentTime = 0
      v.muted = true
      v.playbackRate = 1
      void v.play().catch(() => { /* autoplay rejected — ignore */ })
    } catch { /* noop */ }
  }

  const handleLeave = () => {
    setHovering(false)
    const v = videoRef.current
    if (!v) return
    try {
      v.pause()
      v.currentTime = 0
    } catch { /* noop */ }
  }

  // When preview has been playing for 3s, scrub back to 0 so it loops visibly
  useEffect(() => {
    if (!hovering) return
    const v = videoRef.current
    if (!v || !hasSrc) return
    const id = window.setInterval(() => {
      if (!v) return
      if (v.currentTime >= 3) {
        try { v.currentTime = 0 } catch { /* noop */ }
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [hovering, hasSrc])

  return (
    <button
      onClick={onOpen}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      data-cursor="cta"
      data-cursor-label="Play"
      className="cursor-cta press-spring group text-left flex flex-col gap-3 focus:outline-none"
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.06] group-hover:border-[#f97316]/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.5),0_0_40px_rgba(249,115,22,0.12)]"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, ${item.accent?.[0] ?? "#f97316"}55, transparent 60%), radial-gradient(ellipse at 75% 80%, ${item.accent?.[1] ?? "#7c2d12"}55, transparent 60%), #060606`,
        }}
      >
        {/* Poster image (preferred when available) */}
        {item.poster && (
          <img
            src={item.poster}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              hovering && previewReady ? "opacity-0" : "opacity-100"
            }`}
          />
        )}

        {/* Preview video — muted, plays on hover for 3s scrub loop */}
        {hasSrc && (
          <video
            ref={videoRef}
            src={item.src}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            onLoadedData={() => setPreviewReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
              hovering && previewReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 2px)" }} />

        {/* Progress-scrub bar — visible while hover-preview is playing */}
        {hasSrc && (
          <div
            className={`absolute inset-x-0 bottom-0 h-0.5 bg-white/5 pointer-events-none transition-opacity duration-200 ${
              hovering && previewReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <span
              className="block h-full bg-gradient-to-r from-[#fbbf24] to-[#f97316]"
              style={{ animation: hovering ? "mediaScrub 3s linear infinite" : undefined }}
            />
          </div>
        )}

        {/* Big play on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="w-14 h-14 rounded-full bg-[#f97316] text-black flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.6)]">
            <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
          </span>
        </div>

        {/* Duration */}
        <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white bg-black/80 rounded px-1.5 py-0.5 border border-white/10">{item.duration}</span>

        {/* Shine sweep on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 pointer-events-none" />
      </div>

      {/* Meta */}
      <div>
        <h3 className="font-display font-bold text-[14.5px] text-white leading-[1.35] tracking-tight line-clamp-2 group-hover:text-[#f97316] transition-colors">{item.title}</h3>
        <p className="text-[11.5px] text-white/45 mt-1">
          <span className="tabular-nums">{item.views}</span> views · {item.uploaded}
        </p>
      </div>

      <style jsx>{`
        @keyframes mediaScrub {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </button>
  )
}

function EmptyState() {
  // Editorial "coming soon" — intentional, not broken. Three ghost tiles + a
  // centered card with discord CTA. Mirrors the real 3-col grid so the layout
  // doesn't collapse when videos land.
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Chapter eyebrow */}
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] font-bold text-white/45 mb-8">
        <span className="tabular-nums">01 / 01</span>
        <span className="h-px w-10 bg-white/25" />
        <span>The reel</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {/* 3 ghost tiles — scanline "recording soon" aesthetic */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-video rounded-xl overflow-hidden border border-dashed border-white/[0.08] bg-white/[0.012]"
          >
            {/* Soft orange vignette */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(ellipse at 50% 120%, rgba(249,115,22,${0.22 - i * 0.05}), transparent 60%)`,
              }}
            />
            {/* Scanlines */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.8) 0 1px, transparent 1px 3px)" }}
            />
            {/* "REC" style marker — pulsing dot + halo ping */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.65)]" />
              </span>
              <span className="text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase">
                {i === 0 ? "Setup walkthrough" : i === 1 ? "Unboxing" : "Patch recap"}
              </span>
            </div>
            {/* Centered film icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <Film className="h-4 w-4 text-white/25" strokeWidth={1.5} />
              </div>
            </div>
            {/* Duration pill */}
            <span className="absolute bottom-3 right-3 text-[10px] font-mono text-white/35 bg-black/60 rounded px-1.5 py-0.5 border border-white/[0.06]">
              --:--
            </span>
          </motion.div>
        ))}
      </div>

      {/* Centered CTA card below the tiles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 mx-auto max-w-xl rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/25 mb-4">
          <Clapperboard className="h-5 w-5 text-[#f97316]" strokeWidth={1.75} />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-[-0.02em] mb-2">
          First cuts dropping soon.
        </h3>
        <p className="text-[14px] text-white/55 leading-relaxed mb-6 max-w-md mx-auto">
          Setup walkthroughs, unboxings, and patch recaps land on Discord first. Get the ping before they hit the site.
        </p>
        <Link
          href="https://discord.gg/lethaldma"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="cta"
          className="cursor-cta press-spring inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white text-[13px] font-bold shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 transition-all"
        >
          Hop in Discord <span aria-hidden>→</span>
        </Link>
      </motion.div>
    </motion.div>
  )
}
