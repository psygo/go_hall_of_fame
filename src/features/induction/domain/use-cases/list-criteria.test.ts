import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Criterion } from "../entities/criterion"
import type { CriteriaRepository } from "../repositories/criteria-repository"
import { ListCriteria } from "./list-criteria"

describe("ListCriteria", () => {
  it("returns the criteria of the repository", async () => {
    const criteria: Criterion[] = [
      {
        id: 1,
        position: 1,
        title: "Mastery",
        text: "Text",
      },
    ]
    const repository: CriteriaRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      listAll: vi.fn(async () => succeed(criteria)),
    }

    expect(
      await new ListCriteria(repository).call(),
    ).toEqual(succeed(criteria))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))
    const repository: CriteriaRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      listAll: vi.fn(async () => failure),
    }

    expect(await new ListCriteria(repository).call()).toBe(
      failure,
    )
  })
})
