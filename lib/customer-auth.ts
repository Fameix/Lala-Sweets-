import "server-only"

import { getFirebaseAdminAuth } from "@/lib/firebase-admin"

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : ""
}

// Verifies the Firebase ID token issued after phone-OTP sign-in so a
// customer can only ever read/write their own customers/{uid} doc and their
// own addresses - never someone else's. Every /api/customers and
// /api/addresses route requires this.
export async function requireCustomerUid(request: Request): Promise<string> {
  const token = readBearerToken(request)

  if (!token) {
    throw new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token)
    return decoded.uid
  } catch {
    throw new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }
}
