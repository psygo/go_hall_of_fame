import type { NominationCategory } from "./nomination"

export const NOMINATION_STATUSES = [
  "pending",
  "accepted",
  "declined",
] as const

export type NominationStatus =
  (typeof NOMINATION_STATUSES)[number]

/** A nomination as stored, for the admin to review. */
export type NominationRecord = {
  readonly id: number
  readonly name: string
  readonly category: NominationCategory
  readonly email: string
  readonly caseForInduction: string
  readonly status: NominationStatus
  readonly createdAt: Date
}

export function isNominationStatus(
  value: unknown,
): value is NominationStatus {
  return NOMINATION_STATUSES.some(
    (status) => status === value,
  )
}
