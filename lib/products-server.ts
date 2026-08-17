import "server-only"

import type { Firestore } from "firebase-admin/firestore"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"
import type { ProductWriteInput } from "@/lib/products-schema"
import type { CategorySummary, Product } from "@/types/catalogue"

function nowIso() {
  return new Date().toISOString()
}

// Fills in the extraction-pipeline-only fields (verification_status,
// source_*, etc.) that don't apply to products authored directly in the
// admin dashboard, so the resulting doc still satisfies the full Product
// shape shared with the original menu-import pipeline.
export function buildProductFromWriteInput(id: string, input: ProductWriteInput, existing?: Product | null): Product {
  const now = nowIso()

  return {
    id,
    source_name: existing?.source_name ?? input.display_name,
    display_name: input.display_name,
    name: input.display_name,
    slug: input.slug,
    source_category: existing?.source_category ?? input.normalized_category,
    normalized_category: input.normalized_category,
    category: input.normalized_category,
    short_description: input.short_description,
    long_description: input.long_description,
    description: input.long_description,
    food_type: existing?.food_type ?? "vegetarian",
    egg_status: existing?.egg_status ?? "eggless",
    allergen_information: existing?.allergen_information ?? [],
    image: input.image || existing?.image || "",
    price: input.price_paise !== null ? input.price_paise / 100 : undefined,
    price_paise: input.price_paise,
    compare_at_price_paise: input.compare_at_price_paise,
    size_variants: input.size_variants,
    price_status: "approved",
    availability_status: input.is_active ? "available" : "unavailable",
    stock_status: input.stock_status,
    stock_quantity: input.stock_quantity,
    availableSizes: input.size_variants.map((variant) => variant.label),
    verification_status: existing?.verification_status ?? "menu-image-confirmed",
    image_status: existing?.image_status ?? (input.image ? "client-provided" : "missing"),
    source_asset: existing?.source_asset ?? "admin-dashboard",
    extraction_notes: existing?.extraction_notes ?? "",
    preparation_minutes: existing?.preparation_minutes ?? null,
    is_featured: input.is_featured,
    is_active: input.is_active,
    is_orderable: input.is_orderable,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  }
}

function productsCollection(db: Firestore) {
  return db.collection("products")
}

function categoriesCollection(db: Firestore) {
  return db.collection("categories")
}

function stockHistoryCollection(db: Firestore, productId: string) {
  return productsCollection(db).doc(productId).collection("stockHistory")
}

export function categorySlug(category: string) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function listProducts(options: { includeInactive?: boolean } = {}) {
  const db = getFirebaseAdminDb()
  const snapshot = await productsCollection(db).get()
  const products = snapshot.docs.map((doc) => doc.data() as Product)

  return options.includeInactive ? products : products.filter((product) => product.is_active)
}

export async function getProductById(productId: string) {
  const db = getFirebaseAdminDb()
  const snapshot = await productsCollection(db).doc(productId).get()
  return snapshot.exists ? (snapshot.data() as Product) : null
}

export async function getProductBySlug(slug: string) {
  const db = getFirebaseAdminDb()
  const snapshot = await productsCollection(db).where("slug", "==", slug).limit(1).get()

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].data() as Product
}

export async function createProduct(product: Product) {
  const db = getFirebaseAdminDb()
  const now = nowIso()
  const doc: Product = { ...product, created_at: product.created_at || now, updated_at: now }

  await productsCollection(db).doc(product.id).set(doc)
  return doc
}

export async function updateProduct(productId: string, patch: Partial<Product>) {
  const db = getFirebaseAdminDb()
  const ref = productsCollection(db).doc(productId)
  const existing = await ref.get()

  if (!existing.exists) {
    return null
  }

  const updated: Product = { ...(existing.data() as Product), ...patch, id: productId, updated_at: nowIso() }
  await ref.set(updated, { merge: true })
  return updated
}

export async function setProductActive(productId: string, isActive: boolean) {
  return updateProduct(productId, { is_active: isActive })
}

export async function adjustStock(productId: string, deltaGrams: number, reason: string) {
  const db = getFirebaseAdminDb()
  const ref = productsCollection(db).doc(productId)

  const updated = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists) {
      return null
    }

    const product = snapshot.data() as Product
    const currentQuantity = product.stock_quantity ?? 0
    const nextQuantity = Math.max(0, currentQuantity + deltaGrams)
    const stockStatus: Product["stock_status"] = nextQuantity <= 0 ? "out-of-stock" : nextQuantity <= 10 ? "limited" : "in-stock"

    const next: Product = {
      ...product,
      stock_quantity: nextQuantity,
      stock_status: stockStatus,
      updated_at: nowIso(),
    }

    transaction.set(ref, next, { merge: true })
    return next
  })

  if (updated) {
    await stockHistoryCollection(db, productId).add({
      delta: deltaGrams,
      reason,
      resultingQuantity: updated.stock_quantity ?? 0,
      createdAt: nowIso(),
    })
  }

  return updated
}

export async function listCategories(): Promise<CategorySummary[]> {
  const db = getFirebaseAdminDb()
  const [categorySnapshot, products] = await Promise.all([
    categoriesCollection(db).orderBy("name").get(),
    listProducts(),
  ])

  // productCount is derived at read time rather than stored, so it can never
  // go stale relative to the products collection it's counting.
  const countsBySlug = new Map<string, number>()
  for (const product of products) {
    const slug = categorySlug(product.category ?? product.normalized_category)
    countsBySlug.set(slug, (countsBySlug.get(slug) ?? 0) + 1)
  }

  return categorySnapshot.docs.map((doc) => {
    const category = doc.data() as CategorySummary
    return { ...category, productCount: countsBySlug.get(category.slug) ?? 0 }
  })
}

export async function upsertCategory(category: Omit<CategorySummary, "productCount">) {
  const db = getFirebaseAdminDb()
  await categoriesCollection(db).doc(category.slug).set(category, { merge: true })
  return category
}

export async function deleteCategory(slug: string) {
  const db = getFirebaseAdminDb()
  await categoriesCollection(db).doc(slug).delete()
}

export async function deleteProduct(productId: string) {
  const db = getFirebaseAdminDb()
  await productsCollection(db).doc(productId).delete()
}
