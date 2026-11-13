export const RESET_LINK_MINUTES = 60
/** A second request inside this window sends nothing, so the form cannot be used to flood an inbox. */
export const RESET_COOLDOWN_SECONDS = 60

const MINUTE_MS = 60_000
const SECOND_MS = 1_000

/** What is stored about a reset link (never the link's token). */
export type PasswordResetRecord = {
  readonly id: number
  readonly adminId: number
  readonly expiresAt: Date
  readonly usedAt: Date | null
}

export function resetLinkExpiry(now: Date): Date {
  return new Date(
    now.getTime() + RESET_LINK_MINUTES * MINUTE_MS,
  )
}

export function isResetLinkUsable(
  record: PasswordResetRecord,
  now: Date,
): boolean {
  return (
    record.usedAt === null &&
    record.expiresAt.getTime() > now.getTime()
  )
}

/** A link created after this moment is recent enough that no other one should go out yet. */
export function cooldownStart(now: Date): Date {
  return new Date(
    now.getTime() - RESET_COOLDOWN_SECONDS * SECOND_MS,
  )
}

export type RequestResetResult =
  | {
      readonly status: "requested"
      /** Why no link was prepared, for the log only: the visitor always sees the same answer. */
      readonly error: Error | null
      /**
       * Sends the email, and resolves with why it could not (or null). The caller runs it after the
       * response, so an admin's email and an unknown one answer equally fast.
       */
      readonly deliver: (() => Promise<Error | null>) | null
    }
  | { readonly status: "failed"; readonly error: Error }

export type ResetPasswordResult =
  | { readonly status: "reset" }
  | { readonly status: "weak" }
  | { readonly status: "mismatch" }
  | { readonly status: "invalid-link" }
  | { readonly status: "failed"; readonly error: Error }
