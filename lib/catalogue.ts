import menuData from "@/data/master-bakery-menu.json"
import cakeData from "@/data/master-bakery-cakes.json"
import type { CategorySummary, Product } from "@/types/catalogue"

type CakeSeed = {
  sourceName: string
  displayName: string
  slug: string
  productType: "cake"
  category: string
  subcategory: string
  flavour: string
  searchAliases: string[]
  supportsPhotoUpload: boolean
}

const timestamp = "2026-07-19T00:00:00+05:30"

const cakeProducts = (cakeData as CakeSeed[]).map((cake): Product => ({
  id: `cake-${cake.slug}`,
  source_name: cake.sourceName,
  display_name: cake.displayName,
  slug: cake.slug,
  source_category: cake.subcategory,
  normalized_category: cake.category,
  short_description: "Proposed cake catalogue item awaiting Master Bakery review.",
  long_description:
    "This proposed cake product is editable in admin. Price, weights, egg options, preparation time, image, branch availability, and ordering rules must be configured before customers can order it.",
  food_type: "unknown",
  egg_status: "unconfigured",
  allergen_information: [],
  price_paise: null,
  compare_at_price_paise: null,
  price_status: "awaiting-client-price",
  availability_status: "unconfirmed",
  verification_status: "proposed-cake-product",
  image_status: "missing",
  source_asset: "proposed-cake-catalogue",
  extraction_notes: "Proposed cake product requested for catalogue setup. No price, ingredient, eggless, or availability claims approved.",
  preparation_minutes: null,
  is_featured: false,
  is_active: true,
  is_orderable: false,
  product_type: "cake",
  subcategory: cake.subcategory,
  flavour: cake.flavour,
  supports_cake_message: true,
  cake_message_max_length: 40,
  supports_photo_upload: cake.supportsPhotoUpload,
  available_weights: [],
  cake_type_options: [],
  shape_options: [],
  occasion_tags: cake.searchAliases.filter((alias) => alias.includes("birthday") || alias.includes("anniversary") || alias.includes("wedding")),
  addons: [],
  same_day_available: false,
  minimum_lead_minutes: null,
  search_aliases: cake.searchAliases,
  created_at: timestamp,
  updated_at: timestamp,
}))

const products = [...(menuData.products as Product[]), ...cakeProducts]

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

export function getCakeProducts() {
  return getProducts().filter((product) => product.product_type === "cake")
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
  if (product.price_paise === null) {
    return "Price will be updated soon"
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price_paise / 100)
}
