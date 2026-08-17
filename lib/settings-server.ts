import "server-only"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"

export type StoreSettings = {
  name: string
  address: string
  phone: string
  email: string
  updatedAt: string
}

const defaultStoreSettings: StoreSettings = {
  name: "Sri Lakshmivilas Purathana Lala Sweets",
  address: "101/1, North Bypass Road, Vannarpettai, Tirunelveli, Tamil Nadu 627003, India",
  phone: "+91 82202 66077",
  email: "srilakshmivilassweets.tvl@gmail.com",
  updatedAt: new Date(0).toISOString(),
}

function settingsDoc() {
  return getFirebaseAdminDb().collection("settings").doc("store")
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const snapshot = await settingsDoc().get()
  return snapshot.exists ? (snapshot.data() as StoreSettings) : defaultStoreSettings
}

export async function updateStoreSettings(patch: Omit<StoreSettings, "updatedAt">): Promise<StoreSettings> {
  const settings: StoreSettings = { ...patch, updatedAt: new Date().toISOString() }
  await settingsDoc().set(settings, { merge: true })
  return settings
}
