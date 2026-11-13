import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { SessionsRepository } from "../repositories/sessions-repository"
import { SignOut } from "./sign-out"

function buildSessions(
  remove: SessionsRepository["delete"],
): SessionsRepository {
  return {
    create: vi.fn(),
    findAdminByToken: vi.fn(),
    delete: remove,
  }
}

describe("SignOut", () => {
  it("deletes the session of the token", async () => {
    const remove = vi.fn(async () => succeed(undefined))

    const result = await new SignOut(
      buildSessions(remove),
    ).call({
      token: "t",
    })

    expect(remove).toHaveBeenCalledWith("t")
    expect(result).toEqual(succeed(undefined))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new SignOut(
      buildSessions(vi.fn(async () => failure)),
    ).call({ token: "t" })

    expect(result).toBe(failure)
  })
})
