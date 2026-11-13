"use client"

import { useActionState } from "react"

import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { idleAdminForm } from "@/core/admin-form-state"
import {
  FormActions,
  FormMessage,
  TextAreaField,
  TextField,
} from "@/shared/ui/presentation/admin-fields"

import {
  CRITERION_LIMITS,
  type CriterionForm as CriterionFormValues,
} from "../../domain/entities/criterion-draft"
import { saveCriterionAction } from "../state/induction-admin-actions"
import type { CriterionFormState } from "../state/induction-admin-state"

type CriterionFormProps = {
  /** "new" or the id of the criterion being edited. */
  readonly idParam: string
  readonly initial: CriterionFormValues
}

export function CriterionForm({
  idParam,
  initial,
}: CriterionFormProps) {
  const [state, formAction, isPending] = useActionState<
    CriterionFormState,
    FormData
  >(saveCriterionAction.bind(null, idParam), idleAdminForm)
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
        name="title"
        label="Title"
        defaultValue={values.title}
        maxLength={CRITERION_LIMITS.title}
        error={errors.title}
        required
      />
      <TextAreaField
        name="text"
        label="Description"
        defaultValue={values.text}
        maxLength={CRITERION_LIMITS.text}
        error={errors.text}
      />
      <TextField
        name="position"
        label="Number"
        type="number"
        defaultValue={values.position}
        hint="The “01”. Leave blank for the next free number."
        error={errors.position}
      />
      {state.status === "failed" && (
        <FormMessage message={state.message} />
      )}
      <FormActions
        isPending={isPending}
        submitLabel="Save criterion"
        cancelHref={ADMIN_PATHS.criteria}
      />
    </form>
  )
}
