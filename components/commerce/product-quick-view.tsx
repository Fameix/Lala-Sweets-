"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { CheckCircle2, Gift, MessageSquareText, Minus, Plus, Sparkles, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCartItemOptions, getCartQuantity, setCartItemOptions, setCartQuantity, subscribeToCart } from "@/lib/cart-client"
import { formatProductPrice } from "@/lib/catalogue"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

const optionGroups = [
  {
    title: "Cake Message",
    description: "Choose up to 1 option",
    icon: MessageSquareText,
    options: ["Happy Birthday", "Happy Anniversary", "Congratulations", "Thank You"],
  },
  {
    title: "Celebration Kits",
    description: "Optional additions for reviewed cake orders",
    icon: Gift,
    options: ["Spark Candle", "Number Candles", "Birthday Cake Stick", "Anniversary Cake Stick", "Twisted Candles"],
  },
  {
    title: "Cake Toppings",
    description: "Toppings need bakery price approval",
    icon: Sparkles,
    options: ["Gems", "Chocolate Shavings", "Fruit Topping", "Sprinkles", "Choco Chips"],
  },
]

export function ProductQuickView({
  product,
  triggerClassName,
  triggerMode = "cart",
}: {
  product: Product
  triggerClassName?: string
  triggerMode?: "cart" | "details"
}) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const image = getProductImage(product)
  const imageBadge = image.sourceUrl.startsWith("/") ? "Client-provided image" : "Temporary Pexels photo"

  useEffect(() => {
    const sync = () => {
      setQuantity(getCartQuantity(product.id))
      setSelectedOptions(getCartItemOptions(product.id))
    }

    sync()
    return subscribeToCart(sync)
  }, [product.id])

  const updateQuantity = (nextQuantity: number) => {
    setQuantity(Math.max(0, nextQuantity))
    setCartQuantity(product.id, nextQuantity)
  }

  const addToCart = () => {
    updateQuantity(1)
  }

  const addFromPopup = () => {
    updateQuantity(Math.max(1, quantity))
    setCartItemOptions(product.id, selectedOptions)
    setOpen(false)
  }

  const toggleOption = (groupTitle: string, option: string) => {
    setSelectedOptions((currentOptions) => {
      const currentGroupOptions = currentOptions[groupTitle] ?? []
      const isSelected = currentGroupOptions.includes(option)
      const nextGroupOptions =
        groupTitle === "Cake Message"
          ? isSelected
            ? []
            : [option]
          : isSelected
            ? currentGroupOptions.filter((currentOption) => currentOption !== option)
            : [...currentGroupOptions, option]

      return {
        ...currentOptions,
        [groupTitle]: nextGroupOptions,
      }
    })
  }

  return (
    <>
      {triggerMode === "details" ? (
        <button
          type="button"
          className={cn("absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", triggerClassName)}
          onClick={() => setOpen(true)}
          aria-label={`View details for ${product.display_name}`}
        >
          <span className="sr-only">View details for {product.display_name}</span>
        </button>
      ) : quantity === 0 ? (
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline" }),
            triggerClassName,
            "bg-chart-1 text-foreground hover:bg-chart-1/80"
          )}
          onClick={addToCart}
          aria-label={`Add ${product.display_name}`}
        >
          Add+
        </button>
      ) : (
        <div
          className={cn(
            "inline-flex h-10 items-center justify-between rounded-full bg-chart-1 text-sm font-medium text-foreground",
            triggerClassName
          )}
          aria-label={`${product.display_name} quantity ${quantity}`}
        >
          <button
            type="button"
            className="inline-flex h-full w-11 items-center justify-center rounded-l-full transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={() => updateQuantity(quantity - 1)}
            aria-label={`Decrease ${product.display_name} quantity`}
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-8 text-center">{quantity}</span>
          <button
            type="button"
            className="inline-flex h-full w-11 items-center justify-center rounded-r-full transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={() => updateQuantity(quantity + 1)}
            aria-label={`Increase ${product.display_name} quantity`}
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[calc(100svh-2rem)] max-w-[min(55rem,calc(100%-1rem))] gap-0 overflow-hidden rounded-4xl p-0 sm:max-w-[55rem]"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{product.display_name}</DialogTitle>
            <DialogDescription>Product quick view</DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[calc(100svh-2rem)] min-h-[34rem] lg:grid-cols-[0.92fr_1fr]">
            <div className="flex min-h-0 flex-col border-border lg:border-r">
              <div className="relative aspect-[1.08/1] min-h-72 bg-muted lg:aspect-auto lg:h-[25.5rem]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 27rem, 100vw"
                  className={cn("object-cover", image.className)}
                  priority={open}
                />
                <div className="absolute left-4 top-4">
                  <Badge variant="secondary">{imageBadge}</Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col bg-popover">
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-[calc(var(--radius-sm)/2)] border border-primary text-primary">
                      <span className="size-2 rounded-full bg-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{product.normalized_category}</Badge>
                        {product.verification_status === "needs-review" ? (
                          <Badge variant="outline">Needs review</Badge>
                        ) : null}
                      </div>
                      <h2 className="line-clamp-2 font-heading text-xl font-medium leading-7">
                        {product.display_name}
                      </h2>
                      <p className="mt-1 text-lg font-semibold">{formatProductPrice(product)}</p>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <Star className="size-4 fill-primary text-primary" />
                        <span className="font-medium">Catalogue review</span>
                        <span className="text-muted-foreground">({product.price_status})</span>
                      </div>
                    </div>
                  </div>

                  <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {product.long_description}
                  </p>

                  <div className="grid gap-2 rounded-2xl bg-muted p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>{product.food_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>Availability: {product.availability_status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      <span>Options and toppings need admin approval.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-border bg-popover p-4 sm:p-5">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-[calc(var(--radius)+4px)] bg-primary text-primary-foreground">
                    <div className="min-w-0 px-4 py-3">
                      <p className="text-lg font-semibold leading-none">{formatProductPrice(product)}</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-full min-w-32 items-center justify-center px-4 py-3 text-sm font-semibold transition hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      onClick={addFromPopup}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-col bg-popover">
              <button
                type="button"
                aria-label="Close product quick view"
                className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl leading-none">x</span>
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 pr-3 sm:p-5 sm:pr-4">
                <div className="space-y-6 pr-1">
                  {optionGroups.map((group) => {
                    const Icon = group.icon

                    return (
                      <section key={group.title} className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-primary" />
                            <h3 className="font-heading text-lg font-medium">{group.title}</h3>
                            <Badge variant="outline">Optional</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                        </div>

                        <div className="grid gap-2">
                          {group.options.map((option) => {
                            const checked = selectedOptions[group.title]?.includes(option) ?? false

                            return (
                              <label
                                key={option}
                                className={cn(
                                  "grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border bg-background p-3 transition-colors",
                                  checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                                )}
                              >
                                <span className="flex size-4 items-center justify-center rounded-[calc(var(--radius-sm)/2)] border border-primary">
                                  <span className="size-2 rounded-full bg-primary" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium">{option}</span>
                                  <span className="block text-xs text-muted-foreground">Price pending</span>
                                </span>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  className="size-4 rounded border-border accent-primary"
                                  aria-label={`Select ${option}`}
                                  onChange={() => toggleOption(group.title, option)}
                                />
                              </label>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
