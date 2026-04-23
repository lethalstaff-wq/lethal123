import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { InteractiveSetupGuide } from "@/components/interactive-setup-guide"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Setup Guide — Install & Play in 5 Minutes",
  description:
    "Step-by-step interactive setup walkthrough — download, install, configure, and get running in under five minutes.",
  keywords: ["setup guide", "installation", "DMA install", "spoofer install", "quick start"],
  alternates: { canonical: "/setup" },
  openGraph: {
    title: "Setup Guide — Install & Play in 5 Minutes | Lethal Solutions",
    description: "Interactive setup walkthrough — download, install, configure, play.",
    url: `${SITE_URL}/setup`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Setup Guide" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

export default function SetupPage() {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Setup", url: `${SITE_URL}/setup` },
  ])
  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <section className="relative pt-36 pb-12 px-6 sm:px-10 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <SectionEyebrow number="01" label="Setup Guide" />
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Up and running </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>in 5 minutes</span>
          </h1>
          <p className="text-[17px] text-white/55 max-w-2xl mx-auto leading-relaxed">
            Five steps. No bloat. No confusion. Scroll through — each step reveals as you go.
          </p>
        </div>
      </section>

      <InteractiveSetupGuide />

      <Footer />
    </main>
  )
}
