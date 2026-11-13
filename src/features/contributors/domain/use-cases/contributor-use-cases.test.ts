import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Contributor } from "../entities/contributor"
import type { ContributorsRepository } from "../repositories/contributors-repository"
import { DeleteContributor } from "./delete-contributor"
import { GetContributor } from "./get-contributor"
import { ListContributors } from "./list-contributors"

const contributor: Contributor = {
  slug: "kgs",
  name: "KGS",
  kind: "organization",
  role: "Server",
  birthYear: 1900,
  period: "",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "50% 50%",
  isDraft: false,
}

function build(
  overrides: Partial<ContributorsRepository>,
): ContributorsRepository {
  return {
    listAll: vi.fn(),
    findBySlug: vi.fn(),
    save: vi.fn(),
    deleteBySlug: vi.fn(),
    ...overrides,
  }
}

describe("ListContributors", () => {
  it("returns the repository's contributors", async () => {
    const repository = build({
      listAll: vi.fn(async () => succeed([contributor])),
    })

    expect(
      await new ListContributors(repository).call(),
    ).toEqual(succeed([contributor]))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new ListContributors(
        build({ listAll: vi.fn(async () => failure) }),
      ).call(),
    ).toBe(failure)
  })
})

describe("GetContributor", () => {
  it("looks up by slug", async () => {
    const findBySlug = vi.fn(async () =>
      succeed(contributor),
    )

    const result = await new GetContributor(
      build({ findBySlug }),
    ).call({ slug: "kgs" })

    expect(findBySlug).toHaveBeenCalledWith("kgs")
    expect(result).toEqual(succeed(contributor))
  })

  it("returns a successful null for an unknown slug", async () => {
    expect(
      await new GetContributor(
        build({
          findBySlug: vi.fn(async () => succeed(null)),
        }),
      ).call({ slug: "ghost" }),
    ).toEqual(succeed(null))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new GetContributor(
        build({ findBySlug: vi.fn(async () => failure) }),
      ).call({ slug: "kgs" }),
    ).toBe(failure)
  })
})

describe("DeleteContributor", () => {
  it("deletes by slug", async () => {
    const deleteBySlug = vi.fn(async () =>
      succeed(undefined),
    )

    const result = await new DeleteContributor(
      build({ deleteBySlug }),
    ).call({ slug: "kgs" })

    expect(deleteBySlug).toHaveBeenCalledWith("kgs")
    expect(result).toEqual(succeed(undefined))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new DeleteContributor(
        build({ deleteBySlug: vi.fn(async () => failure) }),
      ).call({ slug: "kgs" }),
    ).toBe(failure)
  })
})
