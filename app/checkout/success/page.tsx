import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-lg">
          <Card className="border-border/50 text-center">
            <CardContent className="pt-10 pb-8 px-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. You will receive an email with your order details and download links
                shortly.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium mb-2">What happens next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Check your email for order confirmation</li>
                  <li>2. Join our Discord for support</li>
                  <li>3. Follow the setup guide included</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://discord.com/invite/lethaldma" target="_blank" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Join Discord
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
