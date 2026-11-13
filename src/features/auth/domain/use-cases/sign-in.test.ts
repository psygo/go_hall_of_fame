import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { AdminCredentials } from "../entities/admin"
import type { AdminsRepository } from "../repositories/admins-repository"
import type { PasswordVerifier } from "../repositories/password-verifier"
import type { SessionsRepository } from "../repositories/sessions-repository"
import { SignIn } from "./sign-in"

const now = new Date("2026-05-01T12:00:00.000Z")
const admin = {
  id: 9,
  name: "Ada Lovelace",
  email: "ada@example.com",
}

function buildCredentials(
  overrides: Partial<AdminCredentials> = {},
): AdminCredentials {
  return {
    admin,
    passwordHash: "stored-hash",
    failedAttempts: 0,
    lockedUntil: null,
    ...overrides,
  }
}

function buildSignIn({
  credentials = buildCredentials(),
  findResult = succeed(credentials),
  verify = vi.fn(async () => true),
  recordResult = succeed(undefined),
  clearResult = succeed(undefined),
  createResult = succeed("secret-token"),
}: {
  credentials?: AdminCredentials | null
  findResult?:
    | ReturnType<typeof succeed<AdminCredentials | null>>
    | ReturnType<typeof fail>
  verify?: ReturnType<typeof vi.fn>
  recordResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
  clearResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
  createResult?:
    | ReturnType<typeof succeed<string>>
    | ReturnType<typeof fail>
} = {}) {
  const admins: AdminsRepository = {
    findCredentialsByEmail: vi.fn(async () => findResult),
    recordFailedAttempt: vi.fn(async () => recordResult),
    clearFailedAttempts: vi.fn(async () => clearResult),
  }
  const sessions: SessionsRepository = {
    create: vi.fn(async () => createResult),
    findAdminByToken: vi.fn(),
    delete: vi.fn(),
  }
  const passwords: PasswordVerifier = { verify }
  return {
    useCase: new SignIn(
      admins,
      sessions,
      passwords,
      () => now,
    ),
    admins,
    sessions,
    verify,
  }
}

describe("SignIn", () => {
  it("looks the admin up by the normalized email", async () => {
    const { useCase, admins } = buildSignIn()

    await useCase.call({
      email: "  Ada@Example.COM ",
      password: "pw",
    })

    expect(
      admins.findCredentialsByEmail,
    ).toHaveBeenCalledWith("ada@example.com")
  })

  describe("unknown email", () => {
    it("returns invalid and still runs the verifier with a null hash", async () => {
      const { useCase, verify, admins } = buildSignIn({
        credentials: null,
        findResult: succeed(null),
      })

      const result = await useCase.call({
        email: "nobody@example.com",
        password: "pw",
      })

      expect(result).toEqual({ status: "invalid" })
      expect(verify).toHaveBeenCalledWith("pw", null)
      expect(
        admins.recordFailedAttempt,
      ).not.toHaveBeenCalled()
    })

    it("returns invalid even if the verifier says true", async () => {
      const { useCase } = buildSignIn({
        findResult: succeed(null),
        verify: vi.fn(async () => true),
      })

      expect(
        await useCase.call({
          email: "x@y.z",
          password: "pw",
        }),
      ).toEqual({ status: "invalid" })
    })
  })

  describe("locked account", () => {
    it("returns locked with the lock time and skips the verifier", async () => {
      const lockedUntil = new Date(now.getTime() + 60_000)
      const { useCase, verify, admins, sessions } =
        buildSignIn({
          credentials: buildCredentials({ lockedUntil }),
          findResult: succeed(
            buildCredentials({ lockedUntil }),
          ),
        })

      const result = await useCase.call({
        email: "ada@example.com",
        password: "right",
      })

      expect(result).toEqual({
        status: "locked",
        until: lockedUntil,
      })
      expect(verify).not.toHaveBeenCalled()
      expect(
        admins.recordFailedAttempt,
      ).not.toHaveBeenCalled()
      expect(sessions.create).not.toHaveBeenCalled()
    })

    it("is no longer locked once the lock time has passed", async () => {
      const credentials = buildCredentials({
        lockedUntil: new Date(now.getTime()),
      })
      const { useCase, verify } = buildSignIn({
        findResult: succeed(credentials),
      })

      const result = await useCase.call({
        email: "ada@example.com",
        password: "right",
      })

      expect(verify).toHaveBeenCalled()
      expect(result.status).toBe("signed-in")
    })
  })

  describe("wrong password", () => {
    it("counts the failure and returns invalid", async () => {
      const credentials = buildCredentials({
        failedAttempts: 1,
      })
      const { useCase, admins, sessions, verify } =
        buildSignIn({
          findResult: succeed(credentials),
          verify: vi.fn(async () => false),
        })

      const result = await useCase.call({
        email: "ada@example.com",
        password: "wrong",
      })

      expect(verify).toHaveBeenCalledWith(
        "wrong",
        "stored-hash",
      )
      expect(
        admins.recordFailedAttempt,
      ).toHaveBeenCalledWith({
        adminId: 9,
        failedAttempts: 2,
        lockedUntil: null,
      })
      expect(result).toEqual({ status: "invalid" })
      expect(sessions.create).not.toHaveBeenCalled()
    })

    it("does not lock at the fourth failure", async () => {
      const { useCase, admins } = buildSignIn({
        findResult: succeed(
          buildCredentials({ failedAttempts: 3 }),
        ),
        verify: vi.fn(async () => false),
      })

      const result = await useCase.call({
        email: "ada@example.com",
        password: "wrong",
      })

      expect(
        admins.recordFailedAttempt,
      ).toHaveBeenCalledWith({
        adminId: 9,
        failedAttempts: 4,
        lockedUntil: null,
      })
      expect(result).toEqual({ status: "invalid" })
    })

    it("locks at the fifth failure and returns the lock time", async () => {
      const { useCase, admins } = buildSignIn({
        findResult: succeed(
          buildCredentials({ failedAttempts: 4 }),
        ),
        verify: vi.fn(async () => false),
      })
      const until = new Date("2026-05-01T12:15:00.000Z")

      const result = await useCase.call({
        email: "ada@example.com",
        password: "wrong",
      })

      expect(
        admins.recordFailedAttempt,
      ).toHaveBeenCalledWith({
        adminId: 9,
        failedAttempts: 5,
        lockedUntil: until,
      })
      expect(result).toEqual({ status: "locked", until })
    })

    it("returns failed when the failure cannot be recorded", async () => {
      const error = new Error("db down")
      const { useCase } = buildSignIn({
        verify: vi.fn(async () => false),
        recordResult: fail(error),
      })

      expect(
        await useCase.call({
          email: "ada@example.com",
          password: "wrong",
        }),
      ).toEqual({ status: "failed", error })
    })
  })

  describe("right password", () => {
    it("clears the attempts and starts a seven-day session", async () => {
      const { useCase, admins, sessions } = buildSignIn({
        findResult: succeed(
          buildCredentials({ failedAttempts: 3 }),
        ),
      })
      const expiresAt = new Date("2026-05-08T12:00:00.000Z")

      const result = await useCase.call({
        email: "ada@example.com",
        password: "right",
      })

      expect(
        admins.clearFailedAttempts,
      ).toHaveBeenCalledWith(9)
      expect(sessions.create).toHaveBeenCalledWith({
        adminId: 9,
        expiresAt,
      })
      expect(result).toEqual({
        status: "signed-in",
        admin,
        token: "secret-token",
        expiresAt,
      })
    })

    it("returns failed when the attempts cannot be cleared", async () => {
      const error = new Error("db down")
      const { useCase, sessions } = buildSignIn({
        clearResult: fail(error),
      })

      const result = await useCase.call({
        email: "ada@example.com",
        password: "right",
      })

      expect(result).toEqual({ status: "failed", error })
      expect(sessions.create).not.toHaveBeenCalled()
    })

    it("returns failed when the session cannot be created", async () => {
      const error = new Error("db down")
      const { useCase } = buildSignIn({
        createResult: fail(error),
      })

      expect(
        await useCase.call({
          email: "ada@example.com",
          password: "right",
        }),
      ).toEqual({ status: "failed", error })
    })
  })

  it("returns failed without checking the password when the lookup fails", async () => {
    const error = new Error("db down")
    const { useCase, verify } = buildSignIn({
      findResult: fail(error),
    })

    const result = await useCase.call({
      email: "ada@example.com",
      password: "pw",
    })

    expect(result).toEqual({ status: "failed", error })
    expect(verify).not.toHaveBeenCalled()
  })

  it("starts counting again once a lockout has lapsed", async () => {
    const { useCase, admins } = buildSignIn({
      credentials: buildCredentials({
        failedAttempts: 5,
        lockedUntil: new Date("2026-05-01T11:00:00.000Z"),
      }),
      verify: vi.fn(async () => false),
    })

    const result = await useCase.call({
      email: "ada@example.com",
      password: "wrong",
    })

    expect(result).toEqual({ status: "invalid" })
    expect(admins.recordFailedAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ failedAttempts: 1 }),
    )
  })
})
