import type { ReactNode } from "react"

import { directionOf } from "@/core/locales"

import { getLocale } from "./server-locale"

/** The root `<html>` element, with the visitor's language and writing direction. */
export async function LocalizedHtml({
  className,
  children,
}: {
  readonly className: string
  readonly children: ReactNode
}) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </html>
  )
}
