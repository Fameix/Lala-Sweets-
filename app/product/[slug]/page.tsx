import { notFound } from "next/navigation"

import { ProductDetails } from "@/components/commerce/product-details"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { getProductBySlug, getProducts } from "@/lib/catalogue"

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <StorefrontShell>
      <ProductDetails product={product} />
    </StorefrontShell>
  )
}
