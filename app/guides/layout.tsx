import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Setup Guides — DMA, Spoofer, Firmware & KMBox",
  description:
    "Step-by-step setup guides for DMA cheats, HWID spoofers, firmware flashing, KMBox configuration, memory map generation, and troubleshooting.",
  keywords: ["DMA setup", "spoofer guide", "KMBox config", "firmware flash", "memory map", "DMA troubleshooting"],
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Setup Guides — DMA, Spoofer, Firmware & KMBox | Lethal Solutions",
    description: "The complete Lethal Solutions knowledge base — installation, config, firmware, troubleshooting.",
    url: `${SITE_URL}/guides`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Lethal Solutions guides" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Guides", url: `${SITE_URL}/guides` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
