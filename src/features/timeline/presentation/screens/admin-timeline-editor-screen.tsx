import { timelineAdminState } from "@/config/di"
import { AdminSection } from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { TimelineEventForm } from "../components/timeline-event-form"

type AdminTimelineEditorScreenProps = {
  readonly params: Promise<{ readonly id: string }>
}

export async function AdminTimelineEditorScreen({
  params,
}: AdminTimelineEditorScreenProps) {
  const { id } = await params
  const [
    event,
    gameOptions,
    playerOptions,
    contributorOptions,
  ] = await Promise.all([
    timelineAdminState.loadEditor(id),
    timelineAdminState.loadGameOptions(),
    timelineAdminState.loadPlayerOptions(),
    timelineAdminState.loadContributorOptions(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Admin · Timeline"
        title={event === null ? "New event" : "Edit event"}
      />
      <AdminSection>
        <TimelineEventForm
          idParam={id}
          initial={{
            year: event === null ? "" : String(event.year),
            title: event?.title ?? "",
            text: event?.text ?? "",
            gameSlugs: (event?.games ?? []).map(
              (game) => game.slug,
            ),
            playerSlugs: (event?.players ?? []).map(
              (player) => player.slug,
            ),
            contributorSlugs: (
              event?.contributors ?? []
            ).map((contributor) => contributor.slug),
            isDraft: event?.isDraft ?? false,
          }}
          gameOptions={gameOptions}
          playerOptions={playerOptions}
          contributorOptions={contributorOptions}
        />
      </AdminSection>
    </>
  )
}
