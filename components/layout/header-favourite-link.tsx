"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Heart } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { getFavouriteIds, subscribeToFavourites } from "@/lib/favourites-client"
import { cn } from "@/lib/utils"

export function HeaderFavouriteLink() {
  const [favouriteCount, setFavouriteCount] = useState(0)

  useEffect(() => {
    const sync = () => setFavouriteCount(getFavouriteIds().length)

    sync()
    return subscribeToFavourites(sync)
  }, [])

  return (
    <Link
      href="/account/favourites"
      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "relative hidden sm:inline-flex")}
      aria-label={`Wishlist with ${favouriteCount} items`}
    >
      <Heart className={cn("size-4", favouriteCount > 0 && "fill-primary text-primary")} />
      {favouriteCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
          {favouriteCount}
        </span>
      ) : null}
    </Link>
  )
}
