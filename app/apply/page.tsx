"use client"

import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Users, Code2, Crown, Headphones, Camera, Search, DollarSign,
  Check, Minus, Plus, Send, CheckCircle2, Sparkles, Shield, Zap, Globe,
  ArrowRight, Clock, Star, ChevronRight, Trophy, Rocket, Heart,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const POSITIONS = [
  {
    id: "developer", title: "Developer", icon: Code2, color: "#a855f7",
    description: "Build and maintain our tools, website, and backend systems",
    requirements: ["Python, TypeScript, or C++", "Anti-cheat knowledge is a plus", "Code reviews and patches"],
    openSlots: 1, perks: ["Cutting-edge tech", "Flexible hours"],
  },
  {
    id: "manager", title: "Head Manager", icon: Crown, color: "#f97316",
    description: "Oversee daily operations, team coordination, and business decisions",
    requirements: ["Leadership experience", "20+ hours/week", "Business background"],
    openSlots: 1, perks: ["Revenue share", "Strategic role"],
  },
  {
    id: "support", title: "Support Agent", icon: Headphones, color: "#22c55e",
    description: "Help customers with setup, troubleshooting, and orders via Discord",
    requirements: ["Fast response time", "DMA/spoofer knowledge", "Fluent English"],
    openSlots: 3, perks: ["Commission per ticket", "Flexible schedule"],
  },
  {
    id: "media", title: "Media Manager", icon: Camera, color: "#ec4899",
    description: "Create content, manage social media, design graphics and videos",
    requirements: ["Photoshop/Premiere/AE", "Social media mgmt", "Creative portfolio"],
    openSlots: 2, perks: ["Creative freedom", "Build your portfolio"],
  },
  {
    id: "seo", title: "SEO Specialist", icon: Search, color: "#3b82f6",
    description: "Optimize search rankings, manage keywords, and drive organic traffic",
    requirements: ["Ahrefs/SEMrush experience", "Content strategy", "Technical SEO"],
    openSlots: 1, perks: ["Performance bonuses", "Own the strategy"],
  },
  {
    id: "sales", title: "Sales / Reseller", icon: DollarSign, color: "#eab308",
    description: "Drive sales, manage reseller partnerships, and grow revenue",
    requirements: ["Gaming/software sales exp", "Customer base is a plus", "Commission-based"],
    openSlots: 2, perks: ["High commission", "Uncapped earnings"],
  },
]

const TIMEZONES = [
  { v: "UTC-8", l: "Los Angeles", flag: "🇺🇸" },
  { v: "UTC-6", l: "Chicago", flag: "🇺🇸" },
  { v: "UTC-5", l: "New York", flag: "🇺🇸" },
  { v: "UTC-3", l: "São Paulo", flag: "🇧🇷" },
  { v: "UTC+0", l: "London", flag: "🇬🇧" },
  { v: "UTC+1", l: "Berlin", flag: "🇩🇪" },
  { v: "UTC+1", l: "Paris", flag: "🇫🇷" },
  { v: "UTC+2", l: "Kyiv", flag: "🇺🇦" },
  { v: "UTC+3", l: "Moscow", flag: "🇷🇺" },
  { v: "UTC+3", l: "Istanbul", flag: "🇹🇷" },
  { v: "UTC+4", l: "Dubai", flag: "🇦🇪" },
  { v: "UTC+5:30", l: "Mumbai", flag: "🇮🇳" },
  { v: "UTC+8", l: "Singapore", flag: "🇸🇬" },
  { v: "UTC+9", l: "Tokyo", flag: "🇯🇵" },
  { v: "UTC+11", l: "Sydney", flag: "🇦🇺" },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

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
  const formRef = useRef<HTMLDivElement>(null)

  const toggleDay = (d: string) => setSelectedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  const scrollToForm = (id: string) => { setPosition(id); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100) }
  const selectedPos = POSITIONS.find(p => p.id === position)

  const s0 = !!(position && discord.trim().length >= 2 && age >= 16 && timezone)
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
        body: JSON.stringify({ position, discord, age, timezone, hoursPerWeek, availableDays: selectedDays, preferredTime, experience, whyLethal, portfolio }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch { toast.error("Failed to submit") }
    setSubmitting(false)
  }

  if (submitted) return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[200px]" />
        </div>
        <div className="relative text-center max-w-lg animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">You're In!</h2>
          <p className="text-lg text-muted-foreground mb-2">Your application for <span className="text-white font-bold">{selectedPos?.title}</span> has been submitted.</p>
          <p className="text-sm text-muted-foreground/50 mb-10">We'll contact you on Discord within 48 hours. Keep notifications on.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="px-8 py-3.5 rounded-2xl border border-border/40 text-sm font-semibold hover:bg-white/[0.04] transition-all">Home</Link>
            <Link href="/products" className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-xl shadow-primary/25 transition-all">Browse Products</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 text-center overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[200px] animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute top-20 left-[20%] w-[300px] h-[300px] bg-purple-500/6 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-20 right-[20%] w-[300px] h-[300px] bg-blue-500/6 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "5s" }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-primary/30 animate-pulse" style={{
              left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`,
              animationDuration: `${2 + i * 0.5}s`, animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>

        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-amber-500/10 border border-primary/20 mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative h-2 w-2 rounded-full bg-emerald-500" /></span>
            <span className="text-sm font-bold text-primary">{POSITIONS.reduce((s, p) => s + p.openSlots, 0)} Open Positions</span>
            <span className="text-white/20">·</span>
            <span className="text-sm text-white/40">Remote</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 tracking-tight leading-[0.9]">
            <span className="block text-white/90">Join the</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-primary bg-[length:200%_100%]" style={{ animation: "shimmer 3s ease-in-out infinite" }}>
              Lethal Team
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/40 max-w-xl mx-auto mb-12 leading-relaxed">
            Work remotely. Set your own hours.<br className="hidden sm:block" />Build the best gaming tools on the market.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
              className="group px-10 py-4.5 rounded-2xl bg-gradient-to-b from-primary to-[#d45a1a] text-white font-bold text-base flex items-center gap-3 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all">
              View Open Roles
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 py-4.5 rounded-2xl border border-white/10 text-white/60 font-semibold text-base hover:bg-white/[0.04] hover:text-white/80 hover:border-white/20 transition-all">
              Apply Directly
            </button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              { icon: Users, val: "10+", label: "Team Members" },
              { icon: Globe, val: "24/7", label: "Global Coverage" },
              { icon: Zap, val: "100%", label: "Remote Work" },
              { icon: Trophy, val: "774+", label: "Happy Clients" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-white leading-none">{s.val}</p>
                  <p className="text-[11px] text-white/30">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ POSITIONS ═══════════════ */}
      <section id="positions" className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-primary/30" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Open Positions</span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">Find Your Role</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">Every position is fully remote with flexible hours. Pick what fits you best.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {POSITIONS.map((pos) => (
              <div key={pos.id} className="group relative rounded-[20px] border border-white/[0.06] bg-[#111113] hover:bg-[#141416] overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl" style={{ ["--c" as string]: pos.color }}>
                {/* Top gradient line */}
                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${pos.color}, transparent)`, opacity: 0.4 }} />

                <div className="p-7">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.06] transition-transform duration-300 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${pos.color}20, ${pos.color}05)` }}>
                      <pos.icon className="h-6 w-6" style={{ color: pos.color }} />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-emerald-400">{pos.openSlots} open</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black mb-2 group-hover:text-white transition-colors">{pos.title}</h3>
                  <p className="text-sm text-white/35 mb-6 leading-relaxed">{pos.description}</p>

                  <div className="space-y-2.5 mb-6">
                    {pos.requirements.map((req, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${pos.color}15` }}>
                          <Check className="h-3 w-3" style={{ color: pos.color }} />
                        </div>
                        <span className="text-xs text-white/30">{req}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-6">
                    {pos.perks.map((p, j) => (
                      <span key={j} className="text-[10px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/25 font-medium">
                        {p}
                      </span>
                    ))}
                  </div>

                  <button onClick={() => scrollToForm(pos.id)}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 border-2 border-white/[0.06] hover:border-white/[0.15] group-hover:bg-white/[0.04]"
                    style={{ ["--btn-c" as string]: pos.color }}>
                    Apply Now
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY JOIN ═══════════════ */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#111113] to-[#0c0c0e] overflow-hidden">
            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative p-10 sm:p-14">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Why Lethal?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3">Not a corporation.<br />A team that ships.</h2>
              <p className="text-white/30 text-sm mb-10 max-w-md">Small team, big impact. Your work directly shapes the product thousands of people use every day.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Globe, title: "100% Remote", desc: "Work from anywhere. No office, no commute, no dress code." },
                  { icon: Clock, title: "Flex Schedule", desc: "Set your own hours. We measure output, not time online." },
                  { icon: Zap, title: "Ship Fast", desc: "Small team = no bureaucracy. Ideas to production in days." },
                  { icon: Shield, title: "Trusted Brand", desc: "774+ verified reviews, 99.8% uptime. Real product, real users." },
                  { icon: Star, title: "Earn More", desc: "Commission + bonuses. Top performers earn serious money." },
                  { icon: Heart, title: "Great Culture", desc: "No toxicity. Skilled people who respect each other's time." },
                ].map((item, i) => (
                  <div key={i} className="group rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
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

      {/* ═══════════════ FORM ═══════════════ */}
      <section id="apply-form" ref={formRef} className="py-20 px-4">
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
              <span className="text-[11px] text-white/20 font-medium">Progress</span>
              <span className="text-[11px] font-black text-primary">{pct}%</span>
            </div>
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-amber-400 to-primary bg-[length:200%] rounded-full transition-all duration-700" style={{ width: `${pct}%`, animation: "shimmer 2s ease-in-out infinite" }} />
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {["Personal", "Schedule", "Experience"].map((label, i) => {
              const done = (i === 0 && s0) || (i === 1 && s1) || (i === 2 && s2)
              const active = formStep === i
              return (
                <button key={i} onClick={() => setFormStep(i)}
                  className={`relative py-3.5 rounded-xl text-xs font-bold transition-all overflow-hidden ${
                    active ? "bg-primary/10 text-primary border border-primary/25" :
                    done ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-white/[0.02] text-white/20 border border-white/[0.04]"
                  }`}>
                  {done && !active ? <span className="flex items-center justify-center gap-1.5"><Check className="h-3 w-3" />{label}</span> : `${i + 1}. ${label}`}
                </button>
              )
            })}
          </div>

          {/* Form card */}
          <div className="relative rounded-[24px] border border-white/[0.06] bg-[#111113] overflow-hidden">
            {/* Top accent */}
            {selectedPos && (
              <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${selectedPos.color}, transparent)` }} />
            )}

            {/* Role banner */}
            {selectedPos && (
              <div className="px-8 py-5 border-b border-white/[0.04]" style={{ background: `linear-gradient(135deg, ${selectedPos.color}08, transparent)` }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${selectedPos.color}15` }}>
                    <selectedPos.icon className="h-5 w-5" style={{ color: selectedPos.color }} />
                  </div>
                  <div>
                    <p className="font-bold">{selectedPos.title}</p>
                    <p className="text-[11px] text-white/25">{selectedPos.openSlots} position{selectedPos.openSlots > 1 ? "s" : ""} available · Remote</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8">

              {/* ── STEP 0 ── */}
              {formStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                  {/* Position */}
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Position <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {POSITIONS.map(p => (
                        <button key={p.id} type="button" onClick={() => setPosition(p.id)}
                          className={`flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            position === p.id
                              ? "border-2 bg-white/[0.03] shadow-lg"
                              : "border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.03]"
                          }`} style={position === p.id ? { borderColor: p.color, boxShadow: `0 0 20px ${p.color}15` } : {}}>
                          <p.icon className="h-4 w-4 shrink-0" style={{ color: p.color }} />
                          <span className="truncate">{p.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discord */}
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Discord <span className="text-primary">*</span></label>
                    <input type="text" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="your username"
                      className="w-full h-13 px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/15 focus:outline-none focus:border-primary/50 focus:bg-white/[0.03] focus:ring-1 focus:ring-primary/10 transition-all" />
                  </div>

                  {/* Age + Timezone row */}
                  <div className="grid grid-cols-[140px_1fr] gap-4">
                    <div>
                      <label className="text-sm font-bold mb-3 block text-white/70">Age <span className="text-primary">*</span></label>
                      <div className="flex">
                        <button type="button" onClick={() => setAge(Math.max(16, age - 1))}
                          className="w-12 h-13 rounded-l-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
                          <Minus className="h-4 w-4" />
                        </button>
                        <input type="number" value={age} onChange={(e) => setAge(Math.min(50, Math.max(16, parseInt(e.target.value) || 16)))}
                          className="flex-1 h-13 text-center border-y border-white/[0.06] bg-white/[0.02] text-base font-black focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                        <button type="button" onClick={() => setAge(Math.min(50, age + 1))}
                          className="w-12 h-13 rounded-r-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold mb-3 block text-white/70">Timezone <span className="text-primary">*</span></label>
                      <div className="grid grid-cols-3 gap-1.5 max-h-[156px] overflow-y-auto rounded-xl border border-white/[0.04] bg-white/[0.01] p-2">
                        {TIMEZONES.map((tz, i) => (
                          <button key={`${tz.l}-${i}`} type="button" onClick={() => setTimezone(tz.v)}
                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all ${
                              timezone === tz.v ? "bg-primary/15 text-white border border-primary/25" : "hover:bg-white/[0.04] text-white/30"
                            }`}>
                            <span className="text-sm">{tz.flag}</span>
                            <span className="truncate">{tz.l}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => s0 && setFormStep(1)} disabled={!s0}
                    className="w-full py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed transition-all mt-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ── STEP 1 ── */}
              {formStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Hours / Week <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-5 gap-2">
                      {["5-10h", "10-20h", "20-30h", "30-40h", "40+"].map(h => (
                        <button key={h} type="button" onClick={() => setHoursPerWeek(h)}
                          className={`py-3.5 rounded-xl text-xs font-bold transition-all ${
                            hoursPerWeek === h ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12]"
                          }`}>{h}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Available Days <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map(d => (
                        <button key={d} type="button" onClick={() => toggleDay(d)}
                          className={`py-3.5 rounded-xl text-xs font-bold transition-all ${
                            selectedDays.includes(d) ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12]"
                          }`}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Preferred Time <span className="text-primary">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { v: "Morning", t: "6 — 12", e: "☀️" },
                        { v: "Afternoon", t: "12 — 18", e: "🌤" },
                        { v: "Evening", t: "18 — 00", e: "🌙" },
                        { v: "Night", t: "00 — 06", e: "🌑" },
                        { v: "Flexible", t: "Anytime", e: "⚡" },
                      ].map(t => (
                        <button key={t.v} type="button" onClick={() => setPreferredTime(t.v)}
                          className={`py-4 rounded-xl text-center transition-all ${
                            preferredTime === t.v ? "bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10" : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]"
                          }`}>
                          <span className="text-lg block mb-1">{t.e}</span>
                          <p className="text-xs font-bold text-white/70">{t.v}</p>
                          <p className="text-[10px] text-white/20">{t.t}</p>
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

              {/* ── STEP 2 ── */}
              {formStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Experience <span className="text-primary">*</span></label>
                    <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
                      placeholder="Tell us about your relevant experience, skills, past projects..."
                      rows={5}
                      className="w-full px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 resize-none transition-all leading-relaxed" />
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${experience.length >= 50 ? "text-emerald-400" : "text-white/15"}`}>
                      {experience.length >= 50 ? <><Check className="h-3 w-3" /> Looks good</> : `${experience.length}/50 min characters`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Why Lethal? <span className="text-primary">*</span></label>
                    <textarea value={whyLethal} onChange={(e) => setWhyLethal(e.target.value)}
                      placeholder="What excites you about this role and our team?"
                      rows={4}
                      className="w-full px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 resize-none transition-all leading-relaxed" />
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${whyLethal.length >= 30 ? "text-emerald-400" : "text-white/15"}`}>
                      {whyLethal.length >= 30 ? <><Check className="h-3 w-3" /> Looks good</> : `${whyLethal.length}/30 min characters`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-3 block text-white/70">Portfolio <span className="text-white/15 font-normal text-xs">optional</span></label>
                    <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://your-portfolio.com"
                      className="w-full h-13 px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all" />
                  </div>

                  {/* Terms */}
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/15 mb-1">Agreements</p>
                    {[
                      { c: agree16, s: setAgree16, l: "I confirm I'm at least 16 years old" },
                      { c: agreeActive, s: setAgreeActive, l: "I agree to be active and maintain professionalism" },
                      { c: agreeUnpaid, s: setAgreeUnpaid, l: "I understand this position is initially unpaid / commission-based" },
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-3.5 cursor-pointer group" onClick={() => item.s(!item.c)}>
                        <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          item.c ? "bg-primary border-primary shadow-lg shadow-primary/25" : "border-white/10 group-hover:border-white/20"
                        }`}>
                          {item.c && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-xs text-white/30 leading-relaxed group-hover:text-white/40 transition-colors">{item.l}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setFormStep(1)}
                      className="flex-1 py-4.5 rounded-xl border border-white/[0.06] text-sm font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all">
                      Back
                    </button>
                    <button onClick={handleSubmit} disabled={!s2 || submitting}
                      className="flex-[2] py-4.5 rounded-xl bg-gradient-to-b from-primary to-[#d45a1a] text-white font-bold text-base flex items-center justify-center gap-2.5 disabled:opacity-20 disabled:cursor-not-allowed shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                      {submitting ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <><Send className="h-4 w-4" />Submit Application</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </main>
  )
}
