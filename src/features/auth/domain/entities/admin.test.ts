import { describe, expect, it } from "vitest"

import {
  initialsOf,
  isLocked,
  isPasswordLongEnough,
  LOCKOUT_MINUTES,
  lockoutAfterFailure,
  MAX_FAILED_ATTEMPTS,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  SESSION_DAYS,
  sessionExpiry,
  type AdminCredentials,
} from "./admin"

const now = new Date("2026-05-01T12:00:00.000Z")

function buildCredentials(
  lockedUntil: Date | null,
): AdminCredentials {
  return {
    admin: { id: 1, name: "Ada", email: "ada@example.com" },
    passwordHash: "hash",
    failedAttempts: 0,
    lockedUntil,
  }
}

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Ada@Example.COM \n")).toBe(
      "ada@example.com",
    )
  })
})

describe("isLocked", () => {
  it("is false when there is no lock", () => {
    expect(isLocked(buildCredentials(null), now)).toBe(
      false,
    )
  })

  it("is true while the lock is in the future", () => {
    const until = new Date(now.getTime() + 1)

    expect(isLocked(buildCredentials(until), now)).toBe(
      true,
    )
  })

  it("is false exactly at the boundary", () => {
    expect(
      isLocked(
        buildCredentials(new Date(now.getTime())),
        now,
      ),
    ).toBe(false)
  })

  it("is false once the lock has passed", () => {
    const until = new Date(now.getTime() - 1)

    expect(isLocked(buildCredentials(until), now)).toBe(
      false,
    )
  })
})

describe("lockoutAfterFailure", () => {
  it("does not lock while attempts remain", () => {
    expect(
      lockoutAfterFailure(MAX_FAILED_ATTEMPTS - 1, now),
    ).toBeNull()
    expect(lockoutAfterFailure(0, now)).toBeNull()
  })

  it("locks for the lockout time at the fifth failure", () => {
    expect(MAX_FAILED_ATTEMPTS).toBe(5)

    expect(lockoutAfterFailure(5, now)).toEqual(
      new Date(now.getTime() + LOCKOUT_MINUTES * 60_000),
    )
  })

  it("keeps locking beyond the limit", () => {
    expect(lockoutAfterFailure(6, now)).toEqual(
      new Date("2026-05-01T12:15:00.000Z"),
    )
  })

  it("does not change the date it was given", () => {
    const start = new Date(now.getTime())

    lockoutAfterFailure(5, start)

    expect(start).toEqual(now)
  })
})

describe("sessionExpiry", () => {
  it("is seven days after now", () => {
    expect(SESSION_DAYS).toBe(7)
    expect(sessionExpiry(now)).toEqual(
      new Date("2026-05-08T12:00:00.000Z"),
    )
  })
})

describe("initialsOf", () => {
  it.each([
    ["Ada Lovelace", "AL"],
    ["Ada", "A"],
    ["ada lovelace", "AL"],
    ["ada", "A"],
    ["Ada Augusta King Lovelace", "AL"],
    ["  Ada   Lovelace  ", "AL"],
    ["", "?"],
    ["   ", "?"],
  ])("turns %j into %j", (name, expected) => {
    expect(initialsOf(name)).toBe(expected)
  })
})

describe("isPasswordLongEnough", () => {
  it("rejects 11 characters and accepts 12", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(12)
    expect(isPasswordLongEnough("a".repeat(11))).toBe(false)
    expect(isPasswordLongEnough("a".repeat(12))).toBe(true)
  })

  it("rejects the empty string and accepts a long one", () => {
    expect(isPasswordLongEnough("")).toBe(false)
    expect(isPasswordLongEnough("a".repeat(200))).toBe(true)
  })
})
