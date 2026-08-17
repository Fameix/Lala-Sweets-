import { ProductForm } from "@/components/admin/products/product-form"

export default function AdminNewProductPage() {
  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium">New Product</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        New products require a name, category, and price before ordering can be enabled.
      </p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </main>
  )
}
