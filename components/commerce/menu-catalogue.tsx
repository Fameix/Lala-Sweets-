"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Box, Filter, Mic, Search, Star } from "lucide-react"

import { ProductCard } from "@/components/commerce/product-card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CategorySummary, Product } from "@/types/catalogue"

type FilterKey = "inStock" | "veg" | "nonVeg" | "bestseller" | "offer" | "weight"

const filters: { key: FilterKey; label: string }[] = [
  { key: "inStock", label: "In Stock" },
  { key: "veg", label: "Veg" },
  { key: "nonVeg", label: "Non-Veg" },
  { key: "bestseller", label: "Bestseller" },
  { key: "offer", label: "On Offer" },
  { key: "weight", label: "Weight" },
]

export function MenuCatalogue({
  products,
  categories,
}: {
  products: Product[]
  categories: CategorySummary[]
}) {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set())

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          product.display_name,
          product.source_name,
          product.normalized_category,
          product.source_category,
          product.subcategory ?? "",
          product.flavour ?? "",
          product.short_description,
          ...(product.search_aliases ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)

      if (!matchesQuery) {
        return false
      }

      if (activeFilters.has("inStock") && product.availability_status !== "available") {
        return false
      }

      if (activeFilters.has("veg") && product.food_type !== "vegetarian") {
        return false
      }

      if (activeFilters.has("nonVeg") && product.food_type !== "non-vegetarian") {
        return false
      }

      if (activeFilters.has("bestseller") && !product.is_featured) {
        return false
      }

      if (activeFilters.has("offer") && product.compare_at_price_paise === null) {
        return false
      }

      if (activeFilters.has("weight") && (product.available_weights?.length ?? 0) === 0) {
        return false
      }

      return true
    })
  }, [activeFilters, products, query])

  const toggleFilter = (filter: FilterKey) => {
    setActiveFilters((currentFilters) => {
      const nextFilters = new Set(currentFilters)

      if (nextFilters.has(filter)) {
        nextFilters.delete(filter)
      } else {
        nextFilters.add(filter)
      }

      return nextFilters
    })
  }

  return (
    <div className="mt-6 grid items-start gap-3 md:h-[calc(100svh-17rem)] md:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Menu</h2>
        <div className="mt-5 grid gap-2 text-sm">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="text-muted-foreground hover:text-foreground">
              {category.name} ({category.productCount})
            </Link>
          ))}
        </div>
      </aside>
      <section className="md:h-full md:overflow-y-auto md:pr-2">
        <div className="mb-4 overflow-x-auto rounded-2xl border border-border bg-card p-3">
          <div className="flex min-w-max items-center gap-2">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 rounded-xl pl-9 pr-10"
                placeholder="Search Menu"
                aria-label="Search menu"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Mic className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <button type="button" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}>
              <Filter className="size-4" />
              Filters
            </button>
            {filters.map((filter) => {
              const active = activeFilters.has(filter.key)

              return (
                <button
                  key={filter.key}
                  type="button"
                  className={cn(
                    buttonVariants({ variant: active ? "default" : "outline", size: "sm" }),
                    "rounded-xl"
                  )}
                  aria-pressed={active}
                  onClick={() => toggleFilter(filter.key)}
                >
                  {filter.key === "inStock" ? <Box className="size-4" /> : null}
                  {filter.key === "veg" ? (
                    <Badge className="size-4 rounded-[4px] border-green-600 bg-transparent p-0 text-green-600" variant="outline">
                      <span className="size-1.5 rounded-full bg-green-600" />
                    </Badge>
                  ) : null}
                  {filter.key === "nonVeg" ? (
                    <Badge className="size-4 rounded-[4px] border-destructive bg-transparent p-0 text-destructive" variant="outline">
                      <span className="size-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-destructive" />
                    </Badge>
                  ) : null}
                  {filter.key === "bestseller" ? <Star className="size-4 fill-chart-1 text-chart-1" /> : null}
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{filteredProducts.length} products found</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
