"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
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
/*   APPLY PAGE — Part A: Data, Hooks, Background Effects, UI Atoms         */
/*   ~3500 lines of pure visual excellence                                  */
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
/*  HOOK 1: useInView — Intersection Observer                        */
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
/*  HOOK 2: useTilt — 3D Card Tilt on Mouse Move (Enhanced)          */
/* ═══════════════════════════════════════════════════════════════════ */
function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  const frameRef = useRef<number>(0)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    targetRef.current = { x, y }

    // Smooth interpolation via rAF
    const animate = () => {
      const cx = currentRef.current.x
      const cy = currentRef.current.y
      const tx = targetRef.current.x
      const ty = targetRef.current.y
      currentRef.current.x += (tx - cx) * 0.15
      currentRef.current.y += (ty - cy) * 0.15

      if (ref.current) {
        ref.current.style.transform = `perspective(800px) rotateY(${currentRef.current.x * 8}deg) rotateX(${-currentRef.current.y * 8}deg) scale(1.02)`
        const shine = ref.current.querySelector("[data-shine]") as HTMLElement
        if (shine) {
          shine.style.opacity = "1"
          shine.style.background = `radial-gradient(circle at ${(currentRef.current.x + 0.5) * 100}% ${(currentRef.current.y + 0.5) * 100}%, rgba(255,255,255,0.1), transparent 60%)`
        }
        const glow = ref.current.querySelector("[data-glow]") as HTMLElement
        if (glow) {
          glow.style.opacity = "1"
          glow.style.background = `radial-gradient(600px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(239,111,41,0.07), transparent 40%)`
        }
      }

      if (Math.abs(tx - currentRef.current.x) > 0.001 || Math.abs(ty - currentRef.current.y) > 0.001) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(animate)
  }, [ref])

  const handleLeave = useCallback(() => {
    if (!ref.current) return
    targetRef.current = { x: 0, y: 0 }
    const smoothReset = () => {
      const cx = currentRef.current.x
      const cy = currentRef.current.y
      currentRef.current.x += (0 - cx) * 0.1
      currentRef.current.y += (0 - cy) * 0.1
      if (ref.current) {
        ref.current.style.transform = `perspective(800px) rotateY(${currentRef.current.x * 8}deg) rotateX(${-currentRef.current.y * 8}deg) scale(1)`
      }
      if (Math.abs(currentRef.current.x) > 0.001 || Math.abs(currentRef.current.y) > 0.001) {
        frameRef.current = requestAnimationFrame(smoothReset)
      } else {
        if (ref.current) {
          ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)"
        }
      }
    }
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(smoothReset)

    const shine = ref.current.querySelector("[data-shine]") as HTMLElement
    if (shine) shine.style.opacity = "0"
    const glow = ref.current.querySelector("[data-glow]") as HTMLElement
    if (glow) glow.style.opacity = "0"
  }, [ref])

  return { onMouseMove: handleMove, onMouseLeave: handleLeave }
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  HOOK 3: useMousePosition — Global Mouse Tracking (NEW)           */
/* ═══════════════════════════════════════════════════════════════════ */
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let rAF = 0
    let mx = 0
    let my = 0
    const handler = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }
    const update = () => {
      setPos(prev => {
        const nx = prev.x + (mx - prev.x) * 0.12
        const ny = prev.y + (my - prev.y) * 0.12
        return { x: nx, y: ny }
      })
      rAF = requestAnimationFrame(update)
    }
    window.addEventListener("mousemove", handler, { passive: true })
    rAF = requestAnimationFrame(update)
    return () => {
      window.removeEventListener("mousemove", handler)
      cancelAnimationFrame(rAF)
    }
  }, [])

  return pos
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  HOOK 4: useSmoothScroll — Scroll-linked Animations (NEW)         */
/* ═══════════════════════════════════════════════════════════════════ */
function useSmoothScroll() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let rAF = 0
    let targetY = 0

    const handler = () => {
      targetY = window.scrollY
    }

    const update = () => {
      setScrollY(prev => {
        const next = prev + (targetY - prev) * 0.08
        return Math.abs(next - prev) < 0.5 ? targetY : next
      })
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docH > 0 ? targetY / docH : 0)
      rAF = requestAnimationFrame(update)
    }

    window.addEventListener("scroll", handler, { passive: true })
    rAF = requestAnimationFrame(update)
    return () => {
      window.removeEventListener("scroll", handler)
      cancelAnimationFrame(rAF)
    }
  }, [])

  return { scrollY, scrollProgress }
}


/* ═══════════════════════════════════════════════════════════════════ */
/*                                                                    */
/*    BACKGROUND EFFECTS                                              */
/*    Stunning visual layers that compose the ambient atmosphere      */
/*                                                                    */
/* ═══════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 1: GridBackground — Enhanced 3D Perspective Grid               */
/* ═══════════════════════════════════════════════════════════════════ */
function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let frame = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const vanishY = canvas.height * 0.25
      const gridSpacing = 60
      const rows = 30
      const cols = 24
      const halfCols = cols / 2

      // Draw perspective grid lines from vanishing point
      for (let i = -halfCols; i <= halfCols; i++) {
        const bottomX = cx + i * gridSpacing
        const progress = Math.abs(i) / halfCols
        const alpha = 0.025 * (1 - progress * 0.6)

        ctx.beginPath()
        ctx.moveTo(cx, vanishY)
        ctx.lineTo(bottomX, canvas.height)
        ctx.strokeStyle = `rgba(239, 111, 41, ${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Horizontal lines with perspective spacing
      for (let i = 0; i < rows; i++) {
        const t = i / rows
        const y = vanishY + (canvas.height - vanishY) * (t * t) // quadratic for perspective
        const spread = (y - vanishY) / (canvas.height - vanishY)
        const leftX = cx - halfCols * gridSpacing * spread
        const rightX = cx + halfCols * gridSpacing * spread
        const alpha = 0.02 * spread

        ctx.beginPath()
        ctx.moveTo(leftX, y)
        ctx.lineTo(rightX, y)
        ctx.strokeStyle = `rgba(239, 111, 41, ${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Intersection dots that pulse
      const pulsePhase = frame * 0.02
      for (let row = 0; row < rows; row += 3) {
        const t = row / rows
        const y = vanishY + (canvas.height - vanishY) * (t * t)
        const spread = (y - vanishY) / (canvas.height - vanishY)

        for (let col = -halfCols; col <= halfCols; col += 3) {
          const x = cx + col * gridSpacing * spread
          const pulse = 0.5 + 0.5 * Math.sin(pulsePhase + row * 0.3 + col * 0.2)
          const dotAlpha = 0.03 * spread * pulse

          ctx.beginPath()
          ctx.arc(x, y, 1.5 * pulse + 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(239, 111, 41, ${dotAlpha})`
          ctx.fill()
        }
      }

      // Scan line moving across the grid
      const scanProgress = (frame * 0.003) % 1
      const scanY = vanishY + (canvas.height - vanishY) * (scanProgress * scanProgress)
      const scanSpread = (scanY - vanishY) / (canvas.height - vanishY)
      const scanLeft = cx - halfCols * gridSpacing * scanSpread
      const scanRight = cx + halfCols * gridSpacing * scanSpread

      const scanGrad = ctx.createLinearGradient(scanLeft, scanY, scanRight, scanY)
      scanGrad.addColorStop(0, "rgba(239, 111, 41, 0)")
      scanGrad.addColorStop(0.3, "rgba(239, 111, 41, 0.06)")
      scanGrad.addColorStop(0.5, "rgba(239, 111, 41, 0.1)")
      scanGrad.addColorStop(0.7, "rgba(239, 111, 41, 0.06)")
      scanGrad.addColorStop(1, "rgba(239, 111, 41, 0)")

      ctx.beginPath()
      ctx.moveTo(scanLeft, scanY)
      ctx.lineTo(scanRight, scanY)
      ctx.strokeStyle = scanGrad
      ctx.lineWidth = 2
      ctx.stroke()

      // Radial fade at center
      const fadeGrad = ctx.createRadialGradient(cx, canvas.height * 0.3, 0, cx, canvas.height * 0.3, canvas.width * 0.6)
      fadeGrad.addColorStop(0, "rgba(10, 10, 10, 0)")
      fadeGrad.addColorStop(1, "rgba(10, 10, 10, 1)")
      ctx.fillStyle = fadeGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

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
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 2: AuroraMesh — Enhanced 5-Layer Aurora                       */
/* ═══════════════════════════════════════════════════════════════════ */
function AuroraMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orange glow — large sweep */}
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #EF6F29 0%, transparent 70%)",
          animation: "aurora-drift-1 18s ease-in-out infinite alternate",
        }} />
      {/* Purple accent — counter-rotation */}
      <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
          animation: "aurora-drift-2 22s ease-in-out infinite alternate",
        }} />
      {/* Cyan accent — mid-left float */}
      <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
          animation: "aurora-drift-3 16s ease-in-out infinite alternate",
        }} />
      {/* Deep blue — right side */}
      <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full opacity-[0.035]"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          animation: "aurora-drift-4 20s ease-in-out infinite alternate",
        }} />
      {/* NEW: Rose / magenta bloom — bottom center */}
      <div className="absolute bottom-[-15%] left-[25%] w-[55%] h-[55%] rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(ellipse 120% 80%, #ec4899 0%, #a855f7 40%, transparent 70%)",
          animation: "aurora-drift-5 25s ease-in-out infinite alternate",
        }} />

      {/* Inline keyframes for aurora movement */}
      <style jsx>{`
        @keyframes aurora-drift-1 {
          0% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(10%, 5%) scale(1.1); }
          50% { transform: translate(5%, -8%) scale(0.95); }
          75% { transform: translate(-5%, 3%) scale(1.05); }
          100% { transform: translate(-8%, -5%) scale(1); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
          33% { transform: translate(-12%, 8%) scale(1.15) rotate(5deg); }
          66% { transform: translate(6%, -4%) scale(0.9) rotate(-3deg); }
          100% { transform: translate(8%, 6%) scale(1.05) rotate(2deg); }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translate(0%, 0%) scale(1); }
          50% { transform: translate(15%, -10%) scale(1.2); }
          100% { transform: translate(-5%, 8%) scale(0.9); }
        }
        @keyframes aurora-drift-4 {
          0% { transform: translate(0%, 0%) scale(1); }
          40% { transform: translate(-8%, 12%) scale(1.1); }
          80% { transform: translate(10%, -6%) scale(0.95); }
          100% { transform: translate(-3%, 4%) scale(1.05); }
        }
        @keyframes aurora-drift-5 {
          0% { transform: translate(0%, 0%) scale(1); opacity: 0.03; }
          30% { transform: translate(8%, -8%) scale(1.15); opacity: 0.045; }
          60% { transform: translate(-10%, 5%) scale(0.95); opacity: 0.025; }
          100% { transform: translate(5%, 10%) scale(1.08); opacity: 0.035; }
        }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 3: ParticleField — Enhanced Canvas with 150 Particles         */
/* ═══════════════════════════════════════════════════════════════════ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePosRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const colors = ["#EF6F29", "#FF8C42", "#a855f7", "#3b82f6", "#22c55e", "#06b6d4", "#ec4899", "#eab308"]

    type Particle = {
      x: number; y: number; vx: number; vy: number
      r: number; alpha: number; color: string
      baseAlpha: number; pulseSpeed: number; pulsePhase: number
      category: number // 0=orange, 1=purple, 2=blue, 3=green, 4=misc
    }

    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const handler = (e: MouseEvent) => { mousePosRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener("mousemove", handler, { passive: true })

    // Create 150 particles
    for (let i = 0; i < 150; i++) {
      const colorIdx = Math.floor(Math.random() * colors.length)
      const baseAlpha = Math.random() * 0.35 + 0.05
      particles.push({
        x: Math.random() * (canvas.width || 1920),
        y: Math.random() * (canvas.height || 1080),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2.5 + 0.4,
        alpha: baseAlpha,
        baseAlpha,
        color: colors[colorIdx],
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
        category: colorIdx % 5,
      })
    }

    let frame = 0
    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mousePosRef.current.x
      const my = mousePosRef.current.y

      // Connection distance threshold
      const connectionDist = 130

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Pulse alpha
        p.alpha = p.baseAlpha + Math.sin(frame * p.pulseSpeed + p.pulsePhase) * p.baseAlpha * 0.5

        // Mouse interaction — REPEL on close proximity
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180 * 0.8
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Damping
        p.vx *= 0.982
        p.vy *= 0.982

        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        // Glow halo
        ctx.save()
        ctx.globalAlpha = p.alpha * 0.25
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.restore()

        // Mid glow
        ctx.save()
        ctx.globalAlpha = p.alpha * 0.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.restore()

        // Core particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Connections — only check next ~40 particles for performance
        const checkLimit = Math.min(particles.length, i + 40)
        for (let j = i + 1; j < checkLimit; j++) {
          const p2 = particles[j]
          const dx2 = p.x - p2.x
          const dy2 = p.y - p2.y
          const d = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d < connectionDist) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = (1 - d / connectionDist) * 0.07
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
/*  BG 4: FloatingShapes — Enhanced 10+ Geometric SVG Shapes         */
/* ═══════════════════════════════════════════════════════════════════ */
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hexagon 1 — top left */}
      <div className="absolute top-[15%] left-[8%] w-16 h-16 opacity-[0.04]"
        style={{ animation: "float-shape-1 28s ease-in-out infinite" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#EF6F29" strokeWidth="1.5" />
        </svg>
      </div>
      {/* Triangle — right */}
      <div className="absolute top-[35%] right-[5%] w-20 h-20 opacity-[0.03]"
        style={{ animation: "float-shape-2 24s ease-in-out infinite", transform: "rotate(12deg)" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="#a855f7" strokeWidth="1.5" />
        </svg>
      </div>
      {/* Circle — left mid */}
      <div className="absolute top-[60%] left-[3%] w-12 h-12 opacity-[0.04]"
        style={{ animation: "float-shape-3 20s ease-in-out infinite" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        </svg>
      </div>
      {/* Diamond — bottom right */}
      <div className="absolute top-[75%] right-[12%] w-14 h-14 opacity-[0.03]"
        style={{ animation: "float-shape-4 26s ease-in-out infinite", transform: "rotate(45deg)" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        </svg>
      </div>
      {/* Cross — top right quadrant */}
      <div className="absolute top-[20%] right-[25%] w-10 h-10 opacity-[0.03]"
        style={{ animation: "float-shape-5 22s ease-in-out infinite" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <line x1="50" y1="10" x2="50" y2="90" stroke="#ec4899" strokeWidth="2" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#ec4899" strokeWidth="2" />
        </svg>
      </div>
      {/* Dot grid pattern */}
      <div className="absolute top-[45%] left-[20%] w-24 h-24 opacity-[0.02]"
        style={{ animation: "float-shape-6 30s ease-in-out infinite" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[0, 25, 50, 75].map(x => [0, 25, 50, 75].map(y => (
            <circle key={`${x}-${y}`} cx={x + 12} cy={y + 12} r="2" fill="#EF6F29" />
          )))}
        </svg>
      </div>
      {/* Pentagon — mid right */}
      <div className="absolute top-[50%] right-[8%] w-18 h-18 opacity-[0.025]"
        style={{ animation: "float-shape-7 32s ease-in-out infinite" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ width: 72, height: 72 }}>
          <polygon points="50,5 97,38 79,92 21,92 3,38" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
        </svg>
      </div>
      {/* DNA Helix 1 — left side */}
      <div className="absolute top-[10%] left-[30%] w-8 h-32 opacity-[0.025]"
        style={{ animation: "float-shape-8 35s ease-in-out infinite" }}>
        <svg viewBox="0 0 40 160" className="w-full h-full">
          <path d="M5,0 Q35,20 5,40 Q35,60 5,80 Q35,100 5,120 Q35,140 5,160" fill="none" stroke="#eab308" strokeWidth="1.5" />
          <path d="M35,0 Q5,20 35,40 Q5,60 35,80 Q5,100 35,120 Q5,140 35,160" fill="none" stroke="#eab308" strokeWidth="1.5" />
          {[20, 60, 100, 140].map(y => (
            <line key={y} x1="5" y1={y} x2="35" y2={y} stroke="#eab308" strokeWidth="0.8" opacity="0.5" />
          ))}
        </svg>
      </div>
      {/* Hexagon 2 — bottom left */}
      <div className="absolute bottom-[15%] left-[15%] w-20 h-20 opacity-[0.025]"
        style={{ animation: "float-shape-9 27s ease-in-out infinite" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#f97316" strokeWidth="1" />
          <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="#f97316" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>
      {/* Concentric circles — top center */}
      <div className="absolute top-[8%] left-[50%] w-16 h-16 opacity-[0.02]"
        style={{ animation: "float-shape-10 33s ease-in-out infinite" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="1" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
        </svg>
      </div>
      {/* DNA Helix 2 — right side */}
      <div className="absolute bottom-[25%] right-[20%] w-6 h-28 opacity-[0.02]"
        style={{ animation: "float-shape-11 29s ease-in-out infinite" }}>
        <svg viewBox="0 0 30 140" className="w-full h-full">
          <path d="M3,0 Q27,17.5 3,35 Q27,52.5 3,70 Q27,87.5 3,105 Q27,122.5 3,140" fill="none" stroke="#22c55e" strokeWidth="1.2" />
          <path d="M27,0 Q3,17.5 27,35 Q3,52.5 27,70 Q3,87.5 27,105 Q3,122.5 27,140" fill="none" stroke="#22c55e" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Keyframes for floating shapes */}
      <style jsx>{`
        @keyframes float-shape-1 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-25px) rotate(8deg); } }
        @keyframes float-shape-2 { 0%, 100% { transform: translateY(0) rotate(12deg); } 50% { transform: translateY(-30px) rotate(-5deg); } }
        @keyframes float-shape-3 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(15deg); } }
        @keyframes float-shape-4 { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-28px) rotate(60deg); } }
        @keyframes float-shape-5 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(-10deg); } }
        @keyframes float-shape-6 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(10px, -15px); } 66% { transform: translate(-8px, 10px); } }
        @keyframes float-shape-7 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-22px) rotate(12deg); } }
        @keyframes float-shape-8 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, -20px) rotate(5deg); } }
        @keyframes float-shape-9 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(-8deg); } }
        @keyframes float-shape-10 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-12px, 15px) scale(1.1); } }
        @keyframes float-shape-11 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25px); } }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 5: CyberGrid3D — Canvas 3D Perspective Grid Floor (NEW)      */
/* ═══════════════════════════════════════════════════════════════════ */
function CyberGrid3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let frame = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 1.5 : 1)
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 1.5 : 1)
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Grid parameters
      const horizon = h * 0.35
      const spacing = 50
      const depth = 40 // number of depth lines
      const numVertical = 28

      // Scan line position cycling
      const scanSpeed = 0.004
      const scanZ = (frame * scanSpeed) % 1

      // Draw depth lines (horizontal in perspective)
      for (let i = 0; i < depth; i++) {
        let z = (i / depth + scanZ) % 1
        const y = horizon + (h - horizon) * z * z
        const perspectiveScale = z
        const halfWidth = (w * 0.8) * perspectiveScale

        const alpha = z * 0.04

        ctx.beginPath()
        ctx.moveTo(w / 2 - halfWidth, y)
        ctx.lineTo(w / 2 + halfWidth, y)
        ctx.strokeStyle = `rgba(239, 111, 41, ${alpha})`
        ctx.lineWidth = z < 0.1 ? 0.3 : 0.6
        ctx.stroke()
      }

      // Draw vertical lines converging to horizon center
      for (let i = -numVertical / 2; i <= numVertical / 2; i++) {
        const bottomX = w / 2 + i * spacing
        const topX = w / 2
        const progress = Math.abs(i) / (numVertical / 2)
        const alpha = 0.03 * (1 - progress * 0.5)

        ctx.beginPath()
        ctx.moveTo(topX, horizon)
        ctx.lineTo(bottomX, h)
        ctx.strokeStyle = `rgba(239, 111, 41, ${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Neon glow at horizon line
      const horizonGrad = ctx.createLinearGradient(0, horizon - 20, 0, horizon + 20)
      horizonGrad.addColorStop(0, "rgba(239, 111, 41, 0)")
      horizonGrad.addColorStop(0.4, "rgba(239, 111, 41, 0.03)")
      horizonGrad.addColorStop(0.5, "rgba(239, 111, 41, 0.06)")
      horizonGrad.addColorStop(0.6, "rgba(168, 85, 247, 0.03)")
      horizonGrad.addColorStop(1, "rgba(168, 85, 247, 0)")
      ctx.fillStyle = horizonGrad
      ctx.fillRect(0, horizon - 20, w, 40)

      // Bright scan line running across the floor
      const scanLineZ = (frame * 0.005) % 1
      const scanLineY = horizon + (h - horizon) * scanLineZ * scanLineZ
      const scanLineSpread = (w * 0.8) * scanLineZ

      const scanGrad = ctx.createLinearGradient(w / 2 - scanLineSpread, 0, w / 2 + scanLineSpread, 0)
      scanGrad.addColorStop(0, "rgba(239, 111, 41, 0)")
      scanGrad.addColorStop(0.3, "rgba(239, 111, 41, 0.08)")
      scanGrad.addColorStop(0.5, "rgba(239, 111, 41, 0.15)")
      scanGrad.addColorStop(0.7, "rgba(239, 111, 41, 0.08)")
      scanGrad.addColorStop(1, "rgba(239, 111, 41, 0)")

      ctx.beginPath()
      ctx.moveTo(w / 2 - scanLineSpread, scanLineY)
      ctx.lineTo(w / 2 + scanLineSpread, scanLineY)
      ctx.strokeStyle = scanGrad
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Glow bloom behind scan line
      ctx.save()
      ctx.globalAlpha = 0.03
      ctx.beginPath()
      ctx.ellipse(w / 2, scanLineY, scanLineSpread * 0.8, 15, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#EF6F29"
      ctx.fill()
      ctx.restore()

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
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", opacity: 0.6 }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 6: NeuralNetwork — Canvas Neural Network Viz (NEW)            */
/* ═══════════════════════════════════════════════════════════════════ */
function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePosRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let frame = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const handler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    window.addEventListener("mousemove", handler, { passive: true })

    // Build network layers
    type Node = { x: number; y: number; layer: number; activation: number; baseActivation: number }
    type Connection = { from: number; to: number; weight: number }
    type DataDot = { progress: number; connectionIdx: number; speed: number; color: string }

    const layers = [5, 8, 10, 8, 5]
    const nodes: Node[] = []
    const connections: Connection[] = []
    const dataDots: DataDot[] = []
    const dotColors = ["#EF6F29", "#a855f7", "#3b82f6", "#22c55e", "#06b6d4"]

    // Create nodes
    const totalLayers = layers.length
    for (let l = 0; l < totalLayers; l++) {
      const count = layers[l]
      const layerX = (canvas.width * 0.15) + (canvas.width * 0.7) * (l / (totalLayers - 1))
      for (let n = 0; n < count; n++) {
        const layerH = canvas.height * 0.6
        const startY = (canvas.height - layerH) / 2
        const nodeY = startY + layerH * ((n + 0.5) / count)
        nodes.push({
          x: layerX,
          y: nodeY,
          layer: l,
          activation: Math.random() * 0.3,
          baseActivation: Math.random() * 0.3,
        })
      }
    }

    // Create connections between adjacent layers
    let nodeOffset = 0
    for (let l = 0; l < totalLayers - 1; l++) {
      const thisCount = layers[l]
      const nextCount = layers[l + 1]
      const nextOffset = nodeOffset + thisCount
      for (let a = 0; a < thisCount; a++) {
        for (let b = 0; b < nextCount; b++) {
          // Skip some connections for visual clarity
          if (Math.random() > 0.6) continue
          connections.push({
            from: nodeOffset + a,
            to: nextOffset + b,
            weight: Math.random(),
          })
        }
      }
      nodeOffset += thisCount
    }

    // Spawn initial data dots
    const spawnDot = () => {
      if (connections.length === 0) return
      dataDots.push({
        progress: 0,
        connectionIdx: Math.floor(Math.random() * connections.length),
        speed: 0.005 + Math.random() * 0.01,
        color: dotColors[Math.floor(Math.random() * dotColors.length)],
      })
    }
    for (let i = 0; i < 15; i++) {
      const d: DataDot = {
        progress: Math.random(),
        connectionIdx: Math.floor(Math.random() * connections.length),
        speed: 0.005 + Math.random() * 0.01,
        color: dotColors[Math.floor(Math.random() * dotColors.length)],
      }
      dataDots.push(d)
    }

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mx = mousePosRef.current.x
      const my = mousePosRef.current.y

      // Update node activations based on mouse proximity
      for (const node of nodes) {
        const dx = node.x - mx
        const dy = node.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - dist / 200)
        node.activation = node.baseActivation + proximity * 0.7 + Math.sin(frame * 0.03 + node.x * 0.01) * 0.1
      }

      // Draw connections
      for (const conn of connections) {
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]
        if (!fromNode || !toNode) continue

        const avgActivation = (fromNode.activation + toNode.activation) / 2
        const alpha = 0.02 + avgActivation * 0.04

        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = `rgba(239, 111, 41, ${alpha})`
        ctx.lineWidth = 0.5 + avgActivation * 0.5
        ctx.stroke()
      }

      // Draw and update data dots
      for (let i = dataDots.length - 1; i >= 0; i--) {
        const dot = dataDots[i]
        dot.progress += dot.speed

        if (dot.progress >= 1) {
          dataDots.splice(i, 1)
          spawnDot()
          continue
        }

        const conn = connections[dot.connectionIdx]
        if (!conn) continue
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]
        if (!fromNode || !toNode) continue

        const x = fromNode.x + (toNode.x - fromNode.x) * dot.progress
        const y = fromNode.y + (toNode.y - fromNode.y) * dot.progress

        // Glow
        ctx.save()
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = dot.color
        ctx.fill()
        ctx.restore()

        // Core
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = dot.color
        ctx.globalAlpha = 0.8
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Draw nodes
      for (const node of nodes) {
        const radius = 3 + node.activation * 3
        const alpha = 0.15 + node.activation * 0.5

        // Outer glow
        ctx.save()
        ctx.globalAlpha = alpha * 0.3
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = "#EF6F29"
        ctx.fill()
        ctx.restore()

        // Core node
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 111, 41, ${alpha})`
        ctx.fill()

        // Border ring
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 1, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(239, 111, 41, ${alpha * 0.4})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

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
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", opacity: 0.5 }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 7: WaveformVisualizer — Animated Bars at Bottom (NEW)         */
/* ═══════════════════════════════════════════════════════════════════ */
function WaveformVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let frame = 0
    let scrollFactor = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const scrollHandler = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      scrollFactor = docH > 0 ? window.scrollY / docH : 0
    }
    window.addEventListener("scroll", scrollHandler, { passive: true })
    scrollHandler()

    const barCount = 80
    const barWidth = 3
    const gap = 2

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const totalBarWidth = barCount * (barWidth + gap)
      const startX = (canvas.width - totalBarWidth) / 2

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap)
        const normalI = i / barCount

        // Multiple sine waves combined for waveform shape
        const wave1 = Math.sin(normalI * Math.PI * 4 + frame * 0.03) * 0.3
        const wave2 = Math.sin(normalI * Math.PI * 2 + frame * 0.02 + 1) * 0.4
        const wave3 = Math.sin(normalI * Math.PI * 6 + frame * 0.05 + 2) * 0.15
        const scrollWave = Math.sin(normalI * Math.PI * 3 + scrollFactor * Math.PI * 8) * scrollFactor * 0.4

        const amplitude = Math.abs(wave1 + wave2 + wave3 + scrollWave)
        const height = Math.max(2, amplitude * canvas.height * 0.8)

        // Gradient color based on position
        const r = Math.floor(239 - normalI * 80)
        const g = Math.floor(111 + normalI * 50)
        const b = Math.floor(41 + normalI * 180)
        const alpha = 0.08 + amplitude * 0.12

        // Bar
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.fillRect(x, canvas.height - height, barWidth, height)

        // Top glow cap
        ctx.save()
        ctx.globalAlpha = alpha * 0.6
        ctx.beginPath()
        ctx.arc(x + barWidth / 2, canvas.height - height, barWidth, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fill()
        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("scroll", scrollHandler)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 right-0 pointer-events-none"
      style={{ width: "100%", height: "120px", opacity: 0.5 }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 8: CircuitBoard — SVG Animated Circuit Traces (NEW)           */
/* ═══════════════════════════════════════════════════════════════════ */
function CircuitBoard() {
  const [activePaths, setActivePaths] = useState<number[]>([])

  useEffect(() => {
    // Cycle through different path groups
    let idx = 0
    const interval = setInterval(() => {
      const count = 3
      const paths: number[] = []
      for (let i = 0; i < count; i++) {
        paths.push((idx + i) % 12)
      }
      setActivePaths(paths)
      idx = (idx + 1) % 12
    }, 800)
    return () => clearInterval(interval)
  }, [])

  // Generate circuit paths
  const paths = useMemo(() => {
    const p = []
    const nodePositions = [
      { x: 10, y: 20 }, { x: 25, y: 15 }, { x: 40, y: 30 }, { x: 55, y: 10 },
      { x: 70, y: 25 }, { x: 85, y: 18 }, { x: 15, y: 50 }, { x: 30, y: 55 },
      { x: 50, y: 45 }, { x: 65, y: 55 }, { x: 80, y: 48 }, { x: 90, y: 40 },
      { x: 20, y: 75 }, { x: 35, y: 80 }, { x: 55, y: 70 }, { x: 75, y: 78 },
      { x: 45, y: 90 }, { x: 60, y: 85 },
    ]

    // Connect nodes with right-angle traces
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
      [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
      [0, 6], [2, 8],
    ]

    for (const [fromIdx, toIdx] of connections) {
      const from = nodePositions[fromIdx]
      const to = nodePositions[toIdx]
      if (!from || !to) continue

      // Create L-shaped path
      const midX = from.x + (to.x - from.x) * 0.5
      const path = `M${from.x},${from.y} L${midX},${from.y} L${midX},${to.y} L${to.x},${to.y}`
      p.push({ d: path, from: fromIdx, to: toIdx })
    }

    return { paths: p, nodes: nodePositions }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Circuit traces */}
        {paths.paths.map((path, i) => {
          const isActive = activePaths.includes(i)
          return (
            <g key={i}>
              <path
                d={path.d}
                fill="none"
                stroke={isActive ? "#EF6F29" : "#ffffff"}
                strokeWidth="0.3"
                opacity={isActive ? 1 : 0.3}
                style={{ transition: "opacity 0.5s ease, stroke 0.5s ease" }}
              />
              {isActive && (
                <path
                  d={path.d}
                  fill="none"
                  stroke="#EF6F29"
                  strokeWidth="0.6"
                  opacity={0.6}
                  strokeDasharray="3,97"
                  style={{
                    animation: `circuit-flow-${i % 3} 1.5s linear infinite`,
                  }}
                />
              )}
            </g>
          )
        })}

        {/* Circuit nodes */}
        {paths.nodes.map((node, i) => {
          const isConnected = activePaths.some(
            pIdx => paths.paths[pIdx]?.from === i || paths.paths[pIdx]?.to === i
          )
          return (
            <g key={`node-${i}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isConnected ? 1.2 : 0.6}
                fill={isConnected ? "#EF6F29" : "#ffffff"}
                opacity={isConnected ? 0.8 : 0.3}
                style={{ transition: "all 0.5s ease" }}
              />
              {isConnected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="2.5"
                  fill="none"
                  stroke="#EF6F29"
                  strokeWidth="0.2"
                  opacity={0.4}
                  style={{ animation: "circuit-pulse 1s ease-out infinite" }}
                />
              )}
            </g>
          )
        })}
      </svg>

      <style jsx>{`
        @keyframes circuit-flow-0 { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
        @keyframes circuit-flow-1 { 0% { stroke-dashoffset: 80; } 100% { stroke-dashoffset: -20; } }
        @keyframes circuit-flow-2 { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: -40; } }
        @keyframes circuit-pulse { 0% { r: 1; opacity: 0.6; } 100% { r: 4; opacity: 0; } }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 9: DataStream — Matrix-like Hex Data Columns (NEW)            */
/* ═══════════════════════════════════════════════════════════════════ */
function DataStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const hexChars = "0123456789ABCDEF"
    const binChars = "01"
    const fontSize = 11
    const columnWidth = 22
    const columns = Math.floor(canvas.width / columnWidth)

    type Column = {
      chars: string[]
      speed: number
      offset: number
      isHex: boolean
      color: string
      alpha: number
    }

    const columnData: Column[] = []
    const columnColors = ["#EF6F29", "#a855f7", "#3b82f6", "#22c55e", "#06b6d4", "#ffffff"]

    for (let i = 0; i < columns; i++) {
      const isHex = Math.random() > 0.4
      const charSet = isHex ? hexChars : binChars
      const charCount = Math.floor(canvas.height / fontSize) + 5
      const chars: string[] = []
      for (let j = 0; j < charCount; j++) {
        if (isHex) {
          chars.push(charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)])
        } else {
          chars.push(charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)])
        }
      }
      columnData.push({
        chars,
        speed: 0.3 + Math.random() * 0.8,
        offset: Math.random() * canvas.height,
        isHex,
        color: columnColors[Math.floor(Math.random() * columnColors.length)],
        alpha: 0.02 + Math.random() * 0.03,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < columnData.length; i++) {
        const col = columnData[i]
        col.offset += col.speed

        if (col.offset > fontSize * 2) {
          col.offset -= fontSize
          // Shift chars and add new one at top
          col.chars.pop()
          const charSet = col.isHex ? hexChars : binChars
          if (col.isHex) {
            col.chars.unshift(charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)])
          } else {
            col.chars.unshift(charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)] + charSet[Math.floor(Math.random() * charSet.length)])
          }
        }

        const x = i * columnWidth
        for (let j = 0; j < col.chars.length; j++) {
          const y = j * fontSize + col.offset
          if (y < -fontSize || y > canvas.height + fontSize) continue

          // Fade at edges
          const edgeFade = Math.min(
            y / (canvas.height * 0.2),
            (canvas.height - y) / (canvas.height * 0.2),
            1
          )
          const alpha = col.alpha * Math.max(0, edgeFade)

          // First char slightly brighter
          const charAlpha = j === 0 ? alpha * 2 : alpha

          ctx.fillStyle = col.color
          ctx.globalAlpha = charAlpha
          ctx.fillText(col.chars[j], x, y)
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", opacity: 0.6 }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 10: SmokeEffect — Canvas Perlin Noise Fog (NEW)               */
/* ═══════════════════════════════════════════════════════════════════ */
function SmokeEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let frame = 0

    // Simple Perlin-like noise using sine combinations
    const noise = (x: number, y: number, t: number) => {
      const v1 = Math.sin(x * 0.01 + t * 0.3) * Math.cos(y * 0.012 + t * 0.2)
      const v2 = Math.sin(x * 0.02 - t * 0.15) * Math.sin(y * 0.018 + t * 0.25)
      const v3 = Math.cos(x * 0.008 + y * 0.005 + t * 0.1)
      const v4 = Math.sin((x + y) * 0.006 + t * 0.18) * Math.cos(x * 0.015 - t * 0.08)
      return (v1 + v2 + v3 + v4) * 0.25
    }

    const resize = () => {
      // Use lower resolution for performance
      canvas.width = Math.floor(canvas.offsetWidth / 4)
      canvas.height = Math.floor(canvas.offsetHeight / 4)
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      frame++
      const t = frame * 0.008
      const w = canvas.width
      const h = canvas.height

      const imageData = ctx.createImageData(w, h)
      const data = imageData.data

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n = noise(x, y, t)
          const val = Math.max(0, n) * 255

          const idx = (y * w + x) * 4
          // Very subtle orange-tinted smoke
          data[idx] = Math.floor(val * 0.94)     // R (EF = 239)
          data[idx + 1] = Math.floor(val * 0.44) // G (6F = 111)
          data[idx + 2] = Math.floor(val * 0.16) // B (29 = 41)
          data[idx + 3] = Math.floor(val * 0.04) // A — very subtle: 0.03-0.05 range
        }
      }

      ctx.putImageData(imageData, 0, 0)
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
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", imageRendering: "auto", filter: "blur(8px)" }}
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  BG 11: NoiseOverlay — SVG Noise Texture Overlay                  */
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
/*                                                                    */
/*    UI ATOMS                                                        */
/*    Reusable micro-components for building sections                 */
/*                                                                    */
/* ═══════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 1: SectionDivider — Enhanced Gradient Line with Pulse       */
/* ═══════════════════════════════════════════════════════════════════ */
function SectionDivider({ color = "#EF6F29" }: { color?: string }) {
  return (
    <div className="relative py-1 overflow-hidden">
      {/* Base line */}
      <div className="h-px w-full" style={{
        background: `linear-gradient(90deg, transparent, ${color}30, ${color}50, ${color}30, transparent)`,
      }} />
      {/* Blur glow */}
      <div className="absolute inset-0 h-px blur-sm" style={{
        background: `linear-gradient(90deg, transparent, ${color}20, ${color}30, ${color}20, transparent)`,
      }} />
      {/* Animated glow pulse traveling along the line */}
      <div className="absolute top-0 h-px w-[20%]" style={{
        background: `linear-gradient(90deg, transparent, ${color}80, ${color}, ${color}80, transparent)`,
        animation: "divider-pulse 4s ease-in-out infinite",
        filter: `drop-shadow(0 0 6px ${color})`,
      }} />
      <style jsx>{`
        @keyframes divider-pulse {
          0% { left: -20%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 2: SectionLabel — Enhanced with Micro-animations            */
/* ═══════════════════════════════════════════════════════════════════ */
function SectionLabel({ label, color = "primary" }: { label: string; color?: string }) {
  return (
    <div className="group/label flex items-center justify-center gap-4 mb-4 cursor-default">
      <div className="h-px flex-1 max-w-[80px] transition-all duration-500 group-hover/label:max-w-[120px]" style={{
        background: `linear-gradient(90deg, transparent, var(--color-${color}, #EF6F29) / 0.3)`,
      }} />
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
        <div className="relative overflow-hidden">
          {/* Animated border frame */}
          <div className="absolute inset-0 rounded-md border border-primary/0 group-hover/label:border-primary/20 transition-all duration-700" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary/70 transition-all duration-500 group-hover/label:tracking-[0.35em] group-hover/label:text-primary/90 px-1">
            {label}
          </span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>
      <div className="h-px flex-1 max-w-[80px] transition-all duration-500 group-hover/label:max-w-[120px]" style={{
        background: `linear-gradient(270deg, transparent, var(--color-${color}, #EF6F29) / 0.3)`,
      }} />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 3: Reveal — Enhanced Scroll-Reveal Wrapper                  */
/* ═══════════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  stagger = 0,
}: {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "scale" | "rotate"
  className?: string
  stagger?: number
}) {
  const { ref, inView } = useInView(0.15)

  const transforms: Record<string, string> = {
    up: "translateY(40px)",
    down: "translateY(-40px)",
    left: "translateX(40px)",
    right: "translateX(-40px)",
    scale: "scale(0.85)",
    rotate: "rotate(-5deg) scale(0.95)",
  }

  const totalDelay = delay + stagger

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) translateX(0) scale(1) rotate(0deg)" : transforms[direction],
        filter: inView ? "blur(0px)" : "blur(4px)",
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${totalDelay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${totalDelay}ms, filter 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${totalDelay}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 4: MagneticButton — Enhanced with Ripple & Glow             */
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
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current || disabled) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    // Stronger magnetic pull
    btnRef.current.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`
  }, [disabled])

  const handleLeave = useCallback(() => {
    if (!btnRef.current) return
    btnRef.current.style.transform = "translate(0, 0)"
    setIsHovered(false)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now(),
    })
    setTimeout(() => setRipple(null), 600)
    onClick?.()
  }, [onClick])

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      className={`relative overflow-hidden transition-transform duration-300 ease-out ${className}`}
      style={{ willChange: "transform" }}
    >
      {/* Hover glow */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none rounded-inherit opacity-50 transition-opacity duration-300"
          style={{ boxShadow: "inset 0 0 30px rgba(239, 111, 41, 0.1)" }} />
      )}
      {/* Ripple effect */}
      {ripple && (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100,
            background: "rgba(239, 111, 41, 0.25)",
            animation: "magnetic-ripple 0.6s ease-out forwards",
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
      <style jsx>{`
        @keyframes magnetic-ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </button>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 5: AnimatedNumber — Counter Animation                       */
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
/*  ATOM 6: GlitchText — Enhanced RGB Split with Auto-glitch         */
/* ═══════════════════════════════════════════════════════════════════ */
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false)

  // Occasional auto-glitch
  useEffect(() => {
    const trigger = () => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }
    const interval = setInterval(() => {
      if (Math.random() > 0.85) trigger()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsGlitching(true)}
      onMouseLeave={() => setIsGlitching(false)}
    >
      {/* Main text */}
      <span className="relative z-10">{text}</span>

      {/* Red channel offset */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          color: "#ff0000",
          opacity: isGlitching ? 0.7 : 0,
          transform: isGlitching ? "translate(-3px, -1px)" : "translate(0, 0)",
          transition: isGlitching ? "none" : "all 0.3s ease",
          clipPath: isGlitching ? "inset(10% 0 60% 0)" : "none",
          mixBlendMode: "screen",
        }}
        aria-hidden
      >{text}</span>

      {/* Cyan channel offset */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          color: "#00ffff",
          opacity: isGlitching ? 0.7 : 0,
          transform: isGlitching ? "translate(3px, 1px)" : "translate(0, 0)",
          transition: isGlitching ? "none" : "all 0.3s ease",
          clipPath: isGlitching ? "inset(40% 0 20% 0)" : "none",
          mixBlendMode: "screen",
        }}
        aria-hidden
      >{text}</span>

      {/* Blue shift for more drama */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          color: "#0044ff",
          opacity: isGlitching ? 0.4 : 0,
          transform: isGlitching ? "translate(1px, -2px)" : "translate(0, 0)",
          transition: isGlitching ? "none" : "all 0.3s ease",
          clipPath: isGlitching ? "inset(70% 0 0% 0)" : "none",
          mixBlendMode: "screen",
        }}
        aria-hidden
      >{text}</span>
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 7: TextScramble — Cyberpunk Text Decoder (NEW)              */
/* ═══════════════════════════════════════════════════════════════════ */
function TextScramble({ text, className = "", speed = 30 }: { text: string; className?: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("")
  const { ref, inView } = useInView(0.5)
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  useEffect(() => {
    if (!inView) return

    let current = Array(text.length).fill("")
    let resolved = 0
    let frameCount = 0

    const interval = setInterval(() => {
      frameCount++
      let output = ""

      for (let i = 0; i < text.length; i++) {
        if (i < resolved) {
          output += text[i]
        } else if (text[i] === " ") {
          output += " "
        } else {
          output += chars[Math.floor(Math.random() * chars.length)]
        }
      }

      setDisplayed(output)

      // Resolve characters one by one with cascading timing
      if (frameCount % 3 === 0 && resolved < text.length) {
        // Skip spaces
        while (resolved < text.length && text[resolved] === " ") resolved++
        resolved++
      }

      if (resolved >= text.length) {
        setDisplayed(text)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [inView, text, speed])

  return (
    <span ref={ref as unknown as React.RefObject<HTMLSpanElement>} className={`font-mono ${className}`}>
      {displayed || (inView ? "" : text)}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 8: NumberTicker — Slot Machine Style                        */
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
/*  ATOM 9: TypingText — Typing Animation for Headings               */
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
/*  ATOM 10: CodeMorphText — Character Cycling Cascade (NEW)         */
/* ═══════════════════════════════════════════════════════════════════ */
function CodeMorphText({ text, className = "" }: { text: string; className?: string }) {
  const [chars, setChars] = useState<string[]>(Array(text.length).fill(" "))
  const { ref, inView } = useInView(0.5)
  const morphChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%"

  useEffect(() => {
    if (!inView) return

    const settled = Array(text.length).fill(false)
    let frameCount = 0

    const interval = setInterval(() => {
      frameCount++
      const newChars = [...chars]
      let allDone = true

      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          newChars[i] = " "
          settled[i] = true
          continue
        }

        // Each character settles after a cascade delay
        const settleFrame = 4 + i * 3
        if (frameCount >= settleFrame) {
          newChars[i] = text[i]
          settled[i] = true
        } else {
          newChars[i] = morphChars[Math.floor(Math.random() * morphChars.length)]
          allDone = false
        }
      }

      setChars(newChars)

      if (allDone) {
        clearInterval(interval)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [inView, text])

  return (
    <span ref={ref as unknown as React.RefObject<HTMLSpanElement>} className={`font-mono ${className}`}>
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            color: c === text[i] ? undefined : "#EF6F29",
            transition: "color 0.3s ease",
          }}
        >
          {c}
        </span>
      ))}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 11: ScrollProgress — Enhanced with Glow and Percentage      */
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
      {/* Main bar */}
      <div
        className="h-full transition-[width] duration-150 relative"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #EF6F29, #a855f7, #3b82f6)",
          boxShadow: "0 0 10px rgba(239,111,41,0.5), 0 0 30px rgba(239,111,41,0.2)",
        }}
      >
        {/* Leading glow dot */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{
            background: "radial-gradient(circle, #EF6F29, transparent)",
            boxShadow: "0 0 8px #EF6F29, 0 0 20px rgba(239,111,41,0.5)",
          }}
        />
      </div>
      {/* Percentage indicator */}
      {progress > 3 && (
        <div
          className="absolute top-2 text-[9px] font-mono font-bold text-primary/50 transition-all duration-150"
          style={{ left: `${Math.min(progress, 96)}%`, transform: "translateX(-50%)" }}
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 12: CursorGlow — Enhanced Multi-Color Gradient              */
/* ═══════════════════════════════════════════════════════════════════ */
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const glow2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rAF = 0
    let mx = 0
    let my = 0
    let cx = 0
    let cy = 0
    let cx2 = 0
    let cy2 = 0

    const handler = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }

    const update = () => {
      // Primary glow — fast follow
      cx += (mx - cx) * 0.15
      cy += (my - cy) * 0.15
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${cx - 350}px, ${cy - 350}px)`
      }
      // Secondary glow — slower, trailing
      cx2 += (mx - cx2) * 0.06
      cy2 += (my - cy2) * 0.06
      if (glow2Ref.current) {
        glow2Ref.current.style.transform = `translate(${cx2 - 250}px, ${cy2 - 250}px)`
      }
      rAF = requestAnimationFrame(update)
    }

    window.addEventListener("mousemove", handler, { passive: true })
    rAF = requestAnimationFrame(update)
    return () => {
      window.removeEventListener("mousemove", handler)
      cancelAnimationFrame(rAF)
    }
  }, [])

  return (
    <>
      {/* Primary orange glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[700px] h-[700px] pointer-events-none z-[1] hidden lg:block"
        style={{
          background: "radial-gradient(circle, rgba(239,111,41,0.035) 0%, rgba(168,85,247,0.015) 40%, transparent 65%)",
          willChange: "transform",
        }}
      />
      {/* Secondary purple trail */}
      <div
        ref={glow2Ref}
        className="fixed top-0 left-0 w-[500px] h-[500px] pointer-events-none z-[1] hidden lg:block"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.02) 0%, rgba(59,130,246,0.01) 40%, transparent 60%)",
          willChange: "transform",
        }}
      />
    </>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 13: MouseTrail — Enhanced with Rainbow & Gravity            */
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
      vx: number; vy: number; color: string; life: number; hue: number
    }> = []

    let mouseX = 0, mouseY = 0
    let prevX = 0, prevY = 0
    let frame = 0
    let globalHue = 0

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    const handleMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener("mousemove", handleMove, { passive: true })

    const draw = () => {
      frame++
      globalHue = (globalHue + 0.5) % 360
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn particles based on speed
      const dx = mouseX - prevX
      const dy = mouseY - prevY
      const speed = Math.sqrt(dx * dx + dy * dy)

      if (speed > 2 && frame % 2 === 0) {
        const count = Math.min(Math.floor(speed / 6), 6)
        for (let i = 0; i < count; i++) {
          const hue = (globalHue + i * 30) % 360
          trails.push({
            x: mouseX + (Math.random() - 0.5) * 12,
            y: mouseY + (Math.random() - 0.5) * 12,
            alpha: 0.9,
            size: Math.random() * 3.5 + 1,
            vx: (Math.random() - 0.5) * 2.5 + dx * 0.06,
            vy: (Math.random() - 0.5) * 2.5 + dy * 0.06 - 0.8,
            color: `hsl(${hue}, 80%, 60%)`,
            life: 1,
            hue,
          })
        }
      }

      prevX = mouseX
      prevY = mouseY

      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i]
        t.life -= 0.018
        t.alpha = t.life * 0.6
        t.size *= 0.985
        t.x += t.vx
        t.y += t.vy
        t.vy += 0.04 // gravity
        t.vx *= 0.98

        if (t.life <= 0 || t.alpha <= 0) {
          trails.splice(i, 1)
          continue
        }

        // Glow
        ctx.save()
        ctx.globalAlpha = t.alpha * 0.25
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = t.color
        ctx.fill()
        ctx.restore()

        // Core
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2)
        ctx.fillStyle = t.color
        ctx.globalAlpha = t.alpha
        ctx.fill()

        // Bright center
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.globalAlpha = t.alpha * 0.5
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
/*  ATOM 14: CountdownBadge — Persistent Countdown Timer             */
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
/*  ATOM 15: Marquee — Enhanced Dual-Direction with Fade Edges       */
/* ═══════════════════════════════════════════════════════════════════ */
function Marquee() {
  const items = ["Developer", "Manager", "Support", "Media", "SEO", "Sales", "Remote", "Flexible", "Commission", "Growth"]
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className="relative overflow-hidden py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{
        background: "linear-gradient(90deg, #0a0a0a, transparent)",
      }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{
        background: "linear-gradient(270deg, #0a0a0a, transparent)",
      }} />

      {/* Forward marquee */}
      <div className="opacity-[0.15]">
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: "marquee-forward 40s linear infinite",
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <span key={i} className="mx-8 text-2xl font-black uppercase tracking-widest text-white/50">
              {item}
              <span className="mx-8 text-primary/50">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* Reverse marquee — slightly offset */}
      <div className="opacity-[0.08] mt-2">
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: "marquee-reverse 35s linear infinite",
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {[...items.reverse(), ...items, ...items].map((item, i) => (
            <span key={i} className="mx-6 text-lg font-bold uppercase tracking-[0.3em] text-white/40">
              {item}
              <span className="mx-6 text-primary/30">*</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-forward {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 16: BeamDivider — Enhanced Energy Beam with Sparks          */
/* ═══════════════════════════════════════════════════════════════════ */
function BeamDivider() {
  return (
    <div className="relative h-28 flex items-center justify-center overflow-hidden">
      {/* Vertical track */}
      <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

      {/* Main beam traveling down */}
      <div className="absolute w-px h-10 bg-primary/80 rounded-full"
        style={{
          boxShadow: "0 0 12px #EF6F29, 0 0 25px #EF6F29, 0 0 40px rgba(239,111,41,0.3)",
          animation: "beam-travel 2.5s ease-in-out infinite",
        }} />

      {/* Secondary beam — offset timing */}
      <div className="absolute w-px h-6 bg-[#a855f7]/60 rounded-full"
        style={{
          boxShadow: "0 0 8px #a855f7, 0 0 20px rgba(168,85,247,0.3)",
          animation: "beam-travel 2.5s ease-in-out 1.25s infinite",
        }} />

      {/* Center node */}
      <div className="relative w-4 h-4 rounded-full bg-primary/30 border border-primary/50 z-10">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-[-4px] rounded-full border border-primary/10 animate-pulse" />
        {/* Inner core */}
        <div className="absolute inset-[3px] rounded-full bg-primary/60" />
      </div>

      {/* Spark particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-primary/60"
          style={{
            animation: `spark-fly-${i % 3} 2s ease-out ${i * 0.4}s infinite`,
            left: "50%",
            top: "50%",
          }}
        />
      ))}

      <style jsx>{`
        @keyframes beam-travel {
          0%, 100% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes spark-fly-0 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          100% { transform: translate(12px, -20px) scale(0); opacity: 0; }
        }
        @keyframes spark-fly-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          100% { transform: translate(-15px, -15px) scale(0); opacity: 0; }
        }
        @keyframes spark-fly-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          100% { transform: translate(8px, 18px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 17: TextRing — Rotating Text Ring                           */
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
/*  ATOM 18: ParallaxLayer — Scroll-based Parallax Wrapper           */
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
/*  ATOM 19: StaggerReveal — Stagger Animation Wrapper               */
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
/*  ATOM 20: HolographicCard — Card with Holographic Sheen (NEW)     */
/* ═══════════════════════════════════════════════════════════════════ */
function HolographicCard({
  children,
  className = "",
  color = "#EF6F29",
}: {
  children: React.ReactNode
  className?: string
  color?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      className={`group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-xl overflow-hidden hover:border-white/[0.12] transition-all duration-500 ${className}`}
    >
      {/* Holographic sheen layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(239,111,41,0.08) 0%, transparent 50%),
            radial-gradient(circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(168,85,247,0.05) 0%, transparent 50%),
            linear-gradient(${mousePos.x * 3.6}deg,
              rgba(239,111,41,0.03) 0%,
              rgba(168,85,247,0.03) 25%,
              rgba(59,130,246,0.03) 50%,
              rgba(34,197,94,0.03) 75%,
              rgba(239,111,41,0.03) 100%
            )
          `,
        }}
      />
      {/* Prismatic edge reflection */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `conic-gradient(from ${mousePos.x * 3.6}deg at ${mousePos.x}% ${mousePos.y}%,
            transparent 0deg,
            rgba(239,111,41,0.04) 60deg,
            rgba(168,85,247,0.04) 120deg,
            rgba(59,130,246,0.04) 180deg,
            rgba(34,197,94,0.04) 240deg,
            rgba(236,72,153,0.04) 300deg,
            transparent 360deg
          )`,
        }}
      />
      {/* Top accent line */}
      <div className="h-[1.5px] w-full" style={{
        background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
      }} />
      {children}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 21: PulseRing — Animated Concentric Rings (NEW)             */
/* ═══════════════════════════════════════════════════════════════════ */
function PulseRing({
  size = 200,
  color = "#EF6F29",
  rings = 3,
  className = "",
}: {
  size?: number
  color?: string
  rings?: number
  className?: string
}) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {[...Array(rings)].map((_, i) => {
        const delay = i * 0.8
        const scale = 0.3 + (i * 0.3)
        return (
          <div
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: `${color}${Math.floor((1 - i / rings) * 40).toString(16).padStart(2, '0')}`,
              animation: `pulse-ring-expand 3s ease-out ${delay}s infinite`,
              transform: `scale(${scale})`,
            }}
          />
        )
      })}
      <style jsx>{`
        @keyframes pulse-ring-expand {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 22: AnimatedBorder — Rotating Conic Gradient Border (NEW)   */
/* ═══════════════════════════════════════════════════════════════════ */
function AnimatedBorder({
  children,
  className = "",
  speed = 8,
  colors = ["#EF6F29", "#a855f7", "#3b82f6"],
}: {
  children: React.ReactNode
  className?: string
  speed?: number
  colors?: string[]
}) {
  return (
    <div className={`relative rounded-[20px] overflow-hidden ${className}`}>
      {/* Spinning gradient border */}
      <div className="absolute inset-0 rounded-[20px] p-[1px] overflow-hidden">
        <div
          className="absolute inset-[-200%]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${colors[0]}40 8%, transparent 16%, ${colors[1] || colors[0]}30 24%, transparent 32%, ${colors[2] || colors[0]}20 40%, transparent 48%)`,
            animation: `spin ${speed}s linear infinite`,
          }}
        />
      </div>
      <div className="relative rounded-[19px] bg-[#0b0b0d]/95 backdrop-blur-xl overflow-hidden">
        {children}
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 23: GlowLine — Horizontal Animated Glow Line (NEW)         */
/* ═══════════════════════════════════════════════════════════════════ */
function GlowLine({
  color = "#EF6F29",
  height = 1,
  className = "",
}: {
  color?: string
  height?: number
  className?: string
}) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height: height + 8 }}>
      {/* Base line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2" style={{
        height,
        background: `linear-gradient(90deg, transparent 0%, ${color}15 20%, ${color}30 50%, ${color}15 80%, transparent 100%)`,
      }} />
      {/* Animated glow */}
      <div className="absolute top-1/2 -translate-y-1/2" style={{
        height: height + 6,
        width: "15%",
        background: `linear-gradient(90deg, transparent, ${color}60, ${color}, ${color}60, transparent)`,
        filter: `blur(3px) drop-shadow(0 0 8px ${color})`,
        animation: "glow-line-sweep 5s ease-in-out infinite",
      }} />
      <style jsx>{`
        @keyframes glow-line-sweep {
          0% { left: -15%; }
          50% { left: 100%; }
          50.01% { left: -15%; }
          100% { left: -15%; }
        }
      `}</style>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 24: ShimmerText — Text with Shimmer Highlight (NEW)         */
/* ═══════════════════════════════════════════════════════════════════ */
function ShimmerText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: "linear-gradient(110deg, transparent 33%, rgba(255,255,255,0.12) 50%, transparent 67%)",
          backgroundSize: "200% 100%",
          animation: "shimmer-sweep 3s ease-in-out infinite",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        aria-hidden
      >
        {text}
      </span>
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 25: StatusDot — Animated Status Indicator (NEW)             */
/* ═══════════════════════════════════════════════════════════════════ */
function StatusDot({
  status = "online",
  size = "sm",
}: {
  status?: "online" | "busy" | "away" | "offline"
  size?: "sm" | "md" | "lg"
}) {
  const colors = {
    online: "#22c55e",
    busy: "#ef4444",
    away: "#eab308",
    offline: "#6b7280",
  }
  const sizes = { sm: 6, md: 8, lg: 12 }
  const dotSize = sizes[size]
  const color = colors[status]

  return (
    <span className="relative inline-flex" style={{ width: dotSize, height: dotSize }}>
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: color }}
      />
      {status === "online" && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: 0.4 }}
        />
      )}
      {status === "busy" && (
        <span
          className="absolute inset-0 rounded-full animate-pulse"
          style={{ background: color, opacity: 0.6 }}
        />
      )}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 26: TagBadge — Styled Tag/Badge Component (NEW)             */
/* ═══════════════════════════════════════════════════════════════════ */
function TagBadge({
  text,
  color = "#EF6F29",
  variant = "outline",
}: {
  text: string
  color?: string
  variant?: "outline" | "filled" | "glow"
}) {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300"

  const variants = {
    outline: {
      background: "transparent",
      border: `1px solid ${color}30`,
      color: `${color}`,
    },
    filled: {
      background: `${color}15`,
      border: `1px solid ${color}20`,
      color: color,
    },
    glow: {
      background: `${color}10`,
      border: `1px solid ${color}30`,
      color: color,
      boxShadow: `0 0 12px ${color}15, inset 0 0 12px ${color}05`,
    },
  }

  return (
    <span className={baseClasses} style={variants[variant]}>
      {text}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 27: ProgressRing — SVG Circular Progress (NEW)              */
/* ═══════════════════════════════════════════════════════════════════ */
function ProgressRing({
  value,
  size = 60,
  strokeWidth = 3,
  color = "#EF6F29",
  className = "",
}: {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}) {
  const { ref, inView } = useInView(0.5)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div ref={ref} className={className}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference}
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: `drop-shadow(0 0 4px ${color}40)`,
          }}
        />
      </svg>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 28: ElectricArc — SVG Animated Electric Arc (NEW)           */
/* ═══════════════════════════════════════════════════════════════════ */
function ElectricArc({ width = 200, className = "" }: { width?: number; className?: string }) {
  const [path, setPath] = useState("")

  useEffect(() => {
    const generateArc = () => {
      const points = 8
      let d = "M0,25 "
      for (let i = 1; i < points; i++) {
        const x = (i / points) * 100
        const y = 25 + (Math.random() - 0.5) * 30
        d += `L${x},${y} `
      }
      d += "L100,25"
      setPath(d)
    }

    generateArc()
    const interval = setInterval(generateArc, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`pointer-events-none ${className}`} style={{ width }}>
      <svg viewBox="0 0 100 50" className="w-full" style={{ filter: "drop-shadow(0 0 3px #EF6F29)" }}>
        <path
          d={path}
          fill="none"
          stroke="#EF6F29"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <path
          d={path}
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.3"
          opacity="0.4"
        />
      </svg>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 29: TypewriterCursor — Blinking Cursor Component (NEW)      */
/* ═══════════════════════════════════════════════════════════════════ */
function TypewriterCursor({ color = "#EF6F29" }: { color?: string }) {
  return (
    <span
      className="inline-block w-[2px] h-[1.1em] ml-0.5 align-text-bottom animate-pulse rounded-sm"
      style={{ background: color }}
      aria-hidden
    />
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  ATOM 30: DataBadge — Stat Badge with Icon (NEW)                  */
/* ═══════════════════════════════════════════════════════════════════ */
function DataBadge({
  icon: Icon,
  label,
  value,
  color = "#EF6F29",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
        style={{ background: `${color}12` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/30 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white/80 tabular-nums">{value}</p>
      </div>
    </div>
  )
}


