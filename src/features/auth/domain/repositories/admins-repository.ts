import type { DataState } from "@/core/data-state"

import type {
  Admin,
  AdminCredentials,
} from "../entities/admin"

export type FailedAttemptRecord = {
  readonly adminId: number
  readonly failedAttempts: number
  readonly lockedUntil: Date | null
}

export interface AdminsRepository {
  findCredentialsByEmail(
    email: string,
  ): Promise<DataState<AdminCredentials | null>>
  recordFailedAttempt(
    record: FailedAttemptRecord,
  ): Promise<DataState<void>>
  clearFailedAttempts(
    adminId: number,
  ): Promise<DataState<void>>
}

export type { Admin }
