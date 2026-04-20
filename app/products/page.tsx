import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductsGridDark } from "@/components/products-grid-dark"
import { getProductsFromDB } from "@/lib/db-products"

export const metadata = {
  title: "Products | Lethal Solutions",
  description: "Browse our full catalog of premium gaming solutions, DMA cheats, spoofers, and hardware bundles.",
}

export default async function ProductsPage() {
  const products = await getProductsFromDB()

  return (
    <main className="flex min-h-screen flex-col bg-transparent relative overflow-x-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <Navbar />

      <section className="relative pt-32 pb-16 px-6 sm:px-10 z-10">
        {/* Aurora blob */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06), transparent 70%)" }} />

        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Full Catalog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] mb-6 text-white">
            Our{" "}
            <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Products</span>
          </h1>
          <p className="text-[17px] text-white/35 max-w-xl mx-auto leading-relaxed">
            Premium gaming solutions designed for competitive players.
          </p>
        </div>
      </section>

      <section className="py-8 px-6 sm:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <ProductsGridDark products={products} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
