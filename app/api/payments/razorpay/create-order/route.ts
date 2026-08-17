import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { z } from "zod"

import { computeAuthoritativeOrder } from "@/lib/order-pricing"
import { cartLineItemSchema } from "@/lib/order-schema"
import { getEnv } from "@/lib/env"

const createOrderSchema = z.object({
  orderId: z.string().min(1),
  products: z.array(cartLineItemSchema).min(1),
  pincode: z.string().min(1),
  couponCode: z.string().min(1).optional(),
})

export async function POST(request: Request) {
  const parsed = createOrderSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment request." }, { status: 400 })
  }

  const env = getEnv()
  const keyId = (env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID)?.trim()
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim()

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 })
  }

  // The amount charged is computed here from the real catalogue/delivery
  // zones/coupon config - never from a client-submitted amountPaise - so a
  // manipulated cart total can't result in an underpriced Razorpay charge.
  const authoritative = await computeAuthoritativeOrder({
    products: parsed.data.products,
    pincode: parsed.data.pincode,
    couponCode: parsed.data.couponCode,
  })

  if (authoritative.grandTotalPaise <= 0) {
    return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 })
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  let order
  try {
    order = await razorpay.orders.create({
      amount: authoritative.grandTotalPaise,
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
