"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { PackageSearch } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getOrders, type SavedOrder } from "@/lib/order-client"
import { orderStatusLabels } from "@/lib/order-status-labels"
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

export function AccountOrdersContent() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(getOrders())
      setLoaded(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-3xl font-medium">Your Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Orders placed from this device.</p>

      <div className="mt-6 grid gap-3">
        {!loaded ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading...</CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <PackageSearch className="size-9 text-muted-foreground" />
              <div>
                <p className="font-medium">No orders yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Orders you place will show up here.</p>
              </div>
              <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }), "mt-2")}>
                Browse Menu
              </Link>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Link key={order.orderId} href={`/account/orders/${encodeURIComponent(order.orderId)}`}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-medium">#{order.orderId}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium">{formatPrice(order.totals.grandTotalPaise)}</span>
                    <Badge variant="outline">{orderStatusLabels[order.orderStatus]}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
