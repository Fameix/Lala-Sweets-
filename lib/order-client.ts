"use client"

import type { CartLineItem } from "@/lib/cart-client"
import type { DeliveryType } from "@/lib/delivery-config"
import { generateOrderId } from "@/lib/order-id"
import type { CheckoutCustomer, SavedOrder } from "@/lib/order-types"

export type { CheckoutCustomer, SavedOrder } from "@/lib/order-types"

const ordersStorageKey = "lala-sweets-orders"

type CreateOrderPayload = {
  orderId: string
  customer: CheckoutCustomer
  products: CartLineItem[]
  deliveryType: DeliveryType
  subtotalPaise: number
  deliveryChargePaise: number
  paymentMethod: "COD"
}

function readOrders(): SavedOrder[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(ordersStorageKey)
    return storedValue ? (JSON.parse(storedValue) as SavedOrder[]) : []
  } catch {
    return []
  }
}

function writeOrders(orders: SavedOrder[]) {
  window.localStorage.setItem(ordersStorageKey, JSON.stringify(orders))
}

function cacheOrder(order: SavedOrder) {
  writeOrders([order, ...readOrders().filter((existing) => existing.orderId !== order.orderId)])
}

async function createOrderOnServer(payload: CreateOrderPayload) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  const result = (await response.json()) as { order?: SavedOrder; error?: string }

  if (!response.ok || !result.order) {
    throw new Error(result.error ?? "Unable to save order.")
  }

  cacheOrder(result.order)
  return result.order
}

export function createCodOrder({
  orderId = generateOrderId(),
  customer,
  products,
  deliveryType,
  subtotalPaise,
  deliveryChargePaise,
}: {
  orderId?: string
  customer: CheckoutCustomer
  products: CartLineItem[]
  deliveryType: DeliveryType
  subtotalPaise: number
  deliveryChargePaise: number
}) {
  return createOrderOnServer({
    orderId,
    customer,
    products,
    deliveryType,
    subtotalPaise,
    deliveryChargePaise,
    paymentMethod: "COD",
  })
}

export function getOrder(orderId: string) {
  return readOrders().find((order) => order.orderId === orderId) ?? null
}

export function getOrders() {
  return readOrders()
}
