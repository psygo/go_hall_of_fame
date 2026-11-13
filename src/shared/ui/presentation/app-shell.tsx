import type { ReactNode } from "react"

import { LocaleProvider } from "@/shared/i18n/presentation/locale-provider"
import { getLocale } from "@/shared/i18n/presentation/server-locale"
import { MESSAGES } from "@/shared/i18n/presentation/messages"

import { SiteFooter } from "./site-footer"
import { SiteNav } from "./site-nav"
import { ThemeProvider } from "./theme-provider"
import type { NavAdmin } from "./user-menu"

type AppShellProps = {
  readonly admin: NavAdmin | null
  readonly signOut: () => Promise<void>
  readonly children: ReactNode
}

export async function AppShell({
  admin,
  signOut,
  children,
}: AppShellProps) {
  const locale = await getLocale()

  return (
    <ThemeProvider>
      <LocaleProvider
        locale={locale}
        messages={MESSAGES[locale]}
      >
        <SiteNav admin={admin} signOut={signOut} />
        <main className="mx-auto box-border w-full max-w-[1200px]">
          {children}
        </main>
        <SiteFooter />
      </LocaleProvider>
    </ThemeProvider>
  )
}
