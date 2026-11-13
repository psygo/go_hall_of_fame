import { describe, expect, it } from "vitest"

import { pageMetadata } from "./site-metadata"

describe("pageMetadata", () => {
  it("repeats the title and description for link previews", () => {
    expect(
      pageMetadata({
        title: "Players",
        description: "Names",
      }),
    ).toEqual({
      title: "Players",
      description: "Names",
      openGraph: { title: "Players", description: "Names" },
      twitter: { title: "Players", description: "Names" },
    })
  })
})
