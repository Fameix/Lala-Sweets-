import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import Navbar from "@/components/shadcn-space/radix/blocks/navbar-01/navbar"
import { ViewCartBar } from "@/components/layout/view-cart-bar"
import { Separator } from "@/components/ui/separator"
import { getCategories } from "@/lib/catalogue"
import { cn } from "@/lib/utils"

export const SITE_CONTENT_CLASS = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"

const policyLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-and-cancellation", label: "Refunds" },
  { href: "/delivery-policy", label: "Delivery" },
]

export function StorefrontShell({ children, transparentHeader = false }: { children: React.ReactNode; transparentHeader?: boolean }) {
  const categories = getCategories()

  return (
    <div className="min-h-svh bg-background pb-16 text-foreground md:pb-0">
      <Navbar transparent={transparentHeader} />
      {children}
      <footer className="border-t border-border bg-card">
        <div className={cn(SITE_CONTENT_CLASS, "grid gap-8 py-8 md:grid-cols-[1.3fr_1fr_1fr]")}>
          <div>
            <h2 className="font-heading text-lg font-medium">Sri Lakshmivilas Purathana Lala Sweets</h2>
            <p className="mt-1 text-sm font-medium text-primary">Since 1882</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Traditional Tirunelveli sweets and authentic Tirunelveli ghee halwa from Vannarpettai, Tirunelveli.
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
            <h3 className="text-sm font-medium">Contact</h3>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <Link href="tel:+918220266077" className="inline-flex items-center gap-2"><Phone className="size-4" />+91 82202 66077</Link>
              <Link href="mailto:srilakshmivilassweets.tvl@gmail.com" className="inline-flex items-center gap-2"><Mail className="size-4" />Email us</Link>
              <Link href="/contact" className="inline-flex items-center gap-2"><MapPin className="size-4" />Vannarpettai, Tirunelveli</Link>
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
      <MobileBottomNav />
      <Separator />
    </div>
  )
}
