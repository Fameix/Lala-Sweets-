"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MenuIcon, Search, ShoppingBag, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/menu", label: "Menu", icon: MenuIcon },
  { href: "/category/sweets", label: "Sweets", icon: Sparkles },
  { href: "/search", label: "Search", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden" aria-label="Mobile navigation">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`${item.label} page`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive ? "font-medium text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-4", isActive && "text-primary")} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
