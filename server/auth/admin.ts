export function canPreviewAdmin() {
  return process.env.ADMIN_PREVIEW_ENABLED === "true" || process.env.NODE_ENV !== "production"
}
