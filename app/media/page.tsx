import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { MediaLibrary } from "@/components/media-library-client"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Media Library — Videos, Clips & Walkthroughs",
  description:
    "Watch setup walkthroughs, product showcases, gameplay clips, and patch recaps — every Lethal Solutions video in one player.",
  keywords: ["gaming videos", "DMA showcase", "gameplay clips", "setup walkthrough"],
  alternates: { canonical: "/media" },
  openGraph: {
    title: "Media Library — Videos, Clips & Walkthroughs | Lethal Solutions",
    description: "All Lethal Solutions videos — setup guides, showcases, gameplay, changelog recaps.",
    url: `${SITE_URL}/media`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Media library" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function MediaPage() {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Media", url: `${SITE_URL}/media` },
  ])
  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <section className="relative pt-36 pb-10 px-6 sm:px-10 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <SectionEyebrow label="Media Library" />
          <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Watch it </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>live</span>
          </h1>
          <p className="text-[16px] text-white/55 max-w-2xl mx-auto leading-relaxed">
            Setup walkthroughs, unboxings, gameplay runs and patch recaps — all playable right here.
          </p>
        </div>
      </section>

      <MediaLibrary />

      <Footer />
    </main>
  )
}
