import { Shippori_Mincho } from "next/font/google"
import type { ReactNode } from "react"

import { AppShell } from "@/shared/ui/presentation/app-shell"

import "@/styles/globals.css"

export { siteMetadata as metadata } from "@/shared/ui/presentation/site-metadata"

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "800"],
  variable: "--font-shippori",
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
      className={shipporiMincho.variable}
      suppressHydrationWarning
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
