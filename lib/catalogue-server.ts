import "server-only"

import { getProductById as getProductByIdFromStore, listCategories, listProducts } from "@/lib/products-server"
import type { CategorySummary, Product } from "@/types/catalogue"

function categoryToSlug(category: string) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function getProducts(options: { includeInactive?: boolean } = {}) {
  return listProducts(options)
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts()
  return products.find((product) => product.slug === slug)
}

export async function getProductById(id: string) {
  return getProductByIdFromStore(id)
}

export async function getCategories(): Promise<CategorySummary[]> {
  return listCategories()
}

export async function getProductsByCategory(slug: string) {
  const products = await getProducts()
  return products.filter((product) => categoryToSlug(product.normalized_category) === slug)
}

export async function searchProducts(query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  const products = await getProducts()

  if (!normalizedQuery) {
    return products
  }

  return products.filter((product) =>
    [
      product.display_name,
      product.source_name,
      product.normalized_category,
      product.source_category,
      product.short_description,
      product.subcategory ?? "",
      product.flavour ?? "",
      ...(product.search_aliases ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  )
}

export async function getCakeProducts(): Promise<Product[]> {
  const products = await getProducts()
  return products.filter((product) => product.product_type === "cake")
}

export async function getCakeSubcategories() {
  const subcategories = new Map<string, number>()

  for (const product of await getCakeProducts()) {
    if (product.subcategory) {
      subcategories.set(product.subcategory, (subcategories.get(product.subcategory) ?? 0) + 1)
    }
  }

  return Array.from(subcategories.entries()).map(([name, productCount]) => ({
    slug: categoryToSlug(name),
    name,
    productCount,
  }))
}

export async function getCakeProductsBySubcategory(subcategorySlug: string) {
  const cakeProducts = await getCakeProducts()
  return cakeProducts.filter((product) => categoryToSlug(product.subcategory ?? "") === subcategorySlug)
}
