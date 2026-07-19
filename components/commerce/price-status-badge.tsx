import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/catalogue"

export function PriceStatusBadge({ product }: { product: Product }) {
  if (product.price_paise === null) {
    return <Badge variant="outline">Price pending</Badge>
  }

  return <Badge variant="secondary">Price approved</Badge>
}
