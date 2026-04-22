import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Reviews — Verified Customer Feedback",
  description:
    "Read verified reviews of Lethal Solutions products — DMA cheats, HWID spoofers, firmware. 4.9/5 average from 3447 buyers.",
  keywords: ["Lethal Solutions reviews", "DMA cheat reviews", "HWID spoofer reviews", "customer feedback"],
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Reviews — 4.9/5 from 3447 buyers | Lethal Solutions",
    description: "Verified customer reviews of our DMA cheats, HWID spoofers and custom firmware.",
    url: `${SITE_URL}/reviews`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Lethal Solutions reviews" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

// Organization-level AggregateRating. ratingValue + reviewCount match /reviews page copy.
const aggregateRatingLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lethal Solutions",
  url: SITE_URL,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "3447",
    bestRating: "5",
    worstRating: "1",
  },
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
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
