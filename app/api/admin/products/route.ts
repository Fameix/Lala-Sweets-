import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { productWriteSchema } from "@/lib/products-schema"
import { buildProductFromWriteInput, categorySlug, createProduct, getProductBySlug, listProducts, upsertCategory } from "@/lib/products-server"

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const products = await listProducts({ includeInactive: true })
    return NextResponse.json({ products })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load products." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const parsed = productWriteSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product details.", issues: parsed.error.issues }, { status: 400 })
  }

  try {
    await requireAdminActor(request)

    const existingBySlug = await getProductBySlug(parsed.data.slug)
    if (existingBySlug) {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 })
    }

    const product = buildProductFromWriteInput(parsed.data.slug, parsed.data)
    await createProduct(product)
    await upsertCategory({ slug: categorySlug(product.category ?? product.normalized_category), name: product.normalized_category })

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product." },
      { status: 500 },
    )
  }
}
