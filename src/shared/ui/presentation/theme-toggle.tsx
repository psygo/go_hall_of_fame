"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

const subscribeNothing = () => () => {}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isMounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )
  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      className="btn btn-secondary"
      aria-label="Switch between light and dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isMounted ? (isDark ? "Light" : "Dark") : "Theme"}
    </button>
  )
}
