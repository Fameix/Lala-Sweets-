import "server-only"

import type { DecodedIdToken } from "firebase-admin/auth"

import { getFirebaseAdminAuth } from "@/lib/firebase-admin"
import { getEnv } from "@/lib/env"
import { canPreviewAdmin } from "@/server/auth/admin"

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

// Gates the /api/admin/* delivery routes, which are only ever called from the
// already env-gated /admin UI (see server/auth/admin.ts + app/admin/layout.tsx).
// This matches the trust boundary the rest of the admin section already uses,
// instead of shipping the DELIVERY_ADMIN_API_KEY secret to the browser.
export function requireAdminPreview() {
  if (!canPreviewAdmin()) {
    throw new Response(JSON.stringify({ error: "Admin preview is disabled." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }
}

export async function requireAdminActor(request: Request): Promise<DeliveryActor> {
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
  if (env.DELIVERY_ADMIN_API_KEY && providedToken === env.DELIVERY_ADMIN_API_KEY) {
    return {
      role: "admin",
      uid: "api-key",
    }
  }

  const decoded = await verifyFirebaseToken(providedToken)
  const decodedRecord = decoded as Record<string, unknown> | null

  if (decoded && (decodedRecord?.admin === true || decodedRecord?.role === "admin")) {
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
