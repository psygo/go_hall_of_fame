/** One page of a longer list, with what a pager needs to draw itself. */
export type Page<T> = {
  readonly items: readonly T[]
  /** The page shown, 1-based, clamped into the range that exists. */
  readonly page: number
  readonly pageCount: number
  readonly total: number
}

export function paginate<T>(
  items: readonly T[],
  requestedPage: number,
  pageSize: number,
): Page<T> {
  const pageCount = Math.max(
    1,
    Math.ceil(items.length / pageSize),
  )
  const page = Math.min(
    Math.max(1, requestedPage),
    pageCount,
  )
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageCount,
    total: items.length,
  }
}

/** Rows per page in the admin lists. */
export const ADMIN_PAGE_SIZE = 15

export type SortDirection = "asc" | "desc"

/** A chunk of a list read from a cursor, for infinite scrolling. */
export type Slice<T> = {
  readonly items: readonly T[]
  readonly total: number
  /** Where the next chunk starts, or null when everything has been read. */
  readonly nextOffset: number | null
}

export function sliceFrom<T>(
  items: readonly T[],
  offset: number,
  size: number,
): Slice<T> {
  const start = Math.max(0, offset)
  const end = start + size
  return {
    items: items.slice(start, end),
    total: items.length,
    nextOffset: end < items.length ? end : null,
  }
}

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

/**
 * True when every word of the query appears in at least one of the fields, ignoring case and
 * accents. An empty query matches everything.
 */
export function matchesQuery(
  fields: readonly string[],
  query: string,
): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = fold(fields.join(" "))
  return words.every((word) => haystack.includes(word))
}

export type QueryParam =
  string | readonly string[] | undefined

/** The first value of a query parameter that may repeat. */
export function readParam(value: QueryParam): string {
  return typeof value === "string"
    ? value
    : (value?.[0] ?? "")
}

/** A positive whole page number, 1 when the parameter is missing or invalid. */
export function readPageParam(value: QueryParam): number {
  const text = readParam(value)
  return /^\d{1,6}$/.test(text)
    ? Math.max(1, Number(text))
    : 1
}

export function readChoice<T extends string>(
  value: QueryParam,
  allowed: readonly T[],
  fallback: T,
): T {
  const text = readParam(value)
  return (
    allowed.find((option) => option === text) ?? fallback
  )
}

/** A search text, trimmed and capped so a pasted wall of text cannot reach the filters. */
export function readSearchParam(value: QueryParam): string {
  return readParam(value).trim().slice(0, 80)
}
