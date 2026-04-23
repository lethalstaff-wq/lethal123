"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Settings } from "lucide-react"
import type { MediaItem } from "@/lib/media-library"

interface MediaPlayerProps {
  item: MediaItem
}

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function MediaPlayer({ item }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [speedOpen, setSpeedOpen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const hideTimer = useRef<number | null>(null)

  const hasVideo = Boolean(item.src)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrent(v.currentTime)
    const onMeta = () => setDuration(v.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener("timeupdate", onTime)
    v.addEventListener("loadedmetadata", onMeta)
    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    return () => {
      v.removeEventListener("timeupdate", onTime)
      v.removeEventListener("loadedmetadata", onMeta)
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
    }
  }, [item.slug])

  // Reset state on item change
  useEffect(() => {
    setPlaying(false); setCurrent(0); setDuration(0); setSpeedOpen(false)
    const v = videoRef.current
    if (v) { try { v.load() } catch { /* noop */ } }
  }, [item.slug])

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => { /* noop */ })
    else v.pause()
  }, [])

  const seek = (pct: number) => {
    const v = videoRef.current
    if (!v || !isFinite(v.duration)) return
    v.currentTime = Math.max(0, Math.min(v.duration, v.duration * pct))
  }

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    seek((e.clientX - rect.left) / rect.width)
  }

  const skip = (s: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min((isFinite(v.duration) ? v.duration : Infinity), v.currentTime + s))
  }

  const setVol = (v: number) => {
    const vid = videoRef.current
    const clamped = Math.max(0, Math.min(1, v))
    setVolume(clamped)
    if (vid) vid.volume = clamped
    if (clamped > 0 && muted) setMuted(false)
  }

  const toggleMute = () => {
    const v = videoRef.current
    const next = !muted
    setMuted(next)
    if (v) v.muted = next
  }

  const setSpeedVal = (s: number) => {
    setSpeed(s)
    const v = videoRef.current
    if (v) v.playbackRate = s
    setSpeedOpen(false)
  }

  const requestFs = () => {
    const el = wrapperRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.().catch(() => { /* noop */ })
  }

  const armHide = () => {
    setShowControls(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (playing) setShowControls(false)
    }, 2400)
  }

  // Keyboard shortcuts while focused on the player
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === " ") { e.preventDefault(); toggle() }
      else if (e.key === "ArrowRight") skip(5)
      else if (e.key === "ArrowLeft") skip(-5)
      else if (e.key === "m" || e.key === "M") toggleMute()
      else if (e.key === "f" || e.key === "F") requestFs()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, muted])

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(249,115,22,0.10)] group"
      onMouseMove={armHide}
      onMouseLeave={() => playing && setShowControls(false)}
      data-lenis-prevent
    >
      {/* Video element or placeholder */}
      {hasVideo ? (
        <video
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onClick={toggle}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={toggle}
          style={{
            background: `radial-gradient(ellipse at 30% 35%, ${item.accent?.[0] ?? "#f97316"}55, transparent 58%), radial-gradient(ellipse at 75% 75%, ${item.accent?.[1] ?? "#7c2d12"}55, transparent 60%), #060606`,
          }}
        >
          {/* Faux frame grid */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="relative text-center px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30 mb-3">Video src not configured</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight max-w-xl">{item.title}</p>
          </div>
        </div>
      )}

      {/* Big center play button — visible when paused */}
      {!playing && (
        <button
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="relative w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_50px_rgba(249,115,22,0.25)] group-hover:scale-105 transition-transform duration-300">
            <span className="absolute inset-0 rounded-full bg-[#f97316]/35 animate-ping opacity-40" />
            <Play className="relative h-8 w-8 text-white translate-x-0.5" fill="currentColor" />
          </span>
        </button>
      )}

      {/* Gradient overlay for controls legibility */}
      <div className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`} style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))" }} />

      {/* Top meta */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Lethal Player
          </span>
          <span className="text-[11px] text-white/65 font-mono bg-black/40 rounded px-2 py-0.5 border border-white/10">{item.duration}</span>
        </div>
        <span className="text-[11px] text-white/55 uppercase tracking-[0.18em] font-semibold">{item.views} views · {item.uploaded}</span>
      </div>

      {/* Controls */}
      <div className={`absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Progress */}
        <div
          className="relative h-1.5 rounded-full bg-white/15 cursor-pointer group/prog mb-3"
          onClick={onProgressClick}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#f97316]"
            style={{ width: `${pct}%`, boxShadow: "0 0 10px rgba(249,115,22,0.6)" }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#f97316] border-2 border-white shadow-[0_0_10px_rgba(249,115,22,0.9)] opacity-0 group-hover/prog:opacity-100 transition-opacity"
            style={{ left: `calc(${pct}% - 6px)` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => skip(-5)} aria-label="Back 5s" className="text-white/70 hover:text-white transition-colors">
            <SkipBack className="h-4 w-4" />
          </button>
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 hover:bg-[#f97316]/20 hover:border-[#f97316]/50 text-white flex items-center justify-center transition-colors">
            {playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 translate-x-0.5" fill="currentColor" />}
          </button>
          <button onClick={() => skip(5)} aria-label="Forward 5s" className="text-white/70 hover:text-white transition-colors">
            <SkipForward className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 ml-2">
            <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="text-white/70 hover:text-white transition-colors">
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0} max={1} step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVol(Number(e.target.value))}
              aria-label="Volume"
              className="media-vol w-20 accent-[#f97316]"
            />
          </div>

          <span className="ml-2 text-[11px] text-white/75 font-mono tabular-nums">
            {fmt(current)} <span className="text-white/40">/ {duration > 0 ? fmt(duration) : item.duration}</span>
          </span>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSpeedOpen((p) => !p)}
                aria-label="Playback speed"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.10] text-[11px] font-mono text-white/80 hover:bg-white/[0.10] hover:text-white transition-colors"
              >
                <Settings className="h-3 w-3" />
                {speed}×
              </button>
              {speedOpen && (
                <div className="absolute bottom-full right-0 mb-2 rounded-xl border border-white/[0.10] bg-black/95 backdrop-blur-md overflow-hidden min-w-[100px] shadow-[0_10px_24px_rgba(0,0,0,0.5)]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeedVal(s)}
                      className={`w-full text-left px-3 py-1.5 text-[12px] font-mono transition-colors ${
                        s === speed ? "bg-[#f97316]/15 text-[#f97316]" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={requestFs} aria-label="Fullscreen" className="text-white/70 hover:text-white transition-colors">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .media-vol { height: 3px; border-radius: 999px; }
        .media-vol::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; border-radius: 999px; background: #f97316; border: 1px solid #0a0a0a; box-shadow: 0 0 8px rgba(249,115,22,0.8); }
      `}</style>
    </div>
  )
}
