"use client"

const STORAGE_KEY = "lala-sweets-favourites"
const CHANGE_EVENT = "lala-sweets-favourites-change"

function readFavouriteIds() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []

    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

function writeFavouriteIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getFavouriteIds() {
  return readFavouriteIds()
}

export function isFavourite(productId: string) {
  return readFavouriteIds().includes(productId)
}

export function toggleFavourite(productId: string) {
  const ids = readFavouriteIds()
  const nextIds = ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]

  writeFavouriteIds(nextIds)
  return nextIds.includes(productId)
}

export function subscribeToFavourites(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener("storage", listener)

  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener("storage", listener)
  }
}
