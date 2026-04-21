"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Error tracked via digest — production-safe
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-transparent">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 mx-auto mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_28px_rgba(239,68,68,0.18)]">
          <AlertTriangle className="h-7 w-7 text-red-400" style={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,0.55))" }} />
        </div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-3">Something went wrong</h1>
        <p className="text-[15px] text-white/65 mb-8 leading-relaxed">
          An unexpected error occurred. Try refreshing the page or head back to the homepage.
        </p>
        {error.digest && (
          <p className="font-mono text-[11px] text-white/40 mb-8">
            Ref: <span className="text-white/65">{error.digest}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            data-cursor="cta"
            data-cursor-label="Retry"
            className="cursor-cta press-spring group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[14px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 8px 30px rgba(249, 115, 22, 0.51), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
            <RefreshCw className="relative z-10 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="relative z-10">Try again</span>
          </button>
          <Link
            href="/"
            data-cursor="cta"
            data-cursor-label="Home"
            className="cursor-cta press-spring inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.025] px-6 py-3 text-[14px] font-bold text-white/85 hover:border-[#f97316]/35 hover:text-[#f97316] hover:bg-[#f97316]/[0.06] transition-all"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
