// One-time (or repeatable) seed: writes data/catalogue-products.ts's static
// product list into the Firestore `products` collection and derives
// `categories` docs from it. Safe to re-run - it overwrites by product id
// (slug), it does not append duplicates.
//
// Usage: node --env-file=.env.local scripts/seed-catalogue.ts

import { cert, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

import { catalogueProducts } from "../data/catalogue-products.ts"

function requireEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    console.error(`Missing required env var ${name}. Set it in .env.local before running this script.`)
    process.exit(1)
  }

  return value
}

const serviceAccountKeyRaw = requireEnv("FIREBASE_SERVICE_ACCOUNT_KEY")
const serviceAccount = JSON.parse(serviceAccountKeyRaw) as {
  project_id: string
  client_email: string
  private_key: string
}

initializeApp({
  credential: cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
  }),
})

const db = getFirestore()

function categorySlug(category: string) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function main() {
  console.log(`Seeding ${catalogueProducts.length} products...`)

  const productsBatch = db.batch()
  const categories = new Map<string, string>()

  for (const product of catalogueProducts) {
    const id = product.slug
    const ref = db.collection("products").doc(id)
    productsBatch.set(ref, { ...product, id }, { merge: true })
    categories.set(categorySlug(product.normalized_category), product.normalized_category)
  }

  await productsBatch.commit()
  console.log("Products written.")

  const categoriesBatch = db.batch()
  for (const [slug, name] of categories) {
    categoriesBatch.set(db.collection("categories").doc(slug), { slug, name }, { merge: true })
  }

  await categoriesBatch.commit()
  console.log(`Categories written: ${categories.size}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
