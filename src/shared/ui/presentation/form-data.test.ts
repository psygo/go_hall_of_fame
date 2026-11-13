import { describe, expect, it } from "vitest"

import {
  readFormFlag,
  readFormText,
  readFormTexts,
} from "./form-data"

describe("readFormText", () => {
  it("returns the string value", () => {
    const formData = new FormData()
    formData.set("name", "Shusaku")

    expect(readFormText(formData, "name")).toBe("Shusaku")
  })

  it("returns an empty string for a missing key", () => {
    expect(readFormText(new FormData(), "name")).toBe("")
  })

  it("returns an empty string for a file", () => {
    const formData = new FormData()
    formData.set("name", new File(["x"], "x.txt"))

    expect(readFormText(formData, "name")).toBe("")
  })

  it("does not trim", () => {
    const formData = new FormData()
    formData.set("name", "  a  ")

    expect(readFormText(formData, "name")).toBe("  a  ")
  })

  it("returns the first of several values", () => {
    const formData = new FormData()
    formData.append("name", "first")
    formData.append("name", "second")

    expect(readFormText(formData, "name")).toBe("first")
  })
})

describe("readFormFlag", () => {
  it("is true when the key is present, whatever its value", () => {
    const formData = new FormData()
    formData.set("featured", "on")
    formData.set("empty", "")

    expect(readFormFlag(formData, "featured")).toBe(true)
    expect(readFormFlag(formData, "empty")).toBe(true)
  })

  it("is false when the key is absent", () => {
    expect(readFormFlag(new FormData(), "featured")).toBe(
      false,
    )
  })
})

describe("readFormTexts", () => {
  it("returns every string value in order", () => {
    const formData = new FormData()
    formData.append("slugs", "a")
    formData.append("slugs", "b")

    expect(readFormTexts(formData, "slugs")).toEqual([
      "a",
      "b",
    ])
  })

  it("returns an empty list for a missing key", () => {
    expect(readFormTexts(new FormData(), "slugs")).toEqual(
      [],
    )
  })

  it("drops files", () => {
    const formData = new FormData()
    formData.append("slugs", "a")
    formData.append("slugs", new File(["x"], "x.txt"))

    expect(readFormTexts(formData, "slugs")).toEqual(["a"])
  })
})
