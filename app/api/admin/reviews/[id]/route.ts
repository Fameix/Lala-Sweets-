import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { setReviewVisibility } from "@/lib/reviews-server"

const visibilitySchema = z.object({ hidden: z.boolean() })

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const parsed = visibilitySchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)
    await setReviewVisibility(id, parsed.data.hidden)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update review." },
      { status: 500 },
    )
  }
}
