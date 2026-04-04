import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetailClient } from "@/components/product-detail-client"
import { RecentlyViewedWrapper } from "./recently-viewed-wrapper"
import { notFound } from "next/navigation"
import { getProductsFromDB, getProductByIdFromDB } from "@/lib/db-products"

export async function generateStaticParams() {
  const products = await getProductsFromDB()
  return products.map((product) => ({ slug: product.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductByIdFromDB(slug)
  if (!product) return { title: "Product Not Found" }
  return {
    title: `${product.name} | Lethal Solutions`,
    description: product.longDescription || product.description,
    openGraph: {
      title: `${product.name} | Lethal Solutions`,
      description: product.longDescription || product.description,
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductByIdFromDB(slug)
  if (!product) notFound()

  let stockSeed = 0
  for (let i = 0; i < product.id.length; i++) stockSeed += product.id.charCodeAt(i)
  const stock = 5 + (stockSeed % 20)

  const transformedProduct = {
    id: product.id,
    name: product.name,
    slug: product.id,
    description: product.description,
    longDescription: product.longDescription,
    features: product.features,
    category: product.category,
    image: product.image,
    stock,
    sellAuthProductId: product.sellAuthProductId,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.priceInPence / 100,
      sellAuthVariant: v.sellAuthVariant,
    })),
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription || product.description,
    image: `https://www.lethalsolutions.me${product.image}`,
    brand: { "@type": "Brand", name: "Lethal Solutions" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: (Math.min(...product.variants.map((v) => v.priceInPence)) / 100).toFixed(2),
      highPrice: (Math.max(...product.variants.map((v) => v.priceInPence)) / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "847",
    },
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <section className="pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <ProductDetailClient product={transformedProduct} />
          <RecentlyViewedWrapper productId={product.id} />
        </div>
      </section>
      <Footer />
    </main>
  )
}
