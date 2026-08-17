import { NextResponse } from "next/server"

import { listProducts } from "@/lib/products-server"

export async function GET() {
  try {
    const products = await listProducts()
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load products." },
      { status: 500 },
    )
  }
}
