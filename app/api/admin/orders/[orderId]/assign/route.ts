import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminPreview } from "@/lib/delivery-auth"
import { assignDeliveryPartnerToOrder } from "@/lib/orders-server"

const assignPartnerSchema = z.object({
  partnerId: z.string().min(1),
})

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params
  const parsed = assignPartnerSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid delivery partner assignment." }, { status: 400 })
  }

  try {
    requireAdminPreview()
    const order = await assignDeliveryPartnerToOrder(orderId, parsed.data.partnerId)

    if (!order) {
      return NextResponse.json({ error: "Order or delivery partner not found." }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to assign delivery partner." },
      { status: 500 },
    )
  }
}
