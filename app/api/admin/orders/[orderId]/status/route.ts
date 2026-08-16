import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminPreview } from "@/lib/delivery-auth"
import { updateOrderRecordStatus } from "@/lib/orders-server"

const updateStatusSchema = z.object({
  orderStatus: z.enum(["CONFIRMED", "PREPARING", "READY", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
})

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params
  const parsed = updateStatusSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order status update." }, { status: 400 })
  }

  try {
    requireAdminPreview()
    const order = await updateOrderRecordStatus(orderId, parsed.data.orderStatus)

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order status." },
      { status: 500 },
    )
  }
}
