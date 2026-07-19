"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { isFavourite, subscribeToFavourites, toggleFavourite } from "@/lib/favourites-client"
import { cn } from "@/lib/utils"

export function FavouriteButton({ productId }: { productId: string }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const sync = () => setActive(isFavourite(productId))

    sync()
    return subscribeToFavourites(sync)
  }, [productId])

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "secondary", size: "icon" }))}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={active}
      onClick={() => setActive(toggleFavourite(productId))}
    >
      <Heart className={cn("size-4", active && "fill-primary text-primary")} />
    </button>
  )
}
