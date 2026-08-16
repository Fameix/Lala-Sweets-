import { catalogueProducts } from "@/data/catalogue-products"
import type { CategorySummary, Product } from "@/types/catalogue"

const products = catalogueProducts

function categoryToSlug(category: string) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getProducts() {
  return products.filter((product) => product.is_active)
}

export function getProductBySlug(slug: string) {
  return getProducts().find((product) => product.slug === slug)
}

export function getCategories(): CategorySummary[] {
  const categories = new Map<string, CategorySummary>()

  for (const product of getProducts()) {
    const slug = categoryToSlug(product.normalized_category)
    const current = categories.get(slug)

    categories.set(slug, {
      slug,
      name: product.normalized_category,
      productCount: (current?.productCount ?? 0) + 1,
    })
  }

  return Array.from(categories.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function getProductsByCategory(slug: string) {
  return getProducts().filter((product) => categoryToSlug(product.normalized_category) === slug)
}

export function searchProducts(query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return getProducts()
  }

  return getProducts().filter((product) =>
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

export function getCakeProducts(): Product[] {
  return []
}

export function getCakeSubcategories() {
  const subcategories = new Map<string, number>()

  for (const product of getCakeProducts()) {
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

export function getCakeProductsBySubcategory(subcategorySlug: string) {
  return getCakeProducts().filter((product) => categoryToSlug(product.subcategory ?? "") === subcategorySlug)
}

export function isCakeReadyToPublish(product: Product) {
  if (product.product_type !== "cake") {
    return false
  }

  return Boolean(
    product.display_name &&
      product.normalized_category &&
      product.image_status === "approved" &&
      (product.available_weights ?? []).some((variant) => variant.price_paise !== null && variant.is_orderable) &&
      (product.cake_type_options ?? []).some((option) => option.is_available) &&
      product.preparation_minutes !== null &&
      product.availability_status === "available" &&
      product.is_active
  )
}

export function calculateCakeItemPrice({
  variantPricePaise,
  cakeTypeAdditionalPricePaise = 0,
  addons = [],
  quantity = 1,
}: {
  variantPricePaise: number | null
  cakeTypeAdditionalPricePaise?: number | null
  addons?: { pricePaise: number | null; quantity: number }[]
  quantity?: number
}) {
  if (variantPricePaise === null) {
    return null
  }

  const addonTotal = addons.reduce((total, addon) => total + (addon.pricePaise ?? 0) * addon.quantity, 0)
  return (variantPricePaise + (cakeTypeAdditionalPricePaise ?? 0) + addonTotal) * quantity
}

export function validateCakeMessage(message: string, maxLength: number) {
  return message.length <= maxLength
}

export function getMissingPriceProducts() {
  return getProducts().filter((product) => product.price_paise === null)
}

export function getNeedsReviewProducts() {
  return getProducts().filter((product) => product.verification_status === "needs-review")
}

export function formatProductPrice(product: Product) {
  const pricePaise = product.price_paise ?? (product.price !== undefined ? product.price * 100 : null)

  if (pricePaise === null) {
    return "Price unavailable"
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(pricePaise / 100)
}
