import { describe, expect, it, vi } from "vitest"

import type { TimelineDataSource } from "../data-sources/timeline-data-source"
import { TimelineEventModel } from "../models/timeline-event-model"
import { TimelineRepositoryImpl } from "./timeline-repository-impl"

const rawEvent = {
  year: 1612,
  title: "Founded",
  text: "Text",
}

function buildRepository(
  fetchAll: ReturnType<typeof vi.fn>,
) {
  return new TimelineRepositoryImpl({
    fetchAll,
  } as unknown as TimelineDataSource)
}

describe("TimelineRepositoryImpl", () => {
  it("maps the models to plain entities", async () => {
    const repository = buildRepository(
      vi.fn(async () => [
        TimelineEventModel.fromRawData(rawEvent),
      ]),
    )

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
