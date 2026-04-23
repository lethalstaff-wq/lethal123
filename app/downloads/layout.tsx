import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Downloads",
  description: "Download your purchased products. Enter your license key or order ID to access your files.",
  alternates: { canonical: "/downloads" },
  robots: { index: false, follow: false },
}

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return children
}
