import type { CartLineItem } from "@/lib/cart-client"

export type CheckoutCustomer = {
  name: string
  mobile: string
  email: string
  address: string
  pincode: string
}

export type OrderStatusCode = "CONFIRMED" | "PREPARING" | "READY" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"

export type PaymentStatusCode = "PAID" | "PENDING"

export type DeliveryType = "LOCAL" | "COURIER"

export type DeliveryPartner = {
  partnerId: string
  name: string
  phone: string
  vehicleNumber: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AssignedDeliveryPartner = {
  partnerId: string
  name: string
  phone: string
  vehicleNumber: string
  assignedAt: string
}

export type CourierTrackingDetails = {
  courierName: string
  trackingId: string
}

export type SavedOrder = {
  orderId: string
  createdAt: string
  updatedAt: string
  customer: CheckoutCustomer
  address: string
  pincode: string
  products: CartLineItem[]
  amount: number
  paymentStatus: PaymentStatusCode
  deliveryType: DeliveryType
  orderStatus: OrderStatusCode
  deliveryPartner?: AssignedDeliveryPartner | null
  courierTracking?: CourierTrackingDetails | null
  trackingKey: string
  totals: {
    subtotalPaise: number
    deliveryChargePaise: number
    discountPaise: number
    grandTotalPaise: number
    totalAmountPaise: number
  }
  couponCode?: string | null
  delivery: {
    type: DeliveryType
    pincode: string
    address: string
    localTracking: {
      partnerId: string | null
      trackingStatus: string | null
    } | null
    courierTracking: {
      provider: string | null
      awbNumber: string | null
      trackingUrl: string | null
    } | null
  }
  payment: {
    method: "RAZORPAY" | "COD"
    status: "Paid" | "Pending"
    provider: "RAZORPAY" | "COD"
    razorpayPaymentId: string | null
    razorpayOrderId: string | null
    razorpaySignature: string | null
  }
}
