import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { deleteCoupon } from "@/lib/coupons-server"

export async function DELETE(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params

  try {
    await requireAdminActor(request)
    await deleteCoupon(code)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete coupon." },
      { status: 500 },
    )
  }
}
