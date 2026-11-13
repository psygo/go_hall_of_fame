import { describe, expect, it, vi } from "vitest"

import type { TimelineEventDraft } from "../../domain/entities/timeline-event-draft"
import type { TimelineDataSource } from "../data-sources/timeline-data-source"
import { TimelineEventModel } from "../models/timeline-event-model"
import { TimelineRepositoryImpl } from "./timeline-repository-impl"

const rawEvent = {
  id: 7,
  year: 1612,
  title: "Founded",
  text: "Text",
}

const draft: TimelineEventDraft = {
  year: 1612,
  title: "Founded",
  text: "Text",
}

function buildRepository(
  dataSource: Partial<
    Record<
      keyof TimelineDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new TimelineRepositoryImpl(
    dataSource as unknown as TimelineDataSource,
  )
}

function throwing(cause: Error) {
  return vi.fn(async () => {
    throw cause
  })
}

describe("TimelineRepositoryImpl", () => {
  describe("listAll", () => {
    it("maps the models to plain entities", async () => {
      const repository = buildRepository({
        fetchAll: vi.fn(async () => [
          TimelineEventModel.fromRawData(rawEvent),
        ]),
      })

      const state = await repository.listAll()

      expect(state).toEqual({
        status: "success",
        data: [rawEvent],
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
        TimelineEventModel.fromRawData(rawEvent),
      )

      const state = await buildRepository({
        fetchById,
      }).findById(7)

      expect(fetchById).toHaveBeenCalledWith(7)
      expect(state).toEqual({
        status: "success",
        data: rawEvent,
      })
    })

    it("returns a successful null when there is no such event", async () => {
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
        7,
      )

      expect(upsert).toHaveBeenCalledWith(draft, 7)
      expect(state.status).toBe("success")
    })

    it("passes a null id when creating", async () => {
      const upsert = vi.fn(async () => undefined)

      await buildRepository({ upsert }).save(draft, null)

      expect(upsert).toHaveBeenCalledWith(draft, null)
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
      }).delete(7)

      expect(remove).toHaveBeenCalledWith(7)
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          delete: throwing(cause),
        }).delete(7),
      ).toEqual({ status: "failure", error: cause })
    })
  })
})
