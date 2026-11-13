import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Game } from "../entities/game"
import type { GameForm } from "../entities/game-draft"
import type { GamesRepository } from "../repositories/games-repository"
import { SaveGame } from "./save-game"

const existing: Game = {
  slug: "ear-reddening",
  year: 1846,
  name: "Ear-Reddening",
  black: "B",
  white: "W",
  result: "B+2",
  setting: "S",
  hook: "H",
  moment: "M",
  legacy: "L",
  blackPlayerSlug: null,
  whitePlayerSlug: null,
  sgfUrl: null,
  hasUploadedSgf: false,
  featured: false,
  sequence: 0,
}

const form: GameForm = {
  slug: "",
  year: "2016",
  name: " AlphaGo Game 4 ",
  black: "Lee Sedol",
  white: "AlphaGo",
  result: "W+R",
  setting: "Seoul",
  hook: "Hook",
  moment: "Moment",
  legacy: "Legacy",
  sgfUrl: "",
  sequence: "",
  featured: true,
  sgfFileText: "",
  sgfFileTooLarge: false,
  removeSgf: false,
  blackPlayerSlug: "lee-sedol",
  whitePlayerSlug: "",
  resources: [],
}

function buildRepository(
  overrides: Partial<GamesRepository> = {},
): GamesRepository {
  return {
    listAll: vi.fn(async () => succeed([existing])),
    findDetailBySlug: vi.fn(),
    listPlayerOptions: vi.fn(async () =>
      succeed([{ slug: "lee-sedol", name: "Lee Sedol" }]),
    ),
    save: vi.fn(async () => succeed(undefined)),
    deleteBySlug: vi.fn(),
    findSgfTextBySlug: vi.fn(),
    ...overrides,
  }
}

describe("SaveGame", () => {
  it("saves the validated draft with a null original slug when creating", async () => {
    const repository = buildRepository()

    const result = await new SaveGame(repository).call({
      originalSlug: null,
      form,
    })

    expect(repository.save).toHaveBeenCalledWith(
      {
        slug: "alphago-game-4",
        year: 2016,
        name: "AlphaGo Game 4",
        black: "Lee Sedol",
        white: "AlphaGo",
        result: "W+R",
        setting: "Seoul",
        hook: "Hook",
        moment: "Moment",
        legacy: "Legacy",
        sgfUrl: null,
        sequence: 0,
        featured: true,
        blackPlayerSlug: "lee-sedol",
        whitePlayerSlug: null,
        playerSlugs: ["lee-sedol"],
        sgf: { kind: "keep" },
        resources: [],
      },
      null,
    )
    expect(result).toEqual({ status: "saved" })
  })

  it("keeps the original slug when editing and allows reusing it", async () => {
    const repository = buildRepository()

    const result = await new SaveGame(repository).call({
      originalSlug: "ear-reddening",
      form: { ...form, slug: "ear-reddening" },
    })

    expect(result).toEqual({ status: "saved" })
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "ear-reddening" }),
      "ear-reddening",
    )
  })

  it("returns the errors and does not save when the form is invalid", async () => {
    const repository = buildRepository()

    const result = await new SaveGame(repository).call({
      originalSlug: null,
      form: { ...form, blackPlayerSlug: "ghost" },
    })

    expect(result).toEqual({
      status: "invalid",
      errors: {
        blackPlayerSlug:
          "Choose a player who is in the Hall.",
      },
    })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when the games cannot be listed", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      listAll: vi.fn(async () => fail(error)),
    })

    expect(
      await new SaveGame(repository).call({
        originalSlug: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when the player options cannot be listed", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      listPlayerOptions: vi.fn(async () => fail(error)),
    })

    expect(
      await new SaveGame(repository).call({
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
      await new SaveGame(repository).call({
        originalSlug: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
  })
})
