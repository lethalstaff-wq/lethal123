import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Careers — Join the Lethal Solutions Team",
  description:
    "Open roles at Lethal Solutions — developers, support staff, content creators, researchers. Remote, paid, and async-friendly.",
  keywords: ["careers", "jobs", "gaming tools careers", "remote work"],
  alternates: { canonical: "/apply" },
  openGraph: {
    title: "Careers — Join the Lethal Solutions Team",
    description: "Open roles — developers, support, content, research. Remote and paid.",
    url: `${SITE_URL}/apply`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Careers at Lethal" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Careers", url: `${SITE_URL}/apply` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
