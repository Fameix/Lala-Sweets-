import "server-only"

import type { CartLineItem } from "@/lib/cart-client"
import { resolveAuthoritativeDelivery } from "@/lib/delivery-zones-server"
import { getProductById } from "@/lib/products-server"
import { validateCoupon } from "@/lib/coupons-server"

// Single source of truth for "what does this cart actually cost" - used by
// COD order creation, Razorpay order creation, and Razorpay payment
// confirmation, so none of them can be tricked by a client-submitted price,
// delivery charge, or discount. Only the checkout UI's own preview numbers
// are client-computed; every path that actually creates or charges an order
// goes through this.
export async function computeAuthoritativeOrder(input: {
  products: CartLineItem[]
  pincode: string
  couponCode?: string | null
}) {
  const repricedProducts = await Promise.all(
    input.products.map(async (item) => {
      const product = await getProductById(item.productId)
      const variant = product?.size_variants?.find((candidate) => candidate.label === item.size)

      if (!variant || variant.price_paise === null) {
        return item
      }

      return { ...item, unitPricePaise: variant.price_paise }
    }),
  )

  const subtotalPaise = repricedProducts.reduce((total, item) => total + item.unitPricePaise * item.quantity, 0)
  const { type: deliveryType, chargePaise: deliveryChargePaise } = await resolveAuthoritativeDelivery(input.pincode)

  const couponResult = input.couponCode ? await validateCoupon(input.couponCode, subtotalPaise) : null
  const discountPaise = couponResult?.valid ? couponResult.discountPaise : 0
  const appliedCouponCode = couponResult?.valid ? couponResult.coupon.code : null

  const grandTotalPaise = subtotalPaise + deliveryChargePaise - discountPaise

  return {
    products: repricedProducts,
    subtotalPaise,
    deliveryType,
    deliveryChargePaise,
    discountPaise,
    couponCode: appliedCouponCode,
    grandTotalPaise,
  }
}
