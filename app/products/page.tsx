import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductsGridDark } from "@/components/products-grid-dark"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { ComparisonTable } from "@/components/comparison-table"
import { getProductsFromDB } from "@/lib/db-products"
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbListJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Products — DMA Cheats, Spoofers & Firmware",
  description:
    "Browse every Lethal Solutions product: DMA cheats for Fortnite/Apex/Valorant, kernel-level HWID spoofers, custom DMA firmware, and hardware bundles.",
  keywords: ["DMA cheats", "HWID spoofer", "Fortnite cheat", "Blurred DMA", "Streck DMA", "firmware"],
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Products — DMA Cheats, Spoofers & Firmware | Lethal Solutions",
    description: "Full catalog of premium gaming tools — DMA cheats, HWID spoofers, custom firmware, and bundles.",
    url: `${SITE_URL}/products`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Lethal Solutions catalog" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default async function ProductsPage() {
  const products = await getProductsFromDB()

  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Products", url: `${SITE_URL}/products` },
  ])
  const collectionLd = collectionPageJsonLd({
    name: "Lethal Solutions Products",
    description: "DMA cheats, HWID spoofers, custom firmware, and hardware bundles.",
    url: `${SITE_URL}/products`,
  })

  return (
    <main className="flex min-h-screen flex-col bg-transparent relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <Navbar />

      <section className="relative pt-36 pb-14 px-6 sm:px-10 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <SectionEyebrow label="Full Catalog" />
          {/* Scan line divider */}
          <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Every </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>tool</span>
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.</span>
          </h1>
          <p className="text-[17px] text-white/55 max-w-lg mx-auto leading-relaxed">
            DMA cheats, spoofers, firmware, bundles. Instant delivery. Patched within 2h.
          </p>
        </div>
      </section>

      <section className="pt-4 pb-16 px-6 sm:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <ProductsGridDark products={products} />
        </div>
      </section>

      <ComparisonTable />

      <Footer />
    </main>
  )
}
