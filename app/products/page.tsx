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
      <Navbar />

      <section className="relative pt-36 pb-20 px-6 sm:px-10 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Full Catalog</span>
          </div>
          {/* Scan line divider */}
          <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Our </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Products</span>
          </h1>
          <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed">
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
