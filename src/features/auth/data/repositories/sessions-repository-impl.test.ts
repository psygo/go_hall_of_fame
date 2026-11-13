import { describe, expect, it, vi } from "vitest"

import type { SessionsDataSource } from "../data-sources/sessions-data-source"
import { AdminModel } from "../models/admin-model"
import { SessionsRepositoryImpl } from "./sessions-repository-impl"

const rawAdmin = {
  id: 1,
  name: "Ada",
  email: "ada@example.com",
}
const now = new Date("2026-05-01T12:00:00Z")

function buildRepository(
  dataSource: Partial<
    Record<
      keyof SessionsDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new SessionsRepositoryImpl(
    dataSource as unknown as SessionsDataSource,
  )
}

function throwing(cause: Error) {
  return vi.fn(async () => {
    throw cause
  })
}

describe("SessionsRepositoryImpl", () => {
  describe("create", () => {
    it("returns the token of the data source", async () => {
      const insert = vi.fn(async () => "secret-token")
      const session = { adminId: 1, expiresAt: now }

      const state = await buildRepository({
        insert,
      }).create(session)

      expect(insert).toHaveBeenCalledWith(session)
      expect(state).toEqual({
        status: "success",
        data: "secret-token",
      })
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          insert: throwing(cause),
        }).create({ adminId: 1, expiresAt: now }),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("findAdminByToken", () => {
    it("maps the model to a plain entity", async () => {
      const fetchAdminByToken = vi.fn(async () =>
        AdminModel.fromRawData(rawAdmin),
      )

      const state = await buildRepository({
        fetchAdminByToken,
      }).findAdminByToken({ token: "t", now })

      expect(fetchAdminByToken).toHaveBeenCalledWith({
        token: "t",
        now,
      })
      expect(state).toEqual({
        status: "success",
        data: rawAdmin,
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

    it("returns a successful null for an unknown or expired token", async () => {
      const repository = buildRepository({
        fetchAdminByToken: vi.fn(async () => null),
      })

      expect(
        await repository.findAdminByToken({
          token: "t",
          now,
        }),
      ).toEqual({ status: "success", data: null })
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          fetchAdminByToken: throwing(cause),
        }).findAdminByToken({ token: "t", now }),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("delete", () => {
    it("deletes by token", async () => {
      const remove = vi.fn(async () => undefined)

      const state = await buildRepository({
        delete: remove,
      }).delete("t")

      expect(remove).toHaveBeenCalledWith("t")
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          delete: throwing(cause),
        }).delete("t"),
      ).toEqual({ status: "failure", error: cause })
    })
  })
})
