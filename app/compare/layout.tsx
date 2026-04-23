import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Compare DMA Cheats, Spoofers & Bundles",
  description:
    "Compare Lethal Solutions products side-by-side — DMA cheats, HWID spoofers and bundles. Features, games supported, and pricing.",
  keywords: ["DMA comparison", "spoofer comparison", "Blurred vs Streck", "DMA bundles"],
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare DMA Cheats, Spoofers & Bundles | Lethal Solutions",
    description: "Side-by-side comparison of cheats, spoofers, firmware and hardware bundles.",
    url: `${SITE_URL}/compare`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Compare products" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Compare", url: `${SITE_URL}/compare` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
