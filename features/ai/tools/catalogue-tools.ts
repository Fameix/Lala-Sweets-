import { searchProducts as searchCatalogueProducts, getProductBySlug } from "@/lib/catalogue-server"

export async function searchProductsTool(query: string) {
  const products = await searchCatalogueProducts(query)
  return products.filter((product) => product.is_active).slice(0, 6)
}

export async function getProductDetailsTool(slug: string) {
  return (await getProductBySlug(slug)) ?? null
}

export async function findCartIntent(message: string) {
  const normalized = message.toLowerCase()
  const quantity = normalized.includes("two") || normalized.includes("rendu") ? 2 : 1
  const matches = await searchProductsTool(normalized)
  const product = matches.find((item) => normalized.includes(item.display_name.toLowerCase().split(" ")[0]))

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
