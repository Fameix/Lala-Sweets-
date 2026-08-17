"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Radio,
  ShoppingBag,
  TrendingUp,
} from "lucide-react"

import { AnalyticsCharts } from "@/components/admin/analytics/analytics-charts"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import { useOrderAlerts } from "@/components/admin/order-alerts/order-alerts-context"
import type { CustomerSummary } from "@/lib/customers-server"
import { orderStatusLabels } from "@/lib/order-status-labels"
import type { SavedOrder } from "@/lib/order-types"
import type { Product } from "@/types/catalogue"
import { cn } from "@/lib/utils"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date))
}

function isToday(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function getOrderValue(order: SavedOrder) {
  return order.totals.totalAmountPaise || order.totals.grandTotalPaise
}

export default function AdminPage() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const { recentOrders: recentNotifications } = useOrderAlerts()

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const [ordersResponse, productsResponse, customersResponse] = await Promise.all([
          adminFetch("/api/admin/orders", { cache: "no-store" }),
          adminFetch("/api/admin/products", { cache: "no-store" }),
          adminFetch("/api/admin/customers", { cache: "no-store" }),
        ])
        const ordersPayload = (await ordersResponse.json()) as { orders?: SavedOrder[] }
        const productsPayload = (await productsResponse.json()) as { products?: Product[] }
        const customersPayload = (await customersResponse.json()) as { customers?: CustomerSummary[] }

        if (!cancelled) {
          setOrders(ordersPayload.orders ?? [])
          setProducts(productsPayload.products ?? [])
          setCustomers(customersPayload.customers ?? [])
        }
      } catch {
        if (!cancelled) {
          setOrders([])
          setProducts([])
          setCustomers([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const todayOrders = orders.filter((order) => isToday(order.createdAt))
    const todayRevenue = todayOrders
      .filter((order) => order.paymentStatus === "PAID" || order.payment.method === "COD")
      .reduce((total, order) => total + getOrderValue(order), 0)
    const pendingOrders = orders.filter((order) =>
      ["CONFIRMED", "PREPARING", "READY"].includes(order.orderStatus),
    )
    const outForDelivery = orders.filter((order) => order.orderStatus === "OUT_FOR_DELIVERY")
    const delivered = orders.filter((order) => order.orderStatus === "DELIVERED")
    const lowStock = products.filter((product) => product.stock_status && product.stock_status !== "in-stock")

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      pendingOrders: pendingOrders.length,
      outForDelivery: outForDelivery.length,
      delivered: delivered.length,
      lowStock: lowStock.length,
    }
  }, [orders, products])

  const recentOrders = orders.slice(0, 6)

  const topSellingProducts = useMemo(() => {
    const quantityByProduct = new Map<string, { name: string; quantity: number }>()

    for (const order of orders) {
      for (const item of order.products) {
        const current = quantityByProduct.get(item.productId)
        quantityByProduct.set(item.productId, {
          name: current?.name ?? item.productName ?? "Product",
          quantity: (current?.quantity ?? 0) + item.quantity,
        })
      }
    }

    return Array.from(quantityByProduct.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [orders])

  const activeDeliveries = orders.filter(
    (order) => order.orderStatus === "OUT_FOR_DELIVERY" && order.deliveryType === "LOCAL",
  )

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-medium">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live overview of today&apos;s orders, revenue, and fulfilment.
          </p>
        </div>
        <Link href="/admin/orders" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <ShoppingBag className="size-4" />
          View Orders
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Today's Orders" value={loading ? "—" : stats.todayOrders} icon={ShoppingBag} />
        <StatCard title="Today's Revenue" value={loading ? "—" : formatPrice(stats.todayRevenue)} icon={IndianRupee} />
        <StatCard title="Pending Orders" value={loading ? "—" : stats.pendingOrders} icon={Clock3} />
        <StatCard title="Out for Delivery" value={loading ? "—" : stats.outForDelivery} icon={Radio} />
        <StatCard title="Delivered" value={loading ? "—" : stats.delivered} icon={CheckCircle2} />
        <StatCard title="Low Stock" value={loading ? "—" : stats.lowStock} icon={AlertTriangle} tone={stats.lowStock > 0 ? "warning" : "default"} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-heading text-lg font-medium">Analytics</h2>
        <Link href="/admin/analytics" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
          <BarChart3 className="size-4" />
          View full analytics
        </Link>
      </div>

      <div className="mt-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        ) : (
          <AnalyticsCharts orders={orders} customers={customers} compact />
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden lg:table-cell">Placed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-medium text-primary">
                          <Link href={`/admin/orders/${order.orderId}`}>{order.orderId}</Link>
                        </TableCell>
                        <TableCell>{order.customer.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{orderStatusLabels[order.orderStatus]}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(getOrderValue(order))}</TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        {loading ? "Loading orders..." : "No orders have been placed yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.quantity} sold</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="size-4 text-primary" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {activeDeliveries.length > 0 ? (
              <>
                {activeDeliveries.slice(0, 5).map((order) => (
                  <div key={order.orderId} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
                    <div>
                      <p className="font-medium">{order.orderId}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.deliveryPartner?.name ?? "Rider"} • {order.customer.name}
                      </p>
                    </div>
                    <Badge className="bg-live text-live-foreground">Live</Badge>
                  </div>
                ))}
                <Link href="/admin/live-deliveries" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-between")}>
                  View live map
                  <ArrowRight className="size-4" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No deliveries in progress right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recentNotifications.length > 0 ? (
              <>
                {recentNotifications.slice(0, 5).map((event) => (
                  <div key={event.orderId} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium">New order #{event.orderId}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.customerName} • {event.itemCount} item{event.itemCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="font-medium text-primary">{formatPrice(event.amountPaise)}</span>
                  </div>
                ))}
                <Link href="/admin/notifications" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-between")}>
                  View all notifications
                  <ArrowRight className="size-4" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No notifications yet this session.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "default",
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  tone?: "default" | "warning"
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-base font-medium text-muted-foreground">
          {title}
          <Icon className={cn("size-4", tone === "warning" ? "text-warning" : "text-muted-foreground")} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
