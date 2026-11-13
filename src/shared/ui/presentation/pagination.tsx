import Link from "next/link"

type PaginationProps = {
  readonly page: number
  readonly pageCount: number
  readonly basePath: string
  /** The other query parameters to keep on every link (search, sort, filters). */
  readonly params?: Readonly<Record<string, string>>
}

const WINDOW = 2

function hrefFor(
  basePath: string,
  params: Readonly<Record<string, string>>,
  page: number,
): string {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== "",
    ),
  )
  if (page > 1) query.set("page", String(page))
  const text = query.toString()
  return text ? `${basePath}?${text}` : basePath
}

/** The page numbers to show: the first, the last and a window around the current page. */
export function visiblePages(
  page: number,
  pageCount: number,
): readonly number[] {
  const wanted = new Set([1, pageCount])
  for (let p = page - WINDOW; p <= page + WINDOW; p++) {
    if (p >= 1 && p <= pageCount) wanted.add(p)
  }
  return [...wanted].sort((a, b) => a - b)
}

export function Pagination({
  page,
  pageCount,
  basePath,
  params = {},
}: PaginationProps) {
  if (pageCount <= 1) return null
  const pages = visiblePages(page, pageCount)
  return (
    <nav
      aria-label="Pagination"
      className="border-divider flex flex-wrap items-center justify-center gap-2 border-b px-4 py-6"
    >
      {page > 1 && (
        <Link
          href={hrefFor(basePath, params, page - 1)}
          rel="prev"
          className="btn btn-secondary"
        >
          ← Previous
        </Link>
      )}
      {pages.map((number, index) => (
        <span
          key={number}
          className="flex items-center gap-2"
        >
          {index > 0 && number - pages[index - 1] > 1 && (
            <span aria-hidden>…</span>
          )}
          <Link
            href={hrefFor(basePath, params, number)}
            aria-current={
              number === page ? "page" : undefined
            }
            className={`btn ${number === page ? "btn-primary" : "btn-secondary"}`}
          >
            {number}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link
          href={hrefFor(basePath, params, page + 1)}
          rel="next"
          className="btn btn-secondary"
        >
          Next →
        </Link>
      )}
    </nav>
  )
}
