import { Geist } from "next/font/google"
import type { ReactNode } from "react"

import { AppShell } from "@/shared/ui/presentation/app-shell"

import "@/styles/globals.css"

export { siteMetadata as metadata } from "@/shared/ui/presentation/site-metadata"

// Geist is a variable font, so every weight from 100 to 900 is available.
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="en"
      className={geist.variable}
      suppressHydrationWarning
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
