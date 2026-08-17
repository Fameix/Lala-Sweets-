import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { deleteCategory, upsertCategory } from "@/lib/products-server"

const categoryUpdateSchema = z.object({
  name: z.string().min(1),
})

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const parsed = categoryUpdateSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category details." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)
    const category = await upsertCategory({ slug: id, name: parsed.data.name })
    return NextResponse.json({ category })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update category." },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    await requireAdminActor(request)
    await deleteCategory(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete category." },
      { status: 500 },
    )
  }
}
