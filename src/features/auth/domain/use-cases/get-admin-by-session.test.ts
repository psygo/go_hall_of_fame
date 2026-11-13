import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Admin } from "../entities/admin"
import type { SessionsRepository } from "../repositories/sessions-repository"
import { GetAdminBySession } from "./get-admin-by-session"

const now = new Date("2026-05-01T12:00:00.000Z")
const admin: Admin = {
  id: 1,
  name: "Ada",
  email: "ada@example.com",
}

function buildSessions(
  findAdminByToken: SessionsRepository["findAdminByToken"],
): SessionsRepository {
  return {
    create: vi.fn(),
    findAdminByToken,
    delete: vi.fn(),
  }
}

describe("GetAdminBySession", () => {
  it("looks the token up with the clock's now", async () => {
    const find = vi.fn(async () =>
      succeed<Admin | null>(admin),
    )

    const result = await new GetAdminBySession(
      buildSessions(find),
      () => now,
    ).call({ token: "t" })

    expect(find).toHaveBeenCalledWith({ token: "t", now })
    expect(result).toEqual(succeed(admin))
  })

  it("returns a successful null for an unknown or expired token", async () => {
    const result = await new GetAdminBySession(
      buildSessions(vi.fn(async () => succeed(null))),
      () => now,
    ).call({ token: "t" })

    expect(result).toEqual(succeed(null))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new GetAdminBySession(
      buildSessions(vi.fn(async () => failure)),
      () => now,
    ).call({ token: "t" })

    expect(result).toBe(failure)
  })
})
