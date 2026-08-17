import "server-only"

import type { DecodedIdToken } from "firebase-admin/auth"

import { getFirebaseAdminAuth } from "@/lib/firebase-admin"
import { getEnv } from "@/lib/env"

export type DeliveryActorRole = "admin" | "partner"

export type DeliveryActor = {
  role: DeliveryActorRole
  uid: string
  partnerId?: string
}

function readAuthHeader(request: Request) {
  const authorization = request.headers.get("authorization")

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim()
  }

  return request.headers.get("x-delivery-api-key")?.trim() || ""
}

async function verifyFirebaseToken(token: string): Promise<DecodedIdToken | null> {
  try {
    const auth = getFirebaseAdminAuth()
    return await auth.verifyIdToken(token, true)
  } catch {
    return null
  }
}

async function requireAdminActorFromToken(providedToken: string): Promise<DeliveryActor> {
  const env = getEnv()

  if (!providedToken) {
    throw new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }

  // Check the static API key first - it's a cheap string comparison and
  // covers the common case, avoiding an unnecessary Firebase Admin Auth
  // verifyIdToken() call (which pays a slow cold-start cost the first time
  // it runs in a process) for tokens that were never going to be a valid ID
  // token anyway.
  if (env.DELIVERY_ADMIN_API_KEY && providedToken === env.DELIVERY_ADMIN_API_KEY) {
    return {
      role: "admin",
      uid: "api-key",
    }
  }

  const decoded = await verifyFirebaseToken(providedToken)
  const decodedRecord = decoded as Record<string, unknown> | null

  if (decoded && decodedRecord?.admin === true) {
    return {
      role: "admin",
      uid: decoded.uid,
    }
  }

  throw new Response(JSON.stringify({ error: "Unauthorized." }), {
    status: 403,
    headers: { "content-type": "application/json" },
  })
}

export async function requireAdminActor(request: Request): Promise<DeliveryActor> {
  return requireAdminActorFromToken(readAuthHeader(request))
}

// EventSource (used by the admin order-alerts SSE stream) can't set custom
// headers, so the ID token travels as a query param instead of an
// Authorization header for that one route. Same verification as
// requireAdminActor otherwise.
export async function requireAdminActorFromQueryToken(request: Request): Promise<DeliveryActor> {
  const url = new URL(request.url)
  return requireAdminActorFromToken(url.searchParams.get("token")?.trim() || "")
}

export async function requirePartnerActor(request: Request, partnerId?: string): Promise<DeliveryActor> {
  const env = getEnv()
  const providedToken = readAuthHeader(request)

  if (!providedToken) {
    throw new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }

  // Check the static API key first - it's a cheap string comparison and
  // covers the common case, avoiding an unnecessary Firebase Admin Auth
  // verifyIdToken() call (which pays a slow cold-start cost the first time
  // it runs in a process) for tokens that were never going to be a valid ID
  // token anyway.
  if (env.DELIVERY_PARTNER_API_KEY && providedToken === env.DELIVERY_PARTNER_API_KEY) {
    return {
      role: "partner",
      uid: "api-key",
      partnerId,
    }
  }

  const decoded = await verifyFirebaseToken(providedToken)
  const decodedRecord = decoded as Record<string, unknown> | null
  const tokenPartnerId = (decodedRecord?.partnerId as string | undefined) || decoded?.uid

  if (decoded && (decodedRecord?.admin === true || decodedRecord?.role === "admin")) {
    return {
      role: "partner",
      uid: decoded.uid,
      partnerId: partnerId ?? tokenPartnerId,
    }
  }

  if (partnerId && tokenPartnerId && partnerId !== tokenPartnerId) {
    throw new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }

  if (decoded) {
    return {
      role: "partner",
      uid: decoded.uid,
      partnerId: partnerId ?? tokenPartnerId,
    }
  }

  throw new Response(JSON.stringify({ error: "Unauthorized." }), {
    status: 403,
    headers: { "content-type": "application/json" },
  })
}
