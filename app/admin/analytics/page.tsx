"use client"

import { useEffect, useState } from "react"
import { BarChart3 } from "lucide-react"

import { AnalyticsCharts } from "@/components/admin/analytics/analytics-charts"
import { adminFetch } from "@/lib/admin-fetch"
import type { CustomerSummary } from "@/lib/customers-server"
import type { SavedOrder } from "@/lib/order-types"

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [ordersRes, customersRes] = await Promise.all([
          adminFetch("/api/admin/orders", { cache: "no-store" }),
          adminFetch("/api/admin/customers", { cache: "no-store" }),
        ])
        const ordersPayload = (await ordersRes.json()) as { orders?: SavedOrder[] }
        const customersPayload = (await customersRes.json()) as { customers?: CustomerSummary[] }

        if (!cancelled) {
          setOrders(ordersPayload.orders ?? [])
          setCustomers(customersPayload.customers ?? [])
        }
      } catch {
        if (!cancelled) {
          setOrders([])
          setCustomers([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <main className="w-full px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">Loading analytics...</main>
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Analytics</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Computed from the most recent {orders.length} orders. Not a full historical archive.
      </p>

      <div className="mt-6">
        <AnalyticsCharts orders={orders} customers={customers} />
      </div>
    </main>
  )
}
