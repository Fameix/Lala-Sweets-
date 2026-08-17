import { NextResponse } from "next/server"

import { listCategories } from "@/lib/products-server"

export async function GET() {
  try {
    const categories = await listCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load categories." },
      { status: 500 },
    )
  }
}
