import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { GetTimelineEvent } from "./get-timeline-event"

function buildRepository(
  findById: TimelineRepository["findById"],
): TimelineRepository {
  return { findById } as unknown as TimelineRepository
}

describe("GetTimelineEvent", () => {
  it("returns the result of the repository", async () => {
    const data = {
      id: 3,
      year: "1612",
      title: "T",
      text: "x",
      games: [],
      players: [],
      contributors: [],
      isDraft: false,
    }
    const findById = vi.fn(async () => succeed(data))
    const repo = buildRepository(findById)

    const result = await new GetTimelineEvent(repo).call({
      id: 3,
    })

    expect(repo.findById).toHaveBeenCalledWith(3)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new GetTimelineEvent(
      buildRepository(vi.fn(async () => failure)),
    ).call({ id: 3 })

    expect(result).toBe(failure)
  })
})
