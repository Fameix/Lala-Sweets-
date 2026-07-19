"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCartItems, setCartQuantity, subscribeToCart, type CartLineItem } from "@/lib/cart-client"
import { formatProductPrice } from "@/lib/catalogue"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

export function CartContent({ products }: { products: Product[] }) {
  const [cartItems, setCartItems] = useState<CartLineItem[]>([])
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  useEffect(() => {
    const sync = () => setCartItems(getCartItems())

    sync()
    return subscribeToCart(sync)
  }, [])

  const visibleCartItems = cartItems
    .map((item) => ({
      item,
      product: productMap.get(item.productId),
    }))
    .filter((entry): entry is { item: CartLineItem; product: Product } => Boolean(entry.product))

  if (visibleCartItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <ShoppingBag className="size-10 text-muted-foreground" />
          <div>
            <h2 className="font-heading text-xl font-medium">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add menu items to see them here.</p>
          </div>
          <Link href="/menu" className={cn(buttonVariants())}>
            Browse Menu
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {visibleCartItems.map(({ item, product }) => {
        const image = getProductImage(product)
        const optionGroups = Object.entries(item.selectedOptions).filter(([, options]) => options.length > 0)

        return (
          <Card key={item.productId}>
            <CardHeader className="grid grid-cols-[5rem_1fr] gap-4">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={image.src} alt={image.alt} fill sizes="5rem" className={cn("object-cover", image.className)} />
              </div>
              <div>
                <Badge variant="outline">{product.normalized_category}</Badge>
                <CardTitle className="mt-2">{product.display_name}</CardTitle>
                <p className="mt-2 text-sm font-medium">{formatProductPrice(product)}</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {optionGroups.length > 0 ? (
                <div className="grid gap-2 rounded-2xl bg-muted p-3 text-sm">
                  {optionGroups.map(([groupTitle, options]) => (
                    <div key={groupTitle}>
                      <span className="font-medium">{groupTitle}: </span>
                      <span className="text-muted-foreground">{options.join(", ")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-muted p-3 text-sm text-muted-foreground">No options selected.</p>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <div className="inline-flex h-10 min-w-36 items-center justify-between rounded-full bg-chart-1 text-sm font-medium text-foreground">
                  <button
                    type="button"
                    className="inline-flex h-full w-11 items-center justify-center rounded-l-full transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={() => setCartQuantity(item.productId, item.quantity - 1)}
                    aria-label={`Decrease ${product.display_name} quantity`}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="inline-flex h-full w-11 items-center justify-center rounded-r-full transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={() => setCartQuantity(item.productId, item.quantity + 1)}
                    aria-label={`Increase ${product.display_name} quantity`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
