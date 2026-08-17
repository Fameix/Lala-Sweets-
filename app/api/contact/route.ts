import { NextResponse } from "next/server"
import { z } from "zod"

import { createContactInquiry } from "@/lib/contact-server"

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().default(""),
  phone: z.string().min(1),
  message: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in your name, phone, and message." }, { status: 400 })
  }

  try {
    await createContactInquiry(parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit your message. Please call or WhatsApp us instead." },
      { status: 500 },
    )
  }
}
