import Link from "next/link"
import { CakeSlice, Home, MenuIcon, Search, ShoppingBag, UserRound } from "lucide-react"

import { HeaderCartLink } from "@/components/layout/header-cart-link"
import { HeaderFavouriteLink } from "@/components/layout/header-favourite-link"
import { MobileHeaderMenu } from "@/components/layout/mobile-header-menu"
import { ViewCartBar } from "@/components/layout/view-cart-bar"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getCategories } from "@/lib/catalogue"
import { cn } from "@/lib/utils"

const primaryLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/cakes", label: "Cakes" },
  { href: "/sweets", label: "Sweets" },
  { href: "/custom-cake", label: "Custom Cakes" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/offers", label: "Offers" },
]

const policyLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-and-cancellation", label: "Refunds" },
  { href: "/delivery-policy", label: "Delivery" },
]

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const categories = getCategories()

  return (
    <div className="min-h-svh bg-background pb-16 text-foreground md:pb-0">
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-2 text-center text-xs font-medium sm:text-sm">
          Delivery, pickup, timings, and offers are admin-configurable and pending business review.
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <MobileHeaderMenu />
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-medium text-primary-foreground">
                MB
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-base font-medium">Master Bakery</span>
                <span className="block truncate text-xs text-muted-foreground">Sivagangai ordering</span>
              </span>
            </Link>
          </div>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/search" className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))} aria-label="Search">
              <Search className="size-4" />
            </Link>
            <Link href="/account" className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "hidden sm:inline-flex")} aria-label="Account">
              <UserRound className="size-4" />
            </Link>
            <HeaderFavouriteLink />
            <HeaderCartLink />
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <h2 className="font-heading text-lg font-medium">Master Bakery</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              A direct ordering platform for verified Master Bakery products. Business details remain editable until owner review is complete.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Categories</h3>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              {categories.map((category) => (
                <Link key={category.slug} href={`/category/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium">Support</h3>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <Link href="/contact">Contact</Link>
              <Link href="/stores">Stores</Link>
              <Link href="/faq">FAQ</Link>
              {policyLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <ViewCartBar />
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background md:hidden" aria-label="Mobile navigation">
        <div className="grid h-16 grid-cols-5">
          {[
            { href: "/", label: "Home", icon: Home },
            { href: "/menu", label: "Menu", icon: MenuIcon },
            { href: "/cakes", label: "Cakes", icon: CakeSlice },
            { href: "/search", label: "Search", icon: Search },
            { href: "/cart", label: "Cart", icon: ShoppingBag },
          ].map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`${item.label} page`}
                className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
      <Separator />
    </div>
  )
}
