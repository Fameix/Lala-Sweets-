import Image from "next/image"
import Link from "next/link"
import { Phone, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

export function OrderDetailsContent({ order }: { order: SavedOrder }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Order #{order.orderId}</CardTitle>
              <Badge variant="outline">{orderStatusLabels[order.orderStatus]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Order date" value={formatDate(order.createdAt)} />
            <Row label="Payment method" value={order.payment.method === "RAZORPAY" ? "Razorpay" : "Cash on Delivery"} />
            <Row label="Payment status" value={order.payment.status} />
            <Row label="Delivery type" value={order.deliveryType === "LOCAL" ? "Local Delivery" : "Courier"} />
            <Separator />
            <Row label="Name" value={order.customer.name} />
            <Row label="Phone" value={order.customer.mobile} />
            <Row label="Address" value={order.address} />
            <Row label="Pincode" value={order.pincode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {order.products.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                {product.image ? (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={product.image} alt={product.productName ?? ""} fill sizes="3.5rem" className="object-cover" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.size} x {product.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-medium">{formatPrice(product.unitPricePaise * product.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.totals.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Delivery fee</span>
                <span>{formatPrice(order.totals.deliveryChargePaise)}</span>
              </div>
              <div className="flex justify-between gap-4 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totals.grandTotalPaise)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {order.deliveryType === "LOCAL" ? (
          order.deliveryPartner ? (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Partner</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="grid gap-1">
                  <p className="text-base font-medium">{order.deliveryPartner.name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5" />
                    {order.deliveryPartner.phone}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Truck className="size-3.5" />
                    {order.deliveryPartner.vehicleNumber}
                  </p>
                </div>
                <a href={`tel:${order.deliveryPartner.phone}`}>
                  <span className={cn(buttonVariants(), "gap-2")}>
                    <Phone className="size-4" />
                    Call
                  </span>
                </a>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                A delivery partner has not been assigned yet.
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Courier</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Row label="Courier" value={order.courierTracking?.courierName ?? "Pending"} />
              <Row label="Tracking ID" value={order.courierTracking?.trackingId ?? "-"} />
            </CardContent>
          </Card>
        )}

        <Link
          href={`/track-order?orderId=${encodeURIComponent(order.orderId)}&mobile=${encodeURIComponent(order.customer.mobile)}`}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Track Order
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  )
}
