"use client"

const cartStorageKey = "lala-sweets-cart-quantities"
const cartChangedEvent = "lala-sweets-cart-changed"

type CartQuantities = Record<string, number>
export type CartOptionSelections = Record<string, string[]>
export type CartLineItem = {
  id: string
  productId: string
  productName?: string
  productSlug?: string
  image?: string
  size: string
  unitPricePaise: number
  quantity: number
  selectedOptions: CartOptionSelections
}

type CartOptionStorage = Record<string, CartOptionSelections>

const cartOptionsStorageKey = "lala-sweets-cart-options"

function readCartQuantities(): CartQuantities {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(cartStorageKey)
    return storedValue ? (JSON.parse(storedValue) as CartQuantities) : {}
  } catch {
    return {}
  }
}

function writeCartQuantities(quantities: CartQuantities) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(quantities))
  window.dispatchEvent(new Event(cartChangedEvent))
}

function readCartOptions(): CartOptionStorage {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(cartOptionsStorageKey)
    return storedValue ? (JSON.parse(storedValue) as CartOptionStorage) : {}
  } catch {
    return {}
  }
}

function writeCartOptions(options: CartOptionStorage) {
  window.localStorage.setItem(cartOptionsStorageKey, JSON.stringify(options))
  window.dispatchEvent(new Event(cartChangedEvent))
}

export function getCartQuantity(productId: string) {
  return readCartQuantities()[productId] ?? 0
}

export function setCartQuantity(productId: string, quantity: number) {
  const quantities = readCartQuantities()
  const nextQuantity = Math.max(0, quantity)

  if (nextQuantity === 0) {
    delete quantities[productId]
  } else {
    quantities[productId] = nextQuantity
  }

  writeCartQuantities(quantities)
}

export function setCartItemOptions(productId: string, selectedOptions: CartOptionSelections) {
  const options = readCartOptions()

  options[productId] = selectedOptions
  writeCartOptions(options)
}

function createCartLineId(productId: string, size: string) {
  return `${productId}::${size}`
}

export function addCartItem({
  productId,
  productName,
  productSlug,
  image,
  size,
  unitPricePaise,
  quantity,
}: {
  productId: string
  productName: string
  productSlug: string
  image?: string
  size: string
  unitPricePaise: number
  quantity: number
}) {
  const lineId = createCartLineId(productId, size)
  const quantities = readCartQuantities()
  const options = readCartOptions()

  quantities[lineId] = (quantities[lineId] ?? 0) + Math.max(1, quantity)
  options[lineId] = {
    Size: [size],
    Product: [productName],
    Slug: [productSlug],
    Image: image ? [image] : [],
    "Unit price": [String(unitPricePaise)],
  }

  writeCartQuantities(quantities)
  writeCartOptions(options)
}

export function setCartLineQuantity(lineId: string, quantity: number) {
  setCartQuantity(lineId, quantity)
}

export function removeCartItem(lineId: string) {
  setCartQuantity(lineId, 0)
}

export function getCartItemOptions(productId: string) {
  return readCartOptions()[productId] ?? {}
}

export function getCartItems(): CartLineItem[] {
  const quantities = readCartQuantities()
  const options = readCartOptions()

  return Object.entries(quantities).map(([lineId, quantity]) => {
    const selectedOptions = options[lineId] ?? {}
    const [productId, sizeFromLineId] = lineId.split("::")
    const size = selectedOptions.Size?.[0] ?? sizeFromLineId ?? "250g"

    return {
      id: lineId,
      productId,
      productName: selectedOptions.Product?.[0],
      productSlug: selectedOptions.Slug?.[0],
      image: selectedOptions.Image?.[0],
      size,
      unitPricePaise: Number(selectedOptions["Unit price"]?.[0] ?? 0),
      quantity,
      selectedOptions,
    }
  })
}

export function getCartItemCount() {
  return Object.values(readCartQuantities()).reduce((total, quantity) => total + quantity, 0)
}

export function clearCart() {
  writeCartQuantities({})
  writeCartOptions({})
}

export function subscribeToCart(callback: () => void) {
  window.addEventListener(cartChangedEvent, callback)
  window.addEventListener("storage", callback)

  return () => {
    window.removeEventListener(cartChangedEvent, callback)
    window.removeEventListener("storage", callback)
  }
}
