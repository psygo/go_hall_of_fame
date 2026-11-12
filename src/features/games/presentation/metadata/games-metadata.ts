import type { Metadata } from "next"

import { gamesLoaders } from "@/config/di"

export const gamesMetadata: Metadata = {
  title: "Legendary games",
  description:
    "Games that stopped the room and rewrote theory, from Edo castle to AlphaGo.",
}

export async function generateGameMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { detail } =
    await gamesLoaders.loadGameProfile(slug)
  return { title: detail.name, description: detail.hook }
}
