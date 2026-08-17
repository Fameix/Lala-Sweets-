import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { adjustStock } from "@/lib/products-server"

const adjustStockSchema = z.object({
  delta: z.number().int(),
  reason: z.string().min(1),
})

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const parsed = adjustStockSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stock adjustment." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)
    const product = await adjustStock(id, parsed.data.delta, parsed.data.reason)

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to adjust stock." },
      { status: 500 },
    )
  }
}
