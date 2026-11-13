import { describe, expect, it } from "vitest"

import {
  readFormFlag,
  readFormText,
  readFormTexts,
  readResourceRows,
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

describe("readResourceRows", () => {
  it("pairs urls with descriptions by position", () => {
    const formData = new FormData()
    formData.append("resourceTitle", "A site")
    formData.append("resourceUrl", "https://a.example")
    formData.append("resourceDescription", "A")
    formData.append("resourceTitle", "B page")
    formData.append("resourceUrl", "/b")
    formData.append("resourceDescription", "B")

    expect(readResourceRows(formData)).toEqual([
      {
        title: "A site",
        url: "https://a.example",
        description: "A",
      },
      { title: "B page", url: "/b", description: "B" },
    ])
  })

  it("uses an empty description when one is missing", () => {
    const formData = new FormData()
    formData.append("resourceUrl", "/a")
    formData.append("resourceUrl", "/b")
    formData.append("resourceDescription", "A")

    expect(readResourceRows(formData)).toEqual([
      { title: "", url: "/a", description: "A" },
      { title: "", url: "/b", description: "" },
    ])
  })

  it("reads a title typed without a link as a row", () => {
    const formData = new FormData()
    formData.append("resourceTitle", "Only a name")

    expect(readResourceRows(formData)).toEqual([
      { title: "Only a name", url: "", description: "" },
    ])
  })

  it("returns no rows for a form without resources", () => {
    expect(readResourceRows(new FormData())).toEqual([])
  })

  it("keeps a description typed without a link as a row with an empty url", () => {
    const formData = new FormData()
    formData.append("resourceUrl", "/a")
    formData.append("resourceDescription", "A")
    formData.append("resourceDescription", "Orphan")

    expect(readResourceRows(formData)).toEqual([
      { title: "", url: "/a", description: "A" },
      { title: "", url: "", description: "Orphan" },
    ])
  })

  it("ignores file values", () => {
    const formData = new FormData()
    formData.append("resourceUrl", new File(["x"], "x.txt"))

    expect(readResourceRows(formData)).toEqual([])
  })
})
