import type { MetadataRoute } from "next"

import { getCategories, getProducts } from "@/lib/catalogue-server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.lalasweets.in"
  const staticRoutes = ["", "/about", "/menu", "/contact", "/search"]
  const [categories, products] = await Promise.all([getCategories(), getProducts()])
  const categoryRoutes = categories.map((category) => `/category/${category.slug}`)
  const productRoutes = products.map((product) => `/product/${product.slug}`)

  return [...staticRoutes, ...categoryRoutes, ...productRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))
}
