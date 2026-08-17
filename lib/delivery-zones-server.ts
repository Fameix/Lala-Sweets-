import "server-only"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"
import { getDeliveryChargePaise, getDeliveryTypeForPincode, normalizePincode, type DeliveryType } from "@/lib/delivery-config"

export type DeliveryZone = {
  zoneId: string
  name: string
  pincodes: string[]
  deliveryType: DeliveryType
  chargePaise: number
  active: boolean
  createdAt: string
  updatedAt: string
}

function nowIso() {
  return new Date().toISOString()
}

function zonesCollection() {
  return getFirebaseAdminDb().collection("deliveryZones")
}

export async function listDeliveryZones() {
  const snapshot = await zonesCollection().orderBy("createdAt", "desc").get()
  return snapshot.docs.map((doc) => doc.data() as DeliveryZone)
}

export async function upsertDeliveryZone(
  zone: Omit<DeliveryZone, "createdAt" | "updatedAt"> & Partial<Pick<DeliveryZone, "createdAt" | "updatedAt">>,
) {
  const now = nowIso()
  const doc: DeliveryZone = {
    ...zone,
    pincodes: zone.pincodes.map((pincode) => normalizePincode(pincode)),
    createdAt: zone.createdAt ?? now,
    updatedAt: now,
  }

  await zonesCollection().doc(zone.zoneId).set(doc, { merge: true })
  return doc
}

export async function deleteDeliveryZone(zoneId: string) {
  await zonesCollection().doc(zoneId).delete()
}

// The authoritative delivery type/charge used at order-creation time.
// Firestore zones (admin-editable) take priority; if none are configured
// yet, this falls back to the hardcoded config in lib/delivery-config.ts so
// checkout keeps working before the admin has set anything up.
export async function resolveAuthoritativeDelivery(pincode: string): Promise<{ type: DeliveryType; chargePaise: number }> {
  const normalized = normalizePincode(pincode)
  const zones = await listDeliveryZones()
  const activeZones = zones.filter((zone) => zone.active)
  const match = activeZones.find((zone) => zone.pincodes.includes(normalized))

  if (match) {
    return { type: match.deliveryType, chargePaise: match.chargePaise }
  }

  if (activeZones.length > 0) {
    // Zones are configured but this pincode isn't in any of them - treat as
    // courier delivery at the standard courier rate rather than silently
    // falling back to the pre-admin-configuration static list.
    return { type: "COURIER", chargePaise: getDeliveryChargePaise("COURIER") }
  }

  const fallbackType = getDeliveryTypeForPincode(normalized) ?? "COURIER"
  return { type: fallbackType, chargePaise: getDeliveryChargePaise(fallbackType) }
}
