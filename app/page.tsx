import Image from "next/image"
import Link from "next/link"

import { Clock3 } from "lucide-react"

import { ProductCard } from "@/components/commerce/product-card"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCakeProducts, getCategories, getProducts } from "@/lib/catalogue"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const categories = getCategories()
  const featuredProducts = getProducts().slice(0, 6)
  const cakes = getCakeProducts().slice(0, 8)

  return (
    <StorefrontShell>
      <main>
        <section className="relative overflow-hidden border-b border-border bg-background">
          <div className="relative w-full overflow-hidden h-[80svh] min-h-[560px] max-h-[820px]">
            <Image
              src="/hero-banner.png"
              alt="Master Bakery banner showing freshly baked bread and ingredients"
              width={1779}
              height={880}
              priority
              sizes="100vw"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-medium">Browse categories</h2>
              <p className="mt-2 text-sm text-muted-foreground">Only menu-confirmed categories are shown publicly.</p>
            </div>
            <Link href="/menu" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Full menu
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`}>
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.productCount} review-ready products</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-medium">Cakes for Every Celebration</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover classic flavours, chocolate favourites and customized cakes for your special moments.
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Link href="/cakes" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                View All Cakes
              </Link>
              <Link href="/custom-cake" className={cn(buttonVariants({ size: "sm" }))}>
                Customize a Cake
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cakes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-medium">Featured Products</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            These are catalogue preview items, not best sellers. Prices are pending bakery approval.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </StorefrontShell>
  )
}
