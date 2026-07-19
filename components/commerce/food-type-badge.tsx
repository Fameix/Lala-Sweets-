import { Badge } from "@/components/ui/badge"

export function FoodTypeBadge({ foodType }: { foodType: string }) {
  if (foodType === "unknown") {
    return <Badge variant="outline">Food type review</Badge>
  }

  if (foodType === "non-vegetarian") {
    return <Badge variant="destructive">Non-veg</Badge>
  }

  return <Badge variant="secondary">Veg</Badge>
}
