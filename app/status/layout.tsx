import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "System Status | Lethal Solutions",
  description: "Real-time detection status for all Lethal Solutions products. Check if your cheat or spoofer is undetected before playing.",
}

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children
}
