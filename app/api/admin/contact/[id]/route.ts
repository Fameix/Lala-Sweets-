import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { markContactInquiryRead } from "@/lib/contact-server"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    await requireAdminActor(request)
    await markContactInquiryRead(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update message." },
      { status: 500 },
    )
  }
}
