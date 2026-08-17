// Client-safe pure helpers only - no Firestore/Admin SDK access here, so
// this file can be imported from both Server and Client Components. Data
// fetching (getProducts, getProductBySlug, getCategories, search, etc.)
// lives in lib/catalogue-server.ts, which is server-only.
import type { Product } from "@/types/catalogue"

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

export function getMissingPriceProducts(products: Product[]) {
  return products.filter((product) => product.price_paise === null)
}

export function getNeedsReviewProducts(products: Product[]) {
  return products.filter((product) => product.verification_status === "needs-review")
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
