import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { ReorderTimelineEvents } from "./reorder-timeline-events"

function build(
  reorder: TimelineRepository["reorder"],
): TimelineRepository {
  return {
    listAll: vi.fn(),
    findById: vi.fn(),
    listGameOptions: vi.fn(),
    save: vi.fn(),
    reorder,
    delete: vi.fn(),
  }
}

describe("ReorderTimelineEvents", () => {
  it("passes the ids to the repository and returns its result", async () => {
    const reorder = vi.fn(async () => succeed(undefined))

    const result = await new ReorderTimelineEvents(
      build(reorder),
    ).call({ ids: [2, 1] })

    expect(reorder).toHaveBeenCalledWith([2, 1])
    expect(result).toEqual(succeed(undefined))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new ReorderTimelineEvents(
        build(vi.fn(async () => failure)),
      ).call({ ids: [1] }),
    ).toBe(failure)
  })
})
