import "server-only"

import type { Firestore } from "firebase-admin/firestore"

import type { CartLineItem } from "@/lib/cart-client"
import { getDeliveryTypeForPincode, normalizePincode, type DeliveryType } from "@/lib/delivery-config"
import { getFirebaseAdminDatabase, getFirebaseAdminDb } from "@/lib/firebase-admin"
import { generateOrderId } from "@/lib/order-id"
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
    grandTotalPaise: number
    totalAmountPaise: number
  }
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

function toLegacyPaymentStatus(status: PaymentStatusCode) {
  return status === "PAID" ? "Paid" : "Pending"
}

function resolveDeliveryType(customerPincode: string, deliveryType?: DeliveryType) {
  const normalized = normalizePincode(customerPincode)
  const derivedType = getDeliveryTypeForPincode(normalized)

  if (derivedType) {
    return derivedType
  }

  return deliveryType ?? "COURIER"
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
  const resolvedDeliveryType = resolveDeliveryType(input.customer.pincode, input.deliveryType)
  const normalizedPincode = normalizePincode(input.customer.pincode)
  const totalAmountPaise = input.subtotalPaise + input.deliveryChargePaise
  const paymentStatus: PaymentStatusCode = input.paymentMethod === "RAZORPAY" ? "PAID" : "PENDING"
  const orderStatus: OrderStatusCode = "CONFIRMED"

  const orderDoc: OrderDoc = {
    orderId: resolvedOrderId,
    createdAt,
    updatedAt: createdAt,
    customer: input.customer,
    address: input.customer.address,
    pincode: normalizedPincode,
    products: input.products,
    amount: totalAmountPaise,
    paymentStatus,
    deliveryType: resolvedDeliveryType,
    orderStatus,
    deliveryPartner: null,
    courierTracking: input.courierTracking ?? null,
    trackingKey: makeTrackingKey(resolvedOrderId),
    totals: {
      subtotalPaise: input.subtotalPaise,
      deliveryChargePaise: input.deliveryChargePaise,
      grandTotalPaise: totalAmountPaise,
      totalAmountPaise,
    },
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

  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(orderRef)
    if (current.exists) {
      return
    }

    transaction.set(orderRef, orderDoc)
  })

  await persistStatusHistory(resolvedOrderId, orderStatus, "Order created.")

  return toPublicOrder(orderDoc)
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

export async function getCustomerTrackingRecord(orderId: string) {
  const order = await readOrderDoc(orderId)

  if (!order) {
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
