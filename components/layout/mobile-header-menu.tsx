"use client"

import { useState } from "react"
import Link from "next/link"
import { MenuIcon, XIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const mobileLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/cakes", label: "Cakes" },
  { href: "/sweets", label: "Sweets" },
  { href: "/custom-cake", label: "Custom Cakes" },
  { href: "/offers", label: "Offers" },
  { href: "/bulk-orders", label: "Bulk Orders" },
  { href: "/stores", label: "Stores" },
  { href: "/contact", label: "Contact" },
]

export function MobileHeaderMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
        aria-expanded={open}
        aria-controls="mobile-header-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
        Menu
      </button>
      {open ? (
        <div
          id="mobile-header-menu"
          className="fixed inset-x-4 top-24 z-50 rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-lg"
        >
          <nav className="grid gap-1" aria-label="Mobile menu">
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  )
}
