import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Player } from "../entities/player"
import type { PlayerForm } from "../entities/player-draft"
import type { PlayersRepository } from "../repositories/players-repository"
import { SavePlayer } from "./save-player"

const existing: Player = {
  slug: "shusaku",
  inductionNumber: 1,
  name: "Shusaku",
  nativeName: "秀策",
  country: "Japan",
  years: "1829-1862",
  distinction: "Invincible",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "50% 50%",
  tags: [],
}

const form: PlayerForm = {
  slug: "gu-li",
  name: " Gu Li ",
  nativeName: "古力",
  country: "China",
  years: "1983-",
  distinction: "Ing Cup",
  bio: "Bio",
  photoUrl: "",
  photoPosition: "",
  inductionNumber: "",
  tags: "",
  resources: [],
}

function buildRepository(
  overrides: Partial<PlayersRepository> = {},
): PlayersRepository {
  return {
    listAll: vi.fn(async () => succeed([existing])),
    findDetailBySlug: vi.fn(),
    save: vi.fn(async () => succeed(undefined)),
    deleteBySlug: vi.fn(),
    ...overrides,
  }
}

describe("SavePlayer", () => {
  it("saves the validated draft with a null original slug when creating", async () => {
    const repository = buildRepository()

    const result = await new SavePlayer(repository).call({
      originalSlug: null,
      form,
    })

    expect(repository.save).toHaveBeenCalledWith(
      {
        slug: "gu-li",
        name: "Gu Li",
        nativeName: "古力",
        country: "China",
        years: "1983-",
        distinction: "Ing Cup",
        bio: "Bio",
        photoUrl: null,
        photoPosition: "50% 50%",
        inductionNumber: 2,
        tags: [],
        resources: [],
      },
      null,
    )
    expect(result).toEqual({ status: "saved" })
  })

  it("passes the original slug when editing, allowing the slug to be kept", async () => {
    const repository = buildRepository()

    const result = await new SavePlayer(repository).call({
      originalSlug: "shusaku",
      form: {
        ...form,
        slug: "shusaku",
        inductionNumber: "1",
      },
    })

    expect(result).toEqual({ status: "saved" })
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "shusaku" }),
      "shusaku",
    )
  })

  it("returns the errors and does not save when the slug is taken", async () => {
    const repository = buildRepository()

    const result = await new SavePlayer(repository).call({
      originalSlug: null,
      form: { ...form, slug: "shusaku" },
    })

    expect(result).toEqual({
      status: "invalid",
      errors: {
        slug: "Another player already uses this slug.",
      },
    })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when the existing players cannot be listed", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      listAll: vi.fn(async () => fail(error)),
    })

    const result = await new SavePlayer(repository).call({
      originalSlug: null,
      form,
    })

    expect(result).toEqual({ status: "failed", error })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when saving fails", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      save: vi.fn(async () => fail(error)),
    })

    expect(
      await new SavePlayer(repository).call({
        originalSlug: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
  })
})
