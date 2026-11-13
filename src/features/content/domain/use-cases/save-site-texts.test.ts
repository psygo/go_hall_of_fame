import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import { PAGE_TEXT_DEFINITIONS } from "../entities/page-text"
import type { SiteTextsRepository } from "../repositories/site-texts-repository"
import { SaveSiteTexts } from "./save-site-texts"

function buildRepository(
  apply: SiteTextsRepository["apply"],
): SiteTextsRepository {
  return { listOverrides: vi.fn(), apply }
}

describe("SaveSiteTexts", () => {
  it("applies the validated changes", async () => {
    const apply = vi.fn(async () => succeed(undefined))

    const result = await new SaveSiteTexts(
      buildRepository(apply),
    ).call({ form: { "home.title": " New " } })

    expect(apply).toHaveBeenCalledWith({
      set: { "home.title": "New" },
      clear: PAGE_TEXT_DEFINITIONS.map(
        ({ key }) => key,
      ).filter((key) => key !== "home.title"),
    })
    expect(result).toEqual({ status: "saved" })
  })

  it("returns the errors and applies nothing when a text is too long", async () => {
    const apply = vi.fn(async () => succeed(undefined))

    const result = await new SaveSiteTexts(
      buildRepository(apply),
    ).call({ form: { "home.title": "a".repeat(500) } })

    expect(result).toEqual({
      status: "invalid",
      errors: {
        "home.title": "Use at most 120 characters.",
      },
    })
    expect(apply).not.toHaveBeenCalled()
  })

  it("returns failed when applying fails", async () => {
    const error = new Error("db down")

    const result = await new SaveSiteTexts(
      buildRepository(vi.fn(async () => fail(error))),
    ).call({ form: {} })

    expect(result).toEqual({ status: "failed", error })
  })
})
