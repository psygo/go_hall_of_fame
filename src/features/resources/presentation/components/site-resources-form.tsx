"use client"

import { useActionState } from "react"

import { idleAdminForm } from "@/core/admin-form-state"
import type { ResourceRow } from "@/core/resources"
import {
  FormActions,
  FormMessage,
} from "@/shared/ui/presentation/admin-fields"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { ResourceFields } from "@/shared/ui/presentation/resource-fields"

import { saveResourcesAction } from "../state/resources-admin-actions"
import type { ResourcesFormState } from "../state/resources-admin-state"

export function SiteResourcesForm({
  initial,
}: {
  readonly initial: readonly ResourceRow[]
}) {
  const [state, formAction, isPending] = useActionState<
    ResourcesFormState,
    FormData
  >(saveResourcesAction, idleAdminForm)
  const rows =
    state.status === "idle"
      ? initial
      : state.values.resources
  const errors =
    state.status === "invalid" ? state.errors : {}

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <ResourceFields
        initial={rows}
        error={errors.resources}
      />
      {state.status === "failed" && (
        <FormMessage message={state.message} />
      )}
      <FormActions
        isPending={isPending}
        submitLabel="Save resources"
        cancelHref={ADMIN_PATHS.pages}
      />
    </form>
  )
}
