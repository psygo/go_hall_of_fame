"use client"

import { useActionState, useState } from "react"

import {
  NOMINATION_CATEGORIES,
  NOMINATION_LIMITS,
} from "../../domain/entities/nomination"
import { submitNominationAction } from "../state/submit-nomination-action"
import {
  idleNominationForm,
  type NominationFormValues,
} from "../state/nomination-form-state"

const emptyValues: NominationFormValues = {
  name: "",
  category: "player",
  email: "",
  caseForInduction: "",
}

const headingClass = "text-4xl leading-none font-extrabold"

export function NominationForm() {
  const [round, setRound] = useState(0)
  return (
    <NominationFormRound
      key={round}
      onNominateAnother={() =>
        setRound((current) => current + 1)
      }
    />
  )
}

function NominationFormRound({
  onNominateAnother,
}: {
  readonly onNominateAnother: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    submitNominationAction,
    idleNominationForm,
  )

  if (state.status === "accepted") {
    return (
      <div className="flex flex-col gap-4">
        <h2 className={headingClass}>
          Nomination received.
        </h2>
        <p>
          Thank you. Your nomination of {state.name} is
          recorded for review, with {state.email} on file.
        </p>
        <button
          type="button"
          className="btn btn-secondary self-start"
          onClick={onNominateAnother}
        >
          Nominate another
        </button>
      </div>
    )
  }

  const values =
    state.status === "idle" ? emptyValues : state.values
  const errors =
    state.status === "invalid" ? state.errors : {}

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <h2 className={headingClass}>
        Nominate a player or a game
      </h2>
      <div className="field">
        <label htmlFor="nomination-name">
          Name of the player or game
        </label>
        <input
          id="nomination-name"
          maxLength={NOMINATION_LIMITS.name}
          aria-invalid={errors.name !== undefined}
          aria-describedby={
            errors.name
              ? "nomination-name-error"
              : undefined
          }
          name="name"
          className="input"
          type="text"
          placeholder="e.g. Takemiya Masaki"
          defaultValue={values.name}
        />
        <FieldError
          id="nomination-name-error"
          message={errors.name}
        />
      </div>
      <div className="field">
        <span className="field-label">Category</span>
        <div
          className="seg"
          role="radiogroup"
          aria-label="Category"
        >
          {NOMINATION_CATEGORIES.map((category) => (
            <label key={category} className="seg-opt">
              <input
                type="radio"
                name="category"
                value={category}
                defaultChecked={
                  values.category === category
                }
              />
              {category === "player" ? "Player" : "Game"}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="nomination-email">Your email</label>
        <input
          id="nomination-email"
          maxLength={NOMINATION_LIMITS.email}
          aria-invalid={errors.email !== undefined}
          aria-describedby={
            errors.email
              ? "nomination-email-error"
              : undefined
          }
          name="email"
          className="input"
          type="email"
          placeholder="you@example.com"
          defaultValue={values.email}
        />
        <FieldError
          id="nomination-email-error"
          message={errors.email}
        />
      </div>
      <div className="field">
        <label htmlFor="nomination-case">
          Case for induction
        </label>
        <textarea
          id="nomination-case"
          maxLength={NOMINATION_LIMITS.caseForInduction}
          name="caseForInduction"
          className="input"
          rows={5}
          placeholder="What changed because of them?"
          defaultValue={values.caseForInduction}
          aria-invalid={
            errors.caseForInduction !== undefined
          }
          aria-describedby={
            errors.caseForInduction
              ? "nomination-case-error"
              : undefined
          }
        />
        <FieldError
          id="nomination-case-error"
          message={errors.caseForInduction}
        />
      </div>
      {state.status === "failed" && (
        <p
          role="alert"
          className="text-accent-700 text-xs font-bold"
        >
          The nomination could not be saved. Try again in a
          moment.
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary self-start"
        disabled={isPending}
      >
        {isPending ? "Submitting…" : "Submit nomination"}
      </button>
    </form>
  )
}

function FieldError({
  id,
  message,
}: {
  readonly id: string
  readonly message?: string
}) {
  if (message === undefined) return null
  return (
    <div
      id={id}
      role="alert"
      className="text-accent-700 mt-1 text-xs font-bold"
    >
      {message}
    </div>
  )
}
