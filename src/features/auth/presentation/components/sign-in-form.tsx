"use client"

import { useActionState } from "react"

import { signInAction } from "../state/sign-in-action"
import { idleSignInForm } from "../state/sign-in-form-state"

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    idleSignInForm,
  )
  const email =
    state.status === "rejected" ? state.email : ""

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="field">
        <label htmlFor="sign-in-email">Email</label>
        <input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="username"
          className="input"
          defaultValue={email}
          maxLength={254}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="sign-in-password">Password</label>
        <input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
