import type { ReactNode } from "react"

import { SiteFooter } from "./site-footer"
import { SiteNav } from "./site-nav"
import { ThemeProvider } from "./theme-provider"
import type { NavAdmin } from "./user-menu"

type AppShellProps = {
  readonly admin: NavAdmin | null
  readonly signOut: () => Promise<void>
  readonly children: ReactNode
}

export function AppShell({
  admin,
  signOut,
  children,
}: AppShellProps) {
  return (
    <ThemeProvider>
      <SiteNav admin={admin} signOut={signOut} />
      <main className="mx-auto box-border w-full max-w-[1200px]">
        {children}
      </main>
      <SiteFooter />
    </ThemeProvider>
  )
}
