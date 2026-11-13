"use client"

import { useActionState } from "react"

import {
  CheckboxField,
  FormActions,
  MARKDOWN_HINT,
  FormMessage,
  TextAreaField,
  TextField,
} from "@/shared/ui/presentation/admin-fields"
import { LinkedSelectFields } from "@/shared/ui/presentation/linked-select-fields"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { idleAdminForm } from "@/core/admin-form-state"

import type {
  TimelineContributorReference,
  TimelineGameReference,
  TimelinePlayerReference,
} from "../../domain/entities/timeline-event"
import { TIMELINE_LIMITS } from "../../domain/entities/timeline-event-draft"
import { saveTimelineEventAction } from "../state/timeline-admin-actions"
import type { TimelineFormState } from "../state/timeline-admin-state"

type TimelineEventFormProps = {
  /** "new" or the id of the event being edited. */
  readonly idParam: string
  readonly initial: {
    readonly year: string
    readonly title: string
    readonly text: string
    readonly gameSlugs: readonly string[]
    readonly playerSlugs: readonly string[]
    readonly contributorSlugs: readonly string[]
    readonly showGameTitles: boolean
    readonly isDraft: boolean
  }
  readonly gameOptions: readonly TimelineGameReference[]
  readonly playerOptions: readonly TimelinePlayerReference[]
  readonly contributorOptions: readonly TimelineContributorReference[]
}

export function TimelineEventForm({
  idParam,
  initial,
  gameOptions,
  playerOptions,
  contributorOptions,
}: TimelineEventFormProps) {
  const [state, formAction, isPending] = useActionState<
    TimelineFormState,
    FormData
  >(
    saveTimelineEventAction.bind(null, idParam),
    idleAdminForm,
  )
  const values =
    state.status === "idle" ? initial : state.values
  const errors =
    state.status === "invalid" ? state.errors : {}

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <TextField
        name="year"
        label="Year or period"
        hint="Text, as you want it shown: 1846, c. 1670, Late 17th century."
        defaultValue={values.year}
        error={errors.year}
        required
      />
      <TextField
        name="title"
        label="Title"
        defaultValue={values.title}
        maxLength={TIMELINE_LIMITS.title}
        error={errors.title}
        required
      />
      <TextAreaField
        name="text"
        label="Description"
        defaultValue={values.text}
        maxLength={TIMELINE_LIMITS.text}
        error={errors.text}
        hint={MARKDOWN_HINT}
      />
      <LinkedSelectFields
        name="playerSlug"
        legend="Linked players"
        addLabel="Add another linked player"
        options={playerOptions.map((player) => ({
          value: player.slug,
          label: player.name,
        }))}
        initial={values.playerSlugs}
        error={errors.playerSlugs}
      />
      <LinkedSelectFields
        name="gameSlug"
        legend="Linked games"
        addLabel="Add another linked game"
        options={gameOptions.map((game) => ({
          value: game.slug,
          label: game.name,
        }))}
        initial={values.gameSlugs}
        error={errors.gameSlugs}
        hint="Optional."
      />
      <LinkedSelectFields
        name="contributorSlug"
        legend="Linked contributors"
        addLabel="Add another linked contributor"
        options={contributorOptions.map((contributor) => ({
          value: contributor.slug,
          label: contributor.name,
        }))}
        initial={values.contributorSlugs}
        error={errors.contributorSlugs}
      />
      <CheckboxField
        name="showGameTitles"
        label="Show the game titles"
        defaultChecked={values.showGameTitles}
        hint="Whether the linked games' boards carry the game's title."
      />
      <CheckboxField
        name="isDraft"
        label="Draft"
        defaultChecked={values.isDraft}
        hint="Only admins can see a draft."
      />
      {state.status === "failed" && (
        <FormMessage message={state.message} />
      )}
      <FormActions
        isPending={isPending}
        submitLabel="Save event"
        cancelHref={ADMIN_PATHS.timeline}
      />
    </form>
  )
}
