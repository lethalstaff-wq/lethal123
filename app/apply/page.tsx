"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FloatingTechStack } from "@/components/floating-tech-stack"
import {
  Users, Code2, Crown, Headphones, Camera, Search, DollarSign,
  Check, Minus, Plus, Send, CheckCircle2, Shield, Zap, Globe,
  ArrowRight, Clock, Star, ChevronRight, Trophy, Rocket, Heart, ChevronDown,
  MessageSquare, Layers,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                                                                           */
/*   ██╗     ███████╗████████╗██╗  ██╗ █████╗ ██╗                           */
/*   ██║     ██╔════╝╚══██╔══╝██║  ██║██╔══██╗██║                           */
/*   ██║     █████╗     ██║   ███████║███████║██║                           */
/*   ██║     ██╔══╝     ██║   ██╔══██║██╔══██║██║                           */
/*   ███████╗███████╗   ██║   ██║  ██║██║  ██║███████╗                      */
/*   ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝                      */
/*                                                                           */
/*   APPLY PAGE — Futuristic Edition                                         */
/*   ~4000 lines of pure visual excellence                                  */
/*                                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════ */
/* DATA                                                               */
/* ═══════════════════════════════════════════════════════════════════ */
const POSITIONS = [
  { id: "developer", title: "Developer", icon: Code2, color: "#a855f7", gradient: "from-purple-500 to-violet-600", popular: false,
    description: "Build and maintain our tools, website, and backend infrastructure",
    requirements: ["Strong Python, TypeScript, or C++", "Reverse engineering / anti-cheat experience", "Self-driven, no hand-holding"],
    openSlots: 1, perks: ["Cutting-edge tech", "Revenue share"], emoji: "{ }" },
  { id: "manager", title: "Head Manager", icon: Crown, color: "#f97316", gradient: "from-orange-500 to-amber-600", popular: false,
    description: "Oversee daily operations, team coordination, and strategic business decisions",
    requirements: ["Proven leadership experience", "Available 20+ hours/week", "Business or management background"],
    openSlots: 1, perks: ["Revenue share", "Strategic role"], emoji: "👑" },
  { id: "support", title: "Support Agent", icon: Headphones, color: "#22c55e", gradient: "from-emerald-500 to-green-600", popular: true,
    description: "Help customers with setup, troubleshooting, and orders via Discord",
    requirements: ["Deep knowledge of DMA / spoofers / cheats", "Fast response time under 5 minutes", "Fluent English, patient under pressure"],
    openSlots: 3, perks: ["Commission per ticket", "Flexible schedule"], emoji: "🎧" },
  { id: "media", title: "Media Manager", icon: Camera, color: "#ec4899", gradient: "from-pink-500 to-rose-600", popular: false,
    description: "Create content, manage social media, design thumbnails and edit videos. We provide all tools and software you need — zero cost to you",
    requirements: ["Basic video editing (CapCut, Premiere, or AE)", "Willingness to learn — we'll train you", "We provide: Adobe Suite, footage, assets, templates"],
    openSlots: 2, perks: ["Free Adobe Suite", "All assets provided"], emoji: "🎬" },
  { id: "seo", title: "SEO Specialist", icon: Search, color: "#3b82f6", gradient: "from-blue-500 to-indigo-600", popular: false,
    description: "Optimize search rankings, manage keywords, and drive organic traffic",
    requirements: ["Proven SEO results (show us rankings)", "Ahrefs / SEMrush / GSC experience", "Technical SEO + content strategy"],
    openSlots: 1, perks: ["Performance bonuses", "Own the strategy"], emoji: "🔍" },
  { id: "sales", title: "Sales / Reseller", icon: DollarSign, color: "#eab308", gradient: "from-yellow-500 to-amber-500", popular: true,
    description: "Sell our products on your own platform and earn industry-leading margins. Bulk discounts up to 80% off retail — you set your own price and keep the difference",
    requirements: ["Own Discord server, Telegram, or community", "Existing audience or customer base", "Hustle mentality — we provide everything else"],
    openSlots: 2, perks: ["Up to 80% bulk discount", "Set your own prices"], emoji: "💰" },
]

const TEAM_QUOTES = [
  { text: "Joined as a dev 6 months ago. Zero micromanagement, full creative freedom. Best decision I made this year.", name: "cipher", role: "Developer", time: "6 months", color: "#a855f7", avatar: "CI" },
  { text: "Left my 9-5 for this. Commission here beats a salary and I work from my couch. Not going back.", name: "vex", role: "Sales", time: "4 months", color: "#eab308", avatar: "VX" },
  { text: "Product actually works which makes support easy. Customers thank me instead of yelling at me lol.", name: "nova", role: "Support", time: "3 months", color: "#22c55e", avatar: "NV" },
  { text: "I handle all the socials and content. Full creative control, no approval chains, just ship it.", name: "flare", role: "Media", time: "2 months", color: "#ec4899", avatar: "FL" },
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
  { q: "Can I work multiple roles?", a: "Yes! Many team members wear multiple hats. Start with one role and expand as you prove yourself." },
  { q: "What tools do you use?", a: "Discord for communication, GitHub for code, Notion for docs. We provide all software and licenses needed." },
]

const STATS = [
  { value: 10, suffix: "+", label: "Team Members", icon: Users, color: "#a855f7" },
  { value: 774, suffix: "+", label: "Happy Clients", icon: Trophy, color: "#eab308" },
  { value: 99, suffix: ".8%", label: "Uptime", icon: Zap, color: "#22c55e" },
  { value: 24, suffix: "/7", label: "Support", icon: Clock, color: "#3b82f6" },
  { value: 0, suffix: "", label: "Detections", icon: Shield, color: "#ec4899" },
  { value: 6, suffix: "+", label: "Timezones", icon: Globe, color: "#f97316" },
]

const PERKS_GRID = [
  { icon: Globe, title: "100% Remote", desc: "Work from anywhere in the world. No office, no commute, no dress code.", color: "#3b82f6" },
  { icon: Clock, title: "Flex Schedule", desc: "Set your own hours. We measure output, not time online.", color: "#a855f7" },
  { icon: Zap, title: "Ship Fast", desc: "No bureaucracy. Ideas go from concept to production in days, not months.", color: "#eab308" },
  { icon: Shield, title: "Trusted Brand", desc: "774+ reviews, 99.8% uptime. You're building tools real users love.", color: "#22c55e" },
  { icon: Star, title: "Earn More", desc: "Commission + bonuses with uncapped potential. Your hustle = your income.", color: "#f97316" },
  { icon: Heart, title: "Great Culture", desc: "Zero toxicity. Skilled, driven people with mutual respect and dark humor.", color: "#ec4899" },
  { icon: Rocket, title: "Growth Path", desc: "Start anywhere, grow everywhere. Top performers get promoted fast.", color: "#06b6d4" },
  { icon: Layers, title: "Real Impact", desc: "Small team = big impact. Your work directly shapes the product.", color: "#8b5cf6" },
]

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

const TECH_STACK = [
  { name: "TypeScript", color: "#3178c6", angle: 0 },
  { name: "React", color: "#61dafb", angle: 45 },
  { name: "Next.js", color: "#ffffff", angle: 90 },
  { name: "Python", color: "#3776ab", angle: 135 },
  { name: "C++", color: "#00599c", angle: 180 },
  { name: "Node.js", color: "#339933", angle: 225 },
  { name: "Rust", color: "#dea584", angle: 270 },
  { name: "Go", color: "#00add8", angle: 315 },
]

const TOOLS_WE_USE = [
  { name: "Discord", desc: "Team communication & customer support", color: "#5865f2" },
  { name: "GitHub", desc: "Version control & code collaboration", color: "#f0f6fc" },
  { name: "Notion", desc: "Documentation & project management", color: "#ffffff" },
  { name: "Figma", desc: "UI/UX design & prototyping", color: "#a259ff" },
  { name: "Vercel", desc: "Deployment & hosting infrastructure", color: "#ffffff" },
  { name: "Stripe", desc: "Payment processing & billing", color: "#635bff" },
]

const COMPARISON = [
  { feature: "Remote Work", lethal: true, corporate: false },
  { feature: "Flexible Hours", lethal: true, corporate: false },
  { feature: "No Micromanagement", lethal: true, corporate: false },
  { feature: "Revenue Share", lethal: true, corporate: false },
  { feature: "Creative Freedom", lethal: true, corporate: false },
  { feature: "Ship in Days, Not Months", lethal: true, corporate: false },
  { feature: "No Dress Code", lethal: true, corporate: false },
  { feature: "Work From Your Couch", lethal: true, corporate: false },
]

const TIMELINE = [
  { year: "Day 1", title: "Application Received", desc: "We read your application. Every single one, no bots.", color: "#EF6F29" },
  { year: "Day 2", title: "Review & Response", desc: "You get a Discord DM from the team lead within 48 hours.", color: "#a855f7" },
  { year: "Day 3", title: "Quick Interview", desc: "15-minute casual voice call. No whiteboard, no pressure.", color: "#3b82f6" },
  { year: "Day 4", title: "Trial Period", desc: "One-week trial with real tasks. Show us what you've got.", color: "#22c55e" },
  { year: "Day 11", title: "Full Onboarding", desc: "Welcome to the team. Access, tools, training — all yours.", color: "#eab308" },
]

const WORLD_CITIES = [
  { name: "Los Angeles", x: 12, y: 42, tz: "UTC-8" },
  { name: "New York", x: 24, y: 38, tz: "UTC-5" },
  { name: "São Paulo", x: 30, y: 68, tz: "UTC-3" },
  { name: "London", x: 47, y: 32, tz: "UTC+0" },
  { name: "Berlin", x: 51, y: 30, tz: "UTC+1" },
  { name: "Kyiv", x: 55, y: 30, tz: "UTC+2" },
  { name: "Moscow", x: 58, y: 28, tz: "UTC+3" },
  { name: "Dubai", x: 62, y: 42, tz: "UTC+4" },
  { name: "Mumbai", x: 68, y: 48, tz: "UTC+5:30" },
  { name: "Singapore", x: 76, y: 55, tz: "UTC+8" },
  { name: "Tokyo", x: 82, y: 36, tz: "UTC+9" },
  { name: "Sydney", x: 86, y: 70, tz: "UTC+11" },
]

const ROLE_BENEFITS = {
  developer: [
    "Work on bleeding-edge anti-cheat bypass tech",
    "Full access to our private research & tools",
    "Revenue share on products you build",
    "Choose your own tech stack",
  ],
  support: [
    "Commission on every resolved ticket",
    "Flexible shift scheduling",
    "Deep product training provided",
    "Promotion path to team lead",
  ],
  sales: [
    "Up to 80% bulk discount on all products",
    "Set your own prices & margins",
    "Marketing materials provided",
    "Exclusive reseller dashboard",
  ],
  media: [
    "Free Adobe Creative Suite license",
    "All footage, assets, and templates provided",
    "Full creative control — no approval chains",
    "Performance bonuses on viral content",
  ],
  manager: [
    "Direct strategic influence on business",
    "Revenue share & profit participation",
    "Lead a team of 10+ skilled operators",
    "Shape company culture & processes",
  ],
  seo: [
    "Own the entire SEO strategy",
    "Performance bonuses on ranking improvements",
    "Access to premium SEO tools (Ahrefs, SEMrush)",
    "Build & optimize from the ground up",
  ],
}


/* ═══════════════════════════════════════════════════════════════════ */
/* UTILITY: INTERSECTION OBSERVER HOOK                                */
/* ═══════════════════════════════════════════════════════════════════ */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}


/* ═══════════════════════════════════════════════════════════════════ */
/* ANIMATED GRID BACKGROUND                                           */
/* ═══════════════════════════════════════════════════════════════════ */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial fade */}
      <div className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, #0a0a0a 70%)",
        }}
      />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* AURORA MESH BACKGROUND                                             */
/* ═══════════════════════════════════════════════════════════════════ */
function AuroraMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orange glow */}
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-[0.07] animate-aurora-1"
        style={{ background: "radial-gradient(circle, #EF6F29 0%, transparent 70%)" }} />
      {/* Purple accent */}
      <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full opacity-[0.05] animate-aurora-2"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }} />
      {/* Cyan accent */}
      <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-[0.04] animate-aurora-3"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
      {/* Deep blue */}
      <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full opacity-[0.03] animate-aurora-4"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* FLOATING PARTICLES (Canvas-based)                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const colors = ["#EF6F29", "#FF8C42", "#a855f7", "#3b82f6", "#22c55e", "#06b6d4"]

    type Particle = {
      x: number; y: number; vx: number; vy: number
      r: number; alpha: number; color: string
      baseAlpha: number; pulseSpeed: number; pulsePhase: number
    }

    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const handler = (e: MouseEvent) => { mousePosRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener("mousemove", handler)

    for (let i = 0; i < 100; i++) {
      const baseAlpha = Math.random() * 0.3 + 0.05
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 0.3,
        alpha: baseAlpha,
        baseAlpha,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    let frame = 0
    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mousePosRef.current.x
      const my = mousePosRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Pulse alpha
        p.alpha = p.baseAlpha + Math.sin(frame * p.pulseSpeed + p.pulsePhase) * p.baseAlpha * 0.5

        // Mouse interaction — gentle attraction
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.5
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        p.vx *= 0.985
        p.vy *= 0.985

        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        // Glow effect
        ctx.save()
        ctx.globalAlpha = p.alpha * 0.3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.restore()

        // Core particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = p.x - p2.x
          const dy2 = p.y - p2.y
          const d = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d < 140) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = (1 - d / 140) * 0.06
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
      window.removeEventListener("mousemove", handler)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* FLOATING GEOMETRIC SHAPES                                          */
/* ═══════════════════════════════════════════════════════════════════ */
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hexagon 1 */}
      <div className="absolute top-[15%] left-[8%] w-16 h-16 opacity-[0.04] animate-float-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#EF6F29" strokeWidth="2" />
        </svg>
      </div>
      {/* Triangle */}
      <div className="absolute top-[35%] right-[5%] w-20 h-20 opacity-[0.03] animate-float-medium rotate-12">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="#a855f7" strokeWidth="2" />
        </svg>
      </div>
      {/* Circle */}
      <div className="absolute top-[60%] left-[3%] w-12 h-12 opacity-[0.04] animate-float-fast">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="2" />
        </svg>
      </div>
      {/* Diamond */}
      <div className="absolute top-[75%] right-[12%] w-14 h-14 opacity-[0.03] animate-float-slow rotate-45">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="#3b82f6" strokeWidth="2" />
        </svg>
      </div>
      {/* Cross */}
      <div className="absolute top-[20%] right-[25%] w-10 h-10 opacity-[0.03] animate-float-medium">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <line x1="50" y1="10" x2="50" y2="90" stroke="#ec4899" strokeWidth="2" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#ec4899" strokeWidth="2" />
        </svg>
      </div>
      {/* Dots pattern */}
      <div className="absolute top-[45%] left-[20%] w-24 h-24 opacity-[0.02] animate-float-fast">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[0, 25, 50, 75].map(x => [0, 25, 50, 75].map(y => (
            <circle key={`${x}-${y}`} cx={x + 12} cy={y + 12} r="2" fill="#EF6F29" />
          )))}
        </svg>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* SECTION DIVIDER — Gradient line with glow                         */
/* ═══════════════════════════════════════════════════════════════════ */
function SectionDivider({ color = "#EF6F29" }: { color?: string }) {
  return (
    <div className="relative py-1">
      <div className="h-px w-full" style={{
        background: `linear-gradient(90deg, transparent, ${color}30, ${color}50, ${color}30, transparent)`,
      }} />
      <div className="absolute inset-0 h-px blur-sm" style={{
        background: `linear-gradient(90deg, transparent, ${color}20, ${color}30, ${color}20, transparent)`,
      }} />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* SECTION LABEL — Styled section title with decorators              */
/* ═══════════════════════════════════════════════════════════════════ */
function SectionLabel({ label, color = "primary" }: { label: string; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <div className="h-px flex-1 max-w-[80px]" style={{
        background: `linear-gradient(90deg, transparent, var(--color-${color}, #EF6F29) / 0.3)`,
      }} />
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary/70">{label}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
      </div>
      <div className="h-px flex-1 max-w-[80px]" style={{
        background: `linear-gradient(270deg, transparent, var(--color-${color}, #EF6F29) / 0.3)`,
      }} />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* ANIMATED COUNTER                                                   */
/* ═══════════════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView(0.5)

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setCount(Math.round(ease * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value])

  return <span ref={ref as unknown as React.RefObject<HTMLSpanElement>} className="tabular-nums">{count}{suffix}</span>
}


/* ═══════════════════════════════════════════════════════════════════ */
/* SCROLL-REVEAL WRAPPER                                              */
/* ═══════════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "scale"
  className?: string
}) {
  const { ref, inView } = useInView(0.15)

  const transforms: Record<string, string> = {
    up: "translateY(40px)",
    down: "translateY(-40px)",
    left: "translateX(40px)",
    right: "translateX(-40px)",
    scale: "scale(0.9)",
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) translateX(0) scale(1)" : transforms[direction],
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* MAGNETIC BUTTON                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
function MagneticButton({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current || disabled) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    btnRef.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }, [disabled])

  const handleLeave = useCallback(() => {
    if (!btnRef.current) return
    btnRef.current.style.transform = "translate(0, 0)"
  }, [])

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
    </button>
  )
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
    ref.current.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`
    const shine = ref.current.querySelector("[data-shine]") as HTMLElement
    if (shine) {
      shine.style.opacity = "1"
      shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.08), transparent 60%)`
    }
    // Move glow
    const glow = ref.current.querySelector("[data-glow]") as HTMLElement
    if (glow) {
      glow.style.opacity = "1"
      glow.style.background = `radial-gradient(600px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(239,111,41,0.06), transparent 40%)`
    }
  }, [ref])

  const handleLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)"
    const shine = ref.current.querySelector("[data-shine]") as HTMLElement
    if (shine) shine.style.opacity = "0"
    const glow = ref.current.querySelector("[data-glow]") as HTMLElement
    if (glow) glow.style.opacity = "0"
  }, [ref])

  return { onMouseMove: handleMove, onMouseLeave: handleLeave }
}


/* ═══════════════════════════════════════════════════════════════════ */
/* TERMINAL ANIMATION                                                 */
/* ═══════════════════════════════════════════════════════════════════ */
function TerminalAnimation() {
  const [started, setStarted] = useState(false)
  const [tick, setTick] = useState(0)
  const { ref, inView } = useInView(0.3)

  useEffect(() => { if (inView && !started) setStarted(true) }, [inView, started])

  // Animate tick for live counters
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(interval)
  }, [started])

  const metrics = [
    { label: "UPTIME", value: "99.8%", color: "#22c55e", bar: 99.8 },
    { label: "LOAD", value: `${(12 + (tick % 5)).toFixed(1)}%`, color: "#3b82f6", bar: 12 + (tick % 5) },
    { label: "ORDERS", value: `${774 + tick}`, color: "#eab308", bar: 85 },
    { label: "DETECT", value: "0", color: "#22c55e", bar: 0 },
  ]

  return (
    <div ref={ref} className="w-full max-w-lg">
      <div className="relative group">
        {/* Outer glow */}
        <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-1000"
          style={{ background: "linear-gradient(135deg, rgba(239,111,41,0.15), rgba(168,85,247,0.1), rgba(59,130,246,0.1))" }} />

        <div className="relative rounded-2xl border border-white/[0.08] bg-[#08080a]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[11px] text-white/25 font-mono">LETHAL — System Dashboard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-400/70 font-mono">LIVE</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Live metrics grid */}
            <div className="grid grid-cols-4 gap-2">
              {metrics.map((m, i) => (
                <div key={i} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 text-center"
                  style={{
                    opacity: started ? 1 : 0,
                    transform: started ? "translateY(0)" : "translateY(10px)",
                    transition: `all 0.5s ease ${200 + i * 100}ms`,
                  }}>
                  <p className="text-[8px] font-bold tracking-widest mb-1" style={{ color: `${m.color}60` }}>{m.label}</p>
                  <p className="text-base font-black font-mono tabular-nums" style={{ color: m.color }}>{m.value}</p>
                  <div className="h-0.5 bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.bar}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Code preview */}
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 font-mono text-[11px] leading-[1.9]"
              style={{
                opacity: started ? 1 : 0,
                transition: "opacity 0.8s ease 0.8s",
              }}>
              <div className="text-white/15 mb-1">// latest deployment</div>
              <div><span className="text-purple-400/70">const</span> <span className="text-blue-400/70">status</span> <span className="text-white/30">=</span> <span className="text-emerald-400/70">&quot;operational&quot;</span><span className="text-white/20">;</span></div>
              <div><span className="text-purple-400/70">const</span> <span className="text-blue-400/70">team</span> <span className="text-white/30">=</span> <span className="text-primary/70">await</span> <span className="text-yellow-400/60">deploy</span><span className="text-white/30">(</span><span className="text-emerald-400/70">&quot;v2.14&quot;</span><span className="text-white/30">);</span></div>
              <div><span className="text-purple-400/70">const</span> <span className="text-blue-400/70">hiring</span> <span className="text-white/30">=</span> <span className="text-primary/80">true</span><span className="text-white/20">;</span> <span className="text-white/10">// you?</span></div>
              <div className="mt-1 text-emerald-400/60">
                <span>{'>'} </span>
                <span className="text-white/40">Ready for new legends</span>
                <span className="inline-block w-[7px] h-[14px] bg-primary/60 ml-0.5 animate-pulse align-middle rounded-sm" />
              </div>
            </div>

            {/* Team activity */}
            <div className="space-y-1.5"
              style={{
                opacity: started ? 1 : 0,
                transition: "opacity 0.8s ease 1.2s",
              }}>
              {[
                { name: "cipher", action: "deployed hotfix", time: "2m", color: "#a855f7" },
                { name: "nova", action: "closed 3 tickets", time: "5m", color: "#22c55e" },
                { name: "vex", action: "new reseller deal", time: "8m", color: "#eab308" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black"
                    style={{ background: `${e.color}15`, color: e.color }}>
                    {e.name[0].toUpperCase()}
                  </div>
                  <span className="text-[11px] text-white/30 flex-1">
                    <span className="text-white/50 font-semibold">{e.name}</span> {e.action}
                  </span>
                  <span className="text-[9px] text-white/15 font-mono">{e.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between px-5 py-2 border-t border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-white/20 font-mono">all systems go</span>
              </div>
              <div className="h-3 w-px bg-white/[0.06]" />
              <span className="text-[9px] text-white/15 font-mono">{POSITIONS.reduce((s, p) => s + p.openSlots, 0)} open roles</span>
            </div>
            <span className="text-[9px] text-primary/40 font-mono font-bold">HIRING</span>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* GLASSMORPHIC STAT CARD                                             */
/* ═══════════════════════════════════════════════════════════════════ */
function StatCard({ stat, index }: { stat: typeof STATS[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(cardRef)

  return (
    <Reveal delay={index * 80} direction="up">
      <div
        ref={cardRef}
        {...tilt}
        className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-500 rounded-2xl" />
        <div data-glow className="absolute inset-0 pointer-events-none z-5 opacity-0 transition-opacity duration-500 rounded-2xl" />

        {/* Top accent line */}
        <div className="h-[1.5px] w-full" style={{
          background: `linear-gradient(90deg, transparent, ${stat.color}60, transparent)`,
        }} />

        <div className="p-5 text-center relative">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center border border-white/[0.06] group-hover:scale-110 transition-transform duration-500"
            style={{ background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)` }}>
            <stat.icon className="h-[18px] w-[18px]" style={{ color: stat.color }} />
          </div>
          {/* Value */}
          <p className="text-2xl font-black text-white mb-1">
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </p>
          {/* Label */}
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{stat.label}</p>

          {/* Hover glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ boxShadow: `inset 0 0 40px ${stat.color}08` }} />
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* POSITION CARD — Premium glassmorphic design                       */
/* ═══════════════════════════════════════════════════════════════════ */
function PositionCard({ pos, onApply, index }: { pos: typeof POSITIONS[number]; onApply: (id: string) => void; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(cardRef)
  const [hovered, setHovered] = useState(false)

  return (
    <Reveal delay={index * 100} direction="up">
      <div
        ref={cardRef}
        {...tilt}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); tilt.onMouseLeave() }}
        className="group relative rounded-[20px] border border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/[0.12]"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-[20px] p-[1px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-[-200%] animate-[spin_8s_linear_infinite]"
            style={{ background: `conic-gradient(from 0deg, transparent 0%, ${pos.color}40 10%, transparent 20%)` }} />
        </div>

        {/* Shine overlay */}
        <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-500 rounded-[20px]" />
        <div data-glow className="absolute inset-0 pointer-events-none z-5 opacity-0 transition-opacity duration-500 rounded-[20px]" />

        {/* Top accent line */}
        <div className="h-[2px] w-full relative overflow-hidden">
          <div className="h-full w-full" style={{
            background: `linear-gradient(90deg, transparent, ${pos.color}, transparent)`,
            opacity: hovered ? 0.8 : 0.4,
            transition: "opacity 0.5s ease",
          }} />
          {/* Scanning light effect */}
          <div className="absolute top-0 h-full w-[60%] opacity-0 group-hover:opacity-100 animate-scan-line"
            style={{ background: `linear-gradient(90deg, transparent, ${pos.color}80, transparent)` }} />
        </div>

        <div className="p-7 relative z-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.06] group-hover:scale-110 transition-all duration-500 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${pos.color}20, ${pos.color}05)` }}>
                <pos.icon className="h-6 w-6 relative z-10" style={{ color: pos.color }} />
                {/* Inner glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle, ${pos.color}25, transparent 70%)` }} />
              </div>
              {/* Floating ring */}
              <div className="absolute -inset-2 rounded-2xl border opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"
                style={{ borderColor: `${pos.color}15` }} />
            </div>

            <div className="flex items-center gap-2">
              {pos.popular && (
                <span className="text-[9px] px-2.5 py-1 rounded-full font-black border animate-pulse"
                  style={{
                    background: `${pos.color}10`,
                    borderColor: `${pos.color}25`,
                    color: pos.color,
                  }}>
                  HOT
                </span>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400">{pos.openSlots} open</span>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-black mb-2 group-hover:text-white transition-colors duration-300">{pos.title}</h3>
          <p className="text-sm text-white/30 mb-6 leading-relaxed">{pos.description}</p>

          {/* Requirements */}
          <div className="space-y-2.5 mb-6">
            {pos.requirements.map((req, j) => (
              <div key={j} className="flex items-start gap-3 group/req">
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 group-hover/req:scale-110"
                  style={{ background: `${pos.color}12` }}>
                  <Check className="h-3 w-3" style={{ color: pos.color }} />
                </div>
                <span className="text-xs text-white/30 leading-relaxed group-hover/req:text-white/50 transition-colors">{req}</span>
              </div>
            ))}
          </div>

          {/* Perks */}
          <div className="flex flex-wrap gap-2 mb-6">
            {pos.perks.map((p, j) => (
              <span key={j} className="text-[10px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/25 font-semibold hover:bg-white/[0.06] hover:text-white/40 transition-all cursor-default">
                {p}
              </span>
            ))}
          </div>

          {/* Apply Button */}
          <button
            onClick={() => onApply(pos.id)}
            className="relative w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 overflow-hidden transition-all duration-500 group/btn"
            style={{
              background: hovered ? `linear-gradient(135deg, ${pos.color}20, ${pos.color}10)` : "rgba(255,255,255,0.03)",
              border: `1px solid ${hovered ? pos.color + "40" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {/* Sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"
              style={{ background: `linear-gradient(90deg, transparent, ${pos.color}15, transparent)` }} />

            <span className="relative z-10 tracking-wide">Apply Now</span>
            <ArrowRight className="h-4 w-4 relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300" style={{ color: hovered ? pos.color : "rgba(255,255,255,0.3)" }} />
          </button>
        </div>

        {/* Bottom ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ boxShadow: `0 0 30px 10px ${pos.color}10` }} />
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* TESTIMONIAL CARD                                                   */
/* ═══════════════════════════════════════════════════════════════════ */
function TestimonialCard({ quote, index }: { quote: typeof TEAM_QUOTES[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(cardRef)

  return (
    <Reveal delay={index * 120} direction="up">
      <div
        ref={cardRef}
        {...tilt}
        className="group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-xl overflow-hidden hover:border-white/[0.12] transition-all duration-500"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-500 rounded-2xl" />

        {/* Top accent */}
        <div className="h-[2px] w-full" style={{
          background: `linear-gradient(90deg, transparent, ${quote.color}, transparent)`,
          opacity: 0.4,
        }} />

        <div className="p-7">
          {/* Stars */}
          <div className="flex gap-1 mb-5">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="h-3.5 w-3.5 fill-amber-400/80 text-amber-400/80" />
            ))}
          </div>

          {/* Quote */}
          <p className="text-sm text-white/45 leading-[1.8] mb-6 italic">
            &ldquo;{quote.text}&rdquo;
          </p>

          {/* Author */}
          <div className="flex items-center gap-3.5 pt-5 border-t border-white/[0.04]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black tracking-wider"
              style={{
                background: `linear-gradient(135deg, ${quote.color}20, ${quote.color}08)`,
                color: quote.color,
                border: `1px solid ${quote.color}20`,
              }}>
              {quote.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-white/80">{quote.name}</p>
              <p className="text-[11px] text-white/25">{quote.role} · {quote.time}</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* PROCESS STEP CARD                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function ProcessStep({
  step,
  index,
  total,
}: {
  step: { step: string; title: string; desc: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }
  index: number
  total: number
}) {
  return (
    <Reveal delay={index * 150} direction="up">
      <div className="relative">
        {/* Connector arrow */}
        {index < total - 1 && (
          <div className="hidden sm:flex absolute top-12 -right-[16px] z-20 items-center">
            <ChevronRight className="h-4 w-4 text-white/10" />
          </div>
        )}

        <div className="group rounded-2xl border border-white/[0.04] bg-[#0c0c0e]/60 backdrop-blur-sm p-7 text-center hover:border-white/[0.1] transition-all duration-500 relative overflow-hidden">
          {/* Background glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: `radial-gradient(circle at center, ${step.color}06, transparent 70%)` }} />

          {/* Step number */}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-5 block relative z-10" style={{ color: `${step.color}50` }}>
            Step {step.step}
          </span>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/[0.06] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative"
            style={{ background: `linear-gradient(135deg, ${step.color}15, transparent)` }}>
            <step.icon className="h-7 w-7 relative z-10" style={{ color: step.color }} />
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `${step.color}20` }} />
          </div>

          <h4 className="font-black text-xl mb-2.5 relative z-10">{step.title}</h4>
          <p className="text-xs text-white/30 leading-relaxed max-w-[220px] mx-auto relative z-10">{step.desc}</p>

          {/* Number watermark */}
          <div className="absolute top-3 right-4 text-[80px] font-black opacity-[0.02] leading-none select-none pointer-events-none">
            {step.step}
          </div>
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* PERK CARD                                                          */
/* ═══════════════════════════════════════════════════════════════════ */
function PerkCard({ perk, index }: { perk: typeof PERKS_GRID[number]; index: number }) {
  return (
    <Reveal delay={index * 60} direction="up">
      <div className="group rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500 relative overflow-hidden">
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: `radial-gradient(circle at top left, ${perk.color}06, transparent 60%)` }} />

        <div className="relative z-10">
          <div className="w-11 h-11 rounded-xl border border-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${perk.color}12, transparent)` }}>
            <perk.icon className="h-5 w-5" style={{ color: perk.color }} />
          </div>
          <h4 className="font-bold mb-2 text-white/90">{perk.title}</h4>
          <p className="text-xs text-white/25 leading-relaxed">{perk.desc}</p>
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* FAQ ITEM                                                           */
/* ═══════════════════════════════════════════════════════════════════ */
function FaqItem({ item, index }: { item: typeof FAQ[number]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Reveal delay={index * 80} direction="up">
      <div className="group rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/60 backdrop-blur-sm overflow-hidden hover:border-white/[0.1] transition-all duration-300">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full p-6 text-left cursor-pointer"
        >
          <span className="text-sm font-bold text-white/80 pr-4">{item.q}</span>
          <div className={`w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center shrink-0 transition-all duration-300 ${open ? "rotate-90 border-primary/30 bg-primary/10" : ""}`}>
            <ChevronRight className={`h-4 w-4 transition-colors ${open ? "text-primary" : "text-white/20"}`} />
          </div>
        </button>
        <div
          className="overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxHeight: open ? "200px" : "0px",
            opacity: open ? 1 : 0,
          }}
        >
          <div className="px-6 pb-6 pt-0">
            <div className="h-px w-full bg-white/[0.04] mb-4" />
            <p className="text-sm text-white/35 leading-[1.8]">{item.a}</p>
          </div>
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* MARQUEE — Infinite scrolling text                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function Marquee() {
  const items = ["Developer", "Manager", "Support", "Media", "SEO", "Sales", "Remote", "Flexible", "Commission", "Growth"]

  return (
    <div className="relative overflow-hidden py-6 opacity-[0.15]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-2xl font-black uppercase tracking-widest text-white/50">
            {item}
            <span className="mx-8 text-primary/50">/</span>
          </span>
        ))}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* NOISE OVERLAY                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] opacity-[0.015]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* SCROLL PROGRESS BAR                                                */
/* ═══════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handler = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0)
    }
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px]">
      <div
        className="h-full transition-[width] duration-150"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #EF6F29, #a855f7, #3b82f6)",
          boxShadow: "0 0 10px rgba(239,111,41,0.5), 0 0 30px rgba(239,111,41,0.2)",
        }}
      />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* CURSOR GLOW (Desktop only)                                         */
/* ═══════════════════════════════════════════════════════════════════ */
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!glowRef.current) return
      glowRef.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[600px] h-[600px] pointer-events-none z-[1] hidden lg:block"
      style={{
        background: "radial-gradient(circle, rgba(239,111,41,0.03) 0%, transparent 60%)",
        willChange: "transform",
      }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* GLITCH TEXT                                                        */
/* ═══════════════════════════════════════════════════════════════════ */
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch-text relative inline-block ${className}`} data-text={text}>
      {text}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* ORBIT ANIMATION — Tech stack rotating around a center             */
/* ═══════════════════════════════════════════════════════════════════ */
function TechOrbit() {
  const { ref, inView } = useInView(0.2)

  return (
    <div ref={ref} className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] mx-auto">
      {/* Center core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
          <span className="text-2xl font-black text-primary">L</span>
        </div>
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-2xl border border-primary/20 animate-[ping_3s_ease-out_infinite]" />
        <div className="absolute -inset-4 rounded-3xl border border-primary/10 animate-[ping_3s_ease-out_1s_infinite]" />
      </div>

      {/* Orbit rings */}
      <div className="absolute inset-4 rounded-full border border-white/[0.03]" />
      <div className="absolute inset-12 rounded-full border border-white/[0.04]" />
      <div className="absolute inset-0 rounded-full border border-white/[0.02]" />

      {/* Orbiting tech items */}
      {TECH_STACK.map((tech, i) => {
        const radius = 155
        const duration = 30 + i * 2
        const delay = i * -3.75

        return (
          <div
            key={tech.name}
            className="absolute top-1/2 left-1/2"
            style={{
              animation: inView ? `orbit ${duration}s linear ${delay}s infinite` : "none",
              width: 0,
              height: 0,
            }}
          >
            <div
              className="group relative -translate-x-1/2 -translate-y-1/2 cursor-default"
              style={{
                transform: `translate(${Math.cos((tech.angle * Math.PI) / 180) * radius}px, ${Math.sin((tech.angle * Math.PI) / 180) * radius}px)`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-sm transition-all duration-300 hover:scale-125 hover:border-white/20"
                style={{
                  animation: inView ? `counterOrbit ${duration}s linear ${delay}s infinite` : "none",
                  boxShadow: `0 0 20px ${tech.color}10`,
                }}
              >
                <span className="text-[10px] font-bold" style={{ color: tech.color }}>
                  {tech.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              {/* Label on hover */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-black/80 border border-white/10" style={{ color: tech.color }}>
                  {tech.name}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* WORLD MAP — Animated dots showing team locations                   */
/* ═══════════════════════════════════════════════════════════════════ */
function WorldMap() {
  const { ref, inView } = useInView(0.2)
  const [activeCity, setActiveCity] = useState<number | null>(null)

  return (
    <div ref={ref} className="relative w-full max-w-4xl mx-auto aspect-[2/1] rounded-3xl overflow-hidden border border-white/[0.04] bg-[#0a0a0c]/80">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

      {/* Equator line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.03]" />
      {/* Meridian */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/[0.03]" />

      {/* City dots */}
      {WORLD_CITIES.map((city, i) => (
        <div
          key={city.name}
          className="absolute group cursor-pointer"
          style={{
            left: `${city.x}%`,
            top: `${city.y}%`,
            opacity: inView ? 1 : 0,
            transform: inView ? "scale(1)" : "scale(0)",
            transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
          }}
          onMouseEnter={() => setActiveCity(i)}
          onMouseLeave={() => setActiveCity(null)}
        >
          {/* Pulse ring */}
          <div className="absolute -inset-3 rounded-full border border-primary/20 animate-[ping_3s_ease-out_infinite]"
            style={{ animationDelay: `${i * 200}ms` }} />
          {/* Outer glow */}
          <div className="w-6 h-6 rounded-full absolute -inset-[6px] opacity-30"
            style={{ background: `radial-gradient(circle, #EF6F29, transparent 70%)` }} />
          {/* Dot */}
          <div className="w-3 h-3 rounded-full bg-primary relative z-10 group-hover:scale-150 transition-transform duration-300" />

          {/* Tooltip */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 z-20 ${activeCity === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
            <div className="px-3 py-2 rounded-lg bg-black/90 border border-white/10 backdrop-blur-sm">
              <p className="text-xs font-bold text-white">{city.name}</p>
              <p className="text-[10px] text-primary">{city.tz}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Connection lines between cities */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]">
        {WORLD_CITIES.map((city, i) =>
          WORLD_CITIES.slice(i + 1).filter((_, j) => (i + j) % 3 === 0).map((city2, j) => (
            <line
              key={`${i}-${j}`}
              x1={`${city.x}%`} y1={`${city.y}%`}
              x2={`${city2.x}%`} y2={`${city2.y}%`}
              stroke="#EF6F29"
              strokeWidth="0.5"
              strokeDasharray="4,4"
            />
          ))
        )}
      </svg>

      {/* Scan line */}
      <div className="absolute top-0 bottom-0 w-px animate-world-scan opacity-20"
        style={{ background: "linear-gradient(180deg, transparent, #EF6F29, transparent)" }} />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* COMPARISON TABLE — Us vs Corporate                                 */
/* ═══════════════════════════════════════════════════════════════════ */
function ComparisonTable() {
  const { ref, inView } = useInView(0.15)

  return (
    <div ref={ref} className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div />
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-xs font-black text-primary">LETHAL</span>
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs font-black text-white/30">CORPORATE</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {COMPARISON.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-4 items-center py-3.5 px-5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(-20px)",
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms`,
            }}
          >
            <span className="text-sm text-white/60 font-medium">{row.feature}</span>
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <span className="text-red-400 text-lg leading-none">×</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* TIMELINE — Visual timeline of the hiring process                   */
/* ═══════════════════════════════════════════════════════════════════ */
function HiringTimeline() {
  const { ref, inView } = useInView(0.15)

  return (
    <div ref={ref} className="relative max-w-3xl mx-auto">
      {/* Vertical line */}
      <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

      {TIMELINE.map((item, i) => {
        const isLeft = i % 2 === 0
        return (
          <div
            key={i}
            className={`relative flex items-center gap-6 mb-12 last:mb-0 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(30px)",
              transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 150}ms`,
            }}
          >
            {/* Content */}
            <div className={`flex-1 pl-16 sm:pl-0 ${isLeft ? "sm:text-right sm:pr-12" : "sm:text-left sm:pl-12"}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2" style={{ color: `${item.color}70` }}>
                {item.year}
              </span>
              <h4 className="text-lg font-black mb-1.5 text-white/90">{item.title}</h4>
              <p className="text-sm text-white/30 leading-relaxed">{item.desc}</p>
            </div>

            {/* Center node */}
            <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-10">
              <div className="w-12 h-12 rounded-xl border-2 flex items-center justify-center bg-[#0a0a0a]"
                style={{ borderColor: `${item.color}40` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              </div>
              {/* Glow */}
              <div className="absolute inset-0 rounded-xl blur-xl opacity-30"
                style={{ background: item.color }} />
            </div>

            {/* Spacer for opposite side */}
            <div className="hidden sm:block flex-1" />
          </div>
        )
      })}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* TOOLS SHOWCASE — What we use, animated grid                        */
/* ═══════════════════════════════════════════════════════════════════ */
function ToolsShowcase() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
      {TOOLS_WE_USE.map((tool, i) => (
        <Reveal key={i} delay={i * 80} direction="up">
          <div className="group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/60 p-6 hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: `radial-gradient(circle at center, ${tool.color}06, transparent 70%)` }} />

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <span className="text-xs font-black" style={{ color: tool.color }}>
                  {tool.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <h4 className="font-bold text-sm mb-1.5 text-white/80">{tool.name}</h4>
              <p className="text-[11px] text-white/25 leading-relaxed">{tool.desc}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* ROLE DETAIL BENEFITS — Expandable details per role                 */
/* ═══════════════════════════════════════════════════════════════════ */
function RoleBenefits({ positionId }: { positionId: string }) {
  const benefits = ROLE_BENEFITS[positionId as keyof typeof ROLE_BENEFITS]
  const pos = POSITIONS.find(p => p.id === positionId)
  if (!benefits || !pos) return null

  return (
    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 mt-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: `${pos.color}60` }}>
        {pos.title} Benefits
      </p>
      <div className="space-y-3">
        {benefits.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${pos.color}12` }}>
              <Star className="h-3 w-3" style={{ color: pos.color }} />
            </div>
            <span className="text-xs text-white/40 leading-relaxed">{b}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* TYPING EFFECT — For headings                                       */
/* ═══════════════════════════════════════════════════════════════════ */
function TypingText({ text, className = "" }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("")
  const { ref, inView } = useInView(0.5)

  useEffect(() => {
    if (!inView) return
    let i = 0
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [inView, text])

  return (
    <span ref={ref as unknown as React.RefObject<HTMLSpanElement>} className={className}>
      {displayed}
      {displayed.length < text.length && inView && (
        <span className="inline-block w-[3px] h-[1em] bg-primary/70 ml-0.5 animate-pulse align-baseline" />
      )}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* HEXAGON GRID BACKGROUND — for specific sections                    */
/* ═══════════════════════════════════════════════════════════════════ */
function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="hexagons" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M28 66L0 50V16L28 0l28 16v34L28 66zm0 0l28 16v34L28 100 0 84V66l28-16z"
              fill="none" stroke="#EF6F29" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* LIVE ACTIVITY FEED — Simulated real-time events                    */
/* ═══════════════════════════════════════════════════════════════════ */
function LiveFeed() {
  const events = [
    { text: "cipher pushed 3 commits to main", time: "2m ago", color: "#a855f7" },
    { text: "nova resolved ticket #1842", time: "5m ago", color: "#22c55e" },
    { text: "flare uploaded new YouTube thumbnail", time: "12m ago", color: "#ec4899" },
    { text: "vex closed $420 reseller deal", time: "18m ago", color: "#eab308" },
    { text: "System: all endpoints healthy", time: "30m ago", color: "#3b82f6" },
    { text: "cipher deployed hotfix v2.14.3", time: "45m ago", color: "#a855f7" },
  ]

  const { ref, inView } = useInView(0.2)

  return (
    <div ref={ref} className="w-full max-w-md">
      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-white/[0.04]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Live Activity</span>
        </div>

        {/* Events */}
        <div className="p-4 space-y-1">
          {events.map((event, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateX(0)" : "translateX(-15px)",
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: event.color }} />
              <span className="text-xs text-white/35 flex-1 truncate">{event.text}</span>
              <span className="text-[10px] text-white/15 shrink-0">{event.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* GRADIENT BORDER CARD — Animated rotating gradient border           */
/* ═══════════════════════════════════════════════════════════════════ */
function GradientBorderCard({
  children,
  className = "",
  colors = "#EF6F29, #a855f7, #3b82f6",
}: {
  children: React.ReactNode
  className?: string
  colors?: string
}) {
  return (
    <div className={`relative rounded-[24px] overflow-hidden ${className}`}>
      {/* Spinning gradient border */}
      <div className="absolute inset-0 rounded-[24px] p-[1px] overflow-hidden">
        <div className="absolute inset-[-200%] animate-[spin_8s_linear_infinite]"
          style={{ background: `conic-gradient(from 0deg, transparent 0%, ${colors.split(",")[0]} 8%, transparent 16%)` }} />
      </div>
      <div className="relative rounded-[23px] bg-[#0b0b0d]/95 backdrop-blur-xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* NUMBER TICKER — Slot-machine style counting                        */
/* ═══════════════════════════════════════════════════════════════════ */
function NumberTicker({ value, className = "" }: { value: string; className?: string }) {
  const { ref, inView } = useInView(0.5)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setShow(true), 200)
      return () => clearTimeout(t)
    }
  }, [inView])

  return (
    <span ref={ref as unknown as React.RefObject<HTMLSpanElement>} className={`inline-flex overflow-hidden ${className}`}>
      {value.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-700"
          style={{
            transform: show ? "translateY(0)" : "translateY(100%)",
            opacity: show ? 1 : 0,
            transitionDelay: `${i * 50}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* BEAM CONNECTOR — Animated light beam between sections              */
/* ═══════════════════════════════════════════════════════════════════ */
function BeamDivider() {
  return (
    <div className="relative h-24 flex items-center justify-center overflow-hidden">
      <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute w-px h-8 bg-primary/60 animate-beam rounded-full"
        style={{ boxShadow: "0 0 10px #EF6F29, 0 0 20px #EF6F29" }} />
      <div className="relative w-3 h-3 rounded-full bg-primary/30 border border-primary/50">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* MOUSE TRAIL — Sparkle trail following cursor                       */
/* ═══════════════════════════════════════════════════════════════════ */
function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const trails: Array<{
      x: number; y: number; alpha: number; size: number
      vx: number; vy: number; color: string; life: number
    }> = []

    const colors = ["#EF6F29", "#FF8C42", "#a855f7", "#3b82f6", "#22c55e"]
    let mouseX = 0, mouseY = 0
    let prevX = 0, prevY = 0
    let frame = 0

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    const handleMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener("mousemove", handleMove)

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new particles based on mouse movement speed
      const dx = mouseX - prevX
      const dy = mouseY - prevY
      const speed = Math.sqrt(dx * dx + dy * dy)

      if (speed > 2 && frame % 2 === 0) {
        const count = Math.min(Math.floor(speed / 8), 4)
        for (let i = 0; i < count; i++) {
          trails.push({
            x: mouseX + (Math.random() - 0.5) * 10,
            y: mouseY + (Math.random() - 0.5) * 10,
            alpha: 0.8,
            size: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 2 + dx * 0.05,
            vy: (Math.random() - 0.5) * 2 + dy * 0.05 - 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
          })
        }
      }

      prevX = mouseX
      prevY = mouseY

      // Update & draw trails
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i]
        t.life -= 0.02
        t.alpha = t.life * 0.6
        t.size *= 0.98
        t.x += t.vx
        t.y += t.vy
        t.vy += 0.02 // gravity
        t.vx *= 0.99

        if (t.life <= 0 || t.alpha <= 0) {
          trails.splice(i, 1)
          continue
        }

        // Glow
        ctx.save()
        ctx.globalAlpha = t.alpha * 0.3
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = t.color
        ctx.fill()
        ctx.restore()

        // Core
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2)
        ctx.fillStyle = t.color
        ctx.globalAlpha = t.alpha
        ctx.fill()
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2] hidden lg:block"
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* PARALLAX SECTION WRAPPER                                           */
/* ═══════════════════════════════════════════════════════════════════ */
function ParallaxLayer({
  children,
  speed = 0.3,
  className = "",
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => {
      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const viewCenter = window.innerHeight / 2
      const offset = (centerY - viewCenter) * speed
      el.style.transform = `translateY(${offset}px)`
    }
    window.addEventListener("scroll", handler, { passive: true })
    handler()
    return () => window.removeEventListener("scroll", handler)
  }, [speed])

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 3D FLIP CARD                                                       */
/* ═══════════════════════════════════════════════════════════════════ */
function FlipCard({
  front,
  back,
  color = "#EF6F29",
}: {
  front: React.ReactNode
  back: React.ReactNode
  color?: string
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="cursor-pointer group"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — this one sizes the container */}
        <div
          className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/90 backdrop-blur-sm overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.4 }} />
          <div className="p-6 pb-8">{front}</div>
          <div className="absolute bottom-3 right-3 text-[9px] text-white/15 font-mono flex items-center gap-1 group-hover:text-white/30 transition-colors">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg>
            flip
          </div>
        </div>

        {/* Back — absolutely positioned on top */}
        <div
          className="absolute inset-0 rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/95 backdrop-blur-sm overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6 }} />
          <div className="p-6 pb-8">{back}</div>
          <div className="absolute bottom-3 right-3 text-[9px] text-white/15 font-mono">flip back</div>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* ANIMATED SKILL BARS                                                */
/* ═══════════════════════════════════════════════════════════════════ */
function SkillBar({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  const { ref, inView } = useInView(0.3)

  return (
    <div ref={ref} className="group">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-bold text-white/50 group-hover:text-white/70 transition-colors">{label}</span>
        <span className="text-xs font-black tabular-nums" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-[1500ms] ease-out relative"
          style={{
            width: inView ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            transitionDelay: `${delay}ms`,
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer opacity-50"
            style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`, backgroundSize: "200% 100%" }} />
        </div>
        {/* Glow */}
        <div
          className="absolute top-0 h-full rounded-full blur-sm transition-all duration-[1500ms] ease-out"
          style={{
            width: inView ? `${value}%` : "0%",
            background: `${color}30`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* SPOTLIGHT CARD — Card with mouse-following spotlight                */
/* ═══════════════════════════════════════════════════════════════════ */
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty("--spotlight-x", `${x}px`)
    cardRef.current.style.setProperty("--spotlight-y", `${y}px`)
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      className={`spotlight-card relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/80 overflow-hidden hover:border-white/[0.1] transition-colors duration-300 ${className}`}
    >
      {/* Spotlight gradient follows mouse */}
      <div className="spotlight-gradient absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500" />
      {children}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* COUNTDOWN TIMER — Shows urgency for open positions                 */
/* ═══════════════════════════════════════════════════════════════════ */
function CountdownBadge() {
  const [time, setTime] = useState({ h: 47, m: 59, s: 59 })

  // Persist deadline across sessions via localStorage
  useEffect(() => {
    const STORAGE_KEY = "lethal_apply_deadline"
    let deadline: number

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        deadline = parseInt(stored, 10)
        // If deadline passed, set a new one 48h from now
        if (deadline <= Date.now()) {
          deadline = Date.now() + 48 * 60 * 60 * 1000
          localStorage.setItem(STORAGE_KEY, deadline.toString())
        }
      } else {
        deadline = Date.now() + 48 * 60 * 60 * 1000
        localStorage.setItem(STORAGE_KEY, deadline.toString())
      }
    } catch {
      deadline = Date.now() + 48 * 60 * 60 * 1000
    }

    const tick = () => {
      const diff = Math.max(0, deadline - Date.now())
      const totalSec = Math.floor(diff / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      setTime({ h, m, s })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, "0")

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-[11px] font-bold text-red-400">
        Applications close in{" "}
        <span className="font-mono tabular-nums text-white/70">
          {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
        </span>
      </span>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* MATRIX RAIN — Background effect for specific sections              */
/* ═══════════════════════════════════════════════════════════════════ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener("resize", resize)

    const chars = "01アイウエオカキクケコサシスセソ{}[]<>/=+*"
    const fontSize = 12
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -100)

    let animId: number
    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 10, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#EF6F2915"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Fade based on position
        const alpha = Math.max(0, Math.min(1, (canvas.height - y) / canvas.height)) * 0.15
        ctx.fillStyle = `rgba(239, 111, 41, ${alpha})`
        ctx.fillText(char, x, y)

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0
        }
        drops[i] += 0.5
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-40"
      style={{ width: "100%", height: "100%" }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* MORPHING BLOB — Animated SVG blob shape                            */
/* ═══════════════════════════════════════════════════════════════════ */
function MorphBlob({ color = "#EF6F29", size = 400, className = "" }: { color?: string; size?: number; className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          fill={`${color}08`}
          className="animate-morph"
        >
          <animate
            attributeName="d"
            dur="12s"
            repeatCount="indefinite"
            values="
              M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,89.1,-0.5C88.2,15.2,83.9,30.5,76,43.6C68.2,56.8,56.8,67.9,43.4,75.2C30,82.5,14.7,86,-1.2,88C-17.1,90,-34.2,90.5,-47.9,83.6C-61.6,76.7,-72,62.3,-78.8,46.8C-85.6,31.3,-88.8,14.7,-87.5,-1.3C-86.2,-17.3,-80.5,-32.7,-72.1,-47.5C-63.7,-62.3,-52.7,-76.5,-39.1,-84C-25.5,-91.5,-9.7,-92.3,3.6,-98.5C16.8,-104.8,30.6,-83.5,44.7,-76.4Z;
              M39.9,-68.2C52.7,-61.2,64.7,-52.6,73.1,-40.7C81.5,-28.8,86.2,-13.6,85.6,-0.4C85,12.9,79.2,25.7,71.2,37.1C63.2,48.5,53,58.5,41,66.1C29,73.7,15.2,78.8,0.2,78.5C-14.9,78.2,-29.8,72.5,-42.9,64.5C-56,56.5,-67.3,46.2,-74.7,33.4C-82.1,20.5,-85.6,5.1,-83.8,-9.5C-82,-24.1,-74.9,-37.8,-64.9,-48.5C-54.8,-59.2,-41.9,-66.8,-28.6,-73.5C-15.3,-80.2,-1.7,-86,9.5,-82.6C20.7,-79.3,27.1,-75.2,39.9,-68.2Z;
              M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,89.1,-0.5C88.2,15.2,83.9,30.5,76,43.6C68.2,56.8,56.8,67.9,43.4,75.2C30,82.5,14.7,86,-1.2,88C-17.1,90,-34.2,90.5,-47.9,83.6C-61.6,76.7,-72,62.3,-78.8,46.8C-85.6,31.3,-88.8,14.7,-87.5,-1.3C-86.2,-17.3,-80.5,-32.7,-72.1,-47.5C-63.7,-62.3,-52.7,-76.5,-39.1,-84C-25.5,-91.5,-9.7,-92.3,3.6,-98.5C16.8,-104.8,30.6,-83.5,44.7,-76.4Z
            "
          />
        </path>
      </svg>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* ROTATING TEXT RING — Circular text animation                       */
/* ═══════════════════════════════════════════════════════════════════ */
function TextRing({ text = "LETHAL TEAM · JOIN US · APPLY NOW · ", size = 160 }: { text?: string; size?: number }) {
  const chars = text.split("")
  const angleStep = 360 / chars.length

  return (
    <div className="relative animate-[spin_20s_linear_infinite]" style={{ width: size, height: size }}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="absolute top-0 left-1/2 text-[10px] font-bold text-primary/30 origin-[0_80px]"
          style={{
            transform: `rotate(${i * angleStep}deg)`,
            transformOrigin: `0 ${size / 2}px`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* STAGGER COUNTER — Numbers cascade in from the side                 */
/* ═══════════════════════════════════════════════════════════════════ */
function StaggerReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.2)
  return (
    <div ref={ref} className={className}>
      <div style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) rotateX(0)" : "translateY(30px) rotateX(-15deg)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        transformOrigin: "bottom center",
        perspective: "1000px",
      }}>
        {children}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*                                                                    */
/*                     ██ MAIN PAGE ██                                */
/*                                                                    */
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
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [heroTextVisible, setHeroTextVisible] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [loaderDone, setLoaderDone] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const formRef = useRef<HTMLDivElement>(null)

  // Page loader sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPageLoaded(true), 800)
    const t2 = setTimeout(() => setLoaderDone(true), 1400)
    const t3 = setTimeout(() => setHeroTextVisible(true), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // Scroll parallax tracking
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
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
      setTimeout(() => setShowConfetti(false), 5000)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch { toast.error("Failed to submit — please try again") }
    setSubmitting(false)
  }


  /* ══════════════════════════════════════════════════════════════ */
  /* SUCCESS STATE                                                 */
  /* ══════════════════════════════════════════════════════════════ */
  if (submitted) return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Navbar />
      <NoiseOverlay />
      <ParticleField />

      <section className="flex-1 flex items-center justify-center py-32 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />

        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="absolute rounded-full" style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                left: `${Math.random() * 100}%`,
                top: "-5%",
                backgroundColor: ["#EF6F29", "#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ec4899", "#06b6d4"][i % 7],
                animation: `confettiFall ${2.5 + Math.random() * 2.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                animationDelay: `${Math.random() * 1.2}s`,
                // @ts-expect-error custom CSS props
                "--fall": `${typeof window !== "undefined" ? window.innerHeight + 100 : 1000}px`,
                "--dx": `${(Math.random() - 0.5) * 400}px`,
                "--rot": `${Math.random() * 1080}deg`,
              }} />
            ))}
          </div>
        )}

        <div className="relative text-center max-w-lg" style={{
          opacity: 1,
          animation: "fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}>
          {/* Success icon */}
          <div className="relative mx-auto mb-10 w-28 h-28">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-success-bounce">
              <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            {/* Ripple rings */}
            <div className="absolute inset-0 rounded-[32px] border-2 border-emerald-500/30 animate-ripple-1" />
            <div className="absolute -inset-3 rounded-[36px] border border-emerald-500/15 animate-ripple-2" />
            <div className="absolute -inset-6 rounded-[40px] border border-emerald-500/10 animate-ripple-3" />
          </div>

          <h2 className="text-5xl sm:text-6xl font-black mb-4 neon-text">
            You're In!
          </h2>
          {/* Celebration particles burst */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" style={{
                animation: `starPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.1}s both`,
              }} />
            ))}
          </div>
          <p className="text-lg text-white/60 mb-2">
            Application for <span className="text-white font-bold">{selectedPos?.title}</span> submitted successfully.
          </p>
          <p className="text-sm text-white/30 mb-4">We'll DM you on Discord within 48 hours.</p>

          {/* Progress steps completed */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {["Applied", "In Review", "Interview", "Onboard"].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-emerald-500 text-white" : "bg-white/[0.04] text-white/20 border border-white/[0.08]"}`}>
                  {i === 0 ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${i === 0 ? "text-emerald-400" : "text-white/20"}`}>{step}</span>
                {i < 3 && <div className="w-6 h-px bg-white/[0.08]" />}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link href="/"
              className="px-8 py-4 rounded-2xl border border-white/10 text-sm font-semibold hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300">
              Home
            </Link>
            <Link href="/products"
              className="px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 neon-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
      <Footer />
      <style jsx global>{`
        @keyframes confettiFall{0%{transform:translateY(0) scale(0) rotate(0);opacity:1}15%{transform:translateX(calc(var(--dx)*0.3)) translateY(15vh) scale(1) rotate(calc(var(--rot)*0.2));opacity:1}100%{transform:translateX(var(--dx)) translateY(var(--fall)) scale(0.3) rotate(var(--rot));opacity:0}}
        @keyframes fadeInScale{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes ripple-1{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.05);opacity:0.6}}
        @keyframes ripple-2{0%,100%{transform:scale(1);opacity:0.2}50%{transform:scale(1.08);opacity:0.4}}
        @keyframes ripple-3{0%,100%{transform:scale(1);opacity:0.1}50%{transform:scale(1.1);opacity:0.2}}
        .animate-ripple-1{animation:ripple-1 2s ease-in-out infinite}
        .animate-ripple-2{animation:ripple-2 2s ease-in-out infinite 0.3s}
        .animate-ripple-3{animation:ripple-3 2s ease-in-out infinite 0.6s}
        .animate-success-bounce{animation:successBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards}
        @keyframes successBounce{from{transform:scale(0) rotate(-10deg)}to{transform:scale(1) rotate(0)}}
      `}</style>
    </main>
  )


  /* ══════════════════════════════════════════════════════════════ */
  /* MAIN RENDER                                                   */
  /* ══════════════════════════════════════════════════════════════ */
  return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0a] relative">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PAGE LOADER OVERLAY                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {!loaderDone && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center transition-all duration-700"
          style={{ opacity: pageLoaded ? 0 : 1, pointerEvents: pageLoaded ? "none" : "all" }}>
          <div className="relative flex flex-col items-center">
            {/* Spinning ring */}
            <div className="w-20 h-20 rounded-full border-2 border-white/[0.06] border-t-primary animate-spin mb-6" />
            {/* Logo */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-2xl font-black text-primary neon-text">L</div>
            {/* Loading text */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/30 tracking-widest uppercase">Initializing</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
            {/* Progress line */}
            <div className="w-48 h-0.5 bg-white/[0.04] rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full animate-loader-progress" />
            </div>
          </div>
        </div>
      )}

      <Navbar />
      <ScrollProgress />
      <NoiseOverlay />
      <CursorGlow />
      <MouseTrail />
      <ParticleField />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden">
        {/* Background layers with parallax */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.15}px)`, willChange: "transform" }}>
          <AuroraMesh />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.05}px)`, willChange: "transform" }}>
          <GridBackground />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.25}px)`, willChange: "transform" }}>
          <FloatingShapes />
        </div>

        {/* Radial gradient overlay with parallax */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(239,111,41,0.06) 0%, transparent 60%)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }} />

        <div className="container mx-auto relative z-10 py-32 px-4" style={{ maxWidth: 1280 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-20">

            {/* ── Left: Text content ── */}
            <div className="text-center lg:text-left">
              {/* Status badge */}
              <div className={`flex justify-center lg:justify-start mb-8 transition-all duration-1000 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-semibold text-white/70">
                    {POSITIONS.reduce((s, p) => s + p.openSlots, 0)} Open Positions
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-sm text-white/40">Hiring Now</span>
                </div>
              </div>

              {/* Countdown urgency */}
              <div className={`flex justify-center lg:justify-start mb-6 transition-all duration-1000 delay-100 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <CountdownBadge />
              </div>

              {/* Heading — Per-character stagger reveal */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black mb-7 tracking-tight leading-[1.05]">
                <span className="block text-white/95 overflow-hidden">
                  {"Join the".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block transition-all"
                      style={{
                        opacity: heroTextVisible ? 1 : 0,
                        transform: heroTextVisible ? "translateY(0) rotateX(0)" : "translateY(100%) rotateX(-80deg)",
                        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 40}ms`,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                <span className="block overflow-hidden">
                  {"Lethal Team".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift transition-all"
                      style={{
                        opacity: heroTextVisible ? 1 : 0,
                        transform: heroTextVisible ? "translateY(0) rotateX(0)" : "translateY(100%) rotateX(-80deg)",
                        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${500 + i * 45}ms`,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                {/* Animated underline */}
                <span className="block h-1 mt-2 rounded-full overflow-hidden max-w-[200px] lg:max-w-[260px]">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary"
                    style={{
                      width: heroTextVisible ? "100%" : "0%",
                      transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1s",
                      boxShadow: "0 0 20px rgba(239,111,41,0.5)",
                    }}
                  />
                </span>
              </h1>

              {/* Subtitle — word-by-word reveal */}
              <p className="text-base sm:text-lg lg:text-xl mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {"Work remotely. Set your own hours. Build the best gaming tools on the market.".split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="inline-block text-white/40 mr-[0.3em] transition-all"
                    style={{
                      opacity: heroTextVisible ? 1 : 0,
                      transform: heroTextVisible ? "translateY(0)" : "translateY(12px)",
                      filter: heroTextVisible ? "blur(0)" : "blur(4px)",
                      transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${900 + i * 35}ms`,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-14 transition-all duration-1000 delay-450 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <MagneticButton
                  onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
                  className="group text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 neon-btn hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <span>View Open Roles</span>
                  <ArrowRight className="h-[18px] w-[18px] group-hover:translate-x-1 transition-transform duration-300" />
                </MagneticButton>

                <MagneticButton
                  onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="group text-white/60 hover:text-white font-semibold px-8 py-4 rounded-2xl border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Apply Directly
                    <Send className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </span>
                </MagneticButton>
              </div>

              {/* Mini stats */}
              <div className={`grid grid-cols-3 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 transition-all duration-1000 delay-600 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                {[
                  { label: "Team Members", value: "10+", color: "#a855f7" },
                  { label: "Happy Clients", value: "774+", color: "#22c55e" },
                  { label: "Uptime", value: "99.8%", color: "#3b82f6" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl p-3.5 text-center bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                    <p className="text-xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: `${s.color}80` }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Terminal + TextRing ── */}
            <div className={`hidden lg:block transition-all duration-1000 delay-400 relative ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              {/* Morphing blob behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
                <MorphBlob color="#EF6F29" size={550} />
              </div>
              {/* 3D Isometric Card Stack — ynkidev style */}
              <FloatingTechStack />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-white/25 hover:text-primary/70 transition-colors group cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      </section>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MARQUEE                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Marquee />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STATS SECTION                                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="stats" className="relative z-10 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="By The Numbers" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Built Different
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Real numbers, no fluff. Here's what we've built together.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATS.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>


      <SectionDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TECH STACK & WORLD MAP                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <HexGrid />
        <div className="container mx-auto max-w-6xl relative">
          <SectionLabel label="Our Stack & Reach" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Global Team, <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Modern Stack</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-16 max-w-lg mx-auto text-sm leading-relaxed">
              We use cutting-edge technology and operate across every major timezone. Work with the best tools, from anywhere.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Tech Orbit */}
            <Reveal direction="left">
              <div className="flex justify-center">
                <TechOrbit />
              </div>
            </Reveal>

            {/* Tools Grid */}
            <div>
              <Reveal delay={200}>
                <h3 className="text-xl font-black mb-2">Tools We Use</h3>
                <p className="text-sm text-white/25 mb-8">Industry-standard stack. All licenses provided.</p>
              </Reveal>
              <ToolsShowcase />
            </div>
          </div>

          {/* World Map */}
          <Reveal>
            <div className="text-center mb-8">
              <h3 className="text-xl font-black mb-2">
                Team Across <span className="text-primary">6+ Timezones</span>
              </h3>
              <p className="text-sm text-white/25">24/7 coverage. Someone is always online.</p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <WorldMap />
          </Reveal>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* POSITIONS                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="positions" className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <SectionLabel label="Open Positions" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-4">
              Find Your Role
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-lg mx-auto text-sm leading-relaxed">
              Every position is fully remote with flexible hours. Pick what fits you best and let's build something great together.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSITIONS.map((pos, i) => (
              <PositionCard key={pos.id} pos={pos} onApply={scrollToForm} index={i} />
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#a855f7" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-4xl">
          <SectionLabel label="How It Works" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Three Steps to Join
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Simple, fast, no bureaucracy. Apply today, start tomorrow.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Apply", desc: "Fill out the form below. Takes less than 2 minutes. We read every single one.", icon: Send, color: "#EF6F29" },
              { step: "02", title: "Interview", desc: "Quick Discord call to get to know you. 15-20 minutes, casual vibes.", icon: MessageSquare, color: "#a855f7" },
              { step: "03", title: "Onboard", desc: "Get access, training, and start contributing immediately. Day one impact.", icon: Rocket, color: "#22c55e" },
            ].map((s, i) => (
              <ProcessStep key={i} step={s} index={i} total={3} />
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#22c55e" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HIRING TIMELINE                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <SectionLabel label="Your Journey" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              From Apply to <span className="text-primary">Onboarded</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-16 max-w-md mx-auto text-sm leading-relaxed">
              Our hiring process is fast and transparent. No ghosting, no waiting weeks. Here's exactly what happens.
            </p>
          </Reveal>

          <HiringTimeline />
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* COMPARISON TABLE                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-4xl">
          <SectionLabel label="The Difference" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Lethal vs <span className="text-white/20 line-through decoration-red-500/50">Corporate</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              We're not building the next Fortune 500. We're building something better.
            </p>
          </Reveal>

          <ComparisonTable />
        </div>
      </section>


      <SectionDivider color="#ec4899" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TEAM QUOTES                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="From The Team" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              What Our Team Says
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/25 mb-14 text-sm max-w-md mx-auto leading-relaxed">
              Real quotes from people who work here every day. No scripts, no edits.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_QUOTES.map((q, i) => (
              <TestimonialCard key={i} quote={q} index={i} />
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#ec4899" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* LIVE ACTIVITY + ROLE PREVIEW                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Right Now" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              See What's <span className="text-primary">Happening</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              This is what a day at Lethal looks like. Real work, real results, no corporate theater.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Live Feed */}
            <Reveal direction="left">
              <LiveFeed />
            </Reveal>

            {/* Quick stats / highlights */}
            <Reveal direction="right" delay={200}>
              <GradientBorderCard colors="#22c55e, #3b82f6, #a855f7">
                <div className="p-8">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2.5">
                    <Zap className="h-5 w-5 text-primary" />
                    This Week's Highlights
                  </h3>
                  <div className="space-y-5">
                    {[
                      { metric: "Tickets Resolved", value: "142", change: "+23%", color: "#22c55e" },
                      { metric: "Revenue Generated", value: "$12.4k", change: "+18%", color: "#eab308" },
                      { metric: "New Customers", value: "87", change: "+31%", color: "#3b82f6" },
                      { metric: "Code Commits", value: "34", change: "+12%", color: "#a855f7" },
                      { metric: "Content Published", value: "8", change: "+60%", color: "#ec4899" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-sm text-white/50">{item.metric}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white/80">{item.value}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GradientBorderCard>
            </Reveal>
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ROLE DEEP DIVE — 3D Flip Cards                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <MatrixRain />
        <div className="container mx-auto max-w-5xl relative">
          <SectionLabel label="Role Deep Dive" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Flip to <span className="text-primary">Explore</span> Each Role
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Click any card to see what your day-to-day actually looks like.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSITIONS.map((pos, i) => (
              <Reveal key={pos.id} delay={i * 80} direction="up">
                <FlipCard
                  color={pos.color}
                  front={
                    <div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/[0.06]"
                        style={{ background: `linear-gradient(135deg, ${pos.color}15, transparent)` }}>
                        <pos.icon className="h-5 w-5" style={{ color: pos.color }} />
                      </div>
                      <h3 className="text-lg font-black mb-2">{pos.title}</h3>
                      <p className="text-xs text-white/30 leading-relaxed mb-4">{pos.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">{pos.openSlots} open</span>
                      </div>
                    </div>
                  }
                  back={
                    <div>
                      <h4 className="text-sm font-black mb-4" style={{ color: pos.color }}>Day-to-Day</h4>
                      <div className="space-y-3">
                        {(ROLE_BENEFITS[pos.id as keyof typeof ROLE_BENEFITS] || []).map((b, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: pos.color }} />
                            <span className="text-[11px] text-white/40 leading-relaxed">{b}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {pos.perks.map((p, j) => (
                          <span key={j} className="text-[9px] px-2.5 py-1 rounded-full border text-white/25 font-semibold"
                            style={{ borderColor: `${pos.color}20`, background: `${pos.color}08` }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#06b6d4" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TEAM SKILL MATRIX — Animated skill bars                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Team DNA" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              What We're <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Built On</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Our team's collective strengths. These are the areas where we excel.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Skill bars */}
            <Reveal direction="left">
              <SpotlightCard className="p-8">
                <h3 className="text-lg font-black mb-8 flex items-center gap-2.5">
                  <Zap className="h-5 w-5 text-primary" />
                  Technical Capabilities
                </h3>
                <div className="space-y-6">
                  <SkillBar label="Reverse Engineering" value={95} color="#a855f7" delay={0} />
                  <SkillBar label="Web Development" value={92} color="#3b82f6" delay={100} />
                  <SkillBar label="Systems Programming" value={88} color="#EF6F29" delay={200} />
                  <SkillBar label="Security Research" value={90} color="#22c55e" delay={300} />
                  <SkillBar label="DevOps & Infrastructure" value={85} color="#eab308" delay={400} />
                  <SkillBar label="AI & Automation" value={78} color="#ec4899" delay={500} />
                </div>
              </SpotlightCard>
            </Reveal>

            {/* Culture metrics */}
            <Reveal direction="right" delay={200}>
              <SpotlightCard className="p-8">
                <h3 className="text-lg font-black mb-8 flex items-center gap-2.5">
                  <Heart className="h-5 w-5 text-primary" />
                  Culture & Operations
                </h3>
                <div className="space-y-6">
                  <SkillBar label="Team Satisfaction" value={97} color="#22c55e" delay={0} />
                  <SkillBar label="Response Time" value={94} color="#3b82f6" delay={100} />
                  <SkillBar label="Creative Freedom" value={99} color="#a855f7" delay={200} />
                  <SkillBar label="Work-Life Balance" value={96} color="#eab308" delay={300} />
                  <SkillBar label="Ship Speed" value={93} color="#EF6F29" delay={400} />
                  <SkillBar label="Knowledge Sharing" value={88} color="#ec4899" delay={500} />
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHY JOIN — Perks Grid                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <Reveal>
            <div className="relative rounded-[32px] border border-white/[0.06] bg-[#0c0c0e]/60 backdrop-blur-xl overflow-hidden">
              {/* Background effects */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(239,111,41,0.05) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)" }} />

              <div className="relative p-10 sm:p-14 lg:p-16">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Why Lethal?</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
                  Not a corporation.<br />
                  <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">A team that ships.</span>
                </h2>
                <p className="text-white/30 text-sm mb-12 max-w-lg leading-relaxed">
                  Small team, big impact. Your work directly shapes the product. No layers of management, no endless meetings — just build, ship, and get paid.
                </p>

                {/* Perks grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PERKS_GRID.map((perk, i) => (
                    <PerkCard key={i} perk={perk} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#3b82f6" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ACHIEVEMENT BADGES — Team milestones                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Milestones" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Badges <span className="text-primary">Unlocked</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Milestones we've hit together as a team. Next achievement: your application.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Trophy, label: "500+ Sales", color: "#eab308", unlocked: true },
              { icon: Shield, label: "0 Detects", color: "#22c55e", unlocked: true },
              { icon: Zap, label: "99.8% Up", color: "#3b82f6", unlocked: true },
              { icon: Users, label: "10+ Team", color: "#a855f7", unlocked: true },
              { icon: Globe, label: "6 Zones", color: "#f97316", unlocked: true },
              { icon: Rocket, label: "12 Shipped", color: "#ec4899", unlocked: true },
            ].map((badge, i) => (
              <Reveal key={i} delay={i * 60} direction="scale">
                <div className="group relative flex flex-col items-center text-center p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                    style={{ boxShadow: `inset 0 0 40px ${badge.color}10` }} />

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 border border-white/[0.06] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    style={{ background: `linear-gradient(135deg, ${badge.color}15, transparent)` }}>
                    <badge.icon className="h-5 w-5" style={{ color: badge.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-white/40">{badge.label}</span>

                  {/* Checkmark */}
                  {badge.unlocked && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TESTIMONIAL VIDEO PLACEHOLDER — Social proof section        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-4xl">
          <Reveal>
            <GradientBorderCard colors="#a855f7, #3b82f6, #22c55e">
              <div className="p-10 sm:p-14 text-center relative overflow-hidden">
                {/* Background mesh */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #a855f7 1px, transparent 1px),
                      radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px)`,
                    backgroundSize: "30px 30px",
                  }} />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-white/50">From Our Discord</span>
                  </div>

                  <blockquote className="text-xl sm:text-2xl font-bold text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto italic">
                    &ldquo;I applied on a Monday, had a 15-min Discord call on Tuesday, and by Wednesday I was shipping code. No other team moves this fast.&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ background: "linear-gradient(135deg, #a855f720, #a855f708)", color: "#a855f7", border: "1px solid #a855f720" }}>
                      CI
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white/80">cipher</p>
                      <p className="text-xs text-white/30">Lead Developer · 6 months</p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex justify-center gap-1 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400/80 text-amber-400/80" />
                    ))}
                  </div>
                </div>
              </div>
            </GradientBorderCard>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#eab308" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* APPLICATION FORM                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="apply-form" ref={formRef} className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Reveal>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <Send className="h-3.5 w-3.5" />
                Application Form
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">Apply Now</h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-white/30 text-sm leading-relaxed">Takes 2 minutes. We review every application within 48 hours.</p>
            </Reveal>
          </div>

          {/* Progress bar */}
          <Reveal delay={250}>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/20 font-semibold uppercase tracking-wider">Progress</span>
                <span className={`text-[11px] font-black ${pct === 100 ? "text-emerald-400" : "text-primary"}`}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${pct === 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-primary to-amber-400"}`}
                  style={{ width: `${pct}%` }}
                />
                {/* Glow effect on progress */}
                {pct > 0 && (
                  <div className="absolute top-0 h-full rounded-full blur-sm"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? "rgba(34,197,94,0.3)" : "rgba(239,111,41,0.3)",
                    }} />
                )}
              </div>
            </div>
          </Reveal>

          {/* Step tabs */}
          <Reveal delay={300}>
            <div className="grid grid-cols-3 gap-3 mb-10">
              {["Personal", "Schedule", "Experience"].map((label, i) => {
                const done = (i === 0 && s0) || (i === 1 && s1) || (i === 2 && s2)
                const active = formStep === i
                return (
                  <button key={i} onClick={() => setFormStep(i)}
                    className={`relative py-4 rounded-xl text-xs font-bold transition-all duration-300 overflow-hidden ${
                      active
                        ? "border-2 border-primary/40 text-primary shadow-lg shadow-primary/10"
                        : done
                          ? "border border-emerald-500/25 text-emerald-400 bg-emerald-500/5"
                          : "border border-white/[0.06] text-white/25 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
                    }`}
                    style={active ? { background: "linear-gradient(135deg, rgba(239,111,41,0.08), rgba(239,111,41,0.02))" } : {}}
                  >
                    {/* Active indicator dot */}
                    {active && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                    {done && !active ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="h-3.5 w-3.5" />
                        {label}
                      </span>
                    ) : (
                      `${i + 1}. ${label}`
                    )}
                  </button>
                )
              })}
            </div>
          </Reveal>

          {/* Form card — Glassmorphic with animated border */}
          <Reveal delay={350}>
            <div className="relative rounded-[28px] overflow-hidden">
              {/* Animated conic gradient border */}
              <div className="absolute inset-0 rounded-[28px] p-[1px] overflow-hidden">
                <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(239,111,41,0.3)_10%,transparent_20%)] animate-[spin_6s_linear_infinite]" />
              </div>

              <div className="relative rounded-[27px] bg-[#0b0b0d]/95 backdrop-blur-xl overflow-hidden">
                {/* Position indicator */}
                {selectedPos && (
                  <>
                    <div className="h-[2px]" style={{
                      background: `linear-gradient(90deg, transparent, ${selectedPos.color}, transparent)`,
                    }} />
                    <div className="px-8 py-5 border-b border-white/[0.04]"
                      style={{ background: `linear-gradient(135deg, ${selectedPos.color}08, transparent)` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.06]"
                          style={{ background: `linear-gradient(135deg, ${selectedPos.color}15, ${selectedPos.color}05)` }}>
                          <selectedPos.icon className="h-[22px] w-[22px]" style={{ color: selectedPos.color }} />
                        </div>
                        <div>
                          <p className="font-bold text-white/90">{selectedPos.title}</p>
                          <p className="text-[11px] text-white/25">{selectedPos.openSlots} position{selectedPos.openSlots > 1 ? "s" : ""} available · Remote</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="p-8 sm:p-10">

                  {/* ═══ STEP 0: Personal ═══ */}
                  {formStep === 0 && (
                    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-400">
                      {/* Position */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Position <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {POSITIONS.map(p => (
                            <button key={p.id} type="button" onClick={() => setPosition(p.id)}
                              className={`relative flex items-center gap-2.5 p-4 rounded-xl text-xs font-bold transition-all duration-300 overflow-hidden ${
                                position === p.id
                                  ? "border-2 bg-white/[0.03]"
                                  : "border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.03]"
                              }`}
                              style={position === p.id ? {
                                borderColor: p.color,
                                boxShadow: `0 0 25px ${p.color}15, inset 0 0 20px ${p.color}05`,
                              } : {}}>
                              <p.icon className="h-4 w-4 shrink-0" style={{ color: p.color }} />
                              <span className="truncate">{p.title}</span>
                              {p.popular && position !== p.id && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                              )}
                              {position === p.id && (
                                <div className="absolute inset-0 opacity-10"
                                  style={{ background: `radial-gradient(circle at center, ${p.color}, transparent 70%)` }} />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Role-specific benefits */}
                        {position && <RoleBenefits positionId={position} />}
                      </div>

                      {/* Discord */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Discord <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <input type="text" value={discord} onChange={(e) => setDiscord(e.target.value)}
                            placeholder="your username"
                            className="w-full h-[52px] px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/15 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300" />
                          {discord.length >= 2 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Check className="h-4 w-4 text-emerald-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Age */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Age <span className="text-primary">*</span>
                        </label>
                        <div className="flex items-center gap-4 w-48">
                          <button type="button" onClick={() => setAge(Math.max(16, age - 1))}
                            className="w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-90 transition-all duration-200">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="flex-1 text-center text-3xl font-black tabular-nums text-white/90">{age}</span>
                          <button type="button" onClick={() => setAge(Math.min(50, age + 1))}
                            className="w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-90 transition-all duration-200">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Timezone <span className="text-primary">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TIMEZONES.map((tz, i) => {
                            const isSelected = timezone === `${tz.v}|${tz.l}`
                            return (
                              <button key={`${tz.l}-${i}`} type="button"
                                onClick={() => setTimezone(`${tz.v}|${tz.l}`)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                                  isSelected
                                    ? "bg-primary/15 text-white border border-primary/30 shadow-lg shadow-primary/10"
                                    : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:bg-white/[0.05] hover:text-white/50 hover:border-white/[0.1]"
                                }`}>
                                <span className="text-base leading-none">{tz.flag}</span>
                                <span>{tz.l}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Continue */}
                      <button onClick={() => s0 && setFormStep(1)} disabled={!s0}
                        className="w-full py-[18px] rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{
                          background: s0 ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${s0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
                        }}>
                        Continue <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* ═══ STEP 1: Schedule ═══ */}
                  {formStep === 1 && (
                    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-400">
                      {/* Hours */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Hours / Week <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2.5">
                          {["5-10h", "10-20h", "20-30h", "30-40h", "40+"].map(h => (
                            <button key={h} type="button" onClick={() => setHoursPerWeek(h)}
                              className={`py-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                                hoursPerWeek === h
                                  ? "neon-btn text-white shadow-lg"
                                  : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12] hover:bg-white/[0.04]"
                              }`}>
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Days */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Available Days <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {DAYS.map(d => (
                            <button key={d} type="button" onClick={() => toggleDay(d)}
                              className={`py-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                                selectedDays.includes(d)
                                  ? "neon-btn text-white shadow-lg"
                                  : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12] hover:bg-white/[0.04]"
                              }`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Time */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Preferred Time <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                          {[
                            { v: "Morning", t: "6 — 12", e: "☀️" },
                            { v: "Afternoon", t: "12 — 18", e: "🌤" },
                            { v: "Evening", t: "18 — 00", e: "🌙" },
                            { v: "Night", t: "00 — 06", e: "🌑" },
                            { v: "Flexible", t: "Any", e: "⚡" },
                          ].map(t => (
                            <button key={t.v} type="button" onClick={() => setPreferredTime(t.v)}
                              className={`py-5 rounded-xl text-center transition-all duration-300 ${
                                preferredTime === t.v
                                  ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                                  : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                              }`}>
                              <span className="text-xl block mb-1.5">{t.e}</span>
                              <p className="text-[11px] font-bold text-white/70">{t.v}</p>
                              <p className="text-[9px] text-white/20 mt-0.5">{t.t}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-3">
                        <button onClick={() => setFormStep(0)}
                          className="flex-1 py-[18px] rounded-xl border border-white/[0.06] text-sm font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-300">
                          Back
                        </button>
                        <button onClick={() => s1 && setFormStep(2)} disabled={!s1}
                          className="flex-[2] py-[18px] rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-y-0.5"
                          style={{
                            background: s1 ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${s1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
                          }}>
                          Continue <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ═══ STEP 2: Experience ═══ */}
                  {formStep === 2 && (
                    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-400">
                      {/* Experience */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Experience <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
                            placeholder="Tell us about your relevant experience, skills, past projects..."
                            rows={5}
                            className="w-full px-5 py-4 rounded-xl bg-white/[0.02] text-sm placeholder:text-white/12 focus:outline-none resize-none transition-all duration-300 leading-relaxed"
                            style={{
                              border: `1px solid ${experience.length >= 50 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                              boxShadow: experience.length >= 50 ? "0 0 20px rgba(34,197,94,0.05)" : "none",
                            }} />
                          {/* Character progress ring */}
                          <div className="absolute bottom-3 right-3">
                            <svg width="28" height="28" className="transform -rotate-90">
                              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
                              <circle cx="14" cy="14" r="11" fill="none"
                                stroke={experience.length >= 50 ? "#22c55e" : "#EF6F29"}
                                strokeWidth="2"
                                strokeDasharray={`${Math.min(experience.length / 50, 1) * 69.1} 69.1`}
                                strokeLinecap="round"
                                className="transition-all duration-300" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
                              style={{ color: experience.length >= 50 ? "#22c55e" : "rgba(255,255,255,0.2)" }}>
                              {experience.length >= 50 ? <Check className="h-2.5 w-2.5" /> : experience.length}
                            </span>
                          </div>
                        </div>
                        <p className={`text-[11px] mt-2 flex items-center gap-1.5 transition-all duration-300 ${experience.length >= 50 ? "text-emerald-400" : "text-white/15"}`}>
                          {experience.length >= 50 ? <><Check className="h-3 w-3" /> Looks good</> : `${experience.length}/50 min characters`}
                        </p>
                      </div>

                      {/* Why Lethal */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Why Lethal? <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <textarea value={whyLethal} onChange={(e) => setWhyLethal(e.target.value)}
                            placeholder="What excites you about this role and our team?"
                            rows={4}
                            className="w-full px-5 py-4 rounded-xl bg-white/[0.02] text-sm placeholder:text-white/12 focus:outline-none resize-none transition-all duration-300 leading-relaxed"
                            style={{
                              border: `1px solid ${whyLethal.length >= 30 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                              boxShadow: whyLethal.length >= 30 ? "0 0 20px rgba(34,197,94,0.05)" : "none",
                            }} />
                          <div className="absolute bottom-3 right-3">
                            <svg width="28" height="28" className="transform -rotate-90">
                              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
                              <circle cx="14" cy="14" r="11" fill="none"
                                stroke={whyLethal.length >= 30 ? "#22c55e" : "#EF6F29"}
                                strokeWidth="2"
                                strokeDasharray={`${Math.min(whyLethal.length / 30, 1) * 69.1} 69.1`}
                                strokeLinecap="round"
                                className="transition-all duration-300" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
                              style={{ color: whyLethal.length >= 30 ? "#22c55e" : "rgba(255,255,255,0.2)" }}>
                              {whyLethal.length >= 30 ? <Check className="h-2.5 w-2.5" /> : whyLethal.length}
                            </span>
                          </div>
                        </div>
                        <p className={`text-[11px] mt-2 flex items-center gap-1.5 transition-all duration-300 ${whyLethal.length >= 30 ? "text-emerald-400" : "text-white/15"}`}>
                          {whyLethal.length >= 30 ? <><Check className="h-3 w-3" /> Looks good</> : `${whyLethal.length}/30 min characters`}
                        </p>
                      </div>

                      {/* Portfolio */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Portfolio <span className="text-white/15 font-normal text-xs ml-1">optional</span>
                        </label>
                        <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)}
                          placeholder="https://your-portfolio.com"
                          className="w-full h-[52px] px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all duration-300" />
                      </div>

                      {/* Agreements */}
                      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-7 space-y-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/15 mb-2">Agreements</p>
                        {[
                          { c: agree16, s: setAgree16, l: "I confirm I'm at least 16 years old" },
                          { c: agreeActive, s: setAgreeActive, l: "I agree to be active and maintain professionalism" },
                          { c: agreeUnpaid, s: setAgreeUnpaid, l: "I understand this position is initially unpaid / commission-based" },
                        ].map((item, i) => (
                          <label key={i} className="flex items-start gap-4 cursor-pointer group" onClick={() => item.s(!item.c)}>
                            <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                              item.c
                                ? "bg-primary border-primary shadow-lg shadow-primary/25"
                                : "border-white/10 group-hover:border-white/25"
                            }`}>
                              {item.c && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="text-xs text-white/30 leading-relaxed group-hover:text-white/45 transition-colors">{item.l}</span>
                          </label>
                        ))}
                      </div>

                      {/* Submit */}
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setFormStep(1)}
                          className="flex-1 py-[18px] rounded-xl border border-white/[0.06] text-sm font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-300">
                          Back
                        </button>
                        <button onClick={handleSubmit} disabled={!s2 || submitting}
                          className="flex-[2] py-[18px] rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 neon-btn">
                          {submitting ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                          ) : (
                            <>
                              <Send className="h-[18px] w-[18px]" />
                              Submit Application
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#eab308" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <Reveal>
            <div className="relative rounded-[24px] overflow-hidden group">
              {/* Background gradient layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-purple-500/10 to-cyan-500/15" />
              <div className="absolute inset-0 bg-[#0a0a0a]/80" />

              {/* Animated scan line */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 h-full w-[30%] opacity-0 group-hover:opacity-100 animate-scan-line"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(239,111,41,0.05), transparent)" }} />
              </div>

              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-8">
                <div>
                  <p className="font-black text-xl mb-1.5">Ready to join the team?</p>
                  <p className="text-sm text-white/35">Applications are reviewed within 48 hours. Zero gatekeeping.</p>
                </div>
                <MagneticButton
                  onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="shrink-0 px-10 py-4 rounded-xl font-bold text-sm flex items-center gap-2.5 neon-btn text-white hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <Send className="h-4 w-4" /> Apply Now
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FAQ                                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-2xl">
          <SectionLabel label="FAQ" />
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-4">Common Questions</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/25 mb-12 text-sm max-w-md mx-auto leading-relaxed">
              Everything you need to know before applying.
            </p>
          </Reveal>

          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <FaqItem key={i} item={f} index={i} />
            ))}
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* A DAY AT LETHAL — Visual timeline of a workday              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <HexGrid />
        <div className="container mx-auto max-w-4xl relative">
          <SectionLabel label="A Day At Lethal" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              What a <GlitchText text="Typical Day" className="text-primary" /> Looks Like
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-16 max-w-md mx-auto text-sm leading-relaxed">
              No two days are the same, but here's a peek into the rhythm.
            </p>
          </Reveal>

          <div className="space-y-6">
            {[
              { time: "09:00", title: "Check In", desc: "Quick async standup on Discord. Share what you're working on. No video calls unless needed.", icon: MessageSquare, color: "#3b82f6" },
              { time: "09:30", title: "Deep Work", desc: "Uninterrupted focus time. Code, design, sell — whatever your role demands. Music on, notifications off.", icon: Code2, color: "#a855f7" },
              { time: "12:00", title: "Break", desc: "Go touch grass. Walk your dog. Make food. We don't monitor your screen. Output matters, not hours.", icon: Heart, color: "#ec4899" },
              { time: "13:00", title: "Collaborate", desc: "Work with teammates on shared projects. Review PRs, give feedback, brainstorm ideas in voice channels.", icon: Users, color: "#22c55e" },
              { time: "15:00", title: "Ship It", desc: "Deploy, publish, deliver. We move fast. If it's done, it ships. No approval chains holding you back.", icon: Rocket, color: "#EF6F29" },
              { time: "17:00", title: "Wrap Up", desc: "Log what you shipped, set tomorrow's priorities. Done for the day? Sign off. Need more? Keep going.", icon: Star, color: "#eab308" },
            ].map((block, i) => (
              <Reveal key={i} delay={i * 80} direction="left">
                <div className="group flex gap-6 items-start p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500 relative overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: `radial-gradient(circle at left center, ${block.color}06, transparent 50%)` }} />

                  {/* Time */}
                  <div className="shrink-0 text-center relative z-10">
                    <span className="text-lg font-black font-mono" style={{ color: `${block.color}90` }}>
                      {block.time}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 relative z-10"
                    style={{ background: `linear-gradient(135deg, ${block.color}15, transparent)` }}>
                    <block.icon className="h-5 w-5" style={{ color: block.color }} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h4 className="font-bold text-white/85 mb-1">{block.title}</h4>
                    <p className="text-xs text-white/30 leading-relaxed">{block.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#06b6d4" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF NUMBERS — Big impact numbers                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Products Shipped", value: "12", suffix: "+", color: "#EF6F29", desc: "tools & updates launched" },
              { label: "Discord Members", value: "2.5", suffix: "K+", color: "#5865f2", desc: "active community members" },
              { label: "Revenue Shared", value: "$50", suffix: "K+", color: "#22c55e", desc: "paid to team members" },
              { label: "Avg Response Time", value: "4.2", suffix: "min", color: "#3b82f6", desc: "support ticket response" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100} direction="scale">
                <div className="group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/60 p-8 text-center hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                  {/* Background pulse */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(circle, ${item.color}08, transparent 70%)` }} />

                  <div className="relative z-10">
                    <p className="text-4xl sm:text-5xl font-black mb-2">
                      <NumberTicker value={item.value + item.suffix} className="text-white" />
                    </p>
                    <p className="text-sm font-bold mb-1" style={{ color: `${item.color}90` }}>{item.label}</p>
                    <p className="text-[11px] text-white/20">{item.desc}</p>
                  </div>

                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${item.color}40, transparent)` }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA — EPIC ENDING                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
            style={{ background: "radial-gradient(ellipse, rgba(239,111,41,0.08) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px]"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px]"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
        </div>

        {/* Floating shapes for drama */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-24 h-24 opacity-[0.03] animate-float-slow">
            <svg viewBox="0 0 100 100"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#EF6F29" strokeWidth="1.5" /></svg>
          </div>
          <div className="absolute top-[20%] right-[8%] w-16 h-16 opacity-[0.03] animate-float-medium rotate-45">
            <svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#a855f7" strokeWidth="1.5" /></svg>
          </div>
          <div className="absolute bottom-[15%] left-[10%] w-14 h-14 opacity-[0.04] animate-float-fast">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="1.5" /></svg>
          </div>
          <div className="absolute bottom-[25%] right-[5%] w-20 h-20 opacity-[0.03] animate-float-slow">
            <svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="none" stroke="#22c55e" strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl text-center relative">
          <Reveal>
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">
                Your Future Starts Here
              </span>
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              Stop scrolling.<br />
              <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                <GlitchText text="Start building." />
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-white/35 text-base sm:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              The best time to join was yesterday.<br className="hidden sm:block" />
              The second best time is <span className="text-primary font-bold">right now</span>.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <MagneticButton
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-3 px-14 py-5 rounded-2xl font-bold text-lg neon-btn text-white hover:-translate-y-1 active:scale-[0.97] animate-breathe"
              >
                <Send className="h-5 w-5" />
                Apply Now
                <ArrowRight className="h-5 w-5" />
              </MagneticButton>
            </div>
          </Reveal>

          {/* Trust indicators */}
          <Reveal delay={400}>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { icon: Shield, text: "48h Response" },
                { icon: Heart, text: "Zero Toxicity" },
                { icon: Zap, text: "Day-One Impact" },
                { icon: Globe, text: "Fully Remote" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/20">
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRE-FOOTER MARQUEE                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden py-4 border-t border-b border-white/[0.03]">
        <div className="flex animate-marquee whitespace-nowrap opacity-[0.08]">
          {[...Array(4)].map((_, setIdx) =>
            POSITIONS.map((pos, i) => (
              <span key={`${setIdx}-${i}`} className="mx-6 text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
                <pos.icon className="h-3.5 w-3.5" style={{ color: pos.color }} />
                {pos.title}
                <span className="text-primary/50 mx-4">/</span>
              </span>
            ))
          )}
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STICKY MOBILE BAR                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 lg:hidden"
          style={{ animation: "slideUp 0.3s ease-out" }}>
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="w-full py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2.5 neon-btn active:scale-[0.97] transition-transform">
            <Send className="h-4 w-4" /> Apply Now
          </button>
        </div>
      )}


      <Footer />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* GLOBAL STYLES & ANIMATIONS                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        /* ─── Page Loader ─── */
        @keyframes loaderProgress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loader-progress {
          animation: loaderProgress 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* ─── Star Pop ─── */
        @keyframes starPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* ─── Neon Button ─── */
        .neon-btn {
          background: linear-gradient(135deg, #EF6F29, #FF8C42);
          box-shadow: 0 0 15px rgba(239,111,41,0.3), 0 0 40px rgba(239,111,41,0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .neon-btn:hover {
          box-shadow: 0 0 20px rgba(239,111,41,0.5), 0 0 60px rgba(239,111,41,0.2), 0 0 100px rgba(239,111,41,0.1);
        }
        .neon-btn:disabled {
          box-shadow: none;
          opacity: 0.2;
        }

        /* ─── Aurora Animations ─── */
        @keyframes aurora1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(5%, 3%) scale(1.1); }
          50% { transform: translate(-3%, 5%) scale(0.95); }
          75% { transform: translate(3%, -3%) scale(1.05); }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(-4%, 2%) scale(1.05); }
          50% { transform: translate(3%, -4%) scale(1.1); }
          75% { transform: translate(-2%, 4%) scale(0.95); }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(5%, -3%) scale(1.08); }
          66% { transform: translate(-4%, 3%) scale(0.95); }
        }
        @keyframes aurora4 {
          0%, 100% { transform: translate(0%, 0%); }
          50% { transform: translate(-6%, -3%); }
        }
        .animate-aurora-1 { animation: aurora1 20s ease-in-out infinite; }
        .animate-aurora-2 { animation: aurora2 25s ease-in-out infinite; }
        .animate-aurora-3 { animation: aurora3 18s ease-in-out infinite; }
        .animate-aurora-4 { animation: aurora4 22s ease-in-out infinite; }

        /* ─── Floating Shapes ─── */
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(17deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-float-medium { animation: floatMedium 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }

        /* ─── Gradient Shift ─── */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift { animation: gradientShift 4s ease-in-out infinite; }

        /* ─── Marquee ─── */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }

        /* ─── Scan Line ─── */
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-scan-line { animation: scanLine 3s ease-in-out infinite; }

        /* ─── Confetti ─── */
        @keyframes confettiFall {
          0% { transform: translateY(0) scale(0) rotate(0); opacity: 1; }
          15% { transform: translateX(calc(var(--dx) * 0.3)) translateY(15vh) scale(1) rotate(calc(var(--rot) * 0.2)); opacity: 1; }
          100% { transform: translateX(var(--dx)) translateY(var(--fall)) scale(0.3) rotate(var(--rot)); opacity: 0; }
        }

        /* ─── Slide Up ─── */
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* ─── Custom scrollbar ─── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: rgba(239,111,41,0.3); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(239,111,41,0.5); }

        /* ─── Selection ─── */
        ::selection { background: rgba(239,111,41,0.3); color: white; }

        /* ─── Smooth scroll ─── */
        html { scroll-behavior: smooth; }

        /* ─── Animate-in utilities ─── */
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation-name: fadeIn; animation-duration: 0.4s; }
        .slide-in-from-right-4 { --tw-enter-translate-x: 16px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(var(--tw-enter-translate-x, 0)); } to { opacity: 1; transform: translateX(0); } }

        /* ─── Orbit animation ─── */
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counterOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        /* ─── World map scan ─── */
        @keyframes worldScan {
          0% { left: -2%; }
          100% { left: 102%; }
        }
        .animate-world-scan { animation: worldScan 6s linear infinite; }

        /* ─── Beam animation ─── */
        @keyframes beam {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-beam { animation: beam 2.5s ease-in-out infinite; }

        /* ─── Glitch text ─── */
        .glitch-text {
          position: relative;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }
        .glitch-text:hover::before {
          animation: glitch-1 0.3s linear infinite;
          color: #EF6F29;
          opacity: 0.7;
          clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
        }
        .glitch-text:hover::after {
          animation: glitch-2 0.3s linear infinite;
          color: #3b82f6;
          opacity: 0.7;
          clip-path: polygon(0 66%, 100% 66%, 100% 100%, 0 100%);
        }
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(3px, -2px); }
          60% { transform: translate(-2px, 1px); }
          80% { transform: translate(2px, -1px); }
          100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(3px, -2px); }
          40% { transform: translate(-3px, 2px); }
          60% { transform: translate(2px, -1px); }
          80% { transform: translate(-2px, 1px); }
          100% { transform: translate(0); }
        }

        /* ─── Shimmer loading effect ─── */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }

        /* ─── Breathing glow ─── */
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 20px rgba(239,111,41,0.1); }
          50% { box-shadow: 0 0 40px rgba(239,111,41,0.2), 0 0 80px rgba(239,111,41,0.05); }
        }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }

        /* ─── Rotate3D ─── */
        @keyframes rotate3d {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }

        /* ─── Typewriter cursor ─── */
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink { animation: blink 1s step-end infinite; }

        /* ─── Focus visible ─── */
        *:focus-visible {
          outline: 2px solid rgba(239,111,41,0.5);
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* ─── Spotlight card ─── */
        .spotlight-card:hover .spotlight-gradient {
          opacity: 1;
          background: radial-gradient(
            500px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
            rgba(239, 111, 41, 0.06),
            transparent 40%
          );
        }

        /* ─── Skill bar transition ─── */
        .duration-\[1500ms\] {
          transition-duration: 1500ms;
        }

        /* ─── Morph blob ─── */
        .animate-morph path {
          transition: d 0.5s ease;
        }

        /* ─── Parallax smooth ─── */
        .parallax-smooth {
          transition: transform 0.1s linear;
        }

        /* ─── Card hover lift ─── */
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }

        /* ─── Text shadow glow ─── */
        .text-glow {
          text-shadow: 0 0 20px rgba(239,111,41,0.3), 0 0 40px rgba(239,111,41,0.1);
        }

        /* ─── Gradient border animation ─── */
        @keyframes borderRotate {
          0% { --border-angle: 0deg; }
          100% { --border-angle: 360deg; }
        }

        /* ─── Pulsing dot ─── */
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        .animate-pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

        /* ─── Typing cursor blink ─── */
        @keyframes cursorBlink {
          0%, 100% { border-color: rgba(239,111,41,0.8); }
          50% { border-color: transparent; }
        }

        /* ─── Slide in from bottom with rotation ─── */
        @keyframes slideInRotate {
          from {
            opacity: 0;
            transform: translateY(40px) rotateX(-10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0);
          }
        }
        .animate-slide-in-rotate {
          animation: slideInRotate 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* ─── Hover underline effect ─── */
        .hover-underline {
          position: relative;
        }
        .hover-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #EF6F29, #FF8C42);
          transition: width 0.3s ease;
        }
        .hover-underline:hover::after {
          width: 100%;
        }

        /* ─── Stagger children animation ─── */
        .stagger-children > * {
          opacity: 0;
          animation: fadeSlideUp 0.6s ease forwards;
        }
        .stagger-children > *:nth-child(1) { animation-delay: 0ms; }
        .stagger-children > *:nth-child(2) { animation-delay: 80ms; }
        .stagger-children > *:nth-child(3) { animation-delay: 160ms; }
        .stagger-children > *:nth-child(4) { animation-delay: 240ms; }
        .stagger-children > *:nth-child(5) { animation-delay: 320ms; }
        .stagger-children > *:nth-child(6) { animation-delay: 400ms; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Glass morphism enhanced ─── */
        .glass {
          background: rgba(12, 12, 14, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* ─── Neon text ─── */
        .neon-text {
          color: #EF6F29;
          text-shadow:
            0 0 7px rgba(239,111,41,0.4),
            0 0 10px rgba(239,111,41,0.3),
            0 0 21px rgba(239,111,41,0.2),
            0 0 42px rgba(239,111,41,0.1);
        }

        /* ─── Smooth page transitions ─── */
        section {
          will-change: auto;
        }

        /* ─── Responsive fixes ─── */
        @media (max-width: 640px) {
          .glitch-text::before,
          .glitch-text::after { display: none; }
        }

        /* ─── Reduced motion ─── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .animate-marquee,
          .animate-aurora-1,
          .animate-aurora-2,
          .animate-aurora-3,
          .animate-aurora-4,
          .animate-float-slow,
          .animate-float-medium,
          .animate-float-fast {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  )
}
