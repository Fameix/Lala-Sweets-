"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BadgeIndianRupee,
  Boxes,
  CheckCircle2,
  Clock3,
  IndianRupee,
  PackageSearch,
  ShoppingBag,
  UsersRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMissingPriceProducts, getNeedsReviewProducts, getProducts } from "@/lib/catalogue"
import { getOrders, type SavedOrder } from "@/lib/order-client"

const fallbackOrders = [
  { id: "LS10245", customer: "Gokul K", method: "COD", status: "Pending", delivery: "LOCAL", amount: "INR 620", date: "18 Aug, 02:30 PM" },
  { id: "LS10244", customer: "Ramesh B", method: "RAZORPAY", status: "Paid", delivery: "COURIER", amount: "INR 1,240", date: "18 Aug, 01:45 PM" },
  { id: "LS10243", customer: "Priya S", method: "RAZORPAY", status: "Paid", delivery: "LOCAL", amount: "INR 540", date: "18 Aug, 12:15 PM" },
  { id: "LS10242", customer: "Arun M", method: "COD", status: "Pending", delivery: "COURIER", amount: "INR 760", date: "18 Aug, 11:20 AM" },
]

const inventory = [
  { item: "Halwa", quantity: "120 kg", status: "In stock" },
  { item: "Laddu", quantity: "280 pcs", status: "In stock" },
  { item: "Mysorepak", quantity: "150 pcs", status: "Low stock" },
  { item: "Badusha", quantity: "90 pcs", status: "Low stock" },
]

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

function toOrderRow(order: SavedOrder) {
  return {
    id: order.orderId,
    customer: order.customer.name,
    method: order.payment.method,
    status: order.payment.status,
    delivery: order.delivery.type,
    amount: formatPrice(getOrderValue(order)),
    date: formatDate(order.createdAt),
  }
}

export default function AdminPage() {
  const products = getProducts()
  const orders = getOrders()
  const paidOrders = orders.filter((order) => order.payment.status === "Paid")
  const pendingOrders = orders.filter((order) => order.payment.status === "Pending")
  const revenue = paidOrders.reduce((total, order) => total + getOrderValue(order), 0)
  const needsReview = getNeedsReviewProducts().length + getMissingPriceProducts().length
  const recentOrders = orders.length > 0 ? orders.slice(0, 6).map(toOrderRow) : fallbackOrders

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor orders, catalogue health, revenue, and fulfilment.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/admin/catalogue-review" />}>
            <PackageSearch />
            Catalogue Review
          </Button>
          <Button render={<Link href="/admin/orders" />}>
            <ShoppingBag />
            Orders
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total orders" value={orders.length} description={`${pendingOrders.length} pending`} icon={ShoppingBag} />
        <StatCard title="Revenue" value={revenue ? formatPrice(revenue) : "INR 0"} description={`${paidOrders.length} paid orders`} icon={IndianRupee} />
        <StatCard title="Products" value={products.length} description={`${needsReview} need review`} icon={Boxes} />
        <StatCard title="Customers" value={orders.length || 0} description="Local order records" icon={UsersRound} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest checkout activity from the local order store.</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" render={<Link href="/admin/orders" />}>
                View all
                <ArrowUpRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "Paid" ? "default" : "secondary"}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.delivery}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{order.amount}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catalogue health</CardTitle>
            <CardDescription>Items that need admin attention before publishing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <HealthRow label="Missing prices" value={getMissingPriceProducts().length} icon={BadgeIndianRupee} />
            <HealthRow label="Needs review" value={getNeedsReviewProducts().length} icon={PackageSearch} />
            <HealthRow label="Ready products" value={products.length - needsReview} icon={CheckCircle2} />
            <Button variant="outline" render={<Link href="/admin/catalogue-review" />}>
              Review catalogue
              <ArrowUpRight />
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Current stock snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {inventory.map((item) => (
              <div key={item.item} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <div>
                  <p className="font-medium">{item.item}</p>
                  <p className="text-sm text-muted-foreground">{item.quantity}</p>
                </div>
                <Badge variant={item.status === "In stock" ? "secondary" : "destructive"}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfilment</CardTitle>
            <CardDescription>Delivery mix for recent orders.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <SummaryRow label="Local delivery" value={orders.filter((order) => order.delivery.type === "LOCAL").length} />
            <SummaryRow label="Courier delivery" value={orders.filter((order) => order.delivery.type === "COURIER").length} />
            <SummaryRow label="Pending COD" value={pendingOrders.length} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
            <CardDescription>Common admin workflows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { href: "/admin/orders", label: "Process orders" },
              { href: "/admin/products/new", label: "Add product" },
              { href: "/admin/inventory", label: "Update inventory" },
              { href: "/admin/settings", label: "Store settings" },
            ].map((item) => (
              <Button key={item.href} variant="outline" className="justify-between" render={<Link href={item.href} />}>
                {item.label}
                <ArrowUpRight />
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-sans text-2xl font-semibold tabular-nums tracking-tight">{value}</CardTitle>
        <CardAction>
          <Icon className="size-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock3 className="size-3.5" />
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

function HealthRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
          <Icon className="size-4" />
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
