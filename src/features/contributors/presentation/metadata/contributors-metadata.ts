import type { Metadata } from "next"

import { contributorsLoaders } from "@/config/di"
import { stripMarkdown } from "@/core/markdown"
import { pageMetadata } from "@/shared/ui/presentation/site-metadata"

export const contributorsMetadata: Metadata = pageMetadata({
  title: "Game Contributors",
  description:
    "The people and organizations that advanced the game of Go without being legendary players.",
})

export async function generateContributorMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const contributor =
    await contributorsLoaders.loadContributor(slug)
  return pageMetadata({
    title: contributor.name,
    description: stripMarkdown(contributor.bio),
  })
}
