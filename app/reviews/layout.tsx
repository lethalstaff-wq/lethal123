import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"
import { getTotalReviewCount } from "@/lib/review-counts"

// Revalidate SEO metadata + JSON-LD hourly so the numbers don't drift far from
// the live /api/reviews/count value.
export const revalidate = 3600

async function fetchLiveReviewCount(): Promise<number> {
  const fallback = getTotalReviewCount()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return fallback
  try {
    const db = createClient(url, key)
    const nowISO = new Date().toISOString()
    const { count, error } = await db
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .or(`source.eq.sellauth_legacy,created_at.lte.${nowISO}`)
    if (error) return fallback
    return count ?? fallback
  } catch {
    return fallback
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const count = await fetchLiveReviewCount()
  return {
    title: "Reviews — Verified Customer Feedback",
    description: `Read verified reviews of Lethal Solutions products — DMA cheats, HWID spoofers, firmware. 4.9/5 average from ${count} buyers.`,
    keywords: ["Lethal Solutions reviews", "DMA cheat reviews", "HWID spoofer reviews", "customer feedback"],
    alternates: { canonical: "/reviews" },
    openGraph: {
      title: `Reviews — 4.9/5 from ${count} buyers | Lethal Solutions`,
      description: "Verified customer reviews of our DMA cheats, HWID spoofers and custom firmware.",
      url: `${SITE_URL}/reviews`,
      type: "website",
      siteName: "Lethal Solutions",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Lethal Solutions reviews" }],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
  }
}

export default async function ReviewsLayout({ children }: { children: React.ReactNode }) {
  const count = await fetchLiveReviewCount()
  const aggregateRatingLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lethal Solutions",
    url: SITE_URL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: String(count),
      bestRating: "5",
      worstRating: "1",
    },
  }
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Reviews", url: `${SITE_URL}/reviews` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
