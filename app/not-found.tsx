import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Home, ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="flex items-center justify-center min-h-[80vh] px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <div className="text-center max-w-lg relative z-10">
          {/* Glowing 404 */}
          <div className="relative mb-8">
            <p className="text-[12rem] sm:text-[16rem] font-black text-primary/10 leading-none select-none">404</p>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-6xl sm:text-7xl font-black text-primary">404</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
            This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-7 py-3.5 text-sm font-bold hover:bg-card/50 transition-all group"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
