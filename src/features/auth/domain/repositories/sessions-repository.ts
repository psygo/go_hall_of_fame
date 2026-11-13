import type { DataState } from "@/core/data-state"

import type { Admin } from "../entities/admin"

export type NewSession = {
  readonly adminId: number
  readonly expiresAt: Date
}

export type SessionLookup = {
  readonly token: string
  readonly now: Date
}

export interface SessionsRepository {
  /** Stores a session and returns the secret token for the cookie. */
  create(session: NewSession): Promise<DataState<string>>
  findAdminByToken(
    lookup: SessionLookup,
  ): Promise<DataState<Admin | null>>
  delete(token: string): Promise<DataState<void>>
}
