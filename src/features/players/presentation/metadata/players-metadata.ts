import type { Metadata } from "next"

import { playersLoaders } from "@/config/di"

export const playersMetadata: Metadata = {
  title: "Legendary players",
  description:
    "The players who shaped the game of Go, from Honinbo Dosaku to Shin Jinseo.",
}

export async function generatePlayerMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { detail } =
    await playersLoaders.loadPlayerProfile(slug)
  return { title: detail.name, description: detail.bio }
}
