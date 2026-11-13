import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { DeleteTimelineEvent } from "./delete-timeline-event"

function buildRepository(
  remove: TimelineRepository["delete"],
): TimelineRepository {
  return { delete: remove } as unknown as TimelineRepository
}

describe("DeleteTimelineEvent", () => {
  it("returns the result of the repository", async () => {
    const data = undefined
    const remove = vi.fn(async () => succeed(data))
    const repo = buildRepository(remove)

    const result = await new DeleteTimelineEvent(repo).call(
      { id: 3 },
    )

    expect(repo.delete).toHaveBeenCalledWith(3)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new DeleteTimelineEvent(
      buildRepository(vi.fn(async () => failure)),
    ).call({ id: 3 })

    expect(result).toBe(failure)
  })
})
