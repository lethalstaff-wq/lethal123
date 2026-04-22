import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalBackground } from "@/components/global-background"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"
import { LenisProvider } from "@/components/lenis-provider"
import { ChatWidget } from "@/components/chat-widget"
import { AbandonedCartToast } from "@/components/abandoned-cart-toast"
import { CookieConsent } from "@/components/cookie-consent"
import { CommandSearch } from "@/components/command-search"
import { CheckoutProgress } from "@/components/checkout-progress"
import { Toaster } from "@/components/ui/sonner"
import { SocialProofToast } from "@/components/social-proof-toast"
import { BackToTop } from "@/components/back-to-top"
import { ScrollProgress } from "@/components/scroll-progress"
import { CursorEffects } from "@/components/cursor-effects"
import { ScrollToTopOnNav } from "@/components/scroll-to-top-on-nav"
import { ShortcutsOverlay } from "@/components/shortcuts-overlay"
import { ConfettiCanvas } from "@/components/confetti"
import { ClientOverlays } from "./client-overlays"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lethalsolutions.me"),
  title: {
    default: "Lethal Solutions — Premium DMA Cheats, Spoofers & Gaming Hardware",
    template: "%s | Lethal Solutions",
  },
  description:
    "Premium gaming tools built for competitive play — DMA cheats, HWID spoofers, custom firmware, and hardware bundles backed by 24/7 Discord support.",
  applicationName: "Lethal Solutions",
  keywords: [
    "DMA cheats",
    "HWID spoofer",
    "gaming hardware",
    "custom firmware",
    "Fortnite DMA",
    "Valorant spoofer",
    "Captain DMA",
    "KMBox",
    "gaming tools",
  ],
  authors: [{ name: "Lethal Solutions", url: "https://www.lethalsolutions.me" }],
  creator: "Lethal Solutions",
  publisher: "Lethal Solutions",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Lethal Solutions",
    title: "Lethal Solutions — Premium DMA Cheats, Spoofers & Gaming Hardware",
    description:
      "DMA cheats, HWID spoofers, and custom firmware for competitive players — 24/7 Discord support, rapid patch response.",
    url: "https://www.lethalsolutions.me",
    images: [
      {
        url: "https://www.lethalsolutions.me/images/banner.png",
        width: 1200,
        height: 630,
        alt: "Lethal Solutions — Premium Gaming Solutions",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lethal Solutions — Premium DMA Cheats, Spoofers & Gaming Hardware",
    description:
      "DMA cheats, HWID spoofers, and custom firmware for competitive players — 24/7 Discord support, rapid patch response.",
    images: ["https://www.lethalsolutions.me/images/banner.png"],
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect / dns-prefetch — reduce handshake cost for 3rd-party origins. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.qrserver.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.qrserver.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <LenisProvider />
          <GlobalBackground />
          <CartProvider>
            <ClientOverlays />
            <MobileBottomBar />
            <div className="hidden md:block">
              <ChatWidget />
            </div>
            <AbandonedCartToast />
            <CookieConsent />
            <CommandSearch />
            <CheckoutProgress />
            <Toaster position="top-right" richColors />
            {/* Social proof spam — desktop only so mobile hero stays clean */}
            <div className="hidden md:block">
              <SocialProofToast />
            </div>
            <BackToTop />
            {/* Duplicate of the scroll progress already rendered inside Navbar — removed. */}
            <CursorEffects />
            <ScrollToTopOnNav />
            <ShortcutsOverlay />
            <ConfettiCanvas />
            <div className="relative z-10">{children}</div>
          </CartProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
