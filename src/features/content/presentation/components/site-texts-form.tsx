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
  PAGE_IDS,
  type EditableText,
} from "../../domain/entities/page-text"
import { saveSiteTextsAction } from "../state/content-admin-actions"
import type { SiteTextsFormState } from "../state/content-admin-state"

const PAGE_TITLE: Readonly<
  Record<(typeof PAGE_IDS)[number], string>
> = {
  home: "Home",
  players: "Players page",
  games: "Games page",
  timeline: "Timeline page",
  induction: "Induction page",
  resources: "Resources page",
}

export function SiteTextsForm({
  texts,
}: {
  readonly texts: readonly EditableText[]
}) {
  const [state, formAction, isPending] = useActionState<
    SiteTextsFormState,
    FormData
  >(saveSiteTextsAction, idleAdminForm)
  const errors =
    state.status === "invalid" ? state.errors : {}
  const valueOf = ({ definition, value }: EditableText) =>
    state.status === "idle"
      ? value
      : (state.values[definition.key] ?? value)

  return (
    <form
      action={formAction}
      className="flex flex-col gap-8"
      noValidate
    >
      {PAGE_IDS.map((page) => (
        <fieldset
          key={page}
          className="m-0 flex flex-col gap-4 border-0 p-0"
        >
          <legend className="text-accent-700 mb-3 p-0 font-mono text-[11px] font-bold tracking-[0.1em] uppercase">
            {PAGE_TITLE[page]}
          </legend>
          {texts
            .filter(
              ({ definition }) => definition.page === page,
            )
            .map((text) => {
              const { definition } = text
              const shared = {
                name: definition.key,
                label: definition.label,
                defaultValue: valueOf(text),
                maxLength: definition.maxLength,
                error: errors[definition.key],
                hint: definition.hint,
              }
              return definition.multiline ? (
                <TextAreaField
                  key={definition.key}
                  rows={3}
                  {...shared}
                />
              ) : (
                <TextField
                  key={definition.key}
                  {...shared}
                />
              )
            })}
        </fieldset>
      ))}
      <p className="text-xs opacity-70">
        Clearing a field restores its original text.
      </p>
      {state.status === "failed" && (
        <FormMessage message={state.message} />
      )}
      <FormActions
        isPending={isPending}
        submitLabel="Save texts"
        cancelHref={ADMIN_PATHS.pages}
      />
    </form>
  )
}
