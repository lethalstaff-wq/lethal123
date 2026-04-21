import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalBackground } from "@/components/global-background"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"
import { CursorEffects } from "@/components/cursor-effects"
import { FloatingConfigurator } from "@/components/floating-configurator"
import { ChatWidget } from "@/components/chat-widget"
import { BundleBuilder } from "@/components/bundle-builder"
import { AbandonedCartToast } from "@/components/abandoned-cart-toast"
import { CookieConsent } from "@/components/cookie-consent"
import { CommandSearch } from "@/components/command-search"
import { CheckoutProgress } from "@/components/checkout-progress"
import { Toaster } from "@/components/ui/sonner"
import { SocialProofToast } from "@/components/social-proof-toast"
import { BackToTop } from "@/components/back-to-top"
import { ScrollProgress } from "@/components/scroll-progress"
import { ClientOverlays } from "./client-overlays"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: {
    default: "Lethal Solutions | Premium Gaming Cheats & Spoofers",
    template: "%s | Lethal Solutions",
  },
  description:
    "Undetected gaming solutions for competitive players. Premium cheats, ESP, aimbots, DMA hardware, and HWID spoofers with 24/7 support.",
  keywords: ["gaming cheats", "DMA", "spoofer", "HWID", "fortnite", "undetected", "ESP", "aimbot"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Lethal Solutions",
    title: "Lethal Solutions | Premium Gaming Cheats & Spoofers",
    description: "Undetected gaming solutions for competitive players. Premium cheats, DMA hardware, and HWID spoofers.",
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
    title: "Lethal Solutions | Premium Gaming Cheats & Spoofers",
    description: "Undetected gaming solutions for competitive players. Premium cheats, DMA hardware, and HWID spoofers.",
    images: ["https://www.lethalsolutions.me/images/banner.png"],
  },
  metadataBase: new URL("https://www.lethalsolutions.me"),
  alternates: {
    canonical: "/",
  },
  generator: 'Lethal Solutions'
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
        {/* OG image fallback — direct meta tags for Discord/Telegram compatibility */}
        <meta property="og:image" content="https://www.lethalsolutions.me/images/banner.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:image" content="https://www.lethalsolutions.me/images/banner.png" />
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://api.qrserver.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.qrserver.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <GlobalBackground />
          <CursorEffects />
          <CartProvider>
            <ClientOverlays />
            <MobileBottomBar />
            <div className="hidden md:block">
              <FloatingConfigurator />
              <BundleBuilder />
              <ChatWidget />
            </div>
            <AbandonedCartToast />
            <CookieConsent />
            <CommandSearch />
            <CheckoutProgress />
            <Toaster position="top-right" richColors />
            <SocialProofToast />
            <BackToTop />
            <ScrollProgress />
            <div className="relative z-10 animate-in fade-in duration-300">{children}</div>
          </CartProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
