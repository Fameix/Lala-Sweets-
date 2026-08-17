import "server-only"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"

export type Coupon = {
  code: string
  discountType: "PERCENT" | "FLAT"
  discountValue: number
  minOrderPaise: number
  maxDiscountPaise: number | null
  validFrom: string | null
  validUntil: string | null
  usageLimit: number | null
  usedCount: number
  active: boolean
  createdAt: string
  updatedAt: string
}

function nowIso() {
  return new Date().toISOString()
}

function couponsCollection() {
  return getFirebaseAdminDb().collection("coupons")
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase()
}

export async function listCoupons() {
  const snapshot = await couponsCollection().orderBy("createdAt", "desc").get()
  return snapshot.docs.map((doc) => doc.data() as Coupon)
}

export async function getCoupon(code: string) {
  const snapshot = await couponsCollection().doc(normalizeCouponCode(code)).get()
  return snapshot.exists ? (snapshot.data() as Coupon) : null
}

export async function upsertCoupon(input: Omit<Coupon, "createdAt" | "updatedAt" | "usedCount"> & { usedCount?: number }) {
  const code = normalizeCouponCode(input.code)
  const ref = couponsCollection().doc(code)
  const existing = await ref.get()
  const now = nowIso()

  const coupon: Coupon = {
    ...input,
    code,
    usedCount: input.usedCount ?? (existing.exists ? (existing.data() as Coupon).usedCount : 0),
    createdAt: existing.exists ? (existing.data() as Coupon).createdAt : now,
    updatedAt: now,
  }

  await ref.set(coupon, { merge: false })
  return coupon
}

export async function deleteCoupon(code: string) {
  await couponsCollection().doc(normalizeCouponCode(code)).delete()
}

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discountPaise: number }
  | { valid: false; reason: string }

// Server-only source of truth for discount amounts - checkout must never
// trust a client-computed discount. Called both from the checkout preview
// endpoint and again from order creation itself.
export async function validateCoupon(code: string, subtotalPaise: number): Promise<CouponValidationResult> {
  const coupon = await getCoupon(code)

  if (!coupon || !coupon.active) {
    return { valid: false, reason: "This coupon code is not valid." }
  }

  const now = new Date()

  if (coupon.validFrom && now < new Date(coupon.validFrom)) {
    return { valid: false, reason: "This coupon is not active yet." }
  }

  if (coupon.validUntil && now > new Date(coupon.validUntil)) {
    return { valid: false, reason: "This coupon has expired." }
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "This coupon has reached its usage limit." }
  }

  if (subtotalPaise < coupon.minOrderPaise) {
    return { valid: false, reason: `Minimum order of ${(coupon.minOrderPaise / 100).toFixed(0)} required for this coupon.` }
  }

  const rawDiscount =
    coupon.discountType === "PERCENT" ? Math.round((subtotalPaise * coupon.discountValue) / 100) : coupon.discountValue

  const cappedDiscount = coupon.maxDiscountPaise !== null ? Math.min(rawDiscount, coupon.maxDiscountPaise) : rawDiscount
  const discountPaise = Math.min(cappedDiscount, subtotalPaise)

  return { valid: true, coupon, discountPaise }
}

export async function incrementCouponUsage(code: string) {
  const ref = couponsCollection().doc(normalizeCouponCode(code))

  await getFirebaseAdminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists) {
      return
    }

    const coupon = snapshot.data() as Coupon
    transaction.update(ref, { usedCount: coupon.usedCount + 1, updatedAt: nowIso() })
  })
}
