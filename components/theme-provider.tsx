"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

const storageKey = "lala-sweets-theme"

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
  document.documentElement.style.colorScheme = resolvedTheme
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system"
  }

  const storedTheme = window.localStorage.getItem(storageKey)
  return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system"
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(getStoredTheme)

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, theme)
    applyTheme(theme)
  }, [theme])

  React.useEffect(() => {
    if (theme !== "system") {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyTheme("system")

    mediaQuery.addEventListener("change", onChange)

    return () => {
      mediaQuery.removeEventListener("change", onChange)
    }
  }, [theme])

  return (
    <>
      <ThemeHotkey theme={theme} setTheme={setTheme} />
      {children}
    </>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey({
  theme,
  setTheme,
}: {
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
}) {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (!event.key || event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      const resolvedTheme = theme === "system" ? getSystemTheme() : theme
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [theme, setTheme])

  return null
}

export { ThemeProvider }
