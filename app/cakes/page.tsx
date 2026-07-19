import type { Metadata } from "next"
import Link from "next/link"

import { CakeSlice, Filter, Gift, Search } from "lucide-react"

import { ProductCard } from "@/components/commerce/product-card"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCakeProducts, getCakeSubcategories } from "@/lib/catalogue"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Order Cakes Online in Sivagangai | Master Bakery",
  description:
    "Explore birthday cakes, chocolate cakes, fruit cakes, premium cakes and customized cakes from Master Bakery in Sivagangai.",
  openGraph: {
    title: "Cakes Made for Every Celebration | Master Bakery",
    description: "Classic flavours, premium creations and customized cakes awaiting bakery review.",
    url: "/cakes",
  },
}

export default async function CakesPage({
  searchParams,
}: {
  searchParams: Promise<{ subcategory?: string; q?: string }>
}) {
  const params = await searchParams
  const subcategory = params.subcategory ?? ""
  const query = (params.q ?? "").toLowerCase()
  const allCakes = getCakeProducts()
  const subcategories = getCakeSubcategories()
  const cakes = allCakes.filter((cake) => {
    const matchesSubcategory = !subcategory || cake.subcategory?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === subcategory
    const matchesQuery =
      !query ||
      [cake.display_name, cake.subcategory, cake.flavour, ...(cake.search_aliases ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(query)

    return matchesSubcategory && matchesQuery
  })

  const categoryCards = ["Birthday Cakes", "Chocolate Cakes", "Fruit Cakes", "Premium Cakes", "Kids Cakes", "Photo Cakes", "Custom Cakes"]
  const occasions = ["Birthday", "Anniversary", "Kids", "Wedding", "Congratulations", "Corporate"]

  return (
    <StorefrontShell>
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <Badge variant="secondary">Cakes</Badge>
              <h1 className="mt-4 font-heading text-4xl font-medium tracking-normal sm:text-5xl">
                Cakes Made for Every Celebration
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Choose from classic flavours, premium creations and customized cakes for birthdays, anniversaries and special moments.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="#all-cakes" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
                  <CakeSlice className="size-4" />
                  Explore Cakes
                </Link>
                <Link href="/custom-cake" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}>
                  <Gift className="size-4" />
                  Customize a Cake
                </Link>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Catalogue Review Status</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <p>{allCakes.length} proposed cakes are active in the catalogue.</p>
                <p>Prices, weights, egg options, product images, preparation time, and branch availability are pending admin approval.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="font-heading text-2xl font-medium">Shop Cake Categories</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((name) => (
              <Link key={name} href={`/cakes?subcategory=${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <CakeSlice className="size-5" />
                    </div>
                    <CardTitle>{name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-4">
          <h2 className="font-heading text-2xl font-medium">Shop by Occasion</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {occasions.map((occasion) => (
              <Badge key={occasion} variant="outline" className="px-3 py-1">
                {occasion}
              </Badge>
            ))}
          </div>
        </section>

        <section id="all-cakes" className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-medium">All Cakes</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[250px_1fr]">
            <aside className="h-fit rounded-2xl border border-border bg-card p-4">
              <form className="grid gap-4">
                <label className="text-sm font-medium" htmlFor="q">
                  Search cakes
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="q" name="q" defaultValue={params.q ?? ""} className="pl-9" placeholder="Black Forest, birthday" />
                </div>
              </form>
              <div className="mt-5 grid gap-2 text-sm">
                <Link href="/cakes" className={!subcategory ? "font-medium text-foreground" : "text-muted-foreground"}>
                  All cakes ({allCakes.length})
                </Link>
                {subcategories.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/cakes?subcategory=${item.slug}`}
                    className={subcategory === item.slug ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}
                  >
                    {item.name} ({item.productCount})
                  </Link>
                ))}
              </div>
            </aside>
            <div>
              <p className="mb-4 text-sm text-muted-foreground">{cakes.length} cakes found</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cakes.map((cake) => (
                  <ProductCard key={cake.id} product={cake} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground sm:p-8">
            <h2 className="font-heading text-2xl font-medium">Have a Special Design in Mind?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 opacity-90">
              Upload your reference, share your theme and request a custom quotation from Master Bakery.
            </p>
            <Link href="/custom-cake" className={cn(buttonVariants({ variant: "secondary" }), "mt-5")}>
              Request a Custom Cake
            </Link>
          </div>
        </section>
      </main>
    </StorefrontShell>
  )
}
