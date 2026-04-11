"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Play,
  Copy,
  Settings
} from "lucide-react"
import { useState } from "react"

// MMAP Tool Component - Blurred.gg style with file upload
function MmapTool() {
  const [mmapContent, setMmapContent] = useState("")
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fileName, setFileName] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setFileName(file.name)
    setProcessing(true)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      // Simulate terminal-style processing
      setTimeout(() => {
        setMmapContent(content)
        setProcessing(false)
      }, 1500)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    setFileName(file.name)
    setProcessing(true)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setTimeout(() => {
        setMmapContent(content)
        setProcessing(false)
      }, 1500)
    }
    reader.readAsText(file)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mmapContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    const blob = new Blob([mmapContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mmap.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-2xl neon-border p-8 my-8">
      <div className="flex items-center justify-center mb-6">
        <div className="p-3 rounded-xl bg-[#f97316]/20 neon-glow">
          <Settings className="h-6 w-6 text-[#f97316]" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-center mb-2">
        How to generate a memory map (MMAP) for DMA cheats
      </h3>
      <div className="w-16 h-1 bg-[#f97316] mx-auto rounded-full mb-8" />
      
      {/* Instructions */}
      <div className="space-y-4 mb-8 text-sm">
        <p><span className="text-[#f97316] font-bold">1)</span> Download and extract <Link href="https://learn.microsoft.com/en-us/sysinternals/downloads/rammap" target="_blank" className="text-[#f97316] hover:underline">RamMap</Link> onto your gaming/main PC. Make sure all games and anti-cheats are closed. You must either visit this website on incognito mode or clear website history after.</p>
        <p><span className="text-[#f97316] font-bold">2)</span> Inside the zip file, open RAMMap64.exe and run it as admin. Make sure it{"'"}s running on your main PC, not on your 2nd.</p>
        <p><span className="text-[#f97316] font-bold">3)</span> At the top left of the opened program, click File → Save.</p>
        <p><span className="text-[#f97316] font-bold">4)</span> Save the .RMP file to somewhere easily accessible, like your desktop.</p>
        <p><span className="text-[#f97316] font-bold">5)</span> Attach your .RMP file to this website. The file processing is done all locally and the file isn{"'"}t shared online, even though it doesn{"'"}t contain any personal information anyway.</p>
        <p><span className="text-[#f97316] font-bold">6)</span> Click either <strong>copy</strong> or <strong>download</strong> and send it to your 2nd PC. You can do this however you want, eg. Discord, USB Drive, etc.</p>
        <p><span className="text-[#f97316] font-bold">7)</span> If you don{"'"}t already have one, create a folder on your desktop where you put the <strong>Lethal</strong> loader in.</p>
        <p><span className="text-[#f97316] font-bold">8)</span> Place a file called <strong className="text-[#f97316]">mmap.txt</strong> in the same folder as the loader. Put the MMap contents from this page into it. Make sure it{"'"}s called exactly <strong className="text-[#f97316]">mmap.txt</strong> or else it won{"'"}t be recognised</p>
        <p><span className="text-[#f97316] font-bold">9)</span> Now launch <strong>Lethal</strong>, it should say {"\""}Loading MMap...{"\""} in the CMD window. If it doesn{"'"}t say that, it means you didn{"'"}t name it or place it correctly.</p>
      </div>
      
      {/* File Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/60 transition-colors cursor-pointer mb-6"
      >
        <input
          type="file"
          accept=".rmp,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="rmp-upload"
        />
        <label htmlFor="rmp-upload" className="cursor-pointer">
          <div className="p-4 rounded-xl bg-[#f97316]/10 w-fit mx-auto mb-4">
            <Settings className="h-8 w-8 text-[#f97316]" />
          </div>
          {processing ? (
            <p className="text-white/40 font-mono">
              <span className="terminal-cursor">Processing {fileName}</span>
            </p>
          ) : fileName ? (
            <p className="text-[#f97316] font-medium">{fileName} loaded</p>
          ) : (
            <p className="text-white/40">Click here to select your .RMP file or drag it here</p>
          )}
        </label>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          className="border-white/[0.06] hover:border-primary/50 gap-2"
          onClick={copyToClipboard}
          disabled={!mmapContent}
        >
          {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          Copy
        </Button>
        <Button 
          variant="outline" 
          className="border-white/[0.06] hover:border-primary/50 gap-2"
          onClick={downloadFile}
          disabled={!mmapContent}
        >
          <ExternalLink className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
}

const guidesContent: Record<string, {
  title: string
  description: string
  readTime: string
  difficulty: string
  videoId?: string
  hasTool?: boolean
  sections: Array<{
    title: string
    content: string
    type?: "info" | "warning" | "tip"
    steps?: string[]
  }>
}> = {
  "what-is-dma": {
    title: "What are DMA cheats and how do they work",
    description: "Learn about DMA cards, KMBox devices, Fusers, read-only cheats, and how everything works together for DMA gaming.",
    readTime: "8 min read",
    difficulty: "Beginner",
    sections: [
      {
        title: "Introduction to DMA",
        content: "DMA (Direct Memory Access) cheating is one of the most advanced and undetectable methods of game modification. Unlike traditional software cheats that run on your gaming PC, DMA cheats use external hardware to read game memory directly from a separate computer.",
      },
      {
        title: "How DMA Works",
        content: "A DMA setup requires a second PC connected to your gaming PC via a PCIe card. The second PC reads the game's memory through the DMA card without leaving any traces on the gaming PC itself. Since no cheat software runs on your gaming machine, anti-cheat cannot detect it.",
        type: "info",
      },
      {
        title: "Key Components",
        content: "A complete DMA setup typically includes:",
        steps: [
          "DMA Card (e.g., Captain 100T, Squirrel, Screamer) - installed in gaming PC",
          "Second PC (Cheat PC) - runs the cheat software and displays ESP",
          "Fuser (optional) - for display output manipulation and overlay",
          "KMBox (optional) - for input simulation (aimbot, recoil control)",
          "Custom Firmware - for anti-cheat bypass and FPGA configuration"
        ]
      },
      {
        title: "Why DMA is Undetectable",
        content: "Since the cheat runs on a completely separate PC and only reads memory (never writes), anti-cheat software on your gaming PC cannot detect any modifications. The DMA card appears as a legitimate PCIe device with spoofed signatures.",
        type: "tip",
      },
      {
        title: "Read-Only vs Read-Write",
        content: "Most DMA cheats are read-only, meaning they only read game memory to display ESP, radar, and other visual information. Read-write cheats can also modify game memory for features like aimbot, but carry slightly more risk.",
      },
    ]
  },
  "second-pc-setup": {
    title: "How do I setup my 2nd/Cheat PC for DMA cheating?",
    description: "Step-by-step guide to setup your second PC for DMA cheating. Install drivers, configure USB connections, and get started.",
    readTime: "12 min read",
    difficulty: "Intermediate",
    videoId: "cHdhiO9HmHM",
    sections: [
      {
        title: "Requirements",
        content: "Before starting, make sure you have:",
        steps: [
          "A second PC (can be low-spec, even an old laptop works)",
          "Your DMA card properly installed in the gaming PC's PCIe slot",
          "USB 3.0 cable for connection between DMA card and cheat PC",
          "Windows 10/11 (64-bit) on your cheat PC",
          "Visual C++ Redistributables installed"
        ]
      },
      {
        title: "Step 1: Install Prerequisites",
        content: "Download and install Visual C++ 2015-2022 Redistributable (both x64 and x86 versions) from Microsoft's official website. Also install .NET Framework 4.8 if not already present.",
      },
      {
        title: "Step 2: Install FTDI Drivers",
        content: "The DMA card communicates via FTDI USB. Download the latest FTDI VCP drivers from ftdichip.com and install them. Reboot your cheat PC after installation.",
        type: "info",
      },
      {
        title: "Step 3: Connect the Hardware",
        content: "Connect your cheat PC to the DMA card using a high-quality USB 3.0 cable. Avoid using USB hubs - connect directly to a motherboard USB port for best stability.",
        type: "warning",
      },
      {
        title: "Step 4: Verify Connection",
        content: "Open Device Manager on your cheat PC and look for the FTDI device under 'Universal Serial Bus controllers'. If you see a yellow warning icon, reinstall the FTDI drivers.",
      },
      {
        title: "Step 5: Install MemProcFS",
        content: "Download MemProcFS from the official repository. Extract to a folder like C:\\DMA. This is the core framework that reads memory from your gaming PC.",
      },
      {
        title: "Step 6: Test the Connection",
        content: "Open Command Prompt as Administrator, navigate to your MemProcFS folder, and run: memprocfs.exe -device fpga. If successful, you'll see memory being read.",
        type: "tip",
      },
    ]
  },
  "memory-map": {
    title: "How to generate a memory map (MMAP) for DMA cheats",
    description: "Generate a memory map (MMAP) file for DMA cheats. Fix slow progress, connectivity issues, or missing ESP/Aimbot elements.",
    readTime: "6 min read",
    difficulty: "Intermediate",
    videoId: "dMZhD-z4mFY",
    hasTool: true,
    sections: [
      {
        title: "What is a Memory Map?",
        content: "A memory map (MMAP) is a file that contains the physical-to-virtual memory address translations for your gaming PC. This allows the DMA software to correctly locate and read game memory without slow scanning.",
      },
      {
        title: "When to Generate MMAP",
        content: "You should generate a new memory map when:",
        steps: [
          "First time setting up DMA",
          "After Windows updates (especially major ones)",
          "After BIOS updates or changes",
          "When experiencing 'DTB not found' or 'Base address' errors",
          "If ESP or features suddenly stop working",
          "After changing RAM configuration"
        ]
      },
      {
        title: "Generation Process",
        content: "To generate a new MMAP, ensure your gaming PC is booted to Windows desktop (not in a game). On your cheat PC, run: memprocfs.exe -device fpga -memmap auto. Wait 2-5 minutes for completion.",
        type: "info",
      },
      {
        title: "Important Notes",
        content: "Generate MMAP with a clean Windows state - no games running, minimal background processes. The MMAP file is specific to your hardware configuration and Windows installation.",
        type: "warning",
      },
      {
        title: "Troubleshooting MMAP",
        content: "If generation fails: Check USB connection, ensure gaming PC is fully booted, try rebooting both PCs, verify FTDI drivers are installed correctly.",
      },
    ]
  },
  "troubleshooting": {
    title: "DMA Troubleshooting, Various fixes for many generic DMA issues",
    description: "Fix common DMA issues: failed to initialize, unable to locate DTB, failed to find base address, and USB disconnection problems.",
    readTime: "15 min read",
    difficulty: "All Levels",
    sections: [
      {
        title: "Failed to Initialize / Failed to Open FPGA",
        content: "This error means the DMA card is not being recognized by your cheat PC:",
        steps: [
          "Check USB cable is securely connected on both ends",
          "Try a different USB 3.0 port (avoid front panel ports)",
          "Reinstall FTDI drivers",
          "Check if DMA card LEDs are lit (indicates power)",
          "Try rebooting both PCs",
          "Test with a different USB 3.0 cable"
        ]
      },
      {
        title: "Unable to Locate DTB",
        content: "DTB (Directory Table Base) errors indicate the software cannot find the Windows kernel memory structures. This is usually solved by generating a fresh MMAP file. Also ensure Secure Boot is disabled in BIOS.",
        type: "warning",
      },
      {
        title: "Failed to Find Base Address",
        content: "This happens when the game memory cannot be located. Make sure the game is fully loaded (in main menu or match) before starting the cheat. Try regenerating your MMAP if the issue persists.",
      },
      {
        title: "USB Keeps Disconnecting",
        content: "Frequent USB disconnections are usually caused by:",
        steps: [
          "Low quality or damaged USB cable",
          "USB power management settings",
          "Front panel USB ports (use rear motherboard ports)",
          "Outdated chipset drivers",
          "USB hub interference"
        ]
      },
      {
        title: "Fix USB Power Management",
        content: "Open Device Manager, find your USB Root Hubs, go to Properties > Power Management, and uncheck 'Allow the computer to turn off this device to save power'. Also disable USB Selective Suspend in Power Options.",
        type: "tip",
      },
      {
        title: "ESP/Radar Not Showing",
        content: "If visual features don't appear: Verify game is running and you're in a match, check overlay settings in the cheat, try regenerating MMAP, ensure you're using the latest cheat version for your game update.",
      },
      {
        title: "Still Having Issues?",
        content: "Open a support ticket in our Discord server. Include your error messages, hardware specs, and what troubleshooting steps you've already tried.",
        type: "info",
      },
    ]
  },
  "kmbox-net": {
    title: "How to setup a KMBox Net for DMA cheating",
    description: "Complete KMBox Net setup guide for DMA cheating. Install drivers, configure network settings, and connect to your gaming PC.",
    readTime: "10 min read",
    difficulty: "Intermediate",
    videoId: "9yyJ-y7n-iE",
    sections: [
      {
        title: "About KMBox Net",
        content: "KMBox Net is a network-based input device that allows your cheat PC to control mouse and keyboard inputs on your gaming PC through ethernet. This enables features like aimbot and recoil control.",
      },
      {
        title: "What You Need",
        content: "Required hardware for KMBox Net setup:",
        steps: [
          "KMBox Net device",
          "Ethernet cable (Cat5e or better)",
          "Spare USB mouse and keyboard to connect to KMBox",
          "Your existing gaming mouse/keyboard stay connected to gaming PC"
        ]
      },
      {
        title: "Physical Setup",
        content: "Connect your spare mouse and keyboard to the KMBox Net USB ports. Connect the KMBox USB output cable to your gaming PC. Connect ethernet from KMBox to your cheat PC or router.",
        type: "info",
      },
      {
        title: "Network Configuration",
        content: "The KMBox Net uses IP 192.168.2.188 by default. If connecting directly to your cheat PC, set your ethernet adapter to a static IP like 192.168.2.100 with subnet 255.255.255.0.",
      },
      {
        title: "Software Setup",
        content: "Install the KMBox Net software on your cheat PC. Enter the KMBox IP address in the connection settings. Test by moving your mouse - you should see input on your gaming PC.",
        steps: [
          "Download KMBox software from official source",
          "Run as Administrator",
          "Enter IP: 192.168.2.188",
          "Click Connect and test inputs"
        ]
      },
      {
        title: "Latency Optimization",
        content: "For lowest latency, connect KMBox directly to your cheat PC via ethernet instead of going through a router. Use a short, high-quality ethernet cable.",
        type: "tip",
      },
    ]
  },
  "kmbox-b-plus": {
    title: "How to setup a KMBox B+ Pro for DMA cheating",
    description: "Complete KMBox B+ Pro setup guide. Install drivers, configure connections, and troubleshoot common issues.",
    readTime: "8 min read",
    difficulty: "Intermediate",
    sections: [
      {
        title: "KMBox B+ Pro Overview",
        content: "The KMBox B+ Pro is a USB-based input device that connects to your cheat PC via serial/COM port. It's simpler to set up than KMBox Net but has slightly different latency characteristics.",
      },
      {
        title: "Required Items",
        content: "What you need for B+ Pro setup:",
        steps: [
          "KMBox B+ Pro device",
          "2x USB cables (included with device)",
          "Spare USB mouse and keyboard",
          "CH340 serial drivers"
        ]
      },
      {
        title: "Install CH340 Drivers",
        content: "Download and install CH340/CH341 serial drivers on your cheat PC. These are required for the USB serial communication. Reboot after installation.",
        type: "info",
      },
      {
        title: "Hardware Connection",
        content: "Connect spare mouse and keyboard to the KMBox B+ USB input ports. Connect the 'PC' labeled USB port to your gaming PC. Connect the 'COM' labeled USB port to your cheat PC.",
      },
      {
        title: "Find COM Port",
        content: "Open Device Manager on your cheat PC. Look under 'Ports (COM & LPT)' for the KMBox device. Note the COM port number (e.g., COM3). Enter this in your cheat software.",
        type: "tip",
      },
      {
        title: "Testing",
        content: "Use the KMBox test utility or your cheat software to verify inputs. Move the mouse and press keys to confirm the connection is working properly.",
      },
    ]
  },
  "system-time-sync": {
    title: "Syncing your System Time",
    description: "Learn how to properly sync your system time on your 2nd PC for DMA cheats to work correctly.",
    readTime: "3 min read",
    difficulty: "Beginner",
    sections: [
      {
        title: "Why Time Sync Matters",
        content: "Some DMA software requires accurate system time for license validation and proper functionality. Time drift between your PCs can cause authentication failures or licensing issues.",
      },
      {
        title: "Windows Automatic Sync",
        content: "Enable automatic time sync in Windows:",
        steps: [
          "Open Settings > Time & Language > Date & time",
          "Enable 'Set time automatically'",
          "Enable 'Set time zone automatically'",
          "Click 'Sync now' to force immediate update"
        ]
      },
      {
        title: "Manual Sync via Command Prompt",
        content: "If automatic sync fails, open Command Prompt as Administrator and run: w32tm /resync /force. This forces Windows to sync with the time server immediately.",
        type: "info",
      },
      {
        title: "Using Google Time Server",
        content: "For more reliable sync, you can use Google's time servers. In Command Prompt as Admin, run: w32tm /config /manualpeerlist:\"time.google.com\" /syncfromflags:manual /update",
        type: "tip",
      },
    ]
  },
  "fuser-setup": {
    title: "How to setup and flash 4th Gen Dichen Fuser guide",
    description: "Setup guide for 4th Gen Dichen Fuser hardware. Flash firmware and configure EDID spoofing for your display.",
    readTime: "8 min read",
    difficulty: "Advanced",
    sections: [
      {
        title: "What is a Fuser?",
        content: "A Fuser sits between your GPU and monitor, allowing your cheat PC to overlay ESP graphics directly onto your game display without needing a second monitor. It also handles EDID spoofing to prevent detection.",
      },
      {
        title: "4th Gen Dichen Specs",
        content: "The 4th Gen Dichen Fuser features:",
        steps: [
          "4K60Hz HDR passthrough support",
          "Built-in EDID spoofing",
          "Low latency overlay mixing",
          "USB 3.0 capture output",
          "Firmware update capability"
        ]
      },
      {
        title: "Hardware Installation",
        content: "Disconnect your monitor from GPU. Connect GPU HDMI/DP output to Fuser input. Connect Fuser output to your monitor. Connect Fuser USB to your cheat PC.",
        type: "info",
      },
      {
        title: "Firmware Flashing",
        content: "WARNING: Incorrect firmware can brick your device. Download firmware only from official sources. Never disconnect power during flashing process.",
        type: "warning",
      },
      {
        title: "Flash Process",
        content: "To flash firmware:",
        steps: [
          "Disconnect all cables from Fuser",
          "Hold reset button while connecting USB",
          "Device appears as USB storage drive",
          "Copy .bin firmware file to the drive",
          "Safely eject and reconnect - flash happens automatically"
        ]
      },
      {
        title: "EDID Configuration",
        content: "EDID spoofing makes your GPU think it's connected directly to your monitor. Use the Fuser configuration tool to copy your monitor's EDID data to the device. This prevents games from detecting the capture device.",
        type: "tip",
      },
      {
        title: "Troubleshooting Black Screen",
        content: "If you see a black screen: Try different HDMI/DP cables, ensure correct input/output ports, check EDID settings match your monitor, try a different resolution temporarily.",
      },
    ]
  },
  "dna-id": {
    title: "DMA DNA ID — Getting Your Unique Identifier",
    description: "How to obtain your DNA ID needed for custom firmware generation. Unique to your DMA card — required before we create your firmware.",
    readTime: "5 min read",
    difficulty: "Intermediate",
    sections: [
      {
        title: "What is a DNA ID?",
        content: "Your DNA ID is the unique hardware identifier of your DMA card. We need this before we can generate your custom firmware — it ensures your firmware is built specifically for your card and cannot be used on another device.",
      },
      {
        title: "Step 1 — Download MemProcFS",
        content: "Download MemProcFS from our Discord #downloads channel. Extract the zip to your Desktop on your cheat/2nd PC.",
        type: "info",
      },
      {
        title: "Step 2 — Run as Administrator",
        content: "Right-click MemProcFS.exe and select 'Run as Administrator'. Make sure your DMA card is connected before running.",
      },
      {
        title: "Step 3 — Find your DNA ID",
        content: "After running, open File Explorer and navigate to: M:\\misc\\pcileech_status.txt (MemProcFS creates a virtual M: drive). Open the file and look for the line starting with DNA_ID: followed by a 16-character code.",
        type: "info",
      },
      {
        title: "Step 4 — Send to us",
        content: "Open a ticket in our Discord and paste your DNA ID. Our team will generate your custom firmware and send it back, usually within a few hours.",
      },
      {
        title: "Important Note",
        content: "Your DNA ID is unique to your specific DMA card. If you replace your DMA card, you'll need a new firmware generated with the new card's DNA ID.",
        type: "warning",
      },
    ]
  },
  "flash-tools": {
    title: "DMA Flash Tools & Drivers Collection",
    description: "Full collection of drivers and flashers for 35T and 75T DMA cards. Includes software for Captain DMA, Screamer, and compatible boards.",
    readTime: "5 min read",
    difficulty: "Intermediate",
    sections: [
      {
        title: "Overview",
        content: "All drivers and tools required for DMA card setup and firmware flashing. Download everything from our Discord #downloads channel.",
      },
      {
        title: "Required for All Setups",
        content: "These tools are required regardless of your DMA card model:",
        steps: [
          "Visual C++ Redistributables — Loader runtime (Required)",
          "WebView2 Runtime — Loader UI (Required)",
          "FTD3XX Driver — DMA USB connection (Required)",
          "MemProcFS — DNA ID extraction (For firmware)"
        ]
      },
      {
        title: "For KMBox Net",
        content: "KMBox Net requires the WCHUSBNIC.EXE driver for network adapter setup on your cheat PC.",
        type: "info",
      },
      {
        title: "For KMBox B+ Pro",
        content: "KMBox B+ Pro requires the CH340/CH341 COM port driver for serial communication.",
        type: "info",
      },
      {
        title: "For 35T Cards (Firmware Flashing)",
        content: "35T DMA cards use these flash tools:",
        steps: [
          "Vivado Lab Edition — Official Xilinx flash tool",
          "PCIe Squirrel Flasher — Alternative flasher"
        ]
      },
      {
        title: "For 75T Cards (Firmware Flashing)",
        content: "75T DMA cards use these flash tools:",
        steps: [
          "Xilinx Vivado — Official flash tool",
          "Captain DMA Flasher — Purpose-built tool"
        ]
      },
      {
        title: "For Fuser Setup",
        content: "Fuser hardware requires:",
        steps: [
          "Dichen EDID Spoofer — EDID modification tool",
          "Dichen Setup PDF — Full instructions"
        ]
      },
      {
        title: "Download Location",
        content: "All files are available in our Discord #downloads channel. Join at discord.gg/lethaldma and look for the pinned messages in #downloads.",
        type: "tip",
      },
    ]
  },
}

export default function GuidePage() {
  const params = useParams()
  const slug = params.slug as string
  const guide = guidesContent[slug]

  if (!guide) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-32 pb-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
          <Link href="/guides">
            <Button>Back to Guides</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <article className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-[680px]">
          {/* Back link */}
          <Link href="/guides" className="inline-flex items-center gap-1.5 text-[13px] text-white/25 hover:text-white/50 transition-colors mb-10">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Guides
          </Link>

          {/* Header */}
          <header className="mb-10 pb-10 border-b border-white/[0.06]">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                guide.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400" :
                guide.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400" :
                guide.difficulty === "Advanced" ? "bg-red-500/10 text-red-400" :
                "bg-blue-500/10 text-blue-400"
              }`}>
                {guide.difficulty}
              </span>
              <span className="text-[11px] text-white/20">{guide.readTime}</span>
              {guide.videoId && (
                <span className="flex items-center gap-1 text-[11px] text-red-400/60">
                  <Play className="h-2.5 w-2.5 fill-current" /> Video included
                </span>
              )}
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold leading-[1.2] tracking-tight text-white mb-3">
              {guide.title}
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed">
              {guide.description}
            </p>
          </header>

          {/* Video Embed */}
          {guide.videoId && (
            <div className="mb-10 rounded-xl overflow-hidden border border-white/[0.06]">
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${guide.videoId}`}
                  title={guide.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* MMAP Tool */}
          {guide.hasTool && slug === "memory-map" && <MmapTool />}

          {/* Content — blog-style prose */}
          <div className="guide-prose">
            {guide.sections.map((section, index) => (
              <div key={index} className="mb-8">
                {/* Section title */}
                <h2 className="text-[18px] font-bold text-white mb-3 flex items-center gap-2.5">
                  {section.type === "warning" && <span className="text-amber-400 text-sm">⚠</span>}
                  {section.type === "tip" && <span className="text-emerald-400 text-sm">💡</span>}
                  {section.type === "info" && <span className="text-blue-400 text-sm">ℹ</span>}
                  {section.title}
                </h2>

                {/* Section content */}
                <p className="text-[15px] text-white/50 leading-[1.8] mb-0">
                  {section.content}
                </p>

                {/* Steps / list */}
                {section.steps && (
                  <ul className="mt-4 space-y-1.5 pl-1">
                    {section.steps.map((step, i) => (
                      <li key={i} className="flex items-baseline gap-3 text-[14px]">
                        <span className="text-[#f97316] font-semibold shrink-0">&bull;</span>
                        <span className="text-white/55 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Visual divider between sections */}
                {index < guide.sections.length - 1 && (
                  <div className="mt-8 h-px bg-white/[0.03]" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-white/20">
              Still stuck?{" "}
              <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="text-[#f97316]/60 hover:text-[#f97316] transition-colors">
                Open a ticket on Discord
              </a>
            </p>
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-[13px] text-white/25 hover:text-white/50 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Guides
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
