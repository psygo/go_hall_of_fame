import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { AdminCredentials } from "../entities/admin"
import {
  cooldownStart,
  RESET_LINK_MINUTES,
} from "../entities/password-reset"
import type { AdminsRepository } from "../repositories/admins-repository"
import type { PasswordResetsRepository } from "../repositories/password-resets-repository"
import type { ResetMailer } from "../repositories/reset-mailer"
import { RequestPasswordReset } from "./request-password-reset"

const now = new Date("2026-01-01T12:00:00Z")
const credentials: AdminCredentials = {
  admin: { id: 7, name: "Ada", email: "ada@example.com" },
  passwordHash: "hash",
  failedAttempts: 0,
  lockedUntil: null,
}

function build({
  found = succeed<AdminCredentials | null>(credentials),
  created = succeed<string | null>("tok en+/"),
  sent = succeed(undefined),
  siteUrl = "https://hall.example",
}: {
  found?: Awaited<
    ReturnType<AdminsRepository["findCredentialsByEmail"]>
  >
  created?: Awaited<
    ReturnType<PasswordResetsRepository["create"]>
  >
  sent?: Awaited<ReturnType<ResetMailer["send"]>>
  siteUrl?: string | null
} = {}) {
  const admins: AdminsRepository = {
    findCredentialsByEmail: vi.fn(async () => found),
    recordFailedAttempt: vi.fn(),
    clearFailedAttempts: vi.fn(),
  }
  const resets: PasswordResetsRepository = {
    create: vi.fn(async () => created),
    findByToken: vi.fn(),
    complete: vi.fn(),
  }
  const mailer: ResetMailer = {
    send: vi.fn(async () => sent),
  }
  return {
    admins,
    resets,
    mailer,
    useCase: new RequestPasswordReset(
      admins,
      resets,
      mailer,
      siteUrl,
      () => now,
    ),
  }
}

describe("RequestPasswordReset", () => {
  it("stores a link but does not mail until deliver is called", async () => {
    const { useCase, admins, resets, mailer } = build()

    const result = await useCase.call({
      email: "  ADA@Example.com ",
    })

    expect(result).toEqual({
      status: "requested",
      error: null,
      deliver: expect.any(Function),
    })
    expect(
      admins.findCredentialsByEmail,
    ).toHaveBeenCalledWith("ada@example.com")
    expect(resets.create).toHaveBeenCalledWith({
      adminId: 7,
      expiresAt: new Date(
        now.getTime() + RESET_LINK_MINUTES * 60_000,
      ),
      sentAfter: cooldownStart(now),
    })
    expect(mailer.send).not.toHaveBeenCalled()
  })

  it("mails the encoded link when deliver runs", async () => {
    const { useCase, mailer } = build()
    const result = await useCase.call({ email: "a@b.c" })

    const failure =
      result.status === "requested" && result.deliver
        ? await result.deliver()
        : "no deliver"

    expect(failure).toBeNull()
    expect(mailer.send).toHaveBeenCalledWith({
      to: "ada@example.com",
      name: "Ada",
      link: "https://hall.example/admin/reset-password?token=tok%20en%2B%2F",
      validForMinutes: RESET_LINK_MINUTES,
    })
  })

  it("resolves deliver with the mail failure", async () => {
    const error = new Error("503")
    const { useCase } = build({ sent: fail(error) })
    const result = await useCase.call({ email: "a@b.c" })

    expect(
      result.status === "requested" && result.deliver
        ? await result.deliver()
        : null,
    ).toBe(error)
  })

  it("answers the same, with nothing to deliver, for an unknown email", async () => {
    const { useCase, resets, mailer } = build({
      found: succeed(null),
    })

    expect(await useCase.call({ email: "x@y.z" })).toEqual({
      status: "requested",
      error: null,
      deliver: null,
    })
    expect(resets.create).not.toHaveBeenCalled()
    expect(mailer.send).not.toHaveBeenCalled()
  })

  it("fails when the admin lookup fails", async () => {
    const error = new Error("db down")
    const { useCase } = build({ found: fail(error) })

    expect(await useCase.call({ email: "a@b.c" })).toEqual({
      status: "failed",
      error,
    })
  })

  it("has nothing to deliver, and no error, inside the cooldown", async () => {
    const { useCase, mailer } = build({
      created: succeed(null),
    })

    expect(await useCase.call({ email: "a@b.c" })).toEqual({
      status: "requested",
      error: null,
      deliver: null,
    })
    expect(mailer.send).not.toHaveBeenCalled()
  })

  it("reports a missing site URL in the error and stores nothing", async () => {
    const { useCase, resets } = build({ siteUrl: null })

    const result = await useCase.call({ email: "a@b.c" })

    expect(result).toMatchObject({
      status: "requested",
      deliver: null,
    })
    expect(
      result.status === "requested" &&
        result.error?.message,
    ).toMatch(/SITE_URL/)
    expect(resets.create).not.toHaveBeenCalled()
  })

  it("reports a failure to store the link in the error", async () => {
    const error = new Error("db down")
    const { useCase, mailer } = build({
      created: fail(error),
    })

    expect(await useCase.call({ email: "a@b.c" })).toEqual({
      status: "requested",
      error,
      deliver: null,
    })
    expect(mailer.send).not.toHaveBeenCalled()
  })
})
