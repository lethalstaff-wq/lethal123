"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UserPlus, Send, Briefcase, MessageCircle, Globe, Clock } from "lucide-react"
import { toast } from "sonner"

const TIMEZONES = [
  "UTC-12", "UTC-11", "UTC-10", "UTC-9", "UTC-8", "UTC-7", "UTC-6", "UTC-5",
  "UTC-4", "UTC-3", "UTC-2", "UTC-1", "UTC+0", "UTC+1", "UTC+2", "UTC+3",
  "UTC+4", "UTC+5", "UTC+6", "UTC+7", "UTC+8", "UTC+9", "UTC+10", "UTC+11", "UTC+12",
]

const POSITIONS = [
  { value: "support", label: "Support Agent", desc: "Help customers with setup and issues" },
  { value: "moderator", label: "Moderator", desc: "Moderate Discord server and community" },
  { value: "developer", label: "Developer", desc: "Help with site/tool development" },
  { value: "reseller", label: "Reseller", desc: "Sell products on your own platform" },
]

export default function ApplyPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    discord: "",
    age: "",
    timezone: "",
    experience: "",
    languages: "",
    hours_per_week: "",
    position: "",
    why_hire: "",
    how_found: "",
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.discord || !form.age || !form.position || !form.why_hire) {
      toast.error("Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/staff-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")
      toast.success("Application submitted successfully! We'll review it soon.")
      setForm({
        discord: "",
        age: "",
        timezone: "",
        experience: "",
        languages: "",
        hours_per_week: "",
        position: "",
        why_hire: "",
        how_found: "",
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#EF6F29]/50 focus:border-[#EF6F29]/50 transition-all duration-200"
  const labelClass = "block text-sm font-medium text-white/70 mb-2"

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050505] pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EF6F29]/10 border border-[#EF6F29]/20 mb-6">
              <UserPlus className="w-8 h-8 text-[#EF6F29]" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Join Our Team
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              We&apos;re looking for passionate individuals to help us grow. Fill out the application below and we&apos;ll get back to you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="w-5 h-5 text-[#EF6F29]" />
                <h2 className="text-xl font-semibold text-white">Personal Info</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Discord Username <span className="text-[#EF6F29]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.discord}
                    onChange={(e) => update("discord", e.target.value)}
                    placeholder="username#0000"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Age <span className="text-[#EF6F29]">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => update("age", e.target.value)}
                    placeholder="18"
                    min={13}
                    max={99}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <Globe className="w-4 h-4 inline mr-1.5 text-white/40" />
                  Timezone
                </label>
                <select
                  value={form.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select timezone...</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-[#EF6F29]" />
                <h2 className="text-xl font-semibold text-white">Experience</h2>
              </div>

              <div>
                <label className={labelClass}>
                  Previous experience in gaming communities
                </label>
                <textarea
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  placeholder="Tell us about your previous roles, communities you've been part of, etc."
                  rows={4}
                  className={inputClass + " resize-none"}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Languages Spoken</label>
                  <input
                    type="text"
                    value={form.languages}
                    onChange={(e) => update("languages", e.target.value)}
                    placeholder="English, Spanish, etc."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <Clock className="w-4 h-4 inline mr-1.5 text-white/40" />
                    Available Hours per Week
                  </label>
                  <select
                    value={form.hours_per_week}
                    onChange={(e) => update("hours_per_week", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select hours...</option>
                    <option value="5-10">5 - 10 hours</option>
                    <option value="10-20">10 - 20 hours</option>
                    <option value="20-30">20 - 30 hours</option>
                    <option value="30+">30+ hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-[#EF6F29]" />
                <h2 className="text-xl font-semibold text-white">
                  Position <span className="text-[#EF6F29]">*</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {POSITIONS.map((pos) => (
                  <label
                    key={pos.value}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      form.position === pos.value
                        ? "border-[#EF6F29]/60 bg-[#EF6F29]/5 ring-1 ring-[#EF6F29]/30"
                        : "border-white/[0.06] bg-[#0a0a0a] hover:border-white/10 hover:bg-[#0a0a0a]/80"
                    }`}
                  >
                    <input
                      type="radio"
                      name="position"
                      value={pos.value}
                      checked={form.position === pos.value}
                      onChange={(e) => update("position", e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        form.position === pos.value
                          ? "border-[#EF6F29] bg-[#EF6F29]"
                          : "border-white/20"
                      }`}
                    >
                      {form.position === pos.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{pos.label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{pos.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Why & How */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="w-5 h-5 text-[#EF6F29]" />
                <h2 className="text-xl font-semibold text-white">Almost Done</h2>
              </div>

              <div>
                <label className={labelClass}>
                  Why should we hire you? <span className="text-[#EF6F29]">*</span>
                </label>
                <textarea
                  value={form.why_hire}
                  onChange={(e) => update("why_hire", e.target.value)}
                  placeholder="Tell us what makes you a great fit for this role..."
                  rows={5}
                  className={inputClass + " resize-none"}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>How did you find us?</label>
                <select
                  value={form.how_found}
                  onChange={(e) => update("how_found", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  <option value="Discord">Discord</option>
                  <option value="Google">Google</option>
                  <option value="Friend">Friend</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#EF6F29] hover:bg-[#EF6F29]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-[#EF6F29]/20 hover:shadow-[#EF6F29]/30"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
