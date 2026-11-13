import { renderOgCard } from "@/shared/ui/presentation/og-card"

export const alt = "Induction"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return renderOgCard({
    eyebrow: "How a name enters",
    title: "Induction",
    description:
      "How a name enters the Hall, and how to nominate a player or a game.",
  })
}
