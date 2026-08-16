import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getEnv } from "@/lib/env"

const createOrderSchema = z.object({
  amountPaise: z.number().int().positive(),
  orderId: z.string().min(1),
})

export async function POST(request: Request) {
  const parsed = createOrderSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 })
  }

  const env = getEnv()
  const keyId = (env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID)?.trim()
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim()

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 })
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  let order
  try {
    order = await razorpay.orders.create({
      amount: parsed.data.amountPaise,
      currency: "INR",
      receipt: `lala_${parsed.data.orderId}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start Razorpay payment." },
      { status: 502 },
    )
  }

  return NextResponse.json({
    keyId,
    razorpayOrderId: order.id,
    amountPaise: order.amount,
    currency: order.currency,
  })
}
