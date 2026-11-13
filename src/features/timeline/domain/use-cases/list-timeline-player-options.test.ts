import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { ListTimelinePlayerOptions } from "./list-timeline-player-options"

function build(
  listPlayerOptions: TimelineRepository["listPlayerOptions"],
): TimelineRepository {
  return {
    listAll: vi.fn(),
    findById: vi.fn(),
    listGameOptions: vi.fn(),
    listPlayerOptions,
    save: vi.fn(),
    reorder: vi.fn(),
    delete: vi.fn(),
  }
}

describe("ListTimelinePlayerOptions", () => {
  it("returns the options of the repository", async () => {
    const options = [{ slug: "shusaku", name: "Shusaku" }]

    expect(
      await new ListTimelinePlayerOptions(
        build(vi.fn(async () => succeed(options))),
      ).call(),
    ).toEqual(succeed(options))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new ListTimelinePlayerOptions(
        build(vi.fn(async () => failure)),
      ).call(),
    ).toBe(failure)
  })
})
