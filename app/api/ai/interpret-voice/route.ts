import { NextResponse } from "next/server"

import { getAIProvider } from "@/features/ai/server/provider"
import { voiceInterpretRequestSchema } from "@/features/ai/validations/schemas"

export async function POST(request: Request) {
  const parsed = voiceInterpretRequestSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid voice transcript." }, { status: 400 })
  }

  const provider = getAIProvider()
  return NextResponse.json(await provider.interpretVoiceTranscript(parsed.data))
}

