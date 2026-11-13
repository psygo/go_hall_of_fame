import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import type { RequireAdmin } from "@/core/admin-guard"
import type { AdminFormState } from "@/core/admin-form-state"
import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"
import {
  parseInteger,
  type SaveResult,
} from "@/core/validation"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import {
  readFormFlag,
  readFormText,
  readFormTexts,
} from "@/shared/ui/presentation/form-data"

import type {
  TimelineEvent,
  TimelineGameReference,
  TimelinePlayerReference,
} from "../../domain/entities/timeline-event"
import type {
  TimelineEventErrors,
  TimelineEventForm,
} from "../../domain/entities/timeline-event-draft"
import type { ReorderTimelineEventsParams } from "../../domain/params/reorder-timeline-events-params"
import type { SaveTimelineEventParams } from "../../domain/params/save-timeline-event-params"
import type { TimelineEventIdParams } from "../../domain/params/timeline-event-id-params"

export type TimelineFormState = AdminFormState<
  TimelineEventForm,
  TimelineEventErrors
>

export const TIMELINE_ADMIN_PATH = ADMIN_PATHS.timeline

export type TimelineAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listTimelineEvents: UseCase<
    NoParams,
    DataState<readonly TimelineEvent[]>
  >
  readonly getTimelineEvent: UseCase<
    TimelineEventIdParams,
    DataState<TimelineEvent | null>
  >
  readonly listGameOptions: UseCase<
    NoParams,
    DataState<readonly TimelineGameReference[]>
  >
  readonly listPlayerOptions: UseCase<
    NoParams,
    DataState<readonly TimelinePlayerReference[]>
  >
  readonly saveTimelineEvent: UseCase<
    SaveTimelineEventParams,
    SaveResult<TimelineEventErrors>
  >
  readonly reorderTimelineEvents: UseCase<
    ReorderTimelineEventsParams,
    DataState<void>
  >
  readonly deleteTimelineEvent: UseCase<
    TimelineEventIdParams,
    DataState<void>
  >
}

export function createTimelineAdminState(
  dependencies: TimelineAdminDependencies,
) {
  /** Every event, in timeline order: the admin reorders the whole list by dragging. */
  async function loadAdminTimeline(): Promise<
    readonly TimelineEvent[]
  > {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.listTimelineEvents.call({}),
    )
  }

  /** "new" gives null (a blank form); an unknown id is a 404. */
  async function loadEditor(
    idParam: string,
  ): Promise<TimelineEvent | null> {
    await connection()
    await dependencies.requireAdmin()
    if (idParam === "new") return null
    const id = parseInteger(idParam)
    if (id === null) notFound()
    const event = unwrapDataState(
      await dependencies.getTimelineEvent.call({ id }),
    )
    if (event === null) notFound()
    return event
  }

  /** The games an event can link to. */
  async function loadGameOptions(): Promise<
    readonly TimelineGameReference[]
  > {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.listGameOptions.call({}),
    )
  }

  /** The players an event can link to. */
  async function loadPlayerOptions(): Promise<
    readonly TimelinePlayerReference[]
  > {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.listPlayerOptions.call({}),
    )
  }

  async function saveFromForm(
    idParam: string,
    formData: FormData,
  ): Promise<TimelineFormState> {
    await dependencies.requireAdmin()
    const form: TimelineEventForm = {
      year: readFormText(formData, "year"),
      title: readFormText(formData, "title"),
      text: readFormText(formData, "text"),
      gameSlugs: readFormTexts(formData, "gameSlug"),
      playerSlugs: readFormTexts(formData, "playerSlug"),
      isDraft: readFormFlag(formData, "isDraft"),
    }
    const id =
      idParam === "new" ? null : parseInteger(idParam)
    if (idParam !== "new" && id === null) notFound()
    const result =
      await dependencies.saveTimelineEvent.call({
        id,
        form,
      })
    if (result.status === "saved") {
      revalidatePath("/", "layout")
      redirect(TIMELINE_ADMIN_PATH)
    }
    if (result.status === "invalid") {
      return {
        status: "invalid",
        errors: result.errors,
        values: form,
      }
    }
    console.error(
      "Could not save the timeline event:",
      result.error.name,
    )
    return {
      status: "failed",
      message:
        "The event could not be saved. Try again in a moment.",
      values: form,
    }
  }

  async function reorder(
    ids: readonly number[],
  ): Promise<void> {
    await dependencies.requireAdmin()
    const reordered =
      await dependencies.reorderTimelineEvents.call({ ids })
    if (reordered.status === "failure") {
      console.error(
        "Could not reorder the timeline:",
        reordered.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath("/", "layout")
  }

  async function deleteById(id: number): Promise<void> {
    await dependencies.requireAdmin()
    const deleted =
      await dependencies.deleteTimelineEvent.call({ id })
    if (deleted.status === "failure") {
      console.error(
        "Could not delete the event:",
        deleted.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath("/", "layout")
    redirect(TIMELINE_ADMIN_PATH)
  }

  return {
    loadAdminTimeline,
    loadEditor,
    loadGameOptions,
    loadPlayerOptions,
    saveFromForm,
    reorder,
    deleteById,
  }
}
