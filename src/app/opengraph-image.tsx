import { renderOgCard } from "@/shared/ui/presentation/og-card"

export const alt = "Go | Hall of Fame"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return renderOgCard({
    eyebrow: "The Hall of Fame of Go",
    title: "Legendary players and legendary games",
    description:
      "From the Edo castle matches to AlphaGo in Seoul.",
  })
}
