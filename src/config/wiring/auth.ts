import "server-only"

import { AdminsDataSource } from "@/features/auth/data/data-sources/admins-data-source"
import { PasswordHasher } from "@/features/auth/data/data-sources/password-hasher"
import { SessionsDataSource } from "@/features/auth/data/data-sources/sessions-data-source"
import { AdminsRepositoryImpl } from "@/features/auth/data/repositories/admins-repository-impl"
import { PasswordVerifierImpl } from "@/features/auth/data/repositories/password-verifier-impl"
import { SessionsRepositoryImpl } from "@/features/auth/data/repositories/sessions-repository-impl"
import { PasswordResetsDataSource } from "@/features/auth/data/data-sources/password-resets-data-source"
import { ResetEmailDataSource } from "@/features/auth/data/data-sources/reset-email-data-source"
import { PasswordEncoderImpl } from "@/features/auth/data/repositories/password-encoder-impl"
import { PasswordResetsRepositoryImpl } from "@/features/auth/data/repositories/password-resets-repository-impl"
import { ResetMailerImpl } from "@/features/auth/data/repositories/reset-mailer-impl"
import { CheckResetLink } from "@/features/auth/domain/use-cases/check-reset-link"
import { RequestPasswordReset } from "@/features/auth/domain/use-cases/request-password-reset"
import { ResetPassword } from "@/features/auth/domain/use-cases/reset-password"
import { GetAdminBySession } from "@/features/auth/domain/use-cases/get-admin-by-session"
import { SignIn } from "@/features/auth/domain/use-cases/sign-in"
import { SignOut } from "@/features/auth/domain/use-cases/sign-out"
import { createAuthState } from "@/features/auth/presentation/state/auth-state"
import type { RequireAdmin } from "@/core/admin-guard"
import { resolveSiteUrl } from "@/core/site-url"

import { database } from "./infrastructure"

const clock = () => new Date()
const isProduction = process.env.NODE_ENV === "production"
const sessions = new SessionsRepositoryImpl(
  new SessionsDataSource(database),
)
const admins = new AdminsRepositoryImpl(
  new AdminsDataSource(database),
)
const hasher = new PasswordHasher()
const passwordResets = new PasswordResetsRepositoryImpl(
  new PasswordResetsDataSource(database),
)

const resetMailer = new ResetMailerImpl(
  new ResetEmailDataSource({
    apiKey: process.env.RESEND_API_KEY || null,
    from: process.env.EMAIL_FROM || null,
    isProduction,
  }),
)

export const authState = createAuthState({
  signIn: new SignIn(
    admins,
    sessions,
    new PasswordVerifierImpl(hasher),
    clock,
  ),
  signOut: new SignOut(sessions),
  getAdminBySession: new GetAdminBySession(sessions, clock),
  requestPasswordReset: new RequestPasswordReset(
    admins,
    passwordResets,
    resetMailer,
    resolveSiteUrl(process.env, isProduction),
    clock,
  ),
  checkResetLink: new CheckResetLink(passwordResets, clock),
  resetPassword: new ResetPassword(
    passwordResets,
    new PasswordEncoderImpl(hasher),
    clock,
  ),
})

/** What the other features' admin handlers receive, so they never import the auth feature. */
export const requireAdmin: RequireAdmin = async () => {
  await authState.requireAdmin()
}
