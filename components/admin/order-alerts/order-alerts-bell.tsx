"use client"

import { Bell, BellOff, BellRing, Volume2 } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useOrderAlerts } from "./order-alerts-context"

function formatRupees(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100)
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) {
    return "Just now"
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  return `${diffHours} hr ago`
}

export function OrderAlertsBell() {
  const { recentOrders, unseenCount, markAllSeen, muted, toggleMuted, soundEnabled, enableSound } = useOrderAlerts()

  return (
    <div className="ml-auto flex items-center gap-2">
      {!soundEnabled && (
        <Button
          size="sm"
          variant="secondary"
          className="hidden gap-1.5 rounded-full sm:inline-flex"
          onClick={() => {
            void enableSound()
          }}
        >
          <Bell className="size-3.5" />
          Enable Order Alerts
        </Button>
      )}

      <Button
        size="icon-sm"
        variant="ghost"
        className="rounded-full"
        onClick={toggleMuted}
        aria-label={muted ? "Unmute order alerts" : "Mute order alerts"}
        title={muted ? "Unmute order alerts" : "Mute order alerts"}
      >
        {muted ? <BellOff className="size-4" /> : <Volume2 className="size-4" />}
      </Button>

      <DropdownMenu onOpenChange={(open) => open && markAllSeen()}>
        <DropdownMenuTrigger
          render={<Button size="icon-sm" variant="ghost" className="relative rounded-full" aria-label="New order notifications" />}
        >
          {unseenCount > 0 ? <BellRing className="size-4 text-primary" /> : <Bell className="size-4" />}
          {unseenCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full px-1 text-[10px]">
              {unseenCount > 9 ? "9+" : unseenCount}
            </Badge>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>New Orders</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {recentOrders.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No new orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <DropdownMenuItem key={order.orderId} render={<Link href={`/admin/orders/${order.orderId}`} />} className="flex-col items-start gap-0.5">
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs text-muted-foreground">#{order.orderId}</span>
                  <span className="font-heading text-sm font-semibold text-primary">{formatRupees(order.amountPaise)}</span>
                </div>
                <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {order.itemCount} item{order.itemCount === 1 ? "" : "s"} • {order.customerName}
                  </span>
                  <span>{formatRelativeTime(order.createdAt)}</span>
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/admin/notifications" />} className="justify-center text-sm text-primary">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
