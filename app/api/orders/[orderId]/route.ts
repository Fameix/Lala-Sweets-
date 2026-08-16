import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { getOrderRecordByOrderId, mapLegacyStatus, updateOrderRecordStatus } from "@/lib/orders-server"

const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "CONFIRMED",
    "PREPARING",
    "READY",
    "ASSIGNED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "ORDER_CONFIRMED",
    "READY_FOR_PICKUP",
  ]),
})

export async function GET(_request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params

  try {
    const order = await getOrderRecordByOrderId(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load order." },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params
  const parsed = updateOrderStatusSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order status update." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)

    const order = await updateOrderRecordStatus(orderId, mapLegacyStatus(parsed.data.orderStatus))

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order." },
      { status: 500 },
    )
  }
}
