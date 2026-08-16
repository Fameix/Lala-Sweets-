import Link from "next/link"

import { MenuCatalogue } from "@/components/commerce/menu-catalogue"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { getCategories, getProducts } from "@/lib/catalogue"
import { cn } from "@/lib/utils"

export default function MenuPage() {
  const products = getProducts()
  const categories = getCategories()

  return (
    <StorefrontShell>
      <main className={cn(SITE_CONTENT_CLASS, "pb-8")}>
        <div className="sticky top-16 z-30 -mx-5 border-b border-border bg-background px-5 py-6 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20 md:py-8">
          <h1 className="font-heading text-3xl font-medium">Menu</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Browse traditional sweets and savouries from Sri Lakshmivilas Purathana Lala Sweets. Please enquire for current availability, pack sizes and updated pricing before ordering.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/category/sweets" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Sweets
            </Link>
            <Link href="/category/savouries" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Savouries
            </Link>
            <Link href="/contact" className={cn(buttonVariants({ size: "sm" }))}>
              Order / Enquire
            </Link>
          </div>
        </div>
        <MenuCatalogue products={products} categories={categories} />
      </main>
    </StorefrontShell>
  )
}
