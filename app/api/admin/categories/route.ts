import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { listCategories, upsertCategory } from "@/lib/products-server"

const categorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  name: z.string().min(1),
})

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const categories = await listCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load categories." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const parsed = categorySchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category details." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)
    const category = await upsertCategory(parsed.data)
    return NextResponse.json({ category })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save category." },
      { status: 500 },
    )
  }
}
