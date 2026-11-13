"use client"

import { useActionState } from "react"

import { ResourceFields } from "@/shared/ui/presentation/resource-fields"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { idleAdminForm } from "@/core/admin-form-state"
import {
  CheckboxField,
  FileField,
  FormActions,
  FormMessage,
  SelectField,
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
  /** An SGF file was uploaded earlier. */
  readonly hasUploadedSgf: boolean
}

export function GameForm({
  slugParam,
  initial,
  playerOptions,
  hasUploadedSgf,
}: GameFormProps) {
  const [state, formAction, isPending] = useActionState<
    GameFormState,
    FormData
  >(saveGameAction.bind(null, slugParam), idleAdminForm)
  const values =
    state.status === "idle" ? initial : state.values
  const errors =
    state.status === "invalid" ? state.errors : {}
  const playerLinkOptions = [
    { value: "", label: "No link" },
    ...playerOptions.map((player) => ({
      value: player.slug,
      label: player.name,
    })),
  ]

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
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        <SelectField
          name="blackPlayerSlug"
          label="Black links to"
          defaultValue={values.blackPlayerSlug}
          options={playerLinkOptions}
          error={errors.blackPlayerSlug}
          hint="A Hall player: the Black name on the site links to their page."
        />
        <SelectField
          name="whitePlayerSlug"
          label="White links to"
          defaultValue={values.whitePlayerSlug}
          options={playerLinkOptions}
          error={errors.whitePlayerSlug}
          hint="A Hall player: the White name on the site links to their page."
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
      <TextField
        name="sgfUrl"
        label="SGF record"
        defaultValue={values.sgfUrl}
        hint="Option 1: a path under public/ such as /sgf/alphago-game-4.sgf, or an https URL."
        error={errors.sgfUrl}
      />
      <FileField
        name="sgfFile"
        label="SGF file"
        accept=".sgf,text/plain"
        hint="Option 2: upload the file; its text is saved in the database (choose it again if the form comes back with errors). An uploaded file wins over the record above. The game page and the games list then show a playable board."
        error={errors.sgfFile}
      />
      {hasUploadedSgf && (
        <CheckboxField
          name="removeSgf"
          label="Remove the SGF uploaded earlier"
          defaultChecked={values.removeSgf}
        />
      )}
      <ResourceFields
        initial={values.resources}
        error={errors.resources}
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
