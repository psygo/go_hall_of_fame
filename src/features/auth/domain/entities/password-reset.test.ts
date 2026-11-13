import { describe, expect, it } from "vitest"

import {
  cooldownStart,
  isResetLinkUsable,
  RESET_COOLDOWN_SECONDS,
  RESET_LINK_MINUTES,
  resetLinkExpiry,
  type PasswordResetRecord,
} from "./password-reset"

const now = new Date("2026-01-01T12:00:00Z")

function buildRecord(
  overrides: Partial<PasswordResetRecord> = {},
): PasswordResetRecord {
  return {
    id: 1,
    adminId: 1,
    expiresAt: new Date(now.getTime() + 60_000),
    usedAt: null,
    ...overrides,
  }
}

describe("resetLinkExpiry", () => {
  it("is the link lifetime after now", () => {
    expect(resetLinkExpiry(now).getTime()).toBe(
      now.getTime() + RESET_LINK_MINUTES * 60_000,
    )
  })
})

describe("isResetLinkUsable", () => {
  it("accepts an unused link before it expires", () => {
    expect(isResetLinkUsable(buildRecord(), now)).toBe(true)
  })

  it("rejects a used link", () => {
    expect(
      isResetLinkUsable(buildRecord({ usedAt: now }), now),
    ).toBe(false)
  })

  it("rejects a link at or past its expiry", () => {
    expect(
      isResetLinkUsable(
        buildRecord({ expiresAt: now }),
        now,
      ),
    ).toBe(false)
    expect(
      isResetLinkUsable(
        buildRecord({
          expiresAt: new Date(now.getTime() - 1),
        }),
        now,
      ),
    ).toBe(false)
  })
})

describe("cooldownStart", () => {
  it("is the cooldown window before now", () => {
    expect(cooldownStart(now).getTime()).toBe(
      now.getTime() - RESET_COOLDOWN_SECONDS * 1000,
    )
  })
})
