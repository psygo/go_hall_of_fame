import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { PasswordResetRecord } from "../entities/password-reset"
import type { PasswordResetsRepository } from "../repositories/password-resets-repository"
import { CheckResetLink } from "./check-reset-link"

const now = new Date("2026-01-01T12:00:00Z")
const record: PasswordResetRecord = {
  id: 1,
  adminId: 1,
  expiresAt: new Date(now.getTime() + 1000),
  usedAt: null,
}

function build(
  found: Awaited<
    ReturnType<PasswordResetsRepository["findByToken"]>
  >,
) {
  const resets: PasswordResetsRepository = {
    create: vi.fn(),
    findByToken: vi.fn(async () => found),
    complete: vi.fn(),
  }
  return new CheckResetLink(resets, () => now)
}

describe("CheckResetLink", () => {
  it("is true for a usable link", async () => {
    expect(
      await build(succeed(record)).call({ token: "t" }),
    ).toEqual(succeed(true))
  })

  it.each([
    ["an unknown token", succeed(null)],
    ["a used link", succeed({ ...record, usedAt: now })],
    [
      "an expired link",
      succeed({ ...record, expiresAt: now }),
    ],
  ])("is false for %s", async (_name, found) => {
    expect(await build(found).call({ token: "t" })).toEqual(
      succeed(false),
    )
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    expect(await build(failure).call({ token: "t" })).toBe(
      failure,
    )
  })
})
