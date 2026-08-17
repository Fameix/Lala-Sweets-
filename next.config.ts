import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // Dev-only allowlist for accessing the Next.js dev server from a different
  // host (e.g. testing the delivery partner page from a phone on the same
  // LAN). If the terminal logs "Cross origin request detected" when opening
  // the app from a LAN IP such as http://192.168.1.42:3000, add that exact
  // IP to this array.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.9",
    "192.168.1.15",
    "192.168.1.18",
    "192.168.1.20",
    "banana-reservations-side-exposed.trycloudflare.com",
    "volunteer-issn-conversations-debug.trycloudflare.com",
    "direct-based-car-downtown.trycloudflare.com",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
}

export default nextConfig
