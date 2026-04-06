"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Users, Code2, Crown, Headphones, Camera, Search, DollarSign,
  Check, Minus, Plus, Send, CheckCircle2, Sparkles, Shield, Zap, Globe,
  ArrowRight, Clock, Star, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const POSITIONS = [
  {
    id: "developer",
    title: "Developer",
    icon: Code2,
    color: "#a855f7",
    gradient: "from-purple-500/20 to-purple-500/5",
    borderHover: "hover:border-purple-500/40",
    description: "Build and maintain our tools, website, and backend systems",
    requirements: ["Python, TypeScript, or C++ experience", "Understanding of anti-cheat systems is a plus", "Available for code reviews and patches"],
    openSlots: 1,
    perks: ["Work on cutting-edge tech", "Flexible hours"],
  },
  {
    id: "manager",
    title: "Head Manager",
    icon: Crown,
    color: "#f97316",
    gradient: "from-orange-500/20 to-orange-500/5",
    borderHover: "hover:border-orange-500/40",
    description: "Oversee daily operations, team coordination, and business decisions",
    requirements: ["Leadership experience", "Available 20+ hours/week", "Business/management background"],
    openSlots: 1,
    perks: ["Revenue share", "Strategic role"],
  },
  {
    id: "support",
    title: "Support Agent",
    icon: Headphones,
    color: "#22c55e",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    borderHover: "hover:border-emerald-500/40",
    description: "Help customers with setup, troubleshooting, and orders via Discord",
    requirements: ["Fast response time", "Knowledge of DMA/spoofers/cheats", "Fluent English", "Patient with customers"],
    openSlots: 3,
    perks: ["Commission per ticket", "Flexible schedule"],
  },
  {
    id: "media",
    title: "Media Manager",
    icon: Camera,
    color: "#ec4899",
    gradient: "from-pink-500/20 to-pink-500/5",
    borderHover: "hover:border-pink-500/40",
    description: "Create content, manage social media, design graphics and videos",
    requirements: ["Experience with Photoshop/Premiere/After Effects", "Social media management", "Creative portfolio"],
    openSlots: 2,
    perks: ["Creative freedom", "Build your portfolio"],
  },
  {
    id: "seo",
    title: "SEO Specialist",
    icon: Search,
    color: "#3b82f6",
    gradient: "from-blue-500/20 to-blue-500/5",
    borderHover: "hover:border-blue-500/40",
    description: "Optimize search rankings, manage keywords, and drive organic traffic",
    requirements: ["SEO tools experience (Ahrefs, SEMrush)", "Content strategy", "Technical SEO knowledge"],
    openSlots: 1,
    perks: ["Performance bonuses", "Own the SEO strategy"],
  },
  {
    id: "sales",
    title: "Sales / Reseller",
    icon: DollarSign,
    color: "#eab308",
    gradient: "from-yellow-500/20 to-yellow-500/5",
    borderHover: "hover:border-yellow-500/40",
    description: "Drive sales, manage reseller partnerships, and grow revenue",
    requirements: ["Sales experience in gaming/software", "Existing customer base is a plus", "Commission-based"],
    openSlots: 2,
    perks: ["High commission rates", "Uncapped earnings"],
  },
]

const STATS = [
  { value: "10+", label: "Team Members", icon: Users },
  { value: "24/7", label: "Global Coverage", icon: Globe },
  { value: "100%", label: "Remote Work", icon: Zap },
  { value: "48h", label: "Response Time", icon: Clock },
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
  const [formStep, setFormStep] = useState(0) // 0=personal, 1=availability, 2=experience
  const formRef = useRef<HTMLDivElement>(null)

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const scrollToForm = (posId: string) => {
    setPosition(posId)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
  }

  const selectedPos = POSITIONS.find(p => p.id === position)

  const step0Valid = position && discord.trim().length >= 2 && age >= 16 && timezone
  const step1Valid = hoursPerWeek && selectedDays.length > 0 && preferredTime
  const step2Valid = experience.length >= 50 && whyLethal.length >= 30 && agree16 && agreeActive && agreeUnpaid

  const handleSubmit = async () => {
    if (!step2Valid || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position, discord, age, timezone,
          hoursPerWeek, availableDays: selectedDays, preferredTime,
          experience, whyLethal, portfolio,
        }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      toast.error("Failed to submit application")
    }
    setSubmitting(false)
  }

  // Completion percentage
  const totalFields = 10
  let filledFields = 0
  if (position) filledFields++
  if (discord.trim()) filledFields++
  if (age >= 16) filledFields++
  if (timezone) filledFields++
  if (hoursPerWeek) filledFields++
  if (selectedDays.length > 0) filledFields++
  if (preferredTime) filledFields++
  if (experience.length >= 50) filledFields++
  if (whyLethal.length >= 30) filledFields++
  if (agree16 && agreeActive && agreeUnpaid) filledFields++
  const completionPct = Math.round((filledFields / totalFields) * 100)

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {submitted ? (
        <section className="flex-1 flex items-center justify-center py-32 px-4">
          <div className="text-center max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-3">Application Sent!</h2>
              <p className="text-muted-foreground mb-2">Your application for <span className="text-white font-semibold">{selectedPos?.title}</span> has been submitted.</p>
              <p className="text-muted-foreground/60 text-sm mb-8">We review every application personally and will contact you on Discord within 48 hours.</p>

              <div className="flex items-center justify-center gap-4">
                <Link href="/" className="px-6 py-3 rounded-xl border border-border/40 text-sm font-semibold hover:bg-white/[0.03] transition-all">
                  Back to Home
                </Link>
                <Link href="/products" className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* ═══ HERO ═══ */}
          <section className="relative py-24 sm:py-32 px-4 text-center overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />
            <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Sparkles className="h-4 w-4" />
                <span>We're Hiring — {POSITIONS.reduce((s, p) => s + p.openSlots, 0)} Open Positions</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700">
                Join the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-primary bg-[length:200%] animate-[shimmer_3s_ease-in-out_infinite]">
                  Lethal
                </span>
                {" "}Team
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-900 leading-relaxed">
                Build the best gaming tools on the market. Work remotely, on your own schedule,
                with a team that moves fast and values results over hours.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <button
                  onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base flex items-center gap-2 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                >
                  View Positions
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 rounded-2xl border border-border/40 text-white/80 font-semibold text-base hover:bg-white/[0.03] hover:border-border/60 transition-all"
                >
                  Apply Directly
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {STATS.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-4 text-center">
                    <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-xl font-black text-white">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ POSITIONS ═══ */}
          <section id="positions" className="px-4 py-16">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-black mb-3">Open Positions</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">Find the role that fits your skills. Every position is remote and flexible.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {POSITIONS.map((pos, i) => (
                  <div
                    key={pos.id}
                    className={`relative rounded-2xl border border-border/30 bg-gradient-to-b ${pos.gradient} backdrop-blur-sm p-6 ${pos.borderHover} hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent group-hover:to-black/20 transition-all duration-300 pointer-events-none rounded-2xl" />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/[0.06]" style={{ background: `${pos.color}15` }}>
                          <pos.icon className="h-6 w-6" style={{ color: pos.color }} />
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {pos.openSlots} open
                        </span>
                      </div>

                      <h3 className="font-bold text-xl mb-2 group-hover:text-white transition-colors">{pos.title}</h3>
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{pos.description}</p>

                      {/* Requirements */}
                      <div className="space-y-2 mb-5">
                        {pos.requirements.map((req, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${pos.color}20` }}>
                              <Check className="h-2.5 w-2.5" style={{ color: pos.color }} />
                            </div>
                            <span className="text-xs text-white/40 leading-relaxed">{req}</span>
                          </div>
                        ))}
                      </div>

                      {/* Perks */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {pos.perks.map((perk, j) => (
                          <span key={j} className="text-[10px] px-2.5 py-1 rounded-full border border-white/[0.06] text-white/30 font-medium">
                            {perk}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => scrollToForm(pos.id)}
                        className="w-full py-3 rounded-xl border-2 border-border/30 text-sm font-bold hover:border-white/20 hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2 group/btn"
                        style={{ ["--pos-color" as string]: pos.color }}
                      >
                        Apply Now
                        <ChevronRight className="h-4 w-4 text-white/30 group-hover/btn:text-white/60 group-hover/btn:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ WHY JOIN US ═══ */}
          <section className="px-4 py-16">
            <div className="container mx-auto max-w-4xl">
              <div className="rounded-3xl border border-border/30 bg-gradient-to-br from-primary/[0.04] to-transparent p-8 sm:p-12">
                <div className="text-center mb-10">
                  <h2 className="text-2xl sm:text-3xl font-black mb-3">Why Join Lethal?</h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">We're not a corporation. We're a tight-knit team that ships fast and rewards results.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { icon: Globe, title: "100% Remote", desc: "Work from anywhere in the world. No office, no commute." },
                    { icon: Clock, title: "Flexible Hours", desc: "Set your own schedule. We care about output, not clock-in times." },
                    { icon: Zap, title: "Fast Growth", desc: "Small team = big impact. Your work directly shapes the product." },
                    { icon: Shield, title: "Trusted Brand", desc: "774+ verified reviews, 99.8% undetected rate, growing every day." },
                    { icon: Star, title: "Earn More", desc: "Commission-based roles with uncapped potential. Top earners make serious money." },
                    { icon: Users, title: "Great Team", desc: "Work with skilled people who are passionate about what they build." },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 hover:bg-white/[0.04] transition-colors">
                      <item.icon className="h-5 w-5 text-primary mb-3" />
                      <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ APPLICATION FORM ═══ */}
          <section id="apply-form" ref={formRef} className="py-16 px-4">
            <div className="container mx-auto max-w-2xl">

              {/* Form header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-black mb-3">Apply Now</h2>
                <p className="text-muted-foreground">Fill out the form below. We review every application within 48 hours.</p>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Application progress</span>
                  <span className="text-xs font-bold text-primary">{completionPct}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-8">
                {["Personal", "Availability", "Experience"].map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setFormStep(i)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                      formStep === i
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : i < formStep || (i === 0 && step0Valid) || (i === 1 && step1Valid)
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/[0.02] text-muted-foreground border border-border/30"
                    }`}
                  >
                    {(i < formStep || (i === 0 && step0Valid) || (i === 1 && step1Valid)) && formStep !== i
                      ? <span className="flex items-center justify-center gap-1.5"><Check className="h-3 w-3" />{label}</span>
                      : <span>{i + 1}. {label}</span>
                    }
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">

                {/* Selected role banner */}
                {selectedPos && (
                  <div className="px-8 py-4 border-b border-border/20 bg-gradient-to-r" style={{ background: `linear-gradient(to right, ${selectedPos.color}08, transparent)` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${selectedPos.color}20` }}>
                        <selectedPos.icon className="h-4 w-4" style={{ color: selectedPos.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Applying for {selectedPos.title}</p>
                        <p className="text-[11px] text-muted-foreground">{selectedPos.openSlots} position{selectedPos.openSlots > 1 ? "s" : ""} available</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-8">

                  {/* ── STEP 0: Personal ── */}
                  {formStep === 0 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Position <span className="text-primary">*</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {POSITIONS.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setPosition(p.id)}
                              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all ${
                                position === p.id
                                  ? "border-2 bg-primary/[0.06]"
                                  : "border border-border/30 hover:border-border/50 bg-white/[0.02]"
                              }`}
                              style={position === p.id ? { borderColor: p.color } : {}}
                            >
                              <p.icon className="h-3.5 w-3.5 shrink-0" style={{ color: p.color }} />
                              <span className="truncate">{p.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Discord Username <span className="text-primary">*</span></label>
                        <input
                          type="text" value={discord} onChange={(e) => setDiscord(e.target.value)}
                          placeholder="username"
                          className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold mb-2 block">Age <span className="text-primary">*</span></label>
                          <div className="flex items-center">
                            <button type="button" onClick={() => setAge(Math.max(16, age - 1))}
                              className="w-12 h-12 rounded-l-xl border border-border/40 bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-all">
                              <Minus className="h-4 w-4" />
                            </button>
                            <input type="number" value={age}
                              onChange={(e) => setAge(Math.min(50, Math.max(16, parseInt(e.target.value) || 16)))}
                              className="w-full h-12 text-center border-y border-border/40 bg-white/[0.03] text-sm font-bold focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <button type="button" onClick={() => setAge(Math.min(50, age + 1))}
                              className="w-12 h-12 rounded-r-xl border border-border/40 bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-all">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold mb-2 block">Timezone <span className="text-primary">*</span></label>
                          <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                            <option value="" className="bg-[#0c0c0e]">Select...</option>
                            <optgroup label="Americas">
                              <option value="UTC-8" className="bg-[#0c0c0e]">Los Angeles (UTC-8)</option>
                              <option value="UTC-6" className="bg-[#0c0c0e]">Chicago (UTC-6)</option>
                              <option value="UTC-5" className="bg-[#0c0c0e]">New York (UTC-5)</option>
                              <option value="UTC-3" className="bg-[#0c0c0e]">São Paulo (UTC-3)</option>
                            </optgroup>
                            <optgroup label="Europe">
                              <option value="UTC+0" className="bg-[#0c0c0e]">London (UTC+0)</option>
                              <option value="UTC+1" className="bg-[#0c0c0e]">Berlin / Paris (UTC+1)</option>
                              <option value="UTC+2" className="bg-[#0c0c0e]">Kyiv / Istanbul (UTC+2)</option>
                              <option value="UTC+3" className="bg-[#0c0c0e]">Moscow (UTC+3)</option>
                            </optgroup>
                            <optgroup label="Asia & Oceania">
                              <option value="UTC+4" className="bg-[#0c0c0e]">Dubai (UTC+4)</option>
                              <option value="UTC+5:30" className="bg-[#0c0c0e]">Mumbai (UTC+5:30)</option>
                              <option value="UTC+8" className="bg-[#0c0c0e]">Singapore / HK (UTC+8)</option>
                              <option value="UTC+9" className="bg-[#0c0c0e]">Tokyo (UTC+9)</option>
                              <option value="UTC+11" className="bg-[#0c0c0e]">Sydney (UTC+11)</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => step0Valid && setFormStep(1)}
                        disabled={!step0Valid}
                        className="w-full h-13 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-border/30 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all mt-2"
                      >
                        Continue <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* ── STEP 1: Availability ── */}
                  {formStep === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Hours per Week <span className="text-primary">*</span></label>
                        <div className="grid grid-cols-5 gap-2">
                          {["5-10h", "10-20h", "20-30h", "30-40h", "40+"].map(h => (
                            <button key={h} type="button" onClick={() => setHoursPerWeek(h)}
                              className={`py-3 rounded-xl text-xs font-bold transition-all ${
                                hoursPerWeek === h ? "bg-primary text-white" : "bg-white/[0.03] border border-border/40 text-muted-foreground hover:border-primary/30"
                              }`}>
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Available Days <span className="text-primary">*</span></label>
                        <div className="flex gap-2">
                          {DAYS.map((day) => (
                            <button key={day} type="button" onClick={() => toggleDay(day)}
                              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                                selectedDays.includes(day)
                                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                                  : "bg-white/[0.03] border border-border/40 text-muted-foreground hover:border-primary/30"
                              }`}>
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Preferred Time <span className="text-primary">*</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { v: "Morning (6-12)", l: "Morning", sub: "6:00 — 12:00" },
                            { v: "Afternoon (12-18)", l: "Afternoon", sub: "12:00 — 18:00" },
                            { v: "Evening (18-00)", l: "Evening", sub: "18:00 — 00:00" },
                            { v: "Night (00-06)", l: "Night", sub: "00:00 — 06:00" },
                            { v: "Flexible", l: "Flexible", sub: "Any time" },
                          ].map(t => (
                            <button key={t.v} type="button" onClick={() => setPreferredTime(t.v)}
                              className={`py-3 rounded-xl text-center transition-all ${
                                preferredTime === t.v
                                  ? "bg-primary/10 border-2 border-primary text-white"
                                  : "bg-white/[0.03] border border-border/40 text-muted-foreground hover:border-primary/30"
                              }`}>
                              <p className="text-xs font-bold">{t.l}</p>
                              <p className="text-[10px] text-muted-foreground/50">{t.sub}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <button onClick={() => setFormStep(0)}
                          className="flex-1 py-3.5 rounded-xl border border-border/30 text-sm font-semibold text-muted-foreground hover:text-white hover:bg-white/[0.03] transition-all">
                          Back
                        </button>
                        <button onClick={() => step1Valid && setFormStep(2)} disabled={!step1Valid}
                          className="flex-[2] py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-border/30 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          Continue <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Experience ── */}
                  {formStep === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Previous Experience <span className="text-primary">*</span></label>
                        <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
                          placeholder="Tell us about your relevant experience, skills, and what you've worked on..."
                          rows={5}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition-all"
                        />
                        <div className="flex justify-between mt-1">
                          <p className={`text-[11px] ${experience.length >= 50 ? "text-emerald-500" : "text-muted-foreground/30"}`}>
                            {experience.length >= 50 ? <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Good</span> : `${experience.length}/50 min`}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Why Lethal? <span className="text-primary">*</span></label>
                        <textarea value={whyLethal} onChange={(e) => setWhyLethal(e.target.value)}
                          placeholder="Why do you want to join Lethal Solutions? What excites you about this role?"
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition-all"
                        />
                        <div className="flex justify-between mt-1">
                          <p className={`text-[11px] ${whyLethal.length >= 30 ? "text-emerald-500" : "text-muted-foreground/30"}`}>
                            {whyLethal.length >= 30 ? <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Good</span> : `${whyLethal.length}/30 min`}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Portfolio Link <span className="text-muted-foreground/30 font-normal text-xs">(optional)</span></label>
                        <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)}
                          placeholder="https://your-portfolio.com"
                          className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      {/* Terms */}
                      <div className="rounded-xl border border-border/20 bg-white/[0.01] p-5 space-y-3">
                        {[
                          { checked: agree16, set: setAgree16, label: "I confirm I'm at least 16 years old" },
                          { checked: agreeActive, set: setAgreeActive, label: "I agree to be active and maintain professionalism" },
                          { checked: agreeUnpaid, set: setAgreeUnpaid, label: "I understand this position is initially unpaid / commission-based" },
                        ].map((item, i) => (
                          <label key={i} className="flex items-start gap-3 cursor-pointer group">
                            <div
                              onClick={() => item.set(!item.checked)}
                              className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                item.checked ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-border/40 group-hover:border-border/60"
                              }`}
                            >
                              {item.checked && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span onClick={() => item.set(!item.checked)} className="text-xs text-muted-foreground/50 leading-relaxed">
                              {item.label} <span className="text-primary">*</span>
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setFormStep(1)}
                          className="flex-1 py-4 rounded-xl border border-border/30 text-sm font-semibold text-muted-foreground hover:text-white hover:bg-white/[0.03] transition-all">
                          Back
                        </button>
                        <button onClick={handleSubmit} disabled={!step2Valid || submitting}
                          className="flex-[2] py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35">
                          {submitting ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
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
          </section>
        </>
      )}

      <Footer />
    </main>
  )
}
