"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
        <div className="h-[18px] w-[18px]" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-10 w-10 rounded-full hover:bg-[#f97316]/10 transition-colors"
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px] text-[#f97316] transition-all" />
      ) : (
        <Moon className="h-[18px] w-[18px] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
