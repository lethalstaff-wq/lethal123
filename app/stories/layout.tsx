import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Success Stories — Real Players, Real Comebacks",
  description:
    "Real player stories — from bans to comebacks, bronze to gold. See how Lethal Solutions products changed their game.",
  keywords: ["success stories", "player testimonials", "DMA success", "ranked climb"],
  alternates: { canonical: "/stories" },
  openGraph: {
    title: "Success Stories — Real Players, Real Comebacks | Lethal Solutions",
    description: "From bronze to gold, from bans to comebacks — real Lethal Solutions stories.",
    url: `${SITE_URL}/stories`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Lethal Solutions stories" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Stories", url: `${SITE_URL}/stories` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
