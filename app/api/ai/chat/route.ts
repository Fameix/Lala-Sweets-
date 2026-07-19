import { NextResponse } from "next/server"

import { getAIProvider } from "@/features/ai/server/provider"
import { aiChatRequestSchema } from "@/features/ai/validations/schemas"

export async function POST(request: Request) {
  const parsed = aiChatRequestSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assistant request." }, { status: 400 })
  }

  const provider = getAIProvider()
  const response = await provider.generateAssistantResponse(parsed.data)

  return NextResponse.json(response)
}

