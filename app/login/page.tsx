"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react"

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
    "w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition-all focus:border-[#f97316]/30 focus:bg-white/[0.04]"

  return (
    <main className="flex h-screen bg-transparent overflow-hidden">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 xl:p-16 relative overflow-hidden border-r border-white/[0.04]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/[0.03] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f97316]/[0.02] rounded-full blur-[120px]" />

        {/* Logo */}
        <Link href="/" className="relative inline-flex items-center gap-2.5">
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
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249,115,22,0.3))" }}>in one place.</span>
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

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(null); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === "login"
                  ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("signup"); setError(null); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "signup"
                  ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              Sign Up
            </button>
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
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-400">{error}</div>
              )}

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.2)] transition-all hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>Sign In<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
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
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-400">{error}</div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-sm text-emerald-400">{success}</div>
              )}

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.2)] transition-all hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>Create Account<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-[11px] text-white/45">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-white/55 hover:text-white/40 transition-colors">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="text-white/55 hover:text-white/40 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </main>
  )
}
