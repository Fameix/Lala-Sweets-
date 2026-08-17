export function getPublicSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    return configured.replace(/\/+$/, "")
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return "http://localhost:3000"
}

export function buildPublicUrl(pathname: string) {
  const baseUrl = getPublicSiteUrl()
  return new URL(pathname, `${baseUrl}/`).toString()
}
