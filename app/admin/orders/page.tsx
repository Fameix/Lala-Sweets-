"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { CalendarIcon, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants, Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminFetch } from "@/lib/admin-fetch"
import { orderStatusLabels } from "@/lib/order-status-labels"
import type { OrderStatusCode, SavedOrder } from "@/lib/order-types"
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

const tabs: { value: "ALL" | OrderStatusCode; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CONFIRMED", label: "New" },
  { value: "PREPARING", label: "Processing" },
  { value: "READY", label: "Ready" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
]

function isSameDay(isoDate: string, day: Date) {
  const date = new Date(isoDate)
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  )
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<main className="w-full px-4 py-8 sm:px-6 lg:px-8 text-sm text-muted-foreground">Loading...</main>}>
      <AdminOrdersContent />
    </Suspense>
  )
}

function AdminOrdersContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"ALL" | OrderStatusCode>("ALL")
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "")
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "RAZORPAY" | "COD">("ALL")
  const [deliveryFilter, setDeliveryFilter] = useState<"ALL" | "LOCAL" | "COURIER">("ALL")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)

  async function loadOrders() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/orders", { cache: "no-store" })
      const payload = (await response.json()) as { orders?: SavedOrder[] }
      setOrders(payload.orders ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadOrders(), 0)
    return () => clearTimeout(timer)
  }, [])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return orders.filter((order) => {
      if (activeTab !== "ALL" && order.orderStatus !== activeTab) {
        return false
      }

      if (paymentFilter !== "ALL" && order.payment.method !== paymentFilter) {
        return false
      }

      if (deliveryFilter !== "ALL" && order.deliveryType !== deliveryFilter) {
        return false
      }

      if (dateFilter && !isSameDay(order.createdAt, dateFilter)) {
        return false
      }

      if (
        normalizedSearch &&
        !order.orderId.toLowerCase().includes(normalizedSearch) &&
        !order.customer.name.toLowerCase().includes(normalizedSearch) &&
        !order.customer.mobile.toLowerCase().includes(normalizedSearch) &&
        !(order.deliveryPartner?.name.toLowerCase().includes(normalizedSearch) ?? false)
      ) {
        return false
      }

      return true
    })
  }, [orders, activeTab, paymentFilter, deliveryFilter, dateFilter, search])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length }
    for (const order of orders) {
      counts[order.orderStatus] = (counts[order.orderStatus] ?? 0) + 1
    }
    return counts
  }, [orders])

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">All customer orders in one place.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-1.5 rounded-full border border-border data-active:border-primary data-active:bg-primary data-active:text-primary-foreground"
            >
              {tab.label}
              <Badge variant="secondary" className="h-4 min-w-4 rounded-full px-1 text-[10px]">
                {tabCounts[tab.value] ?? 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="mt-4">
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search order ID, customer, or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as typeof paymentFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All payments</SelectItem>
              <SelectItem value="RAZORPAY">Razorpay</SelectItem>
              <SelectItem value="COD">COD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deliveryFilter} onValueChange={(value) => setDeliveryFilter(value as typeof deliveryFilter)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Delivery type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All delivery types</SelectItem>
              <SelectItem value="LOCAL">Local</SelectItem>
              <SelectItem value="COURIER">Courier</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" className={cn("gap-2", dateFilter && "border-primary text-primary")} />
              }
            >
              <CalendarIcon className="size-4" />
              {dateFilter ? dateFilter.toLocaleDateString("en-IN") : "Date"}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} />
            </PopoverContent>
          </Popover>
          {dateFilter || paymentFilter !== "ALL" || deliveryFilter !== "ALL" || search ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => {
                setDateFilter(undefined)
                setPaymentFilter("ALL")
                setDeliveryFilter("ALL")
                setSearch("")
              }}
            >
              <X className="size-3.5" />
              Clear filters
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
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
                      <TableCell className="text-muted-foreground">
                        {order.products[0]?.productName ?? "Item"}
                        {order.products.length > 1 ? ` +${order.products.length - 1} more` : ""}
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.totals.grandTotalPaise)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline">{order.payment.method}</Badge>
                          <Badge variant={order.payment.status === "Paid" ? "default" : "secondary"}>
                            {order.payment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.deliveryType}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{order.deliveryPartner?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{orderStatusLabels[order.orderStatus]}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/orders/${order.orderId}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                      No orders match these filters.
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
