import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import {
  extractSpecifiers,
  findViolation,
  locate,
  resolveTarget,
} from "./architecture-rules"

const ROOT = join(__dirname, "..", "..")

function listSourceFiles(): string[] {
  return readdirSync(join(ROOT, "src"), { recursive: true })
    .map((entry) => entry.toString().split("\\").join("/"))
    .filter((entry) => /\.(ts|tsx)$/.test(entry))
    .map((entry) => `src/${entry}`)
}

const read = (file: string) =>
  readFileSync(join(ROOT, file), "utf8")
const productionFiles = () =>
  listSourceFiles().filter(
    (file) => !/\.test\.tsx?$/.test(file),
  )

/** Safe for the browser: a "use server" module (the bundler makes endpoint references) or a plain module with no server imports. */
function isBrowserSafeStateModule(path: string): boolean {
  const source = read(`${path}.ts`)
  if (/^\s*["']use server["']/.test(source)) return true
  return !extractSpecifiers(source).some(
    (specifier) =>
      specifier === "server-only" ||
      specifier.startsWith("next/") ||
      specifier.startsWith("@/config/"),
  )
}

describe("import rules across the whole tree", () => {
  it("scans a realistic number of files (so the scan cannot pass vacuously)", () => {
    expect(productionFiles().length).toBeGreaterThan(60)
  })

  it("has no import that breaks a rule of docs/ARCHITECTURE_VIOLATIONS.md", () => {
    const violations = productionFiles().flatMap((file) =>
      extractSpecifiers(read(file)).flatMap((specifier) => {
        const rule = findViolation(file, specifier)
        return rule === null
          ? []
          : [`${file} imports "${specifier}": ${rule}`]
      }),
    )
    expect(violations).toEqual([])
  })

  it("keeps test files out of src/app", () => {
    const testsInApp = listSourceFiles().filter(
      (file) =>
        file.startsWith("src/app/") &&
        /\.test\./.test(file),
    )
    expect(testsInApp).toEqual([])
  })
})

describe("structure rules", () => {
  it("gives every page except the home page its own metadata", () => {
    const pages = productionFiles().filter(
      (file) =>
        file.startsWith("src/app/") &&
        file.endsWith("/page.tsx") &&
        file !== "src/app/page.tsx",
    )
    const missing = pages.filter(
      (file) =>
        !/\b(generateMetadata|metadata)\b/.test(read(file)),
    )
    expect(pages.length).toBeGreaterThan(0)
    expect(missing).toEqual([])
  })

  it("marks the composition root as server-only", () => {
    const rootFiles = productionFiles().filter(
      (file) =>
        file === "src/config/di.ts" ||
        file.startsWith("src/config/wiring/"),
    )
    const missing = rootFiles.filter(
      (file) =>
        !extractSpecifiers(read(file)).includes(
          "server-only",
        ),
    )
    expect(rootFiles.length).toBeGreaterThan(0)
    expect(missing).toEqual([])
  })

  it("gives every data model fromRawData and toEntity (1.3.2, 1.3.3)", () => {
    const models = productionFiles().filter((file) =>
      /\/data\/models\/[^/]+\.ts$/.test(file),
    )
    const incomplete = models.filter((file) => {
      const source = read(file)
      return (
        !/static (override )?fromRawData\(/.test(source) ||
        !/toEntity\(/.test(source)
      )
    })
    expect(models.length).toBeGreaterThan(0)
    expect(incomplete).toEqual([])
  })

  it("keeps value imports from presentation/state out of client components (5.3)", () => {
    const clients = productionFiles().filter((file) =>
      /^\s*["']use client["']/.test(read(file)),
    )
    const valueImport =
      /import\s+(?!type\b)[^'"]*?from\s+["']([^"']+)["']/g
    const offenders = clients.flatMap((file) =>
      [...read(file).matchAll(valueImport)]
        .map((match) => match[1])
        .filter((specifier) => {
          const target = resolveTarget(file, specifier)
          return (
            target.kind === "internal" &&
            target.path.includes("/presentation/state/") &&
            !isBrowserSafeStateModule(target.path)
          )
        })
        .map(
          (specifier) => `${file} imports "${specifier}"`,
        ),
    )
    expect(clients.length).toBeGreaterThan(0)
    expect(offenders).toEqual([])
  })

  it("names every repository implementation {Interface}Impl (1.4.1)", () => {
    const impls = productionFiles().filter((file) =>
      /\/data\/repositories\/[^/]+\.ts$/.test(file),
    )
    const misnamed = impls.filter((file) => {
      const source = read(file)
      const match = /class (\w+)Impl implements (\w+)/.exec(
        source,
      )
      return match === null || match[1] !== match[2]
    })
    expect(impls.length).toBeGreaterThan(0)
    expect(misnamed).toEqual([])
  })
})

describe("findViolation", () => {
  const players = "src/features/players"
  const games = "src/features/games"

  it.each([
    [
      `${players}/domain/entities/player.ts`,
      "react",
      "2.1.1",
    ],
    [
      `${players}/domain/entities/player.ts`,
      "../../data/models/player-model",
      "2.1.1",
    ],
    [
      `${players}/domain/entities/player.ts`,
      `@/features/games/domain/entities/game`,
      "4.1",
    ],
    [
      `${players}/data/models/player-model.ts`,
      "../../presentation/state/players-loaders",
      "1.1.1",
    ],
    [
      `${players}/data/repositories/players-repository-impl.ts`,
      "../../domain/use-cases/list-players",
      "1.1.2",
    ],
    [
      `${players}/data/models/player-model.ts`,
      "drizzle-orm",
      "1.2.4",
    ],
    [
      `${players}/data/models/player-model.ts`,
      "next/navigation",
      "1.1",
    ],
    [
      `${players}/data/data-sources/players-data-source.ts`,
      "react",
      "1.1",
    ],
    [
      `${players}/data/models/player-model.ts`,
      "../data-sources/players-data-source",
      "1.4.4",
    ],
    [
      `${players}/presentation/screens/players-screen.tsx`,
      "../../data/models/player-model",
      "3.1.1",
    ],
    [
      `${players}/presentation/screens/players-screen.tsx`,
      "../../domain/use-cases/list-players",
      "3.2.2",
    ],
    [
      `${players}/presentation/components/card.tsx`,
      "@/config/di",
      "3.4",
    ],
    [
      `${players}/presentation/screens/players-screen.tsx`,
      "@/config/wiring/players",
      "4.3",
    ],
    [
      `${players}/presentation/screens/players-screen.tsx`,
      "@/config/architecture-rules",
      "4.2",
    ],
    ["src/config/wiring/players.ts", "@/config/di", "4.3"],
    [
      "src/app/page.tsx",
      "@/features/home/domain/entities/home-summary",
      "3.3.3",
    ],
    ["src/app/page.tsx", "@/config/di", "3.3.3"],
    ["src/app/page.tsx", "drizzle-orm", "3.3.3"],
    [
      "src/core/data-state.ts",
      "@/features/players/domain/entities/player",
      "core",
    ],
    [
      "src/shared/ui/presentation/portrait.tsx",
      `@/features/players/domain/entities/player`,
      "4.1",
    ],
    [
      `${games}/data/data-sources/games-data-source.ts`,
      "lodash",
      "1.2.4",
    ],
  ])(
    "rejects %s importing %s (%s)",
    (file, specifier, rule) => {
      expect(findViolation(file, specifier)).toContain(rule)
    },
  )

  it.each([
    [
      `${players}/domain/use-cases/list-players.ts`,
      "@/core/use-case",
    ],
    [
      `${players}/domain/use-cases/list-players.ts`,
      "../entities/player",
    ],
    [
      `${players}/data/data-sources/players-data-source.ts`,
      "drizzle-orm",
    ],
    [
      `${players}/data/data-sources/players-data-source.ts`,
      "@/shared/database/data/schema",
    ],
    [
      `${players}/data/repositories/players-repository-impl.ts`,
      "../data-sources/players-data-source",
    ],
    [
      `${players}/data/repositories/players-repository-impl.ts`,
      "../../domain/repositories/players-repository",
    ],
    [
      `${players}/presentation/screens/players-screen.tsx`,
      "@/config/di",
    ],
    [
      `${players}/presentation/state/players-loaders.ts`,
      "next/navigation",
    ],
    [
      `${players}/presentation/screens/players-screen.tsx`,
      "@/shared/ui/presentation/page-header",
    ],
    [
      "src/config/wiring/players.ts",
      "@/features/players/domain/use-cases/list-players",
    ],
    ["src/config/wiring/players.ts", "./infrastructure"],
    ["src/config/di.ts", "./wiring/players"],
    [
      "src/app/players/page.tsx",
      "@/features/players/presentation/screens/players-screen",
    ],
    ["src/app/layout.tsx", "@/styles/globals.css"],
  ])("accepts %s importing %s", (file, specifier) => {
    expect(findViolation(file, specifier)).toBeNull()
  })
})

describe("locate and resolveTarget", () => {
  it("places files in their layer and folder", () => {
    expect(
      locate(
        "src/features/players/data/models/player-model.ts",
      ),
    ).toEqual({
      kind: "module",
      scope: "features",
      name: "players",
      layer: "data",
      folder: "models",
    })
    expect(
      locate("src/shared/database/data/schema.ts"),
    ).toMatchObject({ layer: "data", folder: "" })
    expect(locate("src/config/wiring/home.ts")).toEqual({
      kind: "wiring",
    })
  })

  it("resolves aliases, relative paths and packages", () => {
    const file =
      "src/features/players/data/models/player-model.ts"
    expect(resolveTarget(file, "@/core/raw-data")).toEqual({
      kind: "internal",
      path: "src/core/raw-data",
    })
    expect(
      resolveTarget(file, "../../domain/entities/player"),
    ).toEqual({
      kind: "internal",
      path: "src/features/players/domain/entities/player",
    })
    expect(
      resolveTarget(file, "drizzle-orm/pg-core"),
    ).toEqual({ kind: "package", name: "drizzle-orm" })
    expect(resolveTarget(file, "@scope/pkg/deep")).toEqual({
      kind: "package",
      name: "@scope/pkg",
    })
  })
})

describe("extractSpecifiers", () => {
  it("finds static, type, re-export, side-effect, multi-line and dynamic imports", () => {
    const source = `
      import a from "one"
      import type { B } from "two"
      import {
        c,
        d,
      } from "three"
      import "four"
      export { e } from "five"
      const lazy = () => import("six")
      export const notAnImport = "seven"
    `
    expect(extractSpecifiers(source)).toEqual([
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
    ])
  })
})
