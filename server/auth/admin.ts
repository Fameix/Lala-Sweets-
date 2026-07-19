export function canPreviewAdmin() {
  return process.env.ADMIN_PREVIEW_ENABLED === "true"
}
