"use client"

const cartStorageKey = "master-bakery-cart-quantities"
const cartChangedEvent = "master-bakery-cart-changed"

type CartQuantities = Record<string, number>
export type CartOptionSelections = Record<string, string[]>
export type CartLineItem = {
  productId: string
  quantity: number
  selectedOptions: CartOptionSelections
}

type CartOptionStorage = Record<string, CartOptionSelections>

const cartOptionsStorageKey = "master-bakery-cart-options"

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

export function getCartItemOptions(productId: string) {
  return readCartOptions()[productId] ?? {}
}

export function getCartItems(): CartLineItem[] {
  const quantities = readCartQuantities()
  const options = readCartOptions()

  return Object.entries(quantities).map(([productId, quantity]) => ({
    productId,
    quantity,
    selectedOptions: options[productId] ?? {},
  }))
}

export function getCartItemCount() {
  return Object.values(readCartQuantities()).reduce((total, quantity) => total + quantity, 0)
}

export function subscribeToCart(callback: () => void) {
  window.addEventListener(cartChangedEvent, callback)
  window.addEventListener("storage", callback)

  return () => {
    window.removeEventListener(cartChangedEvent, callback)
    window.removeEventListener("storage", callback)
  }
}
