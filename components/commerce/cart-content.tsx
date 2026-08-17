"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ShoppingBag, Trash2 } from "lucide-react"

import { QuantitySelector } from "@/components/commerce/quantity-selector"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getCartItems,
  removeCartItem,
  setCartLineQuantity,
  subscribeToCart,
  type CartLineItem,
} from "@/lib/cart-client"
import { deliveryConfig } from "@/lib/delivery-config"
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
  const subtotalPaise = visibleCartItems.reduce((total, { item, product }) => {
    const variantPrice =
      item.unitPricePaise ||
      product.size_variants?.find((variant) => variant.label === item.size)?.price_paise ||
      product.price_paise ||
      0

    return total + variantPrice * item.quantity
  }, 0)
  const deliveryChargePaise = deliveryConfig.chargesPaise.LOCAL
  const totalPaise = subtotalPaise + deliveryChargePaise

  if (visibleCartItems.length === 0) {
    return (
      <Card className="border-primary/10">
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
    <div className="pb-28 lg:pb-0">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-3">
          {visibleCartItems.map(({ item, product }) => {
            const image = getProductImage(product)
            const variantPrice =
              item.unitPricePaise ||
              product.size_variants?.find((variant) => variant.label === item.size)?.price_paise ||
              product.price_paise ||
              0

            return (
              <Card key={item.id} className="border-primary/10">
                <CardContent className="flex items-center gap-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image src={image.src} alt={image.alt} fill sizes="5rem" className={cn("object-cover", image.className)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="text-[10px]">
                      {product.normalized_category}
                    </Badge>
                    <p className="mt-1 truncate font-heading text-base font-medium">{product.display_name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.size}</p>
                    <p className="mt-1 font-heading text-base font-semibold text-primary">
                      {formatPrice(variantPrice * item.quantity)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <QuantitySelector
                      quantity={item.quantity}
                      label={product.display_name}
                      onDecrease={() => setCartLineQuantity(item.id, item.quantity - 1)}
                      onIncrease={() => setCartLineQuantity(item.id, item.quantity + 1)}
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${product.display_name} from cart`}
                      className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
                      onClick={() => removeCartItem(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <Card className="h-fit border-primary/10">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotalPaise)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Delivery charge</span>
              <span className="font-medium">{formatPrice(deliveryChargePaise)}</span>
            </div>
            <Separator />
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-heading text-base font-medium">Total</span>
              <span className="font-heading text-2xl font-semibold text-primary">{formatPrice(totalPaise)}</span>
            </div>
            <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-1 hidden w-full lg:inline-flex")}>
              Proceed to Checkout
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-card/97 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-heading text-lg font-semibold text-primary">{formatPrice(totalPaise)}</p>
          </div>
          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6")}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}
