"use client"

let loaderPromise: Promise<typeof google> | null = null

export function loadGoogleMaps(apiKey: string): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google)
  }

  if (loaderPromise) {
    return loaderPromise
  }

  loaderPromise = new Promise((resolve, reject) => {
    function handleReady() {
      if (window.google?.maps) {
        resolve(window.google)
      } else {
        reject(new Error("Google Maps failed to initialize."))
      }
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-google-maps-loader]")

    if (existingScript) {
      existingScript.addEventListener("load", handleReady, { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), { once: true })
      return
    }

    const script = document.createElement("script")
    // NOTE: intentionally NOT passing loading=async. With that flag, Google's
    // classes (Map, Marker, DirectionsService, etc.) become lazy-loaded and
    // only become available after an explicit google.maps.importLibrary()
    // call per library - the rest of this codebase (live-delivery-map.tsx)
    // accesses window.google.maps.Map/Marker/... directly, which throws
    // "is not a constructor" under async loading. The console warning about
    // missing loading=async is cosmetic; this keeps the map functional.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=geometry`
    script.async = true
    script.defer = true
    script.dataset.googleMapsLoader = "true"
    script.addEventListener("load", handleReady, { once: true })
    script.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), { once: true })
    document.head.appendChild(script)
  })

  return loaderPromise
}
