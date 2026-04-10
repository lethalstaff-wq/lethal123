"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Users, Code2, Crown, Headphones, Camera, Search, DollarSign,
  Check, Minus, Plus, Send, CheckCircle2, Sparkles, Shield, Zap, Globe,
  ArrowRight, Clock, Star, ChevronRight, Trophy, Rocket, Heart, ChevronDown,
  MessageSquare, Activity, PanelsTopLeft, Server,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

/* ═══════════════════════════════════════════════════════════════════ */
/* DATA                                                               */
/* ═══════════════════════════════════════════════════════════════════ */
const POSITIONS = [
  { id: "developer", title: "Developer", icon: Code2, color: "#a855f7", popular: false,
    description: "Build and maintain our tools, website, and backend infrastructure",
    requirements: ["Strong Python, TypeScript, or C++", "Reverse engineering / anti-cheat experience", "Self-driven, no hand-holding"],
    openSlots: 1, perks: ["Cutting-edge tech", "Revenue share"] },
  { id: "manager", title: "Head Manager", icon: Crown, color: "#f97316", popular: false,
    description: "Oversee daily operations, team coordination, and strategic business decisions",
    requirements: ["Proven leadership experience", "Available 20+ hours/week", "Business or management background"],
    openSlots: 1, perks: ["Revenue share", "Strategic role"] },
  { id: "support", title: "Support Agent", icon: Headphones, color: "#22c55e", popular: true,
    description: "Help customers with setup, troubleshooting, and orders via Discord",
    requirements: ["Deep knowledge of DMA / spoofers / cheats", "Fast response time under 5 minutes", "Fluent English, patient under pressure"],
    openSlots: 3, perks: ["Commission per ticket", "Flexible schedule"] },
  { id: "media", title: "Media Manager", icon: Camera, color: "#ec4899", popular: false,
    description: "Create content, manage social media, design thumbnails and edit videos. We provide all tools and software you need — zero cost to you",
    requirements: ["Basic video editing (CapCut, Premiere, or AE)", "Willingness to learn — we'll train you", "We provide: Adobe Suite, footage, assets, templates"],
    openSlots: 2, perks: ["Free Adobe Suite", "All assets provided"] },
  { id: "seo", title: "SEO Specialist", icon: Search, color: "#3b82f6", popular: false,
    description: "Optimize search rankings, manage keywords, and drive organic traffic",
    requirements: ["Proven SEO results (show us rankings)", "Ahrefs / SEMrush / GSC experience", "Technical SEO + content strategy"],
    openSlots: 1, perks: ["Performance bonuses", "Own the strategy"] },
  { id: "sales", title: "Sales / Reseller", icon: DollarSign, color: "#eab308", popular: true,
    description: "Sell our products on your own platform and earn industry-leading margins. Bulk discounts up to 80% off retail — you set your own price and keep the difference",
    requirements: ["Own Discord server, Telegram, or community", "Existing audience or customer base", "Hustle mentality — we provide everything else"],
    openSlots: 2, perks: ["Up to 80% bulk discount", "Set your own prices"] },
]

const TEAM_QUOTES = [
  { text: "Joined as a dev 6 months ago. Zero micromanagement, full creative freedom. Best decision I made this year.", name: "cipher", role: "Developer", time: "6 months", color: "#a855f7" },
  { text: "Left my 9-5 for this. Commission here beats a salary and I work from my couch. Not going back.", name: "vex", role: "Sales", time: "4 months", color: "#eab308" },
  { text: "Product actually works which makes support easy. Customers thank me instead of yelling at me lol.", name: "nova", role: "Support", time: "3 months", color: "#22c55e" },
  { text: "I handle all the socials and content. Full creative control, no approval chains, just ship it.", name: "flare", role: "Media", time: "2 months", color: "#ec4899" },
]

const TIMEZONES = [
  { v: "UTC-8", l: "Los Angeles", flag: "🇺🇸" }, { v: "UTC-6", l: "Chicago", flag: "🇺🇸" },
  { v: "UTC-5", l: "New York", flag: "🇺🇸" }, { v: "UTC-3", l: "São Paulo", flag: "🇧🇷" },
  { v: "UTC+0", l: "London", flag: "🇬🇧" }, { v: "UTC+1", l: "Berlin", flag: "🇩🇪" },
  { v: "UTC+1", l: "Paris", flag: "🇫🇷" }, { v: "UTC+2", l: "Kyiv", flag: "🇺🇦" },
  { v: "UTC+3", l: "Moscow", flag: "🇷🇺" }, { v: "UTC+3", l: "Istanbul", flag: "🇹🇷" },
  { v: "UTC+4", l: "Dubai", flag: "🇦🇪" }, { v: "UTC+5:30", l: "Mumbai", flag: "🇮🇳" },
  { v: "UTC+8", l: "Singapore", flag: "🇸🇬" }, { v: "UTC+9", l: "Tokyo", flag: "🇯🇵" },
  { v: "UTC+11", l: "Sydney", flag: "🇦🇺" },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const FAQ = [
  { q: "Is this paid?", a: "Most roles start commission-based or unpaid during trial. Top performers get promoted to paid positions quickly." },
  { q: "How many hours do I need?", a: "Minimum 5-10h/week for most roles. More hours = more opportunities and earnings." },
  { q: "Do I need experience?", a: "Depends on the role. Support needs product knowledge, Developer needs coding skills. Sales just needs hustle." },
  { q: "How fast do you respond?", a: "We review every application within 48 hours and contact you on Discord." },
]

/* ═══════════════════════════════════════════════════════════════════ */
/* TERMINAL ANIMATION                                                 */
/* ═══════════════════════════════════════════════════════════════════ */
const TERMINAL_LINES = [
  { type: "cmd", text: "$ lethal deploy --team" },
  { type: "ok", text: "✓ 10 agents online across 6 timezones" },
  { type: "ok", text: "✓ 774 orders processed this quarter" },
  { type: "ok", text: "✓ 99.8% uptime — zero downtime incidents" },
  { type: "ok", text: "✓ 0 detections — all products clean" },
  { type: "blank", text: "" },
  { type: "cmd", text: "$ hiring --open-positions 10" },
  { type: "info", text: "Scanning for legends..." },
  { type: "info", text: "Remote · Flexible · Commission-based" },
  { type: "prompt", text: "> Your application starts here_" },
]

function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Start when visible
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  // Type effect
  useEffect(() => {
    if (!started) return
    if (visibleLines >= TERMINAL_LINES.length) return

    const currentLine = TERMINAL_LINES[visibleLines]
    if (currentLine.type === "blank") {
      const t = setTimeout(() => { setVisibleLines(v => v + 1); setCharIndex(0) }, 300)
      return () => clearTimeout(t)
    }

    if (charIndex < currentLine.text.length) {
      const speed = currentLine.type === "cmd" ? 40 : 20
      const t = setTimeout(() => setCharIndex(c => c + 1), speed)
      return () => clearTimeout(t)
    } else {
      const delay = currentLine.type === "cmd" ? 600 : 250
      const t = setTimeout(() => { setVisibleLines(v => v + 1); setCharIndex(0) }, delay)
      return () => clearTimeout(t)
    }
  }, [started, visibleLines, charIndex])

  const getColor = (type: string) => {
    if (type === "cmd") return "text-white/80"
    if (type === "ok") return "text-emerald-400/80"
    if (type === "info") return "text-primary/70"
    if (type === "prompt") return "text-primary font-bold"
    return ""
  }

  return (
    <div ref={ref} className="w-full max-w-md">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0c] overflow-hidden shadow-2xl shadow-black/40">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-[11px] text-white/20 font-mono ml-2">lethal@hq ~ /team</span>
        </div>
        {/* Terminal body */}
        <div className="p-5 font-mono text-[13px] leading-relaxed min-h-[260px]">
          {TERMINAL_LINES.slice(0, visibleLines + 1).map((line, i) => {
            if (line.type === "blank") return <div key={i} className="h-3" />
            const isCurrentLine = i === visibleLines
            const displayText = isCurrentLine ? line.text.slice(0, charIndex) : line.text
            return (
              <div key={i} className={`${getColor(line.type)} ${i > 0 ? "mt-1" : ""}`}>
                {displayText}
                {isCurrentLine && visibleLines < TERMINAL_LINES.length && (
                  <span className="inline-block w-[7px] h-[15px] bg-primary/80 ml-0.5 animate-pulse align-middle" style={{ animationDuration: "0.8s" }} />
                )}
              </div>
            )
          })}
          {/* Blinking cursor at the end */}
          {visibleLines >= TERMINAL_LINES.length && (
            <div className="mt-2 text-white/30">
              <span>$ </span>
              <span className="inline-block w-[7px] h-[15px] bg-primary/60 ml-0.5 animate-pulse align-middle" style={{ animationDuration: "1s" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ANIMATED COUNTER                                                   */
/* ═══════════════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const duration = 1500
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setCount(Math.round(ease * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, value])

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>
}

/* ═══════════════════════════════════════════════════════════════════ */
/* TILT CARD HOOK                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
    // light reflection
    const shine = ref.current.querySelector("[data-shine]") as HTMLElement
    if (shine) { shine.style.opacity = "1"; shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.06), transparent 60%)` }
  }, [ref])
  const handleLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)"
    const shine = ref.current.querySelector("[data-shine]") as HTMLElement
    if (shine) shine.style.opacity = "0"
  }, [ref])
  return { onMouseMove: handleMove, onMouseLeave: handleLeave }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* POSITION CARD                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
function PositionCard({ pos, onApply }: { pos: typeof POSITIONS[number]; onApply: (id: string) => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(cardRef)
  return (
    <div ref={cardRef} {...tilt}
      className="group relative rounded-[20px] border border-white/[0.06] bg-[#111113] overflow-hidden transition-all duration-300"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
      {/* Shine overlay */}
      <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-300 rounded-[20px]" />
      {/* Top line */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${pos.color}, transparent)`, opacity: 0.5 }} />

      <div className="p-7 relative z-0">
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.06] group-hover:scale-110 transition-transform duration-300 relative" style={{ background: `linear-gradient(135deg, ${pos.color}20, ${pos.color}05)` }}>
            <pos.icon className="h-6 w-6" style={{ color: pos.color }} />
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: `${pos.color}20` }} />
          </div>
          <div className="flex items-center gap-2">
            {pos.popular && <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">Most Applied</span>}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400">{pos.openSlots} open</span>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-black mb-2 group-hover:text-white transition-colors">{pos.title}</h3>
        <p className="text-sm text-white/35 mb-5 leading-relaxed">{pos.description}</p>
        <div className="space-y-2 mb-5">
          {pos.requirements.map((req, j) => (
            <div key={j} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${pos.color}15` }}>
                <Check className="h-3 w-3" style={{ color: pos.color }} />
              </div>
              <span className="text-xs text-white/30">{req}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {pos.perks.map((p, j) => (
            <span key={j} className="text-[10px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/25 font-medium">{p}</span>
          ))}
        </div>
        <button onClick={() => onApply(pos.id)}
          className="relative w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-white/[0.2] hover:shadow-lg group/btn"
          style={{ ["--c" as string]: pos.color }}>
          {/* Animated border glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 20px ${pos.color}15, 0 0 20px ${pos.color}10` }} />
          <span className="relative z-10">Apply Now</span>
          <ArrowRight className="h-4 w-4 relative z-10 text-white/30 group-hover/btn:text-white/70 group-hover/btn:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* MAIN PAGE                                                          */
/* ═══════════════════════════════════════════════════════════════════ */
export default function ApplyPage() {
  const [position, setPosition] = useState("")
  const [discord, setDiscord] = useState("")
  const [age, setAge] = useState(18)
  const [timezone, setTimezone] = useState("")
  const [hoursPerWeek, setHoursPerWeek] = useState("")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [preferredTime, setPreferredTime] = useState("")
  const [experience, setExperience] = useState("")
  const [whyLethal, setWhyLethal] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [agree16, setAgree16] = useState(false)
  const [agreeActive, setAgreeActive] = useState(false)
  const [agreeUnpaid, setAgreeUnpaid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formStep, setFormStep] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [showStickyBar, setShowStickyBar] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Mouse position for spotlight + particles
  const mousePosRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 })
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  // Particle system on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }> = []

    const colors = ["#EF6F29", "#FF8C42", "#a855f7", "#3b82f6", "#22c55e"]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Init particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mousePosRef.current.x
      const my = mousePosRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse repulsion
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 0.8
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Damping
        p.vx *= 0.98
        p.vy *= 0.98

        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = p.x - p2.x
          const dy2 = p.y - p2.y
          const d = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = "#EF6F29"
            ctx.globalAlpha = (1 - d / 120) * 0.08
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  // Sticky mobile bar
  useEffect(() => {
    const handler = () => setShowStickyBar(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Auto-detect timezone
  useEffect(() => {
    try {
      const offsetMin = new Date().getTimezoneOffset()
      const offsetH = -offsetMin / 60
      const sign = offsetH >= 0 ? "+" : ""
      const utcStr = `UTC${sign}${offsetH}`
      const match = TIMEZONES.find(t => t.v === utcStr)
      if (match) setTimezone(`${match.v}|${match.l}`)
    } catch { /* ignore */ }
  }, [])

  const toggleDay = (d: string) => setSelectedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  const scrollToForm = (id: string) => { setPosition(id); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100) }
  const selectedPos = POSITIONS.find(p => p.id === position)

  const s0 = !!(position && discord.trim().length >= 2 && age >= 16 && timezone.length > 0)
  const s1 = !!(hoursPerWeek && selectedDays.length > 0 && preferredTime)
  const s2 = !!(experience.length >= 50 && whyLethal.length >= 30 && agree16 && agreeActive && agreeUnpaid)

  let filled = 0
  if (position) filled++; if (discord.trim()) filled++; if (timezone) filled++
  if (hoursPerWeek) filled++; if (selectedDays.length) filled++; if (preferredTime) filled++
  if (experience.length >= 50) filled++; if (whyLethal.length >= 30) filled++
  if (agree16 && agreeActive && agreeUnpaid) filled++
  const pct = Math.round((filled / 9) * 100)

  const handleSubmit = async () => {
    if (!s2 || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, discord, age, timezone: timezone.split("|")[0], hoursPerWeek, availableDays: selectedDays, preferredTime, experience, whyLethal, portfolio }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch { toast.error("Failed to submit") }
    setSubmitting(false)
  }

  /* ════ SUCCESS ════ */
  if (submitted) return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[200px] pointer-events-none" />
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="absolute w-2 h-2 rounded-full" style={{
                left: `${Math.random() * 100}%`, top: "-5%",
                backgroundColor: ["#EF6F29", "#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ec4899"][i % 6],
                animation: `confettiFall ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.8}s`,
                // @ts-expect-error custom props
                "--fall": `${typeof window !== "undefined" ? window.innerHeight + 100 : 1000}px`,
                "--dx": `${(Math.random() - 0.5) * 300}px`,
              }} />
            ))}
          </div>
        )}
        <div className="relative text-center max-w-lg animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">You're In!</h2>
          <p className="text-lg text-white/50 mb-2">Application for <span className="text-white font-bold">{selectedPos?.title}</span> submitted.</p>
          <p className="text-sm text-white/25 mb-10">We'll DM you on Discord within 48 hours.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="px-8 py-3.5 rounded-2xl border border-white/10 text-sm font-semibold hover:bg-white/[0.04] transition-all">Home</Link>
            <Link href="/products" className="px-8 py-3.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/25 transition-all">Browse Products</Link>
          </div>
        </div>
      </section>
      <Footer />
      <style jsx global>{`@keyframes confettiFall{0%{transform:translateY(0) scale(0);opacity:1}15%{transform:translateX(calc(var(--dx)*0.3)) translateY(20vh) scale(1);opacity:1}100%{transform:translateX(var(--dx)) translateY(var(--fall)) scale(0.5) rotate(720deg);opacity:0}}`}</style>
    </main>
  )

  /* ════ MAIN ════ */
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="container mx-auto relative z-10 py-32 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* ── Left: Text content ── */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative h-2 w-2 rounded-full bg-emerald-500" /></span>
                  <span className="text-sm font-bold text-primary">{POSITIONS.reduce((s, p) => s + p.openSlots, 0)} Open Positions</span>
                  <span className="text-white/15">·</span>
                  <span className="text-sm text-white/40">Remote · Flexible</span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-8 tracking-tight leading-[0.9] animate-fade-in-up animate-delay-100">
                <span className="text-white">Join the</span><br />
                <span className="text-primary relative inline-block">
                  Lethal Team
                  <span className="absolute -inset-x-4 -inset-y-2 bg-primary/5 rounded-2xl blur-xl animate-pulse" style={{ animationDuration: "3s" }} />
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/40 max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed animate-fade-in-up animate-delay-200">
                Work remotely. Set your own hours. Build the best gaming tools on the market.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-14 animate-fade-in-up animate-delay-300">
                <button onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
                  className="group relative bg-gradient-to-r from-primary to-[#FF8C42] text-white font-bold px-10 py-4 rounded-2xl flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98] neon-btn">
                  View Open Roles <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-10 py-4 rounded-2xl transition-all">
                  Apply Directly
                </button>
              </div>

              {/* Animated stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up animate-delay-400">
                {[
                  { icon: Users, value: 10, suffix: "+", label: "Team Members" },
                  { icon: Trophy, value: 774, suffix: "+", label: "Happy Clients" },
                  { icon: Star, value: 99, suffix: "%", label: "Satisfaction" },
                  { icon: Zap, value: 24, suffix: "/7", label: "Support" },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 text-center hover:border-white/[0.1] transition-all group">
                    <s.icon className="h-4 w-4 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-2xl font-black text-white"><AnimatedNumber value={s.value} suffix={s.suffix} /></p>
                    <p className="text-[10px] text-white/25 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: 3D Isometric Cards ── */}
            <div className="hidden lg:flex items-center justify-center animate-fade-in-up animate-delay-200">
              <div className="relative flex items-center justify-center" style={{ perspective: "2000px", width: "100%", maxWidth: 600, aspectRatio: "1", margin: "0 auto" }}>

                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 w-[75%] h-[75%] rounded-full pointer-events-none"
                  style={{ transform: "translate(-50%, -50%)", filter: "blur(100px)", background: "rgba(123,63,228,0.2)" }} />

                {/* Scene */}
                <div className="relative" style={{ width: "clamp(300px, 55vw, 400px)", height: "clamp(300px, 55vw, 400px)" }}>

                  {/* ─── Layer (back): Infrastructure — cyan ─── */}
                  <div className="absolute inset-0 rounded-[18px] flex flex-col overflow-hidden"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "translateZ(0px)",
                      animation: "isoFloat 6s ease-in-out infinite 1s",
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(0,210,255,0.3)",
                      boxShadow: "0 0 30px rgba(0,210,255,0.1)",
                      padding: 22,
                    }}>
                    {/* Dot grid overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.3, backgroundImage: "radial-gradient(circle, rgba(0,210,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5" style={{ color: "rgba(0,210,255,0.92)" }} />
                        <span className="font-mono text-[11px] font-bold uppercase" style={{ letterSpacing: "0.12em", color: "rgba(0,210,255,0.92)" }}>Infrastructure</span>
                      </div>
                    </div>
                    {/* Badge + bars */}
                    <div className="flex items-center gap-3.5 mt-auto relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.4)" }}>
                        <Server className="w-6 h-6" style={{ color: "rgba(0,210,255,0.92)" }} />
                      </div>
                      <div className="flex-1 space-y-2.5">
                        {/* Bar 1 — 75% */}
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,210,255,0.2)" }}>
                          <div className="h-full rounded-full" style={{ width: "75%", background: "rgba(0,210,255,0.92)", boxShadow: "0 0 10px rgba(0,210,255,0.9)" }} />
                        </div>
                        {/* Bar 2 — 50% */}
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,210,255,0.2)" }}>
                          <div className="h-full rounded-full" style={{ width: "50%", background: "rgba(0,210,255,0.5)" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Layer (middle): Backend / API — purple ─── */}
                  <div className="absolute inset-0 rounded-[18px] flex flex-col overflow-hidden"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "translateZ(86px)",
                      animation: "isoFloat 6s ease-in-out infinite 0.5s",
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      border: "1px solid rgba(123,63,228,0.4)",
                      boxShadow: "0 0 40px rgba(123,63,228,0.15)",
                      padding: 22,
                    }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" style={{ color: "rgba(123,63,228,0.92)" }} />
                        <span className="font-mono text-[11px] font-bold uppercase" style={{ letterSpacing: "0.12em", color: "rgba(123,63,228,0.92)" }}>Backend / API</span>
                      </div>
                    </div>
                    {/* API rows */}
                    <div className="flex-1 space-y-2.5">
                      {[1,2,3,4].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl px-2.5 py-2" style={{ background: "rgba(123,63,228,0.05)", border: "1px solid rgba(123,63,228,0.1)" }}>
                          <Zap className="w-4 h-4 shrink-0" style={{ color: "rgba(123,63,228,0.75)" }} />
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden relative" style={{ background: "rgba(123,63,228,0.2)" }}>
                            <div className="absolute inset-y-0 rounded-full" style={{
                              width: "33%",
                              background: "rgba(123,63,228,0.92)",
                              boxShadow: "0 0 10px rgba(123,63,228,0.9)",
                              animation: `apiPulse 3s ease-in-out infinite ${i * 0.4}s`,
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─── Layer (front/top): UI Dashboard — white ─── */}
                  <div className="absolute inset-0 rounded-[18px] flex flex-col overflow-hidden"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "translateZ(172px)",
                      animation: "isoFloat 6s ease-in-out infinite",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(18px)",
                      WebkitBackdropFilter: "blur(18px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow: "0 18px 70px rgba(0,0,0,0.55)",
                    }}>
                    {/* macOS header */}
                    <div className="flex items-center gap-2 h-8 px-3.5" style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.9)" }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.9)" }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.9)" }} />
                      <span className="ml-auto font-mono text-[10px]" style={{ color: "rgba(156,163,175,0.95)" }}>app.lethal.dev</span>
                    </div>
                    {/* Body */}
                    <div className="flex-1 flex flex-col gap-3.5 p-[22px]" style={{ height: "calc(100% - 32px)" }}>
                      {/* Icons row */}
                      <div className="flex items-center justify-between">
                        <PanelsTopLeft className="w-[22px] h-[22px]" style={{ color: "rgba(255,255,255,0.92)" }} />
                        <Activity className="w-[18px] h-[18px]" style={{ color: "rgba(34,197,94,0.92)" }} />
                      </div>
                      {/* Metrics 2x2 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[14px] flex flex-col justify-between p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", height: 70 }}>
                          <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.06em", color: "rgba(156,163,175,0.95)" }}>Users</span>
                          <span className="text-lg font-bold tabular-nums" style={{ color: "rgba(255,255,255,0.92)", fontWeight: 750 }}>12.4k</span>
                        </div>
                        <div className="rounded-[14px] flex flex-col justify-between p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", height: 70 }}>
                          <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.06em", color: "rgba(156,163,175,0.95)" }}>Uptime</span>
                          <span className="text-lg font-bold tabular-nums" style={{ color: "rgba(34,197,94,0.92)", fontWeight: 750 }}>99.9%</span>
                        </div>
                      </div>
                      {/* Bar chart */}
                      <div className="flex-1 rounded-[14px] flex items-end gap-1.5 p-3 mt-auto" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", height: 82 }}>
                        {[40,70,45,90,65,85,50].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t overflow-hidden" style={{ height: `${h}%`, background: "rgba(255,255,255,0.2)", borderRadius: "4px 4px 2px 2px" }}>
                            <div className="w-full h-full" style={{ background: "linear-gradient(transparent, rgba(255,255,255,0.4))" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SVG decorative lines overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "translateZ(200px)" }}>
                    <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="10%" y1="80%" x2="90%" y2="80%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </svg>

                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-primary transition-colors group cursor-pointer">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce group-hover:text-primary" />
        </button>
      </section>

      {/* ═══ POSITIONS ═══ */}
      <section id="positions" className="relative z-10 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-primary/30" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Open Positions</span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">Find Your Role</h2>
          <p className="text-center text-white/30 mb-12 max-w-md mx-auto">Every position is fully remote with flexible hours.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {POSITIONS.map((pos) => <PositionCard key={pos.id} pos={pos} onApply={scrollToForm} />)}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative z-10 px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-primary/30" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">How It Works</span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { step: "01", title: "Apply", desc: "Fill out the form below. Takes less than 2 minutes.", icon: Send, color: "#EF6F29" },
              { step: "02", title: "Interview", desc: "Quick Discord call to get to know you. 15-20 minutes.", icon: MessageSquare, color: "#a855f7" },
              { step: "03", title: "Onboard", desc: "Get access, training, and start contributing immediately.", icon: Rocket, color: "#22c55e" },
            ].map((s, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden sm:flex absolute top-10 -right-[14px] z-20 items-center">
                    <ChevronRight className="h-3.5 w-3.5" style={{ color: `${["#a855f7", "#22c55e"][i]}50` }} />
                  </div>
                )}
                <div className="rounded-2xl border border-white/[0.04] bg-[#111113] p-6 text-center hover:border-white/[0.08] transition-all group">
                  <span className="text-[10px] font-black uppercase tracking-widest mb-4 block" style={{ color: `${s.color}50` }}>Step {s.step}</span>
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center border border-white/[0.06] group-hover:scale-110 transition-transform duration-300 relative" style={{ background: `linear-gradient(135deg, ${s.color}15, transparent)` }}>
                    <s.icon className="h-6 w-6" style={{ color: s.color }} />
                    <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `${s.color}15` }} />
                  </div>
                  <h4 className="font-black text-xl mb-2">{s.title}</h4>
                  <p className="text-xs text-white/30 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM QUOTES ═══ */}
      <section className="relative z-10 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-primary/30" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">From the Team</span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-4">What Our Team Says</h2>
          <p className="text-center text-white/25 mb-10 text-sm max-w-md mx-auto">Real quotes from people who work here every day.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEAM_QUOTES.map((q, i) => (
              <div key={i} className="relative rounded-2xl border border-white/[0.06] bg-[#111113] overflow-hidden hover:border-white/[0.1] transition-all group">
                {/* Color accent line */}
                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${q.color}, transparent)`, opacity: 0.4 }} />
                <div className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed mb-5">&ldquo;{q.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${q.color}15`, color: q.color }}>
                      {q.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{q.name}</p>
                      <p className="text-[11px] text-white/25">{q.role} · {q.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY JOIN ═══ */}
      <section className="relative z-10 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[28px] border border-white/[0.06] bg-[#111113] overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="relative p-10 sm:p-14">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Why Lethal?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3">Not a corporation.<br />A team that ships.</h2>
              <p className="text-white/30 text-sm mb-10 max-w-md">Small team, big impact. Your work directly shapes the product.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Globe, title: "100% Remote", desc: "Work from anywhere. No office, no commute." },
                  { icon: Clock, title: "Flex Schedule", desc: "Set your own hours. Output > time online." },
                  { icon: Zap, title: "Ship Fast", desc: "No bureaucracy. Ideas to production in days." },
                  { icon: Shield, title: "Trusted Brand", desc: "774+ reviews, 99.8% uptime. Real users." },
                  { icon: Star, title: "Earn More", desc: "Commission + bonuses. Uncapped potential." },
                  { icon: Heart, title: "Great Culture", desc: "No toxicity. Skilled people, mutual respect." },
                ].map((item, i) => (
                  <div key={i} className="group rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold mb-1.5">{item.title}</h4>
                    <p className="text-xs text-white/25 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FORM ═══ */}
      <section id="apply-form" ref={formRef} className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-5">
              <Send className="h-3 w-3" /> Application Form
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Apply Now</h2>
            <p className="text-white/30 text-sm">Takes 2 minutes. We review every application within 48 hours.</p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-white/20">Progress</span>
              <span className={`text-[11px] font-black ${pct === 100 ? "text-emerald-400" : "text-primary"}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-primary to-amber-400"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {["Personal", "Schedule", "Experience"].map((label, i) => {
              const done = (i === 0 && s0) || (i === 1 && s1) || (i === 2 && s2)
              const active = formStep === i
              return (
                <button key={i} onClick={() => setFormStep(i)}
                  className={`py-3.5 rounded-xl text-xs font-bold transition-all ${active ? "bg-primary/10 text-primary border border-primary/25" : done ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/[0.02] text-white/20 border border-white/[0.04]"}`}>
                  {done && !active ? <span className="flex items-center justify-center gap-1.5"><Check className="h-3 w-3" />{label}</span> : `${i + 1}. ${label}`}
                </button>
              )
            })}
          </div>

          {/* Glassmorphism form card with animated border */}
          <div className="relative rounded-[24px] overflow-hidden shadow-2xl shadow-black/20">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-[24px] p-[1px] overflow-hidden">
              <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(239,111,41,0.3)_10%,transparent_20%)] animate-[spin_6s_linear_infinite]" />
            </div>
          <div className="relative rounded-[23px] bg-[#0e0e10] backdrop-blur-xl overflow-hidden">
            {selectedPos && <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${selectedPos.color}, transparent)` }} />}
            {selectedPos && (
              <div className="px-8 py-5 border-b border-white/[0.04]" style={{ background: `linear-gradient(135deg, ${selectedPos.color}08, transparent)` }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${selectedPos.color}15` }}>
                    <selectedPos.icon className="h-5 w-5" style={{ color: selectedPos.color }} />
                  </div>
                  <div>
                    <p className="font-bold">{selectedPos.title}</p>
                    <p className="text-[11px] text-white/25">{selectedPos.openSlots} position{selectedPos.openSlots > 1 ? "s" : ""} · Remote</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* STEP 0 */}
              {formStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Position <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {POSITIONS.map(p => (
                        <button key={p.id} type="button" onClick={() => setPosition(p.id)}
                          className={`relative flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-bold transition-all duration-200 ${position === p.id ? "border-2 bg-white/[0.03] shadow-lg" : "border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.01]"}`}
                          style={position === p.id ? { borderColor: p.color, boxShadow: `0 0 20px ${p.color}15` } : {}}>
                          <p.icon className="h-4 w-4 shrink-0" style={{ color: p.color }} />
                          <span className="truncate">{p.title}</span>
                          {p.popular && position !== p.id && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Discord <span className="text-primary">*</span></label>
                    <input type="text" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="your username"
                      className="w-full h-12 px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/15 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Age <span className="text-primary">*</span></label>
                    <div className="flex items-center gap-3 w-44">
                      <button type="button" onClick={() => setAge(Math.max(16, age - 1))}
                        className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-90 transition-all"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="flex-1 text-center text-2xl font-black tabular-nums">{age}</span>
                      <button type="button" onClick={() => setAge(Math.min(50, age + 1))}
                        className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-90 transition-all"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Timezone <span className="text-primary">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {TIMEZONES.map((tz, i) => (
                        <button key={`${tz.l}-${i}`} type="button" onClick={() => setTimezone(`${tz.v}|${tz.l}`)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${timezone === `${tz.v}|${tz.l}` ? "bg-primary/15 text-white border border-primary/30 shadow-lg shadow-primary/10" : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:bg-white/[0.05] hover:text-white/50"}`}>
                          <span className="text-base leading-none">{tz.flag}</span><span>{tz.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => s0 && setFormStep(1)} disabled={!s0}
                    className="w-full py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* STEP 1 */}
              {formStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Hours / Week <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-5 gap-2">
                      {["5-10h", "10-20h", "20-30h", "30-40h", "40+"].map(h => (
                        <button key={h} type="button" onClick={() => setHoursPerWeek(h)}
                          className={`py-3.5 rounded-xl text-xs font-bold transition-all ${hoursPerWeek === h ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12]"}`}>{h}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Available Days <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map(d => (
                        <button key={d} type="button" onClick={() => toggleDay(d)}
                          className={`py-3.5 rounded-xl text-xs font-bold transition-all ${selectedDays.includes(d) ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12]"}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Preferred Time <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { v: "Morning", t: "6 — 12", e: "☀️" }, { v: "Afternoon", t: "12 — 18", e: "🌤" },
                        { v: "Evening", t: "18 — 00", e: "🌙" }, { v: "Night", t: "00 — 06", e: "🌑" },
                        { v: "Flexible", t: "Any", e: "⚡" },
                      ].map(t => (
                        <button key={t.v} type="button" onClick={() => setPreferredTime(t.v)}
                          className={`py-4 rounded-xl text-center transition-all ${preferredTime === t.v ? "bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10" : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]"}`}>
                          <span className="text-lg block mb-1">{t.e}</span>
                          <p className="text-[11px] font-bold text-white/70">{t.v}</p>
                          <p className="text-[9px] text-white/20">{t.t}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setFormStep(0)} className="flex-1 py-4 rounded-xl border border-white/[0.06] text-sm font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all">Back</button>
                    <button onClick={() => s1 && setFormStep(2)} disabled={!s1}
                      className="flex-[2] py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {formStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Experience <span className="text-primary">*</span></label>
                    <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
                      placeholder="Tell us about your relevant experience, skills, past projects..."
                      rows={5} className="w-full px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 resize-none transition-all leading-relaxed" />
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${experience.length >= 50 ? "text-emerald-400" : "text-white/15"}`}>
                      {experience.length >= 50 ? <><Check className="h-3 w-3" /> Looks good</> : `${experience.length}/50 min`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Why Lethal? <span className="text-primary">*</span></label>
                    <textarea value={whyLethal} onChange={(e) => setWhyLethal(e.target.value)}
                      placeholder="What excites you about this role and our team?"
                      rows={4} className="w-full px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 resize-none transition-all leading-relaxed" />
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${whyLethal.length >= 30 ? "text-emerald-400" : "text-white/15"}`}>
                      {whyLethal.length >= 30 ? <><Check className="h-3 w-3" /> Looks good</> : `${whyLethal.length}/30 min`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Portfolio <span className="text-white/15 font-normal text-xs">optional</span></label>
                    <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://your-portfolio.com"
                      className="w-full h-12 px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all" />
                  </div>
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/15 mb-1">Agreements</p>
                    {[
                      { c: agree16, s: setAgree16, l: "I confirm I'm at least 16 years old" },
                      { c: agreeActive, s: setAgreeActive, l: "I agree to be active and maintain professionalism" },
                      { c: agreeUnpaid, s: setAgreeUnpaid, l: "I understand this position is initially unpaid / commission-based" },
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-3.5 cursor-pointer group" onClick={() => item.s(!item.c)}>
                        <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${item.c ? "bg-primary border-primary shadow-lg shadow-primary/25" : "border-white/10 group-hover:border-white/20"}`}>
                          {item.c && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-xs text-white/30 leading-relaxed group-hover:text-white/40 transition-colors">{item.l}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setFormStep(1)} className="flex-1 py-4 rounded-xl border border-white/[0.06] text-sm font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all">Back</button>
                    <button onClick={handleSubmit} disabled={!s2 || submitting}
                      className="flex-[2] py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2.5 disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] transition-all neon-btn">
                      {submitting ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <><Send className="h-4 w-4" />Submit Application</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="relative z-10 px-4 py-8">
        <div className="container mx-auto max-w-3xl">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-amber-500/20" />
            <div className="absolute inset-0 bg-[#0c0c0e]/80" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6">
              <div>
                <p className="font-black text-lg">Ready to join?</p>
                <p className="text-sm text-white/40">Applications are reviewed within 48 hours.</p>
              </div>
              <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="shrink-0 px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 neon-btn text-white">
                <Send className="h-4 w-4" /> Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="relative z-10 px-4 py-16">
        <div className="container mx-auto max-w-2xl">
          <h3 className="text-xl font-black text-center mb-8">Common Questions</h3>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-white/[0.06] bg-[#111113] overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-bold hover:bg-white/[0.02] transition-colors list-none">
                  {f.q}
                  <ChevronRight className="h-4 w-4 text-white/20 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5"><p className="text-sm text-white/40 leading-relaxed">{f.a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STICKY MOBILE BAR ═══ */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-background/90 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 lg:hidden">
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 neon-btn">
            <Send className="h-4 w-4" /> Apply Now
          </button>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        .neon-btn {
          background: linear-gradient(135deg, #EF6F29, #FF8C42);
          box-shadow: 0 0 15px rgba(239,111,41,0.3), 0 0 40px rgba(239,111,41,0.1);
          transition: all 0.3s ease;
        }
        .neon-btn:hover {
          box-shadow: 0 0 20px rgba(239,111,41,0.5), 0 0 60px rgba(239,111,41,0.2), 0 0 100px rgba(239,111,41,0.1);
        }
        .neon-btn:disabled {
          box-shadow: none;
        }
        @keyframes confettiFall{0%{transform:translateY(0) scale(0);opacity:1}15%{transform:translateX(calc(var(--dx)*0.3)) translateY(20vh) scale(1);opacity:1}100%{transform:translateX(var(--dx)) translateY(var(--fall)) scale(0.5) rotate(720deg);opacity:0}}
        @keyframes isoFloat {
          0%, 100% { transform: translateY(4px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes apiPulse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(200%); }
        }
      `}</style>
    </main>
  )
}
