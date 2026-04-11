import { Shield } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Lethal Solutions",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black pt-32 pb-20 px-4 relative">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Privacy <span className="text-[#f97316]">Policy</span>
          </h1>
          <p className="text-white/40 mb-12">Last updated: January 2025</p>

          <div className="space-y-10">
            <section className="p-6 rounded-2xl bg-white/[0.02]/50 border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
              <p className="text-white/40 leading-relaxed">
                We collect email addresses, payment information, and basic usage data. This information is used solely for 
                account management and service delivery.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02]/50 border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-3">2. Data Privacy</h2>
              <p className="text-white/40 leading-relaxed">
                Your personal data is encrypted and stored securely. We do not sell, trade, or share your information with 
                third parties for marketing purposes.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02]/50 border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-3">3. Cookies & Tracking</h2>
              <p className="text-white/40 leading-relaxed">
                We use essential cookies for site functionality and analytics. Tracking is minimal and used only to improve 
                our service.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02]/50 border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-3">4. GDPR Compliance</h2>
              <p className="text-white/40 leading-relaxed">
                If you&apos;re in the EU, your data is handled in accordance with GDPR. You have the right to request, modify, 
                or delete your data.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02]/50 border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-3">5. Data Retention</h2>
              <p className="text-white/40 leading-relaxed">
                Personal data is retained for as long as your account is active. Upon account deletion, data is purged 
                within 30 days.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02]/50 border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-3">6. Third-Party Services</h2>
              <p className="text-white/40 leading-relaxed">
                We use payment processors and analytics services. These providers have their own privacy policies and may 
                collect limited information.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02]/50 border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-3">7. Your Rights</h2>
              <p className="text-white/40 leading-relaxed">
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
