"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingCart } from "lucide-react"

import { getCartItemCount, subscribeToCart } from "@/lib/cart-client"
import { cn } from "@/lib/utils"

export function HeaderCartLink({ transparentHeader = false }: { transparentHeader?: boolean }) {
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const sync = () => setItemCount(getCartItemCount())

    sync()
    return subscribeToCart(sync)
  }, [])

  return (
    <Link
      href="/cart"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        transparentHeader && "text-[#3a170a] hover:bg-[#5f2b12]/10"
      )}
      aria-label={`Cart with ${itemCount} items`}
    >
      <span className="relative inline-flex size-5 items-center justify-center">
        <ShoppingCart className="size-5" />
        {itemCount > 0 ? (
          <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
            {itemCount}
          </span>
        ) : null}
      </span>
    </Link>
  )
}
