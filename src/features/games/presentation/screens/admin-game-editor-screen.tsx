import { gamesAdminState } from "@/config/di"
import { AdminSection } from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { GameForm } from "../components/game-form"

type AdminGameEditorScreenProps = {
  readonly params: Promise<{ readonly slug: string }>
}

export async function AdminGameEditorScreen({
  params,
}: AdminGameEditorScreenProps) {
  const { slug } = await params
  const { game, playerOptions } =
    await gamesAdminState.loadEditor(slug)

  return (
    <>
      <PageHeader
        eyebrow="Admin · Games"
        title={game === null ? "New game" : game.name}
      />
      <AdminSection>
        <GameForm
          slugParam={slug}
          playerOptions={playerOptions}
          hasUploadedSgf={game?.hasUploadedSgf ?? false}
          initial={{
            slug: game?.slug ?? "",
            year: game === null ? "" : String(game.year),
            name: game?.name ?? "",
            black: game?.black ?? "",
            white: game?.white ?? "",
            result: game?.result ?? "",
            setting: game?.setting ?? "",
            hook: game?.hook ?? "",
            moment: game?.moment ?? "",
            legacy: game?.legacy ?? "",
            sgfUrl: game?.sgfUrl ?? "",
            sequence: String(game?.sequence ?? 0),
            featured: game?.featured ?? false,
            sgfFileText: "",
            sgfFileTooLarge: false,
            removeSgf: false,
            blackPlayerSlug: game?.blackPlayerSlug ?? "",
            whitePlayerSlug: game?.whitePlayerSlug ?? "",
            resources: (game?.resources ?? []).map(
              (resource) => ({
                url: resource.url,
                description: resource.description ?? "",
              }),
            ),
          }}
        />
      </AdminSection>
    </>
  )
}
