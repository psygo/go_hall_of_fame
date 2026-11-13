import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Contributor } from "../entities/contributor"
import type { ContributorForm } from "../entities/contributor-draft"
import type { ContributorsRepository } from "../repositories/contributors-repository"
import { SaveContributor } from "./save-contributor"

const existing: Contributor = {
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

const form: ContributorForm = {
  slug: "",
  name: " Fan Hui ",
  kind: "person",
  role: "Role",
  birthYear: "1900",
  period: "",
  bio: "Bio",
  photoUrl: "",
  photoPosition: "",
  isDraft: false,
}

function buildRepository(
  overrides: Partial<ContributorsRepository> = {},
): ContributorsRepository {
  return {
    listAll: vi.fn(async () => succeed([existing])),
    findBySlug: vi.fn(),
    save: vi.fn(async () => succeed(undefined)),
    deleteBySlug: vi.fn(),
    ...overrides,
  }
}

describe("SaveContributor", () => {
  it("saves the validated draft with a null original slug when creating", async () => {
    const repository = buildRepository()

    const result = await new SaveContributor(
      repository,
    ).call({
      originalSlug: null,
      form,
    })

    expect(result).toEqual({ status: "saved" })
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "fan-hui",
        name: "Fan Hui",
        photoUrl: null,
        photoPosition: "50% 50%",
      }),
      null,
    )
  })

  it("passes the original slug when editing, allowing the slug to be kept", async () => {
    const repository = buildRepository()

    const result = await new SaveContributor(
      repository,
    ).call({
      originalSlug: "kgs",
      form: { ...form, slug: "kgs" },
    })

    expect(result).toEqual({ status: "saved" })
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "kgs" }),
      "kgs",
    )
  })

  it("returns the errors without saving when invalid", async () => {
    const repository = buildRepository()

    const result = await new SaveContributor(
      repository,
    ).call({
      originalSlug: null,
      form: { ...form, slug: "kgs" },
    })

    expect(result).toEqual({
      status: "invalid",
      errors: {
        slug: "Another contributor already uses this slug.",
      },
    })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed without saving when listing fails", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      listAll: vi.fn(async () => fail(error)),
    })

    expect(
      await new SaveContributor(repository).call({
        originalSlug: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when saving fails", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      save: vi.fn(async () => fail(error)),
    })

    expect(
      await new SaveContributor(repository).call({
        originalSlug: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
  })
})
