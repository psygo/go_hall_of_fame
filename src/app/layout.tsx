import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import type { ReactNode } from "react"

import { AppShellScreen } from "@/features/auth/presentation/screens/app-shell-screen"

import { LocalizedHtml } from "@/shared/i18n/presentation/localized-html"

import "@/styles/globals.css"

export { siteMetadata as metadata } from "@/shared/ui/presentation/site-metadata"

// Geist is a variable font, so every weight from 100 to 900 is available.
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

// Shippori Mincho is used for four glyphs only (the 碁 seal and the vertical 囲碁殿堂),
// so the font files are subsets of just those characters.
const shipporiSeal = localFont({
  src: [
    {
      path: "./fonts/shippori-mincho-seal-600.woff2",
      weight: "600",
    },
    {
      path: "./fonts/shippori-mincho-seal-800.woff2",
      weight: "800",
    },
  ],
  variable: "--font-shippori-seal",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <LocalizedHtml
      className={`${geist.variable} ${geistMono.variable} ${shipporiSeal.variable}`}
    >
      <body>
        <AppShellScreen>{children}</AppShellScreen>
      </body>
    </LocalizedHtml>
  )
}
