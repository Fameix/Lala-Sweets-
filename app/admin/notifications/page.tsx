"use client"

import Link from "next/link"
import { Bell, BellOff, CheckCheck, Volume2 } from "lucide-react"

import { useOrderAlerts } from "@/components/admin/order-alerts/order-alerts-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function AdminNotificationsPage() {
  const { recentOrders, unseenCount, markAllSeen, muted, toggleMuted, soundEnabled, enableSound, connectionState } =
    useOrderAlerts()

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live new-order alerts from this session.{" "}
            <span className={connectionState === "open" ? "text-success" : "text-muted-foreground"}>
              {connectionState === "open" ? "Connected" : connectionState === "connecting" ? "Connecting..." : "Disconnected"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!soundEnabled ? (
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => void enableSound()}>
              <Volume2 className="size-3.5" />
              Enable Sound
            </Button>
          ) : null}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={toggleMuted}>
            {muted ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
            {muted ? "Unmute" : "Mute"}
          </Button>
          {unseenCount > 0 ? (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={markAllSeen}>
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Order Alerts</CardTitle>
          <CardDescription>
            Bounded to this browser session&apos;s recent history — not a permanent archive.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {recentOrders.length > 0 ? (
            recentOrders.map((event) => (
              <Link
                key={event.orderId}
                href={`/admin/orders/${event.orderId}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4 transition hover:bg-muted/60"
              >
                <div>
                  <p className="font-medium">New order #{event.orderId}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {event.customerName} • {event.itemCount} item{event.itemCount === 1 ? "" : "s"} •{" "}
                    {event.deliveryType === "LOCAL" ? "Local delivery" : "Courier"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-heading text-lg font-semibold text-primary">{formatPrice(event.amountPaise)}</span>
                  <Badge variant="outline">{event.paymentMethod}</Badge>
                </div>
              </Link>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No notifications yet this session.</p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
