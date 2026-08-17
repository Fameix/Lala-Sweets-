import type { Product, ProductSizeVariant } from "@/types/catalogue"

// Neutral fallback for any product without its own photo yet. Do NOT point
// this at a specific product's real photo (e.g. the ghee halwa image) - that
// previously caused every unlabeled product (like Karasev) to silently show
// the ghee halwa photo instead of a placeholder.
const sharedImage = "/images/lala-sweets-product-placeholder.svg"

function makeSizeVariants(basePriceRupees: number): ProductSizeVariant[] {
  return [
    { label: "250g", grams: 250, price_paise: basePriceRupees * 100, availability_status: "available", is_in_stock: true },
    { label: "500g", grams: 500, price_paise: basePriceRupees * 200, availability_status: "available", is_in_stock: true },
    { label: "1kg", grams: 1000, price_paise: basePriceRupees * 400, availability_status: "available", is_in_stock: true },
  ]
}

type Seed = Omit<
  Product,
  | "name"
  | "category"
  | "description"
  | "image"
  | "price"
  | "price_paise"
  | "compare_at_price_paise"
  | "size_variants"
  | "price_status"
  | "availability_status"
  | "stock_status"
  | "availableSizes"
  | "image_status"
  | "source_asset"
  | "extraction_notes"
  | "preparation_minutes"
  | "is_featured"
  | "is_active"
  | "is_orderable"
  | "created_at"
  | "updated_at"
> & {
  priceRupees: number
  image?: string
  sizeLabels?: ProductSizeVariant["label"][]
  stockStatus?: "in-stock" | "limited" | "out-of-stock"
  isFeatured?: boolean
}

function createProduct(seed: Seed): Product {
  const sizeVariants = makeSizeVariants(seed.priceRupees).filter((variant) => (seed.sizeLabels ?? ["250g", "500g", "1kg"]).includes(variant.label))
  const stockStatus = seed.stockStatus ?? "in-stock"
  const image = seed.image ?? sharedImage

  return {
    ...seed,
    name: seed.display_name,
    category: seed.normalized_category,
    description: seed.long_description,
    image,
    price: seed.priceRupees,
    price_paise: sizeVariants[0]?.price_paise ?? seed.priceRupees * 100,
    compare_at_price_paise: null,
    size_variants: sizeVariants.map((variant) => ({
      ...variant,
      availability_status: stockStatus === "out-of-stock" ? "unavailable" : variant.availability_status,
      is_in_stock: stockStatus !== "out-of-stock",
    })),
    price_status: "approved",
    availability_status: stockStatus === "out-of-stock" ? "unavailable" : "available",
    stock_status: stockStatus,
    availableSizes: sizeVariants.map((variant) => variant.label),
    image_status: "approved",
    source_asset: "lala sweets project assets",
    extraction_notes: "Central product data source.",
    preparation_minutes: null,
    is_active: true,
    is_orderable: false,
    created_at: "2026-08-11T00:00:00+05:30",
    updated_at: "2026-08-12T00:00:00+05:30",
    is_featured: seed.isFeatured ?? false,
  }
}

export const catalogueProducts: Product[] = [
  createProduct({
    id: "sweet-tirunelveli-ghee-halwa",
    source_name: "Tirunelveli Ghee Halwa",
    display_name: "Tirunelveli Ghee Halwa",
    slug: "tirunelveli-ghee-halwa",
    image: "/images/tirunelveli-ghee-halwa.png",
    source_category: "Sweets",
    normalized_category: "Sweets",
    short_description: "Signature Nellai ghee halwa made with wheat, sugar and ghee.",
    long_description: "The signature wheat halwa of Sri Lakshmivilas Purathana Lala Sweets. The public menu lists it as a vegan sweet at the current store price.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: ["wheat", "ghee"],
    priceRupees: 260,
    isFeatured: true,
    verification_status: "menu-image-confirmed",
    search_aliases: ["nellai halwa", "tirunelveli halwa", "ghee halwa", "wheat halwa"],
  }),
  createProduct({
    id: "sweet-laddu",
    source_name: "Laddu",
    display_name: "Laddu",
    slug: "laddu",
    image: "/images/products/Laddu.png",
    source_category: "Sweets",
    normalized_category: "Sweets",
    short_description: "Traditional Indian sweet for celebrations and gifting.",
    long_description: "A traditional sweet listed on the public Lala Sweets menu. Current public menu pricing has been carried into the central product data.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: [],
    priceRupees: 260,
    verification_status: "menu-image-confirmed",
    search_aliases: ["ladoo", "traditional sweets"],
  }),
  createProduct({
    id: "sweet-jangerry",
    source_name: "Jangerry",
    display_name: "Jangerry",
    slug: "jangerry",
    image: "/images/products/Jangerry.png",
    source_category: "Sweets",
    normalized_category: "Sweets",
    short_description: "Classic South Indian sweet with a festive finish.",
    long_description: "A traditional sweet listed on the public Lala Sweets menu. Current public menu pricing has been carried into the central product data.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: [],
    priceRupees: 260,
    verification_status: "menu-image-confirmed",
    search_aliases: ["jangri", "imarti", "traditional sweets"],
  }),
  createProduct({
    id: "sweet-mysorepaak",
    source_name: "Mysorepaak",
    display_name: "Mysorepaak",
    slug: "mysorepaak",
    image: "/images/products/Mysorepaak.png",
    source_category: "Sweets",
    normalized_category: "Sweets",
    short_description: "Rich traditional sweet prepared for gifting and everyday indulgence.",
    long_description: "A traditional sweet listed on the public Lala Sweets menu. Current public menu pricing has been carried into the central product data.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: [],
    priceRupees: 260,
    verification_status: "menu-image-confirmed",
    search_aliases: ["mysore pak", "traditional sweets"],
  }),
  createProduct({
    id: "sweet-badhusha",
    source_name: "Badhusha",
    display_name: "Badhusha",
    slug: "badhusha",
    image: "/images/products/Badhusha.png",
    source_category: "Sweets",
    normalized_category: "Sweets",
    short_description: "Traditional layered sweet with a celebratory character.",
    long_description: "A traditional sweet listed on the public Lala Sweets menu. Current public menu pricing has been carried into the central product data.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: ["wheat"],
    priceRupees: 260,
    verification_status: "menu-image-confirmed",
    search_aliases: ["balushahi", "traditional sweets"],
  }),
  createProduct({
    id: "savoury-mixture",
    source_name: "Mixture",
    display_name: "Mixture",
    slug: "mixture",
    image: "/images/products/Mixture.png",
    source_category: "Savouries",
    normalized_category: "Savouries",
    short_description: "Traditional savoury snack for everyday sharing.",
    long_description: "A savoury item listed on the public Lala Sweets menu. Current public menu pricing has been carried into the central product data.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: [],
    priceRupees: 260,
    verification_status: "menu-image-confirmed",
    search_aliases: ["savoury", "namkeen"],
  }),
  createProduct({
    id: "savoury-special-mixture",
    source_name: "Special Mixture",
    display_name: "Special Mixture",
    slug: "special-mixture",
    image: "/images/products/Special-Mixture.png",
    source_category: "Savouries",
    normalized_category: "Savouries",
    short_description: "A special savoury mix from the Lala Sweets menu.",
    long_description: "A savoury item listed on the public Lala Sweets menu. Current public menu pricing has been carried into the central product data.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: [],
    priceRupees: 280,
    verification_status: "menu-image-confirmed",
    search_aliases: ["savoury", "namkeen"],
  }),
  createProduct({
    id: "savoury-karasev",
    source_name: "Karasev",
    display_name: "Karasev",
    slug: "karasev",
    source_category: "Savouries",
    normalized_category: "Savouries",
    image: "/images/products/Karasev.png",
    short_description: "Traditional crisp savoury with a South Indian profile.",
    long_description: "A savoury item listed on the public Lala Sweets menu. Current public menu pricing has been carried into the central product data.",
    food_type: "vegetarian",
    egg_status: "eggless",
    allergen_information: [],
    priceRupees: 260,
    verification_status: "menu-image-confirmed",
    search_aliases: ["kara sev", "savoury", "namkeen"],
  }),
]
