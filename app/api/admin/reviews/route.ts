import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { listReviews } from "@/lib/reviews-server"

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const reviews = await listReviews()
    return NextResponse.json({ reviews })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load reviews." },
      { status: 500 },
    )
  }
}
