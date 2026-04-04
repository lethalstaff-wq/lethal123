import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center max-w-md">
          <p className="text-8xl font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {"The page you're looking for doesn't exist or has been moved."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold hover:bg-card/50 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
