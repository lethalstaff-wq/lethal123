"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push("/profile")
      }, 2000)
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
                Security
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1] mb-3">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Reset </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249, 115, 22, 0.43))" }}>Password</span>
            </h1>
            <p className="mt-2 text-[14px] text-white/55">Enter your new password below.</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6 backdrop-blur-sm">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f97316]/20 bg-[#f97316]/[0.06]">
                <Lock className="h-7 w-7 text-[#f97316]" />
              </div>
            </div>

            {success ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.06]">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">Password Updated!</h3>
                <p className="text-sm text-white/30">
                  Redirecting to dashboard...
                </p>
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
                  <label className="text-sm font-semibold text-white/50">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="focus-ring-premium w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 pr-10 text-[15px] text-white placeholder:text-white/35 outline-none transition-all focus:bg-white/[0.05]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/50">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="focus-ring-premium w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none transition-all focus:bg-white/[0.05]"
                  />
                </div>

                <button
                  type="submit"
                  data-cursor="cta"
                  data-cursor-label={isLoading ? "Wait" : "Update"}
                  className="cursor-cta press-spring group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_0_28px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                  <span className="relative z-10">{isLoading ? "Updating…" : "Update Password"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
