import { NextResponse } from "next/server"

import { requirePartnerActor } from "@/lib/delivery-auth"
import { listOrdersForPartner } from "@/lib/orders-server"

export async function GET(request: Request, context: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await context.params

  try {
    await requirePartnerActor(request, partnerId)
    const orders = await listOrdersForPartner(partnerId)
    return NextResponse.json({ orders })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load assigned orders." },
      { status: 500 },
    )
  }
}
