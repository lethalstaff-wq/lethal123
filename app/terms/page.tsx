import { AlertCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Lethal Solutions",
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-4 relative">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-muted-foreground mb-12">Last updated: January 2025</p>

          <div className="space-y-10">
            <section className="p-6 rounded-2xl bg-card/50 border border-border">
              <h2 className="text-xl font-bold mb-3">1. Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Refunds are available within 24 hours of purchase if the product fails to function on your setup and our 
                support team cannot resolve the issue. Refund requests must be submitted via Discord ticket with your order ID. 
                No refunds for change of mind or successfully activated products. Subscription products may receive partial 
                refunds for unused time at our discretion.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border">
              <h2 className="text-xl font-bold mb-3">2. Virtual Goods</h2>
              <p className="text-muted-foreground leading-relaxed">
                Products provided are virtual goods and digital licenses. Once activated, they cannot be transferred, sold, 
                or resold. License is personal and non-transferable.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border">
              <h2 className="text-xl font-bold mb-3">3. Account Safety</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for protecting your account credentials. We are not liable for unauthorized access or 
                account compromise. Use strong, unique passwords.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border">
              <h2 className="text-xl font-bold mb-3">4. Usage Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Products are provided for authorized use only. Violation of game ToS or applicable laws may result in account 
                suspension or ban. We cannot provide assistance if your account is banned.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border">
              <h2 className="text-xl font-bold mb-3">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We are not responsible for any loss, damage, or consequences resulting from the use of our products, including 
                but not limited to account bans, VAC bans, or other punitive measures.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border">
              <h2 className="text-xl font-bold mb-3">6. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service following any changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
              <AlertCircle className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold mb-2">Questions?</p>
                <p className="text-sm text-muted-foreground">
                  Join our Discord server: <a href="https://discord.gg/lethaldma" className="text-primary hover:underline">discord.gg/lethaldma</a>
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
