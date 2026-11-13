import { renderOgCard } from "@/shared/ui/presentation/og-card"

export const alt = "Legendary Players"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return renderOgCard({
    eyebrow: "The Hall",
    title: "Legendary Players",
    description:
      "The players who shaped the game of Go, from Honinbo Dosaku to Shin Jinseo.",
  })
}
