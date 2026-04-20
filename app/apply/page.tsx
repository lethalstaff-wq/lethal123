"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Users, Code2, Crown, Headphones, Camera, Search, DollarSign,
  Check, Minus, Plus, Send, CheckCircle2, Shield, Zap, Globe,
  ArrowRight, Clock, Star, ChevronRight, Copy,
  MessageSquare, Rocket, Heart, Sparkles, TrendingUp, Coffee,
  Flame, Video, Landmark, Briefcase,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { FALLBACK_STATS } from "@/lib/fallback-stats"


/* ═══════════════════════════════════════════════════════════════════════════════
   LETHAL SOLUTIONS — APPLY PAGE V5
   8 sections. Zero filler. Premium effects.
   ═══════════════════════════════════════════════════════════════════════════════ */


// ─── Position data ───────────────────────────────────────────────────────────

const POSITIONS = [
  {
    id: "developer", title: "Developer", icon: Code2, color: "#9b30ff", grad: ["#4a0080", "#9b30ff"],
    description: "Build and maintain our tools, website, and backend infrastructure.",
    requirements: ["Strong Python, TypeScript, or C++", "Reverse engineering / anti-cheat exp", "Self-driven, no hand-holding"],
    openSlots: 2, perks: ["Cutting-edge tech", "Revenue share", "Choose your stack"],
    popular: false, salary: "Revenue Share", slots: "2 spots",
  },
  {
    id: "manager", title: "Head Manager", icon: Crown, color: "#f97316", grad: ["#7c2d12", "#f97316"],
    description: "Oversee daily operations, team coordination, and strategic decisions.",
    requirements: ["Proven leadership experience", "Available 20+ hours/week", "Business or management background"],
    openSlots: 1, perks: ["Revenue share", "Strategic role", "Shape the future"],
    popular: false, salary: "Revenue Share", slots: "1 spot",
  },
  {
    id: "support", title: "Support Agent", icon: Headphones, color: "#220044", grad: ["#0a001e", "#220044"],
    description: "Help customers with setup, troubleshooting, and orders via Discord.",
    requirements: ["Deep knowledge of DMA / spoofers", "Response time under 5 minutes", "Fluent English, patient"],
    openSlots: 3, perks: ["Commission per ticket", "Flexible schedule", "Growth path"],
    popular: true, salary: "Commission", slots: "3 spots",
  },
  {
    id: "media", title: "Media Manager", icon: Camera, color: "#880088", grad: ["#440000", "#880088"],
    description: "Create content, manage social media, design and edit videos.",
    requirements: ["Basic video editing skills", "Willingness to learn", "We provide all tools free"],
    openSlots: 2, perks: ["Free Adobe Suite", "All assets provided", "Creative freedom"],
    popular: false, salary: "Performance", slots: "2 spots",
  },
  {
    id: "seo", title: "SEO Specialist", icon: Search, color: "#3b82f6", grad: ["#1e3a5f", "#3b82f6"],
    description: "Optimize search rankings, manage keywords, drive organic traffic.",
    requirements: ["Proven SEO results", "Ahrefs / SEMrush experience", "Technical SEO + content"],
    openSlots: 1, perks: ["Performance bonuses", "Own the strategy", "Premium tools"],
    popular: false, salary: "Bonus-Based", slots: "1 spot",
  },
  {
    id: "sales", title: "Sales / Reseller", icon: DollarSign, color: "#00ffcc", grad: ["#0a1a1a", "#00ffcc"],
    description: "Sell our products on your platform. Up to 80% bulk discount.",
    requirements: ["Own community or audience", "Existing customer base", "Hustle mentality"],
    openSlots: 5, perks: ["Up to 80% discount", "Set your prices", "Reseller dashboard"],
    popular: true, salary: "Self-Set", slots: "5 spots",
  },
  {
    id: "content", title: "Content Creator", icon: Video, color: "#06b6d4", grad: ["#0a2e3d", "#06b6d4"],
    description: "Make YouTube videos, TikToks, streams about our products. Grow the brand across all platforms.",
    requirements: ["Active social media presence", "Video editing experience", "Comfortable on camera or voiceover"],
    openSlots: 99, perks: ["Free products", "Rev share per referral", "Viral bonuses"],
    popular: true, salary: "Rev Share", slots: "Unlimited",
  },
  {
    id: "investor", title: "Investor / Partner", icon: Landmark, color: "#f59e0b", grad: ["#3d2800", "#f59e0b"],
    description: "Own a piece of Lethal Solutions. We share profits proportionally — invest from $1 and grow with us.",
    requirements: ["Any amount from $1", "Belief in our vision", "Long-term mindset"],
    openSlots: 99, perks: ["Profit share %", "Proportional equity", "Insider access"],
    popular: true, salary: "Profit Share", slots: "Unlimited",
  },
]

const TEAM_QUOTES = [
  { text: "Joined as a dev 6 months ago. Zero micromanagement, full creative freedom. Best decision I made this year.", name: "cipher", role: "Developer", time: "6 months", img: "/images/team/developer.jpg", grad: ["#4a0080", "#9b30ff"] },
  { text: "Left my 9-5 for this. Commission here beats a salary and I work from my couch. Not going back.", name: "vex", role: "Sales", time: "4 months", img: "/images/team/Sales.jpg", grad: ["#0a1a1a", "#00ffcc"] },
  { text: "Product actually works which makes support easy. Customers thank me instead of yelling at me.", name: "nova", role: "Support", time: "3 months", img: "/images/team/Support.jpg", grad: ["#0a001e", "#220044"] },
  { text: "I handle all the socials and content. Full creative control, no approval chains, just ship it.", name: "flare", role: "Media", time: "2 months", img: "/images/team/media.jpg", grad: ["#440000", "#880088"] },
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
  { q: "How many hours do I need?", a: "Minimum 5-10h/week for most roles. More hours = more opportunity." },
  { q: "Do I need experience?", a: "Depends on the role. Support needs product knowledge, Dev needs coding. Sales just needs hustle." },
  { q: "How fast do you respond?", a: "We review every application within 48 hours via Discord. No ghosting." },
  { q: "Can I work multiple roles?", a: "Yes! Many team members wear multiple hats. Start with one and expand." },
  { q: "What tools do you use?", a: "Discord, GitHub, Notion. We provide all software and licenses — zero cost." },
  { q: "What's the culture like?", a: "Zero toxicity, mutual respect, no micromanagement. Your ideas matter from day one." },
  { q: "Can I work from anywhere?", a: "100% remote. 6+ timezones. Work from your couch, a cafe, or a beach." },
]

const ROLE_BENEFITS: Record<string, string[]> = {
  developer: ["Bleeding-edge anti-cheat tech", "Private research & tools access", "Revenue share on your products", "Choose your own stack"],
  support: ["Commission per ticket", "Flexible shifts", "Deep product training", "Path to team lead"],
  sales: ["Up to 80% bulk discount", "Set your own margins", "Marketing materials provided", "Reseller dashboard"],
  media: ["Free Adobe Creative Suite", "All assets provided", "Full creative control", "Performance bonuses"],
  manager: ["Strategic influence", "Revenue share", "Lead 10+ operators", "Shape culture"],
  seo: ["Own the strategy", "Performance bonuses", "Premium SEO tools", "Build from ground up"],
  content: ["Free products to showcase", "Revenue share per referral", "Viral content bonuses", "Full creative freedom"],
  investor: ["Equity stake in Lethal", "Monthly profit share", "Advisory board seat", "Direct access to roadmap"],
}

const COMPARISON_DATA = [
  { feature: "Remote Work", icon: Globe },
  { feature: "Flexible Hours", icon: Clock },
  { feature: "No Micromanagement", icon: Shield },
  { feature: "Revenue Share", icon: TrendingUp },
  { feature: "Creative Freedom", icon: Sparkles },
  { feature: "Ship in Days", icon: Zap },
  { feature: "Day-One Impact", icon: Rocket },
  { feature: "Work From Anywhere", icon: Coffee },
]

const WHY_FEATURES = [
  { icon: Globe, title: "100% Remote", desc: "Work from anywhere. No office, no commute, no dress code.", size: "normal" as const },
  { icon: Clock, title: "Flexible Hours", desc: "We measure output, not hours. Work when you're productive.", size: "normal" as const },
  { icon: Zap, title: "Ship Fast", desc: "Ideas to production in days, not months of meetings.", size: "normal" as const },
  { icon: TrendingUp, title: "Uncapped Earnings", desc: "Commission + bonuses with no ceiling. Top performers earn more than most salaries.", size: "wide" as const },
  { icon: Shield, title: "Trusted Brand", desc: "860+ reviews, 99.8% uptime. Customers love us.", size: "normal" as const },
  { icon: Heart, title: "Great Culture", desc: "Zero toxicity, mutual respect, no micromanagement.", size: "normal" as const },
  { icon: Rocket, title: "Growth Path", desc: "Top performers get promoted fast. Start support, become team lead in months.", size: "wide" as const },
  { icon: Coffee, title: "Real Impact", desc: "Small team = your work directly shapes the product.", size: "normal" as const },
]


// ─── Hero counter (never displays 0 before IO fires) ────────────────────────

function HeroCounter({ value }: { value: number }) {
  const [count, setCount] = useState(value)
  const [animating, setAnimating] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        setAnimating(true)
        setCount(0)
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1800, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 4)) * value))
          if (p < 1) requestAnimationFrame(tick)
          else setCount(value)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  const shown = animating ? count : value
  return <span ref={ref} className="tabular-nums">{shown.toLocaleString()}</span>
}


// ─── Hooks ───────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}


// ─── Reveal ──────────────────────────────────────────────────────────────────

function R({ children, d = 0, dir = "up", className = "" }: {
  children: React.ReactNode; d?: number; dir?: "up" | "left" | "right" | "scale"; className?: string
}) {
  const { ref, visible } = useInView()
  const t: Record<string, string> = { up: "translateY(40px)", left: "translateX(40px)", right: "translateX(-40px)", scale: "scale(0.95)" }
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0, transform: visible ? "none" : t[dir],
      filter: visible ? "blur(0)" : "blur(4px)",
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${d}ms`,
    }}>{children}</div>
  )
}


// ─── Mouse spotlight ─────────────────────────────────────────────────────────

function Spotlight() {
  const r = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (r.current) r.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)` }
    window.addEventListener("mousemove", h, { passive: true })
    return () => window.removeEventListener("mousemove", h)
  }, [])
  return <div ref={r} className="fixed top-0 left-0 w-[600px] h-[600px] pointer-events-none z-[2] hidden lg:block"
    style={{ background: "radial-gradient(circle, rgba(249,115,22,0.025) 0%, transparent 55%)", willChange: "transform" }} />
}


// ─── Floating particles ──────────────────────────────────────────────────────

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{
          width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          opacity: 0.03 + Math.random() * 0.04,
          animation: `pFloat ${8 + Math.random() * 12}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 10}s`,
        }} />
      ))}
    </div>
  )
}


// ─── TiltCard ────────────────────────────────────────────────────────────────

function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`
  }, [])
  const leave = useCallback(() => { if (ref.current) ref.current.style.transform = "none" }, [])
  return <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-500 ease-out ${className}`} style={{ transformStyle: "preserve-3d" }}>{children}</div>
}


// ─── Shimmer divider ─────────────────────────────────────────────────────────

function Divider() { return <div className="lx-shimmer max-w-5xl mx-auto" /> }


// ─── Section header ──────────────────────────────────────────────────────────

const TAG_CONFIG: Record<string, { icon: typeof Zap; color: string }> = {
  "Open Roles": { icon: Sparkles, color: "#f97316" },
  "Why Us": { icon: Heart, color: "#ec4899" },
  "Compare": { icon: Zap, color: "#3b82f6" },
  "Team": { icon: Users, color: "#22c55e" },
  "Apply": { icon: Send, color: "#f97316" },
  "FAQ": { icon: MessageSquare, color: "#a855f7" },
}

function Hdr({ tag, title, sub }: { tag: string; title: React.ReactNode; sub?: string }) {
  const cfg = TAG_CONFIG[tag]
  const TagIcon = cfg?.icon
  return (
    <div className="text-center mb-16">
      <R><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
        {TagIcon && <TagIcon className="h-3.5 w-3.5 text-white/20" />}
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{tag}</span>
      </div></R>
      <R d={80}><h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4 lx-text-fade">{title}</h2></R>
      {sub && <R d={140}><p className="text-white/35 text-[15px] leading-relaxed max-w-lg mx-auto">{sub}</p></R>}
    </div>
  )
}


// ─── Corp title with brand cycling ───────────────────────────────────────────

const BRANDS = [
  { name: "Google", color: "#4285F4" },
  { name: "Apple", color: "#a2aaad" },
  { name: "Tesla", color: "#e82127" },
  { name: "Meta", color: "#1877f2" },
  { name: "Amazon", color: "#ff9900" },
  { name: "Microsoft", color: "#00a4ef" },
  { name: "Samsung", color: "#1428a0" },
  { name: "Netflix", color: "#e50914" },
]

function CorpTitle() {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % BRANDS.length)
        setFading(false)
      }, 300)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const brand = BRANDS[idx]

  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4">
      <span className="lx-text-orange">Lethal</span>
      <span className="lx-text-fade"> vs </span>
      <span className="inline-block transition-all duration-300" style={{
        color: brand.color,
        opacity: fading ? 0 : 1,
        transform: fading ? "translateY(-8px)" : "translateY(0)",
        filter: fading ? "blur(4px)" : "blur(0)",
      }}>
        {brand.name}
      </span>
    </h2>
  )
}


/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

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
  const [heroReady, setHeroReady] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [typed, setTyped] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const a = setTimeout(() => setHeroReady(true), 300)
    const b = setTimeout(() => setTyped(true), 1500)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])

  useEffect(() => {
    try {
      const off = -new Date().getTimezoneOffset() / 60
      const utc = `UTC${off >= 0 ? "+" : ""}${off}`
      const m = TIMEZONES.find(t => t.v === utc)
      if (m) setTimezone(`${m.v}|${m.l}`)
    } catch {}
  }, [])

  const toggleDay = (d: string) => setSelectedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  const goToForm = (id: string) => { setPosition(id); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100) }
  const sel = POSITIONS.find(p => p.id === position)
  const total = POSITIONS.reduce((s, p) => s + p.openSlots, 0)
  const doCopy = () => { navigator.clipboard.writeText("discord.gg/lethal"); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const v0 = !!(position && discord.trim().length >= 2 && age >= 16 && timezone)
  const v1 = !!(hoursPerWeek && selectedDays.length > 0 && preferredTime)
  const v2 = !!(experience.length >= 50 && whyLethal.length >= 30 && agree16 && agreeActive && agreeUnpaid)
  let filled = 0
  if (position) filled++; if (discord.trim()) filled++; if (timezone) filled++
  if (hoursPerWeek) filled++; if (selectedDays.length) filled++; if (preferredTime) filled++
  if (experience.length >= 50) filled++; if (whyLethal.length >= 30) filled++
  if (agree16 && agreeActive && agreeUnpaid) filled++
  const pct = Math.round((filled / 9) * 100)

  const doSubmit = async () => {
    if (!v2 || submitting) return
    setSubmitting(true)
    try {
      const r = await fetch("/api/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, discord, age, timezone: timezone.split("|")[0], hoursPerWeek, availableDays: selectedDays, preferredTime, experience, whyLethal, portfolio }),
      })
      if (!r.ok) throw new Error()
      setSubmitted(true); setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch { toast.error("Failed to submit — try again") }
    setSubmitting(false)
  }


  // ── SUCCESS ────────────────────────────────────────────────────────────────

  if (submitted) return (
    <main className="min-h-screen bg-black text-white lx-page">
      <Navbar />
      {showConfetti && <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute" style={{
            width: `${3 + Math.random() * 8}px`, height: `${4 + Math.random() * 10}px`,
            left: `${Math.random() * 100}%`, top: "-5%",
            backgroundColor: ["#f97316", "#fff", "#888"][i % 3],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confetti ${2 + Math.random() * 3}s ease-out forwards`,
            animationDelay: `${Math.random() * 1.5}s`,
          }} />
        ))}
      </div>}
      {/* Noise */}
      <div className="fixed inset-0 pointer-events-none z-[1] lx-noise" />

      <section className="flex-1 flex items-center justify-center min-h-[85vh] py-32 px-4 relative z-10">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 35% at 50% 40%, rgba(34,197,94,0.04), transparent)" }} />

        <div className="text-center max-w-xl relative lx-fadein">

          {/* Success icon — ring pulse + glow */}
          <div className="relative w-28 h-28 mx-auto mb-12">
            <div className="absolute inset-[-12px] rounded-3xl border border-emerald-500/10 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-[-6px] rounded-3xl border border-emerald-500/5" />
            <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"
              style={{ boxShadow: "0 0 60px rgba(34,197,94,0.2), 0 20px 40px rgba(0,0,0,0.3)" }}>
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-5xl sm:text-6xl font-bold tracking-[-0.03em] mb-5">
            <span className="lx-chrome">You&apos;re </span>
            <span className="text-emerald-400">In!</span>
          </h2>

          <p className="text-white/45 text-[17px] mb-1.5">
            Application for <span className="text-white font-semibold">{sel?.title}</span> submitted successfully.
          </p>
          <p className="text-white/20 text-[14px] mb-14">We&apos;ll DM you on Discord within 48 hours.</p>

          {/* Progress timeline */}
          <div className="flex items-center justify-center mb-14">
            {["Applied", "Review", "Interview", "Onboard"].map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all ${
                    i === 0 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white/[0.02] text-white/15 border border-white/[0.05]"
                  }`}>
                    {i === 0 ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-semibold ${i === 0 ? "text-emerald-400/80" : "text-white/15"}`}>{s}</span>
                </div>
                {i < 3 && (
                  <div className={`w-12 sm:w-20 h-px mx-1 mb-6 ${i === 0 ? "bg-gradient-to-r from-emerald-500/30 to-white/[0.04]" : "bg-white/[0.03]"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <Link href="/"
              className="lx-ghost px-8 py-4 rounded-xl text-[14px] font-semibold flex items-center gap-2 group">
              <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Home
            </Link>
            <Link href="/products"
              className="lx-primary px-8 py-4 rounded-xl text-[14px] font-bold text-white flex items-center gap-2 group">
              Browse Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Fun text */}
          <p className="text-white/10 text-[12px] mt-10">Welcome to the team. Let&apos;s build something legendary.</p>
        </div>
      </section>
      <Footer />
    </main>
  )


  // ── MAIN PAGE ──────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-transparent text-white lx-page relative overflow-x-hidden">
      <Spotlight />
      <Navbar />


      {/* ═══════════════════════════════════════════════════════════
          1 · HERO
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Hero accent — layered on top of global bg */}
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[20%] right-[5%] w-[640px] h-[480px] rounded-full opacity-70 lx-a1" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.12), transparent 65%)", filter: "blur(130px)" }} />
          <div className="absolute bottom-[5%] left-[5%] w-[560px] h-[440px] rounded-full opacity-60 lx-a2" style={{ background: "radial-gradient(circle, rgba(234,88,12,0.08), transparent 65%)", filter: "blur(130px)" }} />
        </div>

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-[1280px] mx-auto text-left">
          {/* Left — Text */}
          <div>
            <div className={`mb-8 tr ${heroReady ? "o1 ty0" : "o0 ty1"}`}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#f97316]/20 bg-[#f97316]/[0.06] backdrop-blur-sm">
                <span className="relative flex items-center justify-center">
                  <span className="absolute w-2.5 h-2.5 rounded-full bg-[#f97316]/40 animate-ping" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                </span>
                <Zap className="h-3.5 w-3.5 text-[#f97316]" />
                <span className="text-[11px] font-semibold text-[#f97316] uppercase tracking-[0.1em]">
                  Now Hiring &middot; {FALLBACK_STATS.openPositions}+ open positions
                </span>
              </div>
            </div>

            <h1 className="mb-7 font-display">
              {["Join Our Team", "And Build"].map((line, i) => (
                <span key={i} className={`block text-[clamp(2.5rem,6vw,4.75rem)] font-bold tracking-[-0.035em] leading-[1.05] tr ${heroReady ? "o1 ty0" : "o0 ty2"}`}
                  style={{
                    transitionDelay: `${200 + i * 150}ms`,
                    background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,195,0.85) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>{line}</span>
              ))}
              <span className={`block text-[clamp(2.5rem,6vw,4.75rem)] font-bold tracking-[-0.035em] leading-[1.05] tr lx-text-orange ${heroReady ? "o1 ty0" : "o0 ty2"}`}
                style={{ transitionDelay: "500ms", filter: "drop-shadow(0 0 60px rgba(249,115,22,0.3))" }}>Lethal Solutions</span>
            </h1>

            <p className={`text-[15px] sm:text-[17px] text-white/55 leading-[1.75] mb-8 max-w-[480px] tr ${heroReady ? "o1 ty0" : "o0 ty1"}`} style={{ transitionDelay: "650ms" }}>
              Work remotely with a team that ships fast. Set your own hours, earn uncapped commissions, and build the best gaming tools on the market.
            </p>

            <div className={`flex flex-wrap gap-2.5 mb-8 tr ${heroReady ? "o1 ty0" : "o0 ty1"}`} style={{ transitionDelay: "800ms" }}>
              {[`${FALLBACK_STATS.openPositions}+ open roles`, "100% remote", "Flexible hours"].map((s, i) => <span key={i} className="lx-pill">{s}</span>)}
            </div>

            <div className={`flex items-center gap-3 tr ${heroReady ? "o1 ty0" : "o0 ty2"}`} style={{ transitionDelay: "950ms" }}>
              <button onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
                className="lx-primary px-7 py-3.5 rounded-xl text-[14px] font-semibold text-white flex items-center gap-2 cursor-pointer">
                Get started <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="lx-ghost px-7 py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer">Apply directly</button>
            </div>
          </div>

          {/* Right — Terminal */}
          <div className={`tr ${heroReady ? "o1 ty0" : "o0 ty3"}`} style={{ transitionDelay: "500ms" }}>
            <Tilt>
              <div className="lx-terminal-wrap">
                <div className="lx-rotating-border" />
                <div className="relative z-10 rounded-2xl overflow-hidden bg-[#050505]">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-[9px] h-[9px] rounded-full lx-dot-red" />
                        <div className="w-[9px] h-[9px] rounded-full lx-dot-yellow" />
                        <div className="w-[9px] h-[9px] rounded-full lx-dot-green" />
                      </div>
                      <span className="text-[12px] text-white/20 font-mono">terminal</span>
                    </div>
                    <button onClick={doCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] text-[11px] text-white/30 hover:text-white/60 hover:border-white/[0.1] transition-all cursor-pointer">
                      <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className={`p-6 font-mono text-[13px] leading-[2.1] overflow-x-auto transition-opacity duration-1000 ${typed ? "opacity-100" : "opacity-20"}`}>
                    <p><span className="text-white/20">$</span> <span className="text-white/80">lethal-cli</span> <span className="text-white/40">apply \</span></p>
                    <p className="pl-6"><span className="text-white/30">--position</span> <span className="text-white/60">&quot;your_role&quot;</span> <span className="text-white/10">\</span></p>
                    <p className="pl-6"><span className="text-white/30">--discord</span> <span className="text-white/60">&quot;your_username&quot;</span> <span className="text-white/10">\</span></p>
                    <p className="pl-6"><span className="text-white/30">--remote</span> <span className="text-white/80">true</span> <span className="text-white/10">\</span></p>
                    <p className="pl-6"><span className="text-white/30">--hours</span> <span className="text-white/60">&quot;flexible&quot;</span></p>
                    <p className="mt-5 text-white/10">// Response:</p>
                    <p className="text-white/80 mt-1">{"{"}</p>
                    <p className="pl-5"><span className="text-white/40">&quot;status&quot;</span><span className="text-white/15">:</span> <span className="text-white/90">&quot;accepted&quot;</span><span className="text-white/15">,</span></p>
                    <p className="pl-5"><span className="text-white/40">&quot;team_size&quot;</span><span className="text-white/15">:</span> <span className="text-white">10</span><span className="text-white/15">,</span></p>
                    <p className="pl-5"><span className="text-white/40">&quot;open_slots&quot;</span><span className="text-white/15">:</span> <span className="text-white">8</span><span className="text-white/15">,</span></p>
                    <p className="pl-5"><span className="text-white/40">&quot;response_time&quot;</span><span className="text-white/15">:</span> <span className="text-white">&quot;&lt; 48h&quot;</span></p>
                    <p className="text-white/80">{"}"}</p>
                    <p className="mt-3"><span className="text-white/20">$</span> <span className="lx-blink">_</span></p>
                  </div>
                </div>
              </div>
            </Tilt>
          </div>
        </div>

        {/* Stat cards row */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 tr ${heroReady ? "o1 ty0" : "o0 ty2"}`} style={{ transitionDelay: "1100ms" }}>
          {[
            { icon: Users, value: FALLBACK_STATS.teamMembers, suffix: "+", label: "Team Members" },
            { icon: Heart, value: FALLBACK_STATS.happyClients, suffix: "+", label: "Happy Clients" },
            { icon: Star, value: FALLBACK_STATS.satisfactionPercent, suffix: "%", label: "Satisfaction" },
            { icon: Clock, display: "24/7", label: "Support" },
          ].map((stat, i) => (
            <div key={stat.label} className="group p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:border-[#f97316]/30 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] transition-all duration-300">
              <stat.icon className="h-5 w-5 text-[#f97316] mb-3 group-hover:scale-110 transition-transform"
                         style={{ filter: "drop-shadow(0 0 10px rgba(249,115,22,0.4))" }} />
              <div className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-none text-white/90">
                {stat.display ? (
                  <span>{stat.display}</span>
                ) : (
                  <>
                    <HeroCounter value={stat.value!} />
                    <span className="text-[#f97316]">{stat.suffix}</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-[11px] text-white/45 uppercase tracking-[0.12em] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          2 · POSITIONS
          ═══════════════════════════════════════════════════════════ */}

      <section id="positions" className="relative z-10 px-6 sm:px-10 lg:px-16 py-28">
        <div className="max-w-[1280px] mx-auto">
          {/* Premium section header with large number */}
          <div className="text-center mb-20">
            <R>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-white/20" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Open Roles</span>
              </div>
            </R>
            <R d={80}>
              {/* Big number accent */}
              <div className="relative inline-block mb-4">
                <span className="absolute -top-8 -right-12 text-[120px] sm:text-[160px] font-black text-white/[0.015] leading-none select-none pointer-events-none tabular-nums">8</span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.05] relative">
                  <span className="lx-text-fade">Find Your</span>
                  <br />
                  <span className="lx-text-orange">Position</span>
                </h2>
              </div>
            </R>
            <R d={140}>
              <p className="text-white/30 text-[15px] leading-relaxed max-w-md mx-auto mt-4">
                8 roles. Fully remote. Flexible hours. <span className="text-white/50 font-medium">Pick what fits.</span>
              </p>
            </R>
          </div>
          {/* Row 1: 4 main roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {POSITIONS.slice(0, 4).map((pos, i) => (
              <R key={pos.id} d={i * 60}>
                <Tilt>
                  <div className="lx-card lx-shine group relative cursor-pointer h-full" onClick={() => goToForm(pos.id)}>
                    <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${pos.color}20, transparent)` }} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl" style={{ background: `radial-gradient(ellipse at 50% 0%, ${pos.color}06, transparent 60%)` }} />
                    {pos.popular && <div className="absolute top-4 right-4 z-10"><span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: `${pos.color}10`, border: `1px solid ${pos.color}20`, color: `${pos.color}90` }}>HOT</span></div>}
                    <div className="p-6 relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.05] group-hover:scale-110 transition-transform duration-300" style={{ background: pos.grad ? `linear-gradient(135deg, ${pos.grad[0]}, ${pos.grad[1]}40)` : `${pos.color}08` }}>
                          <pos.icon className="h-[18px] w-[18px]" style={{ color: pos.color }} />
                        </div>
                        <div>
                          <h3 className="font-display text-[17px] font-bold text-white tracking-tight">{pos.title}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full lx-pulse" style={{ background: `${pos.color}70` }} />
                            <span className="text-[10px] font-medium" style={{ color: `${pos.color}60` }}>{pos.slots}</span>
                            <span className="text-white/40 mx-0.5">·</span>
                            <span className="text-[10px] text-white/55">{pos.salary}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] text-white/55 mb-5 leading-relaxed">{pos.description}</p>
                      <div className="space-y-2 mb-5">
                        {pos.requirements.map((r, j) => <div key={j} className="flex items-start gap-2.5"><Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: `${pos.color}40` }} /><span className="text-[12px] text-white/55 leading-relaxed">{r}</span></div>)}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {pos.perks.map((p, j) => <span key={j} className="text-[10px] px-2.5 py-1 rounded-full border text-white/65 font-semibold" style={{ background: `${pos.color}04`, borderColor: `${pos.color}10` }}>{p}</span>)}
                      </div>
                      <button className="w-full py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 border text-white/65 group-hover:text-white transition-all duration-300 cursor-pointer" style={{ borderColor: `${pos.color}12`, background: `${pos.color}04` }}>
                        Apply <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </Tilt>
              </R>
            ))}
          </div>

          {/* Row 2: SEO + Sales + Content Creator — all same height */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {POSITIONS.slice(4, 7).map((pos, i) => (
              <R key={pos.id} d={(i + 4) * 60} className={pos.id === "content" ? "lg:col-span-2" : ""}>
                <Tilt>
                  <div className="lx-card lx-shine group relative cursor-pointer h-full" onClick={() => goToForm(pos.id)}
                    style={pos.id === "content" ? { border: `1px solid ${pos.color}12` } : {}}>
                    <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${pos.color}20, transparent)` }} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl" style={{ background: `radial-gradient(ellipse at 50% 0%, ${pos.color}06, transparent 60%)` }} />
                    {pos.openSlots >= 99
                      ? <div className="absolute top-4 right-4 z-10"><span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: `${pos.color}12`, border: `1px solid ${pos.color}25`, color: pos.color }}>UNLIMITED</span></div>
                      : pos.popular && <div className="absolute top-4 right-4 z-10"><span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: `${pos.color}10`, border: `1px solid ${pos.color}20`, color: `${pos.color}90` }}>HOT</span></div>
                    }
                    <div className="p-6 relative h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.05]" style={{ background: pos.grad ? `linear-gradient(135deg, ${pos.grad[0]}, ${pos.grad[1]}40)` : `${pos.color}08` }}>
                          <pos.icon className="h-[18px] w-[18px]" style={{ color: pos.color }} />
                        </div>
                        <div>
                          <h3 className="font-display text-[17px] font-bold text-white tracking-tight">{pos.title}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full lx-pulse" style={{ background: `${pos.color}70` }} />
                            <span className="text-[10px] font-medium" style={{ color: `${pos.color}60` }}>{pos.slots}</span>
                            <span className="text-white/40 mx-0.5">·</span>
                            <span className="text-[10px] text-white/55">{pos.salary}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] text-white/55 mb-5 leading-relaxed">{pos.description}</p>
                      <div className="space-y-2 mb-5">
                        {pos.requirements.map((r, j) => <div key={j} className="flex items-start gap-2.5"><Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: `${pos.color}40` }} /><span className="text-[12px] text-white/55 leading-relaxed">{r}</span></div>)}
                      </div>
                      <div className="mt-auto">
                        <button className="w-full py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 border text-white/65 group-hover:text-white transition-all duration-300 cursor-pointer" style={{ borderColor: `${pos.color}12`, background: `${pos.color}04` }}>
                          Apply <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </R>
            ))}
          </div>

          {/* Row 3: INVESTOR — Full-width premium card */}
          {(() => { const pos = POSITIONS[7]; return (
            <R d={500}>
              <div className="lx-card group relative cursor-pointer overflow-hidden" onClick={() => goToForm(pos.id)}
                style={{ border: `1px solid ${pos.color}15`, boxShadow: `0 0 60px ${pos.color}04` }}>
                {/* Gold accent top */}
                <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent 10%, ${pos.color}50, transparent 90%)` }} />

                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 30% 50%, ${pos.color}04, transparent 50%)` }} />

                <div className="p-8 sm:p-10 relative">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-center">
                    <div>
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ background: `${pos.color}10`, borderColor: `${pos.color}25` }}>
                          <pos.icon className="h-6 w-6" style={{ color: pos.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-white/90">{pos.title}</h3>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: `${pos.color}12`, border: `1px solid ${pos.color}25`, color: pos.color }}>OPEN TO ALL</span>
                          </div>
                          <span className="text-[12px] font-medium" style={{ color: pos.color }}>{pos.salary} · No minimum</span>
                        </div>
                      </div>
                      <p className="text-[15px] text-white/50 mb-6 leading-relaxed max-w-lg">{pos.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {pos.requirements.map((r, j) => (
                          <div key={j} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{ background: `${pos.color}04`, borderColor: `${pos.color}10` }}>
                            <Check className="h-4 w-4 shrink-0" style={{ color: `${pos.color}60` }} />
                            <span className="text-[13px] text-white/45 font-medium">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        {pos.perks.map((p, j) => <span key={j} className="text-[11px] px-3 py-1.5 rounded-full border font-medium" style={{ background: `${pos.color}08`, borderColor: `${pos.color}18`, color: `${pos.color}` }}>{p}</span>)}
                      </div>
                      <button className="w-full py-4 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 text-black transition-all duration-300 cursor-pointer group-hover:scale-[1.02]"
                        style={{ background: `linear-gradient(135deg, ${pos.color}, #fbbf24)`, boxShadow: `0 0 30px ${pos.color}25` }}>
                        Become an Investor <ArrowRight className="h-4 w-4" />
                      </button>
                      <p className="text-[10px] text-white/15 text-center">No minimum investment. Profit shared proportionally.</p>
                    </div>
                  </div>
                </div>
              </div>
            </R>
          ); })()}
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          3 · WHY LETHAL (bento grid)
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-28">
        <div className="max-w-[1100px] mx-auto">
          <Hdr tag="Why Us" title={<>Why Choose <span className="lx-text-orange">Lethal</span></>} sub="Not a corporation. A small team that builds fast, pays well, and respects your time." />

          {/* Bento grid — mixed sizes for visual interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[minmax(160px,auto)]">
            {WHY_FEATURES.map((f, i) => (
              <R key={i} d={i * 50}>
                <div className={`lx-card lx-shine group p-7 h-full flex flex-col justify-between relative overflow-hidden ${f.size === "wide" ? "sm:col-span-2" : ""}`}>
                  {/* Hover glow behind icon */}
                  <div className="absolute top-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: "radial-gradient(circle, rgba(249,115,22,0.04), transparent 70%)", transform: "translate(-30%, -30%)" }} />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-white/[0.04] bg-white/[0.015] group-hover:border-[#f97316]/15 group-hover:bg-[#f97316]/[0.04] transition-all duration-500">
                      <f.icon className="h-5 w-5 text-white/20 group-hover:text-[#f97316]/70 transition-colors duration-500" />
                    </div>
                    <h4 className="font-bold text-[16px] mb-2.5 text-white/90 group-hover:text-white transition-colors">{f.title}</h4>
                    <p className="text-[13px] text-white/30 leading-[1.7] group-hover:text-white/45 transition-colors">{f.desc}</p>
                  </div>

                  {/* Bottom accent line on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          4 · COMPARISON (Lethal vs Corporate — premium design)
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-28">
        <div className="max-w-[680px] mx-auto">
          <div className="text-center mb-16">
            <R><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
              <Zap className="h-3.5 w-3.5 lx-flame" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Compare</span>
            </div></R>
            <R d={80}><CorpTitle /></R>
            <R d={140}><p className="text-white/25 text-[14px]">Same industry. Different approach.</p></R>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_90px_90px] gap-2 mb-5 px-5">
            <div />
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#f97316] to-[#ea580c]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#f97316]/70">Lethal</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm lx-corp-dot" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20">Corp</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {COMPARISON_DATA.map((row, i) => (
              <R key={i} d={i * 40} dir="left">
                <div className="lx-card grid grid-cols-[1fr_90px_90px] gap-2 items-center py-4 px-5 group hover:bg-white/[0.015]">
                  <div className="flex items-center gap-3">
                    <row.icon className="h-3.5 w-3.5 text-white/10 group-hover:text-[#f97316]/40 transition-colors shrink-0" />
                    <span className="text-[13px] text-white/45 group-hover:text-white/75 transition-colors font-medium">{row.feature}</span>
                  </div>

                  {/* Lethal ✓ — orange glow */}
                  <div className="flex justify-center">
                    <div className="relative w-8 h-8 rounded-lg bg-[#f97316]/[0.04] border border-[#f97316]/10 flex items-center justify-center group-hover:bg-[#f97316]/10 group-hover:border-[#f97316]/25 transition-all duration-300">
                      <Check className="h-3.5 w-3.5 text-[#f97316]/40 group-hover:text-[#f97316]/90 transition-colors" />
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: "0 0 15px rgba(249,115,22,0.12)" }} />
                    </div>
                  </div>

                  {/* Google ✗ — red on hover */}
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.01] border border-white/[0.03] flex items-center justify-center group-hover:bg-[#EA4335]/[0.06] group-hover:border-[#EA4335]/15 transition-all duration-300">
                      <span className="text-white/40 text-sm group-hover:text-[#EA4335]/50 transition-colors">×</span>
                    </div>
                  </div>
                </div>
              </R>
            ))}
          </div>

          {/* Bottom verdict */}
          <R d={400}>
            <div className="mt-6 text-center">
              <p className="text-[11px] text-white/15 italic">The choice is obvious.</p>
            </div>
          </R>
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          5 · TEAM QUOTES
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-28">
        <div className="max-w-[1000px] mx-auto">
          <Hdr tag="Team" title={<>What Our Team <span className="lx-text-orange">Says</span></>} sub="Real quotes from people who actually work here." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEAM_QUOTES.map((q, i) => (
              <R key={i} d={i * 100}>
                <div className="lx-card lx-shine group p-8 relative overflow-hidden"
                  style={{ borderColor: `${q.grad[0]}40` }}>

                  {/* Gradient glow top — role color */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${q.grad[1]}30, transparent)` }} />
                  <div className="absolute top-0 left-0 right-0 h-[80px] pointer-events-none" style={{ background: `linear-gradient(180deg, ${q.grad[0]}15, transparent)` }} />

                  {/* Big quote mark */}
                  <div className="absolute top-4 right-6 text-[80px] font-serif leading-none select-none pointer-events-none" style={{ color: `${q.grad[1]}06` }}>&ldquo;</div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-6 relative z-10">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 lx-star" style={{ animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </div>

                  <p className="text-[15px] text-white/50 leading-[1.9] mb-8 relative z-10 group-hover:text-white/65 transition-colors duration-500">&ldquo;{q.text}&rdquo;</p>

                  <div className="flex items-center gap-4 pt-6 relative z-10" style={{ borderTop: `1px solid ${q.grad[1]}10` }}>
                    {/* Avatar — round with glow */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden" style={{ boxShadow: `0 0 12px ${q.grad[1]}35, 0 0 4px ${q.grad[1]}20` }}>
                        <img src={q.img} alt={q.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-black flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 lx-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-white/80">{q.name}</p>
                      <p className="text-[11px] font-medium" style={{ color: `${q.grad[1]}70` }}>{q.role} · {q.time}</p>
                    </div>
                  </div>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          6 · APPLICATION FORM
          ═══════════════════════════════════════════════════════════ */}

      <section id="apply-form" ref={formRef} className="relative z-10 py-28 px-6 sm:px-10 lg:px-16">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(249,115,22,0.025), transparent)" }} />

        <div className="max-w-[700px] mx-auto relative">
          <Hdr tag="Apply" title={<>Apply <span className="lx-text-orange">Now</span></>} sub="Takes 2 minutes. We respond within 48 hours. No resume needed." />

          {/* Step tabs */}
          <R d={150}>
            <div className="flex items-center justify-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-10 max-w-md mx-auto">
              {[
                { label: "About You", icon: Users, valid: v0 },
                { label: "Schedule", icon: Clock, valid: v1 },
                { label: "Experience", icon: Star, valid: v2 },
              ].map((step, i) => {
                const act = formStep === i
                return (
                  <button key={i} onClick={() => setFormStep(i)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-semibold transition-all duration-300 cursor-pointer ${
                      act ? "bg-white/[0.06] text-white/90 shadow-lg shadow-black/20"
                      : step.valid ? "text-emerald-400/60 hover:bg-white/[0.02]"
                      : "text-white/25 hover:bg-white/[0.02] hover:text-white/35"
                    }`}>
                    {step.valid && !act ? <Check className="h-3.5 w-3.5 text-emerald-400/60" /> : <step.icon className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                )
              })}
            </div>
          </R>

          {/* Progress bar — thin, elegant */}
          <R d={180}>
            <div className="mb-10">
              <div className="h-[2px] bg-white/[0.03] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${pct === 100 ? "bg-emerald-500/60" : "bg-[#f97316]/50"}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/15">{filled}/9 completed</span>
                <span className={`text-[10px] font-bold tabular-nums ${pct === 100 ? "text-emerald-400/60" : "text-white/20"}`}>{pct}%</span>
              </div>
            </div>
          </R>

          <R d={250}>
            {/* Form card */}
            <div className="lx-form-wrap">
              <div className="lx-form-border" />
              <div className="relative z-10 rounded-2xl overflow-hidden bg-[#030303] border border-white/[0.04]" style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset" }}>

              {/* Selected position header */}
              {sel && <>
                <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent 20%, ${sel.color}40, transparent 80%)` }} />
                <div className="px-7 py-5 border-b border-white/[0.04]" style={{ background: `linear-gradient(135deg, ${sel.color}04, transparent)` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.05]"
                      style={{ background: sel.grad ? `linear-gradient(135deg, ${sel.grad[0]}, ${sel.grad[1]}40)` : `${sel.color}08` }}>
                      <sel.icon className="h-5 w-5" style={{ color: sel.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[16px] text-white/85">{sel.title}</p>
                      <p className="text-[11px] text-white/25">{sel.slots} · Remote · {sel.salary}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 lx-pulse" />
                      <span className="text-[10px] text-emerald-400/50 font-medium">Hiring</span>
                    </div>
                  </div>
                </div>
              </>}

              <div className="p-6 sm:p-8">

                {/* ── STEP 0: About You ── */}
                {formStep === 0 && <div className="space-y-5 lx-step">

                  {/* Role picker */}
                  <div className="lx-field">
                    <div className="lx-field-header"><Sparkles className="h-4 w-4 text-[#f97316]/40" /><div><p className="lx-field-title">Choose your role</p><p className="lx-field-sub">What position are you applying for?</p></div></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                      {POSITIONS.map(p => {
                        const a = position === p.id
                        return (
                          <button key={p.id} type="button" onClick={() => setPosition(p.id)}
                            className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl text-center transition-all duration-300 cursor-pointer group ${a ? "border-2" : "border border-white/[0.04] hover:border-white/[0.08]"}`}
                            style={a ? { borderColor: `${p.color}35`, background: `${p.color}06`, boxShadow: `0 0 25px ${p.color}08` } : { background: "rgba(255,255,255,0.01)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                              style={{ background: a && p.grad ? `linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]}40)` : `${p.color}08` }}>
                              <p.icon className="h-4 w-4" style={{ color: a ? p.color : `${p.color}50` }} />
                            </div>
                            <span className={`text-[11px] font-semibold truncate w-full ${a ? "text-white/80" : "text-white/30"}`}>{p.title}</span>
                            {a && <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full" style={{ background: p.color }} />}
                          </button>
                        )
                      })}
                    </div>
                    {position && (() => {
                      const b = ROLE_BENEFITS[position], p = POSITIONS.find(x => x.id === position)
                      if (!b || !p) return null
                      return <div className="mt-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] lx-step">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: `${p.color}40` }}>Perks</p>
                        <div className="grid grid-cols-2 gap-2">{b.map((x, i) => <div key={i} className="flex items-center gap-2"><Check className="h-3 w-3 shrink-0" style={{ color: `${p.color}40` }} /><span className="text-[11px] text-white/30">{x}</span></div>)}</div>
                      </div>
                    })()}
                  </div>

                  {/* Discord */}
                  <div className="lx-field">
                    <div className="lx-field-header">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 -28.5 256 256" fill="rgba(255,255,255,0.15)"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fillRule="nonzero"/></svg>
                      <div><p className="lx-field-title">Discord</p><p className="lx-field-sub">We&apos;ll contact you here</p></div>
                      {discord.length >= 2 && <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check className="h-3 w-3 text-emerald-400/60" /></div>}
                    </div>
                    <input type="text" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="your_username" className="lx-input mt-3" />
                  </div>

                  {/* Age + Timezone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="lx-field">
                      <div className="lx-field-header"><Users className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Age</p><p className="lx-field-sub">Must be 16+</p></div></div>
                      <div className="flex items-center gap-3 mt-3 p-2 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                        <button type="button" onClick={() => setAge(Math.max(16, age - 1))} className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all cursor-pointer active:scale-90"><Minus className="h-4 w-4" /></button>
                        <span className="flex-1 text-center text-2xl font-bold tabular-nums text-white/80">{age}</span>
                        <button type="button" onClick={() => setAge(Math.min(50, age + 1))} className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all cursor-pointer active:scale-90"><Plus className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="lx-field">
                      <div className="lx-field-header"><Globe className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Timezone</p><p className="lx-field-sub">Where are you based?</p></div></div>
                      <div className="flex flex-wrap gap-1.5 mt-3 max-h-[130px] overflow-y-auto lx-scrollbar pr-1">
                        {TIMEZONES.map((tz, i) => { const s = timezone === `${tz.v}|${tz.l}`; return (
                          <button key={`${tz.l}-${i}`} type="button" onClick={() => setTimezone(`${tz.v}|${tz.l}`)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${s ? "bg-white/[0.06] text-white/80 border border-white/[0.12]" : "bg-white/[0.01] border border-white/[0.04] text-white/25 hover:border-white/[0.08]"}`}>
                            <span className="text-[13px] leading-none">{tz.flag}</span><span>{tz.l}</span>
                          </button>
                        ) })}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => v0 && setFormStep(1)} disabled={!v0}
                    className="w-full lx-primary py-4 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer group">
                    Continue to Schedule <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>}

                {/* ── STEP 1: Schedule ── */}
                {formStep === 1 && <div className="space-y-5 lx-step">

                  <div className="lx-field">
                    <div className="lx-field-header"><Clock className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Hours per week</p><p className="lx-field-sub">How much time can you commit?</p></div></div>
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {[
                        { v: "5-10h", label: "Part-time" },
                        { v: "10-20h", label: "Half" },
                        { v: "20-30h", label: "Solid" },
                        { v: "30-40h", label: "Full" },
                        { v: "40+", label: "Max" },
                      ].map(h => {
                        const active = hoursPerWeek === h.v
                        return (
                          <button key={h.v} type="button" onClick={() => setHoursPerWeek(h.v)}
                            className={`py-4 rounded-xl text-center transition-all duration-300 cursor-pointer ${active ? "border-2 border-[#f97316]/30 bg-[#f97316]/10" : "border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]"}`}
                            style={active ? { boxShadow: "0 0 15px rgba(249,115,22,0.06)" } : {}}>
                            <p className={`text-[13px] font-bold ${active ? "text-[#f97316]" : "text-white/30"}`}>{h.v}</p>
                            <p className={`text-[9px] mt-0.5 ${active ? "text-[#f97316]/50" : "text-white/10"}`}>{h.label}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="lx-field">
                    <div className="lx-field-header"><Star className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Available days</p><p className="lx-field-sub">Select all that apply</p></div></div>
                    <div className="grid grid-cols-7 gap-1.5 mt-4">
                      {DAYS.map(d => {
                        const active = selectedDays.includes(d)
                        const isWeekend = d === "Sat" || d === "Sun"
                        return (
                          <button key={d} type="button" onClick={() => toggleDay(d)}
                            className={`py-4 rounded-xl text-center transition-all duration-300 cursor-pointer ${active ? "border-2 border-[#f97316]/30 bg-[#f97316]/10" : "border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]"}`}
                            style={active ? { boxShadow: "0 0 12px rgba(249,115,22,0.05)" } : {}}>
                            <p className={`text-[12px] font-bold ${active ? "text-[#f97316]" : isWeekend ? "text-white/15" : "text-white/30"}`}>{d}</p>
                          </button>
                        )
                      })}
                    </div>
                    {selectedDays.length > 0 && <p className="text-[10px] text-white/15 mt-2">{selectedDays.length} day{selectedDays.length > 1 ? "s" : ""} selected</p>}
                  </div>

                  <div className="lx-field">
                    <div className="lx-field-header"><Coffee className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Preferred time</p><p className="lx-field-sub">When do you work best?</p></div></div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
                      {[
                        { v: "Morning", t: "6am-12pm", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>, color: "#fbbf24" },
                        { v: "Afternoon", t: "12-6pm", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2"/><path d="M6 6l8 0M18 12h2" strokeOpacity="0.4"/></svg>, color: "#f97316" },
                        { v: "Evening", t: "6pm-12am", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>, color: "#8b5cf6" },
                        { v: "Night", t: "12-6am", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/><circle cx="17" cy="5" r="1" fill="currentColor"/><circle cx="20" cy="8" r="0.5" fill="currentColor"/></svg>, color: "#3b82f6" },
                        { v: "Flexible", t: "Anytime", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, color: "#22c55e" },
                      ].map(t => {
                        const active = preferredTime === t.v
                        return (
                          <button key={t.v} type="button" onClick={() => setPreferredTime(t.v)}
                            className={`py-5 rounded-xl text-center transition-all duration-300 cursor-pointer group ${active ? "border-2" : "border border-white/[0.04] hover:border-white/[0.08]"}`}
                            style={active ? { borderColor: `${t.color}30`, background: `${t.color}08`, boxShadow: `0 0 20px ${t.color}08` } : { background: "rgba(255,255,255,0.01)" }}>
                            <div className="flex justify-center mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: active ? t.color : "rgba(255,255,255,0.2)" }}>
                              {t.icon}
                            </div>
                            <p className={`text-[11px] font-bold ${active ? "text-white/80" : "text-white/35"}`}>{t.v}</p>
                            <p className="text-[9px] text-white/15 mt-0.5">{t.t}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setFormStep(0)} className="lx-ghost flex-1 py-3.5 rounded-xl text-[13px] font-medium cursor-pointer">Back</button>
                    <button onClick={() => v1 && setFormStep(2)} disabled={!v1}
                      className="flex-[2] lx-primary py-4 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer group">
                      Continue to Experience <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>}

                {/* ── STEP 2: Experience ── */}
                {formStep === 2 && <div className="space-y-5 lx-step">

                  <div className="lx-field">
                    <div className="lx-field-header"><Code2 className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Your experience</p><p className="lx-field-sub">Skills, past projects, relevant background</p></div></div>
                    <textarea value={experience} onChange={e => setExperience(e.target.value)} placeholder="Tell us what you've done and what you're good at..." rows={5} className="lx-textarea mt-3"
                      style={{ borderColor: experience.length >= 50 ? "rgba(34,197,94,0.15)" : undefined }} />
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-[11px] ${experience.length >= 50 ? "text-emerald-400/60" : "text-white/40"}`}>
                        {experience.length >= 50 ? <><Check className="inline h-3 w-3 mr-1" />Looks good</> : `${experience.length}/50 characters minimum`}
                      </p>
                      <span className="text-[10px] text-white/10 tabular-nums">{experience.length}</span>
                    </div>
                  </div>

                  <div className="lx-field">
                    <div className="lx-field-header"><Heart className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Why Lethal?</p><p className="lx-field-sub">What excites you about joining us?</p></div></div>
                    <textarea value={whyLethal} onChange={e => setWhyLethal(e.target.value)} placeholder="What draws you to this role and our team?" rows={4} className="lx-textarea mt-3"
                      style={{ borderColor: whyLethal.length >= 30 ? "rgba(34,197,94,0.15)" : undefined }} />
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-[11px] ${whyLethal.length >= 30 ? "text-emerald-400/60" : "text-white/40"}`}>
                        {whyLethal.length >= 30 ? <><Check className="inline h-3 w-3 mr-1" />Looks good</> : `${whyLethal.length}/30 characters minimum`}
                      </p>
                      <span className="text-[10px] text-white/10 tabular-nums">{whyLethal.length}</span>
                    </div>
                  </div>

                  <div className="lx-field">
                    <div className="lx-field-header"><ArrowRight className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Portfolio</p><p className="lx-field-sub">Optional — link to your work</p></div></div>
                    <input type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://your-portfolio.com" className="lx-input mt-3" />
                  </div>

                  {/* Agreements */}
                  <div className="lx-field">
                    <div className="lx-field-header"><Shield className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Agreements</p><p className="lx-field-sub">Please confirm all three</p></div></div>
                    <div className="space-y-3 mt-4">
                      {[{c:agree16,s:setAgree16,l:"I confirm I'm at least 16 years old"},{c:agreeActive,s:setAgreeActive,l:"I agree to be active and maintain professionalism"},{c:agreeUnpaid,s:setAgreeUnpaid,l:"I understand this may be initially unpaid / commission-based"}].map((it, i) => (
                        <label key={i} className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-white/[0.03] hover:border-white/[0.06] bg-white/[0.005] hover:bg-white/[0.01] transition-all" onClick={() => it.s(!it.c)}>
                          <div className={`mt-0.5 h-5 w-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${it.c ? "bg-[#f97316]/20 border-[#f97316]/40" : "border-white/[0.08] group-hover:border-white/[0.15]"}`}>
                            {it.c && <Check className="h-3 w-3 text-[#f97316]" />}
                          </div>
                          <span className={`text-[13px] leading-relaxed transition-colors ${it.c ? "text-white/60" : "text-white/25 group-hover:text-white/40"}`}>{it.l}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setFormStep(1)} className="lx-ghost flex-1 py-3.5 rounded-xl text-[13px] font-medium cursor-pointer">Back</button>
                    <button onClick={doSubmit} disabled={!v2 || submitting}
                      className="flex-[2] lx-primary py-4 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer group lx-breathe">
                      {submitting ? <span className="animate-spin h-4 w-4 border-2 border-white/25 border-t-white rounded-full" /> : <><Send className="h-4 w-4" /> Submit Application</>}
                    </button>
                  </div>
                </div>}
              </div>
            </div>
            </div>
          </R>
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          7 · FAQ
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-28">
        <div className="max-w-[700px] mx-auto">
          <Hdr tag="FAQ" title={<>Common <span className="lx-text-orange">Questions</span></>} sub="Everything you need to know before applying." />

          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <R key={i} d={i * 50}>
                <div className={`lx-card lx-shine rounded-xl overflow-hidden group transition-all duration-500 ${openFaq === i ? "lx-faq-open" : ""}`}>
                  {/* Question row */}
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center gap-4 w-full p-6 text-left cursor-pointer">
                    {/* Number */}
                    <span className={`text-[12px] font-bold tabular-nums shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      openFaq === i ? "bg-[#f97316]/15 text-[#f97316]" : "bg-white/[0.03] text-white/15"
                    }`}>
                      {(i + 1).toString().padStart(2, "0")}
                    </span>

                    <span className={`text-[15px] font-semibold flex-1 pr-4 transition-colors duration-300 ${
                      openFaq === i ? "text-white/90" : "text-white/50 group-hover:text-white/70"
                    }`}>{f.q}</span>

                    {/* Animated plus/minus icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                      openFaq === i ? "bg-[#f97316]/10 rotate-45" : "bg-white/[0.02] group-hover:bg-white/[0.04]"
                    }`}>
                      <Plus className={`h-3.5 w-3.5 transition-colors duration-300 ${openFaq === i ? "text-[#f97316]" : "text-white/15"}`} />
                    </div>
                  </button>

                  {/* Answer */}
                  <div className="grid transition-all duration-500" style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pl-[4.25rem]">
                        <div className="h-px bg-gradient-to-r from-[#f97316]/10 via-white/[0.03] to-transparent mb-5" />
                        <p className="text-[14px] text-white/40 leading-[1.9]">{f.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </R>
            ))}
          </div>

          {/* Bottom helper */}
          <R d={500}>
            <div className="text-center mt-10">
              <p className="text-[12px] text-white/15">Still have questions? <Link href="https://discord.gg/lethal" target="_blank" className="text-[#f97316]/50 hover:text-[#f97316]/80 transition-colors">Ask on Discord</Link></p>
            </div>
          </R>
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          8 · FINAL CTA
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 50%, rgba(249,115,22,0.03), transparent)" }} />
        <div className="max-w-[700px] mx-auto text-center relative">
          <R><div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] mb-8"><Flame className="h-3.5 w-3.5 text-white/20" /><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Your Future</span></div></R>
          <R d={100}><h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-6 leading-tight lx-text-fade">Stop scrolling.<br /><span className="lx-text-orange relative inline-block">Start building.<span className="absolute left-0 -bottom-1 w-full h-[3px] rounded-full" style={{ background: "linear-gradient(90deg, #f97316, rgba(249,115,22,0.2))", boxShadow: "0 0 15px rgba(249,115,22,0.25)" }} /></span></h2></R>
          <R d={200}><p className="text-white/30 mb-12 text-[15px] sm:text-[17px] max-w-md mx-auto">The best time to join was yesterday. The second best is <span className="text-white/65 font-semibold">right now</span>.</p></R>
          <R d={300}><button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })} className="lx-primary px-12 py-4 rounded-xl text-[16px] font-bold text-white inline-flex items-center gap-3 cursor-pointer lx-breathe"><Send className="h-5 w-5" /> Apply Now</button></R>
          <R d={400}><div className="flex items-center justify-center gap-6 mt-12 flex-wrap">{[{icon:Shield,text:"48h Response"},{icon:Heart,text:"Zero Toxicity"},{icon:Zap,text:"Day-One Impact"},{icon:Globe,text:"Fully Remote"}].map((it, i) => <div key={i} className="flex items-center gap-1.5 text-white/40"><it.icon className="h-3 w-3" /><span className="text-[11px] font-medium">{it.text}</span></div>)}</div></R>
        </div>
      </section>

      <Footer />


      {/* ═══════════════════════════════════════════════════════════
          STYLES
          ═══════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        /* Transparent page so GlobalBackground shows through */
        .lx-page {
          background-color: transparent;
        }
        .lx-page footer, .lx-page [class*="footer"] {
          background-color: transparent !important;
        }

        /* Noise — primary background texture (film grain) */
        .lx-noise {
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
        }

        /* Aurora */
        .lx-aurora { position: absolute; border-radius: 50%; filter: blur(120px); will-change: transform; }
        .lx-a1 { width: 800px; height: 600px; top: -200px; right: -100px; background: radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%); animation: aDrift1 20s ease-in-out infinite; }
        .lx-a2 { width: 600px; height: 500px; bottom: -100px; left: -100px; background: radial-gradient(circle, rgba(234,88,12,0.05), transparent 70%); animation: aDrift2 25s ease-in-out infinite; }
        .lx-a3 { width: 500px; height: 400px; top: 30%; right: 20%; background: radial-gradient(circle, rgba(255,255,255,0.010), transparent 60%); animation: aDrift3 18s ease-in-out infinite; }
        @keyframes aDrift1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-3%,4%) scale(1.05); } 66% { transform: translate(4%,-2%) scale(0.97); } }
        @keyframes aDrift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(5%,-3%) scale(1.08); } }
        @keyframes aDrift3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-4%,5%); } }

        /* Grid — disabled, using noise instead */
        .lx-grid { display: none; }

        /* Chrome text — hero heading shimmer */
        .lx-chrome {
          background: linear-gradient(
            110deg,
            rgba(255,255,255,0.6) 0%,
            rgba(255,255,255,1) 12%,
            rgba(190,190,190,0.5) 24%,
            rgba(255,255,255,0.85) 36%,
            rgba(160,160,160,0.4) 48%,
            rgba(255,255,255,0.95) 60%,
            rgba(200,200,200,0.5) 72%,
            rgba(255,255,255,0.8) 84%,
            rgba(255,255,255,0.6) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: chromeSlide 5s ease-in-out infinite;
        }
        @keyframes chromeSlide {
          0% { background-position: 300% 50%; }
          100% { background-position: -300% 50%; }
        }

        /* Orange text gradient */
        .lx-text-orange {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 40%, #f97316 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          filter: drop-shadow(0 0 30px rgba(249,115,22,0.15));
        }

        /* Card */
        .lx-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; transition: all 0.3s ease; position: relative; overflow: hidden; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .lx-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(249,115,22,0.30); transform: translateY(-4px); box-shadow: 0 24px 50px rgba(0,0,0,0.4), 0 0 40px rgba(249,115,22,0.10); }

        /* Popular */
        .lx-popular { border-color: rgba(249,115,22,0.1) !important; box-shadow: 0 0 50px rgba(249,115,22,0.02); }
        .lx-popular:hover { border-color: rgba(249,115,22,0.18) !important; box-shadow: 0 0 70px rgba(249,115,22,0.04); }

        /* Shine sweep */
        .lx-shine { position: relative; overflow: hidden; }
        .lx-shine::after { content: ""; position: absolute; top: -50%; left: -80%; width: 50%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent); transform: rotate(25deg); transition: left 0.7s ease; pointer-events: none; z-index: 5; }
        .lx-shine:hover::after { left: 130%; }

        /* Terminal */
        .lx-terminal-wrap { position: relative; padding: 1px; border-radius: 16px; }
        .lx-rotating-border { position: absolute; inset: 0; border-radius: 16px; padding: 1px; background: conic-gradient(from var(--ba,0deg), transparent 40%, rgba(255,255,255,0.05) 50%, rgba(249,115,22,0.1) 55%, rgba(255,255,255,0.03) 60%, transparent 70%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: bRot 6s linear infinite; }
        @property --ba { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @keyframes bRot { to { --ba: 360deg; } }

        /* Chrome shimmer text — applies to ALL section headings */
        .lx-text-fade {
          background: linear-gradient(
            105deg,
            rgba(255,255,255,0.7) 0%,
            rgba(255,255,255,0.95) 15%,
            rgba(200,200,200,0.5) 30%,
            rgba(255,255,255,0.9) 45%,
            rgba(180,180,180,0.4) 55%,
            rgba(255,255,255,0.85) 70%,
            rgba(220,220,220,0.5) 85%,
            rgba(255,255,255,0.7) 100%
          );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: chromeShimmer 6s ease-in-out infinite;
        }
        @keyframes chromeShimmer {
          0% { background-position: 250% 50%; }
          100% { background-position: -250% 50%; }
        }
        .lx-underline { position: relative; display: inline-block; }
        .lx-underline::after { content: ""; position: absolute; left: 0; bottom: 4px; width: 100%; height: 3px; background: linear-gradient(90deg, rgba(249,115,22,0.55), rgba(249,115,22,0.15)); border-radius: 2px; box-shadow: 0 0 15px rgba(249,115,22,0.2); }

        /* Pills */
        .lx-pill { display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.025); font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.65); transition: all 0.2s ease; backdrop-filter: blur(8px); }
        .lx-pill:hover { border-color: rgba(249,115,22,0.30); color: #fff; background: rgba(249,115,22,0.08); }

        /* Buttons */
        .lx-primary { background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 0 25px rgba(249,115,22,0.22), 0 0 80px rgba(249,115,22,0.05); transition: all 0.25s ease; }
        .lx-primary:hover { box-shadow: 0 0 35px rgba(249,115,22,0.4), 0 0 100px rgba(249,115,22,0.1); transform: translateY(-1px); filter: brightness(1.1); }
        .lx-primary:active { transform: translateY(0) scale(0.98); filter: brightness(1); }
        .lx-primary:disabled { box-shadow: none; filter: none; }

        .lx-ghost { border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.025); color: rgba(255,255,255,0.65); transition: all 0.2s ease; backdrop-filter: blur(8px); }
        .lx-ghost:hover { border-color: rgba(249,115,22,0.40); background: rgba(249,115,22,0.06); color: #fff; }
        .lx-ghost:active { transform: scale(0.97); }

        .lx-breathe { animation: lxBreath 3s ease-in-out infinite; }
        @keyframes lxBreath { 0%,100% { box-shadow: 0 0 25px rgba(249,115,22,0.18), 0 0 80px rgba(249,115,22,0.05); } 50% { box-shadow: 0 0 40px rgba(249,115,22,0.32), 0 0 100px rgba(249,115,22,0.1); } }

        /* Form — premium inputs */
        .lx-label { display: block; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 12px; letter-spacing: -0.01em; }
        .lx-input {
          width: 100%; height: 52px; padding: 0 18px; border-radius: 12px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          font-size: 14px; color: white; transition: all 0.3s ease; outline: none;
          backdrop-filter: blur(8px);
        }
        .lx-input::placeholder { color: rgba(255,255,255,0.40); }
        .lx-input:focus {
          border-color: rgba(249,115,22,0.45);
          background: rgba(255,255,255,0.045);
          box-shadow: 0 0 0 4px rgba(249,115,22,0.10), 0 0 28px rgba(249,115,22,0.08);
        }
        .lx-textarea {
          width: 100%; padding: 16px 18px; border-radius: 12px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          font-size: 14px; color: white; transition: all 0.3s ease; outline: none;
          resize: none; line-height: 1.7;
          backdrop-filter: blur(8px);
        }
        .lx-textarea::placeholder { color: rgba(255,255,255,0.40); }
        .lx-textarea:focus {
          border-color: rgba(249,115,22,0.45);
          background: rgba(255,255,255,0.045);
          box-shadow: 0 0 0 4px rgba(249,115,22,0.10), 0 0 28px rgba(249,115,22,0.08);
        }

        /* Divider shimmer */
        .lx-shimmer { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.035), transparent); position: relative; overflow: hidden; }
        .lx-shimmer::after { content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: lxShim 5s ease-in-out infinite; }
        @keyframes lxShim { 0%,100% { left: -40%; } 50% { left: 100%; } }

        /* Micro */
        .lx-pulse { animation: lxPulse 2.5s ease-in-out infinite; }
        @keyframes lxPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .lx-blink { color: rgba(255,255,255,0.35); animation: lxBlink 1s step-end infinite; }
        @keyframes lxBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .lx-step { animation: lxStepIn 0.4s ease; }
        @keyframes lxStepIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
        .lx-fadein { animation: lxFadeIn 0.8s ease; }
        @keyframes lxFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes confetti { 0% { transform: translateY(0) rotate(0) scale(1); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; } }
        @keyframes pFloat { 0%,100% { transform: translate(0,0); opacity: 0.03; } 25% { transform: translate(10px,-20px); opacity: 0.06; } 50% { transform: translate(-5px,-40px); opacity: 0.04; } 75% { transform: translate(15px,-20px); opacity: 0.07; } }

        /* Transitions util */
        .tr { transition: all 1s cubic-bezier(0.16,1,0.3,1); }
        .o0 { opacity: 0; } .o1 { opacity: 1; }
        .ty0 { transform: translateY(0); } .ty1 { transform: translateY(16px); } .ty2 { transform: translateY(32px); } .ty3 { transform: translateY(48px); }

        /* Rocket shake */
        .lx-rocket {
          animation: flameColor 3s ease-in-out infinite, rocketShake 0.5s ease-in-out infinite;
        }
        @keyframes rocketShake {
          0%, 100% { transform: translateY(0) rotate(-45deg); }
          50% { transform: translateY(-1px) rotate(-45deg); }
        }

        /* Dot color cycle: red → orange → green */
        .lx-dot-cycle {
          animation: dotCycle 4s ease-in-out infinite;
        }
        @keyframes dotCycle {
          0%, 30%   { background: #ef4444; }
          35%, 65%  { background: #f97316; }
          70%, 100% { background: #22c55e; }
        }

        /* Form field card */
        .lx-field {
          padding: 22px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.022);
          transition: all 0.3s ease;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .lx-field:hover {
          border-color: rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.035);
        }
        .lx-field:focus-within {
          border-color: rgba(249,115,22,0.30);
          background: rgba(249,115,22,0.025);
          box-shadow: 0 0 40px rgba(249,115,22,0.10);
        }
        .lx-field-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .lx-field-header > svg { margin-top: 2px; flex-shrink: 0; color: #f97316; }
        .lx-field-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        .lx-field-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          margin-top: 3px;
        }

        /* Thin scrollbar for timezone picker */
        .lx-scrollbar::-webkit-scrollbar { width: 3px; }
        .lx-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .lx-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }

        /* (brand cycling done via React state now) */

        /* Gold star — loops: dim → fill gold 1-by-1 → hold → dim back */
        .lx-star {
          fill: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.06);
          animation: starLoop 4s ease infinite;
        }
        @keyframes starLoop {
          0%, 10% { fill: rgba(255,255,255,0.04); color: rgba(255,255,255,0.06); }
          25%, 70% { fill: #fbbf24; color: #fbbf24; filter: drop-shadow(0 0 3px rgba(251,191,36,0.4)); }
          85%, 100% { fill: rgba(255,255,255,0.04); color: rgba(255,255,255,0.06); filter: none; }
        }

        /* 8 ↔ ∞ glitch swap */
        .lx-8-num, .lx-8-inf {
          animation-duration: 6s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .lx-8-num { animation-name: numFade; }
        .lx-8-inf {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation-name: infFade;
          color: #f97316;
        }
        @keyframes numFade {
          0%, 40% { opacity: 1; filter: blur(0); }
          45% { opacity: 0; filter: blur(4px); }
          50%, 90% { opacity: 0; filter: blur(4px); }
          95%, 100% { opacity: 1; filter: blur(0); }
        }
        @keyframes infFade {
          0%, 40% { opacity: 0; filter: blur(4px); }
          45%, 50% { opacity: 1; filter: blur(0); text-shadow: 0 0 10px rgba(249,115,22,0.4); }
          90% { opacity: 1; filter: blur(0); text-shadow: 0 0 10px rgba(249,115,22,0.4); }
          95%, 100% { opacity: 0; filter: blur(4px); }
        }

        /* FAQ open state — accent border + glow */
        .lx-faq-open {
          border-color: rgba(249,115,22,0.12) !important;
          background: rgba(249,115,22,0.02) !important;
          box-shadow: 0 0 30px rgba(249,115,22,0.03);
        }

        /* Flame icon — cycles orange → red → blue */
        .lx-flame {
          animation: flameColor 3s ease-in-out infinite;
        }
        @keyframes flameColor {
          0%, 100% { color: #f97316; filter: drop-shadow(0 0 4px rgba(249,115,22,0.5)); }
          33% { color: #ef4444; filter: drop-shadow(0 0 4px rgba(239,68,68,0.5)); }
          66% { color: #3b82f6; filter: drop-shadow(0 0 4px rgba(59,130,246,0.5)); }
        }

        /* Terminal dots — muted, minimal */
        .lx-dot-red { background: rgba(255,95,87,0.25); }
        .lx-dot-yellow { background: rgba(255,189,46,0.25); }
        .lx-dot-green { background: rgba(40,200,64,0.25); }

        /* Form card rotating border */
        .lx-form-wrap { position: relative; padding: 1px; border-radius: 18px; }
        .lx-form-border {
          position: absolute; inset: 0; border-radius: 18px; padding: 1px;
          background: conic-gradient(from var(--ba,0deg), transparent 30%, rgba(249,115,22,0.08) 40%, rgba(255,255,255,0.06) 50%, rgba(249,115,22,0.12) 55%, rgba(255,255,255,0.04) 65%, transparent 75%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: bRot 8s linear infinite;
        }

        /* Google brand square */
        .lx-corp-dot {
          opacity: 0.6;
          animation: corpDotColor 16s ease infinite;
        }
        @keyframes corpDotColor {
          0%, 11%     { background: #4285F4; }
          12.5%, 23%  { background: #a2aaad; }
          25%, 36%    { background: #e82127; }
          37.5%, 48%  { background: #1877f2; }
          50%, 61%    { background: #ff9900; }
          62.5%, 73%  { background: #00a4ef; }
          75%, 86%    { background: #1428a0; }
          87.5%, 99%  { background: #e50914; }
          100%        { background: #4285F4; }
        }

        /* Focus + scrollbar */
        *:focus-visible { outline: 1px solid rgba(255,255,255,0.12); outline-offset: 2px; border-radius: 8px; }
        .lx-page ::selection { background: rgba(249,115,22,0.15); color: white; }

        /* Orb animations */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>
    </main>
  )
}
