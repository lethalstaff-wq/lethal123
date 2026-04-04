"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/guides", label: "Guides" },
    { href: "/reviews", label: "Reviews" },
    { href: "/track", label: "Track Order" },
    { href: "/status", label: "Status" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Products, guides, and support</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-base font-medium hover:text-primary hover:bg-primary/5 transition-all py-3 px-4 rounded-lg border-b border-border/50 last:border-b-0"
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t border-border mt-4 pt-4 flex gap-2">
            <Link href="/cart" onClick={() => setOpen(false)} className="flex-1">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <ShoppingCart className="h-4 w-4" />
                Cart {itemCount > 0 && `(${itemCount})`}
              </Button>
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <User className="h-4 w-4" />
                Account
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
