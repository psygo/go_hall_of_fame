import { describe, expect, it, vi } from "vitest"

import type { PasswordResetsDataSource } from "../data-sources/password-resets-data-source"
import { PasswordResetRecordModel } from "../models/password-reset-record-model"
import { PasswordResetsRepositoryImpl } from "./password-resets-repository-impl"

function buildRepository(
  dataSource: Partial<
    Record<
      keyof PasswordResetsDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new PasswordResetsRepositoryImpl(
    dataSource as unknown as PasswordResetsDataSource,
  )
}

const raw = {
  id: 1,
  adminId: 2,
  expiresAt: new Date("2026-01-01T12:00:00Z"),
  usedAt: null,
}

describe("PasswordResetsRepositoryImpl", () => {
  it("creates a link and returns its token", async () => {
    const insert = vi.fn(async () => "token")
    const reset = {
      adminId: 2,
      expiresAt: raw.expiresAt,
      sentAfter: raw.expiresAt,
    }

    expect(
      await buildRepository({ insert }).create(reset),
    ).toEqual({ status: "success", data: "token" })
    expect(insert).toHaveBeenCalledWith(reset)
  })

  it("returns null when a recent link already exists", async () => {
    const insert = vi.fn(async () => null)

    expect(
      await buildRepository({ insert }).create({
        adminId: 2,
        expiresAt: raw.expiresAt,
        sentAfter: raw.expiresAt,
      }),
    ).toEqual({ status: "success", data: null })
  })

  it("maps a found record to a plain entity", async () => {
    const repository = buildRepository({
      fetchByToken: vi.fn(async () =>
        PasswordResetRecordModel.fromRawData(raw),
      ),
    })

    const state = await repository.findByToken("t")

    expect(state).toEqual({ status: "success", data: raw })
    if (state.status === "success" && state.data !== null) {
      expect(Object.getPrototypeOf(state.data)).toBe(
        Object.prototype,
      )
    }
  })

  it("returns null for an unknown token", async () => {
    const repository = buildRepository({
      fetchByToken: vi.fn(async () => null),
    })

    expect(await repository.findByToken("t")).toEqual({
      status: "success",
      data: null,
    })
  })

  it("passes the completion through and returns whether it applied", async () => {
    const complete = vi.fn(async () => true)
    const completion = {
      resetId: 1,
      adminId: 2,
      passwordHash: "h",
    }

    expect(
      await buildRepository({ complete }).complete(
        completion,
      ),
    ).toEqual({ status: "success", data: true })
    expect(complete).toHaveBeenCalledWith(completion)
  })

  it.each([
    [
      "create",
      (r: PasswordResetsRepositoryImpl) =>
        r.create({
          adminId: 1,
          expiresAt: raw.expiresAt,
          sentAfter: raw.expiresAt,
        }),
    ],
    [
      "findByToken",
      (r: PasswordResetsRepositoryImpl) =>
        r.findByToken("t"),
    ],
    [
      "complete",
      (r: PasswordResetsRepositoryImpl) =>
        r.complete({
          resetId: 1,
          adminId: 1,
          passwordHash: "h",
        }),
    ],
  ])(
    "turns a data source error into a failure in %s",
    async (_name, run) => {
      const cause = new Error("db down")
      const boom = vi.fn(async () => {
        throw cause
      })
      const repository = buildRepository({
        insert: boom,
        fetchByToken: boom,
        complete: boom,
      })

      expect(await run(repository)).toEqual({
        status: "failure",
        error: cause,
      })
    },
  )
})
