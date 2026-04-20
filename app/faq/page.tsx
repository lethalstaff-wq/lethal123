"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HelpCircle, ChevronDown, Search, ShieldCheck, Clock, MessageCircle, ExternalLink, CreditCard, Download, Settings, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"

interface FAQItem {
  question: string
  answer: string
  category: string
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "How do I purchase a product?",
    answer: "Browse our products page, select the variant that fits your needs, add it to cart, and proceed to checkout. We accept Bitcoin, Ethereum, Litecoin, USDT (TRC-20/ERC-20), and PayPal (Friends & Family). After payment confirmation, you'll receive your license key and download link via email within minutes."
  },
  {
    category: "Getting Started",
    question: "How long does delivery take?",
    answer: "Digital products are delivered instantly after payment confirmation. Crypto payments require blockchain confirmations: Bitcoin needs 2 confirmations (~20 min), Litecoin ~5 min, USDT TRC-20 ~3 min. DMA firmware orders may take 24-48 hours as they require custom generation for your specific hardware."
  },
  {
    category: "Getting Started",
    question: "What payment methods do you accept?",
    answer: "We accept Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), USDT on TRC-20 and ERC-20 networks, and PayPal (Friends & Family). Cryptocurrency payments are processed instantly. PayPal orders may take up to 30 minutes for manual verification. We do not accept credit cards or bank transfers."
  },
  {
    category: "Getting Started",
    question: "Do I need any special hardware?",
    answer: "For software products (Spoofer, Fortnite External), you only need a Windows 10/11 PC. For DMA cheats (Blurred, Streck), you need a DMA card (we sell complete bundles with Captain DMA 100T-7th), a second PC or laptop, and a fuser or capture card."
  },
  // Products - Spoofer
  {
    category: "Spoofer",
    question: "What does the HWID Spoofer do?",
    answer: "Our spoofer changes your hardware identifiers (HWID) that games and anti-cheats use to track bans. It spoofs: Disk serials, motherboard UUID, MAC addresses, SMBIOS data, GPU identifiers, and more. This allows you to play on a fresh identity after a hardware ban."
  },
  {
    category: "Spoofer",
    question: "What's the difference between Perm and Temp Spoofer?",
    answer: "Perm Spoofer makes permanent changes to your hardware identifiers that persist across reboots. Temp Spoofer applies changes only for the current session - when you restart, your original HWIDs return. Perm is more convenient, Temp is safer for some use cases."
  },
  {
    category: "Spoofer",
    question: "Will the spoofer remove my existing ban?",
    answer: "The spoofer doesn't remove bans - it changes your hardware identity so the game sees you as a new user. Your banned account remains banned, but you can create a new account and play without being flagged by your hardware."
  },
  // Products - DMA
  {
    category: "DMA Products",
    question: "What is DMA cheating and why is it undetected?",
    answer: "DMA (Direct Memory Access) uses external hardware to read game memory from a separate computer. Since no software runs on your gaming PC, anti-cheats cannot detect it. The DMA card reads memory directly through PCIe, completely bypassing kernel-level anti-cheat protection."
  },
  {
    category: "DMA Products",
    question: "What hardware do I need for DMA?",
    answer: "You need: 1) A DMA card (Captain DMA 100T-7th recommended), 2) A second PC or laptop to run the cheat software, 3) A fuser or HDMI capture card. Our bundles include everything except the second PC."
  },
  {
    category: "DMA Products",
    question: "What's included in the DMA bundles?",
    answer: "Basic Bundle: Captain DMA card, EAC/BE firmware, Mini DP Fuser, 30-day Blurred license, Macku cheat. Advanced Bundle adds: Dichen D60 Fuser, Teensy with firmware, Slotted firmware, Quarterly Blurred. Elite Bundle: DC500 Fuser, Lifetime Blurred, full FaceIt/VGK emulation."
  },
  {
    category: "DMA Products",
    question: "What's the difference between Blurred and Streck?",
    answer: "Blurred is our premium DMA cheat supporting 6 games (Fortnite, Apex, Rust, PUBG, and more) with full radar, stream-proof overlay, and FaceIt/Vanguard bypass. Streck is a budget-friendly option for Fortnite and Apex with core ESP and aimbot. Both are undetected. Check the Compare page for detailed feature comparison."
  },
  // Products - Firmware
  {
    category: "Firmware",
    question: "What games does the custom firmware support?",
    answer: "EAC/BE Emulated: All EasyAntiCheat and BattlEye games (Fortnite, Apex, Rust, etc). Slotted Edition: Same games with reduced detection overlap. FaceIt/VGK: Adds support for FaceIt anti-cheat and Valorant's Vanguard (VGK). Supports 75T, 100T, M.2, and ZDMA cards."
  },
  {
    category: "Firmware",
    question: "How do I get my firmware installed?",
    answer: "After purchase, download RustDesk and provide us your connection ID via Discord. Our team will remotely flash the firmware to your DMA card. The process takes 15-30 minutes. You'll need to be present to confirm actions on your PC."
  },
  {
    category: "Firmware",
    question: "What is a DNA ID and why do you need it?",
    answer: "Your DNA ID is a unique identifier for your specific DMA card. We use it to generate custom firmware that only works on your hardware. This prevents reselling and ensures maximum security. Follow our Knowledge Base guide to obtain your DNA ID."
  },
  // Technical
  {
    category: "Technical",
    question: "What are the system requirements?",
    answer: "Gaming PC: Windows 10/11 64-bit, disable Secure Boot and virtualization (VT-x) for spoofer. Second PC (DMA): Any Windows/Linux system with USB 3.0. Minimum 8GB RAM recommended. Specific requirements listed on each product page."
  },
  {
    category: "Technical",
    question: "The loader won't start, what should I do?",
    answer: "1) Run as Administrator, 2) Disable Windows Defender real-time protection, 3) Add exclusion for the loader folder, 4) Disable any other antivirus, 5) Ensure you're on Windows 10/11 64-bit, 6) Try compatibility mode for Windows 10. Contact Discord support if issues persist."
  },
  {
    category: "Technical",
    question: "Can I use a VPN with your products?",
    answer: "Yes, VPNs are recommended for additional privacy. For DMA setups, the VPN should run on your gaming PC. For software cheats, ensure the VPN doesn't interfere with the loader's connection. We recommend NordVPN or Mullvad with split tunneling enabled."
  },
  {
    category: "Technical",
    question: "How do I reset my HWID if I change PC?",
    answer: "Each license is tied to one HWID. If you change PC or reinstall Windows, contact us on Discord with your order ID for a free HWID reset. We allow 1-2 resets per month. For Blurred/Streck, use the in-loader reset option if available."
  },
  // Orders & Support
  {
    category: "Orders & Support",
    question: "How do I track my order status?",
    answer: "Visit the Track Order page and enter your Order ID (from confirmation email) or the email address you used. You'll see payment status, processing status, and download links once ready."
  },
  {
    category: "Orders & Support",
    question: "My payment hasn't been verified - what should I do?",
    answer: "Check that you sent the exact amount shown (including network fees on your end). Bitcoin needs 2 confirmations, Litecoin 6, USDT is usually instant. If it's been over 1 hour, open a Discord ticket with your Order ID and transaction hash (TXID)."
  },
  {
    category: "Orders & Support",
    question: "Do you offer refunds?",
    answer: "If a product doesn't work on your setup and our support team can't resolve it, we issue a full refund within 24 hours of purchase. For subscription products, we offer partial refunds for unused time. Open a ticket on Discord to request a refund."
  },
  {
    category: "Orders & Support",
    question: "How do I contact support?",
    answer: "Join our Discord server and open a ticket in the #support channel. Average response time is under 15 minutes during EU/US business hours. For urgent issues, tag @Staff in your ticket. Include your Order ID for faster help."
  },
  // Safety
  {
    category: "Safety",
    question: "Are your products safe and undetected?",
    answer: "Yes. We continuously update all products to maintain undetected status. Check our Status page for real-time detection status. DMA products are inherently undetectable due to hardware-level operation. Software products receive updates within 24-48 hours of any game patch."
  },
  {
    category: "Safety",
    question: "What happens if a product gets detected?",
    answer: "If detection occurs, we immediately work on an update (usually within 24 hours). We'll notify all users via Discord. If you get banned during a detection window that was our fault, we offer license extension or replacement at our discretion. Always check Status page before playing."
  },
  {
    category: "Safety",
    question: "How do you update products after game patches?",
    answer: "Our team monitors all supported games 24/7. When a patch drops, we test immediately and push updates within hours. Major anti-cheat updates may take 24-48 hours. Blurred and Streck have auto-update features. Spoofer updates are manual downloads from your license panel."
  },
]

const CATEGORIES = ["All", "Getting Started", "Spoofer", "DMA Products", "Firmware", "Technical", "Orders & Support", "Safety"]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, "yes" | "no">>({})

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems)
    if (newOpen.has(index)) {
      newOpen.delete(index)
    } else {
      newOpen.add(index)
    }
    setOpenItems(newOpen)
  }

  const filteredFAQ = FAQ_DATA.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = !searchQuery || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <Breadcrumbs items={[{ label: "FAQ" }]} />
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6">
              <HelpCircle className="h-3.5 w-3.5 text-[#f97316]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Help Center</span>
            </div>
            <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Common </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249,115,22,0.3))" }}>Questions</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed mb-8">
              Find answers to common questions about our products and services
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all",
                  selectedCategory === category
                    ? "bg-[#f97316] text-[#f97316]-foreground"
                    : "bg-white/[0.03] text-white/40 hover:bg-white/[0.03] hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredFAQ.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-start gap-4 pr-4">
                    <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="h-4 w-4 text-[#f97316]" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#f97316] font-bold uppercase tracking-wider">{item.category}</span>
                      <h3 className="font-bold text-foreground">{item.question}</h3>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-white/40 shrink-0 transition-transform",
                    openItems.has(index) && "rotate-180"
                  )} />
                </button>
                
                {openItems.has(index) && (
                  <div className="px-5 pb-5 pl-[4.5rem]">
                    <p className="text-white/40 leading-relaxed mb-4">{item.answer}</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                      <span className="text-xs text-white/40/60">Was this helpful?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setHelpfulVotes(prev => ({ ...prev, [index]: "yes" })) }}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors",
                          helpfulVotes[index] === "yes" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.03] text-white/40 hover:bg-white/[0.03]"
                        )}
                      >
                        <ThumbsUp className="h-3 w-3" /> Yes
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setHelpfulVotes(prev => ({ ...prev, [index]: "no" })) }}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors",
                          helpfulVotes[index] === "no" ? "bg-red-500/15 text-red-400" : "bg-white/[0.03] text-white/40 hover:bg-white/[0.03]"
                        )}
                      >
                        <ThumbsDown className="h-3 w-3" /> No
                      </button>
                      {helpfulVotes[index] === "no" && (
                        <Link href="https://discord.gg/lethaldma" target="_blank" className="text-xs text-[#f97316] hover:underline ml-auto">
                          Ask on Discord →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredFAQ.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-white/40/30 mx-auto mb-4" />
                <p className="text-white/40">No questions found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/track" className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.02] transition-all hover:border-primary/30">
                <Clock className="h-8 w-8 text-[#f97316] mb-4" />
                <h3 className="font-bold text-foreground mb-2">Track Order</h3>
                <p className="text-sm text-white/40">Check your order status and download products</p>
              </Link>
              
              <Link href="/status" className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.02] transition-all hover:border-primary/30">
                <ShieldCheck className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="font-bold text-foreground mb-2">Status Page</h3>
                <p className="text-sm text-white/40">View real-time detection status of products</p>
              </Link>
              
              <Link href="https://discord.gg/lethaldma" target="_blank" className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.02] transition-all hover:border-primary/30">
                <MessageCircle className="h-8 w-8 text-[#5865F2] mb-4" />
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  Discord Support
                  <ExternalLink className="h-4 w-4 text-white/40" />
                </h3>
                <p className="text-sm text-white/40">Get help from our support team</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
