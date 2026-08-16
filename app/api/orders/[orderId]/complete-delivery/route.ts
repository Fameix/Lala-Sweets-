import { NextResponse } from "next/server"
import { z } from "zod"

import { requirePartnerActor } from "@/lib/delivery-auth"
import { completeDelivery } from "@/lib/orders-server"

const completeDeliverySchema = z.object({
  partnerId: z.string().min(1),
})

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params
  const parsed = completeDeliverySchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid complete delivery request." }, { status: 400 })
  }

  try {
    await requirePartnerActor(request, parsed.data.partnerId)
    const order = await completeDelivery(orderId, parsed.data.partnerId)

    if (!order) {
      return NextResponse.json({ error: "Order not found, not assigned to this partner, or not out for delivery." }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete delivery." },
      { status: 500 },
    )
  }
}
