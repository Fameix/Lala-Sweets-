export type DeliveryType = "LOCAL" | "COURIER"

export const deliveryConfig = {
  localAreaName: "Tirunelveli local delivery area",
  localPincodes: [
    "627001",
    "627002",
    "627003",
    "627004",
    "627005",
    "627006",
    "627007",
    "627008",
    "627009",
    "627010",
    "627011",
    "627012",
  ],
  chargesPaise: {
    LOCAL: 5000,
    COURIER: 12000,
  },
} as const

export function normalizePincode(pincode: string) {
  return pincode.replace(/\D/g, "").slice(0, 6)
}

export function getDeliveryTypeForPincode(pincode: string): DeliveryType | null {
  const normalizedPincode = normalizePincode(pincode)

  if (normalizedPincode.length !== 6) {
    return null
  }

  return (deliveryConfig.localPincodes as readonly string[]).includes(normalizedPincode) ? "LOCAL" : "COURIER"
}

export function getDeliveryChargePaise(deliveryType: DeliveryType | null) {
  return deliveryType ? deliveryConfig.chargesPaise[deliveryType] : 0
}
