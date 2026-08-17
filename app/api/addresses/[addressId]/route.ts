import { NextResponse } from "next/server"

import { addressUpdateSchema } from "@/lib/address-schema"
import type { Address } from "@/lib/address-types"
import { requireCustomerUid } from "@/lib/customer-auth"
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin"

function addressesCollection() {
  return getFirebaseAdminFirestore().collection("addresses")
}

export async function PATCH(request: Request, context: { params: Promise<{ addressId: string }> }) {
  try {
    const uid = await requireCustomerUid(request)
    const { addressId } = await context.params
    const parsed = addressUpdateSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid address details." }, { status: 400 })
    }

    const ref = addressesCollection().doc(addressId)
    const snapshot = await ref.get()

    if (!snapshot.exists || (snapshot.data() as Address).customerId !== uid) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 })
    }

    await ref.set(parsed.data, { merge: true })
    const updated = await ref.get()

    return NextResponse.json({ address: updated.data() as Address })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json({ error: "Unable to update address." }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ addressId: string }> }) {
  try {
    const uid = await requireCustomerUid(request)
    const { addressId } = await context.params

    const ref = addressesCollection().doc(addressId)
    const snapshot = await ref.get()

    if (!snapshot.exists || (snapshot.data() as Address).customerId !== uid) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 })
    }

    await ref.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json({ error: "Unable to delete address." }, { status: 500 })
  }
}
