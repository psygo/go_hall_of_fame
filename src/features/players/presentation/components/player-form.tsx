"use client"

import { useActionState } from "react"

import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { idleAdminForm } from "@/core/admin-form-state"
import {
  CheckboxField,
  FormActions,
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/shared/ui/presentation/admin-fields"

import { COUNTRIES } from "../../domain/entities/player"
import {
  PLAYER_LIMITS,
  type PlayerForm as PlayerFormValues,
} from "../../domain/entities/player-draft"
import { savePlayerAction } from "../state/players-admin-actions"
import type { PlayerFormState } from "../state/players-admin-state"

type PlayerFormProps = {
  /** "new" or the slug of the player being edited. */
  readonly slugParam: string
  readonly initial: PlayerFormValues
}

export function PlayerForm({
  slugParam,
  initial,
}: PlayerFormProps) {
  const [state, formAction, isPending] = useActionState<
    PlayerFormState,
    FormData
  >(savePlayerAction.bind(null, slugParam), idleAdminForm)
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
        maxLength={PLAYER_LIMITS.name}
        error={errors.name}
        required
      />
      <TextField
        name="nativeName"
        label="Name in its own script"
        defaultValue={values.nativeName}
        maxLength={PLAYER_LIMITS.nativeName}
        error={errors.nativeName}
        required
      />
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        <SelectField
          name="country"
          label="Country"
          defaultValue={values.country}
          options={COUNTRIES.map((country) => ({
            value: country,
            label: country,
          }))}
          error={errors.country}
        />
        <TextField
          name="years"
          label="Years"
          defaultValue={values.years}
          maxLength={PLAYER_LIMITS.years}
          placeholder="1645–1702 or b. 1983"
          error={errors.years}
          required
        />
      </div>
      <TextField
        name="distinction"
        label="Distinction"
        defaultValue={values.distinction}
        maxLength={PLAYER_LIMITS.distinction}
        error={errors.distinction}
        required
      />
      <TextAreaField
        name="bio"
        label="Biography"
        rows={6}
        defaultValue={values.bio}
        maxLength={PLAYER_LIMITS.bio}
        error={errors.bio}
      />
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        <TextField
          name="slug"
          label="Slug"
          defaultValue={values.slug}
          hint="The address: /players/<slug>. Leave blank to build it from the name. Changing it changes the URL."
          error={errors.slug}
        />
        <TextField
          name="inductionNumber"
          label="Induction number"
          type="number"
          defaultValue={values.inductionNumber}
          hint="The “No. 01”. Leave blank for the next free number."
          error={errors.inductionNumber}
        />
      </div>
      <TextField
        name="photoUrl"
        label="Photo"
        defaultValue={values.photoUrl}
        hint="A path under public/ such as /portraits/lee-sedol.webp, or an https URL. Blank shows the placeholder."
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
        name="featured"
        label="Featured on the home page"
        defaultChecked={values.featured}
        hint="Only one player is featured: ticking this clears the others."
      />
      {state.status === "failed" && (
        <FormMessage message={state.message} />
      )}
      <FormActions
        isPending={isPending}
        submitLabel="Save player"
        cancelHref={ADMIN_PATHS.players}
      />
    </form>
  )
}
