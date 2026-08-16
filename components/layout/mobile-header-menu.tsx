"use client"

import { useState } from "react"
import Link from "next/link"
import { MenuIcon, XIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Story" },
  { href: "/menu", label: "Menu" },
  { href: "/legacy", label: "Our Legacy" },
  { href: "/contact", label: "Contact" },
]

export function MobileHeaderMenu({ transparentHeader = false }: { transparentHeader?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          transparentHeader && "border-[#5f2b12]/25 bg-[#fff7df]/20 text-[#3a170a] hover:bg-[#fff7df]/40"
        )}
        aria-expanded={open}
        aria-controls="mobile-header-menu"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
      </button>
      {open ? (
        <div
          id="mobile-header-menu"
          className="fixed inset-x-3 top-16 z-50 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg sm:inset-x-6 sm:top-20"
        >
          <nav className="grid gap-1" aria-label="Mobile menu">
            {mobileLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="cursor-pointer rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200 hover:bg-[#310898]/10 hover:text-[#310898] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
