import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DownloadContent } from "./download-content"

export default function DownloadPage({ params }: { params: { orderId: string } }) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <DownloadContent orderId={params.orderId} />
      <Footer />
    </main>
  )
}
