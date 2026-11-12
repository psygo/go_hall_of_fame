import { describe, expect, it, vi } from "vitest"

import type { CriteriaDataSource } from "../data-sources/criteria-data-source"
import { CriterionModel } from "../models/criterion-model"
import { CriteriaRepositoryImpl } from "./criteria-repository-impl"

const rawCriterion = {
  position: 1,
  title: "Mastery",
  text: "Text",
}

function buildRepository(
  fetchAll: ReturnType<typeof vi.fn>,
) {
  return new CriteriaRepositoryImpl({
    fetchAll,
  } as unknown as CriteriaDataSource)
}

describe("CriteriaRepositoryImpl", () => {
  it("maps the models to plain entities", async () => {
    const repository = buildRepository(
      vi.fn(async () => [
        CriterionModel.fromRawData(rawCriterion),
      ]),
    )

    const state = await repository.listAll()

    expect(state).toEqual({
      status: "success",
      data: [rawCriterion],
    })
    if (state.status === "success") {
      expect(Object.getPrototypeOf(state.data[0])).toBe(
        Object.prototype,
      )
    }
  })

  it("returns a failure when the data source throws", async () => {
    const cause = new Error("db down")
    const repository = buildRepository(
      vi.fn(async () => {
        throw cause
      }),
    )

    expect(await repository.listAll()).toEqual({
      status: "failure",
      error: cause,
    })
  })
})
