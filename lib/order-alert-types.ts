export type NewOrderAlertEvent = {
  orderId: string
  createdAt: string
  customerName: string
  itemCount: number
  amountPaise: number
  deliveryType: "LOCAL" | "COURIER"
  paymentMethod: "RAZORPAY" | "COD"
  paymentStatus: "PAID" | "PENDING"
}
