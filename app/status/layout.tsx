import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "System Status — Live Detection & Updates",
  description:
    "Real-time status for every Lethal Solutions product. Check which cheats, spoofers and firmware are undetected before you play.",
  keywords: ["system status", "DMA status", "spoofer status", "undetected"],
  alternates: { canonical: "/status" },
  openGraph: {
    title: "System Status — Live Detection & Updates | Lethal Solutions",
    description: "Live status of every DMA cheat, spoofer and firmware we ship.",
    url: `${SITE_URL}/status`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "System status" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Status", url: `${SITE_URL}/status` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
