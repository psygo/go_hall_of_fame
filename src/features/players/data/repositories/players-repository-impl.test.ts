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
  name: "Honinbo Shusaku",
  nativeName: "本因坊秀策",
  country: "Japan",
  years: "1829-1862",
  distinction: "Invincible",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "center",
  featured: true,
  tags: [],
}

function buildRepository(
  dataSource: Partial<
    Record<
      keyof PlayersDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new PlayersRepositoryImpl(
    dataSource as unknown as PlayersDataSource,
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
      featured: true,
      tags: [],
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
})
