import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Changelog — Product Updates & Patches",
  description:
    "Latest updates, patches, security fixes and new features across every Lethal Solutions product — DMA cheats, spoofers, firmware.",
  keywords: ["changelog", "DMA updates", "spoofer patches", "product releases"],
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: "Changelog — Product Updates & Patches | Lethal Solutions",
    description: "Every update, patch and new feature across Lethal Solutions products.",
    url: `${SITE_URL}/changelog`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Lethal Solutions changelog" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Changelog", url: `${SITE_URL}/changelog` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
