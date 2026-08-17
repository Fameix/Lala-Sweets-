import { NextResponse } from "next/server"

import { addressInputSchema } from "@/lib/address-schema"
import type { Address } from "@/lib/address-types"
import { requireCustomerUid } from "@/lib/customer-auth"
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin"

function addressesCollection() {
  return getFirebaseAdminFirestore().collection("addresses")
}

export async function GET(request: Request) {
  try {
    const uid = await requireCustomerUid(request)
    const snapshot = await addressesCollection().where("customerId", "==", uid).get()
    const addresses = snapshot.docs
      .map((doc) => doc.data() as Address)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

    return NextResponse.json({ addresses })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json({ error: "Unable to load addresses." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const uid = await requireCustomerUid(request)
    const parsed = addressInputSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid address details." }, { status: 400 })
    }

    const ref = addressesCollection().doc()
    const address: Address = {
      id: ref.id,
      customerId: uid,
      label: parsed.data.label,
      name: parsed.data.name,
      mobile: parsed.data.mobile,
      line1: parsed.data.line1,
      city: parsed.data.city,
      pincode: parsed.data.pincode,
      isDefault: parsed.data.isDefault ?? false,
      createdAt: new Date().toISOString(),
    }

    await ref.set(address)

    return NextResponse.json({ address })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json({ error: "Unable to save address." }, { status: 500 })
  }
}
