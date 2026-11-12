import { posix } from "node:path"

/**
 * The import rules of docs/APP_ARCHITECTURE.md and docs/ARCHITECTURE_VIOLATIONS.md,
 * as a pure function: given a file and one of its import specifiers, name the rule it breaks (or null).
 * Checked against the real tree by architecture.test.ts.
 */

type Layer = "data" | "domain" | "presentation"

type Location =
  | { readonly kind: "core" }
  | {
      readonly kind: "module"
      readonly scope: "features" | "shared"
      readonly name: string
      readonly layer: Layer
      /** The folder under the layer, e.g. "data-sources" or "use-cases". */
      readonly folder: string
    }
  | { readonly kind: "wiring" }
  | { readonly kind: "di" }
  | { readonly kind: "app" }
  | { readonly kind: "other" }

type Target =
  | { readonly kind: "internal"; readonly path: string }
  | { readonly kind: "package"; readonly name: string }

const LAYERS: readonly Layer[] = [
  "data",
  "domain",
  "presentation",
]

function asLayer(value: string | undefined): Layer | null {
  return LAYERS.find((layer) => layer === value) ?? null
}
const NEXT_AND_REACT = /^(next|react|react-dom)(\/|$)/
const DATA_PROVIDERS = new Set(["drizzle-orm", "pg"])

export function locate(file: string): Location {
  const parts = file.split("/")
  const [src, area, name, layer, folder = ""] = parts
  if (src !== "src") return { kind: "other" }
  if (area === "core") return { kind: "core" }
  if (area === "app") return { kind: "app" }
  if (file === "src/config/di.ts") return { kind: "di" }
  if (area === "config" && name === "wiring")
    return { kind: "wiring" }
  const moduleLayer = asLayer(layer)
  if (
    (area === "features" || area === "shared") &&
    moduleLayer !== null
  ) {
    return {
      kind: "module",
      scope: area,
      name,
      layer: moduleLayer,
      folder: folder.includes(".") ? "" : folder,
    }
  }
  return { kind: "other" }
}

export function resolveTarget(
  file: string,
  specifier: string,
): Target {
  if (specifier.startsWith("@/")) {
    return {
      kind: "internal",
      path: `src/${specifier.slice(2)}`,
    }
  }
  if (specifier.startsWith(".")) {
    const path = posix.normalize(
      posix.join(posix.dirname(file), specifier),
    )
    return { kind: "internal", path }
  }
  const [first, second] = specifier.split("/")
  const name = first.startsWith("@")
    ? `${first}/${second}`
    : first
  return { kind: "package", name }
}

type Check = (
  source: Location,
  file: string,
  target: Target,
) => string | null

const noCrossFeatureImports: Check = (
  source,
  _file,
  target,
) => {
  if (
    source.kind !== "module" ||
    target.kind !== "internal"
  )
    return null
  const to = locate(target.path)
  if (to.kind !== "module") return null
  const sameModule =
    to.scope === source.scope && to.name === source.name
  if (sameModule) return null
  if (
    source.scope === "features" &&
    to.scope === "features"
  ) {
    return "4.1 a feature never imports another feature"
  }
  if (
    source.scope === "shared" &&
    to.scope === "features"
  ) {
    return "4.1 shared never imports features"
  }
  return null
}

const domainIsPure: Check = (source, _file, target) => {
  if (source.kind !== "module" || source.layer !== "domain")
    return null
  if (target.kind === "package") {
    return "2.1.1 domain imports no package (plain TypeScript)"
  }
  const to = locate(target.path)
  if (to.kind === "core") return null
  const sameDomain =
    to.kind === "module" &&
    to.scope === source.scope &&
    to.name === source.name &&
    to.layer === "domain"
  return sameDomain
    ? null
    : "2.1.1 domain imports only its own domain and core"
}

const coreIsPure: Check = (source, _file, target) => {
  if (source.kind !== "core") return null
  if (target.kind === "package")
    return "core imports no package"
  return locate(target.path).kind === "core"
    ? null
    : "core imports only core"
}

const dataLayerImports: Check = (source, _file, target) => {
  if (source.kind !== "module" || source.layer !== "data")
    return null
  if (target.kind === "package")
    return dataPackageRule(source, target.name)
  const to = locate(target.path)
  if (to.kind === "core") return null
  if (to.kind !== "module")
    return "1.1 data imports only domain, core and shared data"
  if (to.layer === "presentation")
    return "1.1.1 data never imports presentation"
  if (to.layer === "domain" && to.folder === "use-cases") {
    return "1.1.2 data does not import use cases"
  }
  return dataSourceOnlyRule(source, to)
}

function dataPackageRule(
  source: Extract<Location, { kind: "module" }>,
  name: string,
): string | null {
  if (NEXT_AND_REACT.test(name))
    return "1.1 data imports no React or Next"
  const mayUseProviders =
    source.folder === "data-sources" ||
    source.scope === "shared"
  if (!mayUseProviders) {
    return `1.2.4 provider "${name}" is imported only by data-sources`
  }
  return DATA_PROVIDERS.has(name)
    ? null
    : `1.2.4 "${name}" is not a known data provider`
}

function dataSourceOnlyRule(
  source: Extract<Location, { kind: "module" }>,
  to: Extract<Location, { kind: "module" }>,
): string | null {
  const importsDataSource =
    to.layer === "data" && to.folder === "data-sources"
  if (
    importsDataSource &&
    source.folder !== "repositories" &&
    source.folder !== "data-sources"
  ) {
    return "1.4.4 only repositories import data sources"
  }
  return null
}

const presentationLayerImports: Check = (
  source,
  _file,
  target,
) => {
  if (
    source.kind !== "module" ||
    source.layer !== "presentation"
  )
    return null
  if (target.kind === "package") return null
  const to = locate(target.path)
  if (target.path === "src/config/di")
    return diImportRule(source)
  if (target.path.startsWith("src/config/")) {
    return "4.2 presentation reaches config only through config/di"
  }
  if (to.kind !== "module") return null
  if (to.layer === "data")
    return "3.1.1 presentation never imports the data layer"
  if (to.layer === "domain" && to.folder === "use-cases") {
    return "3.2.2 presentation never constructs or imports use case classes"
  }
  return null
}

function diImportRule(
  source: Extract<Location, { kind: "module" }>,
): string | null {
  const allowed = ["screens", "state", "metadata"].includes(
    source.folder,
  )
  return allowed
    ? null
    : "3.4 components get data through props, not config/di"
}

const compositionRoot: Check = (source, _file, target) => {
  if (target.kind !== "internal") return null
  const toWiring = target.path.startsWith(
    "src/config/wiring/",
  )
  const isRoot =
    source.kind === "di" || source.kind === "wiring"
  if (toWiring && !isRoot)
    return "4.3 only the composition root imports wiring"
  if (
    source.kind === "wiring" &&
    target.path === "src/config/di"
  ) {
    return "4.3 wiring never imports config/di"
  }
  return null
}

const routesAreThin: Check = (source, _file, target) => {
  if (source.kind !== "app") return null
  if (target.kind === "package") {
    return NEXT_AND_REACT.test(target.name)
      ? null
      : `3.3.3 routes import only next and react, not "${target.name}"`
  }
  if (!target.path.startsWith("src/")) return null
  const isScreenOrMetadata =
    /^src\/features\/[^/]+\/presentation\/(screens|metadata)/.test(
      target.path,
    )
  const isSharedPresentation =
    /^src\/shared\/[^/]+\/presentation\//.test(target.path)
  const isStyle = target.path.startsWith("src/styles/")
  return isScreenOrMetadata ||
    isSharedPresentation ||
    isStyle
    ? null
    : "3.3.3 routes render a screen and nothing else"
}

const CHECKS: readonly Check[] = [
  noCrossFeatureImports,
  domainIsPure,
  coreIsPure,
  dataLayerImports,
  compositionRoot,
  presentationLayerImports,
  routesAreThin,
]

export function findViolation(
  file: string,
  specifier: string,
): string | null {
  const source = locate(file)
  const target = resolveTarget(file, specifier)
  for (const check of CHECKS) {
    const violation = check(source, file, target)
    if (violation !== null) return violation
  }
  return null
}

const IMPORT_PATTERN =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g

export function extractSpecifiers(
  source: string,
): string[] {
  return [...source.matchAll(IMPORT_PATTERN)].map(
    (match) => match[1] ?? match[2],
  )
}
