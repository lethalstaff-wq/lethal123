import type { Metadata } from "next"
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbListJsonLd,
  faqPageJsonLd,
} from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "FAQ — Payments, Setup, Delivery & Safety",
  description:
    "Answers about DMA cheats, HWID spoofers, custom firmware, crypto and PayPal payments, delivery times, system requirements, and refund policy.",
  keywords: ["DMA FAQ", "HWID spoofer questions", "crypto payments", "gaming cheats FAQ", "DMA hardware"],
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — Payments, Setup, Delivery & Safety | Lethal Solutions",
    description: "Everything you need to know about DMA cheats, spoofers, firmware, payments, and setup.",
    url: `${SITE_URL}/faq`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Lethal Solutions FAQ" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

// Condensed FAQ list — mirrors the top questions on /faq. Kept short for crawler speed.
const FAQ_JSONLD_ITEMS: Array<{ question: string; answer: string }> = [
  {
    question: "How long does delivery take?",
    answer:
      "Digital products are delivered instantly after payment confirmation. Crypto payments require blockchain confirmations: Bitcoin ~20 min, Litecoin ~5 min, USDT TRC-20 ~3 min. DMA firmware orders may take 24-48 hours as they require custom generation for your specific hardware.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), USDT on TRC-20 and ERC-20 networks, and PayPal (Friends & Family). Cryptocurrency payments are processed instantly.",
  },
  {
    question: "What does the HWID Spoofer do?",
    answer:
      "Our spoofer changes hardware identifiers (disk serials, motherboard UUID, MAC addresses, SMBIOS data, GPU identifiers) that games and anti-cheats use to track bans, allowing you to play on a fresh identity after a hardware ban.",
  },
  {
    question: "What's the difference between Perm and Temp Spoofer?",
    answer:
      "Perm Spoofer makes permanent changes to your hardware identifiers that persist across reboots. Temp Spoofer applies changes only for the current session; when you restart, your original HWIDs return.",
  },
  {
    question: "What is DMA cheating and why is it undetected?",
    answer:
      "DMA uses external hardware to read game memory from a separate computer. Since no software runs on your gaming PC, anti-cheats cannot detect it. The DMA card reads memory directly through PCIe, completely bypassing kernel-level anti-cheat protection.",
  },
  {
    question: "What hardware do I need for DMA?",
    answer:
      "A DMA card (Captain DMA 100T-7th recommended), a second PC or laptop to run the cheat software, and a fuser or HDMI capture card. Our bundles include everything except the second PC.",
  },
  {
    question: "Are your products safe and undetected?",
    answer:
      "Yes. We continuously update products to maintain undetected status. Check the Status page for real-time detection status. DMA products are inherently undetectable due to hardware-level operation. Software products receive updates within 24-48 hours of any game patch.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "If a product doesn't work on your setup and our support team can't resolve it, we issue a full refund within 24 hours of purchase. For subscription products, we offer partial refunds for unused time.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Join our Discord server and open a ticket in the #support channel. Average response time is under 15 minutes during EU/US business hours.",
  },
]

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  const faqLd = faqPageJsonLd(FAQ_JSONLD_ITEMS)
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "FAQ", url: `${SITE_URL}/faq` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
