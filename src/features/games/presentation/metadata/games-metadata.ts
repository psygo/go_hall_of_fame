import type { Metadata } from "next"

import { gamesLoaders } from "@/config/di"
import { stripMarkdown } from "@/core/markdown"
import { pageMetadata } from "@/shared/ui/presentation/site-metadata"

export const gamesMetadata: Metadata = pageMetadata({
  title: "Legendary games",
  description:
    "Games that stopped the room and rewrote theory, from Edo castle to AlphaGo.",
})

export async function generateGameMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { detail } =
    await gamesLoaders.loadGameProfile(slug)
  return pageMetadata({
    title: detail.name,
    description: stripMarkdown(detail.hook),
  })
}
