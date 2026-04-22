import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbListJsonLd, articleJsonLd } from "@/lib/seo-jsonld"

// Per-guide metadata map. Titles, descriptions and keywords are tuned for the
// knowledge-base content that lives in the client page.
const GUIDE_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  "what-is-dma": {
    title: "What Are DMA Cheats & How They Work",
    description:
      "DMA (Direct Memory Access) explained — how external hardware reads game memory through PCIe without running code on your gaming PC.",
    keywords: ["DMA cheats", "how DMA works", "PCIe DMA", "DMA explained"],
  },
  "second-pc-setup": {
    title: "How to Set Up a 2nd PC for DMA Cheating",
    description:
      "Install drivers, configure USB connections, and get the Lethal Solutions loader running on a dedicated cheat PC.",
    keywords: ["second PC setup", "DMA PC config", "cheat PC drivers"],
  },
  "memory-map": {
    title: "How to Generate a Memory Map (MMAP) for DMA",
    description:
      "Generate an MMAP file to fix slow progress, missing ESP, or aimbot issues. Includes browser-based converter tool.",
    keywords: ["memory map", "MMAP generator", "RamMap", "DMA MMAP"],
  },
  troubleshooting: {
    title: "DMA Troubleshooting — Fixes for Common Issues",
    description:
      "Fix: Failed to initialize, Unable to locate DTB, Failed to find base address, USB disconnections, and more.",
    keywords: ["DMA troubleshooting", "DMA errors", "DTB error", "DMA fix"],
  },
  "kmbox-net": {
    title: "KMBox Net — Setup & Configuration Guide",
    description: "Complete KMBox Net setup walkthrough — flashing, wiring, network config, and integration.",
    keywords: ["KMBox net", "KMBox setup", "KMBox config"],
  },
  "kmbox-b-plus": {
    title: "KMBox B+ — Setup & Configuration Guide",
    description: "Complete KMBox B+ setup walkthrough — flashing, wiring, USB passthrough and integration.",
    keywords: ["KMBox B+", "KMBox B Plus", "KMBox setup"],
  },
  "system-time-sync": {
    title: "System Time Sync — Fix Connection & Auth Issues",
    description:
      "Synchronize your system clock to fix loader auth failures, TLS errors and license validation issues.",
    keywords: ["system time", "clock sync", "auth failure", "TLS error"],
  },
  "fuser-setup": {
    title: "Fuser Setup — Display Capture for DMA",
    description:
      "Set up Mini DP Fuser, Dichen D60, DC500 and HDMI capture devices for DMA cheat display output.",
    keywords: ["fuser setup", "DP fuser", "HDMI capture", "DMA display"],
  },
  "dna-id": {
    title: "DNA ID — How to Find Your DMA Card Identifier",
    description:
      "Locate your DMA card's unique DNA ID to generate custom firmware tied to your hardware.",
    keywords: ["DNA ID", "DMA identifier", "custom firmware", "DMA hardware ID"],
  },
  "flash-tools": {
    title: "Flash Tools — Firmware Flashing for DMA Cards",
    description: "Download and use official flashing tools to load custom firmware onto Captain DMA, 75T, 100T, M.2 and ZDMA cards.",
    keywords: ["flash tools", "firmware flash", "Captain DMA", "DMA firmware"],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = GUIDE_META[slug]
  if (!meta) {
    return { title: "Guide", description: "Lethal Solutions knowledge base guide." }
  }
  const url = `${SITE_URL}/guides/${slug}`
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: `${meta.title} | Lethal Solutions`,
      description: meta.description,
      url,
      type: "article",
      siteName: "Lethal Solutions",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: [DEFAULT_OG_IMAGE] },
  }
}

export default async function GuideSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const meta = GUIDE_META[slug]
  const url = `${SITE_URL}/guides/${slug}`
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Guides", url: `${SITE_URL}/guides` },
    { name: meta?.title || "Guide", url },
  ])
  const articleLd = meta
    ? articleJsonLd({
        headline: meta.title,
        description: meta.description,
        url,
        image: DEFAULT_OG_IMAGE,
        datePublished: "2025-06-01",
        dateModified: "2026-04-01",
      })
    : null
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {articleLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      )}
      {children}
    </>
  )
}
