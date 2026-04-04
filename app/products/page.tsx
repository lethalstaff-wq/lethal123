import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductsGridDark } from "@/components/products-grid-dark"
import { Sparkles } from "lucide-react"
import { getProductsFromDB } from "@/lib/db-products"

export const metadata = {
  title: "Products | Lethal Solutions",
  description: "Browse our full catalog of premium gaming solutions, DMA cheats, spoofers, and hardware bundles.",
}

export default async function ProductsPage() {
  const products = await getProductsFromDB()

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>Full Catalog</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Our <span className="text-primary">Products</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium gaming solutions designed for competitive players. Browse our complete selection of cheats,
              spoofers, and DMA hardware.
            </p>
          </div>

          <ProductsGridDark products={products} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
