import Link from "next/link"

import { MenuCatalogue } from "@/components/commerce/menu-catalogue"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { getCategories, getProducts } from "@/lib/catalogue"
import { cn } from "@/lib/utils"

export default function MenuPage() {
  const products = getProducts()
  const categories = getCategories()

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-6xl px-4 pb-8">
        <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background px-4 py-6 md:py-8">
          <h1 className="font-heading text-3xl font-medium">Menu</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Browse the extracted Master Bakery menu. Products remain non-orderable until price, stock, branch, and food classification are approved.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/ai-assistant" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Ask Master AI
            </Link>
            <Link href="/cake-serving-calculator" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              How Much Cake Do I Need?
            </Link>
          </div>
        </div>
        <MenuCatalogue products={products} categories={categories} />
      </main>
    </StorefrontShell>
  )
}
