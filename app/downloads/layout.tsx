import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Downloads | Lethal Solutions",
  description: "Download your purchased products. Enter your license key or order ID to access your files.",
}

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return children
}
