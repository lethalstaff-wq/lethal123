"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight, XCircle, CheckCircle2, Mail, ArrowLeft } from "lucide-react"
import { Magnetic } from "@/components/magnetic-button"
import { useDiscordOnline } from "@/components/discord-online"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [magicMode, setMagicMode] = useState(false)
  const router = useRouter()
  const { count: discordOnline } = useDiscordOnline()

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

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setSuccess("Magic link sent — check your inbox.")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't send magic link")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: "google" | "discord") => {
    setError(null)
    setIsLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OAuth failed")
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

  // Format live presence count (e.g. "3,247 online"). Falls back to static when offline.
  const onlineLabel =
    typeof discordOnline === "number" && discordOnline > 0
      ? `${discordOnline.toLocaleString()} online`
      : "3,200 online"

  return (
    <main className="flex min-h-screen lg:h-screen bg-transparent lg:overflow-hidden">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col w-[45%] p-12 xl:p-16 pb-24 xl:pb-28 relative overflow-hidden border-r border-white/[0.04]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/[0.045] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-[#f97316]/[0.03] rounded-full blur-[140px]" style={{ animation: "loginOrb 18s ease-in-out infinite" }} />
        <div className="absolute top-[15%] right-[5%] w-[320px] h-[320px] bg-amber-400/[0.04] rounded-full blur-[120px]" style={{ animation: "loginOrb 14s ease-in-out infinite reverse" }} />

        {/* Logo */}
        <Link href="/" data-cursor="cta" data-cursor-label="Home" className="cursor-cta relative inline-flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="Lethal Solutions" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-white font-bold text-lg">Lethal Solutions</span>
        </Link>

        {/* Center — pushed up from bottom to give stats more visual weight */}
        <div className="relative flex-1 flex flex-col justify-center -mt-8">
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

        {/* Bottom stats — bumped up from edge for more visual weight */}
        <div className="relative flex items-center gap-6 ml-4 xl:ml-8 mb-6">
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
      <div className="flex-1 flex items-center justify-center p-6 pt-20 lg:pt-12 md:p-12">
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
              {magicMode ? "Magic link" : activeTab === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-2 text-[14px] text-white/55">
              {magicMode
                ? "We'll email you a one-tap sign-in link."
                : activeTab === "login"
                  ? "Enter your credentials to continue."
                  : "Get started in seconds."}
            </p>
          </div>

          {/* Tabs with layoutId morph — hidden in magic-link mode */}
          {!magicMode && (
            <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
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
          )}

          {/* Magic-link prompt — only shown on login tab */}
          {!magicMode && activeTab === "login" && (
            <button
              type="button"
              onClick={() => { setMagicMode(true); setError(null); setSuccess("") }}
              data-cursor="cta"
              data-cursor-label="Magic link"
              className="cursor-cta group mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#f97316]/80 hover:text-[#f97316] transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Or sign in with a magic link
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          <AnimatePresence mode="wait">
          {/* Magic link — email-only */}
          {magicMode && (
            <motion.form
              key="magic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleMagicLink}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label htmlFor="magic-email" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">Email</label>
                <input id="magic-email" name="email" type="email" placeholder="you@example.com" required autoFocus className={inputClass} />
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

              <Magnetic strength={0.1} className="block w-full">
              <button
                type="submit"
                data-cursor="cta"
                data-cursor-label={isLoading ? "Wait" : "Send link"}
                className="cursor-cta press-spring group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_0_28px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                {isLoading ? <Loader2 className="relative z-10 h-4 w-4 animate-spin" /> : (
                  <><Mail className="relative z-10 h-4 w-4" /><span className="relative z-10">Send magic link</span></>
                )}
              </button>
              </Magnetic>

              <button
                type="button"
                onClick={() => { setMagicMode(false); setError(null); setSuccess("") }}
                data-cursor="cta"
                data-cursor-label="Back"
                className="cursor-cta inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to password sign-in
              </button>
            </motion.form>
          )}

          {/* Login */}
          {!magicMode && activeTab === "login" && (
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">Email</label>
                <input id="login-email" name="email" type="email" placeholder="you@example.com" required className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-[11px] font-bold text-white/65 uppercase tracking-[0.12em]">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className={`${inputClass} pr-20`}
                  />
                  {/* Forgot? link — moved inside the input, absolute inline-end */}
                  <a
                    href="/forgot-password"
                    data-cursor="cta"
                    data-cursor-label="Forgot?"
                    className="cursor-cta absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#f97316]/70 hover:text-[#f97316] font-semibold transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-3 text-[13px] text-red-300 flex items-start gap-2 animate-shake">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Magnetic strength={0.1} className="block w-full">
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
            </motion.form>
          )}

          {/* Signup */}
          {!magicMode && activeTab === "signup" && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignup}
              className="space-y-5"
            >
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

              <Magnetic strength={0.1} className="block w-full">
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
            </motion.form>
          )}
          </AnimatePresence>

          {/* OAuth — Google + Discord (hidden in magic-link mode) */}
          {!magicMode && (
          <>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">or continue with</span>
            <span className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={isLoading}
              data-cursor="cta"
              data-cursor-label="Google"
              className="cursor-cta press-spring inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13.5px] font-semibold text-white/85 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("discord")}
              disabled={isLoading}
              data-cursor="cta"
              data-cursor-label="Discord"
              className="cursor-cta press-spring inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/[0.1] px-4 py-3 text-[13.5px] font-semibold text-white/90 transition-all hover:border-[#5865F2]/55 hover:bg-[#5865F2]/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" fill="#5865F2" className="h-4 w-4">
                <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Discord
            </button>
          </div>
          </>
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
