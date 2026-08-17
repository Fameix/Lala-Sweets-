import { CheckoutContent } from "@/components/commerce/checkout-content"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { getProducts } from "@/lib/catalogue-server"

export default async function CheckoutPage() {
  const products = await getProducts()

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <h1 className="font-heading text-2xl font-medium sm:text-3xl">Checkout</h1>
        <div className="mt-5 sm:mt-6">
          <CheckoutContent products={products} />
        </div>
      </main>
    </StorefrontShell>
  )
}
