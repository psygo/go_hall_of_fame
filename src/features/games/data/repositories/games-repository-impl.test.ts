import { describe, expect, it, vi } from "vitest"

import type { GameDraft } from "../../domain/entities/game-draft"
import type { GamesDataSource } from "../data-sources/games-data-source"
import {
  GameDetailModel,
  GameModel,
} from "../models/game-model"
import { GamesRepositoryImpl } from "./games-repository-impl"

const rawGame = {
  slug: "ear-reddening",
  year: 1846,
  name: "Ear-Reddening",
  black: "Shusaku",
  white: "Inseki",
  result: "B+2",
  setting: "Setting",
  description: "Hook",
  blackPlayerSlug: "shusaku",
  whitePlayerSlug: null,
  sgfUrl: null,
  hasUploadedSgf: false,
  highlightMove: null,
  tags: [],
  isDraft: false,
  sequence: 1,
}

function buildRepository(
  dataSource: Partial<
    Record<keyof GamesDataSource, ReturnType<typeof vi.fn>>
  >,
  canSeeDrafts: () => Promise<boolean> = async () => false,
) {
  return new GamesRepositoryImpl(
    dataSource as unknown as GamesDataSource,
    canSeeDrafts,
  )
}

describe("GamesRepositoryImpl", () => {
  describe("listAll", () => {
    it("maps the models to plain entities", async () => {
      const repository = buildRepository({
        fetchAll: vi.fn(async () => [
          GameModel.fromRawData(rawGame),
        ]),
      })

      const state = await repository.listAll()

      expect(state).toEqual({
        status: "success",
        data: [rawGame],
      })
      if (state.status === "success") {
        expect(Object.getPrototypeOf(state.data[0])).toBe(
          Object.prototype,
        )
      }
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        fetchAll: vi.fn(async () => {
          throw cause
        }),
      })

      expect(await repository.listAll()).toEqual({
        status: "failure",
        error: cause,
      })
    })
  })

  describe("findDetailBySlug", () => {
    it("maps the detail model to a plain entity", async () => {
      const fetchDetailBySlug = vi.fn(async () =>
        GameDetailModel.fromRawData({
          ...rawGame,
          players: [],
          resources: [],
        }),
      )
      const repository = buildRepository({
        fetchDetailBySlug,
      })

      const state =
        await repository.findDetailBySlug("ear-reddening")

      expect(fetchDetailBySlug).toHaveBeenCalledWith(
        "ear-reddening",
        false,
      )
      expect(state).toEqual({
        status: "success",
        data: { ...rawGame, players: [], resources: [] },
      })
    })

    it("returns a successful null when the game does not exist", async () => {
      const repository = buildRepository({
        fetchDetailBySlug: vi.fn(async () => null),
      })

      expect(
        await repository.findDetailBySlug("nope"),
      ).toEqual({
        status: "success",
        data: null,
      })
    })

    it("returns a failure when the data source throws", async () => {
      const repository = buildRepository({
        fetchDetailBySlug: vi.fn(async () => {
          throw new Error("db down")
        }),
      })

      const state = await repository.findDetailBySlug("x")

      expect(state).toEqual({
        status: "failure",
        error: new Error("db down"),
      })
    })
  })
  describe("findSgfTextBySlug", () => {
    it("returns the text of the data source", async () => {
      const repository = buildRepository({
        fetchSgfTextBySlug: vi.fn(async () => "(;GM[1])"),
      })

      expect(
        await repository.findSgfTextBySlug("a"),
      ).toEqual({ status: "success", data: "(;GM[1])" })
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        fetchSgfTextBySlug: vi.fn(async () => {
          throw cause
        }),
      })

      expect(
        await repository.findSgfTextBySlug("a"),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("listPlayerOptions", () => {
    it("returns the options of the data source", async () => {
      const options = [{ slug: "shusaku", name: "Shusaku" }]
      const repository = buildRepository({
        listPlayerOptions: vi.fn(async () => options),
      })

      expect(await repository.listPlayerOptions()).toEqual({
        status: "success",
        data: options,
      })
    })

    it("returns a failure when the data source rejects", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        listPlayerOptions: vi.fn(async () => {
          throw cause
        }),
      })

      expect(await repository.listPlayerOptions()).toEqual({
        status: "failure",
        error: cause,
      })
    })

    it("returns a failure when the data source throws synchronously", async () => {
      const cause = new Error("sync")
      const repository = buildRepository({
        listPlayerOptions: vi.fn(() => {
          throw cause
        }),
      })

      expect(await repository.listPlayerOptions()).toEqual({
        status: "failure",
        error: cause,
      })
    })
  })

  describe("save", () => {
    const { slug, year, name, black, white, result } =
      rawGame
    const draft: GameDraft = {
      slug,
      year,
      name,
      black,
      white,
      result,
      setting: "Setting",
      description: "Hook",
      sgfUrl: null,
      sequence: 1,
      highlightMove: null,
      tags: [],
      isDraft: false,
      blackPlayerSlug: "shusaku",
      whitePlayerSlug: null,
      playerSlugs: ["shusaku"],
      sgf: { kind: "keep" },
      resources: [],
    }

    it("passes the draft and the original slug to the data source", async () => {
      const upsert = vi.fn(async () => undefined)

      const state = await buildRepository({ upsert }).save(
        draft,
        "old",
      )

      expect(upsert).toHaveBeenCalledWith(draft, "old")
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        upsert: vi.fn(async () => {
          throw cause
        }),
      })

      expect(await repository.save(draft, null)).toEqual({
        status: "failure",
        error: cause,
      })
    })
  })

  describe("deleteBySlug", () => {
    it("deletes by slug and returns a success", async () => {
      const deleteBySlug = vi.fn(async () => undefined)

      const state = await buildRepository({
        deleteBySlug,
      }).deleteBySlug("ear-reddening")

      expect(deleteBySlug).toHaveBeenCalledWith(
        "ear-reddening",
      )
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")
      const repository = buildRepository({
        deleteBySlug: vi.fn(async () => {
          throw cause
        }),
      })

      expect(await repository.deleteBySlug("x")).toEqual({
        status: "failure",
        error: cause,
      })
    })
  })

  describe("draft visibility", () => {
    it.each([
      [true, true],
      [false, false],
    ])(
      "canSeeDrafts %s gives includeDrafts ",
      async (canSee, expected) => {
        {
          const fetchAll = vi.fn(async () => [])
          const repository = buildRepository(
            { fetchAll },
            async () => canSee,
          )
          await repository.listAll()
          expect(fetchAll).toHaveBeenCalledWith(expected)
        }
        {
          const fetchDetailBySlug = vi.fn(async () => null)
          const repository = buildRepository(
            { fetchDetailBySlug },
            async () => canSee,
          )
          await repository.findDetailBySlug("x")
          expect(fetchDetailBySlug).toHaveBeenCalledWith(
            "x",
            expected,
          )
        }
        {
          const fetchSgfTextBySlug = vi.fn(async () => null)
          const repository = buildRepository(
            { fetchSgfTextBySlug },
            async () => canSee,
          )
          await repository.findSgfTextBySlug("x")
          expect(fetchSgfTextBySlug).toHaveBeenCalledWith(
            "x",
            expected,
          )
        }
        {
          const listPlayerOptions = vi.fn(async () => [])
          const repository = buildRepository(
            { listPlayerOptions },
            async () => canSee,
          )
          await repository.listPlayerOptions()
          expect(listPlayerOptions).toHaveBeenCalledWith(
            expected,
          )
        }
      },
    )

    it("evaluates canSeeDrafts on every call", async () => {
      const fetchAll = vi.fn(async () => [])
      let admin = true
      const repository = buildRepository(
        { fetchAll },
        async () => admin,
      )

      await repository.listAll()
      admin = false
      await repository.listAll()

      expect(fetchAll.mock.calls).toEqual([[true], [false]])
    })

    it("turns a rejecting canSeeDrafts into a failure without reading", async () => {
      const cause = new Error("auth down")
      const fetchAll = vi.fn(async () => [])
      const repository = buildRepository(
        { fetchAll },
        async () => {
          throw cause
        },
      )

      expect(await repository.listAll()).toEqual({
        status: "failure",
        error: cause,
      })
      expect(fetchAll).not.toHaveBeenCalled()
    })
  })
})
