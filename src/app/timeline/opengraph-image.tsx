import { renderOgCard } from "@/shared/ui/presentation/og-card"

export const alt = "Timeline"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return renderOgCard({
    eyebrow: "2500+ years of Go",
    title: "Timeline",
    description:
      "Centuries of Go, from the Edo academy to the age of AI.",
  })
}
