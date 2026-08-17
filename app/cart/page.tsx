import { CartContent } from "@/components/commerce/cart-content"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { getProducts } from "@/lib/catalogue-server"

export default async function CartPage() {
  const products = await getProducts()

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-heading text-3xl font-medium">Cart</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review selected products, quantities, and delivery estimate before checkout.
        </p>
        <div className="mt-6">
          <CartContent products={products} />
        </div>
      </main>
    </StorefrontShell>
  )
}
