import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { NominationDraft } from "../entities/nomination"
import type { NominationsRepository } from "../repositories/nominations-repository"
import { SubmitNomination } from "./submit-nomination"

function buildDraft(
  overrides: Partial<NominationDraft> = {},
): NominationDraft {
  return {
    name: "Shusaku",
    category: "player",
    email: "fan@example.com",
    caseForInduction: "Reasons",
    ...overrides,
  }
}

function buildRepository(
  submit: NominationsRepository["submit"],
): NominationsRepository {
  return { submit }
}

describe("SubmitNomination", () => {
  it("saves a valid draft and returns it as accepted", async () => {
    const submit = vi.fn(async () => succeed(undefined))
    const draft = buildDraft()

    const result = await new SubmitNomination(
      buildRepository(submit),
    ).call({ draft })

    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledWith(draft)
    expect(result).toEqual({ status: "accepted", draft })
  })

  it("trims the draft before saving and returns the trimmed draft", async () => {
    const submit = vi.fn(async () => succeed(undefined))

    const result = await new SubmitNomination(
      buildRepository(submit),
    ).call({
      draft: buildDraft({
        name: "  Shusaku ",
        email: " fan@example.com ",
        caseForInduction: "  Reasons  ",
      }),
    })

    const trimmed = buildDraft()
    expect(submit).toHaveBeenCalledWith(trimmed)
    expect(result).toEqual({
      status: "accepted",
      draft: trimmed,
    })
  })

  it("returns invalid errors and does not save when the name is blank after trimming", async () => {
    const submit = vi.fn(async () => succeed(undefined))

    const result = await new SubmitNomination(
      buildRepository(submit),
    ).call({ draft: buildDraft({ name: "   " }) })

    expect(result).toEqual({
      status: "invalid",
      errors: {
        name: "Enter the name of the player or game.",
      },
    })
    expect(submit).not.toHaveBeenCalled()
  })

  it("returns invalid errors and does not save when the email is malformed", async () => {
    const submit = vi.fn(async () => succeed(undefined))

    const result = await new SubmitNomination(
      buildRepository(submit),
    ).call({ draft: buildDraft({ email: "a@b" }) })

    expect(result).toEqual({
      status: "invalid",
      errors: { email: "Enter a valid email address." },
    })
    expect(submit).not.toHaveBeenCalled()
  })

  it("returns failed when the repository fails", async () => {
    const submit = vi.fn(async () =>
      fail(new Error("db down")),
    )

    const result = await new SubmitNomination(
      buildRepository(submit),
    ).call({ draft: buildDraft() })

    expect(result).toEqual({
      status: "failed",
      error: new Error("db down"),
    })
  })
})
