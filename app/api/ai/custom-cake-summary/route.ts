import { NextResponse } from "next/server"

import { customCakeSummaryRequestSchema } from "@/features/ai/validations/schemas"
import { createDeterministicCustomCakeSummary } from "@/features/custom-cake-summary/summary"

export async function POST(request: Request) {
  const parsed = customCakeSummaryRequestSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid custom cake request details." }, { status: 400 })
  }

  return NextResponse.json(createDeterministicCustomCakeSummary(parsed.data))
}

