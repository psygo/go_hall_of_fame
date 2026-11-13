import { renderOgCard } from "@/shared/ui/presentation/og-card"

export const alt = "Resources"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return renderOgCard({
    eyebrow: "Further reading",
    title: "Resources",
    description:
      "Books, sites and tools for learning and following the game of Go.",
  })
}
