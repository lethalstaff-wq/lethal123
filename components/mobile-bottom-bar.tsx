"use client"

import { Activity, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MobileBottomBar() {
  return (
    <>
      {/* Spacer to prevent content from being hidden behind the bar */}
      <div className="h-16 md:hidden" />
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t border-white/[0.04] bg-black/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 p-3">
          <Link href="/status" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs rounded-lg">
              <Activity className="h-4 w-4" />
              <span>Status</span>
            </Button>
          </Link>
          <Link href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full gap-2 text-xs rounded-lg bg-primary hover:bg-primary/90">
              <MessageCircle className="h-4 w-4" />
              <span>Discord</span>
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
