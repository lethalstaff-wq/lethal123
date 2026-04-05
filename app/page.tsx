import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GlowDivider } from "@/components/glow-divider"
import { StatsBar } from "@/components/stats-bar"

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


function SectionSkeleton() {
  return (
    <div className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="h-8 w-48 rounded-lg bg-muted/30 animate-pulse mx-auto mb-4" />
        <div className="h-4 w-96 max-w-full rounded bg-muted/20 animate-pulse mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-card/30 border border-border/30 overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-muted/10 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lethal Solutions",
  url: "https://www.lethalsolutions.me",
  logo: "https://www.lethalsolutions.me/images/logo.png",
  sameAs: [
    "https://discord.gg/lethaldma",
    "https://www.youtube.com/@ujukcheats-x4b",
    "https://t.me/lethalsolutions",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://discord.gg/lethaldma",
    availableLanguage: "English",
  },
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <Navbar />
      <HeroSection />
      <StatsBar />
      <GlowDivider />
      <ScrollReveal>
        <AboutSection />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal delay={100}>
        <ServicesSection />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal delay={100}>
        <ProcessSection />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal delay={100}>
        <PricingSection />
      </ScrollReveal>
      <GlowDivider />
      <ScrollReveal delay={100}>
        <TestimonialsSection />
      </ScrollReveal>
      <GlowDivider />
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
