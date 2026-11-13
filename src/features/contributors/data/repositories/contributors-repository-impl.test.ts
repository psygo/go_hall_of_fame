import { describe, expect, it, vi } from "vitest"

import type { ContributorDraft } from "../../domain/entities/contributor-draft"
import type { ContributorsDataSource } from "../data-sources/contributors-data-source"
import { ContributorModel } from "../models/contributor-model"
import { ContributorsRepositoryImpl } from "./contributors-repository-impl"

const raw = {
  slug: "kgs",
  name: "KGS",
  kind: "organization",
  role: "Server",
  period: "",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "50% 50%",
  isDraft: false,
}

const draft: ContributorDraft = {
  slug: "kgs",
  name: "KGS",
  kind: "organization",
  role: "Server",
  period: "",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "50% 50%",
  isDraft: false,
}

function buildRepository(
  dataSource: Partial<
    Record<
      keyof ContributorsDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
  canSeeDrafts: () => Promise<boolean> = async () => false,
) {
  return new ContributorsRepositoryImpl(
    dataSource as unknown as ContributorsDataSource,
    canSeeDrafts,
  )
}

const throwing = (cause: Error) =>
  vi.fn(async () => {
    throw cause
  })
const cause = new Error("db down")
const failure = { status: "failure", error: cause }

describe("ContributorsRepositoryImpl", () => {
  describe("listAll", () => {
    it("maps the models to plain entities", async () => {
      const state = await buildRepository({
        fetchAll: vi.fn(async () => [
          ContributorModel.fromRawData(raw),
        ]),
      }).listAll()

      expect(state).toEqual({
        status: "success",
        data: [raw],
      })
      if (state.status === "success") {
        expect(Object.getPrototypeOf(state.data[0])).toBe(
          Object.prototype,
        )
      }
    })

    it("returns a failure when the data source throws", async () => {
      expect(
        await buildRepository({
          fetchAll: throwing(cause),
        }).listAll(),
      ).toEqual(failure)
    })
  })

  describe("findBySlug", () => {
    it("maps the model and passes the slug", async () => {
      const fetchBySlug = vi.fn(async () =>
        ContributorModel.fromRawData(raw),
      )

      const state = await buildRepository({
        fetchBySlug,
      }).findBySlug("kgs")

      expect(fetchBySlug).toHaveBeenCalledWith("kgs", false)
      expect(state).toEqual({
        status: "success",
        data: raw,
      })
    })

    it("returns a successful null when missing", async () => {
      expect(
        await buildRepository({
          fetchBySlug: vi.fn(async () => null),
        }).findBySlug("ghost"),
      ).toEqual({ status: "success", data: null })
    })

    it("returns a failure when the data source throws", async () => {
      expect(
        await buildRepository({
          fetchBySlug: throwing(cause),
        }).findBySlug("kgs"),
      ).toEqual(failure)
    })
  })

  describe("save", () => {
    it("passes the draft and the original slug", async () => {
      const upsert = vi.fn(async () => undefined)

      const state = await buildRepository({ upsert }).save(
        draft,
        "old",
      )

      expect(upsert).toHaveBeenCalledWith(draft, "old")
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      expect(
        await buildRepository({
          upsert: throwing(cause),
        }).save(draft, null),
      ).toEqual(failure)
    })
  })

  describe("deleteBySlug", () => {
    it("deletes by slug", async () => {
      const deleteBySlug = vi.fn(async () => undefined)

      const state = await buildRepository({
        deleteBySlug,
      }).deleteBySlug("kgs")

      expect(deleteBySlug).toHaveBeenCalledWith("kgs")
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      expect(
        await buildRepository({
          deleteBySlug: throwing(cause),
        }).deleteBySlug("kgs"),
      ).toEqual(failure)
    })
  })

  describe("draft visibility", () => {
    it.each([
      [true, true],
      [false, false],
    ])(
      "canSeeDrafts %s gives includeDrafts %s",
      async (canSee, expected) => {
        const fetchAll = vi.fn(async () => [])
        const fetchBySlug = vi.fn(async () => null)
        const repository = buildRepository(
          { fetchAll, fetchBySlug },
          async () => canSee,
        )

        await repository.listAll()
        await repository.findBySlug("kgs")

        expect(fetchAll).toHaveBeenCalledWith(expected)
        expect(fetchBySlug).toHaveBeenCalledWith(
          "kgs",
          expected,
        )
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
      const fetchAll = vi.fn(async () => [])
      const repository = buildRepository(
        { fetchAll },
        async () => {
          throw cause
        },
      )

      expect(await repository.listAll()).toEqual(failure)
      expect(fetchAll).not.toHaveBeenCalled()
    })
  })
})
