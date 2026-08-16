import { notFound } from "next/navigation"

import { ProductCard } from "@/components/commerce/product-card"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { getCategories, getProductsByCategory } from "@/lib/catalogue"

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }))
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const category = getCategories().find((item) => item.slug === slug)

  if (!category) {
    notFound()
  }

  const products = getProductsByCategory(slug)

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-heading text-3xl font-medium">{category.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{products.length} verified Lala Sweets menu products</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </StorefrontShell>
  )
}
