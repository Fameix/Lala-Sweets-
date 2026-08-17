import { NextResponse } from "next/server"
import { z } from "zod"

import { requireCustomerUid } from "@/lib/customer-auth"
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin"

const upsertCustomerSchema = z.object({
  name: z.string().optional(),
  mobile: z.string().min(1),
})

function customersCollection() {
  return getFirebaseAdminFirestore().collection("customers")
}

export async function GET(request: Request) {
  try {
    const uid = await requireCustomerUid(request)
    const snapshot = await customersCollection().doc(uid).get()

    return NextResponse.json({ customer: snapshot.exists ? snapshot.data() : null })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json({ error: "Unable to load customer." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const uid = await requireCustomerUid(request)
    const parsed = upsertCustomerSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid customer payload." }, { status: 400 })
    }

    const ref = customersCollection().doc(uid)
    const existing = await ref.get()
    const now = new Date().toISOString()

    const customer = {
      uid,
      mobile: parsed.data.mobile,
      name: parsed.data.name ?? existing.data()?.name ?? "",
      createdAt: (existing.exists ? existing.data()?.createdAt : undefined) ?? now,
    }

    await ref.set(customer, { merge: true })

    return NextResponse.json({ customer })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json({ error: "Unable to save customer." }, { status: 500 })
  }
}
