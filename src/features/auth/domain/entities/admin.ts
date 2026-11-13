export type Admin = {
  readonly id: number
  readonly name: string
  readonly email: string
}

export type AdminCredentials = {
  readonly admin: Admin
  readonly passwordHash: string
  readonly failedAttempts: number
  readonly lockedUntil: Date | null
}

export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MINUTES = 15
export const SESSION_DAYS = 7
export const MIN_PASSWORD_LENGTH = 12

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isLocked(
  credentials: AdminCredentials,
  now: Date,
): boolean {
  const { lockedUntil } = credentials
  return (
    lockedUntil !== null &&
    lockedUntil.getTime() > now.getTime()
  )
}

/** The lock to apply once a failed attempt has been counted, or null while attempts remain. */
export function lockoutAfterFailure(
  failedAttempts: number,
  now: Date,
): Date | null {
  return failedAttempts >= MAX_FAILED_ATTEMPTS
    ? new Date(now.getTime() + LOCKOUT_MINUTES * MINUTE_MS)
    : null
}

export function sessionExpiry(now: Date): Date {
  return new Date(now.getTime() + SESSION_DAYS * DAY_MS)
}

/** "Ada Lovelace" -> "AL"; one word -> its first letter; blank -> "?". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  const first = words[0][0]
  const last =
    words.length > 1 ? words[words.length - 1][0] : ""
  return `${first}${last}`.toUpperCase()
}

export function isPasswordLongEnough(
  password: string,
): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
}
