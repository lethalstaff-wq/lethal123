"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Loader2, ArrowRight, XCircle, CheckCircle2 } from "lucide-react"
import { Magnetic } from "@/components/magnetic-button"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.refresh()
      await new Promise(r => setTimeout(r, 100))
      window.location.href = "/profile"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const discord = formData.get("discord") as string

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/profile`,
          data: discord ? { discord_username: discord } : {},
        },
      })
      if (error) throw error
      setSuccess("Check your email to confirm your account!")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass =
    "focus-ring-premium w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none transition-all focus:bg-white/[0.05]"

  return (
    <main className="flex h-screen bg-transparent overflow-hidden">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 xl:p-16 relative overflow-hidden border-r border-white/[0.04]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/[0.045] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-[#f97316]/[0.03] rounded-full blur-[140px]" style={{ animation: "loginOrb 18s ease-in-out infinite" }} />
        <div className="absolute top-[15%] right-[5%] w-[320px] h-[320px] bg-amber-400/[0.04] rounded-full blur-[120px]" style={{ animation: "loginOrb 14s ease-in-out infinite reverse" }} />

        {/* Logo */}
        <Link href="/" data-cursor="cta" data-cursor-label="Home" className="cursor-cta relative inline-flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="Lethal Solutions" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-white font-bold text-lg">Lethal Solutions</span>
        </Link>

        {/* Center */}
        <div className="relative">
          <p className="text-[13px] font-medium text-[#f97316]/60 tracking-wide uppercase mb-4">
            Customer Portal
          </p>
          <h1 className="font-display text-[44px] xl:text-[60px] font-bold leading-[0.95] tracking-[-0.04em]">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Manage<br />everything<br /></span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>in one place.</span>
          </h1>
          <p className="mt-6 text-[15px] text-white/45 leading-relaxed max-w-[340px]">
            Licenses, downloads, orders, support — all from your dashboard.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative flex items-center gap-6 ml-4 xl:ml-8">
          {[
            { value: "2,400+", label: "Active users" },
            { value: "99.9%", label: "Uptime" },
            { value: "<2h", label: "Patch response" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              {i > 0 && <div className="w-px h-8 bg-white/[0.06]" />}
              <div>
                <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-white/55 mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="Lethal Solutions" width={32} height={32} className="h-8 w-8 object-contain" />
              <span className="text-white font-bold text-lg">Lethal Solutions</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">
              {activeTab === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-2 text-[14px] text-white/55">
              {activeTab === "login"
                ? "Enter your credentials to continue."
                : "Get started in seconds."}
            </p>
          </div>

          {/* Tabs with layoutId morph */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            {([
              { key: "login", label: "Login" },
              { key: "signup", label: "Sign Up" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key); setError(null); setSuccess(""); }}
                data-cursor="cta"
                data-cursor-label={tab.label}
                className={`cursor-cta relative flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                  activeTab === tab.key ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {activeTab === tab.key && (
                  <motion.span
                    layoutId="login-tab-active"
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.58)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-[2]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Login */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">Email</label>
                <input id="login-email" name="email" type="email" placeholder="you@example.com" required className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">Password</label>
                  <a href="/forgot-password" className="text-[11px] text-[#f97316]/70 hover:text-[#f97316] font-semibold transition-colors">Forgot?</a>
                </div>
                <input id="login-password" name="password" type="password" placeholder="••••••••" required className={inputClass} />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-3 text-[13px] text-red-300 flex items-start gap-2 animate-shake">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Magnetic strength={0.1}>
              <button
                type="submit"
                data-cursor="cta"
                data-cursor-label={isLoading ? "Wait" : activeTab === "login" ? "Sign In" : "Sign Up"}
                className="cursor-cta press-spring group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_0_28px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                {isLoading ? <Loader2 className="relative z-10 h-4 w-4 animate-spin" /> : (
                  <><span className="relative z-10">Sign In</span><ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
              </Magnetic>
            </form>
          )}

          {/* Signup */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">Email</label>
                <input id="signup-email" name="email" type="email" placeholder="you@example.com" required className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">Password</label>
                <input id="signup-password" name="password" type="password" placeholder="••••••••" required minLength={6} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-discord" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">
                  Discord <span className="text-white/45">(optional)</span>
                </label>
                <input id="signup-discord" name="discord" placeholder="username" className={inputClass} />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-3 text-[13px] text-red-300 flex items-start gap-2 animate-shake">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3 text-[13px] text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <Magnetic strength={0.1}>
              <button
                type="submit"
                data-cursor="cta"
                data-cursor-label={isLoading ? "Wait" : "Sign Up"}
                className="cursor-cta press-spring group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_0_28px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                {isLoading ? <Loader2 className="relative z-10 h-4 w-4 animate-spin" /> : (
                  <><span className="relative z-10">Create Account</span><ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
              </Magnetic>
            </form>
          )}

          <p className="mt-6 text-center text-[11px] text-white/45">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-white/55 hover:text-white transition-colors">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="text-white/55 hover:text-white transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
      <style jsx>{`
        @keyframes loginOrb {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.08); }
        }
      `}</style>
    </main>
  )
}
