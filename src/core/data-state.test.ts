import { describe, expect, it } from "vitest"

import {
  captureDataState,
  fail,
  succeed,
  unwrapDataState,
} from "./data-state"

describe("succeed", () => {
  it("wraps data in a success state", () => {
    expect(succeed(5)).toEqual({
      status: "success",
      data: 5,
    })
  })
})

describe("fail", () => {
  it("keeps an Error cause as it is", () => {
    const cause = new Error("boom")

    const state = fail(cause)

    expect(state.status).toBe("failure")
    expect(state.error).toBe(cause)
  })

  it("wraps a string cause in an Error with that message", () => {
    const state = fail("went wrong")

    expect(state.error).toBeInstanceOf(Error)
    expect(state.error.message).toBe("went wrong")
  })

  it("stringifies other non-Error causes", () => {
    expect(fail(42).error.message).toBe("42")
    expect(fail(null).error.message).toBe("null")
  })
})

describe("captureDataState", () => {
  it("returns a success with the resolved value", async () => {
    const state = await captureDataState(async () => "ok")

    expect(state).toEqual({ status: "success", data: "ok" })
  })

  it("returns a failure with the rejected Error", async () => {
    const cause = new Error("rejected")

    const state = await captureDataState(async () => {
      throw cause
    })

    expect(state).toEqual({
      status: "failure",
      error: cause,
    })
  })

  it("returns a failure when the rejection is not an Error", async () => {
    const state = await captureDataState(() =>
      Promise.reject("plain"),
    )

    expect(state.status).toBe("failure")
    if (state.status === "failure") {
      expect(state.error.message).toBe("plain")
    }
  })
})

describe("unwrapDataState", () => {
  it("returns the data of a success", () => {
    expect(unwrapDataState(succeed("value"))).toBe("value")
  })

  it("throws the original error of a failure", () => {
    const cause = new Error("original")

    expect(() => unwrapDataState(fail(cause))).toThrow(
      cause,
    )
    try {
      unwrapDataState(fail(cause))
    } catch (thrown) {
      expect(thrown).toBe(cause)
    }
  })
})
