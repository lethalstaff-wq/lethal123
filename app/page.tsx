import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GlowDivider } from "@/components/glow-divider"
import { StatsStrip } from "@/components/stats-strip"
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo-jsonld"

// Dynamic imports for below-the-fold sections — reduces initial JS bundle
const AboutSection = dynamic(() => import("@/components/about-section").then((m) => ({ default: m.AboutSection })), {
  loading: () => <SectionSkeleton />,
})
const ServicesSection = dynamic(
  () => import("@/components/services-section").then((m) => ({ default: m.ServicesSection })),
  { loading: () => <SectionSkeleton /> },
)
const ProcessSection = dynamic(
  () => import("@/components/process-section").then((m) => ({ default: m.ProcessSection })),
  { loading: () => <SectionSkeleton /> },
)
const PricingSection = dynamic(
  () => import("@/components/pricing-section").then((m) => ({ default: m.PricingSection })),
  { loading: () => <SectionSkeleton /> },
)
const TestimonialsSection = dynamic(
  () => import("@/components/testimonials-section").then((m) => ({ default: m.TestimonialsSection })),
  { loading: () => <SectionSkeleton /> },
)
const ContactSection = dynamic(
  () => import("@/components/contact-section").then((m) => ({ default: m.ContactSection })),
  { loading: () => <SectionSkeleton /> },
)
const FaqSection = dynamic(
  () => import("@/components/faq-section").then((m) => ({ default: m.FaqSection })),
  { loading: () => <SectionSkeleton /> },
)


// Plain hairline — alternates with GlowDivider so we don't get 6+ orange
// shimmer lines stacked down the page. Same max-width as the glow version.
function Hairline() {
  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="h-px border-t border-white/[0.06]" />
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="h-8 w-48 rounded-lg bg-white/[0.06] animate-pulse mx-auto mb-4" />
        <div className="h-4 w-96 max-w-full rounded bg-white/[0.04] animate-pulse mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.015] border border-white/[0.06] overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const orgLd = organizationJsonLd()
  const siteLd = websiteJsonLd()
  return (
    <main className="flex min-h-screen flex-col bg-transparent relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      <Navbar />
      <HeroSection />
      <ScrollReveal>
        <StatsStrip />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal>
        <AboutSection />
      </ScrollReveal>
      <Hairline />
      <ScrollReveal delay={100}>
        <ServicesSection />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal delay={100}>
        <ProcessSection />
      </ScrollReveal>
      <Hairline />
      <ScrollReveal delay={100}>
        <PricingSection />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal delay={100}>
        <TestimonialsSection />
      </ScrollReveal>
      <Hairline />
      <ScrollReveal delay={100}>
        <FaqSection />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal delay={100}>
        <ContactSection />
      </ScrollReveal>
      <Footer />
    </main>
  )
}
