"use client"

import { Bell, X } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NewOrderAlertEvent } from "@/lib/order-alert-types"

function formatRupees(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amountPaise / 100)
}

export function NewOrderToast({ event, onDismiss }: { event: NewOrderAlertEvent; onDismiss: () => void }) {
  return (
    <div className="animate-in slide-in-from-top-4 fade-in zoom-in-95 relative w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-accent/40 bg-card text-card-foreground shadow-xl ring-1 ring-foreground/5 duration-300">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>

      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bell className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold tracking-wide text-primary uppercase">New Order</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">#{event.orderId}</p>
        </div>
      </div>

      <div className="space-y-2 px-4 pb-4">
        <div className="flex items-baseline justify-between rounded-xl bg-secondary/60 px-3 py-2">
          <span className="text-sm text-secondary-foreground">
            {event.itemCount} item{event.itemCount === 1 ? "" : "s"}
          </span>
          <span className="font-heading text-base font-semibold text-primary">{formatRupees(event.amountPaise)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="truncate font-medium text-foreground">{event.customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Delivery</p>
            <p className="font-medium text-foreground">{event.deliveryType === "LOCAL" ? "Local Delivery" : "Courier Delivery"}</p>
          </div>
        </div>

        <Link
          href={`/admin/orders/${event.orderId}`}
          onClick={onDismiss}
          className={cn(buttonVariants({ size: "sm" }), "w-full rounded-full")}
        >
          View Order
        </Link>
      </div>
    </div>
  )
}
