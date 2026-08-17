import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { productWriteSchema } from "@/lib/products-schema"
import { buildProductFromWriteInput, categorySlug, getProductById, updateProduct, upsertCategory } from "@/lib/products-server"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    await requireAdminActor(request)
    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load product." },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const parsed = productWriteSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product details.", issues: parsed.error.issues }, { status: 400 })
  }

  try {
    await requireAdminActor(request)

    const existing = await getProductById(id)
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    const nextProduct = buildProductFromWriteInput(id, parsed.data, existing)
    await updateProduct(id, nextProduct)
    await upsertCategory({ slug: categorySlug(nextProduct.category ?? nextProduct.normalized_category), name: nextProduct.normalized_category })

    return NextResponse.json({ product: nextProduct })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    await requireAdminActor(request)
    // Soft delete only - orders that reference this product by id/slug must
    // keep resolving it for historical order detail pages.
    const updated = await updateProduct(id, { is_active: false, availability_status: "unavailable" })

    if (!updated) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ product: updated })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete product." },
      { status: 500 },
    )
  }
}
