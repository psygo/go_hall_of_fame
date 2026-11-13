"use client"

import { useActionState, useState } from "react"

import { useLocale } from "@/shared/i18n/presentation/locale-provider"

import { FEEDBACK_LIMITS } from "../../domain/entities/feedback"
import { submitFeedbackAction } from "../state/submit-feedback-action"
import {
  idleFeedbackForm,
  type FeedbackFormState,
} from "../state/feedback-form-state"

/** The feedback form of the About page: an email and a description. */
export function FeedbackForm() {
  const [round, setRound] = useState(0)
  return (
    <FeedbackFormRound
      key={round}
      onSendAnother={() =>
        setRound((current) => current + 1)
      }
    />
  )
}

function FeedbackFormRound({
  onSendAnother,
}: {
  readonly onSendAnother: () => void
}) {
  const { messages } = useLocale()
  const [state, formAction, isPending] = useActionState<
    FeedbackFormState,
    FormData
  >(submitFeedbackAction, idleFeedbackForm)

  if (state.status === "accepted") {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">
          {messages.feedbackThanks}
        </h2>
        <p>{messages.feedbackSent}</p>
        <button
          type="button"
          className="btn btn-secondary self-start"
          onClick={onSendAnother}
        >
          {messages.feedbackAnother}
        </button>
      </div>
    )
  }

  const values =
    state.status === "idle"
      ? { email: "", description: "" }
      : state.values
  const errors =
    state.status === "invalid" ? state.errors : {}

  return (
    <form
      action={formAction}
      className="flex max-w-[640px] flex-col gap-4"
      noValidate
    >
      <h2 className="text-2xl font-bold">
        {messages.feedbackTitle}
      </h2>
      <div className="field">
        <label htmlFor="feedback-email">
          {messages.feedbackEmail}
        </label>
        <input
          id="feedback-email"
          name="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          maxLength={FEEDBACK_LIMITS.email}
          defaultValue={values.email}
          aria-invalid={errors.email !== undefined}
          aria-describedby={
            errors.email
              ? "feedback-email-error"
              : undefined
          }
        />
        <FieldError
          id="feedback-email-error"
          message={errors.email}
        />
      </div>
      <div className="field">
        <label htmlFor="feedback-description">
          {messages.feedbackDescription}
        </label>
        <textarea
          id="feedback-description"
          name="description"
          className="input"
          rows={6}
          maxLength={FEEDBACK_LIMITS.description}
          defaultValue={values.description}
          aria-invalid={errors.description !== undefined}
          aria-describedby={
            errors.description
              ? "feedback-description-error"
              : undefined
          }
        />
        <FieldError
          id="feedback-description-error"
          message={errors.description}
        />
      </div>
      {/* Humans never see this field; bots fill it and are ignored. */}
      <div aria-hidden className="hidden">
        <label htmlFor="feedback-website">Website</label>
        <input
          id="feedback-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {state.status === "failed" && (
        <p
          role="alert"
          className="text-accent-700 text-xs font-bold"
        >
          The feedback could not be sent. Try again in a
          moment.
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary self-start"
        disabled={isPending}
      >
        {isPending
          ? messages.feedbackSending
          : messages.feedbackSend}
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
