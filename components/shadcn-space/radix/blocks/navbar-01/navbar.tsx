"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Phone, Search, TextAlignJustify, UserRound } from "lucide-react"

import { HeaderCartLink } from "@/components/layout/header-cart-link"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const SITE_CONTENT_CLASS = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/category/sweets", label: "Sweets" },
  { href: "/menu", label: "Menu" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
]

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }

    onScroll()
    window.addEventListener("scroll", onScroll)
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div className="relative z-40">
      {!transparent ? (
        <div className="border-b border-primary/20 bg-primary text-primary-foreground">
          <div className={cn(SITE_CONTENT_CLASS, "flex items-center justify-center py-2 text-center text-xs font-medium sm:text-sm")}>
            Since 1882 | Authentic Tirunelveli Ghee Halwa & Traditional Sweets
          </div>
        </div>
      ) : null}

      <header
        className={cn(
          "top-0",
          transparent ? "absolute inset-x-0 text-[#3a170a]" : "sticky bg-background/95 backdrop-blur",
        )}
      >
        <div className={cn(SITE_CONTENT_CLASS, "py-3 sm:py-4")}>
          <nav
            className={cn(
              "flex items-center justify-between gap-3 rounded-full border px-3 py-2 shadow-sm transition-all duration-300 sm:px-4",
              transparent
                ? "border-[#7b4a1f]/15 bg-[#fff6df]/88 shadow-[0_10px_28px_rgba(95,43,18,0.14)] backdrop-blur-md"
                : isScrolled
                  ? "border-border/60 bg-background/80 shadow-lg shadow-primary/5"
                  : "border-border/60 bg-background/90",
            )}
            aria-label="Primary navigation"
          >
            <Link
              href="/"
              className="relative block h-10 w-[168px] shrink-0 overflow-hidden sm:h-11 sm:w-[220px] md:h-12 md:w-[260px] lg:w-[300px]"
              aria-label="Sri Lakshmivilas Purathana Lala Sweets home"
            >
              <Image
                src="/images/lala-sweets-header-logo-transparent.png"
                alt="Sri Lakshmivilas Purathana Lala Sweets logo"
                fill
                sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, (min-width: 640px) 220px, 168px"
                quality={100}
                className="object-contain object-left"
                priority
              />
            </Link>

            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList
                className="gap-1"
              >
                {primaryLinks.map((link) => (
                  <NavigationMenuItem key={`${link.href}-${link.label}`}>
                    <NavigationMenuLink
                      href={link.href}
                      className={cn(
                        "cursor-pointer rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200",
                        transparent
                          ? "text-[#4a2410] hover:-translate-y-px hover:bg-accent/60 hover:text-primary hover:shadow-[0_4px_12px_rgba(89,20,10,0.14)]"
                          : "text-muted-foreground hover:-translate-y-px hover:bg-primary/10 hover:text-primary hover:shadow-[0_4px_12px_rgba(89,20,10,0.1)]",
                      )}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/search"
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full text-[#3a170a] transition-colors hover:bg-[#fff7df]/40 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "hidden sm:inline-flex",
                  !transparent && "text-foreground hover:bg-muted",
                )}
                aria-label="Search"
              >
                <Search className="size-4" />
              </Link>
              <Link
                href="/account"
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full text-[#3a170a] transition-colors hover:bg-[#fff7df]/40 hover:text-[#310898] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "hidden sm:inline-flex",
                  transparent && "hover:bg-[#fff7df]/40",
                )}
                aria-label="Account"
              >
                <UserRound className="size-4" />
              </Link>
              <HeaderCartLink transparentHeader={transparent} />
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden font-semibold lg:inline-flex",
                  transparent && "bg-primary text-primary-foreground hover:bg-primary/85",
                )}
              >
                <Phone className="size-4" />
                Enquire
              </Link>

              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-sm" }),
                    "lg:hidden",
                    transparent && "border-[#5f2b12]/25 bg-[#fff7df]/20 text-[#3a170a] hover:bg-[#fff7df]/40",
                  )}
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                  <TextAlignJustify className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mt-2 w-64">
                  <div className="grid gap-1 p-1">
                    {primaryLinks.map((link) => (
                      <DropdownMenuItem key={link.href}>
                          <Link
                            href={link.href}
                            className="w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            {link.label}
                        </Link>
                      </DropdownMenuItem>
                  ))}
                    <div className="my-1 h-px bg-border/60" />
                      <DropdownMenuItem>
                        <Link href="/account" className="w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[#310898]/10 hover:text-[#310898]" onClick={() => setIsOpen(false)}>
                          Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/cart" className="w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[#310898]/10 hover:text-[#310898]" onClick={() => setIsOpen(false)}>
                          Cart
                        </Link>
                      </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>
    </div>
  )
}

export default Navbar
