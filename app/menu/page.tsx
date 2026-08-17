import { MenuCatalogue } from "@/components/commerce/menu-catalogue"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { getCategories, getProducts } from "@/lib/catalogue-server"
import { cn } from "@/lib/utils"

export default async function MenuPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <StorefrontShell>
      <main className={cn(SITE_CONTENT_CLASS, "pb-8")}>
        <MenuCatalogue products={products} categories={categories} />
      </main>
    </StorefrontShell>
  )
}
