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
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid gap-4">
      {visibleCartItems.map(({ item, product }) => {
        const image = getProductImage(product)
        const variantPrice =
          item.unitPricePaise ||
          product.size_variants?.find((variant) => variant.label === item.size)?.price_paise ||
          product.price_paise ||
          0

        return (
          <Card key={item.id}>
            <CardHeader className="grid grid-cols-[5rem_1fr] gap-4">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={image.src} alt={image.alt} fill sizes="5rem" className={cn("object-cover", image.className)} />
              </div>
              <div>
                <Badge variant="outline">{product.normalized_category}</Badge>
                <CardTitle className="mt-2">{product.display_name}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">Selected size: {item.size}</p>
                <p className="mt-2 text-sm font-medium">{formatPrice(variantPrice)}</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Item price</span>
                  <p className="font-medium">{formatPrice(variantPrice * item.quantity)}</p>
                </div>
                <QuantitySelector
                  quantity={item.quantity}
                  label={product.display_name}
                  onDecrease={() => setCartLineQuantity(item.id, item.quantity - 1)}
                  onIncrease={() => setCartLineQuantity(item.id, item.quantity + 1)}
                />
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
                  onClick={() => removeCartItem(item.id)}
                >
                  <Trash2 className="size-4" />
                  Remove item
                </button>
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>
      <Card className="h-fit">
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
          <div className="flex justify-between gap-4 text-base">
            <span className="font-medium">Total</span>
            <span className="font-semibold">{formatPrice(totalPaise)}</span>
          </div>
          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full")}>
            Proceed to Checkout
          </Link>
        </CardContent>
      </Card>
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
