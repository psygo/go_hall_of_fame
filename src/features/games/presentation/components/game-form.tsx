"use client"

import { useActionState } from "react"

import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { idleAdminForm } from "@/core/admin-form-state"
import {
  CheckboxField,
  CheckboxGroup,
  FormActions,
  FormMessage,
  TextAreaField,
  TextField,
} from "@/shared/ui/presentation/admin-fields"

import type { GamePlayerReference } from "../../domain/entities/game"
import {
  GAME_LIMITS,
  type GameForm as GameFormValues,
} from "../../domain/entities/game-draft"
import { saveGameAction } from "../state/games-admin-actions"
import type { GameFormState } from "../state/games-admin-state"

type GameFormProps = {
  /** "new" or the slug of the game being edited. */
  readonly slugParam: string
  readonly initial: GameFormValues
  readonly playerOptions: readonly GamePlayerReference[]
}

export function GameForm({
  slugParam,
  initial,
  playerOptions,
}: GameFormProps) {
  const [state, formAction, isPending] = useActionState<
    GameFormState,
    FormData
  >(saveGameAction.bind(null, slugParam), idleAdminForm)
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
        maxLength={GAME_LIMITS.name}
        error={errors.name}
        required
      />
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        <TextField
          name="year"
          label="Year"
          type="number"
          defaultValue={values.year}
          error={errors.year}
          required
        />
        <TextField
          name="setting"
          label="Setting"
          defaultValue={values.setting}
          maxLength={GAME_LIMITS.setting}
          placeholder="Seoul, Korea"
          error={errors.setting}
          required
        />
      </div>
      <div className="grid gap-4 min-[560px]:grid-cols-3">
        <TextField
          name="black"
          label="Black"
          defaultValue={values.black}
          maxLength={GAME_LIMITS.side}
          error={errors.black}
          required
        />
        <TextField
          name="white"
          label="White"
          defaultValue={values.white}
          maxLength={GAME_LIMITS.side}
          error={errors.white}
          required
        />
        <TextField
          name="result"
          label="Result"
          defaultValue={values.result}
          maxLength={GAME_LIMITS.result}
          placeholder="White by resignation"
          error={errors.result}
          required
        />
      </div>
      <TextAreaField
        name="hook"
        label="Hook"
        rows={3}
        defaultValue={values.hook}
        maxLength={GAME_LIMITS.hook}
        error={errors.hook}
      />
      <TextAreaField
        name="moment"
        label="The moment"
        rows={4}
        defaultValue={values.moment}
        maxLength={GAME_LIMITS.moment}
        error={errors.moment}
      />
      <TextAreaField
        name="legacy"
        label="Why it endures"
        rows={4}
        defaultValue={values.legacy}
        maxLength={GAME_LIMITS.legacy}
        error={errors.legacy}
      />
      <CheckboxGroup
        name="playerSlugs"
        label="In the Hall (players who played this game)"
        options={playerOptions.map((player) => ({
          value: player.slug,
          label: player.name,
        }))}
        defaultValues={values.playerSlugs}
      />
      {errors.playerSlugs && (
        <FormMessage message={errors.playerSlugs} />
      )}
      <TextField
        name="sgfUrl"
        label="SGF record"
        defaultValue={values.sgfUrl}
        hint="A path under public/ such as /sgf/alphago-game-4.sgf, or an https URL. When set, the game page shows a playable board."
        error={errors.sgfUrl}
      />
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        <TextField
          name="slug"
          label="Slug"
          defaultValue={values.slug}
          hint="The address: /games/<slug>. Leave blank to build it from the name."
          error={errors.slug}
        />
        <TextField
          name="sequence"
          label="Order within the year"
          type="number"
          defaultValue={values.sequence}
          hint="Orders games played in the same year. 0 comes first."
          error={errors.sequence}
        />
      </div>
      <CheckboxField
        name="featured"
        label="Featured on the home page"
        defaultChecked={values.featured}
        hint="Only one game is featured: ticking this clears the others."
      />
      {state.status === "failed" && (
        <FormMessage message={state.message} />
      )}
      <FormActions
        isPending={isPending}
        submitLabel="Save game"
        cancelHref={ADMIN_PATHS.games}
      />
    </form>
  )
}
