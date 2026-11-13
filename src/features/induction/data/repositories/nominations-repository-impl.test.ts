import { describe, expect, it, vi } from "vitest"

import type { NominationDraft } from "../../domain/entities/nomination"
import type { NominationsDataSource } from "../data-sources/nominations-data-source"
import { NominationRecordModel } from "../models/nomination-record-model"
import { NominationsRepositoryImpl } from "./nominations-repository-impl"

const draft: NominationDraft = {
  name: "Shusaku",
  category: "player",
  email: "fan@example.com",
  caseForInduction: "Reasons",
}

const rawRecord = {
  id: 2,
  ...draft,
  status: "pending",
  createdAt: new Date("2026-01-02T03:04:05Z"),
}

function buildRepository(
  dataSource: Partial<
    Record<
      keyof NominationsDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new NominationsRepositoryImpl(
    dataSource as unknown as NominationsDataSource,
  )
}

function throwing(cause: Error) {
  return vi.fn(async () => {
    throw cause
  })
}

describe("NominationsRepositoryImpl", () => {
  describe("submit", () => {
    it("inserts the draft and returns a success", async () => {
      const insert = vi.fn(async () => undefined)

      const state = await buildRepository({
        insert,
      }).submit(draft)

      expect(insert).toHaveBeenCalledWith(draft)
      expect(state.status).toBe("success")
    })

    it("returns a failure when the insert throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          insert: throwing(cause),
        }).submit(draft),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("listAll", () => {
    it("maps the models to plain entities", async () => {
      const repository = buildRepository({
        fetchAll: vi.fn(async () => [
          NominationRecordModel.fromRawData(rawRecord),
        ]),
      })

      const state = await repository.listAll()

      expect(state).toEqual({
        status: "success",
        data: [rawRecord],
      })
      if (state.status === "success") {
        expect(Object.getPrototypeOf(state.data[0])).toBe(
          Object.prototype,
        )
      }
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          fetchAll: throwing(cause),
        }).listAll(),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("updateStatus", () => {
    it("passes the id and the status on", async () => {
      const updateStatus = vi.fn(async () => undefined)

      const state = await buildRepository({
        updateStatus,
      }).updateStatus(2, "accepted")

      expect(updateStatus).toHaveBeenCalledWith(
        2,
        "accepted",
      )
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          updateStatus: throwing(cause),
        }).updateStatus(2, "declined"),
      ).toEqual({ status: "failure", error: cause })
    })
  })

  describe("delete", () => {
    it("deletes by id", async () => {
      const remove = vi.fn(async () => undefined)

      const state = await buildRepository({
        delete: remove,
      }).delete(2)

      expect(remove).toHaveBeenCalledWith(2)
      expect(state.status).toBe("success")
    })

    it("returns a failure when the data source throws", async () => {
      const cause = new Error("db down")

      expect(
        await buildRepository({
          delete: throwing(cause),
        }).delete(2),
      ).toEqual({ status: "failure", error: cause })
    })
  })
})
