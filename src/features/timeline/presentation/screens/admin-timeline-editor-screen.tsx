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
  const [event, gameOptions] = await Promise.all([
    timelineAdminState.loadEditor(id),
    timelineAdminState.loadGameOptions(),
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
            gameSlug: event?.game?.slug ?? "",
          }}
          gameOptions={gameOptions}
        />
      </AdminSection>
    </>
  )
}
