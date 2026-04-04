import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guides | Lethal Solutions",
  description: "Step-by-step setup guides for DMA cheats, spoofers, firmware flashing, KMBox configuration, and troubleshooting.",
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children
}
