import crypto from "node:crypto"

import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getEnv } from "@/lib/env"
import { cartLineItemSchema, checkoutCustomerSchema } from "@/lib/order-schema"
import { createOrderRecord, getOrderRecordByRazorpayPaymentId } from "@/lib/orders-server"

const confirmPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  amountPaise: z.number().int().positive(),
  customer: checkoutCustomerSchema,
  products: z.array(cartLineItemSchema).min(1),
  deliveryType: z.enum(["LOCAL", "COURIER"]),
  subtotalPaise: z.number().int().nonnegative(),
  deliveryChargePaise: z.number().int().nonnegative(),
})

type RazorpayPayment = {
  amount: number
  order_id: string
  status: string
}

export async function POST(request: Request) {
  const parsed = confirmPaymentSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ verified: false, error: "Invalid payment confirmation request." }, { status: 400 })
  }

  const env = getEnv()
  const keyId = (env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID)?.trim()
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim()

  if (!keyId || !keySecret) {
    return NextResponse.json({ verified: false, error: "Razorpay secret is not configured." }, { status: 500 })
  }

  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amountPaise,
    customer,
    products,
    deliveryType,
    subtotalPaise,
    deliveryChargePaise,
  } = parsed.data

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex")
  const providedSignatureBuffer = Buffer.from(razorpay_signature, "hex")
  const signatureIsValid =
    expectedSignatureBuffer.length === providedSignatureBuffer.length &&
    crypto.timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)

  if (!signatureIsValid) {
    return NextResponse.json({ verified: false, error: "Payment verification failed." }, { status: 400 })
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  let payment: RazorpayPayment

  try {
    payment = (await razorpay.payments.fetch(razorpay_payment_id)) as RazorpayPayment
  } catch (error) {
    return NextResponse.json(
      { verified: false, error: error instanceof Error ? error.message : "Unable to verify payment with Razorpay." },
      { status: 502 },
    )
  }

  if (payment.order_id !== razorpay_order_id || payment.amount !== amountPaise || payment.status !== "captured") {
    return NextResponse.json({ verified: false, error: "Payment was not captured by Razorpay." }, { status: 400 })
  }

  const existingOrder = await getOrderRecordByRazorpayPaymentId(razorpay_payment_id)

  if (existingOrder) {
    return NextResponse.json({ verified: true, order: existingOrder })
  }

  try {
    const order = await createOrderRecord({
      orderId,
      customer,
      products,
      deliveryType,
      subtotalPaise,
      deliveryChargePaise,
      paymentMethod: "RAZORPAY",
      razorpay: {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      },
    })

    return NextResponse.json({ verified: true, order })
  } catch (error) {
    return NextResponse.json(
      { verified: false, error: error instanceof Error ? error.message : "Unable to confirm paid order." },
      { status: 500 },
    )
  }
}
