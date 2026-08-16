import type { OrderStatusCode } from "@/lib/order-types"

// Customer/admin-facing display labels. The underlying OrderStatusCode enum
// (lib/order-types.ts) is unchanged - "PREPARING" is shown as "Processing"
// and "ASSIGNED" as "Rider Assigned" to match the Swiggy/Zomato-style wording
// customers expect, without creating duplicate/parallel status codes.
export const orderStatusLabels: Record<OrderStatusCode, string> = {
  CONFIRMED: "Order Confirmed",
  PREPARING: "Processing",
  READY: "Ready",
  ASSIGNED: "Rider Assigned",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export const orderTimelineSteps: { status: OrderStatusCode; label: string }[] = [
  { status: "CONFIRMED", label: "Order Confirmed" },
  { status: "PREPARING", label: "Processing" },
  { status: "READY", label: "Ready" },
  { status: "ASSIGNED", label: "Rider Assigned" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
]

// Customer-facing status descriptions, driven purely by the real order status.
export const orderStatusMessages: Record<OrderStatusCode, string> = {
  CONFIRMED: "Your order has been confirmed.",
  PREPARING: "We're preparing your order.",
  READY: "Your order is ready for pickup.",
  ASSIGNED: "A delivery partner has been assigned to your order.",
  OUT_FOR_DELIVERY: "Your order is on the way.",
  DELIVERED: "Delivery completed successfully.",
  CANCELLED: "This order has been cancelled.",
}
