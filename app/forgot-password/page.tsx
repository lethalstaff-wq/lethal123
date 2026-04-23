"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-transparent px-4 pb-20 pt-32">
        <div className="w-full max-w-md">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
                Recovery
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1] mb-3">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forgot </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249, 115, 22, 0.43))" }}>Password?</span>
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6 backdrop-blur-sm">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f97316]/20 bg-[#f97316]/[0.06]">
                <Mail className="h-7 w-7 text-[#f97316]" />
              </div>
            </div>

            {success ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.06]">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">Check your email</h3>
                <p className="mb-6 text-sm text-white/30">
                  We&apos;ve sent a password reset link to{" "}
                  <strong className="text-white/60">{email}</strong>
                </p>
                <Link href="/login">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-sm font-semibold text-white/55 transition-colors hover:border-white/[0.1] hover:text-white/60"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/55 uppercase tracking-[0.15em]">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="focus-ring-premium w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none transition-all focus:bg-white/[0.05]"
                  />
                </div>

                <button
                  type="submit"
                  data-cursor="cta"
                  data-cursor-label={isLoading ? "Wait" : "Send"}
                  className="cursor-cta press-spring group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_0_28px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                  <span className="relative z-10">{isLoading ? "Sending…" : "Send Reset Link"}</span>
                </button>

                <div className="pt-4 text-center">
                  <Link
                    href="/login"
                    data-cursor="cta"
                    data-cursor-label="Back"
                    className="cursor-cta inline-flex items-center gap-2 text-[13px] text-[#f97316]/70 transition-colors hover:text-[#f97316] font-semibold group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
