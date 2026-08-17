import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { listContactInquiries } from "@/lib/contact-server"

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const inquiries = await listContactInquiries()
    return NextResponse.json({ inquiries })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load messages." },
      { status: 500 },
    )
  }
}
