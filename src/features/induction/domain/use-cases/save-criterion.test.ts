import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Criterion } from "../entities/criterion"
import type { CriterionForm } from "../entities/criterion-draft"
import type { CriteriaRepository } from "../repositories/criteria-repository"
import { SaveCriterion } from "./save-criterion"

const existing: Criterion = {
  id: 1,
  position: 1,
  title: "Mastery",
  text: "Text",
}

const form: CriterionForm = {
  position: "",
  title: " Influence ",
  text: " Shaped the game. ",
}

function buildRepository(
  overrides: Partial<CriteriaRepository> = {},
): CriteriaRepository {
  return {
    listAll: vi.fn(async () => succeed([existing])),
    findById: vi.fn(),
    save: vi.fn(async () => succeed(undefined)),
    delete: vi.fn(),
    ...overrides,
  }
}

describe("SaveCriterion", () => {
  it("saves the validated draft with a null id when creating", async () => {
    const repository = buildRepository()

    const result = await new SaveCriterion(repository).call(
      {
        id: null,
        form,
      },
    )

    expect(repository.save).toHaveBeenCalledWith(
      {
        position: 2,
        title: "Influence",
        text: "Shaped the game.",
      },
      null,
    )
    expect(result).toEqual({ status: "saved" })
  })

  it("passes the id when editing and lets it keep its position", async () => {
    const repository = buildRepository()

    const result = await new SaveCriterion(repository).call(
      {
        id: 1,
        form: { ...form, position: "1" },
      },
    )

    expect(result).toEqual({ status: "saved" })
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ position: 1 }),
      1,
    )
  })

  it("returns the errors and does not save when another criterion has the position", async () => {
    const repository = buildRepository()

    const result = await new SaveCriterion(repository).call(
      {
        id: null,
        form: { ...form, position: "1" },
      },
    )

    expect(result).toEqual({
      status: "invalid",
      errors: {
        position:
          "Another criterion already has this number.",
      },
    })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when the criteria cannot be listed", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      listAll: vi.fn(async () => fail(error)),
    })

    expect(
      await new SaveCriterion(repository).call({
        id: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when saving fails", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      save: vi.fn(async () => fail(error)),
    })

    expect(
      await new SaveCriterion(repository).call({
        id: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
  })
})
