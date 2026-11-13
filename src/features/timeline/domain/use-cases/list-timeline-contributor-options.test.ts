import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { ListTimelineContributorOptions } from "./list-timeline-contributor-options"

function build(
  listContributorOptions: TimelineRepository["listContributorOptions"],
): TimelineRepository {
  return {
    listAll: vi.fn(),
    findById: vi.fn(),
    listGameOptions: vi.fn(),
    listPlayerOptions: vi.fn(),
    listContributorOptions,
    save: vi.fn(),
    reorder: vi.fn(),
    delete: vi.fn(),
  }
}

describe("ListTimelineContributorOptions", () => {
  it("returns the options of the repository", async () => {
    const options = [{ slug: "kgs", name: "KGS" }]

    expect(
      await new ListTimelineContributorOptions(
        build(vi.fn(async () => succeed(options))),
      ).call(),
    ).toEqual(succeed(options))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new ListTimelineContributorOptions(
        build(vi.fn(async () => failure)),
      ).call(),
    ).toBe(failure)
  })
})
