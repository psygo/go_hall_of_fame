"use client"

import { useActionState } from "react"

import {
  FormActions,
  FormMessage,
  TextAreaField,
  TextField,
} from "@/shared/ui/presentation/admin-fields"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { idleAdminForm } from "@/core/admin-form-state"

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
  }
}

export function TimelineEventForm({
  idParam,
  initial,
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
        label="Year"
        type="number"
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
