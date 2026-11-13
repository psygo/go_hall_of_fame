"use client"

import Link from "next/link"
import { useActionState } from "react"

import { forgotPasswordAction } from "../state/password-reset-actions"
import { idleForgotPasswordForm } from "../state/password-reset-form-state"

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    idleForgotPasswordForm,
  )
  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col gap-4">
        <p>
          If that email belongs to an admin, a link to
          choose a new password is on its way. It works
          once, for an hour.
        </p>
        <Link href="/admin/sign-in" className="font-bold">
          ← Back to sign in
        </Link>
      </div>
    )
  }
  const email =
    state.status === "rejected" ? state.email : ""

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="field">
        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="username"
          className="input"
          defaultValue={email}
          maxLength={254}
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
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? "Sending…" : "Send the link"}
        </button>
        <Link href="/admin/sign-in" className="font-bold">
          Back to sign in
        </Link>
      </div>
    </form>
  )
}
