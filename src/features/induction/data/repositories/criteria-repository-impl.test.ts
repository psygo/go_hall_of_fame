import { describe, expect, it, vi } from "vitest"

import type { CriterionDraft } from "../../domain/entities/criterion-draft"
import type { CriteriaDataSource } from "../data-sources/criteria-data-source"
import { CriterionModel } from "../models/criterion-model"
import { CriteriaRepositoryImpl } from "./criteria-repository-impl"

const rawCriterion = {
  id: 5,
  position: 1,
  title: "Mastery",
  text: "Text",
}

const draft: CriterionDraft = {
  position: 1,
  title: "Mastery",
  text: "Text",
}

function buildRepository(
  dataSource: Partial<
    Record<
      keyof CriteriaDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new CriteriaRepositoryImpl(
    dataSource as unknown as CriteriaDataSource,
  )
}

function throwing(cause: Error) {
  return vi.fn(async () => {
    throw cause
  })
}

describe("CriteriaRepositoryImpl", () => {
  describe("listAll", () => {
    it("maps the models to plain entities", async () => {
      const repository = buildRepository({
        fetchAll: vi.fn(async () => [
          CriterionModel.fromRawData(rawCriterion),
        ]),
      })

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

      expect(
        await buildRepository({
          fetchAll: throwing(cause),
        }).listAll(),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("findById", () => {
    it("maps the model to a plain entity", async () => {
      const fetchById = vi.fn(async () =>
        CriterionModel.fromRawData(rawCriterion),
      )

      const state = await buildRepository({
        fetchById,
      }).findById(5)

      expect(fetchById).toHaveBeenCalledWith(5)
      expect(state).toEqual({
        status: "success",
        data: rawCriterion,
      })
    })

    it("returns a successful null when there is no such criterion", async () => {
      const repository = buildRepository({
        fetchById: vi.fn(async () => null),
      })

      expect(await repository.findById(1)).toEqual({
        status: "success",
        data: null,
      })
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          fetchById: throwing(cause),
        }).findById(1),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("save", () => {
    it("upserts the draft with the id", async () => {
      const upsert = vi.fn(async () => undefined)

      const state = await buildRepository({ upsert }).save(
        draft,
        5,
      )

      expect(upsert).toHaveBeenCalledWith(draft, 5)
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          upsert: throwing(cause),
        }).save(draft, null),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("delete", () => {
    it("deletes by id", async () => {
      const remove = vi.fn(async () => undefined)

      const state = await buildRepository({
        delete: remove,
      }).delete(5)

      expect(remove).toHaveBeenCalledWith(5)
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          delete: throwing(cause),
        }).delete(5),
      ).toEqual({ status: "failure", error: cause })
    })
  })
})
