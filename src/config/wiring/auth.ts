import "server-only"

import { AdminsDataSource } from "@/features/auth/data/data-sources/admins-data-source"
import { PasswordHasher } from "@/features/auth/data/data-sources/password-hasher"
import { SessionsDataSource } from "@/features/auth/data/data-sources/sessions-data-source"
import { AdminsRepositoryImpl } from "@/features/auth/data/repositories/admins-repository-impl"
import { PasswordVerifierImpl } from "@/features/auth/data/repositories/password-verifier-impl"
import { SessionsRepositoryImpl } from "@/features/auth/data/repositories/sessions-repository-impl"
import { GetAdminBySession } from "@/features/auth/domain/use-cases/get-admin-by-session"
import { SignIn } from "@/features/auth/domain/use-cases/sign-in"
import { SignOut } from "@/features/auth/domain/use-cases/sign-out"
import { createAuthState } from "@/features/auth/presentation/state/auth-state"
import type { RequireAdmin } from "@/core/admin-guard"

import { database } from "./infrastructure"

const clock = () => new Date()
const sessions = new SessionsRepositoryImpl(
  new SessionsDataSource(database),
)

export const authState = createAuthState({
  signIn: new SignIn(
    new AdminsRepositoryImpl(
      new AdminsDataSource(database),
    ),
    sessions,
    new PasswordVerifierImpl(new PasswordHasher()),
    clock,
  ),
  signOut: new SignOut(sessions),
  getAdminBySession: new GetAdminBySession(sessions, clock),
})

/** What the other features' admin handlers receive, so they never import the auth feature. */
export const requireAdmin: RequireAdmin = async () => {
  await authState.requireAdmin()
}
