import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import type { RequireAdmin } from "@/core/admin-guard"
import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import {
  ADMIN_PAGE_SIZE,
  paginate,
  readPageParam,
  type Page,
  type QueryParam,
} from "@/core/list-query"
import type { NoParams, UseCase } from "@/core/use-case"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"

import type { FeedbackRecord } from "../../domain/entities/feedback-record"
import type { IdParams } from "../../domain/params/id-params"
import type { SetFeedbackReadParams } from "../../domain/params/set-feedback-read-params"

export const FEEDBACK_ADMIN_PATH = ADMIN_PATHS.feedback

export type FeedbackAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listFeedback: UseCase<
    NoParams,
    DataState<readonly FeedbackRecord[]>
  >
  readonly setFeedbackRead: UseCase<
    SetFeedbackReadParams,
    DataState<void>
  >
  readonly deleteFeedback: UseCase<
    IdParams,
    DataState<void>
  >
}

export function createFeedbackAdminState(
  dependencies: FeedbackAdminDependencies,
) {
  async function loadFeedback(
    pageParam?: QueryParam,
  ): Promise<Page<FeedbackRecord>> {
    await connection()
    await dependencies.requireAdmin()
    const all = unwrapDataState(
      await dependencies.listFeedback.call({}),
    )
    return paginate(
      all,
      readPageParam(pageParam),
      ADMIN_PAGE_SIZE,
    )
  }

  async function setRead(
    id: number,
    isRead: boolean,
  ): Promise<void> {
    await dependencies.requireAdmin()
    if (!Number.isInteger(id))
      throw new Error("Unknown feedback")
    const updated = await dependencies.setFeedbackRead.call(
      {
        id,
        isRead,
      },
    )
    if (updated.status === "failure") {
      console.error(
        "Could not update the feedback:",
        updated.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath(FEEDBACK_ADMIN_PATH)
    redirect(FEEDBACK_ADMIN_PATH)
  }

  async function deleteById(id: number): Promise<void> {
    await dependencies.requireAdmin()
    if (!Number.isInteger(id))
      throw new Error("Unknown feedback")
    const deleted = await dependencies.deleteFeedback.call({
      id,
    })
    if (deleted.status === "failure") {
      console.error(
        "Could not delete the feedback:",
        deleted.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath(FEEDBACK_ADMIN_PATH)
    redirect(FEEDBACK_ADMIN_PATH)
  }

  return { loadFeedback, setRead, deleteById }
}
