import { describe, expect, it, vi } from "vitest"

import type { NominationDraft } from "../../domain/entities/nomination"
import type { NominationsDataSource } from "../data-sources/nominations-data-source"
import { NominationsRepositoryImpl } from "./nominations-repository-impl"

const draft: NominationDraft = {
  name: "Shusaku",
  category: "player",
  email: "fan@example.com",
  caseForInduction: "Reasons",
}

function buildRepository(insert: ReturnType<typeof vi.fn>) {
  return new NominationsRepositoryImpl({
    insert,
  } as unknown as NominationsDataSource)
}

describe("NominationsRepositoryImpl", () => {
  it("inserts the draft and returns a success", async () => {
    const insert = vi.fn(async () => undefined)

    const state =
      await buildRepository(insert).submit(draft)

    expect(insert).toHaveBeenCalledWith(draft)
    expect(state.status).toBe("success")
  })

  it("returns a failure when the insert throws", async () => {
    const cause = new Error("db down")
    const insert = vi.fn(async () => {
      throw cause
    })

    expect(
      await buildRepository(insert).submit(draft),
    ).toEqual({
      status: "failure",
      error: cause,
    })
  })
})
