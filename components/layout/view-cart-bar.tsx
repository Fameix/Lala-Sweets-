"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight, ShoppingCart } from "lucide-react"

import { getCartItemCount, subscribeToCart } from "@/lib/cart-client"

export function ViewCartBar() {
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const sync = () => setItemCount(getCartItemCount())

    sync()
    return subscribeToCart(sync)
  }, [])

  if (itemCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[min(15rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl bg-primary p-1 shadow-2xl">
      <Link
        href="/cart"
        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground"
        aria-label={`View cart with ${itemCount} items`}
      >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary-foreground text-primary">
            <ShoppingCart className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-semibold leading-none">View Cart</span>
            <span className="mt-1 block text-xs font-medium">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
          </span>
        <ChevronRight className="size-5" />
      </Link>
    </div>
  )
}
