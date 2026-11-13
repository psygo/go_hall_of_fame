import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { after, connection } from "next/server"
import { cache } from "react"

import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import {
  LOCKOUT_MINUTES,
  MIN_PASSWORD_LENGTH,
  type Admin,
} from "../../domain/entities/admin"
import type { SignInResult } from "../../domain/entities/sign-in-result"
import type { SignInParams } from "../../domain/params/sign-in-params"
import type { TokenParams } from "../../domain/params/token-params"
import type {
  RequestResetResult,
  ResetPasswordResult,
} from "../../domain/entities/password-reset"
import type { RequestPasswordResetParams } from "../../domain/params/request-password-reset-params"
import type { ResetPasswordParams } from "../../domain/params/reset-password-params"
import type {
  ForgotPasswordFormState,
  ResetPasswordFormState,
} from "./password-reset-form-state"
import type { SignInFormState } from "./sign-in-form-state"

export const SIGN_IN_PATH = "/admin/sign-in"
export const ADMIN_HOME_PATH = "/admin"

// The __Host- prefix makes browsers insist on Secure, Path=/ and no Domain, so it needs HTTPS.
const IS_PRODUCTION = process.env.NODE_ENV === "production"
export const SESSION_COOKIE = IS_PRODUCTION
  ? "__Host-ghof_session"
  : "ghof_session"

const MAX_EMAIL_LENGTH = 254
const MAX_PASSWORD_LENGTH = 256
const MAX_TOKEN_LENGTH = 128
const RESET_LINK_MESSAGE =
  "This link has expired or was already used. Ask for a new one."

export type AuthDependencies = {
  readonly signIn: UseCase<SignInParams, SignInResult>
  readonly signOut: UseCase<TokenParams, DataState<void>>
  readonly getAdminBySession: UseCase<
    TokenParams,
    DataState<Admin | null>
  >
  readonly requestPasswordReset: UseCase<
    RequestPasswordResetParams,
    RequestResetResult
  >
  readonly checkResetLink: UseCase<
    TokenParams,
    DataState<boolean>
  >
  readonly resetPassword: UseCase<
    ResetPasswordParams,
    ResetPasswordResult
  >
}

export function createAuthState(
  dependencies: AuthDependencies,
) {
  // Memoized per request, so the nav, the page and its actions share one database lookup.
  const loadCurrentAdmin = cache(
    async (): Promise<Admin | null> => {
      await connection()
      const token = (await cookies()).get(
        SESSION_COOKIE,
      )?.value
      if (token === undefined) return null
      const found =
        await dependencies.getAdminBySession.call({ token })
      if (found.status === "failure") {
        console.error(
          "Could not check the admin session:",
          found.error.name,
        )
        return null
      }
      return found.data
    },
  )

  async function requireAdmin(): Promise<Admin> {
    const admin = await loadCurrentAdmin()
    if (admin === null) redirect(SIGN_IN_PATH)
    return admin
  }

  async function signInWithForm(
    formData: FormData,
  ): Promise<SignInFormState> {
    const email = readText(formData, "email")
    const password = readText(formData, "password")
    const tooLong =
      email.length > MAX_EMAIL_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    if (email === "" || password === "" || tooLong) {
      return rejected(
        "Enter your email and password.",
        email,
      )
    }
    const result = await dependencies.signIn.call({
      email,
      password,
    })
    if (result.status === "signed-in") {
      await storeSessionCookie(
        result.token,
        result.expiresAt,
      )
      redirect(ADMIN_HOME_PATH)
    }
    return describeRejection(result, email)
  }

  async function signOutCurrent(): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (token !== undefined) {
      const ended = await dependencies.signOut.call({
        token,
      })
      if (ended.status === "failure") {
        console.error(
          "Could not end the admin session:",
          ended.error.name,
        )
      }
    }
    cookieStore.delete(SESSION_COOKIE)
    redirect("/")
  }

  async function requestResetFromForm(
    formData: FormData,
  ): Promise<ForgotPasswordFormState> {
    const email = readText(formData, "email").trim()
    if (email === "" || email.length > MAX_EMAIL_LENGTH) {
      return {
        status: "rejected",
        message: "Enter the email of your admin account.",
        email,
      }
    }
    const result =
      await dependencies.requestPasswordReset.call({
        email,
      })
    if (result.status === "failed") {
      console.error(
        "Could not start a password reset:",
        result.error.name,
      )
      return {
        status: "rejected",
        message:
          "Could not send the link. Try again in a moment.",
        email,
      }
    }
    // The visitor always gets the same answer; the reason nothing was sent only goes to the log.
    if (result.error !== null) {
      console.error(
        "Could not prepare the password reset email:",
        result.error.name,
      )
    }
    if (result.deliver !== null) {
      const deliver = result.deliver
      // After the response, so a known email and an unknown one answer equally fast.
      after(async () => {
        const failure = await deliver()
        if (failure !== null) {
          console.error(
            "Could not send the password reset email:",
            failure.name,
          )
        }
      })
    }
    return { status: "sent" }
  }

  /** Whether the link in the address can still be used. */
  async function loadResetLink(
    tokenParam: string,
  ): Promise<{ readonly isUsable: boolean }> {
    await connection()
    if (
      tokenParam === "" ||
      tokenParam.length > MAX_TOKEN_LENGTH
    ) {
      return { isUsable: false }
    }
    const checked = await dependencies.checkResetLink.call({
      token: tokenParam,
    })
    if (checked.status === "failure") {
      console.error(
        "Could not check the reset link:",
        checked.error.name,
      )
      return { isUsable: false }
    }
    return { isUsable: checked.data }
  }

  async function resetPasswordFromForm(
    token: string,
    formData: FormData,
  ): Promise<ResetPasswordFormState> {
    const password = readText(formData, "password")
    const confirmation = readText(formData, "confirmation")
    if (
      token.length > MAX_TOKEN_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH ||
      confirmation.length > MAX_PASSWORD_LENGTH
    ) {
      return {
        status: "rejected",
        message: RESET_LINK_MESSAGE,
      }
    }
    const result = await dependencies.resetPassword.call({
      token,
      password,
      confirmation,
    })
    if (result.status === "reset") {
      redirect(`${SIGN_IN_PATH}?reset=done`)
    }
    return describeResetFailure(result)
  }

  return {
    requestResetFromForm,
    loadResetLink,
    resetPasswordFromForm,
    loadCurrentAdmin,
    requireAdmin,
    signInWithForm,
    signOutCurrent,
  }
}

async function storeSessionCookie(
  token: string,
  expiresAt: Date,
) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

function describeRejection(
  result: Exclude<SignInResult, { status: "signed-in" }>,
  email: string,
): SignInFormState {
  if (result.status === "locked") {
    return rejected(
      `Too many attempts. Try again in about ${LOCKOUT_MINUTES} minutes.`,
      email,
    )
  }
  if (result.status === "failed") {
    console.error("Sign-in failed:", result.error.name)
    return rejected(
      "Could not sign in. Try again in a moment.",
      email,
    )
  }
  return rejected("Invalid email or password.", email)
}

function rejected(
  message: string,
  email: string,
): SignInFormState {
  return { status: "rejected", message, email }
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function describeResetFailure(
  result: Exclude<ResetPasswordResult, { status: "reset" }>,
): ResetPasswordFormState {
  if (result.status === "weak") {
    return {
      status: "rejected",
      message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    }
  }
  if (result.status === "mismatch") {
    return {
      status: "rejected",
      message: "The two passwords do not match.",
    }
  }
  if (result.status === "failed") {
    console.error(
      "Password reset failed:",
      result.error.name,
    )
    return {
      status: "rejected",
      message:
        "Could not save the password. Try again in a moment.",
    }
  }
  return { status: "rejected", message: RESET_LINK_MESSAGE }
}
