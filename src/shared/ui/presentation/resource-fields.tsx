"use client"

import { useState } from "react"

import {
  RESOURCE_LIMITS,
  type ResourceRow,
} from "@/core/resources"

type ResourceFieldsProps = {
  readonly initial: readonly ResourceRow[]
  readonly error?: string
}

type KeyedRow = ResourceRow & { readonly key: number }

/** The editor for a list of links with optional descriptions. Posts `resourceTitle`, `resourceUrl` and `resourceDescription`. */
export function ResourceFields({
  initial,
  error,
}: ResourceFieldsProps) {
  const [rows, setRows] = useState<readonly KeyedRow[]>(
    () => initial.map((row, key) => ({ ...row, key })),
  )
  const [nextKey, setNextKey] = useState(initial.length)

  function addRow() {
    setRows([
      ...rows,
      { title: "", url: "", description: "", key: nextKey },
    ])
    setNextKey(nextKey + 1)
  }

  function changeRow(
    key: number,
    change: Partial<ResourceRow>,
  ) {
    setRows(
      rows.map((row) =>
        row.key === key ? { ...row, ...change } : row,
      ),
    )
  }

  function removeRow(key: number) {
    setRows(rows.filter((row) => row.key !== key))
  }

  return (
    <fieldset className="field m-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-xs opacity-70">
        Resources
      </legend>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {rows.map((row) => (
          <li
            key={row.key}
            className="border-divider grid gap-2 border p-3 min-[720px]:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <input
              name="resourceTitle"
              type="text"
              aria-label="Name"
              placeholder="Name"
              value={row.title}
              onChange={(event) =>
                changeRow(row.key, {
                  title: event.target.value,
                })
              }
              maxLength={RESOURCE_LIMITS.title}
              className="input"
            />
            <input
              name="resourceUrl"
              type="text"
              aria-label="Link"
              placeholder="https://…"
              value={row.url}
              onChange={(event) =>
                changeRow(row.key, {
                  url: event.target.value,
                })
              }
              maxLength={RESOURCE_LIMITS.url}
              className="input"
            />
            <input
              name="resourceDescription"
              type="text"
              aria-label="Description (optional)"
              placeholder="Description (optional)"
              value={row.description}
              onChange={(event) =>
                changeRow(row.key, {
                  description: event.target.value,
                })
              }
              maxLength={RESOURCE_LIMITS.description}
              className="input"
            />
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="btn btn-secondary"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <button
          type="button"
          onClick={addRow}
          className="btn btn-secondary"
          disabled={rows.length >= RESOURCE_LIMITS.maxCount}
        >
          Add a resource
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="text-accent-700 mt-1 text-xs font-bold"
        >
          {error}
        </div>
      )}
    </fieldset>
  )
}
