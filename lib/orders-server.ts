import "server-only"

import type { Firestore } from "firebase-admin/firestore"

import type { CartLineItem } from "@/lib/cart-client"
import { incrementCouponUsage, validateCoupon } from "@/lib/coupons-server"
import { normalizePincode, type DeliveryType } from "@/lib/delivery-config"
import { resolveAuthoritativeDelivery } from "@/lib/delivery-zones-server"
import { getFirebaseAdminDatabase, getFirebaseAdminDb } from "@/lib/firebase-admin"
import { generateOrderId } from "@/lib/order-id"
import { getProductById } from "@/lib/products-server"
import type {
  AssignedDeliveryPartner,
  CheckoutCustomer,
  CourierTrackingDetails,
  DeliveryPartner,
  OrderStatusCode,
  PaymentStatusCode,
  SavedOrder,
} from "@/lib/order-types"

type CreateOrderInput = {
  orderId?: string
  customer: CheckoutCustomer
  products: CartLineItem[]
  deliveryType?: DeliveryType
  subtotalPaise: number
  deliveryChargePaise: number
  paymentMethod: "RAZORPAY" | "COD"
  couponCode?: string | null
  courierTracking?: CourierTrackingDetails | null
  razorpay?: {
    razorpay_payment_id?: string
    razorpay_order_id?: string
    razorpay_signature?: string
  }
}

type OrderDoc = {
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
  deliveryPartner: AssignedDeliveryPartner | null
  courierTracking: CourierTrackingDetails | null
  trackingKey: string
  totals: {
    subtotalPaise: number
    deliveryChargePaise: number
    discountPaise: number
    grandTotalPaise: number
    totalAmountPaise: number
  }
  couponCode: string | null
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
  statusHistory: Array<{
    orderStatus: OrderStatusCode
    note: string
    createdAt: string
  }>
}

type DeliveryPartnerDoc = DeliveryPartner

type LiveLocation = {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  orderId: string
  partnerId?: string
  isOnline?: boolean
  // Compass heading in degrees (0 = north, clockwise), read from the partner's
  // device orientation sensor when available. Distinct from the bearing the
  // customer's map can derive from consecutive GPS points, which only reflects
  // travel direction and can't show heading while the partner is stationary.
  heading?: number
}

const statusToLegacyLabel: Record<OrderStatusCode, string> = {
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  ASSIGNED: "assigned",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
}

const supportedOrderStatuses = ["CONFIRMED", "PREPARING", "READY", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const

function nowIso() {
  return new Date().toISOString()
}

// Tolerant of "+91XXXXXXXXXX", "0XXXXXXXXXX", spaces/dashes, etc. - compares
// only the last 10 digits so the same physical number always matches
// regardless of how it was formatted at checkout vs. at tracking lookup.
export function normalizeMobileForComparison(value: string) {
  return value.replace(/\D/g, "").slice(-10)
}

// Items with no matching product/size (e.g. custom cake add-ons that don't
// map onto a plain size variant) pass through unchanged - there's no
// canonical price to reconcile against yet.
async function repriceLineItemsAgainstCatalogue(products: CartLineItem[]) {
  return Promise.all(
    products.map(async (item) => {
      const product = await getProductById(item.productId)
      const variant = product?.size_variants?.find((candidate) => candidate.label === item.size)

      if (!variant || variant.price_paise === null) {
        return item
      }

      return { ...item, unitPricePaise: variant.price_paise }
    }),
  )
}

function toLegacyPaymentStatus(status: PaymentStatusCode) {
  return status === "PAID" ? "Paid" : "Pending"
}

function makeTrackingKey(orderId: string) {
  return orderId
}

function ordersCollection(db: Firestore) {
  return db.collection("orders")
}

function partnersCollection(db: Firestore) {
  return db.collection("deliveryPartners")
}

function orderHistoryCollection(db: Firestore, orderId: string) {
  return ordersCollection(db).doc(orderId).collection("statusHistory")
}

function liveTrackingRef(orderId: string) {
  return getFirebaseAdminDatabase().ref(`liveTracking/${orderId}`)
}

function toPublicOrder(doc: OrderDoc): SavedOrder {
  return {
    orderId: doc.orderId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    customer: doc.customer,
    address: doc.address,
    pincode: doc.pincode,
    products: doc.products,
    amount: doc.amount,
    paymentStatus: doc.paymentStatus,
    deliveryType: doc.deliveryType,
    orderStatus: doc.orderStatus,
    deliveryPartner: doc.deliveryPartner ?? null,
    courierTracking: doc.courierTracking ?? null,
    trackingKey: doc.trackingKey,
    totals: doc.totals,
    couponCode: doc.couponCode ?? null,
    delivery: doc.delivery,
    payment: doc.payment,
  }
}

async function readOrderDoc(orderId: string) {
  const db = getFirebaseAdminDb()
  const snapshot = await ordersCollection(db).doc(orderId).get()

  return snapshot.exists ? (snapshot.data() as OrderDoc) : null
}

async function persistStatusHistory(orderId: string, orderStatus: OrderStatusCode, note: string) {
  const db = getFirebaseAdminDb()
  const createdAt = nowIso()

  await orderHistoryCollection(db, orderId).add({
    orderStatus,
    note,
    createdAt,
    legacyStatus: statusToLegacyLabel[orderStatus],
  })
}

export function getSupportedOrderStatuses() {
  return [...supportedOrderStatuses]
}

export function mapLegacyStatus(status: string): OrderStatusCode {
  if (status === "ORDER_CONFIRMED") {
    return "CONFIRMED"
  }

  if (status === "READY_FOR_PICKUP") {
    return "READY"
  }

  if ((supportedOrderStatuses as readonly string[]).includes(status)) {
    return status as OrderStatusCode
  }

  return "CONFIRMED"
}

export async function createOrderRecord(input: CreateOrderInput) {
  const db = getFirebaseAdminDb()
  const resolvedOrderId = input.orderId ?? generateOrderId()
  const orderRef = ordersCollection(db).doc(resolvedOrderId)
  const existingOrder = await orderRef.get()

  if (existingOrder.exists) {
    return toPublicOrder(existingOrder.data() as OrderDoc)
  }

  const createdAt = nowIso()
  const normalizedPincode = normalizePincode(input.customer.pincode)

  // Every price that ends up on the order is recomputed here, never trusted
  // from the client - the checkout UI's numbers are only a preview. This
  // makes createOrderRecord safe by construction regardless of what a
  // caller passes in for products/subtotalPaise/deliveryChargePaise.
  const repricedProducts = await repriceLineItemsAgainstCatalogue(input.products)
  const subtotalPaise = repricedProducts.reduce((total, item) => total + item.unitPricePaise * item.quantity, 0)

  const { type: resolvedDeliveryType, chargePaise: resolvedDeliveryChargePaise } = await resolveAuthoritativeDelivery(normalizedPincode)

  const couponResult = input.couponCode ? await validateCoupon(input.couponCode, subtotalPaise) : null
  const discountPaise = couponResult?.valid ? couponResult.discountPaise : 0
  const appliedCouponCode = couponResult?.valid ? couponResult.coupon.code : null

  const totalAmountPaise = subtotalPaise + resolvedDeliveryChargePaise - discountPaise
  const paymentStatus: PaymentStatusCode = input.paymentMethod === "RAZORPAY" ? "PAID" : "PENDING"
  const orderStatus: OrderStatusCode = "CONFIRMED"

  const orderDoc: OrderDoc = {
    orderId: resolvedOrderId,
    createdAt,
    updatedAt: createdAt,
    customer: input.customer,
    address: input.customer.address,
    pincode: normalizedPincode,
    products: repricedProducts,
    amount: totalAmountPaise,
    paymentStatus,
    deliveryType: resolvedDeliveryType,
    orderStatus,
    deliveryPartner: null,
    courierTracking: input.courierTracking ?? null,
    trackingKey: makeTrackingKey(resolvedOrderId),
    totals: {
      subtotalPaise,
      deliveryChargePaise: resolvedDeliveryChargePaise,
      discountPaise,
      grandTotalPaise: totalAmountPaise,
      totalAmountPaise,
    },
    couponCode: appliedCouponCode,
    delivery: {
      type: resolvedDeliveryType,
      pincode: normalizedPincode,
      address: input.customer.address,
      localTracking: resolvedDeliveryType === "LOCAL" ? { partnerId: null, trackingStatus: null } : null,
      courierTracking:
        resolvedDeliveryType === "COURIER"
          ? {
              provider: input.courierTracking?.courierName ?? "COURIER",
              awbNumber: input.courierTracking?.trackingId ?? null,
              trackingUrl: null,
            }
          : null,
    },
    payment: {
      method: input.paymentMethod,
      status: toLegacyPaymentStatus(paymentStatus),
      provider: input.paymentMethod,
      razorpayPaymentId: input.razorpay?.razorpay_payment_id ?? null,
      razorpayOrderId: input.razorpay?.razorpay_order_id ?? null,
      razorpaySignature: input.razorpay?.razorpay_signature ?? null,
    },
    statusHistory: [
      {
        orderStatus,
        note: "Order created.",
        createdAt,
      },
    ],
  }

  const wasCreated = await db.runTransaction(async (transaction) => {
    const current = await transaction.get(orderRef)
    if (current.exists) {
      return false
    }

    transaction.set(orderRef, orderDoc)
    return true
  })

  if (wasCreated && appliedCouponCode) {
    await incrementCouponUsage(appliedCouponCode)
  }

  await persistStatusHistory(resolvedOrderId, orderStatus, "Order created.")

  return toPublicOrder(orderDoc)
}

export async function listOrders(options: { status?: OrderStatusCode; limit?: number } = {}) {
  const db = getFirebaseAdminDb()
  // Filtering by status in-memory (rather than a Firestore .where() alongside
  // .orderBy("createdAt")) avoids requiring a composite index for what is, at
  // this order volume, a small in-memory filter.
  const snapshot = await ordersCollection(db).orderBy("createdAt", "desc").limit(options.limit ?? 200).get()
  const orders = snapshot.docs.map((doc) => toPublicOrder(doc.data() as OrderDoc))

  return options.status ? orders.filter((order) => order.orderStatus === options.status) : orders
}

export async function getOrderRecordByRazorpayPaymentId(paymentId: string) {
  const db = getFirebaseAdminDb()
  const snapshot = await ordersCollection(db).where("payment.razorpayPaymentId", "==", paymentId).limit(1).get()

  if (snapshot.empty) {
    return null
  }

  return toPublicOrder(snapshot.docs[0].data() as OrderDoc)
}

export async function getOrderRecordByOrderId(orderId: string) {
  const order = await readOrderDoc(orderId)
  return order ? toPublicOrder(order) : null
}

export async function getCustomerTrackingRecord(orderId: string, mobile: string) {
  const order = await readOrderDoc(orderId)

  if (!order) {
    return null
  }

  if (!mobile || normalizeMobileForComparison(order.customer.mobile) !== normalizeMobileForComparison(mobile)) {
    return null
  }

  const liveSnapshot = await liveTrackingRef(orderId).get()
  const liveLocation = liveSnapshot.exists() ? (liveSnapshot.val() as LiveLocation) : null

  return {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    deliveryType: order.deliveryType,
    deliveryPartner: order.deliveryPartner,
    courierTracking: order.courierTracking,
    address: order.address,
    liveLocation,
  }
}

export async function updateOrderRecordStatus(orderId: string, orderStatus: OrderStatusCode) {
  const db = getFirebaseAdminDb()
  const orderRef = ordersCollection(db).doc(orderId)
  const order = await readOrderDoc(orderId)

  if (!order) {
    return null
  }

  const updatedAt = nowIso()
  const updatedOrder: OrderDoc = {
    ...order,
    orderStatus,
    updatedAt,
    payment: {
      ...order.payment,
      status: order.payment.status,
    },
  }

  await orderRef.set(updatedOrder, { merge: true })
  await persistStatusHistory(orderId, orderStatus, `Order status updated to ${orderStatus}.`)

  return toPublicOrder(updatedOrder)
}

export async function assignDeliveryPartnerToOrder(orderId: string, partnerId: string) {
  const db = getFirebaseAdminDb()
  const orderRef = ordersCollection(db).doc(orderId)
  const partnerSnapshot = await partnersCollection(db).doc(partnerId).get()
  const order = await readOrderDoc(orderId)

  if (!order || !partnerSnapshot.exists) {
    return null
  }

  const partner = partnerSnapshot.data() as DeliveryPartnerDoc
  if (!partner.active) {
    throw new Error("Delivery partner is inactive.")
  }

  const updatedAt = nowIso()
  const assignedPartner: AssignedDeliveryPartner = {
    partnerId: partner.partnerId,
    name: partner.name,
    phone: partner.phone,
    vehicleNumber: partner.vehicleNumber,
    assignedAt: updatedAt,
  }

  const updatedOrder: OrderDoc = {
    ...order,
    orderStatus: "ASSIGNED",
    deliveryPartner: assignedPartner,
    delivery: {
      ...order.delivery,
      localTracking: {
        partnerId: partner.partnerId,
        trackingStatus: "ASSIGNED",
      },
    },
    updatedAt,
  }

  await orderRef.set(updatedOrder, { merge: true })
  await persistStatusHistory(orderId, "ASSIGNED", `Assigned to delivery partner ${partner.name}.`)

  return toPublicOrder(updatedOrder)
}

export async function startDelivery(orderId: string, partnerId: string) {
  const db = getFirebaseAdminDb()
  const order = await readOrderDoc(orderId)

  if (!order || !order.deliveryPartner || order.deliveryPartner.partnerId !== partnerId) {
    return null
  }

  const updatedAt = nowIso()
  const updatedOrder: OrderDoc = {
    ...order,
    orderStatus: "OUT_FOR_DELIVERY",
    updatedAt,
    delivery: {
      ...order.delivery,
      localTracking: {
        partnerId,
        trackingStatus: "OUT_FOR_DELIVERY",
      },
    },
  }

  await ordersCollection(db).doc(orderId).set(updatedOrder, { merge: true })
  await persistStatusHistory(orderId, "OUT_FOR_DELIVERY", "Partner started delivery.")

  return toPublicOrder(updatedOrder)
}

export async function updateLiveLocation(orderId: string, location: Omit<LiveLocation, "orderId">) {
  const order = await readOrderDoc(orderId)

  if (!order || order.deliveryType !== "LOCAL" || !order.deliveryPartner) {
    return null
  }

  const liveLocation: LiveLocation = {
    orderId,
    isOnline: true,
    ...location,
  }

  await liveTrackingRef(orderId).set(liveLocation)
  return liveLocation
}

export async function getLiveLocation(orderId: string) {
  const snapshot = await liveTrackingRef(orderId).get()
  return snapshot.exists() ? (snapshot.val() as LiveLocation) : null
}

export async function getLiveLocationForCustomer(orderId: string, mobile: string) {
  const order = await readOrderDoc(orderId)

  if (!order || !mobile || normalizeMobileForComparison(order.customer.mobile) !== normalizeMobileForComparison(mobile)) {
    return null
  }

  return getLiveLocation(orderId)
}

export async function setLiveTrackingOffline(orderId: string) {
  const ref = liveTrackingRef(orderId)
  const snapshot = await ref.get()

  if (!snapshot.exists()) {
    return null
  }

  await ref.update({ isOnline: false })
  return { ...(snapshot.val() as LiveLocation), isOnline: false }
}

export async function listOrdersForPartner(partnerId: string) {
  const db = getFirebaseAdminDb()
  const snapshot = await ordersCollection(db).where("deliveryPartner.partnerId", "==", partnerId).get()

  return snapshot.docs
    .map((doc) => toPublicOrder(doc.data() as OrderDoc))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function completeDelivery(orderId: string, partnerId: string) {
  const db = getFirebaseAdminDb()
  const order = await readOrderDoc(orderId)

  if (!order || !order.deliveryPartner || order.deliveryPartner.partnerId !== partnerId) {
    return null
  }

  if (order.orderStatus !== "OUT_FOR_DELIVERY") {
    return null
  }

  const updatedAt = nowIso()
  const updatedOrder: OrderDoc = {
    ...order,
    orderStatus: "DELIVERED",
    updatedAt,
    delivery: {
      ...order.delivery,
      localTracking: {
        partnerId,
        trackingStatus: "DELIVERED",
      },
    },
  }

  await ordersCollection(db).doc(orderId).set(updatedOrder, { merge: true })
  await persistStatusHistory(orderId, "DELIVERED", "Partner completed delivery.")
  await setLiveTrackingOffline(orderId)

  return toPublicOrder(updatedOrder)
}

export async function upsertDeliveryPartner(partner: Omit<DeliveryPartner, "createdAt" | "updatedAt"> & Partial<Pick<DeliveryPartner, "createdAt" | "updatedAt">>) {
  const db = getFirebaseAdminDb()
  const now = nowIso()
  const partnerDoc: DeliveryPartner = {
    ...partner,
    createdAt: partner.createdAt ?? now,
    updatedAt: partner.updatedAt ?? now,
  }

  await partnersCollection(db).doc(partner.partnerId).set(partnerDoc, { merge: true })
  return partnerDoc
}

export async function getDeliveryPartnerById(partnerId: string) {
  const db = getFirebaseAdminDb()
  const snapshot = await partnersCollection(db).doc(partnerId).get()
  return snapshot.exists ? (snapshot.data() as DeliveryPartner) : null
}

export async function listDeliveryPartners() {
  const db = getFirebaseAdminDb()
  const snapshot = await partnersCollection(db).orderBy("createdAt", "desc").get()
  return snapshot.docs.map((doc) => doc.data() as DeliveryPartner)
}

export async function getCurrentOrderStatus(orderId: string) {
  const order = await readOrderDoc(orderId)

  if (!order) {
    return null
  }

  return {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    deliveryType: order.deliveryType,
    deliveryPartner: order.deliveryPartner,
    courierTracking: order.courierTracking,
    updatedAt: order.updatedAt,
  }
}

export function getDisplayOrderStatus(orderStatus: OrderStatusCode) {
  return orderStatus
    .split("_")
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ")
}
