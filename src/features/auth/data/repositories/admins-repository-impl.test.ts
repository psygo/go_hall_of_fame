import { describe, expect, it, vi } from "vitest"

import type { AdminsDataSource } from "../data-sources/admins-data-source"
import { AdminCredentialsModel } from "../models/admin-model"
import { AdminsRepositoryImpl } from "./admins-repository-impl"

const lockedUntil = new Date("2026-05-01T12:15:00Z")
const rawCredentials = {
  id: 1,
  name: "Ada",
  email: "ada@example.com",
  passwordHash: "hash",
  failedAttempts: 3,
  lockedUntil,
}

function buildRepository(
  dataSource: Partial<
    Record<keyof AdminsDataSource, ReturnType<typeof vi.fn>>
  >,
) {
  return new AdminsRepositoryImpl(
    dataSource as unknown as AdminsDataSource,
  )
}

describe("AdminsRepositoryImpl", () => {
  describe("findCredentialsByEmail", () => {
    it("maps the model to a plain entity", async () => {
      const fetchCredentialsByEmail = vi.fn(async () =>
        AdminCredentialsModel.fromRawData(rawCredentials),
      )

      const state = await buildRepository({
        fetchCredentialsByEmail,
      }).findCredentialsByEmail("ada@example.com")

      expect(fetchCredentialsByEmail).toHaveBeenCalledWith(
        "ada@example.com",
      )
      expect(state).toEqual({
        status: "success",
        data: {
          admin: {
            id: 1,
            name: "Ada",
            email: "ada@example.com",
          },
          passwordHash: "hash",
          failedAttempts: 3,
          lockedUntil,
        },
      })
      if (
        state.status === "success" &&
        state.data !== null
      ) {
        expect(Object.getPrototypeOf(state.data)).toBe(
          Object.prototype,
        )
      }
    })

    it("returns a successful null for an unknown email", async () => {
      const repository = buildRepository({
        fetchCredentialsByEmail: vi.fn(async () => null),
      })

      expect(
        await repository.findCredentialsByEmail("x@y.z"),
      ).toEqual({ status: "success", data: null })
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        fetchCredentialsByEmail: vi.fn(async () => {
          throw cause
        }),
      })

      expect(
        await repository.findCredentialsByEmail("x@y.z"),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("recordFailedAttempt", () => {
    it("passes the record to the data source", async () => {
      const updateFailedAttempts = vi.fn(
        async () => undefined,
      )
      const record = {
        adminId: 1,
        failedAttempts: 5,
        lockedUntil,
      }

      const state = await buildRepository({
        updateFailedAttempts,
      }).recordFailedAttempt(record)

      expect(updateFailedAttempts).toHaveBeenCalledWith(
        record,
      )
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        updateFailedAttempts: vi.fn(async () => {
          throw cause
        }),
      })

      expect(
        await repository.recordFailedAttempt({
          adminId: 1,
          failedAttempts: 1,
          lockedUntil: null,
        }),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("clearFailedAttempts", () => {
    it("resets the counter and the lock", async () => {
      const updateFailedAttempts = vi.fn(
        async () => undefined,
      )

      const state = await buildRepository({
        updateFailedAttempts,
      }).clearFailedAttempts(7)

      expect(updateFailedAttempts).toHaveBeenCalledWith({
        adminId: 7,
        failedAttempts: 0,
        lockedUntil: null,
      })
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        updateFailedAttempts: vi.fn(async () => {
          throw cause
        }),
      })

      expect(
        await repository.clearFailedAttempts(7),
      ).toEqual({
        status: "failure",
        error: cause,
      })
    })
  })
})
