"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  GitCompare, 
  Check, 
  X, 
  ShoppingCart,
  Crosshair,
  Eye,
  Shield,
  Cpu,
  Zap,
  Crown,
  Package
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

type CompareCategory = "cheats" | "spoofers" | "bundles"

// Cheat Features
const CHEAT_FEATURES = [
  { key: "aimbot", label: "Aimbot", description: "Auto-aim assistance" },
  { key: "silent_aim", label: "Silent Aim", description: "Invisible aim adjustment" },
  { key: "triggerbot", label: "Triggerbot", description: "Auto-fire on target" },
  { key: "prediction", label: "Bullet Prediction", description: "Lead target compensation" },
  { key: "esp_box", label: "Box ESP", description: "Player bounding boxes" },
  { key: "esp_skeleton", label: "Skeleton ESP", description: "Bone structure overlay" },
  { key: "esp_distance", label: "Distance ESP", description: "Player distance display" },
  { key: "esp_health", label: "Health ESP", description: "Health bar display" },
  { key: "esp_weapon", label: "Weapon ESP", description: "Player weapon info" },
  { key: "esp_items", label: "Item ESP", description: "Loot & chest locations" },
  { key: "radar", label: "Radar Hack", description: "Mini-map overlay" },
  { key: "stream_proof", label: "Stream Proof", description: "Hidden from OBS/Discord" },
  { key: "no_recoil", label: "No Recoil", description: "Recoil compensation" },
  { key: "fov_circle", label: "FOV Circle", description: "Aim range indicator" },
]

const CHEATS_DATA = {
  "blurred": {
    name: "Blurred DMA",
    badge: "Premium",
    bestFor: "Best for Tournaments",
    price: 2200,
    pricePer: "Weekly",
    features: {
      aimbot: true, silent_aim: true, triggerbot: true, prediction: true,
      esp_box: true, esp_skeleton: true, esp_distance: true, esp_health: true,
      esp_weapon: true, esp_items: true, radar: true, stream_proof: true,
      no_recoil: true, fov_circle: true
    }
  },
  "streck": {
    name: "Streck DMA",
    badge: "Value",
    bestFor: "Best on Budget",
    price: 800,
    pricePer: "Weekly",
    features: {
      aimbot: true, silent_aim: false, triggerbot: true, prediction: true,
      esp_box: true, esp_skeleton: true, esp_distance: true, esp_health: true,
      esp_weapon: false, esp_items: true, radar: true, stream_proof: true,
      no_recoil: false, fov_circle: true
    }
  },
  "fortnite-external": {
    name: "Fortnite External",
    badge: "Software",
    bestFor: "Best for Fortnite",
    price: 1000,
    pricePer: "Daily",
    features: {
      aimbot: true, silent_aim: true, triggerbot: true, prediction: true,
      esp_box: true, esp_skeleton: true, esp_distance: true, esp_health: true,
      esp_weapon: true, esp_items: true, radar: false, stream_proof: true,
      no_recoil: true, fov_circle: true
    }
  }
}

// Spoofer Features
const SPOOFER_FEATURES = [
  { key: "disk_serial", label: "Disk Serial Spoof", description: "HDD/SSD identifiers" },
  { key: "motherboard", label: "Motherboard Spoof", description: "MB serial & UUID" },
  { key: "mac_address", label: "MAC Address Spoof", description: "Network adapter ID" },
  { key: "smbios", label: "SMBIOS Spoof", description: "System firmware data" },
  { key: "gpu_serial", label: "GPU Serial Spoof", description: "Graphics card ID" },
  { key: "tpm", label: "TPM Bypass", description: "Trusted Platform Module" },
  { key: "efi_vars", label: "EFI Variables", description: "Boot firmware data" },
  { key: "registry_clean", label: "Registry Cleaner", description: "Trace removal" },
  { key: "kernel_level", label: "Kernel Level", description: "Ring 0 operation" },
  { key: "auto_clean", label: "Auto Cleanup", description: "Automatic trace removal" },
  { key: "persist_reboot", label: "Persist on Reboot", description: "Survives restarts" },
]

const SPOOFERS_DATA = {
  "perm": {
    name: "Perm Spoofer",
    badge: "Permanent",
    bestFor: "Best Overall",
    price: 3500,
    pricePer: "One-Time",
    features: {
      disk_serial: true, motherboard: true, mac_address: true, smbios: true,
      gpu_serial: true, tpm: true, efi_vars: true, registry_clean: true,
      kernel_level: true, auto_clean: true, persist_reboot: true
    }
  },
  "temp": {
    name: "Temp Spoofer",
    badge: "Session",
    bestFor: "Best Short-Term",
    price: 2000,
    pricePer: "15 Days",
    features: {
      disk_serial: true, motherboard: true, mac_address: true, smbios: true,
      gpu_serial: true, tpm: false, efi_vars: false, registry_clean: true,
      kernel_level: true, auto_clean: true, persist_reboot: false
    }
  }
}

// Bundle Features
const BUNDLE_FEATURES = [
  { key: "dma_card", label: "DMA Card", description: "Captain DMA 100T-7th" },
  { key: "fuser", label: "Fuser Type", description: "Signal converter" },
  { key: "teensy", label: "Teensy Board", description: "With firmware" },
  { key: "firmware_eac", label: "EAC/BE Firmware", description: "Anti-cheat bypass" },
  { key: "firmware_faceit", label: "FaceIt/VGK", description: "Additional AC support" },
  { key: "cheat_included", label: "Cheat Included", description: "DMA cheat software" },
  { key: "cheat_duration", label: "Cheat Duration", description: "License length" },
  { key: "discord_support", label: "Discord Support", description: "Lifetime support" },
  { key: "remote_install", label: "Remote Install", description: "Setup assistance" },
]

const BUNDLES_DATA = {
  "basic": {
    name: "Basic Bundle",
    badge: "Starter",
    bestFor: "Best for Beginners",
    price: 42500,
    features: {
      dma_card: "Captain 100T-7th",
      fuser: "Mini DP Fuser V2",
      teensy: false,
      firmware_eac: "EAC/BE Emulated",
      firmware_faceit: false,
      cheat_included: "Blurred + Macku",
      cheat_duration: "30 Days",
      discord_support: true,
      remote_install: true
    }
  },
  "advanced": {
    name: "Advanced Bundle",
    badge: "Popular",
    bestFor: "Best Value",
    price: 67500,
    features: {
      dma_card: "Captain 100T-7th",
      fuser: "Dichen D60 Fuser",
      teensy: "Included",
      firmware_eac: "Slotted Edition",
      firmware_faceit: false,
      cheat_included: "Blurred DMA",
      cheat_duration: "Quarterly",
      discord_support: true,
      remote_install: true
    }
  },
  "elite": {
    name: "Elite Bundle",
    badge: "Premium",
    bestFor: "Best Performance",
    price: 150000,
    features: {
      dma_card: "Captain 100T-7th",
      fuser: "Dichen DC500 Fuser",
      teensy: "Included",
      firmware_eac: "Full Emulation",
      firmware_faceit: "EAC/BE + FaceIt + VGK",
      cheat_included: "Blurred DMA",
      cheat_duration: "Lifetime",
      discord_support: true,
      remote_install: true
    }
  }
}

export default function ComparePage() {
  const [category, setCategory] = useState<CompareCategory>("cheats")
  const { addItem } = useCart()

  const handleAddToCart = (id: string, name: string, price: number, variantName: string) => {
    addItem({
      id,
      name: variantName,
      price,
      product_id: id,
      is_lifetime: variantName.toLowerCase().includes("lifetime"),
      duration_days: null,
      created_at: "",
      product: {
        id,
        name,
        slug: id,
        description: null,
        category: "cheat",
        image_url: null,
        created_at: "",
        updated_at: "",
      },
    }, 1)
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <Breadcrumbs items={[{ label: "Compare" }]} />
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6">
              <GitCompare className="h-3.5 w-3.5 text-[#f97316]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Product Comparison</span>
            </div>
            <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Compare </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249,115,22,0.3))" }}>Products</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed">
              Find the perfect product for your needs with our detailed comparison
            </p>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-2xl bg-white/[0.03]/30 border border-white/[0.06]/50">
              <button
                onClick={() => setCategory("cheats")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                  category === "cheats"
                    ? "bg-[#f97316] text-[#f97316]-foreground"
                    : "text-white/40 hover:text-foreground"
                )}
              >
                <Crosshair className="h-4 w-4" />
                Cheats
              </button>
              <button
                onClick={() => setCategory("spoofers")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                  category === "spoofers"
                    ? "bg-[#f97316] text-[#f97316]-foreground"
                    : "text-white/40 hover:text-foreground"
                )}
              >
                <Shield className="h-4 w-4" />
                Spoofers
              </button>
              <button
                onClick={() => setCategory("bundles")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                  category === "bundles"
                    ? "bg-[#f97316] text-[#f97316]-foreground"
                    : "text-white/40 hover:text-foreground"
                )}
              >
                <Package className="h-4 w-4" />
                Bundles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          {/* Cheats Comparison */}
          {category === "cheats" && (
            <div className="max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 w-[200px]">
                        <div className="flex items-center gap-2 text-white/40">
                          <Crosshair className="h-4 w-4" />
                          <span className="font-medium">Features</span>
                        </div>
                      </th>
                      {Object.entries(CHEATS_DATA).map(([id, cheat]) => (
                        <th key={id} className="p-4 text-center min-w-[180px]">
                          <div className="rounded-2xl border border-white/[0.06]/50 bg-white/[0.02]/60 p-6">
                            <span className={cn(
                              "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2",
                              cheat.badge === "Premium" ? "bg-[#f97316]/10 text-[#f97316]" :
                              cheat.badge === "Value" ? "bg-emerald-500/10 text-emerald-500" :
                              "bg-blue-500/10 text-blue-500"
                            )}>
                              {cheat.badge}
                            </span>
                            {"bestFor" in cheat && (
                              <p className="text-[10px] text-amber-400 font-bold mb-2">{(cheat as any).bestFor}</p>
                            )}
                            <h3 className="font-black text-foreground text-lg mb-1">{cheat.name}</h3>
                            <p className="text-2xl font-black text-[#f97316] mb-1">
                              £{(cheat.price / 100).toFixed(0)}
                            </p>
                            <p className="text-xs text-white/40">{cheat.pricePer}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CHEAT_FEATURES.map((feature, index) => (
                      <tr key={feature.key} className={cn(index % 2 === 0 && "bg-white/[0.03]/5")}>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{feature.label}</p>
                            <p className="text-xs text-white/40">{feature.description}</p>
                          </div>
                        </td>
                        {Object.entries(CHEATS_DATA).map(([id, cheat]) => (
                          <td key={id} className="p-4 text-center">
                            {cheat.features[feature.key as keyof typeof cheat.features] ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10">
                                <Check className="h-5 w-5 text-emerald-500" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03]/30">
                                <X className="h-5 w-5 text-white/40/50" />
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4" />
                      {Object.entries(CHEATS_DATA).map(([id, cheat]) => (
                        <td key={id} className="p-4 text-center">
                          <Button
                            onClick={() => handleAddToCart(id, cheat.name, cheat.price, cheat.pricePer)}
                            className="gap-2 rounded-xl w-full"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Spoofers Comparison */}
          {category === "spoofers" && (
            <div className="max-w-4xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 w-[200px]">
                        <div className="flex items-center gap-2 text-white/40">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">Features</span>
                        </div>
                      </th>
                      {Object.entries(SPOOFERS_DATA).map(([id, spoofer]) => (
                        <th key={id} className="p-4 text-center min-w-[200px]">
                          <div className="rounded-2xl border border-white/[0.06]/50 bg-white/[0.02]/60 p-6">
                            <span className={cn(
                              "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2",
                              spoofer.badge === "Permanent" ? "bg-[#f97316]/10 text-[#f97316]" : "bg-blue-500/10 text-blue-500"
                            )}>
                              {spoofer.badge}
                            </span>
                            {"bestFor" in spoofer && (
                              <p className="text-[10px] text-amber-400 font-bold mb-2">{(spoofer as any).bestFor}</p>
                            )}
                            <h3 className="font-black text-foreground text-lg mb-1">{spoofer.name}</h3>
                            <p className="text-2xl font-black text-[#f97316] mb-1">
                              £{(spoofer.price / 100).toFixed(0)}
                            </p>
                            <p className="text-xs text-white/40">{spoofer.pricePer}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SPOOFER_FEATURES.map((feature, index) => (
                      <tr key={feature.key} className={cn(index % 2 === 0 && "bg-white/[0.03]/5")}>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{feature.label}</p>
                            <p className="text-xs text-white/40">{feature.description}</p>
                          </div>
                        </td>
                        {Object.entries(SPOOFERS_DATA).map(([id, spoofer]) => (
                          <td key={id} className="p-4 text-center">
                            {spoofer.features[feature.key as keyof typeof spoofer.features] ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10">
                                <Check className="h-5 w-5 text-emerald-500" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03]/30">
                                <X className="h-5 w-5 text-white/40/50" />
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4" />
                      {Object.entries(SPOOFERS_DATA).map(([id, spoofer]) => (
                        <td key={id} className="p-4 text-center">
                          <Button
                            onClick={() => handleAddToCart(id, spoofer.name, spoofer.price, spoofer.pricePer)}
                            className="gap-2 rounded-xl w-full"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bundles Comparison */}
          {category === "bundles" && (
            <div className="max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 w-[200px]">
                        <div className="flex items-center gap-2 text-white/40">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">Includes</span>
                        </div>
                      </th>
                      {Object.entries(BUNDLES_DATA).map(([id, bundle]) => (
                        <th key={id} className="p-4 text-center min-w-[180px]">
                          <div className={cn(
                            "rounded-2xl border p-6",
                            bundle.badge === "Popular" 
                              ? "border-primary/50 bg-[#f97316]/5" 
                              : "border-white/[0.06]/50 bg-white/[0.02]/60"
                          )}>
                            {bundle.badge === "Popular" && (
                              <div className="flex items-center justify-center gap-1 mb-2">
                                <Crown className="h-4 w-4 text-[#f97316]" />
                                <span className="text-xs font-bold text-[#f97316]">MOST POPULAR</span>
                              </div>
                            )}
                            <span className={cn(
                              "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2",
                              bundle.badge === "Starter" ? "bg-white/[0.03]/30 text-white/40" :
                              bundle.badge === "Popular" ? "bg-[#f97316]/10 text-[#f97316]" :
                              "bg-amber-500/10 text-amber-500"
                            )}>
                              {bundle.badge}
                            </span>
                            {"bestFor" in bundle && (
                              <p className="text-[10px] text-amber-400 font-bold mb-2">{(bundle as any).bestFor}</p>
                            )}
                            <h3 className="font-black text-foreground text-lg mb-1">{bundle.name}</h3>
                            <p className="text-2xl font-black text-[#f97316] mb-1">
                              £{(bundle.price / 100).toFixed(0)}
                            </p>
                            <p className="text-xs text-white/40">one-time</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BUNDLE_FEATURES.map((feature, index) => (
                      <tr key={feature.key} className={cn(index % 2 === 0 && "bg-white/[0.03]/5")}>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{feature.label}</p>
                            <p className="text-xs text-white/40">{feature.description}</p>
                          </div>
                        </td>
                        {Object.entries(BUNDLES_DATA).map(([id, bundle]) => {
                          const value = bundle.features[feature.key as keyof typeof bundle.features]
                          return (
                            <td key={id} className="p-4 text-center">
                              {value === true ? (
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10">
                                  <Check className="h-5 w-5 text-emerald-500" />
                                </div>
                              ) : value === false ? (
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03]/30">
                                  <X className="h-5 w-5 text-white/40/50" />
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-foreground">{value}</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4" />
                      {Object.entries(BUNDLES_DATA).map(([id, bundle]) => (
                        <td key={id} className="p-4 text-center">
                          <Button
                            onClick={() => handleAddToCart(id, bundle.name, bundle.price, "Complete Bundle")}
                            className={cn(
                              "gap-2 rounded-xl w-full",
                              bundle.badge === "Popular" && "bg-[#f97316] hover:bg-[#f97316]/90"
                            )}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bundle Info */}
              <div className="mt-8 p-6 rounded-2xl border border-white/[0.06]/50 bg-white/[0.02]/30 text-center">
                <p className="text-white/40">
                  All bundles include discreet shipping, lifetime Discord support, and remote firmware installation.
                </p>
                <Link href="/products" className="inline-flex items-center gap-2 mt-4 text-[#f97316] font-bold hover:underline">
                  View all individual products
                  <Zap className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
