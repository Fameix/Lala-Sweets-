import { EmptyState } from "@/components/commerce/empty-state"
import { ProductCard } from "@/components/commerce/product-card"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { Input } from "@/components/ui/input"
import { searchProducts } from "@/lib/catalogue"

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  return (
    <StorefrontShell>
      <SearchContent searchParams={searchParams} />
    </StorefrontShell>
  )
}

async function SearchContent({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const query = params.q ?? ""
  const products = searchProducts(query)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl font-medium">Search</h1>
      <form className="mt-5 max-w-xl">
        <label className="text-sm font-medium" htmlFor="q">
          Search products
        </label>
        <Input id="q" name="q" className="mt-2" defaultValue={query} placeholder="Try milkshake, fries, coffee" />
      </form>
      <div className="mt-8">
        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState title="No products found" description="Try another menu term or browse all categories." />
        )}
      </div>
    </main>
  )
}
