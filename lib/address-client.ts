"use client"

import { getFirebaseAuth } from "@/lib/firebase-client-auth"
import type { Address } from "@/lib/address-types"

async function authHeaders() {
  const user = getFirebaseAuth().currentUser

  if (!user) {
    throw new Error("Not signed in.")
  }

  const token = await user.getIdToken()
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export async function upsertCustomerProfile(input: { name?: string; mobile: string }) {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error("Unable to save your profile.")
  }
}

export async function listSavedAddresses(): Promise<Address[]> {
  const response = await fetch("/api/addresses", {
    headers: await authHeaders(),
  })
  const result = (await response.json()) as { addresses?: Address[]; error?: string }

  if (!response.ok) {
    throw new Error(result.error ?? "Unable to load saved addresses.")
  }

  return result.addresses ?? []
}

export async function saveNewAddress(input: {
  label: string
  name: string
  mobile: string
  line1: string
  city: string
  pincode: string
  isDefault?: boolean
}): Promise<Address> {
  const response = await fetch("/api/addresses", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  })
  const result = (await response.json()) as { address?: Address; error?: string }

  if (!response.ok || !result.address) {
    throw new Error(result.error ?? "Unable to save address.")
  }

  return result.address
}
