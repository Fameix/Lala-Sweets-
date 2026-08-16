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

export function LiveBadge({ live = true, className }: { live?: boolean; className?: string }) {
  return (
    <Badge
      className={cn(
        live ? "bg-live text-live-foreground" : "bg-secondary text-secondary-foreground",
        "gap-1.5 border-transparent shadow-sm",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", live ? "animate-pulse bg-live-foreground" : "bg-muted-foreground")} />
      {live ? "LIVE" : "Offline"}
    </Badge>
  )
}
