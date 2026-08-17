import "server-only"

import { listOrders, normalizeMobileForComparison } from "@/lib/orders-server"
import type { SavedOrder } from "@/lib/order-types"

export type CustomerSummary = {
  mobile: string
  name: string
  email: string
  totalOrders: number
  totalSpentPaise: number
  lastOrderAt: string
  status: "Active" | "Inactive"
}

const activeWindowMs = 30 * 24 * 60 * 60 * 1000

function summarize(orders: SavedOrder[]): CustomerSummary {
  const sorted = [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const latest = sorted[0]
  const totalSpentPaise = orders.reduce(
    (total, order) => total + (order.totals.totalAmountPaise || order.totals.grandTotalPaise),
    0,
  )

  return {
    mobile: normalizeMobileForComparison(latest.customer.mobile) || latest.customer.mobile,
    name: latest.customer.name,
    email: latest.customer.email,
    totalOrders: orders.length,
    totalSpentPaise,
    lastOrderAt: latest.createdAt,
    status: Date.now() - new Date(latest.createdAt).getTime() <= activeWindowMs ? "Active" : "Inactive",
  }
}

// Aggregates the "customers" view from real order history (grouped by
// normalized phone number) rather than the sparse `customers` Firestore
// collection, which most guest-checkout orders never write to.
export async function listCustomerSummaries(): Promise<CustomerSummary[]> {
  const orders = await listOrders({ limit: 500 })
  const byMobile = new Map<string, SavedOrder[]>()

  for (const order of orders) {
    const key = normalizeMobileForComparison(order.customer.mobile) || order.customer.mobile
    const existing = byMobile.get(key) ?? []
    existing.push(order)
    byMobile.set(key, existing)
  }

  return Array.from(byMobile.values())
    .map(summarize)
    .sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? 1 : -1))
}

export async function getCustomerOrderHistory(mobile: string) {
  const normalized = normalizeMobileForComparison(mobile)
  const orders = await listOrders({ limit: 500 })
  return orders.filter((order) => normalizeMobileForComparison(order.customer.mobile) === normalized)
}
