import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetailClient } from "@/components/product-detail-client"
import { RecentlyViewedWrapper } from "./recently-viewed-wrapper"
import { notFound } from "next/navigation"
import { getProductsFromDB, getProductByIdFromDB } from "@/lib/db-products"
import { getProductReviewCount } from "@/lib/review-counts"
import { SITE_URL, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export async function generateStaticParams() {
  const products = await getProductsFromDB()
  return products.map((product) => ({ slug: product.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductByIdFromDB(slug)
  if (!product) return { title: "Product Not Found" }

  // Absolute URL — Discord/Telegram scrapers don't resolve relative paths reliably.
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `https://www.lethalsolutions.me${product.image}`

  const description = product.longDescription || product.description
  return {
    title: `${product.name}`,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: "website",
      siteName: "Lethal Solutions",
      url: `${SITE_URL}/products/${product.id}`,
      title: `${product.name} | Lethal Solutions`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Lethal Solutions`,
      description,
      images: [imageUrl],
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

  const productImageAbs = product.image.startsWith("http")
    ? product.image
    : `${SITE_URL}${product.image}`
  const reviewCount = Math.max(getProductReviewCount(product.id), 25)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription || product.description,
    image: productImageAbs,
    sku: product.id,
    url: `${SITE_URL}/products/${product.id}`,
    brand: { "@type": "Brand", name: "Lethal Solutions" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: (Math.min(...product.variants.map((v) => v.priceInPence)) / 100).toFixed(2),
      highPrice: (Math.max(...product.variants.map((v) => v.priceInPence)) / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.id}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    },
  }

  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Products", url: `${SITE_URL}/products` },
    { name: product.name, url: `${SITE_URL}/products/${product.id}` },
  ])

  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
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
