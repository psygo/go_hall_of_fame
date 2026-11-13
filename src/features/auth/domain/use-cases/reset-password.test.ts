import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import { MIN_PASSWORD_LENGTH } from "../entities/admin"
import type { PasswordResetRecord } from "../entities/password-reset"
import type { PasswordEncoder } from "../repositories/password-encoder"
import type { PasswordResetsRepository } from "../repositories/password-resets-repository"
import { ResetPassword } from "./reset-password"

const now = new Date("2026-01-01T12:00:00Z")
const record: PasswordResetRecord = {
  id: 3,
  adminId: 9,
  expiresAt: new Date(now.getTime() + 1000),
  usedAt: null,
}
const password = "a".repeat(MIN_PASSWORD_LENGTH)

function build({
  found = succeed<PasswordResetRecord | null>(record),
  completed = succeed(true),
}: {
  found?: Awaited<
    ReturnType<PasswordResetsRepository["findByToken"]>
  >
  completed?: Awaited<
    ReturnType<PasswordResetsRepository["complete"]>
  >
} = {}) {
  const resets: PasswordResetsRepository = {
    create: vi.fn(),
    findByToken: vi.fn(async () => found),
    complete: vi.fn(async () => completed),
  }
  const encoder: PasswordEncoder = {
    hash: vi.fn(async () => "hashed"),
  }
  return {
    resets,
    encoder,
    useCase: new ResetPassword(resets, encoder, () => now),
  }
}

const params = {
  token: "t",
  password,
  confirmation: password,
}

describe("ResetPassword", () => {
  it("hashes the password and completes the reset", async () => {
    const { useCase, resets, encoder } = build()

    expect(await useCase.call(params)).toEqual({
      status: "reset",
    })
    expect(encoder.hash).toHaveBeenCalledWith(password)
    expect(resets.complete).toHaveBeenCalledWith({
      resetId: 3,
      adminId: 9,
      passwordHash: "hashed",
    })
  })

  it("rejects a short password before touching the link", async () => {
    const { useCase, resets } = build()

    expect(
      await useCase.call({
        ...params,
        password: "short",
        confirmation: "short",
      }),
    ).toEqual({ status: "weak" })
    expect(resets.findByToken).not.toHaveBeenCalled()
  })

  it("rejects a mismatched confirmation", async () => {
    const { useCase, resets } = build()

    expect(
      await useCase.call({
        ...params,
        confirmation: password + "x",
      }),
    ).toEqual({ status: "mismatch" })
    expect(resets.findByToken).not.toHaveBeenCalled()
  })

  it.each([
    ["unknown", succeed(null)],
    ["used", succeed({ ...record, usedAt: now })],
    ["expired", succeed({ ...record, expiresAt: now })],
  ])(
    "reports an invalid link when it is %s",
    async (_n, found) => {
      const { useCase, resets, encoder } = build({ found })

      expect(await useCase.call(params)).toEqual({
        status: "invalid-link",
      })
      expect(encoder.hash).not.toHaveBeenCalled()
      expect(resets.complete).not.toHaveBeenCalled()
    },
  )

  it("reports an invalid link when another request used it first", async () => {
    const { useCase } = build({ completed: succeed(false) })

    expect(await useCase.call(params)).toEqual({
      status: "invalid-link",
    })
  })

  it("reports a failure of the lookup or of completing", async () => {
    const error = new Error("db down")

    expect(
      await build({ found: fail(error) }).useCase.call(
        params,
      ),
    ).toEqual({ status: "failed", error })
    expect(
      await build({ completed: fail(error) }).useCase.call(
        params,
      ),
    ).toEqual({ status: "failed", error })
  })
})
