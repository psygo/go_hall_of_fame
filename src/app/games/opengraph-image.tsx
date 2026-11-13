import { renderOgCard } from "@/shared/ui/presentation/og-card"

export const alt = "Legendary games"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return renderOgCard({
    eyebrow: "The record",
    title: "Legendary games",
    description:
      "Games that stopped the room and rewrote theory, from Edo castle to AlphaGo.",
  })
}
