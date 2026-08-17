import { NextResponse } from "next/server"
import { z } from "zod"

import { validateCoupon } from "@/lib/coupons-server"

const validateSchema = z.object({
  code: z.string().min(1),
  subtotalPaise: z.number().int().nonnegative(),
})

export async function POST(request: Request) {
  const parsed = validateSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon request." }, { status: 400 })
  }

  try {
    const result = await validateCoupon(parsed.data.code, parsed.data.subtotalPaise)

    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 })
    }

    return NextResponse.json({ discountPaise: result.discountPaise, code: result.coupon.code })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to validate coupon." },
      { status: 500 },
    )
  }
}
