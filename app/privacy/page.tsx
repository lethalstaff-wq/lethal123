import type { Metadata } from "next"
import { Shield } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/section-eyebrow"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Lethal Solutions collects, stores, and protects your data — cookies, payment processors, account data, and your rights under GDPR.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Lethal Solutions",
    description: "How we handle your data — cookies, payments, accounts, GDPR rights.",
    url: "https://www.lethalsolutions.me/privacy",
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: "https://www.lethalsolutions.me/images/banner.png", width: 1200, height: 630, alt: "Privacy Policy" }],
  },
  twitter: { card: "summary_large_image", images: ["https://www.lethalsolutions.me/images/banner.png"] },
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-32 pb-20 px-4 relative">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <SectionEyebrow label="Legal" />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-5">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Privacy </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Policy</span>
            </h1>
            <p className="text-[15px] text-white/55">Last updated: January 2025</p>
          </div>

          <div className="space-y-10">
            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">1. Information We Collect</h2>
              <p className="text-white/55 leading-relaxed">
                We collect email addresses, payment information, and basic usage data. This information is used solely for 
                account management and service delivery.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">2. Data Privacy</h2>
              <p className="text-white/55 leading-relaxed">
                Your personal data is encrypted and stored securely. We do not sell, trade, or share your information with 
                third parties for marketing purposes.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">3. Cookies & Tracking</h2>
              <p className="text-white/55 leading-relaxed">
                We use essential cookies for site functionality and analytics. Tracking is minimal and used only to improve 
                our service.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">4. GDPR Compliance</h2>
              <p className="text-white/55 leading-relaxed">
                If you&apos;re in the EU, your data is handled in accordance with GDPR. You have the right to request, modify, 
                or delete your data.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">5. Data Retention</h2>
              <p className="text-white/55 leading-relaxed">
                Personal data is retained for as long as your account is active. Upon account deletion, data is purged 
                within 30 days.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">6. Third-Party Services</h2>
              <p className="text-white/55 leading-relaxed">
                We use payment processors and analytics services. These providers have their own privacy policies and may 
                collect limited information.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">7. Your Rights</h2>
              <p className="text-white/55 leading-relaxed">
                You have the right to access, modify, or request deletion of your personal data. Contact us via Discord 
                to exercise these rights.
              </p>
            </section>

            <div className="p-6 rounded-2xl bg-[#f97316]/5 border border-primary/20 flex gap-4">
              <Shield className="h-6 w-6 text-[#f97316] flex-shrink-0" />
              <div>
                <p className="font-bold mb-2">Your Privacy Matters</p>
                <p className="text-sm text-white/40">
                  We take data security seriously. All communications are encrypted and stored with industry-standard protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
