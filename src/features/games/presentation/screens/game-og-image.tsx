import { gamesLoaders } from "@/config/di"
import { renderOgCard } from "@/shared/ui/presentation/og-card"

/** The share-preview image of a game's page. */
export async function renderGameOgImage({
  params,
}: {
  readonly params: Promise<{ readonly slug: string }>
}) {
  const { slug } = await params
  const { detail } =
    await gamesLoaders.loadGameProfile(slug)
  return renderOgCard({
    eyebrow: `Legendary game · ${detail.year}`,
    title: detail.name,
    description: `${detail.black} vs ${detail.white} · ${detail.result}`,
  })
}
