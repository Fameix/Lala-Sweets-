"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import { orderStatusLabels } from "@/lib/order-status-labels"
import type { SavedOrder } from "@/lib/order-types"
import { cn } from "@/lib/utils"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ mobile: string }> }) {
  const { mobile } = use(params)
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await adminFetch(`/api/admin/customers/${mobile}`, { cache: "no-store" })
        const payload = (await response.json()) as { orders?: SavedOrder[]; error?: string }

        if (!response.ok || !payload.orders) {
          throw new Error(payload.error ?? "No orders found for this customer.")
        }

        if (!cancelled) {
          setOrders(payload.orders)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "No orders found for this customer.")
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
  }, [mobile])

  const totalSpentPaise = orders.reduce(
    (total, order) => total + (order.totals.totalAmountPaise || order.totals.grandTotalPaise),
    0,
  )
  const customer = orders[0]?.customer

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Customers
      </Link>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-destructive">{error}</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl font-medium">{customer?.name}</h1>
              <p className="text-sm text-muted-foreground">{customer?.mobile}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{orders.length}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{formatPrice(totalSpentPaise)}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Order</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{orders[0] ? formatDate(orders[0].createdAt) : "—"}</CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-medium">
                          <Link href={`/admin/orders/${order.orderId}`} className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto p-0")}>
                            {order.orderId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{orderStatusLabels[order.orderStatus]}</Badge>
                        </TableCell>
                        <TableCell>{formatPrice(order.totals.grandTotalPaise)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}
