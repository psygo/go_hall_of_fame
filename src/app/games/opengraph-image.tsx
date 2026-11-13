import { renderOgCard } from "@/shared/ui/presentation/og-card"

export const alt = "Legendary Games"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return renderOgCard({
    eyebrow: "The record",
    title: "Legendary Games",
    description:
      "Games that stopped the room and rewrote theory, from Edo castle to AlphaGo.",
  })
}
