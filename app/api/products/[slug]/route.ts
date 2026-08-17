import { NextResponse } from "next/server"

import { getProductBySlug } from "@/lib/products-server"

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    const product = await getProductBySlug(slug)

    if (!product || !product.is_active) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load product." },
      { status: 500 },
    )
  }
}
