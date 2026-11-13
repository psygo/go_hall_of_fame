import { playersAdminState } from "@/config/di"
import { formatTags } from "@/core/tags"
import { AdminSection } from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { DEFAULT_PHOTO_POSITION } from "../../domain/entities/player-draft"
import { PlayerForm } from "../components/player-form"

type AdminPlayerEditorScreenProps = {
  readonly params: Promise<{ readonly slug: string }>
}

export async function AdminPlayerEditorScreen({
  params,
}: AdminPlayerEditorScreenProps) {
  const { slug } = await params
  const player = await playersAdminState.loadEditor(slug)

  return (
    <>
      <PageHeader
        eyebrow="Admin · Players"
        title={player === null ? "New player" : player.name}
      />
      <AdminSection>
        <PlayerForm
          slugParam={slug}
          initial={{
            slug: player?.slug ?? "",
            name: player?.name ?? "",
            nativeName: player?.nativeName ?? "",
            country: player?.country ?? "Japan",
            years: player?.years ?? "",
            distinction: player?.distinction ?? "",
            bio: player?.bio ?? "",
            photoUrl: player?.photoUrl ?? "",
            photoPosition:
              player?.photoPosition ??
              DEFAULT_PHOTO_POSITION,
            inductionNumber:
              player === null
                ? ""
                : String(player.inductionNumber),
            featured: player?.featured ?? false,
            tags: formatTags(player?.tags ?? []),
            resources: (player?.resources ?? []).map(
              (resource) => ({
                title: resource.title,
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
