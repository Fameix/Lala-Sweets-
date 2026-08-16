import "server-only"

import { verifyFirebaseAdminConnection } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const result = await verifyFirebaseAdminConnection()

  if (result.initialized) {
    return Response.json(result, { status: 200 })
  }

  return Response.json(result, { status: 500 })
}
