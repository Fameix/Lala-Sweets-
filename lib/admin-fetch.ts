"use client"

import { getFirebaseAuth } from "@/lib/firebase-client-auth"

// Attaches the signed-in admin's Firebase ID token to every admin API call.
// Server routes verify this token (and its `admin: true` custom claim) via
// requireAdminActor() - this helper only exists so admin pages don't each
// re-implement "grab the current token and set the header".
export async function adminFetch(input: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser

  if (!user) {
    throw new Error("Not signed in as admin.")
  }

  const token = await user.getIdToken()
  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${token}`)

  return fetch(input, { ...init, headers })
}

export async function getAdminIdToken() {
  const user = getFirebaseAuth().currentUser

  if (!user) {
    throw new Error("Not signed in as admin.")
  }

  return user.getIdToken()
}
