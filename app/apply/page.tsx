"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/section-eyebrow"
import {
  Users, Code2, Crown, Headphones, Camera, Search, DollarSign,
  Check, Minus, Plus, Send, CheckCircle2, Shield, Zap, Globe,
  ArrowRight, ArrowUpRight, Clock, Star, ChevronRight, ChevronDown, Copy,
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

const FAQ: Array<{ q: string; a: string; Icon: typeof Zap; tag: string }> = [
  { Icon: DollarSign, tag: "Pay",        q: "Is this paid?",               a: "Most roles start commission-based or unpaid during trial. Top performers get promoted to paid positions quickly." },
  { Icon: Clock,      tag: "Hours",      q: "How many hours do I need?",   a: "Minimum 5-10h/week for most roles. More hours = more opportunity." },
  { Icon: Star,       tag: "Experience", q: "Do I need experience?",       a: "Depends on the role. Support needs product knowledge, Dev needs coding. Sales just needs hustle." },
  { Icon: Zap,        tag: "Response",   q: "How fast do you respond?",    a: "We review every application within 48 hours via Discord. No ghosting." },
  { Icon: Sparkles,   tag: "Roles",      q: "Can I work multiple roles?",  a: "Yes! Many team members wear multiple hats. Start with one and expand." },
  { Icon: Code2,      tag: "Tools",      q: "What tools do you use?",      a: "Discord, GitHub, Notion. We provide all software and licenses — zero cost." },
  { Icon: Heart,      tag: "Culture",    q: "What's the culture like?",    a: "Zero toxicity, mutual respect, no micromanagement. Your ideas matter from day one." },
  { Icon: Globe,      tag: "Remote",     q: "Can I work from anywhere?",   a: "100% remote. 6+ timezones. Work from your couch, a cafe, or a beach." },
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
  { icon: Shield, title: "Trusted Brand", desc: "3,400+ reviews, 99.8% uptime. Customers love us.", size: "normal" as const },
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

function useInView(threshold = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Trigger only once the element actually enters the viewport (negative
    // bottom margin = must be ~10% inside). This is what makes the reveal
    // visible to the user instead of firing before they scroll to it.
    // Safety timer fallback: still force visible after 2s in case the observer
    // never fires (pinch-zoom, paint-skipping, reduced motion).
    const safetyTimer = window.setTimeout(() => setVisible(true), 2000)
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          window.clearTimeout(safetyTimer)
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin: "0px 0px -12% 0px" },
    )
    obs.observe(el)
    return () => {
      window.clearTimeout(safetyTimer)
      obs.disconnect()
    }
  }, [threshold])
  return { ref, visible }
}


// ─── Reveal ──────────────────────────────────────────────────────────────────

function R({ children, d = 0, dir = "up", className = "" }: {
  children: React.ReactNode; d?: number; dir?: "up" | "left" | "right" | "scale"; className?: string
}) {
  const { ref, visible } = useInView()
  const t: Record<string, string> = {
    up:    "translateY(36px)",
    left:  "translateX(36px)",
    right: "translateX(-36px)",
    scale: "scale(0.94)",
  }
  // Capped stagger so later elements don't compound into multi-second waits.
  const delay = Math.min(d, 260)
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : t[dir],
      transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      willChange: visible ? "auto" : "opacity, transform",
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
    style={{ background: "radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, transparent 55%)", willChange: "transform" }} />
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

function Hdr({ number, tag, title, sub }: { number?: string; tag: string; title: React.ReactNode; sub?: string }) {
  // Curtain-style clip-path reveal when the title enters the viewport —
  // more dramatic than the default R fade/slide used on smaller elements.
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    // Safety fallback so the title always shows even if the observer never
    // fires (reduced motion, paint skipping, etc).
    const safety = window.setTimeout(() => setTitleVisible(true), 900)
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          window.clearTimeout(safety)
          setTitleVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    )
    obs.observe(el)
    return () => { window.clearTimeout(safety); obs.disconnect() }
  }, [])

  return (
    <div className="text-center mb-14">
      <R><SectionEyebrow number={number} label={tag} /></R>
      <h2
        ref={titleRef}
        // leading-[1.08] + paddingBottom keeps descenders (y, p, g, Q) from
        // clipping — tight leading without the letter-cut ugliness.
        className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.08] mb-5 mt-2 lx-text-fade"
        style={{
          paddingBottom: "0.12em",
          clipPath: titleVisible
            ? "inset(-0.35em -0.35em -0.35em 0)"
            : "inset(-0.35em 100% -0.35em 0)",
          transition: "clip-path 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s",
        }}
      >
        {title}
      </h2>
      {sub && (
        <R d={140}>
          <p className="text-white/45 text-[15.5px] leading-relaxed max-w-lg mx-auto">
            {sub}
          </p>
        </R>
      )}
    </div>
  )
}


// ─── Quote card (used by testimonials grid + mobile carousel) ────────────────

type TeamQuote = typeof TEAM_QUOTES[number]
function QuoteCard({ q }: { q: TeamQuote }) {
  return (
    <div className="lx-card lx-shine group p-8 relative overflow-hidden h-full"
      style={{ borderColor: `${q.grad[0]}40` }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${q.grad[1]}30, transparent)` }} />
      <div className="absolute top-0 left-0 right-0 h-[80px] pointer-events-none" style={{ background: `linear-gradient(180deg, ${q.grad[0]}15, transparent)` }} />
      <div className="absolute top-4 right-6 text-[80px] font-serif leading-none select-none pointer-events-none" style={{ color: `${q.grad[1]}06` }}>&ldquo;</div>
      <div className="flex gap-1 mb-6 relative z-10">
        {[...Array(5)].map((_, j) => (
          <Star key={j} className="h-3.5 w-3.5 lx-star" style={{ animationDelay: `${j * 0.15}s` }} />
        ))}
      </div>
      <p className="text-[15px] text-white/50 leading-[1.9] mb-8 relative z-10 group-hover:text-white/65 transition-colors duration-500">&ldquo;{q.text}&rdquo;</p>
      <div className="flex items-center gap-4 pt-6 relative z-10" style={{ borderTop: `1px solid ${q.grad[1]}10` }}>
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
  )
}


// ─── Corp title — static "Traditional Employer" framing (no brand risk) ──────

function CorpTitle() {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4">
      <span className="lx-text-orange">Lethal</span>
      <span className="lx-text-fade"> vs </span>
      <span className="text-white/70">Traditional Employers</span>
    </h2>
  )
}


// ─── Path timeline showcase — 10 auto-cycling animation variants ────────────

const TIMELINE_STEPS = [
  { Icon: Send,          title: "You apply",        desc: "2 minutes. No resume." },
  { Icon: MessageSquare, title: "We reply",         desc: "Under 48h on Discord." },
  { Icon: Users,         title: "Quick chat",       desc: "Short Discord chat. No whiteboard, just vibes." },
  { Icon: Rocket,        title: "You're onboarded", desc: "Same week. Ship day one." },
]

function useTimelineStage(cycle = 18000) {
  const [stage, setStage] = useState(-1)
  useEffect(() => {
    let cancelled = false
    const timers: number[] = []
    const run = () => {
      if (cancelled) return
      setStage(-1)
      timers.push(window.setTimeout(() => !cancelled && setStage(0),   500))
      timers.push(window.setTimeout(() => !cancelled && setStage(1),  4000))
      timers.push(window.setTimeout(() => !cancelled && setStage(2),  8000))
      timers.push(window.setTimeout(() => !cancelled && setStage(3), 12000))
      timers.push(window.setTimeout(() => { if (!cancelled) run() }, cycle))
    }
    run()
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [cycle])
  return stage
}

// Classic radar — radial bubble + dashed ring + traveling particle.
function PathTimeline() {
  const stage = useTimelineStage()
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {TIMELINE_STEPS.map((s, i) => {
          const lit = stage >= i, active = stage === i, complete = stage > i
          return (
            <div key={i} className="relative">
              {i < 3 && (
                <div className="hidden md:block absolute top-[60px] left-[calc(50%+62px)] right-[calc(-50%+62px)] h-px overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-white/[0.05]" />
                  <div className="absolute inset-y-0 left-0 transition-[width] duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: complete ? "100%" : "0%", background: "linear-gradient(90deg, #fbbf24, #f97316 50%, #c2410c)", boxShadow: complete ? "0 0 8px rgba(249,115,22,0.55)" : "none" }} />
                  {active && <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#f97316] to-transparent" style={{ animation: "procFlow 1.8s ease-in-out infinite" }} />}
                </div>
              )}
              <div className="relative z-[2] flex flex-col items-center mb-5">
                <div className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center transition-all duration-[900ms]" style={{ background: "radial-gradient(circle at 30% 30%, rgba(249,115,22,0.32), rgba(0,0,0,0.95) 70%)", boxShadow: lit ? `inset 0 0 0 1px rgba(249,115,22,0.55), 0 0 ${active ? 80 : 40}px rgba(249,115,22,${active ? 0.35 : 0.16})` : "inset 0 0 0 1px rgba(255,255,255,0.08)", opacity: lit ? 1 : 0.45, transform: active ? "scale(1.05)" : "scale(1)", filter: lit ? "none" : "grayscale(0.9)" }}>
                  {lit && <div className="absolute inset-[-6px] rounded-full border border-[#f97316]/25" style={{ animation: "stepPulse 2.6s ease-in-out infinite" }} />}
                  {lit && <div className="absolute inset-[-12px] rounded-full border border-dashed border-[#f97316]/20" style={{ animation: "stepRotate 18s linear infinite" }} />}
                  <s.Icon className="h-9 w-9" strokeWidth={1.9} style={{ color: lit ? "#f97316" : "rgba(255,255,255,0.35)", filter: lit ? "drop-shadow(0 0 16px rgba(249,115,22,0.85))" : "none" }} />
                  <span className="absolute -bottom-1 -right-1 px-2.5 py-1 rounded-full text-[10px] font-black tabular-nums" style={{ background: "#000", border: `1px solid rgba(249,115,22,${lit ? 0.45 : 0.15})`, color: lit ? "#f97316" : "rgba(255,255,255,0.35)" }}>{String(i + 1).padStart(2, "0")}</span>
                  {complete && <span className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 ring-[3px] ring-black flex items-center justify-center"><Check className="h-3 w-3 text-white" strokeWidth={3.2} /></span>}
                </div>
              </div>
              <div className="text-center px-2">
                <h4 className="font-display text-[16px] font-bold text-white mb-1 tracking-tight">{s.title}</h4>
                <p className="text-[12px] text-white/50">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}



// ─── Compare row ─────────────────────────────────────────────────────────────
// Click-to-expand row with short "why this matters" explanation underneath.
type CompareCol = { key: string; name: string; mark: string; accent?: boolean }
type CompareRowData = { feat: string; icon: typeof Globe; vals: Record<string, string>; note: string }
function CompareRow({ row, index, cols, isPositive }: {
  row: CompareRowData
  index: number
  cols: CompareCol[]
  isPositive: (v: string) => boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <R d={index * 40} dir="up">
      <div
        className={`border-b border-white/[0.04] last:border-b-0 transition-colors ${open ? "bg-[#f97316]/[0.025]" : "hover:bg-white/[0.015]"}`}
      >
        <button
          onClick={() => setOpen(v => !v)}
          className="grid grid-cols-[1.4fr_repeat(5,1fr)] w-full text-left group cursor-pointer"
          aria-expanded={open}
        >
          <div className="flex items-center gap-3 px-6 py-4">
            <row.icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${open ? "text-[#f97316]" : "text-white/30 group-hover:text-[#f97316]/60"}`} />
            <span className={`text-[13.5px] font-semibold transition-colors ${open ? "text-white" : "text-white/75"}`}>{row.feat}</span>
            <ChevronDown className={`h-3 w-3 shrink-0 ml-auto transition-all duration-400 ${open ? "rotate-180 text-[#f97316]" : "text-white/25 group-hover:text-white/50"}`} />
          </div>
          {cols.map((c) => {
            const v = row.vals[c.key]
            const pos = isPositive(v)
            return (
              <div
                key={c.key}
                className={`px-3 py-4 text-center ${c.accent ? "bg-[#f97316]/[0.025]" : ""}`}
              >
                <span
                  className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                    c.accent ? "text-[#f97316]" : pos ? "text-emerald-400/80" : "text-white/40"
                  }`}
                >
                  {pos && c.accent && <Check className="h-3 w-3" strokeWidth={3} />}
                  {v}
                </span>
              </div>
            )
          })}
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="px-6 pb-5 pt-1 flex gap-3">
              <span className="shrink-0 inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#f97316]/80 mt-0.5">
                <Sparkles className="h-3 w-3" /> Why this matters
              </span>
              <p className="text-[13px] text-white/65 leading-[1.7] max-w-[720px]">{row.note}</p>
            </div>
          </div>
        </div>
      </div>
    </R>
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
  const [showAllFaq, setShowAllFaq] = useState(false)
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

  const [sentPulse, setSentPulse] = useState(false)
  const doSubmit = async () => {
    if (!v2 || submitting) return
    setSubmitting(true)
    try {
      const r = await fetch("/api/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, discord, age, timezone: timezone.split("|")[0], hoursPerWeek, availableDays: selectedDays, preferredTime, experience, whyLethal, portfolio }),
      })
      if (!r.ok) throw new Error()
      // Transient "Sent ✓" state before scroll-jump to success view — gives
      // the button a tactile confirmation moment instead of vanishing.
      setSubmitting(false)
      setSentPulse(true)
      await new Promise((resolve) => setTimeout(resolve, 550))
      setSubmitted(true); setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      toast.error("Failed to submit — try again")
      setSubmitting(false)
    }
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

          {/* Post-submit extras — keeps the user engaged instead of a dead page */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[600px] mx-auto">
            {/* Estimated reply */}
            <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 text-left overflow-hidden">
              <div className="inline-flex items-center gap-1.5 mb-2">
                <Clock className="h-3.5 w-3.5 text-[#f97316]" />
                <span className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#f97316]/85">ETA</span>
              </div>
              <p className="font-display text-[20px] font-bold text-white tabular-nums leading-none mb-1.5">&lt; 48h</p>
              <p className="text-[11.5px] text-white/45 leading-relaxed">We review every application within 48 hours. Discord DM incoming.</p>
            </div>

            {/* Share / referral */}
            <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 text-left overflow-hidden">
              <div className="inline-flex items-center gap-1.5 mb-2">
                <Users className="h-3.5 w-3.5 text-[#fbbf24]" />
                <span className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#fbbf24]/85">Bonus</span>
              </div>
              <p className="font-display text-[20px] font-bold text-white leading-tight mb-1.5">Know a legend?</p>
              <p className="text-[11.5px] text-white/45 leading-relaxed">Refer someone who gets hired — earn $200 when they ship their first week.</p>
            </div>

            {/* Community preview */}
            <Link href="https://discord.gg/lethal" target="_blank" className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.015] hover:border-[#5865F2]/35 hover:bg-white/[0.025] p-5 text-left overflow-hidden transition-all">
              <div className="inline-flex items-center gap-1.5 mb-2">
                <MessageSquare className="h-3.5 w-3.5 text-[#5865F2]" />
                <span className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#5865F2]/85">While you wait</span>
              </div>
              <p className="font-display text-[20px] font-bold text-white leading-tight mb-1.5">Lurk in Discord</p>
              <p className="text-[11.5px] text-white/45 leading-relaxed inline-flex items-center gap-1">Get a feel for the culture. <ArrowRight className="h-3 w-3 text-[#5865F2] group-hover:translate-x-0.5 transition-transform" /></p>
            </Link>
          </div>

          {/* Fun text */}
          <p className="text-white/20 text-[12px] mt-10">Welcome to the team. Let&apos;s build something legendary.</p>
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
        {/* Ambient orbs — matches home hero vibe */}
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full opacity-70"
            style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 62%)", filter: "blur(130px)" }} />
          <div className="absolute bottom-[5%] left-[5%] w-[520px] h-[420px] rounded-full opacity-55"
            style={{ background: "radial-gradient(circle, rgba(251,191,36,0.10), transparent 65%)", filter: "blur(130px)" }} />
        </div>

        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 sm:px-10 py-32 lg:py-40 text-center">
          {/* Live-hiring pill */}
          <div className={`mb-7 tr ${heroReady ? "o1 ty0" : "o0 ty1"}`}>
            <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <span className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-[#f97316]/40 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-[#f97316]" style={{ boxShadow: "0 0 10px rgba(249,115,22,0.9)" }} />
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-white/70">
                Now hiring · {FALLBACK_STATS.openPositions} open roles
              </span>
            </span>
          </div>

          {/* Display headline */}
          <h1 className="font-display mb-6">
            <span className={`block text-[clamp(2.8rem,7.5vw,5.5rem)] font-bold tracking-[-0.04em] leading-[0.98] tr ${heroReady ? "o1 ty0" : "o0 ty2"}`}
              style={{
                transitionDelay: "150ms",
                background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,195,0.85) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Work with
            </span>
            <span className={`block text-[clamp(2.8rem,7.5vw,5.5rem)] font-bold tracking-[-0.04em] leading-[0.98] tr lx-text-orange ${heroReady ? "o1 ty0" : "o0 ty2"}`}
              style={{ transitionDelay: "300ms", filter: "drop-shadow(0 0 60px rgba(249, 115, 22, 0.43))" }}>
              the best team.
            </span>
          </h1>

          <p className={`text-[15px] sm:text-[17px] text-white/55 leading-[1.65] max-w-[540px] mx-auto mb-10 tr ${heroReady ? "o1 ty0" : "o0 ty1"}`}
            style={{ transitionDelay: "500ms" }}>
            Fully remote. Flexible hours. Uncapped commission. Build the products people actually pay for.
          </p>

          {/* CTAs */}
          <div className={`flex items-center justify-center gap-3 flex-wrap mb-20 tr ${heroReady ? "o1 ty0" : "o0 ty2"}`} style={{ transitionDelay: "650ms" }}>
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="lx-primary px-8 py-4 rounded-xl text-[14px] font-bold text-white inline-flex items-center gap-2 cursor-pointer group">
              Apply now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
              className="lx-ghost px-8 py-4 rounded-xl text-[14px] font-semibold cursor-pointer">
              See open roles
            </button>
          </div>

          {/* Stats — minimal inline row */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 pt-12 border-t border-white/[0.05] tr ${heroReady ? "o1 ty0" : "o0 ty2"}`}
            style={{ transitionDelay: "850ms" }}>
            {[
              { v: FALLBACK_STATS.teamMembers, suffix: "+", label: "Team members" },
              { v: FALLBACK_STATS.happyClients, suffix: "+", label: "Happy clients" },
              { v: FALLBACK_STATS.satisfactionPercent, suffix: "%", label: "Satisfaction", accent: true },
              { display: "24/7", label: "Support" },
            ].map((s, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="font-display text-[38px] sm:text-[44px] font-black tracking-[-0.045em] leading-none">
                  {s.display ? (
                    <span style={{
                      background: "linear-gradient(180deg, #fff 0%, rgba(180,180,195,0.8) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>{s.display}</span>
                  ) : (
                    <>
                      <span style={{
                        background: "linear-gradient(180deg, #fff 0%, rgba(180,180,195,0.8) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>
                        <HeroCounter value={s.v!} />
                      </span>
                      <span style={{
                        background: "linear-gradient(180deg, #ffb366, #f97316 60%, #c2410c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>{s.suffix}</span>
                    </>
                  )}
                </div>
                <p className="mt-2.5 text-[10px] text-white/40 uppercase tracking-[0.22em] font-semibold">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Hero scroll indicator — subtle chevron + "see roles" hint */}
          <div className={`mt-20 flex flex-col items-center gap-2 tr ${heroReady ? "o1 ty0" : "o0 ty2"}`} style={{ transitionDelay: "1100ms" }}>
            <span className="text-[9.5px] font-bold uppercase tracking-[0.38em] text-white/25">See roles</span>
            <button
              onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
              aria-label="Scroll to open roles"
              className="group w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.06] transition-all cursor-pointer"
              style={{ animation: "heroBounce 2.4s ease-in-out infinite" }}
            >
              <ChevronDown className="h-4 w-4 text-white/40 group-hover:text-[#f97316] transition-colors" />
            </button>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          2 · POSITIONS
          ═══════════════════════════════════════════════════════════ */}

      <section id="positions" className="relative z-10 px-6 sm:px-10 lg:px-16 py-32">
        <div className="max-w-[1280px] mx-auto">
          <Hdr number="01" tag="Open Roles" title={<>Pick your <span className="lx-text-orange">role.</span></>} sub="8 positions across engineering, support, growth and leadership. Fully remote." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {POSITIONS.slice(0, 7).map((pos, i) => (
              <R key={pos.id} d={i * 40} className={pos.id === "content" ? "lg:col-span-2" : ""}>
                <button
                  onClick={() => goToForm(pos.id)}
                  className="spotlight-card group relative w-full h-full text-left rounded-2xl border border-white/[0.06] bg-white/[0.012] p-6 overflow-hidden transition-all duration-400 hover:border-[#f97316]/25 hover:bg-white/[0.025] hover:-translate-y-[2px]"
                >
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {pos.popular && (
                    <span
                      className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-[#f97316] bg-[#f97316]/[0.10] border border-[#f97316]/25"
                      style={{ animation: "hotPulse 2.4s ease-in-out infinite" }}
                    >
                      <span className="w-1 h-1 rounded-full bg-[#f97316] lx-pulse" />
                      Hot
                    </span>
                  )}

                  <div className="relative z-[2]">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="relative inline-flex items-center justify-center w-11 h-11 rounded-full transition-all duration-400 text-white/55 group-hover:text-[#f97316]"
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
                        }}
                      >
                        <pos.icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="font-display text-[17px] font-bold text-white tracking-[-0.02em] leading-tight">
                          {pos.title}
                        </h3>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 mt-0.5">
                          {pos.slots} · {pos.salary}
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] text-white/55 leading-[1.7] mb-4">{pos.description}</p>
                    <div className="space-y-2 mb-4">
                      {pos.requirements.slice(0, 3).map((r, j) => (
                        <div key={j} className="flex items-start gap-2 text-[12px] text-white/55">
                          <Check className="h-3 w-3 mt-1 shrink-0 text-[#f97316]/70" strokeWidth={3} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#f97316]/80 group-hover:text-[#fbbf24] transition-colors">
                      Apply <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              </R>
            ))}
          </div>

          {/* Investor — full width premium card (kept for both variants) */}
          {(() => { const pos = POSITIONS[7]; return (
            <R d={500}>
              <div
                onClick={() => goToForm(pos.id)}
                className="spotlight-card group mt-4 relative cursor-pointer overflow-hidden rounded-2xl border border-[#f97316]/25 bg-gradient-to-br from-[#f97316]/[0.06] via-white/[0.012] to-transparent transition-all duration-400 hover:-translate-y-[2px] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7),0_0_70px_-25px_rgba(249,115,22,0.4)]"
              >
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" />
                <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 65%)", filter: "blur(40px)" }} />

                <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 p-8 sm:p-10 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                      <span
                        className="relative inline-flex items-center justify-center w-12 h-12 rounded-full text-[#f97316]"
                        style={{
                          background: "rgba(249,115,22,0.10)",
                          boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.35), 0 0 24px -6px rgba(249,115,22,0.45)",
                        }}
                      >
                        <pos.icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-display text-[22px] font-bold text-white tracking-[-0.02em]">{pos.title}</h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-[#f97316] bg-[#f97316]/[0.10] border border-[#f97316]/25">
                            Open to all
                          </span>
                        </div>
                        <span className="text-[11.5px] text-[#f97316]/85 font-semibold mt-0.5">{pos.salary} · No minimum</span>
                      </div>
                    </div>
                    <p className="text-[14.5px] text-white/60 leading-relaxed max-w-lg">{pos.description}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {pos.perks.map((p, j) => (
                      <div key={j} className="flex items-center gap-2 text-[13px] text-white/65">
                        <Check className="h-3.5 w-3.5 text-[#f97316]" strokeWidth={3} />
                        {p}
                      </div>
                    ))}
                    <button
                      className="lx-primary mt-2 w-full py-3.5 rounded-xl font-bold text-[13px] text-white inline-flex items-center justify-center gap-2 cursor-pointer group/cta"
                    >
                      Become investor <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </R>
          ); })()}
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          2.5 · TIMELINE (Apply → Reply → Interview → Onboard)
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-28">
        <div className="max-w-[1100px] mx-auto">
          <Hdr number="02" tag="The Path" title={<>From click to <span className="lx-text-orange">offer.</span></>} sub="Four steps, no ghosting, no cover letters. Here's what happens after you hit submit." />

          <PathTimeline />

          {/* Below timeline — key SLAs as pills */}
          <R d={400}>
            <div className="flex flex-wrap justify-center gap-2 mt-10">
              {[
                { label: "No ghosting · ever" },
                { label: "Under 48h reply SLA" },
                { label: "Same-week onboarding" },
                { label: "Zero take-home tests" },
              ].map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.025] text-[11px] font-semibold text-white/65">
                  <Check className="h-3 w-3 text-[#f97316]" strokeWidth={3} />
                  {p.label}
                </span>
              ))}
            </div>
          </R>
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          3 · WHY LETHAL (bento grid)
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-32">
        <div className="max-w-[1100px] mx-auto">
          <Hdr number="03" tag="Why Us" title={<>Why Choose <span className="lx-text-orange">Lethal.</span></>} sub="Not a corporation. A small team that builds fast, pays well, and respects your time." />

          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
            {WHY_FEATURES.map((f, i) => (
              <R key={i} d={i * 40}>
                <div className="group relative flex items-start gap-5 py-7 px-4 -mx-4 rounded-xl border-b border-white/[0.04] last:border-b-0 transition-[background-color] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#f97316]/[0.025]">
                  {/* Ambient orange glow — fades in from the left on hover */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      background: "radial-gradient(ellipse 55% 100% at 0% 50%, rgba(249,115,22,0.08), transparent 70%)",
                    }}
                  />
                  {/* Left vertical orange bar — grows on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-hover:h-[70%] bg-gradient-to-b from-[#fbbf24] via-[#f97316] to-transparent rounded-full transition-[height] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ boxShadow: "0 0 14px rgba(249,115,22,0.6)" }}
                  />

                  {/* Number — outline by default, fills with orange gradient on hover. Parent is
                      inline-block so absolute children stack instead of laying out side-by-side. */}
                  <span
                    className="relative inline-block shrink-0 w-14 h-[42px] font-display text-[42px] font-black leading-none tabular-nums tracking-[-0.05em]"
                    aria-label={String(i + 1).padStart(2, "0")}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        background: "linear-gradient(180deg, #ffd591, #f97316 55%, #c2410c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 0 16px rgba(249,115,22,0.5))",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>

                  <div className="relative flex-1 pt-1">
                    <div className="flex items-center gap-2.5 mb-2">
                      <f.icon className="h-4 w-4 text-[#f97316]/70 group-hover:text-[#f97316] group-hover:scale-110 transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
                      <h4 className="font-display text-[18px] font-bold tracking-[-0.02em] text-white/90 group-hover:text-white transition-colors duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                        {f.title}
                      </h4>
                    </div>
                    <p className="text-[13.5px] text-white/50 leading-[1.7] group-hover:text-white/70 transition-colors duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]">{f.desc}</p>
                  </div>
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

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-32">
        <div className="max-w-[1100px] mx-auto">
          <Hdr number="04" tag="Compare" title={<>Lethal <span className="lx-text-fade">vs</span> <span className="lx-text-orange">Big Tech.</span></>} sub="What you actually get here vs what you'd get at FAANG. Same talent pool. Different game." />

          {(() => {
            // Comparison data — Lethal vs the giants. Cells are short answers.
            const cols: Array<{ key: string; name: string; mark: string; accent?: boolean }> = [
              { key: "lethal", name: "Lethal",    mark: "L", accent: true },
              { key: "apple",  name: "Apple",     mark: "" },
              { key: "google", name: "Google",    mark: "G" },
              { key: "ms",     name: "Microsoft", mark: "M" },
              { key: "meta",   name: "Meta",      mark: "M" },
            ]
            // All big-tech values below are defensible against public 2023-24
            // reporting. We don't claim giants are bad — we just show where
            // Lethal has structural edge for the right person.
            const rows: Array<{ feat: string; icon: typeof Globe; vals: Record<string, string>; note: string }> = [
              { feat: "Remote policy",       icon: Globe,      vals: { lethal: "100% anywhere",   apple: "3d office",        google: "3d hybrid",       ms: "Flex hybrid",        meta: "3d hybrid" },
                note: "Apple enforced 3-day RTO since 2022 with badge tracking. Google, Meta tracked office swipes starting 2023. Lethal team: 7 countries, zero office." },
              { feat: "Ship cycle",          icon: Zap,        vals: { lethal: "Hours → days",    apple: "Quarters",         google: "Months",          ms: "Months",             meta: "Sprints (weeks)" },
                note: "Big-tech release windows take weeks to months of approvals. At Lethal, a feature idea in Discord at 2pm can ship by dinner. Real." },
              { feat: "Onboarding ramp",     icon: Rocket,     vals: { lethal: "Day 1 impact",    apple: "3-6 months",       google: "3-6 months",      ms: "3-6 months",         meta: "3-6 months" },
                note: "FAANG ramps average 3-6 months before you touch prod (Blind, Levels.fyi). Small teams skip this — your first PR ships week one." },
              { feat: "Approval layers",     icon: Shield,     vals: { lethal: "None",            apple: "Multi-VP",         google: "Committees",      ms: "VP review",          meta: "Review cycles" },
                note: "Giants have review committees for design, security, legal, branding. We have one Discord channel and 'yes or no'." },
              { feat: "Upside model",        icon: TrendingUp, vals: { lethal: "Direct % + comm", apple: "RSUs · 4y vest",   google: "RSUs · 4y vest",  ms: "RSUs · 4y vest",     meta: "RSUs · 4y vest" },
                note: "RSUs are real money but locked 4 years with cliff. Commission here pays monthly. Top performers out-earn junior L5s." },
              { feat: "Side projects",       icon: Sparkles,   vals: { lethal: "Encouraged",      apple: "IP concerns",      google: "Must disclose",   ms: "Must disclose",      meta: "Must disclose" },
                note: "Big-tech IP policies capture anything built on company hardware/time. We encourage side income — you own what you build." },
              { feat: "Hours flexibility",   icon: Clock,      vals: { lethal: "Set your own",    apple: "Core hours",       google: "Team-aligned",    ms: "Flexible",           meta: "Team-aligned" },
                note: "Microsoft does have genuinely flexible hours (credit where due). But all FAANG still force team-aligned standups + OKR reviews." },
              { feat: "Layoffs (2022-24)",   icon: Heart,      vals: { lethal: "Self-funded",     apple: "Targeted cuts",    google: "~12k laid off",   ms: "~10k laid off",      meta: "~21k laid off" },
                note: "Meta: 21k across 2022-23 (11k + 10k). Google: 12k in Jan 2023. Microsoft: 10k in Jan 2023 + more in 2024. Lethal: no layoffs — we never raised a VC round." },
            ]

            const isPositive = (v: string) => /100%|anywhere|Hours|Day 1|None|Direct|Encouraged|Set your own|Self-funded/i.test(v)

            return (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.012] backdrop-blur-md">
                  {/* Header row */}
                  <div className="grid grid-cols-[1.4fr_repeat(5,1fr)] border-b border-white/[0.06]">
                    <div className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                      Feature
                    </div>
                    {cols.map((c) => (
                      <div
                        key={c.key}
                        className={`relative px-3 py-5 text-center ${c.accent ? "bg-gradient-to-b from-[#f97316]/[0.10] to-transparent" : ""}`}
                      >
                        {c.accent && (
                          <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" />
                        )}
                        <span className={`text-[12.5px] font-bold uppercase tracking-[0.18em] ${c.accent ? "text-[#f97316]" : "text-white/55"}`}>
                          {c.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {rows.map((row, i) => (
                    <CompareRow key={i} row={row} index={i} cols={cols} isPositive={isPositive} />
                  ))}
                </div>

                {/* Mobile — stacked cards */}
                <div className="md:hidden space-y-4">
                  {cols.map((c) => (
                    <div
                      key={c.key}
                      className={`rounded-2xl border p-5 ${
                        c.accent
                          ? "border-[#f97316]/35 bg-gradient-to-b from-[#f97316]/[0.08] to-transparent shadow-[0_20px_50px_-20px_rgba(249,115,22,0.4)]"
                          : "border-white/[0.06] bg-white/[0.015]"
                      }`}
                    >
                      <div className={`text-[12px] font-bold uppercase tracking-[0.22em] mb-4 ${c.accent ? "text-[#f97316]" : "text-white/55"}`}>
                        {c.name}
                      </div>
                      <div className="space-y-2.5">
                        {rows.map((row, i) => (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <span className="text-[12px] text-white/55 font-medium">{row.feat}</span>
                            <span className={`text-[12px] font-semibold ${c.accent ? "text-[#f97316]" : isPositive(row.vals[c.key]) ? "text-emerald-400/80" : "text-white/40"}`}>
                              {row.vals[c.key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footnote */}
                <R d={400}>
                  <p className="text-center text-[11px] text-white/30 mt-8 italic max-w-[560px] mx-auto leading-relaxed">
                    Big tech data sourced from public 2022-24 reports, SEC filings, return-to-office
                    policies, and employee reviews (Blind, Glassdoor, Levels.fyi). Not a dig — just
                    a structural comparison.
                  </p>
                </R>
              </>
            )
          })()}
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          5 · TEAM QUOTES
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-32">
        <div className="max-w-[1100px] mx-auto">
          <Hdr number="05" tag="Team" title={<>From the people <span className="lx-text-orange">inside.</span></>} sub="No marketing fluff — unedited quotes from the team." />

          {/* Desktop: 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TEAM_QUOTES.map((q, i) => (
              <R key={i} d={i * 80}>
                <div
                  className="group relative rounded-2xl p-8 sm:p-9 overflow-hidden transition-all duration-400 h-full"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 24px 60px -20px rgba(0,0,0,0.55)",
                  }}
                >
                  <div
                    className="absolute -top-24 -right-24 w-60 h-60 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 65%)",
                      filter: "blur(32px)",
                    }}
                  />
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#f97316]/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Large open-quote glyph */}
                  <div
                    aria-hidden="true"
                    className="absolute top-5 right-7 font-display font-black leading-none select-none pointer-events-none"
                    style={{ fontSize: "72px", color: "rgba(249,115,22,0.08)" }}
                  >
                    &ldquo;
                  </div>

                  {/* 5-star */}
                  <div className="relative flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 lx-star" style={{ animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="relative text-[15.5px] text-white/75 leading-[1.8] mb-8 font-medium">
                    {q.text}
                  </p>

                  {/* Author */}
                  <div className="relative flex items-center gap-3.5 pt-6 border-t border-white/[0.06]">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-[3px] rounded-full bg-[#f97316]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div
                        className="relative w-11 h-11 rounded-full overflow-hidden"
                        style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 6px 16px rgba(0,0,0,0.5)" }}
                      >
                        <img src={q.img} alt={q.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
                        <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400/45 animate-ping" />
                        <span className="relative w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-white leading-tight">{q.name}</p>
                      <p className="text-[11px] text-white/45 mt-0.5">
                        <span className="text-[#f97316]/85 font-semibold">{q.role}</span>
                        <span className="text-white/20 mx-1.5">·</span>
                        {q.time}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-[#f97316] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
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
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(249, 115, 22, 0.04), transparent)" }} />

        <div className="max-w-[700px] mx-auto relative">
          <Hdr number="06" tag="Apply" title={<>Apply <span className="lx-text-orange">Now</span></>} sub="Takes 2 minutes. We respond within 48 hours. No resume needed." />

          {/* Step counter — clear "Step X of 3" on all viewports */}
          <R d={120}>
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#f97316]/20 bg-[#f97316]/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f97316]/80">
                  Step {formStep + 1} of 3
                </span>
                <span className="text-[10px] text-white/30">·</span>
                <span className="text-[10px] text-white/45">
                  {["About You", "Schedule", "Experience"][formStep]}
                </span>
              </div>
            </div>
          </R>

          {/* Step tabs — premium pill switcher */}
          <R d={150}>
            <div className="flex items-center justify-center gap-1 p-1 rounded-2xl bg-white/[0.025] border border-white/[0.06] mb-10 max-w-md mx-auto">
              {[
                { label: "About You", short: "You", icon: Users, valid: v0 },
                { label: "Schedule", short: "Time", icon: Clock, valid: v1 },
                { label: "Experience", short: "Exp", icon: Star, valid: v2 },
              ].map((step, i) => {
                const act = formStep === i
                return (
                  <button key={i} onClick={() => setFormStep(i)}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 cursor-pointer ${
                      act ? "bg-gradient-to-br from-[#f97316]/15 to-[#f97316]/5 text-white border border-[#f97316]/25 shadow-[0_6px_20px_rgba(249, 115, 22, 0.22)]"
                      : step.valid ? "text-emerald-400/70 hover:bg-white/[0.025] border border-transparent"
                      : "text-white/30 hover:bg-white/[0.025] hover:text-white/50 border border-transparent"
                    }`}>
                    {step.valid && !act ? <Check className="h-3.5 w-3.5 text-emerald-400/70" strokeWidth={3} /> : <step.icon className="h-3.5 w-3.5" />}
                    <span className="sm:hidden">{step.short}</span>
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
            {/* Form card — refined premium glass (matches FAQ / product card language) */}
            <div
              className="relative rounded-[24px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.008) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow:
                  "0 50px 120px -40px rgba(0,0,0,0.85), 0 0 80px -30px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Top hairline + halo */}
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent z-[1]" />
              <div className="absolute top-0 left-1/3 right-1/3 h-[6px] bg-gradient-to-b from-[#f97316]/22 to-transparent blur-md pointer-events-none z-[1]" />

              {/* Role accent rail — appears on the left edge once a role is selected */}
              <div
                aria-hidden="true"
                className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] z-[2]"
                style={{
                  background: "linear-gradient(180deg, #fbbf24, #f97316 45%, #c2410c)",
                  boxShadow: sel ? "0 0 16px rgba(249,115,22,0.55)" : "none",
                  transform: sel ? "scaleY(1)" : "scaleY(0)",
                  transformOrigin: "top",
                  opacity: sel ? 1 : 0,
                }}
              />

              {/* Ambient corner glow */}
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(249,115,22,0.14), transparent 65%)",
                  filter: "blur(40px)",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(249,115,22,0.07), transparent 65%)",
                  filter: "blur(50px)",
                }}
              />

              <div className="relative z-[2]">

              {/* Selected position header */}
              {sel && <>
                <div className="px-7 py-5 border-b border-white/[0.05] bg-[#f97316]/[0.025]">
                  <div className="flex items-center gap-4">
                    <span
                      className="relative inline-flex items-center justify-center w-11 h-11 rounded-full text-[#f97316] shrink-0"
                      style={{
                        background: "rgba(249,115,22,0.10)",
                        boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.35), 0 0 20px -6px rgba(249,115,22,0.45)",
                      }}
                    >
                      <sel.icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-[#f97316]/85 mb-1">Selected role</p>
                      <p className="font-display text-[16px] font-bold text-white tracking-[-0.015em] leading-tight">{sel.title}</p>
                      <p className="text-[11.5px] text-white/45 mt-0.5">{sel.slots} · Remote · {sel.salary}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20">
                      <span className="relative flex items-center justify-center">
                        <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-ping" />
                        <span className="relative w-1 h-1 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-[10px] text-emerald-400/85 font-bold uppercase tracking-[0.18em]">Hiring</span>
                    </div>
                  </div>
                </div>
              </>}

              <div className="p-6 sm:p-8">

                {/* ── STEP 0: About You ── */}
                {formStep === 0 && <div className="space-y-0 lx-step">

                  {/* Role picker — clean chip grid */}
                  <div className="lx-field">
                    <div className="lx-field-header">
                      <Sparkles className="h-4 w-4" />
                      <div>
                        <p className="lx-field-title">Choose your role</p>
                        <p className="lx-field-sub">What position are you applying for?</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {POSITIONS.map(p => {
                        const a = position === p.id
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPosition(p.id)}
                            className={`group relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all duration-300 cursor-pointer ${
                              a
                                ? "bg-[#f97316]/[0.09] border border-[#f97316]/40"
                                : "bg-white/[0.012] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.02]"
                            }`}
                          >
                            <span
                              className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${
                                a ? "text-[#f97316]" : "text-white/50 group-hover:text-[#f97316]/80"
                              }`}
                              style={{
                                background: a ? "rgba(249,115,22,0.10)" : "rgba(255,255,255,0.025)",
                                boxShadow: a
                                  ? "inset 0 0 0 1px rgba(249,115,22,0.35), 0 0 16px -6px rgba(249,115,22,0.45)"
                                  : "inset 0 0 0 1px rgba(255,255,255,0.07)",
                              }}
                            >
                              <p.icon className="h-[14px] w-[14px]" strokeWidth={1.9} />
                            </span>
                            <span className={`text-[12px] font-semibold truncate ${a ? "text-white" : "text-white/65 group-hover:text-white/85"}`}>
                              {p.title}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {position && (() => {
                      const b = ROLE_BENEFITS[position]
                      if (!b) return null
                      return (
                        <div className="mt-4 px-4 py-3.5 rounded-xl border border-[#f97316]/15 bg-[#f97316]/[0.04]">
                          <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#f97316]/80 mb-2.5">Perks</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {b.map((x, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <Check className="h-3 w-3 shrink-0 text-[#f97316]/70" strokeWidth={2.8} />
                                <span className="text-[11.5px] text-white/65">{x}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Discord */}
                  <div className="lx-field">
                    <div className="lx-field-header">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 -28.5 256 256" fill="rgba(255,255,255,0.15)"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fillRule="nonzero"/></svg>
                      <div><p className="lx-field-title">Discord</p><p className="lx-field-sub">We&apos;ll contact you here</p></div>
                      {discord.length >= 2 && <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check className="h-3 w-3 text-emerald-400/60" /></div>}
                    </div>
                    <input type="text" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="your_username" className="lx-input" />
                  </div>

                  {/* Age + Timezone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="lx-field">
                      <div className="lx-field-header"><Users className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Age</p><p className="lx-field-sub">Must be 16+</p></div></div>
                      <div className="flex items-center gap-3 p-2 rounded-xl border border-white/[0.06] bg-white/[0.015]">
                        <button type="button" onClick={() => setAge(Math.max(16, age - 1))} className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all cursor-pointer active:scale-90"><Minus className="h-4 w-4" /></button>
                        <span className="flex-1 text-center text-2xl font-bold tabular-nums text-white/80">{age}</span>
                        <button type="button" onClick={() => setAge(Math.min(50, age + 1))} className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all cursor-pointer active:scale-90"><Plus className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="lx-field">
                      <div className="lx-field-header"><Globe className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Timezone</p><p className="lx-field-sub">Where are you based?</p></div></div>
                      <div
                        className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto lx-scrollbar pr-1"
                        style={{ overscrollBehavior: "contain" }}
                        onWheel={(e) => e.stopPropagation()}
                      >
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
                    className="w-full lx-primary py-4 rounded-xl text-[13px] font-bold uppercase tracking-[0.14em] text-white flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer group">
                    Continue to Schedule <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>}

                {/* ── STEP 1: Schedule ── */}
                {formStep === 1 && <div className="space-y-0 lx-step">

                  <div className="lx-field">
                    <div className="lx-field-header"><Clock className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Hours per week</p><p className="lx-field-sub">How much time can you commit?</p></div></div>
                    <div className="grid grid-cols-5 gap-2">
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
                            style={active ? { boxShadow: "0 0 15px rgba(249, 115, 22, 0.09)" } : {}}>
                            <p className={`text-[13px] font-bold ${active ? "text-[#f97316]" : "text-white/30"}`}>{h.v}</p>
                            <p className={`text-[9px] mt-0.5 ${active ? "text-[#f97316]/50" : "text-white/10"}`}>{h.label}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="lx-field">
                    <div className="lx-field-header"><Star className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Available days</p><p className="lx-field-sub">Select all that apply</p></div></div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {DAYS.map(d => {
                        const active = selectedDays.includes(d)
                        const isWeekend = d === "Sat" || d === "Sun"
                        return (
                          <button key={d} type="button" onClick={() => toggleDay(d)}
                            className={`py-4 rounded-xl text-center transition-all duration-300 cursor-pointer ${active ? "border-2 border-[#f97316]/30 bg-[#f97316]/10" : "border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]"}`}
                            style={active ? { boxShadow: "0 0 12px rgba(249, 115, 22, 0.07)" } : {}}>
                            <p className={`text-[12px] font-bold ${active ? "text-[#f97316]" : isWeekend ? "text-white/15" : "text-white/30"}`}>{d}</p>
                          </button>
                        )
                      })}
                    </div>
                    {selectedDays.length > 0 && <p className="text-[10px] text-white/15 mt-2">{selectedDays.length} day{selectedDays.length > 1 ? "s" : ""} selected</p>}
                  </div>

                  <div className="lx-field">
                    <div className="lx-field-header"><Coffee className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Preferred time</p><p className="lx-field-sub">When do you work best?</p></div></div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                    <button onClick={() => setFormStep(0)} className="lx-ghost flex-1 py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.14em] cursor-pointer">Back</button>
                    <button onClick={() => v1 && setFormStep(2)} disabled={!v1}
                      className="flex-[2] lx-primary py-4 rounded-xl text-[13px] font-bold uppercase tracking-[0.14em] text-white flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer group">
                      Continue to Experience <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>}

                {/* ── STEP 2: Experience ── */}
                {formStep === 2 && <div className="space-y-0 lx-step">

                  <div className="lx-field">
                    <div className="lx-field-header"><Code2 className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Your experience</p><p className="lx-field-sub">Skills, past projects, relevant background</p></div></div>
                    <textarea value={experience} onChange={e => setExperience(e.target.value)} placeholder="Tell us what you've done and what you're good at..." rows={5} className="lx-textarea"
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
                    <textarea value={whyLethal} onChange={e => setWhyLethal(e.target.value)} placeholder="What draws you to this role and our team?" rows={4} className="lx-textarea"
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
                    <input type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://your-portfolio.com" className="lx-input" />
                  </div>

                  {/* Agreements */}
                  <div className="lx-field">
                    <div className="lx-field-header"><Shield className="h-4 w-4 text-white/15" /><div><p className="lx-field-title">Agreements</p><p className="lx-field-sub">Please confirm all three</p></div></div>
                    <div className="space-y-3">
                      {[{c:agree16,s:setAgree16,l:"I confirm I'm at least 16 years old"},{c:agreeActive,s:setAgreeActive,l:"I agree to be active and maintain professionalism"},{c:agreeUnpaid,s:setAgreeUnpaid,l:"I understand this may be initially unpaid / commission-based"}].map((it, i) => (
                        <label key={i} className={`flex items-start gap-3 cursor-pointer group p-3.5 rounded-xl border transition-all duration-300 ${it.c ? "border-[#f97316]/25 bg-[#f97316]/[0.04]" : "border-white/[0.05] hover:border-white/[0.10] bg-white/[0.015] hover:bg-white/[0.025]"}`} onClick={() => it.s(!it.c)}>
                          <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${it.c ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] border-[#f97316] shadow-[0_0_12px_rgba(249, 115, 22, 0.72)]" : "border-white/[0.12] group-hover:border-white/[0.25]"}`}>
                            {it.c && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                          </div>
                          <span className={`text-[13px] leading-[1.55] transition-colors ${it.c ? "text-white/80" : "text-white/35 group-hover:text-white/55"}`}>{it.l}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setFormStep(1)} className="lx-ghost flex-1 py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.14em] cursor-pointer">Back</button>
                    <button onClick={doSubmit} disabled={!v2 || submitting || sentPulse}
                      className={`relative flex-[2] py-4 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2.5 disabled:cursor-not-allowed cursor-pointer group overflow-hidden uppercase tracking-[0.14em] transition-all duration-300 ${sentPulse ? "" : "lx-primary lx-breathe disabled:opacity-30"}`}
                      style={sentPulse ? {
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        boxShadow: "0 0 35px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
                      } : undefined}
                    >
                      {submitting ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white/25 border-t-white rounded-full" />
                      ) : sentPulse ? (
                        <><CheckCircle2 className="h-4 w-4" /> Sent</>
                      ) : (
                        <><Send className="h-4 w-4" /> Submit Application <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                      {/* Sheen sweep */}
                      <span className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)", transform: "translateX(-100%)", animation: "sheenSweep 1.2s ease-out" }} />
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

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-32">
        <div className="max-w-[820px] mx-auto">
          <Hdr number="07" tag="FAQ" title={<>Common <span className="lx-text-orange">Questions</span></>} sub="Everything worth knowing before you apply." />

          <div className="space-y-3">
            {(showAllFaq ? FAQ : FAQ.slice(0, 4)).map((f, i) => {
              const isOpen = openFaq === i
              return (
                <R key={i} d={i * 50}>
                  <div
                    className={`spotlight-card group relative rounded-2xl border overflow-hidden transition-all duration-400 ${
                      isOpen
                        ? "border-[#f97316]/35 bg-white/[0.025] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7),0_0_60px_-25px_rgba(249,115,22,0.35)]"
                        : "border-white/[0.06] bg-white/[0.015] hover:border-[#f97316]/22 hover:bg-white/[0.025] hover:-translate-y-[1px]"
                    }`}
                  >
                    {isOpen && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/80 to-transparent z-[1]" />
                        <div className="absolute top-0 left-1/4 right-1/4 h-[6px] bg-gradient-to-b from-[#f97316]/35 to-transparent blur-md pointer-events-none z-[1]" />
                      </>
                    )}
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="relative z-[2] flex items-center gap-5 w-full px-6 py-5 text-left cursor-pointer"
                    >
                      <span
                        className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-400 ${
                          isOpen ? "text-[#f97316]" : "text-white/55 group-hover:text-[#f97316]/85"
                        }`}
                        style={{
                          background: isOpen ? "rgba(249,115,22,0.10)" : "rgba(255,255,255,0.03)",
                          boxShadow: isOpen
                            ? "inset 0 0 0 1px rgba(249,115,22,0.35), 0 0 24px -6px rgba(249,115,22,0.45)"
                            : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                        }}
                      >
                        <f.Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className={`block text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors ${
                            isOpen ? "text-[#f97316]/85" : "text-white/35 group-hover:text-white/45"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")} &middot; {f.tag}
                        </span>
                        <span
                          className={`block mt-1.5 font-display text-[16px] sm:text-[17px] font-semibold tracking-[-0.012em] leading-[1.25] transition-colors ${
                            isOpen ? "text-white" : "text-white/80 group-hover:text-white"
                          }`}
                        >
                          {f.q}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-400 ${
                          isOpen ? "bg-[#f97316]/[0.14] text-[#f97316] rotate-180" : "bg-white/[0.03] text-white/50 group-hover:text-[#f97316]/80"
                        }`}
                        style={{
                          boxShadow: isOpen ? "inset 0 0 0 1px rgba(249,115,22,0.30)" : "inset 0 0 0 1px rgba(255,255,255,0.07)",
                        }}
                      >
                        <ChevronDown className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </button>
                    <div
                      className="grid relative z-[2] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="pl-[4.75rem] pr-6 pb-6">
                          <div className="relative pl-5">
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-[#f97316]/70 via-[#f97316]/20 to-transparent" />
                            <p className="text-[14.5px] text-white/70 leading-[1.85]">{f.a}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </R>
              )
            })}
          </div>

          {/* Show all / show less toggle */}
          {FAQ.length > 4 && (
            <R d={200}>
              <div className="flex justify-center mt-8">
                <button onClick={() => { setShowAllFaq(v => !v); if (showAllFaq) setOpenFaq(null) }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:border-[#f97316]/30 hover:bg-[#f97316]/[0.05] transition-all duration-300 cursor-pointer group">
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55 group-hover:text-[#f97316] transition-colors">
                    {showAllFaq ? "Show less" : `Show all ${FAQ.length}`}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-white/35 group-hover:text-[#f97316] transition-all duration-300 ${showAllFaq ? "rotate-180" : ""}`} />
                </button>
              </div>
            </R>
          )}

          {/* FAQ stats — completeness indicator */}
          <R d={450}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/35 font-semibold uppercase tracking-[0.22em]">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-[#f97316]" strokeWidth={3} />
                {FAQ.length} questions · answered
              </span>
              <span className="w-px h-3 bg-white/[0.12]" />
              <span>~30 sec read</span>
              <span className="w-px h-3 bg-white/[0.12]" />
              <span>Updated weekly</span>
            </div>
          </R>

          {/* Discord helper */}
          <R d={550}>
            <div className="mt-8 flex items-center justify-center gap-3 text-[13px]">
              <span className="text-white/40">Didn&apos;t find your answer?</span>
              <Link
                href="https://discord.gg/lethal"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-[#f97316] font-semibold hover:text-[#fbbf24] transition-colors"
              >
                Ask on Discord
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </R>
        </div>
      </section>

      <Divider />


      {/* ═══════════════════════════════════════════════════════════
          8 · FINAL CTA
          ═══════════════════════════════════════════════════════════ */}

      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-40 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-80"
            style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.14), transparent 62%)", filter: "blur(130px)" }} />
        </div>

        <div className="relative max-w-[820px] mx-auto text-center">
          <R>
            <SectionEyebrow number="08" label="Apply" />
          </R>
          <R d={80}>
            <h2 className="font-display mb-6 mt-3">
              <span
                className="block text-[clamp(2.6rem,6.5vw,4.8rem)] font-bold tracking-[-0.045em] leading-[1]"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,195,0.85) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  paddingBottom: "0.14em",
                  marginBottom: "-0.14em",
                }}
              >
                Enough scrolling.
              </span>
              <span
                className="block text-[clamp(2.6rem,6.5vw,4.8rem)] font-bold tracking-[-0.045em] leading-[1] lx-text-orange"
                style={{
                  filter: "drop-shadow(0 0 60px rgba(249, 115, 22, 0.43))",
                  paddingBottom: "0.14em",
                }}
              >
                Start now.
              </span>
            </h2>
          </R>

          <R d={150}>
            <p className="text-white/50 text-[16px] sm:text-[17.5px] leading-relaxed max-w-[520px] mx-auto mb-12">
              Application takes 2 minutes. We DM within 48 hours. No resume, no cover letter — just show up.
            </p>
          </R>

          <R d={250}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="lx-primary relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl font-bold text-[15px] text-white overflow-hidden cursor-pointer group"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                <Send className="relative z-10 h-4 w-4" />
                <span className="relative z-10">Apply now</span>
                <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/"
                className="lx-ghost inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-[14px] cursor-pointer"
              >
                Back to home
              </Link>
            </div>
          </R>

          <R d={350}>
            <div className="mt-14 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-[11px] text-white/35 font-semibold uppercase tracking-[0.22em]">
              {[
                { Icon: Shield, text: "48h response" },
                { Icon: Heart,  text: "Zero toxicity" },
                { Icon: Zap,    text: "Day-one impact" },
                { Icon: Globe,  text: "Fully remote" },
              ].map(({ Icon, text }, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-[#f97316]/70" />
                  {text}
                </span>
              ))}
            </div>
          </R>
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
        .lx-a1 { width: 800px; height: 600px; top: -200px; right: -100px; background: radial-gradient(circle, rgba(249, 115, 22, 0.12), transparent 70%); animation: aDrift1 20s ease-in-out infinite; }
        .lx-a2 { width: 600px; height: 500px; bottom: -100px; left: -100px; background: radial-gradient(circle, rgba(234, 88, 12, 0.07), transparent 70%); animation: aDrift2 25s ease-in-out infinite; }
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
          filter: drop-shadow(0 0 30px rgba(249, 115, 22, 0.22));
        }

        /* Card */
        .lx-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; transition: all 0.3s ease; position: relative; overflow: hidden; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .lx-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(249, 115, 22, 0.43); transform: translateY(-4px); box-shadow: 0 24px 50px rgba(0,0,0,0.4), 0 0 40px rgba(249, 115, 22, 0.14); }

        /* Popular */
        .lx-popular { border-color: rgba(249, 115, 22, 0.14) !important; box-shadow: 0 0 50px rgba(249, 115, 22, 0.03); }
        .lx-popular:hover { border-color: rgba(249, 115, 22, 0.26) !important; box-shadow: 0 0 70px rgba(249, 115, 22, 0.06); }

        /* Shine sweep */
        .lx-shine { position: relative; overflow: hidden; }
        .lx-shine::after { content: ""; position: absolute; top: -50%; left: -80%; width: 50%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent); transform: rotate(25deg); transition: left 0.7s ease; pointer-events: none; z-index: 5; }
        .lx-shine:hover::after { left: 130%; }

        /* Terminal */
        .lx-terminal-wrap { position: relative; padding: 1px; border-radius: 16px; }
        .lx-rotating-border { position: absolute; inset: 0; border-radius: 16px; padding: 1px; background: conic-gradient(from var(--ba,0deg), transparent 40%, rgba(255,255,255,0.05) 50%, rgba(249, 115, 22, 0.14) 55%, rgba(255,255,255,0.03) 60%, transparent 70%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: bRot 6s linear infinite; }
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

        /* Subtitle hover shimmer — dead-text → live chrome on hover */
        .lx-sub-shimmer {
          display: inline-block;
          color: rgba(255,255,255,0.45);
          transition: filter 0.4s ease, color 0.4s ease;
          cursor: default;
          will-change: background;
        }
        .lx-sub-shimmer:hover {
          color: transparent;
          background: linear-gradient(
            105deg,
            rgba(255,255,255,0.6) 0%,
            rgba(255,255,255,0.95) 14%,
            rgba(249,115,22,0.75) 28%,
            rgba(255,255,255,0.95) 42%,
            rgba(200,200,215,0.55) 56%,
            rgba(255,255,255,0.9) 70%,
            rgba(249,115,22,0.75) 84%,
            rgba(255,255,255,0.7) 100%
          );
          background-size: 240% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: chromeShimmer 3.2s ease-in-out infinite;
          filter: drop-shadow(0 0 14px rgba(249,115,22,0.22));
        }
        .lx-underline { position: relative; display: inline-block; }
        .lx-underline::after { content: ""; position: absolute; left: 0; bottom: 4px; width: 100%; height: 3px; background: linear-gradient(90deg, rgba(249, 115, 22, 0.8), rgba(249, 115, 22, 0.22)); border-radius: 2px; box-shadow: 0 0 15px rgba(249, 115, 22, 0.29); }

        /* Pills */
        .lx-pill { display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.025); font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.65); transition: all 0.2s ease; backdrop-filter: blur(8px); }
        .lx-pill:hover { border-color: rgba(249, 115, 22, 0.43); color: #fff; background: rgba(249, 115, 22, 0.12); }

        /* Buttons */
        .lx-primary { background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 0 25px rgba(249, 115, 22, 0.32), 0 0 80px rgba(249, 115, 22, 0.07); transition: all 0.25s ease; }
        .lx-primary:hover { box-shadow: 0 0 35px rgba(249, 115, 22, 0.58), 0 0 100px rgba(249, 115, 22, 0.14); transform: translateY(-1px); filter: brightness(1.1); }
        .lx-primary:active { transform: translateY(0) scale(0.98); filter: brightness(1); }
        .lx-primary:disabled { box-shadow: none; filter: none; }

        .lx-ghost { border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.025); color: rgba(255,255,255,0.65); transition: all 0.2s ease; backdrop-filter: blur(8px); }
        .lx-ghost:hover { border-color: rgba(249, 115, 22, 0.58); background: rgba(249, 115, 22, 0.09); color: #fff; }
        .lx-ghost:active { transform: scale(0.97); }

        .lx-breathe { animation: lxBreath 3s ease-in-out infinite; }
        @keyframes lxBreath { 0%,100% { box-shadow: 0 0 25px rgba(249, 115, 22, 0.26), 0 0 80px rgba(249, 115, 22, 0.07); } 50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.46), 0 0 100px rgba(249, 115, 22, 0.14); } }

        /* Form — premium inputs */
        .lx-label { display: block; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 12px; letter-spacing: 0.18em; text-transform: uppercase; }
        .lx-input {
          width: 100%; height: 52px; padding: 0 18px; border-radius: 12px;
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
          font-size: 14px; color: white; transition: all 0.3s ease; outline: none;
        }
        .lx-input::placeholder { color: rgba(255,255,255,0.32); }
        .lx-input:hover {
          border-color: rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.035);
        }
        .lx-input:focus {
          border-color: rgba(249, 115, 22, 0.8);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.32), 0 0 28px rgba(249, 115, 22, 0.14);
        }
        .lx-textarea {
          width: 100%; padding: 16px 18px; border-radius: 12px;
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
          font-size: 14px; color: white; transition: all 0.3s ease; outline: none;
          resize: none; line-height: 1.7;
        }
        .lx-textarea::placeholder { color: rgba(255,255,255,0.32); }
        .lx-textarea:hover {
          border-color: rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.035);
        }
        .lx-textarea:focus {
          border-color: rgba(249, 115, 22, 0.8);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.32), 0 0 28px rgba(249, 115, 22, 0.14);
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

        /* Form fields — Apple-minimal divider list (no per-field glass card).
           Each field has a thin hairline separator below it; last field has none. */
        .lx-field {
          padding: 24px 0;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: transparent;
          border-radius: 0;
          transition: none;
          position: relative;
        }
        .lx-field:first-of-type { padding-top: 4px; }
        .lx-field:last-of-type { border-bottom: none; padding-bottom: 4px; }
        .lx-field:hover {
          background: transparent;
          transform: none;
          border-color: rgba(255,255,255,0.05);
        }
        .lx-field:focus-within {
          background: transparent;
          box-shadow: none;
          border-color: rgba(255,255,255,0.05);
        }
        .lx-field-header {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-bottom: 14px;
        }
        .lx-field-header > svg {
          margin-top: 2px;
          flex-shrink: 0;
          color: rgba(249,115,22,0.75);
          filter: none;
        }
        .lx-field-title {
          font-family: var(--font-display), "Space Grotesk", system-ui, sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          line-height: 1.3;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .lx-field-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
          letter-spacing: -0.005em;
        }

        /* Thin scrollbar for timezone picker */
        .lx-scrollbar::-webkit-scrollbar { width: 3px; }
        .lx-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .lx-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }

        /* Horizontal scroll snap carousel (mobile testimonials) */
        .lx-snap-row { scroll-padding-left: 1.5rem; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
        .lx-snap-row > .flex { padding-right: 1.5rem; }
        .lx-scrollbar-x::-webkit-scrollbar { height: 0; background: transparent; }
        .lx-scrollbar-x { scrollbar-width: none; -ms-overflow-style: none; }

        /* (brand cycling done via React state now) */

        /* Gold star — loops: dim → fill gold 1-by-1 → hold → dim back */
        .lx-star {
          fill: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.06);
          animation: starLoop 4s ease infinite;
        }
        @keyframes starLoop {
          0%, 10% { fill: rgba(255,255,255,0.04); color: rgba(255,255,255,0.06); }
          25%, 70% { fill: #fbbf24; color: #fbbf24; filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.58)); }
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
          45%, 50% { opacity: 1; filter: blur(0); text-shadow: 0 0 10px rgba(249, 115, 22, 0.58); }
          90% { opacity: 1; filter: blur(0); text-shadow: 0 0 10px rgba(249, 115, 22, 0.58); }
          95%, 100% { opacity: 0; filter: blur(4px); }
        }

        /* FAQ open state — accent border + glow */
        .lx-faq-open {
          border-color: rgba(249, 115, 22, 0.17) !important;
          background: rgba(249, 115, 22, 0.03) !important;
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.04);
        }

        /* Flame icon — cycles orange → red → blue */
        .lx-flame {
          animation: flameColor 3s ease-in-out infinite;
        }
        @keyframes flameColor {
          0%, 100% { color: #f97316; filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.72)); }
          33% { color: #ef4444; filter: drop-shadow(0 0 4px rgba(239,68,68,0.5)); }
          66% { color: #3b82f6; filter: drop-shadow(0 0 4px rgba(59,130,246,0.5)); }
        }

        /* Terminal dots — muted, minimal */
        .lx-dot-red { background: rgba(255,95,87,0.25); }
        .lx-dot-yellow { background: rgba(255, 189, 46, 0.36); }
        .lx-dot-green { background: rgba(40,200,64,0.25); }

        /* Form card rotating border */
        .lx-form-wrap { position: relative; padding: 1px; border-radius: 18px; }
        .lx-form-border {
          position: absolute; inset: 0; border-radius: 18px; padding: 1px;
          background: conic-gradient(from var(--ba,0deg), transparent 30%, rgba(249, 115, 22, 0.12) 40%, rgba(255,255,255,0.06) 50%, rgba(249, 115, 22, 0.17) 55%, rgba(255,255,255,0.04) 65%, transparent 75%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: bRot 8s linear infinite;
        }

        /* Focus + scrollbar */
        *:focus-visible { outline: 1px solid rgba(255,255,255,0.12); outline-offset: 2px; border-radius: 8px; }
        .lx-page ::selection { background: rgba(249, 115, 22, 0.22); color: white; }

        /* Orb animations */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes sheenSweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes applyTicker { from { transform: translate(0, -50%); } to { transform: translate(-33.333%, -50%); } }
        @keyframes heroBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        @keyframes hotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.45); }
          50% { box-shadow: 0 0 0 6px rgba(249,115,22,0); }
        }
        /* Timeline effects */
        @keyframes stepPulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.06); opacity: 1; } }
        @keyframes stepRotate { to { transform: rotate(360deg); } }
        @keyframes stepRotateReverse { to { transform: rotate(-360deg); } }
        @keyframes procFlow { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes timelineRipple {
          0%   { transform: scale(1);    opacity: 0.85; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        @keyframes timelineTravel {
          0%, 4%   { left: 0%;   opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          15%      { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          85%      { opacity: 1; }
          96%, 100%{ left: 100%; opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
        }

        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>
    </main>
  )
}
