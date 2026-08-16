import type { MetadataRoute } from "next"

import { getCategories, getProducts } from "@/lib/catalogue"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.lalasweets.in"
  const staticRoutes = ["", "/about", "/menu", "/contact", "/search"]
  const categoryRoutes = getCategories().map((category) => `/category/${category.slug}`)
  const productRoutes = getProducts().map((product) => `/product/${product.slug}`)

  return [...staticRoutes, ...categoryRoutes, ...productRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))
}
