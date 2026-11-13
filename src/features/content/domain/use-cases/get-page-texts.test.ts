import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import { resolvePageTexts } from "../entities/page-text"
import type { SiteTextsRepository } from "../repositories/site-texts-repository"
import { GetPageTexts } from "./get-page-texts"

function buildRepository(
  listOverrides: SiteTextsRepository["listOverrides"],
): SiteTextsRepository {
  return { listOverrides, apply: vi.fn() }
}

describe("GetPageTexts", () => {
  it("returns the defaults overlaid with the saved texts of the page", async () => {
    const overrides = { "players.title": "Our players" }

    const result = await new GetPageTexts(
      buildRepository(
        vi.fn(async () => succeed(overrides)),
      ),
    ).call({ page: "players" })

    expect(result).toEqual(
      succeed(resolvePageTexts("players", overrides)),
    )
    expect(result).toEqual(
      succeed(
        expect.objectContaining({
          "players.title": "Our players",
          "players.eyebrow": "Inductees",
        }),
      ),
    )
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new GetPageTexts(
      buildRepository(vi.fn(async () => failure)),
    ).call({ page: "home" })

    expect(result).toBe(failure)
  })
})
