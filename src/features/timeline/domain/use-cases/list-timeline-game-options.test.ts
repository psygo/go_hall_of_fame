import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { ListTimelineGameOptions } from "./list-timeline-game-options"

function build(
  listGameOptions: TimelineRepository["listGameOptions"],
): TimelineRepository {
  return {
    listAll: vi.fn(),
    findById: vi.fn(),
    listGameOptions,
    save: vi.fn(),
    delete: vi.fn(),
  }
}

describe("ListTimelineGameOptions", () => {
  it("returns the options of the repository", async () => {
    const options = [{ slug: "a", name: "A" }]

    expect(
      await new ListTimelineGameOptions(
        build(vi.fn(async () => succeed(options))),
      ).call(),
    ).toEqual(succeed(options))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new ListTimelineGameOptions(
        build(vi.fn(async () => failure)),
      ).call(),
    ).toBe(failure)
  })
})
