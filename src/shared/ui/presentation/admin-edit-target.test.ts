import { describe, expect, it } from "vitest"

import { adminEditTargetFor } from "./admin-edit-target"

describe("adminEditTargetFor", () => {
  it.each([
    ["/", "/admin/pages", "Edit page"],
    ["/players", "/admin/players", "Edit players"],
    ["/games", "/admin/games", "Edit games"],
    ["/timeline", "/admin/timeline", "Edit timeline"],
    ["/resources", "/admin/resources", "Edit resources"],
    ["/induction", "/admin/criteria", "Edit criteria"],
    [
      "/contributors",
      "/admin/contributors",
      "Edit contributors",
    ],
  ])("sends %s to %s", (path, href, label) => {
    expect(adminEditTargetFor(path)).toEqual({
      href,
      label,
    })
  })

  it.each([
    [
      "/players/shusaku",
      "/admin/players/shusaku",
      "Edit player",
    ],
    [
      "/games/ear-reddening",
      "/admin/games/ear-reddening",
      "Edit game",
    ],
    [
      "/contributors/demis-hassabis",
      "/admin/contributors/demis-hassabis",
      "Edit contributor",
    ],
  ])(
    "sends the detail page %s to %s",
    (path, href, label) => {
      expect(adminEditTargetFor(path)).toEqual({
        href,
        label,
      })
    },
  )

  it.each([
    ["/players/", "/admin/players"],
    ["/games/", "/admin/games"],
    ["/timeline/", "/admin/timeline"],
    ["/resources/", "/admin/resources"],
    ["/induction/", "/admin/criteria"],
    ["/players/shusaku/", "/admin/players/shusaku"],
    ["/contributors/", "/admin/contributors"],
    ["/contributors/a/", "/admin/contributors/a"],
  ])("ignores a trailing slash: %s", (path, href) => {
    expect(adminEditTargetFor(path)?.href).toBe(href)
  })

  it.each([
    "/admin",
    "/admin/",
    "/admin/players",
    "/admin/players/shusaku",
    "/admin/sign-in",
    "/unknown",
    "/players/shusaku/extra",
    "/games/a/b",
    "/contributors/a/b",
    "/timeline/1",
    "/induction/x",
    "",
    "/Players",
  ])("returns null for %j", (path) => {
    expect(adminEditTargetFor(path)).toBeNull()
  })
})
