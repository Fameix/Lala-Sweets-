import { Badge } from "@/components/ui/badge"
import { orderStatusLabels } from "@/lib/order-status-labels"
import type { OrderStatusCode } from "@/lib/order-types"
import { cn } from "@/lib/utils"

const statusToneClassName: Record<OrderStatusCode, string> = {
  CONFIRMED: "bg-secondary text-secondary-foreground",
  PREPARING: "bg-warning text-warning-foreground",
  READY: "bg-warning text-warning-foreground",
  ASSIGNED: "bg-accent text-accent-foreground",
  OUT_FOR_DELIVERY: "bg-live text-live-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
}

export function StatusBadge({ status, className }: { status: OrderStatusCode; className?: string }) {
  return (
    <Badge className={cn(statusToneClassName[status], "border-transparent", className)}>
      {orderStatusLabels[status]}
    </Badge>
  )
}

export type LiveTrackingStatus = "live" | "updating" | "offline"

// "offline" only ever applies once the tracking session has explicitly ended
// (delivery completed) - a rider whose GPS is merely delayed/stale is
// "updating", never "offline". See app/track-order/page.tsx.
const liveStatusConfig: Record<LiveTrackingStatus, { label: string; toneClassName: string; dotClassName: string; pulse: boolean }> = {
  live: { label: "LIVE", toneClassName: "bg-live text-live-foreground", dotClassName: "bg-live-foreground", pulse: true },
  updating: {
    label: "UPDATING",
    toneClassName: "bg-warning text-warning-foreground",
    dotClassName: "bg-warning-foreground",
    pulse: true,
  },
  offline: {
    label: "Offline",
    toneClassName: "bg-secondary text-secondary-foreground",
    dotClassName: "bg-muted-foreground",
    pulse: false,
  },
}

export function LiveBadge({ status = "live", className }: { status?: LiveTrackingStatus; className?: string }) {
  const config = liveStatusConfig[status]

  return (
    <Badge className={cn(config.toneClassName, "gap-1.5 border-transparent shadow-sm", className)}>
      <span className={cn("size-1.5 rounded-full", config.pulse && "animate-pulse", config.dotClassName)} />
      {config.label}
    </Badge>
  )
}
