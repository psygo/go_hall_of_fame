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
            gameSlugs: slugsByName(event?.games ?? []),
            playerSlugs: slugsByName(event?.players ?? []),
            contributorSlugs: slugsByName(
              event?.contributors ?? [],
            ),
            showGameTitles: event?.showGameTitles ?? true,
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

/** The linked items' slugs in alphabetical order of their names, as the editor lists them. */
function slugsByName(
  items: readonly {
    readonly slug: string
    readonly name: string
  }[],
): readonly string[] {
  return [...items]
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      }),
    )
    .map((item) => item.slug)
}
