"use client"

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useRef, useTransition } from "react"

type Option = {
  readonly value: string
  readonly label: string
}

type ListControlsProps = {
  /** When set, a search box that filters as you type. */
  readonly search?: {
    readonly placeholder: string
    readonly value: string
  }
  readonly sort: {
    readonly value: string
    readonly options: readonly Option[]
  }
  /** Extra filters, each a select that sets one query parameter. */
  readonly filters?: readonly {
    readonly name: string
    readonly label: string
    readonly value: string
    readonly options: readonly Option[]
  }[]
}

const SEARCH_DELAY_MS = 250

/**
 * Search, filter and sort controls for a list page. They write `q`, `sort` and the filter names
 * into the URL (so a result is a link, and the server does the filtering) and drop `page`.
 */
export function ListControls({
  search,
  sort,
  filters = [],
}: ListControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  function update(name: string, value: string) {
    const next = new URLSearchParams(current.toString())
    if (value === "") next.delete(name)
    else next.set(name, value)
    next.delete("page")
    const query = next.toString()
    startTransition(() => {
      router.replace(
        query ? `${pathname}?${query}` : pathname,
        {
          scroll: false,
        },
      )
    })
  }

  function onSearch(value: string) {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = setTimeout(
      () => update("q", value.trim()),
      SEARCH_DELAY_MS,
    )
  }

  return (
    <div
      role="search"
      aria-busy={isPending}
      className="mt-7 flex flex-wrap items-end gap-4"
    >
      {search && (
        <div className="field m-0 min-w-[220px] flex-1">
          <label htmlFor="list-search">Search</label>
          <input
            id="list-search"
            type="search"
            className="input"
            placeholder={search.placeholder}
            defaultValue={search.value}
            maxLength={80}
            autoComplete="off"
            onChange={(event) =>
              onSearch(event.target.value)
            }
          />
        </div>
      )}
      {filters.map((filter) => (
        <div
          key={filter.name}
          className="field m-0 max-w-full min-w-0"
        >
          <label htmlFor={`list-${filter.name}`}>
            {filter.label}
          </label>
          <select
            id={`list-${filter.name}`}
            className="input"
            value={filter.value}
            onChange={(event) =>
              update(filter.name, event.target.value)
            }
          >
            {filter.options.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="field m-0 max-w-full min-w-0">
        <label htmlFor="list-sort">Sort by</label>
        <select
          id="list-sort"
          className="input"
          value={sort.value}
          onChange={(event) =>
            update("sort", event.target.value)
          }
        >
          {sort.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
