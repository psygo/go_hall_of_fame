import type { Metadata } from "next"

import { playersLoaders } from "@/config/di"
import { stripMarkdown } from "@/core/markdown"
import { pageMetadata } from "@/shared/ui/presentation/site-metadata"

export const playersMetadata: Metadata = pageMetadata({
  title: "Legendary players",
  description:
    "The players who shaped the game of Go, from Honinbo Dosaku to Shin Jinseo.",
})

export async function generatePlayerMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { detail } =
    await playersLoaders.loadPlayerProfile(slug)
  return pageMetadata({
    title: detail.name,
    description: stripMarkdown(detail.bio),
  })
}
