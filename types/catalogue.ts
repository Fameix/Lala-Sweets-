export type VerificationStatus = "menu-image-confirmed" | "needs-review" | "proposed-cake-product"

export type PriceStatus = "awaiting-client-price" | "approved"

export type AvailabilityStatus = "unconfirmed" | "available" | "unavailable"

export type ImageStatus = "missing" | "temporary" | "client-provided" | "approved"

export type ProductSizeVariant = {
  label: "250g" | "500g" | "1kg"
  grams: number
  price_paise: number
  availability_status: AvailabilityStatus
  is_in_stock: boolean
}

export type Product = {
  id: string
  source_name: string
  display_name: string
  name?: string
  slug: string
  source_category: string
  normalized_category: string
  category?: string
  short_description: string
  long_description: string
  description?: string
  food_type: string
  egg_status: string
  allergen_information: string[]
  image?: string
  price?: number
  price_paise: number | null
  compare_at_price_paise: number | null
  size_variants?: ProductSizeVariant[]
  price_status: PriceStatus
  availability_status: AvailabilityStatus
  stock_status?: "in-stock" | "limited" | "out-of-stock"
  availableSizes?: string[]
  verification_status: VerificationStatus
  image_status: ImageStatus
  source_asset: string
  extraction_notes: string
  preparation_minutes: number | null
  is_featured: boolean
  is_active: boolean
  is_orderable: boolean
  product_type?: "menu-item" | "cake"
  subcategory?: string
  flavour?: string
  supports_cake_message?: boolean
  cake_message_max_length?: number
  supports_photo_upload?: boolean
  available_weights?: CakeWeightVariant[]
  cake_type_options?: CakeTypeOption[]
  shape_options?: string[]
  occasion_tags?: string[]
  addons?: CakeAddon[]
  same_day_available?: boolean
  minimum_lead_minutes?: number | null
  search_aliases?: string[]
  created_at: string
  updated_at: string
}

export type CakeWeightVariant = {
  label: string
  grams: number | null
  price_paise: number | null
  compare_at_price_paise: number | null
  availability_status: AvailabilityStatus
  preparation_minutes: number | null
  branch_availability: string[]
  is_orderable: boolean
}

export type CakeTypeOption = {
  label: "With Egg" | "Eggless"
  additional_price_paise: number | null
  is_available: boolean
}

export type CakeAddon = {
  name: string
  price_paise: number | null
  availability_status: AvailabilityStatus
  max_quantity: number
  is_active: boolean
}

export type CategorySummary = {
  slug: string
  name: string
  productCount: number
}
