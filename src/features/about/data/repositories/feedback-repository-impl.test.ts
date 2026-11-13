import { describe, expect, it, vi } from "vitest"

import type { FeedbackDataSource } from "../data-sources/feedback-data-source"
import { FeedbackRecordModel } from "../models/feedback-record-model"
import { FeedbackRepositoryImpl } from "./feedback-repository-impl"

function build(
  dataSource: Partial<
    Record<
      keyof FeedbackDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new FeedbackRepositoryImpl(
    dataSource as unknown as FeedbackDataSource,
  )
}

const throwing = (cause: Error) =>
  vi.fn(async () => {
    throw cause
  })
const cause = new Error("db down")
const failure = { status: "failure", error: cause }

describe("FeedbackRepositoryImpl", () => {
  it("submits the draft", async () => {
    const insert = vi.fn(async () => undefined)
    const draft = {
      email: "a@b.example",
      description: "Hi",
    }

    const state = await build({ insert }).submit(draft)

    expect(insert).toHaveBeenCalledWith(draft)
    expect(state.status).toBe("success")
  })

  it("returns a failure when the insert throws", async () => {
    expect(
      await build({ insert: throwing(cause) }).submit({
        email: "a@b.example",
        description: "Hi",
      }),
    ).toEqual(failure)
  })

  it("lists plain entities", async () => {
    const raw = {
      id: 1,
      email: "a@b.example",
      description: "Hi",
      isRead: true,
      createdAt: new Date(0),
    }
    const state = await build({
      fetchAll: vi.fn(async () => [
        FeedbackRecordModel.fromRawData(raw),
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

  it("returns a failure when listing throws", async () => {
    expect(
      await build({ fetchAll: throwing(cause) }).listAll(),
    ).toEqual(failure)
  })

  it("sets the read flag", async () => {
    const setRead = vi.fn(async () => undefined)

    const state = await build({ setRead }).setRead(3, true)

    expect(setRead).toHaveBeenCalledWith(3, true)
    expect(state.status).toBe("success")
  })

  it("returns a failure when setRead throws", async () => {
    expect(
      await build({ setRead: throwing(cause) }).setRead(
        3,
        true,
      ),
    ).toEqual(failure)
  })

  it("deletes by id", async () => {
    const remove = vi.fn(async () => undefined)

    const state = await build({ delete: remove }).delete(3)

    expect(remove).toHaveBeenCalledWith(3)
    expect(state.status).toBe("success")
  })

  it("returns a failure when delete throws", async () => {
    expect(
      await build({ delete: throwing(cause) }).delete(3),
    ).toEqual(failure)
  })
})
