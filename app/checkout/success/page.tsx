import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.076.076 0 0 0-.041-.107 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-lg relative">
          {/* Background glow */}
          <div className="absolute -inset-12 bg-[#f97316]/5 rounded-[3rem] blur-3xl" />

          <div className="relative rounded-3xl border border-[#f97316]/20 bg-white/[0.012] backdrop-blur-xl overflow-hidden">
            {/* Top gradient */}
            <div className="h-1" style={{ background: "linear-gradient(to right, #f97316, #f59e0b, #f97316)" }} />

            <div className="p-10 text-center">
              {/* Success icon */}
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center border border-emerald-500/30" style={{ background: "linear-gradient(to bottom right, rgba(16,185,129,0.3), rgba(16,185,129,0.05))" }}>
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              </div>

              <h1 className="text-3xl font-black tracking-tight mb-2 text-white/90">Order <span className="text-[#f97316]">Confirmed</span></h1>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">
                Your order is locked in. Check your email for your license key and setup guide — you&apos;ll be ready in minutes.
              </p>

              {/* Next steps */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5 mb-8 text-left">
                <p className="text-sm font-bold mb-3 text-white/90">Your next steps:</p>
                <div className="space-y-3">
                  {[
                    "Check your email for order confirmation",
                    "Join our Discord for instant support",
                    "Follow the setup guide included",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#f97316]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#f97316]">{i + 1}</span>
                      </div>
                      <span className="text-sm text-white/40">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Link href="/profile" className="flex-1">
                  <button
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-orange-500/25"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                  >
                    My Profile
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="https://discord.gg/lethaldma" target="_blank" className="flex-1">
                  <button className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm font-semibold text-white/40 hover:bg-white/[0.04] transition-all">
                    <DiscordIcon className="h-4 w-4" />
                    Discord
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
