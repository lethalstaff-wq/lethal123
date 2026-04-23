import type { Metadata } from "next"
import { AlertCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/section-eyebrow"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of Lethal Solutions — licenses, refunds, permitted use, liability, account rules and disputes.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Lethal Solutions",
    description: "Licenses, refunds, permitted use, liability, and account rules.",
    url: "https://www.lethalsolutions.me/terms",
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: "https://www.lethalsolutions.me/images/banner.png", width: 1200, height: 630, alt: "Terms of Service" }],
  },
  twitter: { card: "summary_large_image", images: ["https://www.lethalsolutions.me/images/banner.png"] },
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pt-32 pb-20 px-4 relative">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <SectionEyebrow label="Legal" />
            <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-5">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Terms of </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Service</span>
            </h1>
            <p className="text-[15px] text-white/55">Last updated: January 2025</p>
          </div>

          <div className="space-y-10">
            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">1. Refund Policy</h2>
              <p className="text-white/55 leading-relaxed">
                Refunds are available within 24 hours of purchase if the product fails to function on your setup and our 
                support team cannot resolve the issue. Refund requests must be submitted via Discord ticket with your order ID. 
                No refunds for change of mind or successfully activated products. Subscription products may receive partial 
                refunds for unused time at our discretion.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">2. Virtual Goods</h2>
              <p className="text-white/55 leading-relaxed">
                Products provided are virtual goods and digital licenses. Once activated, they cannot be transferred, sold, 
                or resold. License is personal and non-transferable.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">3. Account Safety</h2>
              <p className="text-white/55 leading-relaxed">
                You are responsible for protecting your account credentials. We are not liable for unauthorized access or 
                account compromise. Use strong, unique passwords.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">4. Usage Terms</h2>
              <p className="text-white/55 leading-relaxed">
                Products are provided for authorized use only. Violation of game ToS or applicable laws may result in account 
                suspension or ban. We cannot provide assistance if your account is banned.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">5. Limitation of Liability</h2>
              <p className="text-white/55 leading-relaxed">
                We are not responsible for any loss, damage, or consequences resulting from the use of our products, including 
                but not limited to account bans, VAC bans, or other punitive measures.
              </p>
            </section>

            <section className="spotlight-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#f97316]/25 transition-all duration-300">
              <h2 className="font-display text-xl font-bold mb-3 text-white tracking-tight">6. Changes to Terms</h2>
              <p className="text-white/55 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service following any changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <div className="p-6 rounded-2xl bg-[#f97316]/5 border border-primary/20 flex gap-4">
              <AlertCircle className="h-6 w-6 text-[#f97316] flex-shrink-0" />
              <div>
                <p className="font-bold mb-2">Questions?</p>
                <p className="text-sm text-white/40">
                  Join our Discord server: <a href="https://discord.gg/lethaldma" className="text-[#f97316] hover:underline">discord.gg/lethaldma</a>
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
