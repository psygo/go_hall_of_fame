import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"
import type { ResourceLink } from "@/core/resources"

import { RESOURCES_PAGE_SIZE } from "../entities/site-resources"
import type { SiteResourcesRepository } from "../repositories/site-resources-repository"
import { PageSiteResources } from "./page-site-resources"

function build(
  listAll: SiteResourcesRepository["listAll"],
): SiteResourcesRepository {
  return { listAll, replaceAll: vi.fn() }
}

const links: ResourceLink[] = Array.from(
  { length: RESOURCES_PAGE_SIZE + 1 },
  (_, i) => ({ url: `/r${i}`, description: null }),
)

describe("PageSiteResources", () => {
  it("paginates the links", async () => {
    const result = await new PageSiteResources(
      build(vi.fn(async () => succeed(links))),
    ).call({ page: 2 })

    expect(result).toEqual(
      succeed({
        items: [links[RESOURCES_PAGE_SIZE]],
        page: 2,
        pageCount: 2,
        total: links.length,
      }),
    )
  })

  it("clamps a page past the end and handles no links", async () => {
    const past = await new PageSiteResources(
      build(vi.fn(async () => succeed(links))),
    ).call({ page: 99 })
    const none = await new PageSiteResources(
      build(vi.fn(async () => succeed([]))),
    ).call({ page: 3 })

    expect(
      past.status === "success" && past.data.page,
    ).toBe(2)
    expect(none).toEqual(
      succeed({
        items: [],
        page: 1,
        pageCount: 1,
        total: 0,
      }),
    )
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new PageSiteResources(
        build(vi.fn(async () => failure)),
      ).call({ page: 1 }),
    ).toBe(failure)
  })
})
