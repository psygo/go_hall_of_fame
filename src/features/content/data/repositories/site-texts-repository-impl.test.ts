import { describe, expect, it, vi } from "vitest"

import type { SiteTextsDataSource } from "../data-sources/site-texts-data-source"
import { SiteTextModel } from "../models/site-text-model"
import { SiteTextsRepositoryImpl } from "./site-texts-repository-impl"

function buildRepository(
  dataSource: Partial<
    Record<
      keyof SiteTextsDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new SiteTextsRepositoryImpl(
    dataSource as unknown as SiteTextsDataSource,
  )
}

describe("SiteTextsRepositoryImpl", () => {
  describe("listOverrides", () => {
    it("maps the models to a record by key", async () => {
      const repository = buildRepository({
        fetchAll: vi.fn(async () => [
          SiteTextModel.fromRawData({
            key: "home.title",
            value: "Hello",
          }),
          SiteTextModel.fromRawData({
            key: "players.title",
            value: "Players",
          }),
        ]),
      })

      expect(await repository.listOverrides()).toEqual({
        status: "success",
        data: {
          "home.title": "Hello",
          "players.title": "Players",
        },
      })
    })

    it("returns an empty record when nothing is saved", async () => {
      const repository = buildRepository({
        fetchAll: vi.fn(async () => []),
      })

      expect(await repository.listOverrides()).toEqual({
        status: "success",
        data: {},
      })
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        fetchAll: vi.fn(async () => {
          throw cause
        }),
      })

      expect(await repository.listOverrides()).toEqual({
        status: "failure",
        error: cause,
      })
    })
  })

  describe("apply", () => {
    it("passes the changes to the data source", async () => {
      const apply = vi.fn(async () => undefined)
      const changes = {
        set: { "home.title": "Hello" },
        clear: ["players.title"],
      }

      const state = await buildRepository({ apply }).apply(
        changes,
      )

      expect(apply).toHaveBeenCalledWith(changes)
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        apply: vi.fn(async () => {
          throw cause
        }),
      })

      expect(
        await repository.apply({ set: {}, clear: [] }),
      ).toEqual({ status: "failure", error: cause })
    })
  })
})
