import { playersLoaders } from "@/config/di"
import { renderOgCard } from "@/shared/ui/presentation/og-card"

/** The share-preview image of a player's page. */
export async function renderPlayerOgImage({
  params,
}: {
  readonly params: Promise<{ readonly slug: string }>
}) {
  const { slug } = await params
  const { detail } =
    await playersLoaders.loadPlayerProfile(slug)
  return renderOgCard({
    eyebrow: `Legendary player · ${detail.country}`,
    title: detail.name,
    description: `${detail.years} · ${detail.distinction}`,
  })
}
