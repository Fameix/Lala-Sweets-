"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { WalletCards } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminFetch } from "@/lib/admin-fetch"
import type { SavedOrder } from "@/lib/order-types"

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

type PaymentFilter = "ALL" | "PAID" | "PENDING" | "COD" | "FAILED" | "REFUNDED"

const filters: { value: PaymentFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "COD", label: "COD" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
]

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<PaymentFilter>("ALL")

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await adminFetch("/api/admin/orders", { cache: "no-store" })
          const payload = (await response.json()) as { orders?: SavedOrder[] }
          setOrders(payload.orders ?? [])
        } catch {
          setOrders([])
        } finally {
          setLoading(false)
        }
      })()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    switch (filter) {
      case "PAID":
        return orders.filter((order) => order.paymentStatus === "PAID")
      case "PENDING":
        return orders.filter((order) => order.paymentStatus === "PENDING")
      case "COD":
        return orders.filter((order) => order.payment.method === "COD")
      // The current order model doesn't track FAILED/REFUNDED payment states
      // yet - these filters are here per spec but will always be empty until
      // that's added to the backend.
      case "FAILED":
      case "REFUNDED":
        return []
      default:
        return orders
    }
  }, [orders, filter])

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <WalletCards className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Payments</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Transaction records for every order. Payment secrets and signatures are never shown here.
      </p>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as PaymentFilter)} className="mt-6">
        <TabsList>
          {filters.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/orders/${order.orderId}`} className="hover:underline">
                          {order.orderId}
                        </Link>
                      </TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{formatPrice(order.totals.grandTotalPaise)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.payment.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.payment.status === "Paid" ? "default" : "secondary"}>
                          {order.payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {order.payment.razorpayPaymentId ? `${order.payment.razorpayPaymentId.slice(0, 14)}…` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      {filter === "FAILED" || filter === "REFUNDED"
                        ? "This status isn't tracked by the order model yet."
                        : "No transactions match this filter."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
