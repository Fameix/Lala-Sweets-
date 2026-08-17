import Link from "next/link"
import type { ComponentType } from "react"
import { CheckCircle2, CreditCard, Truck } from "lucide-react"

import { OrderTimeline } from "@/components/tracking/order-timeline"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { estimateOrderWindow } from "@/lib/delivery-eta"
import type { SavedOrder } from "@/lib/order-client"
import { orderStatusLabels } from "@/lib/order-status-labels"
import { cn } from "@/lib/utils"

export function OrderSuccessContent({
  order,
  orderId,
  loadError,
}: {
  order: SavedOrder | null
  orderId?: string
  loadError?: string | null
}) {
  if (loadError) {
    return (
      <Card>
        <CardContent className="grid gap-4 py-10 text-center">
          <h1 className="font-heading text-2xl font-medium">Unable to load order confirmation</h1>
          <p className="text-sm text-muted-foreground">
            {orderId ? `Order ID: ${orderId}. ` : ""}
            We could not confirm this order right now because of a server error. If you completed payment or placed a
            COD order, do not retry checkout — use Track Order with this order ID once the issue is resolved, or
            contact support.
          </p>
          <p className="text-xs text-destructive">{loadError}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={orderId ? `/track-order?orderId=${encodeURIComponent(orderId)}` : "/track-order"}
              className={cn(buttonVariants())}
            >
              Track Order
            </Link>
            <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }))}>
              Browse Menu
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="grid gap-4 py-10 text-center">
          <h1 className="font-heading text-2xl font-medium">Order not found</h1>
          <p className="text-sm text-muted-foreground">This confirmation is available after successful payment.</p>
          <Link href="/menu" className={cn(buttonVariants(), "mx-auto")}>
            Browse Menu
          </Link>
        </CardContent>
      </Card>
    )
  }

  const paymentLabel = order.payment.method === "COD" ? "Cash on Delivery" : "Paid Online"
  const deliveryLabel = order.delivery.type === "LOCAL" ? "Local Delivery" : "Courier Delivery"
  const estimatedWindow = estimateOrderWindow(order.createdAt, order.deliveryType)

  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden border-primary/15">
        <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-success/10 to-transparent px-6 pb-2 pt-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-success text-success-foreground">
            <CheckCircle2 className="size-9" />
          </div>
          <h1 className="mt-2 font-heading text-3xl font-medium">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground">Thank you for choosing Lala Sweets.</p>
          <Badge variant="outline" className="mt-2 font-mono text-xs">
            Order ID #{order.orderId}
          </Badge>
        </div>

        <CardContent className="grid gap-3 pt-4 text-sm">
          <div className="grid gap-3 rounded-2xl border border-border bg-muted/50 p-4 sm:grid-cols-3">
            <InfoRow icon={CreditCard} label="Payment" value={paymentLabel} />
            <InfoRow icon={Truck} label="Delivery" value={deliveryLabel} />
            <InfoRow
              icon={CheckCircle2}
              label="Estimated Delivery"
              value={estimatedWindow ?? "Will be shared shortly"}
            />
          </div>

          <div className="grid gap-3 py-1">
            <OrderTimeline currentStatus={order.orderStatus} variant="horizontal" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={`/track-order?orderId=${encodeURIComponent(order.orderId)}&mobile=${encodeURIComponent(order.customer.mobile)}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Track Order
            </Link>
            <Link href="/menu" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
              Continue Shopping
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{orderStatusLabels[order.orderStatus]}</Badge>
            <Badge variant="outline">{order.payment.status}</Badge>
          </div>
          <Separator />
          <div className="grid gap-2">
            {order.products.map((product) => (
              <div key={product.id} className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  {product.productName} ({product.size}) x {product.quantity}
                </span>
                <span>{formatPrice(product.unitPricePaise * product.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.totals.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Delivery charge</span>
            <span>{formatPrice(order.totals.deliveryChargePaise)}</span>
          </div>
          <div className="flex justify-between gap-4 text-base font-semibold">
            <span>Grand total</span>
            <span>{formatPrice(order.totals.grandTotalPaise)}</span>
          </div>
          <Separator />
          <Link
            href={`/account/orders/${encodeURIComponent(order.orderId)}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
          >
            View full order details
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}
