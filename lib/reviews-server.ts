import "server-only"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"

export type Review = {
  id: string
  customerName: string
  rating: number
  comment: string
  productId: string | null
  productName: string | null
  createdAt: string
  hidden: boolean
}

function reviewsCollection() {
  return getFirebaseAdminDb().collection("reviews")
}

export async function listReviews() {
  const snapshot = await reviewsCollection().orderBy("createdAt", "desc").limit(200).get()
  return snapshot.docs.map((doc) => doc.data() as Review)
}

export async function setReviewVisibility(id: string, hidden: boolean) {
  await reviewsCollection().doc(id).set({ hidden }, { merge: true })
}
