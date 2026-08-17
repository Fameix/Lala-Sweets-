import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { deleteDeliveryZone } from "@/lib/delivery-zones-server"

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    await requireAdminActor(request)
    await deleteDeliveryZone(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete delivery zone." },
      { status: 500 },
    )
  }
}
