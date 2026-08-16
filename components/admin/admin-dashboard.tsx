"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRight, Banknote, Clock3, IndianRupee, PackageCheck, ShoppingBag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMissingPriceProducts, getNeedsReviewProducts, getProducts } from "@/lib/catalogue"
import { getOrders, type SavedOrder } from "@/lib/order-client"
import { cn } from "@/lib/utils"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
}

function getOrderValue(order: SavedOrder) {
  return order.totals.totalAmountPaise || order.totals.grandTotalPaise
}

export function AdminDashboard() {
  const products = getProducts()
  const orders = getOrders()
  const missingPrices = getMissingPriceProducts()
  const reviewItems = getNeedsReviewProducts()

  const stats = useMemo(() => {
    const paidOrders = orders.filter((order) => order.payment.status === "Paid")
    const pendingOrders = orders.filter((order) => order.payment.status === "Pending")
    const localOrders = orders.filter((order) => order.delivery.type === "LOCAL")
    const courierOrders = orders.filter((order) => order.delivery.type === "COURIER")
    const revenuePaise = paidOrders.reduce((total, order) => total + getOrderValue(order), 0)

    return {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      revenuePaise,
      localOrders: localOrders.length,
      courierOrders: courierOrders.length,
    }
  }, [orders])

  const recentOrders = orders.slice(0, 6)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-medium">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Live catalogue health, recent orders, and payment status at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/orders" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
            <ShoppingBag className="size-4" />
            View Orders
          </Link>
          <Link href="/admin/catalogue-review" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
            <PackageCheck className="size-4" />
            Catalogue Review
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard title="Paid orders" value={stats.paidOrders} icon={Banknote} />
        <StatCard title="Pending COD" value={stats.pendingOrders} icon={Clock3} />
        <StatCard title="Revenue" value={formatPrice(stats.revenuePaise)} icon={IndianRupee} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders" className="w-full">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                <div className="overflow-hidden rounded-2xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Placed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell className="font-medium">
                              <Link href={`/admin/orders/${order.orderId}`} className="hover:underline">
                                {order.orderId}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div>{order.customer.name}</div>
                              <div className="text-xs text-muted-foreground">{order.customer.mobile}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{order.payment.method}</Badge>
                                <Badge variant={order.payment.status === "Paid" ? "default" : "secondary"}>
                                  {order.payment.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.delivery.type}</Badge>
                            </TableCell>
                            <TableCell>{formatPrice(getOrderValue(order))}</TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                            No orders have been placed yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="catalogue" className="mt-4 grid gap-4 sm:grid-cols-3">
                <MiniSummary title="Products" value={products.length} />
                <MiniSummary title="Needs review" value={reviewItems.length} />
                <MiniSummary title="Missing prices" value={missingPrices.length} />
              </TabsContent>

              <TabsContent value="delivery" className="mt-4 grid gap-4 sm:grid-cols-3">
                <MiniSummary title="Local orders" value={stats.localOrders} />
                <MiniSummary title="Courier orders" value={stats.courierOrders} />
                <MiniSummary title="Order states" value={stats.totalOrders} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                { href: "/admin/orders", label: "Open orders" },
                { href: "/admin/delivery-partners", label: "Delivery partners" },
                { href: "/admin/products", label: "Review products" },
                { href: "/admin/settings", label: "Settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                  {item.label}
                  <ArrowRight className="size-4" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Mix</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Paid orders</span>
                <span className="font-medium">{stats.paidOrders}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Pending COD</span>
                <span className="font-medium">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Local delivery</span>
                <span className="font-medium">{stats.localOrders}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Courier delivery</span>
                <span className="font-medium">{stats.courierOrders}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          {title}
          <Icon className="size-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-medium">{value}</p>
      </CardContent>
    </Card>
  )
}

function MiniSummary({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-medium">{value}</p>
      </CardContent>
    </Card>
  )
}
