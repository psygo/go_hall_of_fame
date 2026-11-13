import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineEvent } from "../entities/timeline-event"
import type { TimelineRepository } from "../repositories/timeline-repository"
import {
  MAX_REORDERED_EVENTS,
  ReorderTimelineEvents,
} from "./reorder-timeline-events"

const eventWithId = (id: number): TimelineEvent => ({
  id,
  year: String(id),
  title: "T",
  text: "x",
  game: null,
  isDraft: false,
})

function build(
  overrides: Partial<TimelineRepository> = {},
): TimelineRepository {
  return {
    listAll: vi.fn(async () =>
      succeed([1, 2, 3].map(eventWithId)),
    ),
    findById: vi.fn(),
    listGameOptions: vi.fn(),
    save: vi.fn(),
    reorder: vi.fn(async () => succeed(undefined)),
    delete: vi.fn(),
    ...overrides,
  }
}

async function rejected(
  ids: readonly number[],
  repository = build(),
) {
  const result = await new ReorderTimelineEvents(
    repository,
  ).call({ ids })
  expect(result.status).toBe("failure")
  expect(repository.reorder).not.toHaveBeenCalled()
}

describe("ReorderTimelineEvents", () => {
  it("reorders when the ids are exactly the existing events", async () => {
    const repository = build()

    const result = await new ReorderTimelineEvents(
      repository,
    ).call({ ids: [3, 1, 2] })

    expect(repository.reorder).toHaveBeenCalledWith([
      3, 1, 2,
    ])
    expect(result).toEqual(succeed(undefined))
  })

  it("rejects duplicate ids", async () => {
    await rejected([1, 1, 2])
  })

  it("rejects a non-integer id", async () => {
    await rejected([1, 2, 2.5])
    await rejected([1, 2, Number.NaN])
  })

  it("rejects an order that misses an event", async () => {
    await rejected([1, 2])
  })

  it("rejects an unknown event", async () => {
    await rejected([1, 2, 9])
    await rejected([1, 2, 3, 9])
  })

  it("rejects more than the maximum without asking the repository", async () => {
    const repository = build()
    const ids = Array.from(
      { length: MAX_REORDERED_EVENTS + 1 },
      (_, i) => i + 1,
    )

    await rejected(ids, repository)
    expect(repository.listAll).not.toHaveBeenCalled()
  })

  it("returns a listAll failure as is", async () => {
    const failure = fail(new Error("db down"))
    const repository = build({
      listAll: vi.fn(async () => failure),
    })

    const result = await new ReorderTimelineEvents(
      repository,
    ).call({ ids: [1, 2, 3] })

    expect(result).toBe(failure)
    expect(repository.reorder).not.toHaveBeenCalled()
  })

  it("propagates a reorder failure", async () => {
    const failure = fail(new Error("db down"))
    const repository = build({
      reorder: vi.fn(async () => failure),
    })

    expect(
      await new ReorderTimelineEvents(repository).call({
        ids: [1, 2, 3],
      }),
    ).toBe(failure)
  })
})
