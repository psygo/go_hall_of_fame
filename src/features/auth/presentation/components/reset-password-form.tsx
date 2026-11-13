"use client"

import { useActionState } from "react"

import { MIN_PASSWORD_LENGTH } from "../../domain/entities/admin"
import { resetPasswordAction } from "../state/password-reset-actions"
import { idleResetPasswordForm } from "../state/password-reset-form-state"

export function ResetPasswordForm({
  token,
}: {
  readonly token: string
}) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction.bind(null, token),
    idleResetPasswordForm,
  )

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="field">
        <label htmlFor="reset-password">New password</label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="input"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={256}
          required
        />
        <div className="mt-1 text-xs opacity-70">
          At least {MIN_PASSWORD_LENGTH} characters.
        </div>
      </div>
      <div className="field">
        <label htmlFor="reset-confirmation">
          Repeat the new password
        </label>
        <input
          id="reset-confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          className="input"
          maxLength={256}
          required
        />
      </div>
      {state.status === "rejected" && (
        <p
          role="alert"
          className="text-accent-700 text-xs font-bold"
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary self-start"
        disabled={isPending}
      >
        {isPending ? "Saving…" : "Set the new password"}
      </button>
    </form>
  )
}
