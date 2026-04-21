import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Home, ShoppingBag, Compass } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <section className="flex items-center justify-center min-h-[80vh] px-4 pt-28 pb-20 relative overflow-hidden">
        <div className="text-center max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.025] mb-6">
            <Compass className="h-3.5 w-3.5 text-[#f97316]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Lost in transit</span>
          </div>

          <div className="relative mb-8 select-none">
            <p
              className="font-display text-[10rem] sm:text-[14rem] font-black leading-none tracking-[-0.05em]"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(249, 115, 22, 0.06) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <p
                className="font-display text-5xl sm:text-6xl font-black tracking-[-0.04em]"
                style={{
                  background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 40px rgba(249, 115, 22, 0.51))",
                }}
              >
                404
              </p>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            This page went dark
          </h1>
          <p className="text-[15px] text-white/65 mb-10 max-w-sm mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[14px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 8px 30px rgba(249, 115, 22, 0.51), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <Home className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.025] px-7 py-3.5 text-[14px] font-bold text-white/85 hover:border-[#f97316]/30 hover:text-[#f97316] hover:bg-[#f97316]/[0.06] transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse products
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
