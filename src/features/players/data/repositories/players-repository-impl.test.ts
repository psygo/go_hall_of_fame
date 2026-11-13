import { describe, expect, it, vi } from "vitest"

import type { PlayerDraft } from "../../domain/entities/player-draft"
import type { PlayersDataSource } from "../data-sources/players-data-source"
import {
  PlayerDetailModel,
  PlayerModel,
} from "../models/player-model"
import { PlayersRepositoryImpl } from "./players-repository-impl"

const rawPlayer = {
  slug: "shusaku",
  inductionNumber: 3,
  birthYear: 1900,
  name: "Honinbo Shusaku",
  nativeName: "本因坊秀策",
  country: "Japan",
  years: "1829-1862",
  distinction: "Invincible",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "center",
  tags: [],
  isDraft: false,
}

function buildRepository(
  dataSource: Partial<
    Record<
      keyof PlayersDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
  canSeeDrafts: () => Promise<boolean> = async () => false,
) {
  return new PlayersRepositoryImpl(
    dataSource as unknown as PlayersDataSource,
    canSeeDrafts,
  )
}

describe("PlayersRepositoryImpl", () => {
  describe("listAll", () => {
    it("maps the models to plain entities", async () => {
      const repository = buildRepository({
        fetchAll: vi.fn(async () => [
          PlayerModel.fromRawData(rawPlayer),
        ]),
      })

      const state = await repository.listAll()

      expect(state).toEqual({
        status: "success",
        data: [rawPlayer],
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

      const state = await repository.listAll()

      expect(state).toEqual({
        status: "failure",
        error: cause,
      })
    })
  })

  describe("findDetailBySlug", () => {
    it("maps the detail model to a plain entity", async () => {
      const fetchDetailBySlug = vi.fn(async () =>
        PlayerDetailModel.fromRawData({
          ...rawPlayer,
          games: [],
          resources: [],
        }),
      )
      const repository = buildRepository({
        fetchDetailBySlug,
      })

      const state =
        await repository.findDetailBySlug("shusaku")

      expect(fetchDetailBySlug).toHaveBeenCalledWith(
        "shusaku",
        false,
      )
      expect(state).toEqual({
        status: "success",
        data: { ...rawPlayer, games: [], resources: [] },
      })
    })

    it("returns a successful null when the player does not exist", async () => {
      const repository = buildRepository({
        fetchDetailBySlug: vi.fn(async () => null),
      })

      expect(
        await repository.findDetailBySlug("nobody"),
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

      const state =
        await repository.findDetailBySlug("shusaku")

      expect(state).toEqual({
        status: "failure",
        error: new Error("db down"),
      })
    })
  })
  describe("save", () => {
    const draft: PlayerDraft = {
      slug: "shusaku",
      name: "Honinbo Shusaku",
      nativeName: "本因坊秀策",
      country: "Japan",
      years: "1829-1862",
      distinction: "Invincible",
      bio: "Bio",
      photoUrl: null,
      photoPosition: "center",
      inductionNumber: 3,
      birthYear: 1900,
      tags: [],
      isDraft: false,
      resources: [],
    }

    it("passes the draft and the original slug to the data source", async () => {
      const upsert = vi.fn(async () => undefined)
      const repository = buildRepository({ upsert })

      const state = await repository.save(draft, "old-slug")

      expect(upsert).toHaveBeenCalledWith(draft, "old-slug")
      expect(state).toEqual({
        status: "success",
        data: undefined,
      })
    })

    it("passes a null original slug when creating", async () => {
      const upsert = vi.fn(async () => undefined)

      await buildRepository({ upsert }).save(draft, null)

      expect(upsert).toHaveBeenCalledWith(draft, null)
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
      }).deleteBySlug("shusaku")

      expect(deleteBySlug).toHaveBeenCalledWith("shusaku")
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
