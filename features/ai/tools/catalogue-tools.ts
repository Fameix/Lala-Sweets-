import { searchProducts as searchCatalogueProducts, getProductBySlug } from "@/lib/catalogue"

export function searchProductsTool(query: string) {
  return searchCatalogueProducts(query).filter((product) => product.is_active).slice(0, 6)
}

export function getProductDetailsTool(slug: string) {
  return getProductBySlug(slug) ?? null
}

export function findCartIntent(message: string) {
  const normalized = message.toLowerCase()
  const quantity = normalized.includes("two") || normalized.includes("rendu") ? 2 : 1
  const product = searchProductsTool(normalized).find((item) => normalized.includes(item.display_name.toLowerCase().split(" ")[0]))

  if (!product || !/(add|cart|சேர்|add pannunga)/i.test(message)) {
    return null
  }

  return {
    action: "add-to-cart" as const,
    productId: product.id,
    quantity,
    label: `Add ${quantity} ${product.display_name} to cart`,
  }
}

