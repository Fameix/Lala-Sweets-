"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CustomerSummary } from "@/lib/customers-server"
import type { SavedOrder } from "@/lib/order-types"

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
}

function getOrderValue(order: SavedOrder) {
  return order.totals.totalAmountPaise || order.totals.grandTotalPaise
}

export function AnalyticsCharts({
  orders,
  customers,
  compact = false,
}: {
  orders: SavedOrder[]
  customers: CustomerSummary[]
  /** Shorter chart height for embedding inside the Dashboard. */
  compact?: boolean
}) {
  const chartHeight = compact ? "h-56" : "h-64"

  const revenueByDay = useMemo(() => {
    const byDay = new Map<string, number>()
    for (const order of [...orders].reverse()) {
      const key = dayKey(order.createdAt)
      byDay.set(key, (byDay.get(key) ?? 0) + getOrderValue(order))
    }
    return Array.from(byDay.entries()).map(([date, revenuePaise]) => ({ date, revenue: revenuePaise / 100 }))
  }, [orders])

  const ordersByDay = useMemo(() => {
    const byDay = new Map<string, number>()
    for (const order of [...orders].reverse()) {
      const key = dayKey(order.createdAt)
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }
    return Array.from(byDay.entries()).map(([date, count]) => ({ date, orders: count }))
  }, [orders])

  const bestSelling = useMemo(() => {
    const byProduct = new Map<string, number>()
    for (const order of orders) {
      for (const item of order.products) {
        const name = item.productName ?? "Product"
        byProduct.set(name, (byProduct.get(name) ?? 0) + item.quantity)
      }
    }
    return Array.from(byProduct.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, compact ? 5 : 8)
  }, [orders, compact])

  const paymentBreakdown = useMemo(() => {
    const razorpay = orders.filter((order) => order.payment.method === "RAZORPAY").length
    const cod = orders.filter((order) => order.payment.method === "COD").length
    return [
      { name: "Razorpay", value: razorpay },
      { name: "COD", value: cod },
    ].filter((entry) => entry.value > 0)
  }, [orders])

  const deliveryPerformance = useMemo(() => {
    const local = orders.filter((order) => order.deliveryType === "LOCAL")
    const courier = orders.filter((order) => order.deliveryType === "COURIER")
    const deliveredLocal = local.filter((order) => order.orderStatus === "DELIVERED")

    // Approximated from order updatedAt (set on every status transition,
    // including the final DELIVERED write) rather than reading each order's
    // statusHistory subcollection individually, to avoid an N+1 read per order.
    const avgFulfilmentMinutes =
      deliveredLocal.length > 0
        ? Math.round(
            deliveredLocal.reduce(
              (total, order) => total + (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / 60_000,
              0,
            ) / deliveredLocal.length,
          )
        : null

    return { local: local.length, courier: courier.length, avgFulfilmentMinutes }
  }, [orders])

  const customerGrowth = useMemo(() => {
    const byDay = new Map<string, number>()
    for (const customer of [...customers].reverse()) {
      const key = dayKey(customer.lastOrderAt)
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }
    return Array.from(byDay.entries()).map(([date, count]) => ({ date, customers: count }))
  }, [customers])

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className={compact ? "text-base" : undefined}>Revenue</CardTitle>
          {!compact ? <CardDescription>Grand total per day, in rupees.</CardDescription> : null}
        </CardHeader>
        <CardContent className={chartHeight}>
          {revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={compact ? "text-base" : undefined}>Orders</CardTitle>
          {!compact ? <CardDescription>Order count per day.</CardDescription> : null}
        </CardHeader>
        <CardContent className={chartHeight}>
          {ordersByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="orders" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={compact ? "text-base" : undefined}>Best-Selling Products</CardTitle>
        </CardHeader>
        <CardContent className={chartHeight}>
          {bestSelling.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSelling} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="quantity" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={compact ? "text-base" : undefined}>Payment Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent className={chartHeight}>
          {paymentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={compact ? "text-base" : undefined}>Delivery Performance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <StatRow label="Local deliveries" value={deliveryPerformance.local} />
          <StatRow label="Courier deliveries" value={deliveryPerformance.courier} />
          <StatRow
            label="Avg. local fulfilment time"
            value={deliveryPerformance.avgFulfilmentMinutes !== null ? `${deliveryPerformance.avgFulfilmentMinutes} min` : "—"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={compact ? "text-base" : undefined}>Customer Growth</CardTitle>
          {!compact ? <CardDescription>Customers by most recent order date.</CardDescription> : null}
        </CardHeader>
        <CardContent className={chartHeight}>
          {customerGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="customers" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyChart() {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet.</div>
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
