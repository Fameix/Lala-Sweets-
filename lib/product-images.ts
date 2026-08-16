import type { Product } from "@/types/catalogue"

type ProductImage = {
  src: string
  alt: string
  status: "approved" | "temporary" | "missing"
  credit: string
  sourceUrl: string
  className?: string
}

export function getProductImage(product: Product): ProductImage {
  const src = product.image ?? "/images/tirunelveli-ghee-halwa.png"

  return {
    src,
    alt: product.display_name,
    status: "approved",
    credit: "Lala Sweets product photography",
    sourceUrl: src,
    className: "object-center",
  }
}
