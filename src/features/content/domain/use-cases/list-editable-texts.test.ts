import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import { toEditableTexts } from "../entities/page-text"
import type { SiteTextsRepository } from "../repositories/site-texts-repository"
import { ListEditableTexts } from "./list-editable-texts"

function buildRepository(
  listOverrides: SiteTextsRepository["listOverrides"],
): SiteTextsRepository {
  return { listOverrides, apply: vi.fn() }
}

describe("ListEditableTexts", () => {
  it("returns every text with its saved or default value", async () => {
    const overrides = { "home.title": "Custom" }

    const result = await new ListEditableTexts(
      buildRepository(
        vi.fn(async () => succeed(overrides)),
      ),
    ).call()

    expect(result).toEqual(
      succeed(toEditableTexts(overrides)),
    )
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new ListEditableTexts(
      buildRepository(vi.fn(async () => failure)),
    ).call()

    expect(result).toBe(failure)
  })
})
