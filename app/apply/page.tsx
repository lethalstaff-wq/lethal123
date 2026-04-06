"use client"

import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Users, Code2, Crown, Headphones, Camera, Search, DollarSign,
  Check, Minus, Plus, Send, CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const POSITIONS = [
  {
    id: "developer",
    title: "Developer",
    icon: Code2,
    color: "#a855f7",
    description: "Build and maintain our tools, website, and backend systems",
    requirements: ["Python, TypeScript, or C++ experience", "Understanding of anti-cheat systems is a plus", "Available for code reviews and patches"],
    openSlots: 1,
  },
  {
    id: "manager",
    title: "Head Manager",
    icon: Crown,
    color: "#f97316",
    description: "Oversee daily operations, team coordination, and business decisions",
    requirements: ["Leadership experience", "Available 20+ hours/week", "Business/management background"],
    openSlots: 1,
  },
  {
    id: "support",
    title: "Support Agent",
    icon: Headphones,
    color: "#22c55e",
    description: "Help customers with setup, troubleshooting, and orders via Discord",
    requirements: ["Fast response time", "Knowledge of DMA/spoofers/cheats", "Fluent English", "Patient with customers"],
    openSlots: 3,
  },
  {
    id: "media",
    title: "Media Manager",
    icon: Camera,
    color: "#ec4899",
    description: "Create content, manage social media, design graphics and videos",
    requirements: ["Experience with Photoshop/Premiere/After Effects", "Social media management", "Creative portfolio"],
    openSlots: 2,
  },
  {
    id: "seo",
    title: "SEO Specialist",
    icon: Search,
    color: "#3b82f6",
    description: "Optimize search rankings, manage keywords, and drive organic traffic",
    requirements: ["SEO tools experience (Ahrefs, SEMrush)", "Content strategy", "Technical SEO knowledge"],
    openSlots: 1,
  },
  {
    id: "sales",
    title: "Sales / Reseller",
    icon: DollarSign,
    color: "#eab308",
    description: "Drive sales, manage reseller partnerships, and grow revenue",
    requirements: ["Sales experience in gaming/software", "Existing customer base is a plus", "Commission-based"],
    openSlots: 2,
  },
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
  const formRef = useRef<HTMLDivElement>(null)

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const scrollToForm = (posId: string) => {
    setPosition(posId)
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const isValid = position && discord.trim() && age >= 16 && timezone && hoursPerWeek
    && selectedDays.length > 0 && preferredTime && experience.length >= 50
    && whyLethal.length >= 30 && agree16 && agreeActive && agreeUnpaid

  const handleSubmit = async () => {
    if (!isValid || submitting) return
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
    } catch {
      toast.error("Failed to submit application")
    }
    setSubmitting(false)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {submitted ? (
        <section className="flex-1 flex items-center justify-center py-32 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Sent!</h2>
            <p className="text-muted-foreground mb-6">We'll review your application and contact you on Discord within 48 hours.</p>
            <Link href="/" className="text-primary hover:underline text-sm">← Back to Home</Link>
          </div>
        </section>
      ) : (
        <>
          {/* Hero */}
          <section className="py-20 px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              <span>We're Hiring</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Team</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Help us build the best gaming tools on the market. Remote, flexible, and rewarding.
            </p>
          </section>

          {/* Positions Grid */}
          <section className="px-4 pb-16">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {POSITIONS.map((pos) => (
                  <div key={pos.id} className="rounded-2xl border border-border/40 bg-card/50 p-6 hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${pos.color}15` }}>
                        <pos.icon className="h-5 w-5" style={{ color: pos.color }} />
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                        {pos.openSlots} open
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{pos.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{pos.description}</p>
                    <ul className="space-y-1.5 mb-5">
                      {pos.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/40">
                          <Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: pos.color }} />
                          {req}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => scrollToForm(pos.id)}
                      className="w-full py-2.5 rounded-xl border border-border/40 text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      Apply for {pos.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Application Form */}
          <section id="apply-form" ref={formRef} className="py-16 px-4">
            <div className="container mx-auto max-w-2xl">
              <div className="rounded-2xl border border-border/40 bg-card/50 p-8">
                <h2 className="text-2xl font-bold mb-2">Apply Now</h2>
                <p className="text-sm text-muted-foreground mb-8">Fill out the form below. We review applications within 48 hours.</p>

                <div className="space-y-6">

                  {/* ── Personal Info ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Personal Info</p>
                    <div className="space-y-4">

                      {/* Position */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Position <span className="text-primary">*</span></label>
                        <select
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0c0c0e]">Select a position...</option>
                          {POSITIONS.map(p => (
                            <option key={p.id} value={p.id} className="bg-[#0c0c0e]">{p.title}</option>
                          ))}
                        </select>
                      </div>

                      {/* Discord */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Discord Username <span className="text-primary">*</span></label>
                        <input
                          type="text"
                          value={discord}
                          onChange={(e) => setDiscord(e.target.value)}
                          placeholder="username"
                          className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Age <span className="text-primary">*</span></label>
                        <div className="flex items-center gap-0">
                          <button
                            type="button"
                            onClick={() => setAge(Math.max(16, age - 1))}
                            className="w-11 h-11 rounded-l-xl border border-border/40 bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-all"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(Math.min(50, Math.max(16, parseInt(e.target.value) || 16)))}
                            className="w-16 h-11 text-center border-y border-border/40 bg-white/[0.03] text-sm font-bold focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => setAge(Math.min(50, age + 1))}
                            className="w-11 h-11 rounded-r-xl border border-border/40 bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Timezone <span className="text-primary">*</span></label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0c0c0e]">Select timezone...</option>
                          <optgroup label="🌎 Americas">
                            <option value="UTC-8" className="bg-[#0c0c0e]">Los Angeles (UTC-8)</option>
                            <option value="UTC-6" className="bg-[#0c0c0e]">Chicago (UTC-6)</option>
                            <option value="UTC-5" className="bg-[#0c0c0e]">New York (UTC-5)</option>
                            <option value="UTC-3" className="bg-[#0c0c0e]">São Paulo (UTC-3)</option>
                          </optgroup>
                          <optgroup label="🌍 Europe">
                            <option value="UTC+0" className="bg-[#0c0c0e]">London (UTC+0)</option>
                            <option value="UTC+1" className="bg-[#0c0c0e]">Berlin / Paris (UTC+1)</option>
                            <option value="UTC+2" className="bg-[#0c0c0e]">Kyiv / Istanbul (UTC+2)</option>
                            <option value="UTC+3" className="bg-[#0c0c0e]">Moscow (UTC+3)</option>
                          </optgroup>
                          <optgroup label="🌏 Asia & Oceania">
                            <option value="UTC+4" className="bg-[#0c0c0e]">Dubai (UTC+4)</option>
                            <option value="UTC+5:30" className="bg-[#0c0c0e]">Mumbai (UTC+5:30)</option>
                            <option value="UTC+8" className="bg-[#0c0c0e]">Singapore / HK (UTC+8)</option>
                            <option value="UTC+9" className="bg-[#0c0c0e]">Tokyo (UTC+9)</option>
                            <option value="UTC+11" className="bg-[#0c0c0e]">Sydney (UTC+11)</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── Availability ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Availability</p>
                    <div className="space-y-4">

                      {/* Hours/week */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Hours per Week <span className="text-primary">*</span></label>
                        <select
                          value={hoursPerWeek}
                          onChange={(e) => setHoursPerWeek(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0c0c0e]">Select...</option>
                          <option value="5-10h" className="bg-[#0c0c0e]">5-10 hours</option>
                          <option value="10-20h" className="bg-[#0c0c0e]">10-20 hours</option>
                          <option value="20-30h" className="bg-[#0c0c0e]">20-30 hours</option>
                          <option value="30-40h" className="bg-[#0c0c0e]">30-40 hours</option>
                          <option value="40+" className="bg-[#0c0c0e]">40+ hours</option>
                        </select>
                      </div>

                      {/* Days */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Available Days <span className="text-primary">*</span></label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                selectedDays.includes(day)
                                  ? "bg-primary text-white"
                                  : "bg-white/[0.03] border border-border/40 text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preferred time */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Preferred Time <span className="text-primary">*</span></label>
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0c0c0e]">Select...</option>
                          <option value="Morning (6-12)" className="bg-[#0c0c0e]">Morning (6:00 - 12:00)</option>
                          <option value="Afternoon (12-18)" className="bg-[#0c0c0e]">Afternoon (12:00 - 18:00)</option>
                          <option value="Evening (18-00)" className="bg-[#0c0c0e]">Evening (18:00 - 00:00)</option>
                          <option value="Night (00-06)" className="bg-[#0c0c0e]">Night (00:00 - 06:00)</option>
                          <option value="Flexible" className="bg-[#0c0c0e]">Flexible</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── Experience ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Experience</p>
                    <div className="space-y-4">

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Previous Experience <span className="text-primary">*</span></label>
                        <textarea
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="Tell us about your relevant experience..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-none transition-all"
                        />
                        <p className={`text-[11px] mt-1 ${experience.length >= 50 ? "text-emerald-500" : "text-muted-foreground/40"}`}>
                          {experience.length}/50 min characters
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Why Lethal? <span className="text-primary">*</span></label>
                        <textarea
                          value={whyLethal}
                          onChange={(e) => setWhyLethal(e.target.value)}
                          placeholder="Why do you want to join Lethal Solutions?"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-none transition-all"
                        />
                        <p className={`text-[11px] mt-1 ${whyLethal.length >= 30 ? "text-emerald-500" : "text-muted-foreground/40"}`}>
                          {whyLethal.length}/30 min characters
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Portfolio Link <span className="text-muted-foreground/40 font-normal">(optional)</span></label>
                        <input
                          type="url"
                          value={portfolio}
                          onChange={(e) => setPortfolio(e.target.value)}
                          placeholder="https://..."
                          className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Terms ── */}
                  <div className="space-y-3 pt-2">
                    {[
                      { checked: agree16, set: setAgree16, label: "I confirm I'm at least 16 years old" },
                      { checked: agreeActive, set: setAgreeActive, label: "I agree to be active and maintain professionalism" },
                      { checked: agreeUnpaid, set: setAgreeUnpaid, label: "I understand this position is initially unpaid / commission-based" },
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            item.checked ? "bg-primary border-primary" : "border-border/40 group-hover:border-border/60"
                          }`}
                          onClick={() => item.set(!item.checked)}
                        >
                          {item.checked && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-xs text-muted-foreground/60 leading-relaxed" onClick={() => item.set(!item.checked)}>
                          {item.label} <span className="text-primary">*</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                    className="w-full h-13 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                  >
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
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  )
}
