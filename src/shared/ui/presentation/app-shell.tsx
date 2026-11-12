import type { ReactNode } from "react"

import { SiteFooter } from "./site-footer"
import { SiteNav } from "./site-nav"
import { ThemeProvider } from "./theme-provider"

export function AppShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ThemeProvider>
      <SiteNav />
      <main className="mx-auto box-border w-full max-w-[1200px]">
        {children}
      </main>
      <SiteFooter />
    </ThemeProvider>
  )
}
