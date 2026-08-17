import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { getFirebaseAdminAuth } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)

    const auth = getFirebaseAdminAuth()
    const admins: { uid: string; email: string | null; createdAt: string }[] = []
    let pageToken: string | undefined

    do {
      const page = await auth.listUsers(1000, pageToken)

      for (const user of page.users) {
        if (user.customClaims?.admin === true) {
          admins.push({ uid: user.uid, email: user.email ?? null, createdAt: user.metadata.creationTime })
        }
      }

      pageToken = page.pageToken
    } while (pageToken)

    return NextResponse.json({ admins })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load admin users." },
      { status: 500 },
    )
  }
}
