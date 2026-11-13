"use client"

import { useActionState } from "react"

import { idleAdminForm } from "@/core/admin-form-state"
import {
  CheckboxField,
  FormActions,
  FormMessage,
  MARKDOWN_HINT,
  SelectField,
  TextAreaField,
  TextField,
} from "@/shared/ui/presentation/admin-fields"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"

import {
  CONTRIBUTOR_KIND_LABELS,
  CONTRIBUTOR_KINDS,
} from "../../domain/entities/contributor"
import {
  CONTRIBUTOR_LIMITS,
  type ContributorForm as ContributorFormValues,
} from "../../domain/entities/contributor-draft"
import { saveContributorAction } from "../state/contributors-admin-actions"
import type { ContributorFormState } from "../state/contributors-admin-state"

type ContributorFormProps = {
  /** "new" or the slug of the contributor being edited. */
  readonly slugParam: string
  readonly initial: ContributorFormValues
}

export function ContributorForm({
  slugParam,
  initial,
}: ContributorFormProps) {
  const [state, formAction, isPending] = useActionState<
    ContributorFormState,
    FormData
  >(
    saveContributorAction.bind(null, slugParam),
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
        name="name"
        label="Name"
        defaultValue={values.name}
        maxLength={CONTRIBUTOR_LIMITS.name}
        error={errors.name}
        required
      />
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        <SelectField
          name="kind"
          label="Kind"
          defaultValue={values.kind}
          options={CONTRIBUTOR_KINDS.map((kind) => ({
            value: kind,
            label: CONTRIBUTOR_KIND_LABELS[kind],
          }))}
          error={errors.kind}
        />
        <TextField
          name="period"
          label="Period"
          defaultValue={values.period}
          maxLength={CONTRIBUTOR_LIMITS.period}
          placeholder="2014–2017 or since 1990"
          hint="Optional."
          error={errors.period}
        />
      </div>
      <TextField
        name="role"
        label="What they contributed"
        defaultValue={values.role}
        maxLength={CONTRIBUTOR_LIMITS.role}
        hint="One line, for example: Co-founder of DeepMind, behind AlphaGo."
        error={errors.role}
        required
      />
      <TextAreaField
        name="bio"
        label="Biography"
        rows={6}
        defaultValue={values.bio}
        maxLength={CONTRIBUTOR_LIMITS.bio}
        error={errors.bio}
        hint={MARKDOWN_HINT}
      />
      <TextField
        name="slug"
        label="Slug"
        defaultValue={values.slug}
        hint="The address: /contributors/<slug>. Leave blank to build it from the name. Changing it changes the URL."
        error={errors.slug}
      />
      <TextField
        name="photoUrl"
        label="Photo"
        defaultValue={values.photoUrl}
        hint="A path under public/ such as /portraits/name.webp, or an https URL. Blank shows the placeholder."
        error={errors.photoUrl}
      />
      <TextField
        name="photoPosition"
        label="Photo crop"
        defaultValue={values.photoPosition}
        hint="Where the 4:5 crop is centred, for example 50% 20%."
        error={errors.photoPosition}
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
        submitLabel="Save contributor"
        cancelHref={ADMIN_PATHS.contributors}
      />
    </form>
  )
}
