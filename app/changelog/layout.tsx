import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog | Lethal Solutions",
  description: "Latest product updates, patches, and feature releases for all Lethal Solutions products.",
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children
}
