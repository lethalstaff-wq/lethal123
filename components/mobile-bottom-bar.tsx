"use client"

import { Activity, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MobileBottomBar() {
  return (
    <>
      {/* Spacer to prevent content from being hidden behind the bar */}
      <div className="h-16 md:hidden" />
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t border-white/[0.08] bg-black/90 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/50 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between gap-2 p-3">
          <Link href="/status" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2 text-[12px] font-bold rounded-xl border-white/[0.08] bg-white/[0.03] hover:border-[#f97316]/40 hover:bg-[#f97316]/10 hover:text-[#f97316] transition-all">
              <Activity className="h-4 w-4" />
              <span>Status</span>
            </Button>
          </Link>
          <Link href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full gap-2 text-[12px] font-bold rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] hover:brightness-110 text-white border-0 shadow-[0_4px_14px_rgba(249,115,22,0.35)]">
              <MessageCircle className="h-4 w-4" />
              <span>Discord</span>
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
