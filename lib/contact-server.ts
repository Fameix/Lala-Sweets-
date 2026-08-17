import "server-only"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"

export type ContactInquiry = {
  id: string
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
  status: "NEW" | "READ"
}

function nowIso() {
  return new Date().toISOString()
}

function inquiriesCollection() {
  return getFirebaseAdminDb().collection("contactInquiries")
}

export async function createContactInquiry(input: { name: string; email: string; phone: string; message: string }) {
  const ref = inquiriesCollection().doc()
  const inquiry: ContactInquiry = {
    id: ref.id,
    ...input,
    createdAt: nowIso(),
    status: "NEW",
  }

  await ref.set(inquiry)
  return inquiry
}

export async function listContactInquiries() {
  const snapshot = await inquiriesCollection().orderBy("createdAt", "desc").limit(200).get()
  return snapshot.docs.map((doc) => doc.data() as ContactInquiry)
}

export async function markContactInquiryRead(id: string) {
  await inquiriesCollection().doc(id).set({ status: "READ" }, { merge: true })
}
